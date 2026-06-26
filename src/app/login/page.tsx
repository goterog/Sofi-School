import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/dashboard/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cloud px-5 py-10 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <Link href="/" className="focus-ring inline-flex rounded-md text-sm font-semibold text-forest hover:text-ink">
            Volver al sitio
          </Link>
          <h1 className="mt-8 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Acceso privado al seguimiento familiar
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/68">
            El dashboard se activa por invitación del administrador. Cada familia solo accede a sus alumnos, evidencias y recursos autorizados.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Portafolio", "Recursos", "Evidencias"].map((item) => (
              <div key={item} className="rounded-md border border-ink/8 bg-white p-4 shadow-line">
                <p className="font-semibold text-forest">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-md border border-ink/8 bg-white p-5 shadow-soft sm:p-7">
          <Suspense fallback={<div className="text-sm text-ink/60">Preparando acceso...</div>}>
            <LoginForm configured={isSupabaseConfigured} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
