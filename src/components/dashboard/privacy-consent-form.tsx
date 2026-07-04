"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";

type FamilyOption = {
  id: string;
  name: string;
};

type ConsentRow = {
  id: string;
  family_id: string;
  consent_name: string;
  consent_version: string;
  accepted: boolean;
  accepted_at: string;
  revoked_at: string | null;
};

export function PrivacyConsentForm({
  families,
  consents,
  configured
}: {
  families: FamilyOption[];
  consents: ConsentRow[];
  configured: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      familyId: String(formData.get("familyId") || ""),
      consentName: "uso-imagenes-videos-menores",
      consentVersion: "2026-07-04",
      accepted: formData.get("accepted") === "on",
      notes: String(formData.get("notes") || "")
    };

    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/privacy/consents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(result.message || "No pudimos guardar el consentimiento.");
      return;
    }

    setStatus("success");
    setMessage("Consentimiento actualizado.");
    router.refresh();
  }

  const latestConsent = consents.find((consent) => consent.consent_name === "uso-imagenes-videos-menores");
  const disabled = !configured || families.length === 0 || status === "loading";

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-ink/8 bg-white p-5 shadow-line">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Privacidad familiar</h2>
          <p className="mt-1 text-sm text-ink/58">Consentimiento para imágenes, videos y evidencias del menor.</p>
        </div>
        <ShieldCheck className="h-6 w-6 text-forest" aria-hidden="true" />
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Familia
          <select name="familyId" disabled={disabled} className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal">
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-start gap-3 rounded-md border border-ink/8 bg-cloud p-4 text-sm leading-6 text-ink/68">
          <input
            name="accepted"
            type="checkbox"
            defaultChecked={latestConsent?.accepted ?? false}
            disabled={disabled}
            className="mt-1 h-4 w-4 accent-forest"
          />
          <span>
            Acepto registrar y consultar evidencias educativas privadas que puedan incluir imagen, voz o trabajos del menor, bajo acceso restringido por familia.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Notas
          <textarea
            name="notes"
            rows={3}
            maxLength={500}
            disabled={disabled}
            className="focus-ring rounded-md border border-ink/12 bg-cloud px-3 py-3 font-normal"
            placeholder="Restricciones o acuerdos familiares específicos."
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-forest px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Guardar consentimiento"}
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </button>

      {latestConsent ? (
        <p className="mt-4 rounded-md bg-cloud px-3 py-2 text-xs leading-5 text-ink/58">
          Estado actual: {latestConsent.accepted ? "aceptado" : "revocado"} · versión {latestConsent.consent_version}
        </p>
      ) : null}

      {message ? (
        <p className={`mt-4 rounded-md px-3 py-2 text-sm ${status === "success" ? "bg-leaf/12 text-forest" : "bg-coral/12 text-coral"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
