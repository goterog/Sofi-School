import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const consentSchema = z.object({
  familyId: z.string().uuid(),
  studentId: z.string().uuid().optional().or(z.literal("")),
  consentName: z.string().min(3).max(120),
  consentVersion: z.string().min(4).max(40).default("2026-07-04"),
  accepted: z.boolean(),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = consentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa el consentimiento." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inicia sesión para guardar consentimiento." }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("privacy_consents").upsert(
    {
      family_id: parsed.data.familyId,
      student_id: parsed.data.studentId || null,
      guardian_user_id: user.id,
      consent_name: parsed.data.consentName,
      consent_version: parsed.data.consentVersion,
      accepted: parsed.data.accepted,
      accepted_at: parsed.data.accepted ? now : now,
      revoked_at: parsed.data.accepted ? null : now,
      notes: parsed.data.notes || null
    },
    {
      onConflict: "family_id,guardian_user_id,consent_name,consent_version"
    }
  );

  if (error) {
    return NextResponse.json({ message: "No pudimos guardar el consentimiento." }, { status: 500 });
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
