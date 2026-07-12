import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardActor, writeAuditEvent } from "@/lib/dashboard-auth";
import {
  PORTFOLIO_ALLOWED_MIME_TYPES,
  PORTFOLIO_BUCKET,
  PORTFOLIO_MAX_FILE_BYTES,
  PORTFOLIO_MAX_FILES
} from "@/lib/portfolio-policy";

const mediaSchema = z.object({
  storagePath: z.string().min(5).max(500),
  originalName: z.string().min(1).max(240),
  mimeType: z.enum(PORTFOLIO_ALLOWED_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(PORTFOLIO_MAX_FILE_BYTES),
  displayOrder: z.number().int().min(0).max(PORTFOLIO_MAX_FILES - 1)
});

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("finalize"), media: z.array(mediaSchema).min(1).max(PORTFOLIO_MAX_FILES) }),
  z.object({
    action: z.literal("update"),
    title: z.string().min(3).max(160),
    summary: z.string().max(1200).optional().or(z.literal("")),
    observation: z.string().max(2400).optional().or(z.literal("")),
    activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    areaId: z.string().uuid().optional().or(z.literal("")),
    topicId: z.string().uuid().optional().or(z.literal(""))
  }),
  z.object({ action: z.literal("archive") }),
  z.object({ action: z.literal("remove-media"), mediaId: z.string().uuid() })
]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }

  const { id } = await params;
  const { data: entry } = await actor.supabase
    .from("portfolio_entries")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ message: "No encontramos esa evidencia." }, { status: 404 });
  }

  const { data: media } = await actor.supabase
    .from("portfolio_media")
    .select("id,kind,storage_path,external_url,external_provider,caption,mime_type,size_bytes,original_name,display_order")
    .eq("entry_id", id)
    .is("removed_at", null)
    .order("display_order", { ascending: true });

  const signedMedia = await Promise.all((media || []).map(async (item) => {
    if (!item.storage_path) {
      return { ...item, signedUrl: item.external_url || "" };
    }

    const { data } = await actor.supabase.storage
      .from(PORTFOLIO_BUCKET)
      .createSignedUrl(item.storage_path, 15 * 60);

    return { ...item, signedUrl: data?.signedUrl || "" };
  }));

  return NextResponse.json({ media: signedMedia });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos de la evidencia." }, { status: 400 });
  }

  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }

  const { id } = await params;
  const { data: entry } = await actor.supabase
    .from("portfolio_entries")
    .select("id,family_id,student_id,created_by,status")
    .eq("id", id)
    .maybeSingle<{ id: string; family_id: string; student_id: string; created_by: string | null; status: string }>();

  if (!entry || (entry.created_by !== actor.user.id && actor.role !== "admin")) {
    return NextResponse.json({ message: "No puedes modificar esta evidencia." }, { status: 403 });
  }

  if (parsed.data.action === "finalize") {
    if (entry.status !== "uploading") {
      return NextResponse.json({ message: "Esta carga ya fue finalizada." }, { status: 409 });
    }

    const expectedPrefix = `${entry.family_id}/${entry.id}/`;
    if (parsed.data.media.some((item) => !item.storagePath.startsWith(expectedPrefix))) {
      return NextResponse.json({ message: "Una ruta de archivo no pertenece a esta evidencia." }, { status: 400 });
    }

    const { error: mediaError } = await actor.supabase.from("portfolio_media").insert(
      parsed.data.media.map((item) => ({
        entry_id: entry.id,
        family_id: entry.family_id,
        kind: item.mimeType === "application/pdf" ? "document" : "image",
        storage_path: item.storagePath,
        original_name: item.originalName,
        mime_type: item.mimeType,
        size_bytes: item.sizeBytes,
        display_order: item.displayOrder,
        created_by: actor.user.id
      }))
    );

    if (mediaError) {
      return NextResponse.json({ message: "Los archivos subieron, pero no pudimos registrarlos." }, { status: 500 });
    }

    const { error } = await actor.supabase
      .from("portfolio_entries")
      .update({ status: "active", published_at: new Date().toISOString() })
      .eq("id", entry.id);

    if (error) {
      return NextResponse.json({ message: "No pudimos finalizar la publicación." }, { status: 500 });
    }

    await audit("portfolio_entry_published", { fileCount: parsed.data.media.length });
  }

  if (parsed.data.action === "update") {
    const { error } = await actor.supabase.from("portfolio_entries").update({
      title: parsed.data.title,
      summary: parsed.data.summary || null,
      observation: parsed.data.observation || null,
      activity_date: parsed.data.activityDate,
      area_id: parsed.data.areaId || null,
      topic_id: parsed.data.topicId || null
    }).eq("id", entry.id);

    if (error) {
      return NextResponse.json({ message: "No pudimos actualizar la evidencia." }, { status: 500 });
    }
    await audit("portfolio_entry_updated");
  }

  if (parsed.data.action === "remove-media") {
    const { data: media } = await actor.supabase
      .from("portfolio_media")
      .select("id,storage_path")
      .eq("id", parsed.data.mediaId)
      .eq("entry_id", entry.id)
      .maybeSingle<{ id: string; storage_path: string | null }>();

    if (!media) {
      return NextResponse.json({ message: "No encontramos ese archivo." }, { status: 404 });
    }
    if (media.storage_path) {
      const { error: storageError } = await actor.supabase.storage.from(PORTFOLIO_BUCKET).remove([media.storage_path]);
      if (storageError) {
        return NextResponse.json({ message: "No pudimos retirar el archivo privado." }, { status: 500 });
      }
    }
    await actor.supabase.from("portfolio_media").update({
      removed_at: new Date().toISOString(),
      removed_by: actor.user.id,
      storage_path: null,
      external_url: null
    }).eq("id", media.id);
    await audit("portfolio_media_removed", { mediaId: media.id });
  }

  if (parsed.data.action === "archive") {
    const { data: media } = await actor.supabase
      .from("portfolio_media")
      .select("id,storage_path")
      .eq("entry_id", entry.id)
      .is("removed_at", null);
    const paths = (media || []).flatMap((item) => item.storage_path ? [item.storage_path] : []);
    if (paths.length) {
      const { error: storageError } = await actor.supabase.storage.from(PORTFOLIO_BUCKET).remove(paths);
      if (storageError) {
        return NextResponse.json({ message: "No pudimos retirar todos los archivos privados." }, { status: 500 });
      }
    }
    const now = new Date().toISOString();
    await actor.supabase.from("portfolio_media").update({ removed_at: now, removed_by: actor.user.id, storage_path: null, external_url: null }).eq("entry_id", entry.id);
    const { error } = await actor.supabase.from("portfolio_entries").update({
      status: "archived",
      archived_at: now,
      archived_by: actor.user.id
    }).eq("id", entry.id);
    if (error) {
      return NextResponse.json({ message: "No pudimos archivar la publicación." }, { status: 500 });
    }
    await audit("portfolio_entry_archived", { removedFiles: paths.length });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/alumnos/${entry.student_id}`);
  return NextResponse.json({ ok: true });

  async function audit(eventName: string, metadata: Record<string, unknown> = {}) {
    await writeAuditEvent({
      supabase: actor.supabase!,
      actorId: actor.user!.id,
      familyId: entry!.family_id,
      eventName,
      metadata: { entryId: entry!.id, ...metadata }
    });
  }
}
