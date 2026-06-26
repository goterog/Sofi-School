create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'parent');
create type public.member_role as enum ('parent');
create type public.media_kind as enum ('image', 'video', 'document', 'external_video', 'note');
create type public.resource_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'parent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'parent',
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  full_name text not null,
  birth_year integer check (birth_year between 2015 and 2035),
  stage text not null default '3-6 años',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  display_order integer not null default 0
);

create table public.periods (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  label text not null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create table public.portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  area_id uuid references public.learning_areas(id) on delete set null,
  period_id uuid references public.periods(id) on delete set null,
  title text not null,
  summary text,
  observation text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.portfolio_entries(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  kind public.media_kind not null,
  storage_path text,
  external_url text,
  caption text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes <= 104857600),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint portfolio_media_location check (storage_path is not null or external_url is not null or kind = 'note')
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete cascade,
  title text not null,
  description text,
  category text,
  kind text,
  storage_path text,
  external_url text,
  status public.resource_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resource_links (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  child_age_range text,
  message text not null,
  source text not null default 'web',
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  family_id uuid references public.families(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index family_members_user_id_idx on public.family_members(user_id);
create index students_family_id_idx on public.students(family_id);
create index periods_family_id_idx on public.periods(family_id);
create index portfolio_entries_family_student_idx on public.portfolio_entries(family_id, student_id);
create index portfolio_media_family_id_idx on public.portfolio_media(family_id);
create index resources_family_status_idx on public.resources(family_id, status);
create index audit_events_family_id_idx on public.audit_events(family_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger families_touch_updated_at
before update on public.families
for each row execute function public.touch_updated_at();

create trigger students_touch_updated_at
before update on public.students
for each row execute function public.touch_updated_at();

create trigger portfolio_entries_touch_updated_at
before update on public.portfolio_entries
for each row execute function public.touch_updated_at();

create trigger resources_touch_updated_at
before update on public.resources
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'parent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.can_access_family(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_admin()
  or exists (
    select 1
    from public.family_members
    where family_id = target_family_id
    and user_id = auth.uid()
  );
$$;

create or replace function public.can_access_resource_file(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select case
    when (storage.foldername(object_name))[1] = 'global'
      then auth.role() = 'authenticated'
    when (storage.foldername(object_name))[1] = 'family'
      then public.can_access_family(((storage.foldername(object_name))[2])::uuid)
    else false
  end;
$$;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.students enable row level security;
alter table public.learning_areas enable row level security;
alter table public.periods enable row level security;
alter table public.portfolio_entries enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.resources enable row level security;
alter table public.resource_links enable row level security;
alter table public.contact_requests enable row level security;
alter table public.audit_events enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_is_admin());

create policy "profiles_update_self_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.current_user_is_admin())
with check (id = auth.uid() or public.current_user_is_admin());

create policy "families_admin_all"
on public.families for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "families_select_members"
on public.families for select
to authenticated
using (public.can_access_family(id));

create policy "family_members_admin_all"
on public.family_members for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "family_members_select_own"
on public.family_members for select
to authenticated
using (user_id = auth.uid() or public.current_user_is_admin());

create policy "students_admin_all"
on public.students for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "students_family_select"
on public.students for select
to authenticated
using (public.can_access_family(family_id));

create policy "learning_areas_read"
on public.learning_areas for select
to authenticated
using (true);

create policy "learning_areas_admin_write"
on public.learning_areas for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "periods_admin_all"
on public.periods for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "periods_family_select"
on public.periods for select
to authenticated
using (public.can_access_family(family_id));

create policy "portfolio_entries_family_select"
on public.portfolio_entries for select
to authenticated
using (public.can_access_family(family_id));

create policy "portfolio_entries_family_insert"
on public.portfolio_entries for insert
to authenticated
with check (public.can_access_family(family_id));

create policy "portfolio_entries_owner_or_admin_update"
on public.portfolio_entries for update
to authenticated
using (created_by = auth.uid() or public.current_user_is_admin())
with check (public.can_access_family(family_id));

create policy "portfolio_media_family_select"
on public.portfolio_media for select
to authenticated
using (public.can_access_family(family_id));

create policy "portfolio_media_family_insert"
on public.portfolio_media for insert
to authenticated
with check (public.can_access_family(family_id));

create policy "portfolio_media_owner_or_admin_update"
on public.portfolio_media for update
to authenticated
using (created_by = auth.uid() or public.current_user_is_admin())
with check (public.can_access_family(family_id));

create policy "resources_admin_all"
on public.resources for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "resources_family_or_global_select"
on public.resources for select
to authenticated
using (
  status = 'published'
  and (family_id is null or public.can_access_family(family_id))
);

create policy "resource_links_read_accessible_resource"
on public.resource_links for select
to authenticated
using (
  exists (
    select 1
    from public.resources
    where resources.id = resource_links.resource_id
    and resources.status = 'published'
    and (resources.family_id is null or public.can_access_family(resources.family_id))
  )
);

create policy "resource_links_admin_all"
on public.resource_links for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "contact_requests_insert_public"
on public.contact_requests for insert
to anon, authenticated
with check (true);

create policy "contact_requests_admin_select"
on public.contact_requests for select
to authenticated
using (public.current_user_is_admin());

create policy "contact_requests_admin_update"
on public.contact_requests for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "audit_events_admin_select"
on public.audit_events for select
to authenticated
using (public.current_user_is_admin());

create policy "audit_events_authenticated_insert"
on public.audit_events for insert
to authenticated
with check (actor_id = auth.uid() or public.current_user_is_admin());

insert into public.learning_areas (slug, name, description, display_order)
values
  ('lenguaje-comunicacion', 'Lenguaje y comunicación', 'Letras, números, símbolos, lectura, gramática, matemáticas e idiomas.', 10),
  ('salud-bienestar', 'Salud y bienestar', 'Nutrición, cocina, ejercicio, baile, actividades al aire libre y gestión emocional.', 20),
  ('creatividad-imaginacion', 'Creatividad e imaginación', 'Arte, manualidades, construcción, espacio creativo y música instrumental.', 30),
  ('ecologia-sustentabilidad', 'Ecología y sustentabilidad', 'Jardinería, huerto en casa, reciclaje, medio ambiente y cuidado de recursos.', 40),
  ('vida-practica-social', 'Vida práctica y social', 'Habilidades domésticas, higiene personal y educación financiera.', 50),
  ('habilidades-sociales-etica', 'Habilidades sociales y ética', 'Interacción, comunicación efectiva, valores y resolución de conflictos.', 60),
  ('tecnologia-computacion', 'Tecnología y computación', 'Uso de dispositivos, plataformas digitales y herramientas modernas.', 70)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'portfolio-evidence',
    'portfolio-evidence',
    false,
    104857600,
    array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']
  ),
  (
    'resource-files',
    'resource-files',
    false,
    104857600,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4']
  )
on conflict (id) do nothing;

create policy "portfolio_evidence_family_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'portfolio-evidence'
  and public.can_access_family(((storage.foldername(name))[1])::uuid)
);

create policy "portfolio_evidence_family_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-evidence'
  and public.can_access_family(((storage.foldername(name))[1])::uuid)
);

create policy "resource_files_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resource-files'
  and public.can_access_resource_file(name)
);

create policy "resource_files_admin_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resource-files'
  and public.current_user_is_admin()
);
