"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Configura Supabase para habilitar el acceso real.");
      return;
    }

    setStatus("loading");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setMessage("No pudimos iniciar sesión con esos datos.");
      return;
    }

    router.push(searchParams.get("redirectedFrom") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-forest text-white">
        <LockKeyhole className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold">Entrar al dashboard</h2>
      <p className="mt-2 leading-7 text-ink/62">
        Usa el correo invitado por administración. El registro abierto está deshabilitado por seguridad.
      </p>
      {!configured ? (
        <p className="mt-5 rounded-md border border-sun/30 bg-sun/12 px-3 py-2 text-sm leading-6 text-ink/72">
          Modo local: faltan las variables de Supabase. Puedes revisar la UI, pero el login real queda bloqueado.
        </p>
      ) : null}
      <label className="mt-6 grid gap-2 text-sm font-semibold">
        Correo
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/42" aria-hidden="true" />
          <input
            name="email"
            type="email"
            required
            disabled={!configured || status === "loading"}
            className="focus-ring w-full rounded-md border border-ink/12 bg-cloud py-3 pl-10 pr-3 font-normal disabled:opacity-60"
            placeholder="correo@familia.com"
          />
        </div>
      </label>
      <label className="mt-4 grid gap-2 text-sm font-semibold">
        Contraseña
        <input
          name="password"
          type="password"
          required
          disabled={!configured || status === "loading"}
          className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal disabled:opacity-60"
          placeholder="Tu contraseña"
        />
      </label>
      <button
        type="submit"
        disabled={!configured || status === "loading"}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Entrando..." : "Entrar"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      {message ? <p className="mt-4 rounded-md bg-coral/12 px-3 py-2 text-sm text-coral">{message}</p> : null}
      <p className="mt-5 text-xs leading-5 text-ink/50">
        Si necesitas acceso, usa el formulario de contacto del sitio público para solicitar invitación.
      </p>
    </form>
  );
}
