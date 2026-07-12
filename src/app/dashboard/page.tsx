import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { demoDashboardData } from "@/lib/demo-data";
import { getCurrentSession } from "@/lib/supabase/server";

type FamilyRow = { id: string; name: string; city: string | null; status: string };
type StudentRow = { id: string; family_id: string; full_name: string; birth_year: number | null; stage: string | null; status: string };
type AreaRow = { id: string; slug: string; name: string; description: string | null };
type TopicRow = { id: string; area_id: string; slug: string; name: string; description: string | null };
type GuideRow = {
  id: string;
  area_id: string;
  topic_id: string | null;
  title: string;
  objective: string;
  age_range: string;
  materials: string[];
  steps: string[];
  evidence_prompt: string | null;
  status: string;
  learning_areas: { name: string } | { name: string }[] | null;
  learning_topics: { name: string } | { name: string }[] | null;
};
type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  kind: string | null;
  source_name: string | null;
  audience: string | null;
  external_url: string | null;
  access_notes: string | null;
  area_id: string | null;
  topic_id: string | null;
  status: string;
  storage_path: string | null;
  learning_areas: { name: string } | { name: string }[] | null;
  learning_topics: { name: string } | { name: string }[] | null;
};
type EntryRow = {
  id: string;
  student_id: string;
  area_id: string | null;
  topic_id: string | null;
  title: string;
  summary: string | null;
  observation: string | null;
  activity_date: string;
  evidence_kind: "note" | "photo" | "video" | "document" | "link";
  external_provider: string | null;
  privacy_notes: string | null;
  created_at: string;
  learning_areas: { name: string } | { name: string }[] | null;
  learning_topics: { name: string } | { name: string }[] | null;
  periods: { label: string } | { label: string }[] | null;
  portfolio_media: Array<{ id: string }> | null;
  created_by: string | null;
  status: string;
  profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
};
type ConsentRow = {
  id: string;
  family_id: string;
  consent_name: string;
  consent_version: string;
  accepted: boolean;
  accepted_at: string;
  revoked_at: string | null;
};
type InvitationRow = {
  id: string;
  email: string;
  family_id: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  accepted_at: string | null;
};

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (session.configured && !session.user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  if (!session.configured || !session.supabase || !session.user) {
    return <DashboardShell data={demoDashboardData} configured={false} />;
  }

  const data = await loadDashboardData(session.supabase, session.profile?.role || "parent", session.user.id, session.profile?.full_name || session.user.email || "Familia");
  const metadata = session.user.user_metadata || {};

  return <DashboardShell data={{ ...data, profileEmail: session.user.email || "", avatarUrl: String(metadata.avatar_url || metadata.picture || "") }} configured />;
}

async function loadDashboardData(
  supabase: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>["supabase"]>,
  role: "admin" | "parent",
  userId: string,
  profileName: string
) {
  const familiesQuery =
    role === "admin"
      ? supabase.from("families").select("id,name,city,status").eq("status", "active").order("created_at", { ascending: false }).limit(100)
      : supabase
          .from("family_members")
          .select("families(id,name,city,status)")
          .eq("user_id", userId)
          .limit(8);

  const [{ data: familiesData }, { data: areasData }, { data: topicsData }, { data: guidesData }, { data: resourcesData }] = await Promise.all([
    familiesQuery,
    supabase.from("learning_areas").select("id,slug,name,description").order("display_order", { ascending: true }),
    supabase.from("learning_topics").select("id,area_id,slug,name,description").order("display_order", { ascending: true }),
    supabase
      .from("activity_guides")
      .select("id,area_id,topic_id,title,objective,age_range,materials,steps,evidence_prompt,status,learning_areas(name),learning_topics(name)")
      .in("status", role === "admin" ? ["draft", "published", "archived"] : ["published"])
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("resources")
      .select("id,title,description,category,kind,area_id,topic_id,source_name,audience,external_url,storage_path,access_notes,status,learning_areas(name),learning_topics(name)")
      .in("status", role === "admin" ? ["draft", "published", "archived"] : ["published"])
      .limit(100)
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
          .filter((family): family is FamilyRow => Boolean(family) && family.status !== "archived");

  const familyIds = families.map((family) => family.id);

  const [{ data: studentsData }, { data: entriesData }, { data: consentsData }, { data: invitationsData }] = familyIds.length
    ? await Promise.all([
        supabase.from("students").select("id,family_id,full_name,birth_year,stage,status").in("family_id", familyIds).eq("status", "active").limit(100),
        supabase
          .from("portfolio_entries")
          .select("id,student_id,area_id,topic_id,title,summary,observation,activity_date,evidence_kind,external_provider,privacy_notes,created_at,created_by,status,learning_areas(name),learning_topics(name),periods(label),portfolio_media(id),profiles!portfolio_entries_created_by_fkey(full_name,email)")
          .in("family_id", familyIds)
          .order("activity_date", { ascending: false })
          .limit(250),
        supabase
          .from("privacy_consents")
          .select("id,family_id,consent_name,consent_version,accepted,accepted_at,revoked_at")
          .in("family_id", familyIds)
          .order("accepted_at", { ascending: false })
          .limit(10),
        supabase
          .from("invitations")
          .select("id,email,family_id,status,expires_at,created_at,accepted_at")
          .order("created_at", { ascending: false })
          .limit(role === "admin" ? 20 : 5)
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const normalizedResources = await Promise.all(((resourcesData || []) as ResourceRow[]).map(async (resource) => {
    const area = Array.isArray(resource.learning_areas) ? resource.learning_areas[0] : resource.learning_areas;
    const topic = Array.isArray(resource.learning_topics) ? resource.learning_topics[0] : resource.learning_topics;
    const signed = resource.storage_path
      ? await supabase.storage.from("resource-files").createSignedUrl(resource.storage_path, 15 * 60)
      : { data: null };
    return {
      id: resource.id, title: resource.title, description: resource.description || "", category: resource.category,
      kind: resource.kind, area: area?.name || "General", area_id: resource.area_id || "",
      topic: topic?.name || "General", topic_id: resource.topic_id || "", source_name: resource.source_name || "",
      audience: resource.audience || "", external_url: resource.external_url || "", storage_path: resource.storage_path || "",
      file_url: signed.data?.signedUrl || "", access_notes: resource.access_notes || "", status: resource.status
    };
  }));

  return {
    mode: "live" as const,
    profileName,
    role,
    families,
    students: (studentsData || []) as StudentRow[],
    areas: (areasData || []) as AreaRow[],
    topics: (topicsData || []) as TopicRow[],
    guides: ((guidesData || []) as GuideRow[]).map((guide) => {
      const area = Array.isArray(guide.learning_areas) ? guide.learning_areas[0] : guide.learning_areas;
      const topic = Array.isArray(guide.learning_topics) ? guide.learning_topics[0] : guide.learning_topics;

      return {
        id: guide.id,
        area_id: guide.area_id,
        topic_id: guide.topic_id,
        area: area?.name || "Área general",
        topic: topic?.name || "Submateria general",
        title: guide.title,
        objective: guide.objective,
        age_range: guide.age_range,
        materials: guide.materials || [],
        steps: guide.steps || [],
        evidence_prompt: guide.evidence_prompt || "",
        status: guide.status
      };
    }),
    entries: normalizeEntries((entriesData || []) as EntryRow[]).filter((entry) => entry.status === "active"),
    archivedEntries: role === "admin" ? normalizeEntries((entriesData || []) as EntryRow[]).filter((entry) => entry.status === "archived") : [],
    resources: normalizedResources,
    consents: (consentsData || []) as ConsentRow[],
    invitations: (invitationsData || []) as InvitationRow[]
  };

  function normalizeEntries(rows: EntryRow[]) {
    return rows.map((entry) => {
      const area = Array.isArray(entry.learning_areas) ? entry.learning_areas[0] : entry.learning_areas;
      const topic = Array.isArray(entry.learning_topics) ? entry.learning_topics[0] : entry.learning_topics;
      const period = Array.isArray(entry.periods) ? entry.periods[0] : entry.periods;
      const author = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
      const student = ((studentsData || []) as StudentRow[]).find((item) => item.id === entry.student_id);

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
        can_edit: entry.created_by === userId || role === "admin",
        status: entry.status
      };
    });
  }
}
