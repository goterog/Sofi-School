import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardActor, writeAuditEvent } from "@/lib/dashboard-auth";
import { PORTFOLIO_CONSENT_NAME, PORTFOLIO_CONSENT_VERSION } from "@/lib/portfolio-policy";

const consentSchema = z.object({
  familyId: z.string().uuid(),
  studentId: z.string().uuid().optional().or(z.literal("")),
  consentName: z.literal(PORTFOLIO_CONSENT_NAME).default(PORTFOLIO_CONSENT_NAME),
  consentVersion: z.literal(PORTFOLIO_CONSENT_VERSION).default(PORTFOLIO_CONSENT_VERSION),
  accepted: z.literal(true),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = consentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa el consentimiento." }, { status: 400 });
  }

  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }

  const { data: family } = await actor.supabase
    .from("families")
    .select("id")
    .eq("id", parsed.data.familyId)
    .maybeSingle();

  if (!family) {
    return NextResponse.json({ message: "No tienes acceso a esa familia." }, { status: 403 });
  }

  const { error } = await actor.supabase.from("privacy_consents").upsert(
    {
      family_id: parsed.data.familyId,
      student_id: parsed.data.studentId || null,
      guardian_user_id: actor.user.id,
      consent_name: PORTFOLIO_CONSENT_NAME,
      consent_version: PORTFOLIO_CONSENT_VERSION,
      accepted: true,
      accepted_at: new Date().toISOString(),
      revoked_at: null,
      notes: parsed.data.notes || null
    },
    {
      onConflict: "family_id,guardian_user_id,consent_name,consent_version",
      ignoreDuplicates: true
    }
  );

  if (error) {
    return NextResponse.json({ message: "No pudimos guardar el consentimiento." }, { status: 500 });
  }

  await writeAuditEvent({
    supabase: actor.supabase,
    actorId: actor.user.id,
    familyId: parsed.data.familyId,
    eventName: "portfolio_consent_accepted",
    metadata: { version: PORTFOLIO_CONSENT_VERSION }
  });

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
