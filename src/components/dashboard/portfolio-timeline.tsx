"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Archive, CalendarDays, ChevronDown, Download, ExternalLink, FileText, Pencil, Play, Search, X } from "lucide-react";

export type PortfolioItem = {
  id: string; student_id: string; student_name: string; area: string; area_id: string; topic: string; topic_id: string;
  title: string; summary: string; observation: string; activity_date: string; evidence_kind: "note" | "photo" | "video" | "document" | "link" | "mixed";
  external_provider: string; privacy_notes: string; media_count: number; author_name: string; can_edit: boolean; status: string;
};

type MediaItem = { id: string; kind: string; signedUrl: string; original_name: string | null; mime_type: string | null; caption: string | null; external_provider: string | null };
const labels = { note: "Nota", photo: "Foto", video: "Video", document: "Documento", link: "Enlace", mixed: "Multimedia" };

export function PortfolioTimeline({ entries, areas, topics, showArchive = false, createAction }: {
  entries: PortfolioItem[]; areas: Array<{ id: string; name: string }>; topics: Array<{ id: string; area_id: string; name: string }>; showArchive?: boolean; createAction?: React.ReactNode;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [student, setStudent] = useState("");
  const [kind, setKind] = useState("");
  const [visible, setVisible] = useState(6);
  const students = useMemo(() => Array.from(new Map(entries.map((entry) => [entry.student_id, entry.student_name])).entries()), [entries]);
  const filtered = useMemo(() => entries.filter((entry) => {
    const text = `${entry.title} ${entry.summary} ${entry.student_name} ${entry.area} ${entry.topic}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!student || entry.student_id === student) && (!kind || entry.evidence_kind === kind);
  }), [entries, kind, query, student]);

  return (
    <div>
      <div className={`grid gap-3 rounded-lg border border-ink/8 bg-white p-4 shadow-line ${createAction ? "md:grid-cols-[auto_1fr_180px_160px]" : "md:grid-cols-[1fr_180px_160px]"}`}>
        {createAction}
        <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-ink/42" /><span className="sr-only">Buscar</span><input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(6); }} className="input pl-10" placeholder="Buscar evidencia, alumno o área" /></label>
        <select value={student} onChange={(e) => { setStudent(e.target.value); setVisible(6); }} className="input" aria-label="Filtrar por alumno"><option value="">Todos los alumnos</option>{students.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
        <select value={kind} onChange={(e) => { setKind(e.target.value); setVisible(6); }} className="input" aria-label="Filtrar por tipo"><option value="">Todos los tipos</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {filtered.slice(0, visible).map((entry) => <EvidenceCard key={entry.id} entry={entry} areas={areas} topics={topics} onChanged={() => router.refresh()} archived={showArchive} />)}
        {!filtered.length ? <div className="rounded-lg border border-dashed border-ink/15 bg-white p-10 text-center text-ink/55 xl:col-span-2">No hay publicaciones que coincidan con los filtros.</div> : null}
      </div>
      {visible < filtered.length ? <button type="button" onClick={() => setVisible((value) => value + 6)} className="focus-ring mx-auto mt-5 flex items-center gap-2 rounded-md border border-ink/12 bg-white px-5 py-3 font-semibold text-forest"><ChevronDown className="h-4 w-4" />Mostrar más</button> : null}
    </div>
  );
}

function EvidenceCard({ entry, areas, topics, onChanged, archived }: { entry: PortfolioItem; areas: Array<{ id: string; name: string }>; topics: Array<{ id: string; area_id: string; name: string }>; onChanged: () => void; archived: boolean }) {
  const [editing, setEditing] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(!archived && Boolean(entry.media_count));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (archived || !entry.media_count) return;
    let active = true;
    void fetch(`/api/dashboard/portfolio/${entry.id}`)
      .then(async (response) => ({ response, result: await response.json().catch(() => ({})) }))
      .then(({ response, result }) => {
        if (!active) return;
        if (response.ok) setMedia(result.media || []); else setMessage(result.message || "No pudimos abrir los anexos.");
        setMediaLoading(false);
      });
    return () => { active = false; };
  }, [entry.id, entry.media_count, archived]);

  async function patch(payload: Record<string, unknown>) {
    setLoading(true); setMessage("");
    const response = await fetch(`/api/dashboard/portfolio/${entry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setMessage(result.message || "No pudimos guardar el cambio."); return false; }
    onChanged(); return true;
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const ok = await patch({ action: "update", title: data.get("title"), summary: data.get("summary"), observation: data.get("observation"), activityDate: data.get("activityDate"), areaId: data.get("areaId"), topicId: data.get("topicId") });
    if (ok) setEditing(false);
  }

  async function archiveEntry() {
    if (!window.confirm("Se retirarán definitivamente los archivos y la publicación quedará visible solo para administración. ¿Continuar?")) return;
    await patch({ action: "archive" });
  }

  return <article className={`rounded-lg border bg-white p-5 shadow-line ${archived ? "border-coral/20" : "border-ink/8"}`}>
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div><p className="text-xs font-bold uppercase text-teal">{entry.student_name} · {entry.area} · {entry.topic}</p><h3 className="mt-1 text-xl font-semibold">{entry.title}</h3><p className="mt-1 text-xs text-ink/48">Publicado por {entry.author_name}</p></div>
      <span className="inline-flex w-fit items-center gap-2 rounded-md bg-cloud px-3 py-2 text-sm font-semibold text-forest"><CalendarDays className="h-4 w-4" />{formatDate(entry.activity_date)}</span>
    </div>
    {!archived && entry.media_count ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{mediaLoading ? <div className="flex h-52 items-center justify-center rounded-lg bg-cloud text-sm text-ink/55">Preparando vista privada…</div> : media.map((item) => <MediaPreview key={item.id} item={item} canEdit={entry.can_edit} onRemove={async () => { if (window.confirm("El archivo se eliminará definitivamente. ¿Continuar?") && await patch({ action: "remove-media", mediaId: item.id })) setMedia((all) => all.filter((candidate) => candidate.id !== item.id)); }} />)}{!mediaLoading && !media.length ? <p className="rounded-lg bg-cloud p-4 text-sm text-ink/55">Los anexos ya no están disponibles.</p> : null}</div> : null}
    <p className="mt-4 leading-7 text-ink/65">{entry.summary || "Sin resumen."}</p>
    {entry.observation ? <p className="mt-3 rounded-md bg-cloud px-3 py-2 text-sm leading-6 text-ink/60">{entry.observation}</p> : null}
    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded bg-cloud px-2 py-1">{labels[entry.evidence_kind]}</span><span className="rounded bg-cloud px-2 py-1">{entry.media_count} anexos</span>{entry.external_provider ? <span className="rounded bg-cloud px-2 py-1">{entry.external_provider}</span> : null}{archived ? <span className="rounded bg-coral/10 px-2 py-1 text-coral">Archivada</span> : null}</div>
    {!archived && entry.can_edit ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold"><Pencil className="h-4 w-4" />Editar</button><button type="button" onClick={archiveEntry} className="focus-ring inline-flex items-center gap-2 rounded-md border border-coral/20 px-3 py-2 text-sm font-semibold text-coral"><Archive className="h-4 w-4" />Retirar</button></div> : null}
    {editing ? <form onSubmit={handleEdit} className="mt-5 grid gap-3 rounded-lg border border-teal/20 bg-cloud p-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-semibold md:col-span-2">Título<input name="title" defaultValue={entry.title} required className="input" /></label><label className="grid gap-1 text-sm font-semibold">Fecha<input name="activityDate" type="date" defaultValue={entry.activity_date} required className="input" /></label><label className="grid gap-1 text-sm font-semibold">Área<select name="areaId" defaultValue={entry.area_id} className="input"><option value="">Sin área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label className="grid gap-1 text-sm font-semibold">Submateria<select name="topicId" defaultValue={entry.topic_id} className="input"><option value="">Sin submateria</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label><label className="grid gap-1 text-sm font-semibold md:col-span-2">Resumen<textarea name="summary" defaultValue={entry.summary} className="input" rows={3} /></label><label className="grid gap-1 text-sm font-semibold md:col-span-2">Observación<textarea name="observation" defaultValue={entry.observation} className="input" rows={3} /></label><div className="flex gap-2 md:col-span-2"><button disabled={loading} className="rounded-md bg-forest px-4 py-2 font-semibold text-white">Guardar cambios</button><button type="button" onClick={() => setEditing(false)} className="rounded-md border border-ink/10 px-4 py-2 font-semibold">Cancelar</button></div></form> : null}
    {message ? <p className="mt-3 rounded bg-coral/10 px-3 py-2 text-sm text-coral">{message}</p> : null}
  </article>;
}

function MediaPreview({ item, canEdit, onRemove }: { item: MediaItem; canEdit: boolean; onRemove: () => void }) {
  const image = item.mime_type?.startsWith("image/");
  const pdf = item.mime_type === "application/pdf";
  const embedUrl = item.external_provider ? getEmbedUrl(item.signedUrl) : "";
  return <div className="overflow-hidden rounded-lg border border-ink/10 bg-cloud">{image && item.signedUrl ? <a href={item.signedUrl} target="_blank" rel="noreferrer"><Image unoptimized src={item.signedUrl} alt={item.caption || item.original_name || "Evidencia privada"} width={800} height={500} className="h-60 w-full object-cover transition hover:scale-[1.01]" /></a> : pdf && item.signedUrl ? <iframe src={`${item.signedUrl}#page=1&toolbar=0&navpanes=0`} title={item.original_name || "Vista previa PDF"} loading="lazy" className="h-60 w-full bg-white" /> : embedUrl ? <iframe src={embedUrl} title={`Vista previa de ${item.external_provider}`} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="h-60 w-full bg-ink" /> : item.signedUrl ? <a href={item.signedUrl} target="_blank" rel="noreferrer" className="flex h-52 flex-col items-center justify-center gap-3 bg-gradient-to-br from-teal/10 to-forest/10"><Play className="h-11 w-11 text-forest" /><span className="font-semibold text-forest">Abrir {item.external_provider || "evidencia"}</span></a> : <div className="flex h-40 items-center justify-center"><FileText className="h-10 w-10 text-teal" /></div>}<div className="flex items-center gap-2 p-3"><span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.original_name || item.caption || item.external_provider || "Enlace privado"}</span>{item.signedUrl ? <a href={item.signedUrl} target="_blank" rel="noreferrer" className="rounded p-1" aria-label="Abrir archivo">{item.external_provider ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}</a> : null}{canEdit ? <button type="button" onClick={onRemove} className="rounded p-1 text-coral" aria-label="Retirar archivo"><X className="h-4 w-4" /></button> : null}</div></div>;
}

function getEmbedUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) return `https://www.youtube-nocookie.com/embed/${url.searchParams.get("v") || url.pathname.split("/").pop()}`;
    if (host.endsWith("vimeo.com")) return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
    if (host.endsWith("loom.com")) return value.replace("/share/", "/embed/");
    if (host.endsWith("drive.google.com") && url.pathname.includes("/file/d/")) return value.replace(/\/view.*$/, "/preview");
  } catch {
    return "";
  }
  return "";
}

function formatDate(value: string) { return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
