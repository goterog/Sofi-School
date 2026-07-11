import { redirect } from "next/navigation";
import { StudentPortfolio } from "@/components/dashboard/student-portfolio";
import { demoDashboardData } from "@/lib/demo-data";
import { getCurrentSession } from "@/lib/supabase/server";

export default async function StudentPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  if (session.configured && !session.user) {
    redirect(`/login?redirectedFrom=/dashboard/alumnos/${params.id}`);
  }

  if (!session.configured || !session.supabase) {
    const demoStudent = demoDashboardData.students.find((student) => student.id === params.id) || demoDashboardData.students[0];
    return <StudentPortfolio student={demoStudent} entries={demoDashboardData.entries.map((entry) => ({ ...entry, student_name: demoStudent.full_name, author_name: "Vista previa", can_edit: false, status: "active" }))} areas={demoDashboardData.areas} topics={demoDashboardData.topics} configured={false} />;
  }

  const { data: student } = await session.supabase
    .from("students")
    .select("id,family_id,full_name,birth_year,stage")
    .eq("id", params.id)
    .maybeSingle();

  const { data: entries } = await session.supabase
    .from("portfolio_entries")
    .select("id,student_id,area_id,topic_id,title,summary,observation,activity_date,evidence_kind,external_provider,privacy_notes,created_at,created_by,status,learning_areas(name),learning_topics(name),periods(label),portfolio_media(id),profiles!portfolio_entries_created_by_fkey(full_name,email)")
    .eq("student_id", params.id)
    .eq("status", "active")
    .order("activity_date", { ascending: false })
    .limit(20);

  const [{ data: areas }, { data: topics }] = await Promise.all([
    session.supabase.from("learning_areas").select("id,name").order("display_order"),
    session.supabase.from("learning_topics").select("id,area_id,name").order("display_order")
  ]);

  const normalizedEntries = (entries || []).map((entry) => {
    const area = Array.isArray(entry.learning_areas) ? entry.learning_areas[0] : entry.learning_areas;
    const topic = Array.isArray(entry.learning_topics) ? entry.learning_topics[0] : entry.learning_topics;
    const period = Array.isArray(entry.periods) ? entry.periods[0] : entry.periods;
    const author = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;

    return {
      id: entry.id,
      student_id: entry.student_id,
      area: area?.name || "Área sin asignar",
      area_id: entry.area_id || "",
      topic: topic?.name || "Submateria sin asignar",
      topic_id: entry.topic_id || "",
      period: period?.label || "Periodo abierto",
      title: entry.title,
      summary: entry.summary || "",
      observation: entry.observation || "",
      activity_date: entry.activity_date,
      evidence_kind: entry.evidence_kind,
      external_provider: entry.external_provider || "",
      privacy_notes: entry.privacy_notes || "",
      media_count: entry.portfolio_media?.length || 0,
      created_at: entry.created_at,
      student_name: student?.full_name || "Alumno",
      author_name: author?.full_name || author?.email || "Usuario autorizado",
      can_edit: entry.created_by === session.user?.id || session.profile?.role === "admin",
      status: entry.status
    };
  });

  return (
    <StudentPortfolio configured student={student} entries={normalizedEntries} areas={areas || []} topics={topics || []} />
  );
}
