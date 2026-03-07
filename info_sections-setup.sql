-- Info Sections (Ayuda rápida) - Supabase setup
-- Creates table `info_sections` used by InfoManager + /preguntas-frecuentes

create table if not exists public.info_sections (
  id text primary key,
  content text,
  enabled boolean not null default false,
  lastEdited timestamptz,
  lastEditedBy text,
  version int not null default 1,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_info_sections_updated_at on public.info_sections;
create trigger trg_info_sections_updated_at
before update on public.info_sections
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.info_sections enable row level security;

-- Read: allow everyone (needed to show Ayuda rápida page publicly)
drop policy if exists "info_sections_read_all" on public.info_sections;
create policy "info_sections_read_all"
on public.info_sections
for select
using (true);

-- Write: only admins (users.is_admin = true OR admin email)
-- Assumes you have a `public.users` table keyed by UUID = auth.uid()
drop policy if exists "info_sections_write_admin" on public.info_sections;
create policy "info_sections_write_admin"
on public.info_sections
for all
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
      and (users.is_admin = true or users.email in ('admin@gmail.com','admin@tienda.com'))
  )
)
with check (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
      and (users.is_admin = true or users.email in ('admin@gmail.com','admin@tienda.com'))
  )
);

-- Seed row (optional, safe)
insert into public.info_sections (id, content, enabled)
values ('faqs', '', false)
on conflict (id) do nothing;

