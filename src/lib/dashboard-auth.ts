import { createServerSupabaseClient, type AppRole } from "@/lib/supabase/server";

export async function getDashboardActor() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase no está configurado.", status: 503 as const, supabase: null, user: null, role: null };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Inicia sesión para continuar.", status: 401 as const, supabase, user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: AppRole }>();

  return { error: null, status: 200 as const, supabase, user, role: profile?.role || "parent" };
}

export async function writeAuditEvent({
  supabase,
  actorId,
  familyId,
  eventName,
  metadata = {}
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
  actorId: string;
  familyId?: string | null;
  eventName: string;
  metadata?: Record<string, unknown>;
}) {
  await supabase.from("audit_events").insert({
    actor_id: actorId,
    family_id: familyId || null,
    event_name: eventName,
    metadata
  });
}

