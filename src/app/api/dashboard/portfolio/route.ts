import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardActor, writeAuditEvent } from "@/lib/dashboard-auth";
import { PORTFOLIO_CONSENT_NAME, PORTFOLIO_CONSENT_VERSION, PORTFOLIO_MAX_FILES } from "@/lib/portfolio-policy";

const portfolioEntrySchema = z.object({
  studentId: z.string().uuid(),
  areaId: z.string().uuid().optional().or(z.literal("")),
  topicId: z.string().uuid().optional().or(z.literal("")),
  periodId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(3).max(160),
  summary: z.string().max(1200).optional().or(z.literal("")),
  observation: z.string().max(2400).optional().or(z.literal("")),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  evidenceKind: z.enum(["note", "photo", "video", "document", "link"]),
  externalUrl: z.string().url().max(2000).optional().or(z.literal("")),
  externalProvider: z.string().max(80).optional().or(z.literal("")),
  caption: z.string().max(320).optional().or(z.literal("")),
  privacyNotes: z.string().max(500).optional().or(z.literal("")),
  fileCount: z.number().int().min(0).max(PORTFOLIO_MAX_FILES).default(0)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = portfolioEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los datos de la evidencia." }, { status: 400 });
  }

  if (parsed.data.externalUrl) {
    const url = new URL(parsed.data.externalUrl);
    if (url.protocol !== "https:") {
      return NextResponse.json(
        { message: "Usa enlaces HTTPS para evidencias externas." },
        { status: 400 }
      );
    }
  }

  const actor = await getDashboardActor();
  if (actor.error || !actor.supabase || !actor.user) {
    return NextResponse.json({ message: actor.error }, { status: actor.status });
  }

  const { data: student, error: studentError } = await actor.supabase
    .from("students")
    .select("id,family_id")
    .eq("id", parsed.data.studentId)
    .maybeSingle<{ id: string; family_id: string }>();

  if (studentError || !student) {
    return NextResponse.json({ message: "No encontramos ese alumno para tu familia." }, { status: 404 });
  }

  const { data: consent } = await actor.supabase
    .from("privacy_consents")
    .select("id")
    .eq("family_id", student.family_id)
    .eq("guardian_user_id", actor.user.id)
    .eq("consent_name", PORTFOLIO_CONSENT_NAME)
    .eq("consent_version", PORTFOLIO_CONSENT_VERSION)
    .eq("accepted", true)
    .maybeSingle();

  if (!consent) {
    return NextResponse.json(
      {
        code: "CONSENT_REQUIRED",
        familyId: student.family_id,
        consentVersion: PORTFOLIO_CONSENT_VERSION,
        message: "Acepta el consentimiento vigente antes de publicar tu primera evidencia."
      },
      { status: 409 }
    );
  }

  const hasFiles = parsed.data.fileCount > 0;
  const { data: entry, error: entryError } = await actor.supabase
    .from("portfolio_entries")
    .insert({
      family_id: student.family_id,
      student_id: student.id,
      area_id: parsed.data.areaId || null,
      topic_id: parsed.data.topicId || null,
      period_id: parsed.data.periodId || null,
      title: parsed.data.title,
      summary: parsed.data.summary || null,
      observation: parsed.data.observation || null,
      activity_date: parsed.data.activityDate,
      evidence_kind: parsed.data.evidenceKind,
      external_provider: parsed.data.externalProvider || null,
      privacy_notes: parsed.data.privacyNotes || null,
      created_by: actor.user.id,
      status: hasFiles ? "uploading" : "active",
      published_at: hasFiles ? null : new Date().toISOString()
    })
    .select("id")
    .single<{ id: string }>();

  if (entryError || !entry) {
    return NextResponse.json({ message: "No pudimos guardar la evidencia." }, { status: 500 });
  }

  if (parsed.data.externalUrl || parsed.data.caption) {
    const { error: mediaError } = await actor.supabase.from("portfolio_media").insert({
      entry_id: entry.id,
      family_id: student.family_id,
      kind: toMediaKind(parsed.data.evidenceKind),
      external_url: parsed.data.externalUrl || null,
      external_provider: parsed.data.externalProvider || null,
      caption: parsed.data.caption || null,
      access_notes: parsed.data.externalUrl
        ? "Enlace externo privado. Mantener restringido a los correos autorizados."
        : null,
      created_by: actor.user.id
    });

    if (mediaError) {
      return NextResponse.json(
        { message: "La entrada se guardó, pero no pudimos anexar el enlace externo." },
        { status: 207 }
      );
    }
  }

  await writeAuditEvent({
    supabase: actor.supabase,
    actorId: actor.user.id,
    familyId: student.family_id,
    eventName: hasFiles ? "portfolio_upload_started" : "portfolio_entry_published",
    metadata: { entryId: entry.id, studentId: student.id, fileCount: parsed.data.fileCount }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/alumnos/${student.id}`);

  return NextResponse.json({ id: entry.id, familyId: student.family_id, status: hasFiles ? "uploading" : "active" });
}

function toMediaKind(kind: z.infer<typeof portfolioEntrySchema>["evidenceKind"]) {
  if (kind === "photo") {
    return "image";
  }

  if (kind === "video") {
    return "external_video";
  }

  if (kind === "document" || kind === "link") {
    return "document";
  }

  return "note";
}
