import Link from "next/link";
import {
  BookOpen,
  Camera,
  FileText,
  Home,
  LibraryBig,
  LockKeyhole,
  ShieldCheck,
  Users
} from "lucide-react";
import type { DemoDashboardData } from "@/lib/demo-data";

type DashboardData = DemoDashboardData | {
  mode: "live";
  profileName: string;
  families: Array<{ id: string; name: string; city: string | null }>;
  students: Array<{ id: string; family_id: string; full_name: string; birth_year: number | null; stage: string | null }>;
  entries: Array<{
    id: string;
    student_id: string;
    area: string;
    period: string;
    title: string;
    summary: string;
    media_count: number;
    created_at: string;
  }>;
  resources: Array<{ id: string; title: string; category: string | null; kind: string | null }>;
};

export function DashboardShell({ data, configured }: { data: DashboardData; configured: boolean }) {
  const stats = [
    { label: "Familias", value: data.families.length, icon: Users },
    { label: "Alumnos", value: data.students.length, icon: BookOpen },
    { label: "Evidencias", value: data.entries.reduce((total, entry) => total + entry.media_count, 0), icon: Camera },
    { label: "Recursos", value: data.resources.length, icon: LibraryBig }
  ];

  return (
    <main className="min-h-screen bg-cloud text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-ink/8 bg-white p-5 lg:block">
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-forest">
            <Home className="h-5 w-5" aria-hidden="true" />
            Sofi School
          </Link>
          <nav className="mt-10 grid gap-2 text-sm font-semibold text-ink/70">
            {["Resumen", "Alumnos", "Portafolio", "Recursos", "Configuración"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="rounded-md px-3 py-2 transition hover:bg-forest/8 hover:text-forest">
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-10 rounded-md border border-forest/12 bg-cloud p-4">
            <ShieldCheck className="h-6 w-6 text-forest" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Acceso protegido</p>
            <p className="mt-1 text-xs leading-5 text-ink/58">
              Con Supabase activo, RLS limita cada familia a sus propios alumnos y evidencias.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col justify-between gap-4 rounded-md border border-ink/8 bg-white p-5 shadow-line sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-teal">{configured ? "Dashboard privado" : "Vista demo local"}</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Hola, {data.profileName}</h1>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                Seguimiento, evidencias y recursos del programa educativo familiar.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-ink/8 bg-cloud px-3 py-2 text-sm font-semibold text-forest">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              {configured ? "Sesión autenticada" : "Configura Supabase"}
            </div>
          </header>

          <section id="resumen" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.label} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink/58">{stat.label}</p>
                    <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
                </article>
              );
            })}
          </section>

          <section id="alumnos" className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Alumnos</h2>
                  <p className="mt-1 text-sm text-ink/58">Organizados por familia y etapa.</p>
                </div>
                <Users className="h-6 w-6 text-forest" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3">
                {data.students.map((student) => (
                  <Link
                    key={student.id}
                    href={`/dashboard/alumnos/${student.id}`}
                    className="focus-ring rounded-md border border-ink/8 bg-cloud p-4 transition hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-line"
                  >
                    <p className="font-semibold">{student.full_name}</p>
                    <p className="mt-1 text-sm text-ink/58">
                      {student.stage || "Etapa abierta"} {student.birth_year ? `· Nacimiento ${student.birth_year}` : ""}
                    </p>
                  </Link>
                ))}
                {data.students.length === 0 ? <EmptyState text="Aún no hay alumnos registrados para esta cuenta." /> : null}
              </div>
            </div>

            <div id="portafolio" className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Portafolio reciente</h2>
                  <p className="mt-1 text-sm text-ink/58">Entradas por área y periodo.</p>
                </div>
                <Camera className="h-6 w-6 text-coral" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3">
                {data.entries.map((entry) => (
                  <article key={entry.id} className="rounded-md border border-ink/8 bg-cloud p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase text-teal">{entry.area} · {entry.period}</p>
                        <h3 className="mt-1 font-semibold">{entry.title}</h3>
                      </div>
                      <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-forest">
                        {entry.media_count} medios
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/62">{entry.summary}</p>
                  </article>
                ))}
                {data.entries.length === 0 ? <EmptyState text="Aún no hay evidencias en el portafolio." /> : null}
              </div>
            </div>
          </section>

          <section id="recursos" className="mt-8 rounded-md border border-ink/8 bg-white p-5 shadow-line">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Recursos</h2>
                <p className="mt-1 text-sm text-ink/58">Materiales, documentos y ligas complementarias.</p>
              </div>
              <LibraryBig className="h-6 w-6 text-teal" aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {data.resources.map((resource) => (
                <article key={resource.id} className="rounded-md border border-ink/8 bg-cloud p-4">
                  <FileText className="h-5 w-5 text-forest" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold">{resource.title}</h3>
                  <p className="mt-2 text-sm text-ink/58">
                    {resource.category || "General"} · {resource.kind || "Recurso"}
                  </p>
                </article>
              ))}
              {data.resources.length === 0 ? <EmptyState text="Aún no hay recursos publicados." /> : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/14 bg-cloud px-4 py-6 text-sm text-ink/56">
      {text}
    </div>
  );
}
