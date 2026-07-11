import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardActor, writeAuditEvent } from "@/lib/dashboard-auth";

const base = z.object({ id: z.string().uuid().optional() });
const adminSchema = z.discriminatedUnion("entity", [
  base.extend({
    entity: z.literal("family"),
    action: z.enum(["create", "update", "archive"]),
    name: z.string().min(2).max(120).optional(),
    city: z.string().max(120).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal(""))
  }),
  base.extend({
    entity: z.literal("student"),
    action: z.enum(["create", "update", "archive"]),
    familyId: z.string().uuid().optional(),
    fullName: z.string().min(2).max(160).optional(),
    birthYear: z.number().int().min(2015).max(2035).nullable().optional(),
    stage: z.string().min(2).max(80).optional(),
    notes: z.string().max(500).optional().or(z.literal(""))
  }),
  base.extend({
    entity: z.literal("guide"),
    action: z.enum(["create", "update", "publish", "archive"]),
    areaId: z.string().uuid().optional(),
    topicId: z.string().uuid().optional().or(z.literal("")),
    title: z.string().min(3).max(160).optional(),
    objective: z.string().min(3).max(1000).optional(),
    ageRange: z.string().max(80).optional(),
    materials: z.array(z.string().min(1).max(160)).max(30).optional(),
    steps: z.array(z.string().min(1).max(500)).max(30).optional(),
    evidencePrompt: z.string().max(500).optional().or(z.literal(""))
  }),
  base.extend({
    entity: z.literal("material"),
    action: z.enum(["create", "update", "publish", "archive"]),
    areaId: z.string().uuid().optional().or(z.literal("")),
    topicId: z.string().uuid().optional().or(z.literal("")),
    title: z.string().min(3).max(160).optional(),
    description: z.string().max(1200).optional().or(z.literal("")),
    category: z.string().max(100).optional().or(z.literal("")),
    kind: z.string().max(80).optional().or(z.literal("")),
    sourceName: z.string().max(120).optional().or(z.literal("")),
    audience: z.string().max(120).optional().or(z.literal("")),
    externalUrl: z.string().url().max(2000).optional().or(z.literal("")),
    storagePath: z.string().max(500).optional().or(z.literal("")),
    accessNotes: z.string().max(500).optional().or(z.literal(""))
  })
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos administrativos." }, { status: 400 });
  }

  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }
  if (actor.role !== "admin") {
    return NextResponse.json({ message: "Esta acción requiere rol de administrador." }, { status: 403 });
  }

  const data = parsed.data;
  let recordId = data.id || "";
  let familyId: string | null = null;
  let error: { message: string } | null = null;

  if (data.entity === "family") {
    if (data.action === "create") {
      if (!data.name) return badRequest();
      const result = await actor.supabase.from("families").insert({
        name: data.name,
        city: data.city || null,
        notes: data.notes || null,
        created_by: actor.user.id
      }).select("id").single<{ id: string }>();
      recordId = result.data?.id || "";
      familyId = recordId;
      error = result.error;
    } else {
      if (!data.id) return badRequest();
      familyId = data.id;
      const changes = data.action === "archive"
        ? { status: "archived", archived_at: new Date().toISOString(), archived_by: actor.user.id }
        : { name: data.name, city: data.city || null, notes: data.notes || null };
      const result = await actor.supabase.from("families").update(changes).eq("id", data.id);
      error = result.error;
    }
  }

  if (data.entity === "student") {
    if (data.action === "create") {
      if (!data.familyId || !data.fullName) return badRequest();
      familyId = data.familyId;
      const result = await actor.supabase.from("students").insert({
        family_id: data.familyId,
        full_name: data.fullName,
        birth_year: data.birthYear || null,
        stage: data.stage || "3-6 años",
        notes: data.notes || null
      }).select("id").single<{ id: string }>();
      recordId = result.data?.id || "";
      error = result.error;
    } else {
      if (!data.id) return badRequest();
      const { data: current } = await actor.supabase.from("students").select("family_id").eq("id", data.id).maybeSingle<{ family_id: string }>();
      familyId = current?.family_id || null;
      const changes = data.action === "archive"
        ? { status: "archived", archived_at: new Date().toISOString(), archived_by: actor.user.id }
        : { full_name: data.fullName, birth_year: data.birthYear || null, stage: data.stage, notes: data.notes || null };
      const result = await actor.supabase.from("students").update(changes).eq("id", data.id);
      error = result.error;
    }
  }

  if (data.entity === "guide") {
    if (["publish", "archive"].includes(data.action)) {
      if (!data.id) return badRequest();
      const result = await actor.supabase.from("activity_guides").update({ status: data.action === "publish" ? "published" : "archived" }).eq("id", data.id);
      error = result.error;
    } else {
      if (!data.areaId || !data.title || !data.objective) return badRequest();
      const values: Record<string, unknown> = {
        slug: slugify(data.title), area_id: data.areaId, topic_id: data.topicId || null,
        title: data.title, objective: data.objective, age_range: data.ageRange || "3-6 años",
        materials: data.materials || [], steps: data.steps || [], evidence_prompt: data.evidencePrompt || null
      };
      if (data.action === "create") {
        const result = await actor.supabase.from("activity_guides").insert({ ...values, created_by: actor.user.id }).select("id").single<{ id: string }>();
        recordId = result.data?.id || "";
        error = result.error;
      } else {
        if (!data.id) return badRequest();
        const result = await actor.supabase.from("activity_guides").update(values).eq("id", data.id);
        error = result.error;
      }
    }
  }

  if (data.entity === "material") {
    if (["publish", "archive"].includes(data.action)) {
      if (!data.id) return badRequest();
      const result = await actor.supabase.from("resources").update({ status: data.action === "publish" ? "published" : "archived" }).eq("id", data.id);
      error = result.error;
    } else {
      if (!data.title) return badRequest();
      const values: Record<string, unknown> = {
        slug: slugify(data.title), area_id: data.areaId || null, topic_id: data.topicId || null,
        title: data.title, description: data.description || null, category: data.category || null,
        kind: data.kind || null, source_name: data.sourceName || null, audience: data.audience || null,
        external_url: data.externalUrl || null, access_notes: data.accessNotes || null
      };
      if (data.storagePath !== undefined) values.storage_path = data.storagePath || null;
      if (data.action === "create") {
        const result = await actor.supabase.from("resources").insert({ ...values, created_by: actor.user.id }).select("id").single<{ id: string }>();
        recordId = result.data?.id || "";
        error = result.error;
      } else {
        if (!data.id) return badRequest();
        if (data.storagePath) {
          const { data: current } = await actor.supabase.from("resources").select("storage_path").eq("id", data.id).maybeSingle<{ storage_path: string | null }>();
          if (current?.storage_path && current.storage_path !== data.storagePath) {
            await actor.supabase.storage.from("resource-files").remove([current.storage_path]);
          }
        }
        const result = await actor.supabase.from("resources").update(values).eq("id", data.id);
        error = result.error;
      }
    }
  }

  if (error) {
    return NextResponse.json({ message: `No pudimos completar la acción: ${error.message}` }, { status: 500 });
  }

  await writeAuditEvent({
    supabase: actor.supabase,
    actorId: actor.user.id,
    familyId,
    eventName: `admin_${data.entity}_${data.action}`,
    metadata: { id: recordId }
  });

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true, id: recordId });

  function badRequest() {
    return NextResponse.json({ message: "Faltan datos requeridos para esta acción." }, { status: 400 });
  }
}

function slugify(value: string) {
  return `${value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
}
