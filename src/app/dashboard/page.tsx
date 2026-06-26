import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { demoDashboardData } from "@/lib/demo-data";
import { getCurrentSession } from "@/lib/supabase/server";

type FamilyRow = { id: string; name: string; city: string | null };
type StudentRow = { id: string; family_id: string; full_name: string; birth_year: number | null; stage: string | null };

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (session.configured && !session.user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  if (!session.configured || !session.supabase || !session.user) {
    return <DashboardShell data={demoDashboardData} configured={false} />;
  }

  const data = await loadDashboardData(session.supabase, session.profile?.role || "parent", session.user.id, session.profile?.full_name || session.user.email || "Familia");

  return <DashboardShell data={data} configured />;
}

async function loadDashboardData(
  supabase: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>["supabase"]>,
  role: "admin" | "parent",
  userId: string,
  profileName: string
) {
  const familiesQuery =
    role === "admin"
      ? supabase.from("families").select("id,name,city").order("created_at", { ascending: false }).limit(8)
      : supabase
          .from("family_members")
          .select("families(id,name,city)")
          .eq("user_id", userId)
          .limit(8);

  const [{ data: familiesData }, { data: resourcesData }] = await Promise.all([
    familiesQuery,
    supabase.from("resources").select("id,title,category,kind").eq("status", "published").limit(8)
  ]);

  const families: FamilyRow[] =
    role === "admin"
      ? ((familiesData || []) as FamilyRow[])
      : ((familiesData || []) as Array<{ families: FamilyRow | FamilyRow[] | null }>)
          .flatMap((row) => {
            if (Array.isArray(row.families)) {
              return row.families;
            }
            return row.families ? [row.families] : [];
          })
          .filter(Boolean);

  const familyIds = families.map((family) => family.id);

  const [{ data: studentsData }, { data: entriesData }] = familyIds.length
    ? await Promise.all([
        supabase.from("students").select("id,family_id,full_name,birth_year,stage").in("family_id", familyIds).limit(12),
        supabase
          .from("portfolio_entries")
          .select("id,student_id,title,summary,created_at,learning_areas(name),periods(label),portfolio_media(id)")
          .in("family_id", familyIds)
          .order("created_at", { ascending: false })
          .limit(10)
      ])
    : [{ data: [] }, { data: [] }];

  return {
    mode: "live" as const,
    profileName,
    families,
    students: (studentsData || []) as StudentRow[],
    entries: ((entriesData || []) as Array<{
      id: string;
      student_id: string;
      title: string;
      summary: string | null;
      created_at: string;
      learning_areas: { name: string } | { name: string }[] | null;
      periods: { label: string } | { label: string }[] | null;
      portfolio_media: Array<{ id: string }> | null;
    }>).map((entry) => {
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
    }),
    resources: resourcesData || []
  };
}
