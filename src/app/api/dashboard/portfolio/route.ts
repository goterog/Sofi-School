import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  privacyNotes: z.string().max(500).optional().or(z.literal(""))
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

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase no está configurado." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Inicia sesión para guardar evidencias." }, { status: 401 });
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id,family_id")
    .eq("id", parsed.data.studentId)
    .maybeSingle<{ id: string; family_id: string }>();

  if (studentError || !student) {
    return NextResponse.json({ message: "No encontramos ese alumno para tu familia." }, { status: 404 });
  }

  const { data: entry, error: entryError } = await supabase
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
      created_by: user.id
    })
    .select("id")
    .single<{ id: string }>();

  if (entryError || !entry) {
    return NextResponse.json({ message: "No pudimos guardar la evidencia." }, { status: 500 });
  }

  if (parsed.data.externalUrl || parsed.data.caption) {
    const { error: mediaError } = await supabase.from("portfolio_media").insert({
      entry_id: entry.id,
      family_id: student.family_id,
      kind: toMediaKind(parsed.data.evidenceKind),
      external_url: parsed.data.externalUrl || null,
      external_provider: parsed.data.externalProvider || null,
      caption: parsed.data.caption || null,
      access_notes: parsed.data.externalUrl
        ? "Enlace externo privado. Mantener restringido a los correos autorizados."
        : null,
      created_by: user.id
    });

    if (mediaError) {
      return NextResponse.json(
        { message: "La entrada se guardó, pero no pudimos anexar el enlace externo." },
        { status: 207 }
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/alumnos/${student.id}`);

  return NextResponse.json({ id: entry.id });
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
