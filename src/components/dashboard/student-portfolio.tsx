"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PortfolioTimeline, type PortfolioItem } from "@/components/dashboard/portfolio-timeline";

export function StudentPortfolio({ student, entries, areas, topics, configured }: {
  student: { id: string; full_name: string; stage: string | null } | null;
  entries: PortfolioItem[];
  areas: Array<{ id: string; name: string }>;
  topics: Array<{ id: string; area_id: string; name: string }>;
  configured: boolean;
}) {
  return <main className="min-h-screen bg-cloud px-5 py-8 text-ink sm:px-8"><div className="mx-auto max-w-6xl">
    <Link href="/dashboard#portafolio" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest"><ArrowLeft className="h-4 w-4" />Volver al portafolio</Link>
    <header className="mt-6 rounded-lg border border-ink/8 bg-white p-6 shadow-line"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-bold uppercase text-teal">{configured ? "Portafolio privado" : "Vista demo"}</p><h1 className="mt-2 text-3xl font-semibold">{student?.full_name || "Alumno"}</h1><p className="mt-2 text-ink/60">{student?.stage || "Etapa 3-6 años"}</p></div><div className="inline-flex items-center gap-2 rounded-md border border-forest/12 bg-forest/8 px-3 py-2 text-sm font-semibold text-forest"><ShieldCheck className="h-4 w-4" />Acceso por familia</div></div></header>
    <section className="mt-6"><PortfolioTimeline entries={entries} areas={areas} topics={topics} /></section>
  </div></main>;
}
