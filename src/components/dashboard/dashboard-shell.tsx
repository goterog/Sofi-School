"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Camera, CheckCircle2, ClipboardList, ExternalLink, Home, LibraryBig, LockKeyhole, Menu, Plus, Settings, ShieldCheck, Users } from "lucide-react";
import { AdminOperations } from "@/components/dashboard/admin-operations";
import { InvitationForm } from "@/components/dashboard/invitation-form";
import { PortfolioEntryForm } from "@/components/dashboard/portfolio-entry-form";
import { PortfolioTimeline, type PortfolioItem } from "@/components/dashboard/portfolio-timeline";
import type { DemoDashboardData } from "@/lib/demo-data";

type LiveData = {
  mode: "live"; profileName: string; role: "admin" | "parent";
  families: Array<{ id: string; name: string; city: string | null; status?: string }>;
  students: Array<{ id: string; family_id: string; full_name: string; birth_year: number | null; stage: string | null; status?: string }>;
  areas: Array<{ id: string; slug: string; name: string; description: string | null }>;
  topics: Array<{ id: string; area_id: string; slug: string; name: string; description: string | null }>;
  guides: Array<{ id: string; area_id: string; topic_id: string | null; area: string; topic: string; title: string; objective: string; age_range: string; materials: string[]; steps: string[]; evidence_prompt: string; status?: string }>;
  entries: PortfolioItem[]; archivedEntries: PortfolioItem[];
  resources: Array<{ id: string; title: string; description: string; category: string | null; kind: string | null; area: string; area_id?: string; topic: string; topic_id?: string; source_name: string; audience: string; external_url: string; storage_path?: string; file_url?: string; access_notes: string; status?: string }>;
  consents: Array<{ id: string; family_id: string; consent_name: string; consent_version: string; accepted: boolean; accepted_at: string; guardian_name?: string }>;
  invitations: Array<{ id: string; email: string; family_id: string | null; status: string; expires_at: string | null; created_at: string; accepted_at: string | null }>;
};

const navItems = [{ label: "Portafolio", href: "#portafolio" }, { label: "Guía", href: "#guia" }, { label: "Materiales", href: "#materiales" }, { label: "Resumen", href: "#resumen" }, { label: "Configuración", href: "#configuracion" }];

export function DashboardShell({ data, configured }: { data: DemoDashboardData | LiveData; configured: boolean }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const entries: PortfolioItem[] = data.entries.map((entry) => ({ ...entry, student_name: "student_name" in entry ? String(entry.student_name) : data.students.find((s) => s.id === entry.student_id)?.full_name || "Alumno", author_name: "author_name" in entry ? String(entry.author_name) : data.profileName, can_edit: "can_edit" in entry ? Boolean(entry.can_edit) : false, status: "status" in entry ? String(entry.status) : "active" }));
  const archivedEntries = "archivedEntries" in data ? data.archivedEntries : [];
  const stats = [{ label: "Familias", value: data.families.length, icon: Users }, { label: "Alumnos", value: data.students.length, icon: BookOpen }, { label: "Guías", value: data.guides.length, icon: ClipboardList }, { label: "Evidencias", value: entries.length, icon: Camera }, { label: "Materiales", value: data.resources.length, icon: LibraryBig }];

  return <main className="min-h-screen bg-cloud text-ink">
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 border-r border-ink/8 bg-white p-5 lg:block"><Brand /><Nav /><Security /></aside>
      <section className="min-w-0 flex-1 px-4 py-5 sm:px-8 lg:px-10">
        <header className="rounded-lg border border-ink/8 bg-white p-5 shadow-line">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase text-teal">{configured ? "Dashboard privado" : "Vista demo local"}</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Hola, {data.profileName}</h1><p className="mt-2 text-sm leading-6 text-ink/60">Portafolio, guía familiar y administración segura en un solo lugar.</p></div><button className="focus-ring rounded-md border border-ink/10 p-2 lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Abrir navegación"><Menu className="h-5 w-5" /></button></div>
          {mobileOpen ? <div className="mt-4 grid gap-1 border-t border-ink/8 pt-3 lg:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 font-semibold hover:bg-cloud">{item.label}</a>)}</div> : null}
        </header>
        <div className="sticky top-2 z-20 mt-3 flex gap-2 overflow-x-auto rounded-lg border border-ink/8 bg-white/95 p-2 shadow-line backdrop-blur lg:hidden">{navItems.map((item) => <a key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-forest hover:bg-cloud">{item.label}</a>)}</div>

        <section id="portafolio" className="scroll-mt-20 pt-8">
          <SectionTitle icon={<Camera className="h-6 w-6 text-coral" />} title="Portafolio" copy="Evidencias privadas organizadas por alumno, fecha y área." action={<button onClick={() => setEvidenceOpen(true)} disabled={!configured || !data.students.length} className="focus-ring inline-flex items-center gap-2 rounded-md bg-forest px-4 py-3 font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Nueva evidencia</button>} />
          <div className="mt-5"><PortfolioTimeline entries={entries} areas={data.areas} topics={data.topics} /></div>
          {data.role === "admin" && archivedEntries.length ? <details className="mt-5 rounded-lg border border-coral/15 bg-white p-4"><summary className="cursor-pointer font-semibold text-coral">Archivo administrativo ({archivedEntries.length})</summary><div className="mt-4"><PortfolioTimeline entries={archivedEntries} areas={data.areas} topics={data.topics} showArchive /></div></details> : null}
        </section>

        <section id="guia" className="scroll-mt-20 pt-10"><SectionTitle icon={<ClipboardList className="h-6 w-6 text-forest" />} title="Guía" copy="Actividades sugeridas por área y submateria." /><div className="mt-5 grid gap-4 xl:grid-cols-2">{data.guides.filter((g) => !("status" in g) || !g.status || g.status === "published").map((guide) => <article key={guide.id} className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><p className="text-xs font-bold uppercase text-teal">{guide.area} · {guide.topic}</p><h3 className="mt-1 text-lg font-semibold">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-ink/64">{guide.objective}</p><div className="mt-3 flex flex-wrap gap-2">{guide.materials.map((material) => <span key={material} className="rounded bg-cloud px-2 py-1 text-xs font-semibold">{material}</span>)}</div><ol className="mt-4 grid gap-2 text-sm text-ink/65">{guide.steps.map((step, index) => <li key={`${step}-${index}`}><strong>{index + 1}.</strong> {step}</li>)}</ol></article>)}</div></section>

        <section id="materiales" className="scroll-mt-20 pt-10"><SectionTitle icon={<LibraryBig className="h-6 w-6 text-teal" />} title="Materiales" copy="Recursos publicados y enlaces de acceso controlado." /><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.resources.filter((r) => !("status" in r) || !r.status || r.status === "published").map((resource) => { const fileUrl = "file_url" in resource ? resource.file_url : ""; return <article key={resource.id} className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><p className="text-xs font-bold uppercase text-teal">{resource.area} · {resource.topic}</p><h3 className="mt-1 font-semibold">{resource.title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{resource.description || "Material complementario."}</p>{resource.external_url || fileUrl ? <a href={fileUrl || resource.external_url} target="_blank" rel="noreferrer" className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold text-forest">Abrir recurso privado<ExternalLink className="h-4 w-4" /></a> : null}</article>; })}</div></section>

        <section id="resumen" className="scroll-mt-20 pt-10"><SectionTitle icon={<CheckCircle2 className="h-6 w-6 text-forest" />} title="Resumen" copy="Panorama operativo de la cuenta." /><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><div className="flex justify-between"><p className="text-sm font-semibold text-ink/58">{stat.label}</p><Icon className="h-5 w-5 text-teal" /></div><p className="mt-4 text-3xl font-semibold">{stat.value}</p></article>; })}</div><div className="mt-5 rounded-lg border border-ink/8 bg-white p-5 shadow-line"><h3 className="font-semibold">Alumnos activos</h3><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{data.students.map((student) => <Link key={student.id} href={`/dashboard/alumnos/${student.id}`} className="rounded-md bg-cloud p-4 hover:ring-1 hover:ring-teal"><p className="font-semibold">{student.full_name}</p><p className="text-sm text-ink/55">{student.stage || "Etapa abierta"}</p></Link>)}</div></div></section>

        <section id="configuracion" className="scroll-mt-20 pt-10 pb-12"><SectionTitle icon={<Settings className="h-6 w-6 text-teal" />} title="Configuración" copy="Accesos, consentimiento y operación administrativa." />
          <div className="mt-5 grid gap-5 xl:grid-cols-2"><ConsentHistory consents={data.consents} families={data.families} />{data.role === "admin" ? <InvitationForm families={data.families} configured={configured} /> : <div className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><LockKeyhole className="h-6 w-6 text-forest" /><h3 className="mt-3 font-semibold">Acceso por invitación</h3><p className="mt-2 text-sm leading-6 text-ink/60">Tu cuenta está vinculada a una familia autorizada.</p></div>}</div>
          {data.role === "admin" ? <div className="mt-5"><AdminOperations families={data.families} students={data.students} areas={data.areas} topics={data.topics} guides={data.guides} resources={data.resources} /></div> : null}
        </section>
      </section>
    </div>
    <PortfolioEntryForm students={data.students} areas={data.areas} topics={data.topics} configured={configured} open={evidenceOpen} onClose={() => setEvidenceOpen(false)} />
  </main>;
}

function Brand() { return <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-forest"><Home className="h-5 w-5" />Sofi School</Link>; }
function Nav() { return <nav className="mt-10 grid gap-2 text-sm font-semibold text-ink/70">{navItems.map((item) => <a key={item.href} href={item.href} className="rounded-md px-3 py-2 transition hover:bg-forest/8 hover:text-forest">{item.label}</a>)}</nav>; }
function Security() { return <div className="mt-10 rounded-md border border-forest/12 bg-cloud p-4"><ShieldCheck className="h-6 w-6 text-forest" /><p className="mt-3 text-sm font-semibold">Acceso protegido</p><p className="mt-1 text-xs leading-5 text-ink/58">RLS y Storage privado limitan la información a usuarios autorizados.</p></div>; }
function SectionTitle({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy: string; action?: React.ReactNode }) { return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="flex items-start gap-3">{icon}<div><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-1 text-sm text-ink/58">{copy}</p></div></div>{action}</div>; }
function ConsentHistory({ consents, families }: { consents: LiveData["consents"] | DemoDashboardData["consents"]; families: Array<{ id: string; name: string }> }) { return <div className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-forest" /><h3 className="text-xl font-semibold">Historial de consentimiento</h3></div><p className="mt-2 text-sm text-ink/58">Registro inmutable por autor, familia y versión.</p><div className="mt-4 grid gap-2">{consents.map((consent) => <div key={consent.id} className="rounded-md bg-cloud px-3 py-2 text-sm"><p className="font-semibold">{families.find((family) => family.id === consent.family_id)?.name || "Familia"}</p><p className="mt-1 text-xs text-ink/52">Aceptado · versión {consent.consent_version} · {new Date(consent.accepted_at).toLocaleDateString("es-MX")}</p></div>)}{!consents.length ? <p className="rounded-md border border-dashed p-4 text-sm text-ink/55">Se solicitará al publicar la primera evidencia.</p> : null}</div></div>; }
