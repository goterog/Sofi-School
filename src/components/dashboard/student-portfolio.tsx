import Link from "next/link";
import { ArrowLeft, Camera, FileText, ShieldCheck } from "lucide-react";
import type { DemoDashboardData } from "@/lib/demo-data";

type StudentPortfolioData = DemoDashboardData | {
  mode: "live";
  profileName: string;
  families: DemoDashboardData["families"];
  students: DemoDashboardData["students"];
  entries: DemoDashboardData["entries"];
  resources: DemoDashboardData["resources"];
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
  const entries = data.entries.filter((entry) => !student || entry.student_id === student.id);

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

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
            <h2 className="font-semibold">Filtros previstos</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {["Área de aprendizaje", "Periodo", "Tipo de evidencia", "Fecha"].map((filter) => (
                <div key={filter} className="rounded-md bg-cloud px-3 py-2 text-ink/64">
                  {filter}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-ink/56">
              En v1, estos filtros se conectan directamente a las tablas de áreas, periodos y medios del portafolio.
            </p>
          </aside>

          <div className="grid gap-4">
            {entries.map((entry) => (
              <article key={entry.id} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase text-teal">{entry.area} · {entry.period}</p>
                    <h2 className="mt-1 text-xl font-semibold">{entry.title}</h2>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-md bg-cloud px-3 py-2 text-sm font-semibold text-forest">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {entry.media_count} medios
                  </span>
                </div>
                <p className="mt-4 leading-7 text-ink/64">{entry.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Nota", "Foto", "Video/enlace"].map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-2 rounded-md border border-ink/8 bg-cloud px-2 py-1 text-xs font-semibold text-ink/62">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            ))}
            {entries.length === 0 ? (
              <div className="rounded-md border border-dashed border-ink/14 bg-white p-8 text-center text-ink/58">
                No hay entradas de portafolio para este alumno todavía.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
