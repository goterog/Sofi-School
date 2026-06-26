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
    return <StudentPortfolio data={demoDashboardData} studentId={params.id} configured={false} />;
  }

  const { data: student } = await session.supabase
    .from("students")
    .select("id,family_id,full_name,birth_year,stage")
    .eq("id", params.id)
    .maybeSingle();

  const { data: entries } = await session.supabase
    .from("portfolio_entries")
    .select("id,student_id,title,summary,created_at,learning_areas(name),periods(label),portfolio_media(id,kind,storage_path,external_url)")
    .eq("student_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const normalizedEntries = (entries || []).map((entry) => {
    const area = Array.isArray(entry.learning_areas) ? entry.learning_areas[0] : entry.learning_areas;
    const period = Array.isArray(entry.periods) ? entry.periods[0] : entry.periods;

    return {
      id: entry.id,
      student_id: entry.student_id,
      area: area?.name || "Área sin asignar",
      period: period?.label || "Periodo abierto",
      title: entry.title,
      summary: entry.summary || "",
      media_count: entry.portfolio_media?.length || 0,
      created_at: entry.created_at
    };
  });

  return (
    <StudentPortfolio
      configured
      studentId={params.id}
      data={{
        ...demoDashboardData,
        mode: "live",
        students: student ? [student] : [],
        entries: normalizedEntries
      }}
    />
  );
}
