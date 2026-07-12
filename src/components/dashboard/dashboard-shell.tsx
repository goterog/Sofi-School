"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Camera, CheckCircle2, ClipboardList, ExternalLink, Home, LibraryBig, LockKeyhole, LogOut, Menu, Plus, Settings, ShieldCheck, Users, X } from "lucide-react";
import { AdminOperations } from "@/components/dashboard/admin-operations";
import { InvitationForm } from "@/components/dashboard/invitation-form";
import { PortfolioEntryForm } from "@/components/dashboard/portfolio-entry-form";
import { PortfolioTimeline, type PortfolioItem } from "@/components/dashboard/portfolio-timeline";
import type { DemoDashboardData } from "@/lib/demo-data";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type LiveData = {
  mode: "live"; profileName: string; profileEmail: string; avatarUrl: string; role: "admin" | "parent";
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
  const router = useRouter();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const entries: PortfolioItem[] = data.entries.map((entry) => ({ ...entry, student_name: "student_name" in entry ? String(entry.student_name) : data.students.find((s) => s.id === entry.student_id)?.full_name || "Alumno", author_name: "author_name" in entry ? String(entry.author_name) : data.profileName, can_edit: "can_edit" in entry ? Boolean(entry.can_edit) : false, status: "status" in entry ? String(entry.status) : "active" }));
  const archivedEntries = "archivedEntries" in data ? data.archivedEntries : [];
  const stats = [{ label: "Familias", value: data.families.length, icon: Users }, { label: "Alumnos", value: data.students.length, icon: BookOpen }, { label: "Guías", value: data.guides.length, icon: ClipboardList }, { label: "Evidencias", value: entries.length, icon: Camera }, { label: "Materiales", value: data.resources.length, icon: LibraryBig }];

  const avatarUrl = "avatarUrl" in data ? data.avatarUrl : "";
  const profileEmail = "profileEmail" in data ? data.profileEmail : "Vista demostrativa";

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/login"); router.refresh();
  }

  function navigateToSection(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setMobileOpen(false);
    window.requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    });
  }

  return <main className="min-h-screen bg-cloud text-ink">
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-md text-forest"><span className="grid h-9 w-9 place-items-center rounded-lg bg-forest text-white"><Home className="h-5 w-5" /></span><span className="hidden leading-tight sm:block"><strong className="block text-sm">Sofi School</strong><span className="block text-xs text-ink/50">Dashboard</span></span></Link>
        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Secciones principales">{navItems.slice(0, 3).map((item) => <a key={item.href} href={item.href} onClick={(event) => navigateToSection(event, item.href)} className="focus-ring rounded-md px-4 py-2 text-sm font-semibold text-ink/65 transition hover:bg-forest/8 hover:text-forest">{item.label}</a>)}</nav>
        <div className="relative ml-auto flex items-center gap-1 md:ml-0">
          <a href="#configuracion" onClick={(event) => navigateToSection(event, "#configuracion")} className="focus-ring rounded-full p-2 text-ink/62 hover:bg-cloud hover:text-forest" aria-label="Configuración"><Settings className="h-5 w-5" /></a>
          <button type="button" onClick={() => { setSecurityOpen((value) => !value); setProfileOpen(false); }} className="focus-ring rounded-full p-2 text-ink/62 hover:bg-cloud hover:text-forest" aria-label="Información de seguridad"><ShieldCheck className="h-5 w-5" /></button>
          <button type="button" onClick={() => { setProfileOpen((value) => !value); setSecurityOpen(false); }} className="focus-ring ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-forest/20 bg-forest/10 text-sm font-bold text-forest" aria-label="Cuenta de usuario">{avatarUrl ? <Image unoptimized src={avatarUrl} alt={`Perfil de ${data.profileName}`} width={36} height={36} className="h-full w-full object-cover" /> : data.profileName.slice(0, 1).toUpperCase()}</button>
          <button type="button" onClick={() => setMobileOpen((value) => !value)} className="focus-ring rounded-full p-2 md:hidden" aria-label="Abrir navegación"><Menu className="h-5 w-5" /></button>
          {securityOpen ? <SecurityPopover onClose={() => setSecurityOpen(false)} /> : null}
          {profileOpen ? <div className="absolute right-0 top-12 w-72 rounded-xl border border-ink/10 bg-white p-4 shadow-2xl"><p className="font-semibold">{data.profileName}</p><p className="mt-1 truncate text-sm text-ink/55">{profileEmail}</p><p className="mt-3 inline-flex rounded-full bg-cloud px-3 py-1 text-xs font-bold text-forest">{data.role === "admin" ? "Administrador" : "Familia autorizada"}</p>{configured ? <button type="button" onClick={signOut} className="mt-4 flex w-full items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-semibold text-coral"><LogOut className="h-4 w-4" />Cerrar sesión</button> : null}</div> : null}
        </div>
      </div>
      {mobileOpen ? <nav className="grid gap-1 border-t border-ink/8 bg-white/95 px-4 py-3 md:hidden">{navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => navigateToSection(event, item.href)} className="rounded px-3 py-2 font-semibold hover:bg-cloud">{item.label}</a>)}</nav> : null}
    </header>
    <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-8 lg:px-10">
        <section id="portafolio" className="scroll-mt-20 pt-3">
          <PortfolioTimeline entries={entries} areas={data.areas} topics={data.topics} toolbarLead={<div className="flex items-center gap-2 pr-1"><Camera className="h-5 w-5 text-coral" /><h1 className="text-lg font-semibold">Portafolio</h1></div>} createAction={<button onClick={() => setEvidenceOpen(true)} disabled={!configured || !data.students.length} className="focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-forest px-4 py-3 font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Nueva evidencia</button>} />
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
    {evidenceOpen ? <PortfolioEntryForm students={data.students} areas={data.areas} topics={data.topics} configured={configured} open onClose={() => setEvidenceOpen(false)} /> : null}
  </main>;
}

function SecurityPopover({ onClose }: { onClose: () => void }) { return <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-forest/15 bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-3"><div><ShieldCheck className="h-7 w-7 text-forest" /><h2 className="mt-3 text-lg font-semibold">Acceso protegido</h2></div><button type="button" onClick={onClose} aria-label="Cerrar seguridad" className="rounded p-1 hover:bg-cloud"><X className="h-4 w-4" /></button></div><ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/65"><li><strong className="text-ink">Acceso por invitación.</strong> La cuenta se verifica con Google antes de crear la sesión.</li><li><strong className="text-ink">Datos aislados.</strong> RLS limita cada registro según el rol y la familia autorizada.</li><li><strong className="text-ink">Archivos privados.</strong> Storage entrega enlaces temporales y no publica rutas permanentes.</li><li><strong className="text-ink">Portafolio familiar.</strong> Cada familia consulta únicamente la información de sus alumnos.</li><li><strong className="text-ink">Acciones auditadas.</strong> Publicaciones y cambios administrativos relevantes dejan registro.</li></ul></div>; }
function SectionTitle({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy?: string; action?: React.ReactNode }) { return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div className="flex items-start gap-3">{icon}<div><h2 className="text-2xl font-semibold">{title}</h2>{copy ? <p className="mt-1 text-sm text-ink/58">{copy}</p> : null}</div></div>{action}</div>; }
function ConsentHistory({ consents, families }: { consents: LiveData["consents"] | DemoDashboardData["consents"]; families: Array<{ id: string; name: string }> }) { return <div className="rounded-lg border border-ink/8 bg-white p-5 shadow-line"><div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-forest" /><h3 className="text-xl font-semibold">Historial de consentimiento</h3></div><p className="mt-2 text-sm text-ink/58">Registro inmutable por autor, familia y versión.</p><div className="mt-4 grid gap-2">{consents.map((consent) => <div key={consent.id} className="rounded-md bg-cloud px-3 py-2 text-sm"><p className="font-semibold">{families.find((family) => family.id === consent.family_id)?.name || "Familia"}</p><p className="mt-1 text-xs text-ink/52">Aceptado · versión {consent.consent_version} · {new Date(consent.accepted_at).toLocaleDateString("es-MX")}</p></div>)}{!consents.length ? <p className="rounded-md border border-dashed p-4 text-sm text-ink/55">Se solicitará al publicar la primera evidencia.</p> : null}</div></div>; }
