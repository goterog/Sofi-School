import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const invitationSchema = z.object({
  email: z.string().email().max(160),
  familyId: z.string().uuid(),
  expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = invitationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa el correo y la familia." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inicia sesión como admin." }, { status: 401 });
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const expiresAt = parsed.data.expiresOn
    ? new Date(`${parsed.data.expiresOn}T23:59:59.000Z`).toISOString()
    : null;

  const { error } = await supabase.from("invitations").insert({
    email: normalizedEmail,
    family_id: parsed.data.familyId,
    role: "parent",
    status: "pending",
    expires_at: expiresAt,
    invited_by: user.id
  });

  if (error) {
    return NextResponse.json(
      { message: "No pudimos crear la invitación. Revisa si ya existe una pendiente." },
      { status: 500 }
    );
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
