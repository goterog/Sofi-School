import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardActor, writeAuditEvent } from "@/lib/dashboard-auth";

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

  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }
  if (actor.role !== "admin") {
    return NextResponse.json({ message: "Esta acción requiere rol de administrador." }, { status: 403 });
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const expiresAt = parsed.data.expiresOn
    ? new Date(`${parsed.data.expiresOn}T23:59:59.000Z`).toISOString()
    : null;

  const { error } = await actor.supabase.from("invitations").insert({
    email: normalizedEmail,
    family_id: parsed.data.familyId,
    role: "parent",
    status: "pending",
    expires_at: expiresAt,
    invited_by: actor.user.id
  });

  if (error) {
    return NextResponse.json(
      { message: "No pudimos crear la invitación. Revisa si ya existe una pendiente." },
      { status: 500 }
    );
  }

  await writeAuditEvent({
    supabase: actor.supabase,
    actorId: actor.user.id,
    familyId: parsed.data.familyId,
    eventName: "admin_invitation_created",
    metadata: { email: normalizedEmail }
  });

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
