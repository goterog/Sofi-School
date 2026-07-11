-- Sofi School operational dashboard v2
-- Apply to staging first, validate through a Vercel Preview, then apply to production.

alter table public.families
  add column if not exists status text not null default 'active'
    check (status in ('active', 'archived')),
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null;

alter table public.students
  add column if not exists status text not null default 'active'
    check (status in ('active', 'archived')),
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null;

alter table public.portfolio_entries
  add column if not exists status text not null default 'active'
    check (status in ('uploading', 'active', 'archived')),
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id) on delete set null;

update public.portfolio_entries
set published_at = coalesce(published_at, created_at)
where status = 'active';

alter table public.portfolio_media
  add column if not exists original_name text,
  add column if not exists display_order integer not null default 0,
  add column if not exists removed_at timestamptz,
  add column if not exists removed_by uuid references public.profiles(id) on delete set null;

alter table public.portfolio_media drop constraint if exists portfolio_media_location;
alter table public.portfolio_media add constraint portfolio_media_location check (
  removed_at is not null or storage_path is not null or external_url is not null or kind = 'note'
);

create index if not exists families_status_idx on public.families(status, created_at desc);
create index if not exists students_status_family_idx on public.students(status, family_id);
create index if not exists portfolio_entries_status_activity_idx
  on public.portfolio_entries(status, family_id, activity_date desc);
create index if not exists portfolio_media_entry_order_idx
  on public.portfolio_media(entry_id, display_order);

-- Families only see active portfolio entries. Admins can inspect the archive.
drop policy if exists "portfolio_entries_family_select" on public.portfolio_entries;
create policy "portfolio_entries_active_family_or_admin_select"
on public.portfolio_entries for select
to authenticated
using (
  public.current_user_is_admin()
  or (status = 'active' and public.can_access_family(family_id))
  or (status = 'uploading' and created_by = auth.uid())
);

drop policy if exists "portfolio_media_family_select" on public.portfolio_media;
create policy "portfolio_media_active_family_or_admin_select"
on public.portfolio_media for select
to authenticated
using (
  public.current_user_is_admin()
  or (
    removed_at is null
    and public.can_access_family(family_id)
    and exists (
      select 1 from public.portfolio_entries entry
      where entry.id = entry_id and entry.status in ('active', 'uploading')
    )
  )
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

-- Storage objects are named family-id/entry-id/random-name.
drop policy if exists "portfolio_evidence_family_delete" on storage.objects;
create policy "portfolio_evidence_family_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'portfolio-evidence'
  and (
    public.current_user_is_admin()
    or exists (
      select 1
      from public.portfolio_media media
      join public.portfolio_entries entry on entry.id = media.entry_id
      where media.storage_path = name
        and media.created_by = auth.uid()
        and entry.created_by = auth.uid()
    )
    or exists (
      select 1 from public.portfolio_entries entry
      where entry.id::text = (storage.foldername(name))[2]
        and entry.created_by = auth.uid()
        and entry.status = 'uploading'
    )
  )
);

drop policy if exists "resource_files_admin_delete" on storage.objects;
create policy "resource_files_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'resource-files' and public.current_user_is_admin());

-- Consent rows are append-only. A new legal version produces a new row.
drop policy if exists "privacy_consents_guardian_update" on public.privacy_consents;
drop policy if exists "privacy_consents_delete" on public.privacy_consents;

create or replace function public.has_current_portfolio_consent(target_family_id uuid, target_version text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.privacy_consents consent
    where consent.family_id = target_family_id
      and consent.guardian_user_id = auth.uid()
      and consent.consent_name = 'uso-imagenes-videos-menores'
      and consent.consent_version = target_version
      and consent.accepted = true
  );
$$;

grant execute on function public.has_current_portfolio_consent(uuid, text) to authenticated;
