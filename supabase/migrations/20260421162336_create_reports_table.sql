-- Reports schema for the Trail trial task.
-- Idempotent: can be re-applied safely against an empty database.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('draft', 'in_review', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_category') then
    create type public.report_category as enum ('growth', 'engineering', 'finance', 'product', 'research');
  end if;
end $$;

create table if not exists public.reports (
  id text primary key,
  title text not null,
  author text not null,
  category public.report_category not null,
  status public.report_status not null,
  summary text not null,
  body text not null,
  views integer not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_updated_at_idx on public.reports (updated_at desc);
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

drop policy if exists "reports are readable by everyone" on public.reports;
create policy "reports are readable by everyone"
  on public.reports for select
  to anon, authenticated
  using (true);
