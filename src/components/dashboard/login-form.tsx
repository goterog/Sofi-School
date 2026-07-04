"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const authError = searchParams.get("authError");

  async function handleGoogleLogin() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Configura Supabase para habilitar el acceso real.");
      return;
    }

    setStatus("loading");
    setMessage("");
    const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectedFrom)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      setStatus("error");
      setMessage("No pudimos iniciar sesión con Google.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-forest text-white">
        <LockKeyhole className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold">Entrar al dashboard</h2>
      <p className="mt-2 leading-7 text-ink/62">
        Continúa con el correo de Google invitado por administración. El registro abierto permanece deshabilitado.
      </p>
      {!configured ? (
        <p className="mt-5 rounded-md border border-sun/30 bg-sun/12 px-3 py-2 text-sm leading-6 text-ink/72">
          Modo local: faltan las variables de Supabase. Puedes revisar la UI, pero el login real queda bloqueado.
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={!configured || status === "loading"}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Redirigiendo..." : "Continuar con Google"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      {authError ? (
        <p className="mt-4 rounded-md bg-coral/12 px-3 py-2 text-sm text-coral">
          No pudimos completar el acceso. Verifica que tu correo tenga una invitación activa.
        </p>
      ) : null}
      {message ? <p className="mt-4 rounded-md bg-coral/12 px-3 py-2 text-sm text-coral">{message}</p> : null}
      <p className="mt-5 text-xs leading-5 text-ink/50">
        Si necesitas acceso, usa el formulario de contacto del sitio público para solicitar invitación.
      </p>
    </div>
  );
}
