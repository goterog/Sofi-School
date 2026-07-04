do $$ begin
  create type public.evidence_kind as enum ('note', 'photo', 'video', 'document', 'link');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.learning_topics (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.learning_areas(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, slug)
);

create table if not exists public.activity_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  area_id uuid not null references public.learning_areas(id) on delete cascade,
  topic_id uuid references public.learning_topics(id) on delete set null,
  title text not null,
  objective text not null,
  age_range text not null default '3-6 años',
  materials text[] not null default '{}',
  steps text[] not null default '{}',
  evidence_prompt text,
  status public.resource_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  family_id uuid references public.families(id) on delete cascade,
  role public.member_role not null default 'parent',
  status public.invitation_status not null default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  guardian_user_id uuid not null references public.profiles(id) on delete cascade,
  consent_name text not null,
  consent_version text not null default '2026-07-04',
  accepted boolean not null default true,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (family_id, guardian_user_id, consent_name, consent_version)
);

alter table public.resources
  add column if not exists slug text,
  add column if not exists area_id uuid references public.learning_areas(id) on delete set null,
  add column if not exists topic_id uuid references public.learning_topics(id) on delete set null,
  add column if not exists source_name text,
  add column if not exists audience text,
  add column if not exists access_notes text;

alter table public.portfolio_entries
  add column if not exists activity_date date not null default current_date,
  add column if not exists topic_id uuid references public.learning_topics(id) on delete set null,
  add column if not exists evidence_kind public.evidence_kind not null default 'note',
  add column if not exists external_provider text,
  add column if not exists privacy_notes text;

alter table public.portfolio_media
  add column if not exists external_provider text,
  add column if not exists access_notes text,
  add column if not exists shared_with_emails text[] not null default '{}';

create unique index if not exists resources_slug_unique_idx
on public.resources(slug);

create unique index if not exists invitations_pending_email_unique_idx
on public.invitations(lower(email))
where status = 'pending';

create index if not exists learning_topics_area_order_idx on public.learning_topics(area_id, display_order);
create index if not exists activity_guides_area_status_idx on public.activity_guides(area_id, status);
create index if not exists activity_guides_topic_status_idx on public.activity_guides(topic_id, status);
create index if not exists portfolio_entries_activity_date_idx on public.portfolio_entries(family_id, activity_date desc);
create index if not exists privacy_consents_family_guardian_idx on public.privacy_consents(family_id, guardian_user_id);

drop trigger if exists learning_topics_touch_updated_at on public.learning_topics;
create trigger learning_topics_touch_updated_at
before update on public.learning_topics
for each row execute function public.touch_updated_at();

drop trigger if exists activity_guides_touch_updated_at on public.activity_guides;
create trigger activity_guides_touch_updated_at
before update on public.activity_guides
for each row execute function public.touch_updated_at();

drop trigger if exists invitations_touch_updated_at on public.invitations;
create trigger invitations_touch_updated_at
before update on public.invitations
for each row execute function public.touch_updated_at();

alter table public.learning_topics enable row level security;
alter table public.activity_guides enable row level security;
alter table public.invitations enable row level security;
alter table public.privacy_consents enable row level security;

drop policy if exists "learning_topics_read" on public.learning_topics;
create policy "learning_topics_read"
on public.learning_topics for select
to authenticated
using (true);

drop policy if exists "learning_topics_admin_write" on public.learning_topics;
create policy "learning_topics_admin_write"
on public.learning_topics for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "activity_guides_published_read" on public.activity_guides;
create policy "activity_guides_published_read"
on public.activity_guides for select
to authenticated
using (status = 'published' or public.current_user_is_admin());

drop policy if exists "activity_guides_admin_write" on public.activity_guides;
create policy "activity_guides_admin_write"
on public.activity_guides for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "invitations_admin_all" on public.invitations;
create policy "invitations_admin_all"
on public.invitations for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "invitations_select_own_email" on public.invitations;
create policy "invitations_select_own_email"
on public.invitations for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) or public.current_user_is_admin());

drop policy if exists "invitations_auth_hook_read" on public.invitations;
create policy "invitations_auth_hook_read"
on public.invitations for select
to supabase_auth_admin
using (status = 'pending' and (expires_at is null or expires_at > now()));

drop policy if exists "privacy_consents_family_select" on public.privacy_consents;
create policy "privacy_consents_family_select"
on public.privacy_consents for select
to authenticated
using (public.can_access_family(family_id));

drop policy if exists "privacy_consents_family_insert" on public.privacy_consents;
create policy "privacy_consents_family_insert"
on public.privacy_consents for insert
to authenticated
with check (
  public.can_access_family(family_id)
  and guardian_user_id = auth.uid()
);

drop policy if exists "privacy_consents_guardian_update" on public.privacy_consents;
create policy "privacy_consents_guardian_update"
on public.privacy_consents for update
to authenticated
using (guardian_user_id = auth.uid() or public.current_user_is_admin())
with check (
  public.can_access_family(family_id)
  and (guardian_user_id = auth.uid() or public.current_user_is_admin())
);

drop policy if exists "portfolio_entries_family_insert" on public.portfolio_entries;
create policy "portfolio_entries_family_insert"
on public.portfolio_entries for insert
to authenticated
with check (
  public.can_access_family(family_id)
  and created_by = auth.uid()
);

drop policy if exists "portfolio_entries_owner_or_admin_update" on public.portfolio_entries;
create policy "portfolio_entries_owner_or_admin_update"
on public.portfolio_entries for update
to authenticated
using (
  public.can_access_family(family_id)
  and (created_by = auth.uid() or public.current_user_is_admin())
)
with check (
  public.can_access_family(family_id)
  and (created_by = auth.uid() or public.current_user_is_admin())
);

drop policy if exists "portfolio_media_family_insert" on public.portfolio_media;
create policy "portfolio_media_family_insert"
on public.portfolio_media for insert
to authenticated
with check (
  public.can_access_family(family_id)
  and created_by = auth.uid()
);

drop policy if exists "portfolio_media_owner_or_admin_update" on public.portfolio_media;
create policy "portfolio_media_owner_or_admin_update"
on public.portfolio_media for update
to authenticated
using (
  public.can_access_family(family_id)
  and (created_by = auth.uid() or public.current_user_is_admin())
)
with check (
  public.can_access_family(family_id)
  and (created_by = auth.uid() or public.current_user_is_admin())
);

grant usage on schema public to supabase_auth_admin;
grant select on public.invitations to supabase_auth_admin;

create or replace function public.hook_require_invitation(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  requested_email text;
  invited_count integer;
begin
  requested_email := lower(coalesce(event -> 'user' ->> 'email', ''));

  if requested_email = '' then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 403,
        'message', 'Se requiere una invitación válida para crear una cuenta.'
      )
    );
  end if;

  select count(*) into invited_count
  from public.invitations
  where lower(email) = requested_email
    and status = 'pending'
    and (expires_at is null or expires_at > now());

  if invited_count > 0 then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error',
    jsonb_build_object(
      'http_code', 403,
      'message', 'Esta cuenta no tiene una invitación activa.'
    )
  );
end;
$$;

grant execute on function public.hook_require_invitation(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_require_invitation(jsonb) from authenticated, anon, public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matching_invitation public.invitations%rowtype;
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'parent')
  )
  on conflict (id) do nothing;

  select * into matching_invitation
  from public.invitations
  where lower(email) = lower(coalesce(new.email, ''))
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  order by created_at desc
  limit 1;

  if matching_invitation.id is not null then
    update public.invitations
    set status = 'accepted',
        accepted_by = new.id,
        accepted_at = now()
    where id = matching_invitation.id;

    if matching_invitation.family_id is not null then
      insert into public.family_members (family_id, user_id, role, invited_by)
      values (matching_invitation.family_id, new.id, matching_invitation.role, matching_invitation.invited_by)
      on conflict (family_id, user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

insert into public.learning_topics (area_id, slug, name, description, display_order)
select id, 'letras-numeros-simbolos', 'Letras, números y símbolos', 'Reconocimiento temprano de signos, conteo y asociación visual.', 10
from public.learning_areas where slug = 'lenguaje-comunicacion'
on conflict (area_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into public.learning_topics (area_id, slug, name, description, display_order)
select id, 'jardineria-huerto', 'Jardinería y huerto en casa', 'Observación, cuidado de plantas y ciclos naturales.', 10
from public.learning_areas where slug = 'ecologia-sustentabilidad'
on conflict (area_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into public.learning_topics (area_id, slug, name, description, display_order)
select id, 'nutricion-cocina', 'Nutrición, alimentación y cocina', 'Preparación simple de alimentos, hábitos de higiene y medidas.', 10
from public.learning_areas where slug = 'salud-bienestar'
on conflict (area_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into public.learning_topics (area_id, slug, name, description, display_order)
select id, 'manualidades-construccion', 'Manualidades y construcción', 'Creación con materiales cotidianos, coordinación y resolución de problemas.', 10
from public.learning_areas where slug = 'creatividad-imaginacion'
on conflict (area_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

insert into public.activity_guides (
  slug,
  area_id,
  topic_id,
  title,
  objective,
  materials,
  steps,
  evidence_prompt,
  status
)
select
  'actividad-con-plantas-cuidar-una-semilla',
  areas.id,
  topics.id,
  'Actividad con plantas: cuidar una semilla',
  'Observar cómo una semilla cambia con el cuidado diario y conectar responsabilidad, paciencia y naturaleza.',
  array['Semillas de frijol o lenteja', 'Algodón o tierra', 'Frasco o maceta pequeña', 'Agua', 'Hoja de observación'],
  array[
    'Preparar el frasco o maceta junto con el niño.',
    'Colocar la semilla y hablar de lo que necesita una planta para vivir.',
    'Regar con poca agua y ubicarla en un lugar iluminado.',
    'Observar cambios durante varios días y dibujar o contar lo que pasó.'
  ],
  'Registrar una nota breve, una foto inicial y otra foto cuando aparezca el brote. Los videos largos deben guardarse como enlace privado externo.',
  'published'
from public.learning_areas areas
join public.learning_topics topics on topics.area_id = areas.id and topics.slug = 'jardineria-huerto'
where areas.slug = 'ecologia-sustentabilidad'
on conflict (slug) do update set
  area_id = excluded.area_id,
  topic_id = excluded.topic_id,
  title = excluded.title,
  objective = excluded.objective,
  materials = excluded.materials,
  steps = excluded.steps,
  evidence_prompt = excluded.evidence_prompt,
  status = excluded.status;

insert into public.activity_guides (
  slug,
  area_id,
  topic_id,
  title,
  objective,
  materials,
  steps,
  evidence_prompt,
  status
)
select
  'tarjetas-de-numeros-con-objetos',
  areas.id,
  topics.id,
  'Tarjetas de números con objetos de casa',
  'Relacionar símbolos numéricos con cantidades reales usando objetos cotidianos.',
  array['Tarjetas del 1 al 10', 'Piedras, botones o juguetes pequeños', 'Mesa despejada'],
  array[
    'Elegir tres números para iniciar.',
    'Pedir al niño colocar la cantidad correcta de objetos junto a cada tarjeta.',
    'Cambiar el orden de las tarjetas y repetir con acompañamiento.',
    'Cerrar con una breve conversación sobre cuál número fue más fácil o difícil.'
  ],
  'Guardar una nota de observación y foto del acomodo final, evitando mostrar datos sensibles del hogar.',
  'published'
from public.learning_areas areas
join public.learning_topics topics on topics.area_id = areas.id and topics.slug = 'letras-numeros-simbolos'
where areas.slug = 'lenguaje-comunicacion'
on conflict (slug) do update set
  area_id = excluded.area_id,
  topic_id = excluded.topic_id,
  title = excluded.title,
  objective = excluded.objective,
  materials = excluded.materials,
  steps = excluded.steps,
  evidence_prompt = excluded.evidence_prompt,
  status = excluded.status;

insert into public.resources (
  slug,
  title,
  description,
  category,
  kind,
  area_id,
  topic_id,
  source_name,
  audience,
  access_notes,
  status
)
select
  'plantilla-observacion-plantas',
  'Plantilla de observación de plantas',
  'Formato para registrar fecha, dibujo, cambios observados y cuidado realizado.',
  'Plantilla',
  'Documento',
  areas.id,
  topics.id,
  'Sofi School',
  'Padres y niños',
  'Material interno ligero. Si se sube como archivo, usar bucket privado o enlace restringido.',
  'published'
from public.learning_areas areas
join public.learning_topics topics on topics.area_id = areas.id and topics.slug = 'jardineria-huerto'
where areas.slug = 'ecologia-sustentabilidad'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  kind = excluded.kind,
  area_id = excluded.area_id,
  topic_id = excluded.topic_id,
  source_name = excluded.source_name,
  audience = excluded.audience,
  access_notes = excluded.access_notes,
  status = excluded.status;

insert into public.resources (
  slug,
  title,
  description,
  category,
  kind,
  area_id,
  topic_id,
  source_name,
  audience,
  access_notes,
  status
)
select
  'tarjetas-numeros-1-10',
  'Tarjetas de números 1-10',
  'Material imprimible o replicable para asociar símbolo y cantidad.',
  'Tarjetas',
  'Plantilla',
  areas.id,
  topics.id,
  'Sofi School',
  'Padres y niños',
  'Guardar como PDF ligero o enlace privado si se personaliza con datos del niño.',
  'published'
from public.learning_areas areas
join public.learning_topics topics on topics.area_id = areas.id and topics.slug = 'letras-numeros-simbolos'
where areas.slug = 'lenguaje-comunicacion'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  kind = excluded.kind,
  area_id = excluded.area_id,
  topic_id = excluded.topic_id,
  source_name = excluded.source_name,
  audience = excluded.audience,
  access_notes = excluded.access_notes,
  status = excluded.status;
