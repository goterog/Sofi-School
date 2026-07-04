"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MailPlus, Send } from "lucide-react";

type FamilyOption = {
  id: string;
  name: string;
};

export function InvitationForm({
  families,
  configured
}: {
  families: FamilyOption[];
  configured: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") || ""),
      familyId: String(formData.get("familyId") || ""),
      expiresOn: String(formData.get("expiresOn") || "")
    };

    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/dashboard/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(result.message || "No pudimos crear la invitación.");
      return;
    }

    setStatus("success");
    setMessage("Invitación registrada en la allowlist.");
    form.reset();
    router.refresh();
  }

  const disabled = !configured || families.length === 0 || status === "loading";

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Invitar familiar</h2>
          <p className="mt-1 text-sm text-ink/58">El correo queda autorizado para crear cuenta con Google.</p>
        </div>
        <MailPlus className="h-6 w-6 text-teal" aria-hidden="true" />
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Correo
          <input
            name="email"
            type="email"
            required
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="correo@familia.com"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Familia
          <select name="familyId" required disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Expira
          <input
            name="expiresOn"
            type="date"
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Registrar invitación"}
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>

      {message ? (
        <p className={`mt-4 rounded-md px-3 py-2 text-sm ${status === "success" ? "bg-leaf/12 text-forest" : "bg-coral/12 text-coral"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
