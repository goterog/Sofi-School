import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Home,
  LibraryBig,
  LockKeyhole,
  MailPlus,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";
import { InvitationForm } from "@/components/dashboard/invitation-form";
import { PortfolioEntryForm } from "@/components/dashboard/portfolio-entry-form";
import { PrivacyConsentForm } from "@/components/dashboard/privacy-consent-form";
import type { DemoDashboardData } from "@/lib/demo-data";

type DashboardData = DemoDashboardData | {
  mode: "live";
  profileName: string;
  role: "admin" | "parent";
  families: Array<{ id: string; name: string; city: string | null }>;
  students: Array<{ id: string; family_id: string; full_name: string; birth_year: number | null; stage: string | null }>;
  areas: Array<{ id: string; slug: string; name: string; description: string | null }>;
  topics: Array<{ id: string; area_id: string; slug: string; name: string; description: string | null }>;
  guides: Array<{
    id: string;
    area_id: string;
    topic_id: string | null;
    area: string;
    topic: string;
    title: string;
    objective: string;
    age_range: string;
    materials: string[];
    steps: string[];
    evidence_prompt: string;
  }>;
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
  resources: Array<{
    id: string;
    title: string;
    description: string;
    category: string | null;
    kind: string | null;
    area: string;
    topic: string;
    source_name: string;
    audience: string;
    external_url: string;
    access_notes: string;
  }>;
  consents: Array<{
    id: string;
    family_id: string;
    consent_name: string;
    consent_version: string;
    accepted: boolean;
    accepted_at: string;
    revoked_at: string | null;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    family_id: string | null;
    status: string;
    expires_at: string | null;
    created_at: string;
    accepted_at: string | null;
  }>;
};

const navItems = [
  { label: "Resumen", href: "#resumen" },
  { label: "Guía", href: "#guia" },
  { label: "Materiales", href: "#materiales" },
  { label: "Portafolio", href: "#portafolio" },
  { label: "Configuración", href: "#configuracion" }
];

const evidenceLabels = {
  note: "Nota",
  photo: "Foto",
  video: "Video",
  document: "Documento",
  link: "Enlace"
};

export function DashboardShell({ data, configured }: { data: DashboardData; configured: boolean }) {
  const stats = [
    { label: "Familias", value: data.families.length, icon: Users },
    { label: "Alumnos", value: data.students.length, icon: BookOpen },
    { label: "Guías", value: data.guides.length, icon: ClipboardList },
    { label: "Evidencias", value: data.entries.length, icon: Camera },
    { label: "Materiales", value: data.resources.length, icon: LibraryBig }
  ];
  const recentEntries = data.entries.slice(0, 6);
  const acceptedConsent = data.consents.find((consent) => consent.consent_name === "uso-imagenes-videos-menores" && consent.accepted);

  return (
    <main className="min-h-screen bg-cloud text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-ink/8 bg-white p-5 lg:block">
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-forest">
            <Home className="h-5 w-5" aria-hidden="true" />
            Sofi School
          </Link>
          <nav className="mt-10 grid gap-2 text-sm font-semibold text-ink/70">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-forest/8 hover:text-forest">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-10 rounded-md border border-forest/12 bg-cloud p-4">
            <ShieldCheck className="h-6 w-6 text-forest" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Acceso protegido</p>
            <p className="mt-1 text-xs leading-5 text-ink/58">
              RLS limita cada consulta a familias, alumnos, recursos y evidencias autorizadas.
            </p>
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col justify-between gap-4 rounded-md border border-ink/8 bg-white p-5 shadow-line sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-teal">{configured ? "Dashboard privado" : "Vista demo local"}</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Hola, {data.profileName}</h1>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                Guía familiar, materiales didácticos y portafolio documental en un solo lugar.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-ink/8 bg-cloud px-3 py-2 text-sm font-semibold text-forest">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              {configured ? "Sesión autenticada" : "Configura Supabase"}
            </div>
          </header>

          <section id="resumen" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

          <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
                    className="focus-ring rounded-md border border-ink/8 bg-cloud p-4 transition hover:border-teal/30 hover:bg-white hover:shadow-line"
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

            <div className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Estado de seguridad</h2>
                  <p className="mt-1 text-sm text-ink/58">Privacidad, enlaces externos y cuenta gratuita.</p>
                </div>
                <Settings className="h-6 w-6 text-teal" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <StatusRow
                  icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                  label="Consentimiento"
                  value={acceptedConsent ? "Registrado" : "Pendiente"}
                />
                <StatusRow
                  icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                  label="Archivos pesados"
                  value="Enlaces privados"
                />
                <StatusRow
                  icon={<LockKeyhole className="h-5 w-5" aria-hidden="true" />}
                  label="Acceso"
                  value="OAuth + invitación"
                />
                <StatusRow
                  icon={<LibraryBig className="h-5 w-5" aria-hidden="true" />}
                  label="DB"
                  value="Metadatos ligeros"
                />
              </div>
            </div>
          </section>

          <section id="guia" className="mt-8">
            <SectionHeader
              icon={<ClipboardList className="h-6 w-6 text-forest" aria-hidden="true" />}
              title="Guía"
              copy="Actividades sugeridas por área y submateria."
            />
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {data.guides.map((guide) => (
                <article key={guide.id} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-teal">{guide.area} · {guide.topic}</p>
                      <h3 className="mt-1 text-lg font-semibold">{guide.title}</h3>
                    </div>
                    <span className="w-fit rounded-md bg-cloud px-2 py-1 text-xs font-semibold text-forest">{guide.age_range}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/64">{guide.objective}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {guide.materials.map((material) => (
                      <span key={material} className="rounded-md border border-ink/8 bg-cloud px-2 py-1 text-xs font-semibold text-ink/62">
                        {material}
                      </span>
                    ))}
                  </div>
                  <ol className="mt-4 grid gap-2 text-sm leading-6 text-ink/66">
                    {guide.steps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="font-semibold text-forest">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {guide.evidence_prompt ? (
                    <p className="mt-4 rounded-md bg-mist px-3 py-2 text-sm leading-6 text-ink/66">{guide.evidence_prompt}</p>
                  ) : null}
                </article>
              ))}
              {data.guides.length === 0 ? <EmptyState text="Aún no hay guías publicadas." /> : null}
            </div>
          </section>

          <section id="materiales" className="mt-8">
            <SectionHeader
              icon={<LibraryBig className="h-6 w-6 text-teal" aria-hidden="true" />}
              title="Materiales"
              copy="Plantillas, tarjetas, documentos y fuentes complementarias."
            />
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.resources.map((resource) => (
                <article key={resource.id} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                  <FileText className="h-5 w-5 text-forest" aria-hidden="true" />
                  <p className="mt-3 text-xs font-bold uppercase text-teal">{resource.area} · {resource.topic}</p>
                  <h3 className="mt-1 font-semibold">{resource.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{resource.description || "Material complementario."}</p>
                  <p className="mt-3 text-xs font-semibold text-ink/48">
                    {resource.category || "General"} · {resource.kind || "Recurso"} {resource.source_name ? `· ${resource.source_name}` : ""}
                  </p>
                  {resource.external_url ? (
                    <a
                      href={resource.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md border border-ink/10 bg-cloud px-3 py-2 text-sm font-semibold text-forest hover:bg-white"
                    >
                      Abrir recurso
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                  {resource.access_notes ? <p className="mt-4 text-xs leading-5 text-ink/48">{resource.access_notes}</p> : null}
                </article>
              ))}
              {data.resources.length === 0 ? <EmptyState text="Aún no hay materiales publicados." /> : null}
            </div>
          </section>

          <section id="portafolio" className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <PortfolioEntryForm students={data.students} areas={data.areas} topics={data.topics} configured={configured} />

            <div className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Timeline documental</h2>
                  <p className="mt-1 text-sm text-ink/58">Entradas recientes por fecha de actividad.</p>
                </div>
                <CalendarDays className="h-6 w-6 text-coral" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3">
                {recentEntries.map((entry) => (
                  <article key={entry.id} className="rounded-md border border-ink/8 bg-cloud p-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase text-teal">{entry.area} · {entry.topic}</p>
                        <h3 className="mt-1 font-semibold">{entry.title}</h3>
                      </div>
                      <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-semibold text-forest">
                        {formatDate(entry.activity_date)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/62">{entry.summary || entry.observation || "Sin resumen."}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge>{evidenceLabels[entry.evidence_kind]}</Badge>
                      <Badge>{entry.media_count} anexos</Badge>
                      {entry.external_provider ? <Badge>{entry.external_provider}</Badge> : null}
                    </div>
                  </article>
                ))}
                {recentEntries.length === 0 ? <EmptyState text="Aún no hay evidencias en el portafolio." /> : null}
              </div>
            </div>
          </section>

          <section id="configuracion" className="mt-8 grid gap-6 xl:grid-cols-2">
            <PrivacyConsentForm families={data.families} consents={data.consents} configured={configured} />

            {data.role === "admin" ? (
              <div className="grid gap-5">
                <InvitationForm families={data.families} configured={configured} />
                <div className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                  <div className="flex items-center gap-2">
                    <MailPlus className="h-5 w-5 text-teal" aria-hidden="true" />
                    <h2 className="text-xl font-semibold">Invitaciones</h2>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {data.invitations.map((invitation) => (
                      <div key={invitation.id} className="rounded-md bg-cloud px-3 py-2 text-sm">
                        <p className="font-semibold">{invitation.email}</p>
                        <p className="mt-1 text-xs text-ink/52">
                          {invitation.status} · creada {formatDate(invitation.created_at)}
                          {invitation.expires_at ? ` · expira ${formatDate(invitation.expires_at)}` : ""}
                        </p>
                      </div>
                    ))}
                    {data.invitations.length === 0 ? <EmptyState text="Aún no hay invitaciones registradas." /> : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
                <h2 className="text-xl font-semibold">Acceso por invitación</h2>
                <p className="mt-3 text-sm leading-6 text-ink/62">
                  Tu cuenta está vinculada a la familia autorizada. Para agregar otro adulto, solicita una invitación al administrador.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  copy
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-ink/8 bg-white p-5 shadow-line">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink/58">{copy}</p>
      </div>
      {icon}
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-cloud px-3 py-3">
      <span className="text-forest">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase text-ink/42">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-ink/8 bg-white px-2 py-1 text-xs font-semibold text-ink/58">
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/14 bg-cloud px-4 py-6 text-sm text-ink/56">
      {text}
    </div>
  );
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
