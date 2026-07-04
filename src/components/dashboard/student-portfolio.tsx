"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Camera, FileText, Filter, ShieldCheck } from "lucide-react";
import type { DemoDashboardData } from "@/lib/demo-data";

type StudentPortfolioData = DemoDashboardData | {
  mode: "live";
  profileName: string;
  role: "admin" | "parent";
  families: DemoDashboardData["families"];
  students: DemoDashboardData["students"];
  areas: DemoDashboardData["areas"];
  topics: DemoDashboardData["topics"];
  guides: DemoDashboardData["guides"];
  entries: Array<{
    id: string;
    student_id: string;
    area: string;
    area_id: string;
    topic: string;
    topic_id: string;
    period: string;
    title: string;
    summary: string;
    observation: string;
    activity_date: string;
    evidence_kind: "note" | "photo" | "video" | "document" | "link";
    external_provider: string;
    privacy_notes: string;
    media_count: number;
    created_at: string;
  }>;
  resources: DemoDashboardData["resources"];
  consents: DemoDashboardData["consents"];
  invitations: DemoDashboardData["invitations"];
};

const evidenceLabels = {
  note: "Nota",
  photo: "Foto",
  video: "Video",
  document: "Documento",
  link: "Enlace"
};

export function StudentPortfolio({
  data,
  studentId,
  configured
}: {
  data: StudentPortfolioData;
  studentId: string;
  configured: boolean;
}) {
  const student = data.students.find((item) => item.id === studentId) || data.students[0];
  const studentEntries = data.entries.filter((entry) => !student || entry.student_id === student.id);
  const [areaFilter, setAreaFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");

  const availableAreas = useMemo(() => uniqueBy(studentEntries, "area_id", "area"), [studentEntries]);
  const availableTopics = useMemo(
    () => uniqueBy(studentEntries.filter((entry) => !areaFilter || entry.area_id === areaFilter), "topic_id", "topic"),
    [areaFilter, studentEntries]
  );
  const filteredEntries = useMemo(
    () =>
      studentEntries.filter((entry) => {
        const matchesArea = !areaFilter || entry.area_id === areaFilter;
        const matchesTopic = !topicFilter || entry.topic_id === topicFilter;
        const matchesKind = !kindFilter || entry.evidence_kind === kindFilter;
        return matchesArea && matchesTopic && matchesKind;
      }),
    [areaFilter, kindFilter, studentEntries, topicFilter]
  );

  return (
    <main className="min-h-screen bg-cloud px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al dashboard
        </Link>
        <header className="mt-6 rounded-md border border-ink/8 bg-white p-6 shadow-line">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold uppercase text-teal">{configured ? "Portafolio privado" : "Vista demo"}</p>
              <h1 className="mt-2 text-3xl font-semibold">{student?.full_name || "Alumno"}</h1>
              <p className="mt-2 text-ink/60">{student?.stage || "Etapa 3-6 años"}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-forest/12 bg-forest/8 px-3 py-2 text-sm font-semibold text-forest">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Acceso por familia
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-teal" aria-hidden="true" />
              <h2 className="font-semibold">Filtros</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label className="grid gap-2 font-semibold">
                Área
                <select
                  value={areaFilter}
                  onChange={(event) => {
                    setAreaFilter(event.target.value);
                    setTopicFilter("");
                  }}
                  className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                >
                  <option value="">Todas</option>
                  {availableAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 font-semibold">
                Submateria
                <select
                  value={topicFilter}
                  onChange={(event) => setTopicFilter(event.target.value)}
                  className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                >
                  <option value="">Todas</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 font-semibold">
                Tipo
                <select
                  value={kindFilter}
                  onChange={(event) => setKindFilter(event.target.value)}
                  className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
                >
                  <option value="">Todos</option>
                  {Object.entries(evidenceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-5 rounded-md bg-mist px-3 py-2 text-sm leading-6 text-ink/62">
              {filteredEntries.length} de {studentEntries.length} entradas visibles.
            </div>
          </aside>

          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <article key={entry.id} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase text-teal">{entry.area} · {entry.topic}</p>
                    <h2 className="mt-1 text-xl font-semibold">{entry.title}</h2>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-md bg-cloud px-3 py-2 text-sm font-semibold text-forest">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {formatDate(entry.activity_date)}
                  </span>
                </div>
                <p className="mt-4 leading-7 text-ink/64">{entry.summary || "Sin resumen."}</p>
                {entry.observation ? <p className="mt-3 rounded-md bg-cloud px-3 py-2 text-sm leading-6 text-ink/60">{entry.observation}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}>{evidenceLabels[entry.evidence_kind]}</Chip>
                  <Chip icon={<Camera className="h-3.5 w-3.5" aria-hidden="true" />}>{entry.media_count} anexos</Chip>
                  {entry.external_provider ? <Chip>{entry.external_provider}</Chip> : null}
                  {entry.privacy_notes ? <Chip>{entry.privacy_notes}</Chip> : null}
                </div>
              </article>
            ))}
            {filteredEntries.length === 0 ? (
              <div className="rounded-md border border-dashed border-ink/14 bg-white p-8 text-center text-ink/58">
                No hay entradas que coincidan con los filtros actuales.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function Chip({
  children,
  icon
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-ink/8 bg-cloud px-2 py-1 text-xs font-semibold text-ink/62">
      {icon}
      {children}
    </span>
  );
}

function uniqueBy<T extends Record<string, unknown>>(entries: T[], idKey: keyof T, nameKey: keyof T) {
  const seen = new Map<string, string>();
  entries.forEach((entry) => {
    const id = typeof entry[idKey] === "string" ? entry[idKey] : "";
    const name = typeof entry[nameKey] === "string" ? entry[nameKey] : "";
    if (id && name && !seen.has(id)) {
      seen.set(id, name);
    }
  });

  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

function formatDate(value: string) {
  if (!value) {
    return "Fecha abierta";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
