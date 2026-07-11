"use client";

import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, LinkIcon, Save, ShieldCheck, UploadCloud, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  PORTFOLIO_ALLOWED_MIME_TYPES,
  PORTFOLIO_BUCKET,
  PORTFOLIO_CONSENT_NAME,
  PORTFOLIO_CONSENT_VERSION,
  PORTFOLIO_MAX_FILE_BYTES,
  PORTFOLIO_MAX_FILES,
  sanitizeStorageName
} from "@/lib/portfolio-policy";

type StudentOption = { id: string; family_id: string; full_name: string };
type AreaOption = { id: string; name: string };
type TopicOption = { id: string; area_id: string; name: string };

const evidenceKinds = [
  { value: "note", label: "Nota" }, { value: "photo", label: "Foto" },
  { value: "video", label: "Video externo" }, { value: "document", label: "Documento" },
  { value: "link", label: "Enlace" }
] as const;

export function PortfolioEntryForm({ students, areas, topics, configured, open, onClose }: {
  students: StudentOption[]; areas: AreaOption[]; topics: TopicOption[]; configured: boolean;
  open: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0]?.id || "");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [consentFamilyId, setConsentFamilyId] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const filteredTopics = useMemo(() => topics.filter((topic) => !selectedAreaId || topic.area_id === selectedAreaId), [selectedAreaId, topics]);
  const busy = status === "loading";

  useEffect(() => {
    if (!open) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (files.length || formRef.current?.matches(":valid")) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [files.length, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && requestClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!open) return null;

  function requestClose() {
    if (busy) return;
    if ((files.length || status === "error") && !window.confirm("Hay cambios sin terminar. ¿Cerrar la ventana?")) return;
    onClose();
  }

  function addFiles(incoming: File[]) {
    setMessage("");
    const invalid = incoming.find((file) => !PORTFOLIO_ALLOWED_MIME_TYPES.includes(file.type as typeof PORTFOLIO_ALLOWED_MIME_TYPES[number]) || file.size > PORTFOLIO_MAX_FILE_BYTES);
    if (invalid) {
      setStatus("error");
      setMessage(`“${invalid.name}” no es JPG, PNG, WebP o PDF válido de hasta 10 MB.`);
      return;
    }
    if (files.length + incoming.length > PORTFOLIO_MAX_FILES) {
      setStatus("error");
      setMessage(`Puedes adjuntar como máximo ${PORTFOLIO_MAX_FILES} archivos.`);
      return;
    }
    setFiles((current) => [...current, ...incoming]);
    setStatus("idle");
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  }

  async function acceptConsent() {
    if (!consentChecked) return;
    setStatus("loading");
    const response = await fetch("/api/privacy/consents", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyId: consentFamilyId, consentName: PORTFOLIO_CONSENT_NAME, consentVersion: PORTFOLIO_CONSENT_VERSION, accepted: true, notes: "" })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setStatus("error"); setMessage(result.message || "No pudimos registrar el consentimiento."); return;
    }
    setConsentFamilyId("");
    setStatus("idle");
    formRef.current?.requestSubmit();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      studentId: String(formData.get("studentId") || ""), areaId: String(formData.get("areaId") || ""),
      topicId: String(formData.get("topicId") || ""), title: String(formData.get("title") || ""),
      summary: String(formData.get("summary") || ""), observation: String(formData.get("observation") || ""),
      activityDate: String(formData.get("activityDate") || ""), evidenceKind: String(formData.get("evidenceKind") || "note"),
      externalUrl: String(formData.get("externalUrl") || ""), externalProvider: String(formData.get("externalProvider") || ""),
      caption: String(formData.get("caption") || ""), privacyNotes: String(formData.get("privacyNotes") || ""), fileCount: files.length
    };

    setStatus("loading"); setMessage(""); setProgress(2);
    const response = await fetch("/api/dashboard/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (response.status === 409 && result.code === "CONSENT_REQUIRED") {
      setConsentFamilyId(result.familyId); setStatus("idle"); setProgress(0); return;
    }
    if (!response.ok) {
      setStatus("error"); setMessage(result.message || "No pudimos crear la evidencia."); setProgress(0); return;
    }

    const uploaded: Array<{ storagePath: string; originalName: string; mimeType: typeof PORTFOLIO_ALLOWED_MIME_TYPES[number]; sizeBytes: number; displayOrder: number }> = [];
    if (files.length) {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) { setStatus("error"); setMessage("Supabase no está configurado."); return; }
      for (const [index, file] of files.entries()) {
        const path = `${result.familyId}/${result.id}/${crypto.randomUUID()}-${sanitizeStorageName(file.name)}`;
        const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          if (uploaded.length) await supabase.storage.from(PORTFOLIO_BUCKET).remove(uploaded.map((item) => item.storagePath));
          setStatus("error"); setMessage(`Falló la carga de “${file.name}”. Puedes intentarlo nuevamente.`); setProgress(0); return;
        }
        uploaded.push({ storagePath: path, originalName: file.name, mimeType: file.type as typeof PORTFOLIO_ALLOWED_MIME_TYPES[number], sizeBytes: file.size, displayOrder: index });
        setProgress(Math.round(((index + 1) / files.length) * 85));
      }
      const finalized = await fetch(`/api/dashboard/portfolio/${result.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "finalize", media: uploaded })
      });
      if (!finalized.ok) {
        const detail = await finalized.json().catch(() => ({}));
        setStatus("error"); setMessage(detail.message || "Los archivos subieron, pero falta finalizar la publicación."); return;
      }
    }

    setProgress(100); setStatus("success"); setMessage("Evidencia publicada de forma privada.");
    form.reset(); setFiles([]); setSelectedAreaId(areas[0]?.id || ""); router.refresh();
    window.setTimeout(() => onClose(), 900);
  }

  const disabled = !configured || students.length === 0 || busy;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:rounded-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/8 bg-white/95 px-5 py-4 backdrop-blur">
          <div><h2 id="evidence-title" className="text-xl font-semibold">Nueva evidencia</h2><p className="text-sm text-ink/58">Publicación privada para la familia autorizada.</p></div>
          <button type="button" onClick={requestClose} className="focus-ring rounded-md p-2 hover:bg-cloud" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>

        {consentFamilyId ? (
          <div className="p-6 sm:p-8">
            <ShieldCheck className="h-10 w-10 text-forest" />
            <h3 className="mt-4 text-2xl font-semibold">Consentimiento previo</h3>
            <p className="mt-3 max-w-2xl leading-7 text-ink/68">Antes de tu primera publicación para esta familia, debes aceptar el registro y consulta privada de evidencias educativas que puedan incluir imagen, voz o trabajos del menor. El acceso queda restringido a usuarios autorizados.</p>
            <label className="mt-6 flex items-start gap-3 rounded-lg border border-forest/20 bg-forest/5 p-4 text-sm leading-6"><input type="checkbox" checked={consentChecked} onChange={(event) => setConsentChecked(event.target.checked)} className="mt-1 h-4 w-4 accent-forest" /><span>Acepto el consentimiento versión {PORTFOLIO_CONSENT_VERSION} y confirmo que comprendo el tratamiento privado de las evidencias.</span></label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={!consentChecked || busy} onClick={acceptConsent} className="focus-ring rounded-md bg-forest px-5 py-3 font-semibold text-white disabled:opacity-50">Aceptar y continuar</button><button type="button" onClick={() => setConsentFamilyId("")} className="focus-ring rounded-md border border-ink/12 px-5 py-3 font-semibold">Volver al formulario</button></div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="p-5 sm:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Alumno"><select name="studentId" required disabled={disabled} className="input"><option value="">Selecciona un alumno</option>{students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></Field>
              <Field label="Fecha"><input name="activityDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} disabled={disabled} className="input" /></Field>
              <Field label="Área"><select name="areaId" value={selectedAreaId} onChange={(e) => setSelectedAreaId(e.target.value)} disabled={disabled} className="input"><option value="">Sin área</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
              <Field label="Submateria"><select name="topicId" disabled={disabled} className="input"><option value="">Sin submateria</option>{filteredTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
              <Field label="Título" wide><input name="title" required maxLength={160} disabled={disabled} className="input" placeholder="Observa el crecimiento de una semilla" /></Field>
              <Field label="Tipo"><select name="evidenceKind" disabled={disabled} className="input">{evidenceKinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</select></Field>
              <Field label="Proveedor externo"><select name="externalProvider" disabled={disabled} className="input"><option value="">Sin proveedor</option><option>Google Drive</option><option>OneDrive</option><option>iCloud</option><option>Otro</option></select></Field>
              <Field label="Enlace privado externo" wide><div className="relative"><LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-ink/42" /><input name="externalUrl" type="url" disabled={disabled} className="input pl-10" placeholder="https://drive.google.com/..." /></div></Field>
              <Field label="Resumen" wide><textarea name="summary" rows={3} maxLength={1200} disabled={disabled} className="input" placeholder="Qué hizo, qué observó y qué logró." /></Field>
              <Field label="Observación del adulto" wide><textarea name="observation" rows={3} maxLength={2400} disabled={disabled} className="input" /></Field>
              <Field label="Pie o nota"><input name="caption" maxLength={320} disabled={disabled} className="input" /></Field>
              <Field label="Privacidad"><input name="privacyNotes" maxLength={500} disabled={disabled} className="input" placeholder="Solo correos autorizados" /></Field>
            </div>

            <div className="mt-5" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <label className="focus-within:ring-2 focus-within:ring-teal flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-teal/30 bg-cloud px-5 py-8 text-center transition hover:border-teal">
                <UploadCloud className="h-9 w-9 text-teal" /><span className="mt-3 font-semibold">Arrastra fotos o PDF, o selecciónalos</span><span className="mt-1 text-sm text-ink/55">Hasta 10 archivos de 10 MB · JPG, PNG, WebP y PDF</span>
                <input type="file" multiple accept={PORTFOLIO_ALLOWED_MIME_TYPES.join(",")} className="sr-only" onChange={(event) => addFiles(Array.from(event.target.files || []))} disabled={disabled} />
              </label>
              {files.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-md border border-ink/8 px-3 py-2 text-sm"><FileText className="h-4 w-4 text-teal" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-xs text-ink/48">{(file.size / 1024 / 1024).toFixed(1)} MB</span><button type="button" onClick={() => setFiles((all) => all.filter((_, i) => i !== index))} aria-label={`Quitar ${file.name}`}><X className="h-4 w-4" /></button></div>)}</div> : null}
            </div>

            {busy ? <div className="mt-5"><div className="h-2 overflow-hidden rounded-full bg-cloud"><div className="h-full bg-teal transition-all" style={{ width: `${Math.max(progress, 8)}%` }} /></div><p className="mt-2 text-sm text-ink/58">{progress < 85 ? "Subiendo archivos privados…" : "Finalizando publicación…"}</p></div> : null}
            {message ? <p className={`mt-4 rounded-md px-3 py-2 text-sm ${status === "success" ? "bg-leaf/12 text-forest" : "bg-coral/12 text-coral"}`} role="status">{message}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={requestClose} disabled={busy} className="focus-ring rounded-md border border-ink/12 px-5 py-3 font-semibold">Cancelar</button><button type="submit" disabled={disabled} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-forest px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Publicando…" : "Publicar evidencia"}<Save className="h-4 w-4" /></button></div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`grid gap-2 text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}>{label}{children}</label>;
}
