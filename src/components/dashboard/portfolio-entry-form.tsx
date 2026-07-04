"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LinkIcon, Save } from "lucide-react";

type StudentOption = {
  id: string;
  family_id: string;
  full_name: string;
};

type AreaOption = {
  id: string;
  name: string;
};

type TopicOption = {
  id: string;
  area_id: string;
  name: string;
};

const evidenceKinds = [
  { value: "note", label: "Nota" },
  { value: "photo", label: "Foto" },
  { value: "video", label: "Video externo" },
  { value: "document", label: "Documento" },
  { value: "link", label: "Enlace" }
] as const;

export function PortfolioEntryForm({
  students,
  areas,
  topics,
  configured
}: {
  students: StudentOption[];
  areas: AreaOption[];
  topics: TopicOption[];
  configured: boolean;
}) {
  const router = useRouter();
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0]?.id || "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const filteredTopics = useMemo(
    () => topics.filter((topic) => !selectedAreaId || topic.area_id === selectedAreaId),
    [selectedAreaId, topics]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      studentId: String(formData.get("studentId") || ""),
      areaId: String(formData.get("areaId") || ""),
      topicId: String(formData.get("topicId") || ""),
      title: String(formData.get("title") || ""),
      summary: String(formData.get("summary") || ""),
      observation: String(formData.get("observation") || ""),
      activityDate: String(formData.get("activityDate") || ""),
      evidenceKind: String(formData.get("evidenceKind") || "note"),
      externalUrl: String(formData.get("externalUrl") || ""),
      externalProvider: String(formData.get("externalProvider") || ""),
      caption: String(formData.get("caption") || ""),
      privacyNotes: String(formData.get("privacyNotes") || "")
    };

    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/dashboard/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok && response.status !== 207) {
      setStatus("error");
      setMessage(result.message || "No pudimos guardar la evidencia.");
      return;
    }

    setStatus(response.status === 207 ? "error" : "success");
    setMessage(result.message || "Evidencia guardada.");
    form.reset();
    setSelectedAreaId(areas[0]?.id || "");
    router.refresh();
  }

  const disabled = !configured || students.length === 0 || status === "loading";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Nueva evidencia</h2>
          <p className="mt-1 text-sm text-ink/58">Registra notas, fotos o enlaces privados externos.</p>
        </div>
        <Camera className="h-6 w-6 text-coral" aria-hidden="true" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Alumno
          <select name="studentId" required disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Fecha
          <input
            name="activityDate"
            type="date"
            required
            defaultValue={today}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Área
          <select
            name="areaId"
            disabled={disabled}
            value={selectedAreaId}
            onChange={(event) => setSelectedAreaId(event.target.value)}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
          >
            <option value="">Sin área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Submateria
          <select name="topicId" disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            <option value="">Sin submateria</option>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Título
          <input
            name="title"
            required
            maxLength={160}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Observa el crecimiento de una semilla"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Tipo
          <select name="evidenceKind" disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            {evidenceKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Proveedor externo
          <select name="externalProvider" disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            <option value="">Sin proveedor</option>
            <option value="Google Drive">Google Drive</option>
            <option value="OneDrive">OneDrive</option>
            <option value="iCloud">iCloud</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Enlace privado externo
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/42" aria-hidden="true" />
            <input
              name="externalUrl"
              type="url"
              disabled={disabled}
              className="focus-ring w-full rounded-md border border-ink/12 bg-cloud py-3 pl-10 pr-3 font-normal"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Resumen
          <textarea
            name="summary"
            rows={3}
            maxLength={1200}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Qué hizo, qué observó y qué logró."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Observación del adulto
          <textarea
            name="observation"
            rows={3}
            maxLength={2400}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Señales de interés, autonomía, lenguaje o cuidado."
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Pie o nota del enlace
          <input
            name="caption"
            maxLength={320}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Video de 2 minutos en carpeta privada"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Privacidad
          <input
            name="privacyNotes"
            maxLength={500}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Compartido solo con correos autorizados"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Guardar evidencia"}
        <Save className="h-4 w-4" aria-hidden="true" />
      </button>

      {message ? (
        <p className={`mt-4 rounded-md px-3 py-2 text-sm ${status === "success" ? "bg-leaf/12 text-forest" : "bg-coral/12 text-coral"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
