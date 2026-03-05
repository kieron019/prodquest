create table if not exists public.app_users (
  id bigint generated always as identity primary key,
  clerk_user_id text not null unique,
  email text,
  display_name text,
  handle text,
  is_pro boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  id bigint generated always as identity primary key,
  clerk_user_id text not null,
  category text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  description text not null,
  proof_score integer not null default 0,
  score integer not null default 0,
  ai_summary text,
  created_at timestamptz not null default now()
);

create index if not exists idx_focus_sessions_user_created
  on public.focus_sessions (clerk_user_id, created_at desc);

alter table public.app_users enable row level security;
alter table public.focus_sessions enable row level security;

drop policy if exists "Users can read own profile" on public.app_users;
create policy "Users can read own profile"
  on public.app_users for select
  using (auth.jwt() ->> 'sub' = clerk_user_id);

drop policy if exists "Service role manages profiles" on public.app_users;
create policy "Service role manages profiles"
  on public.app_users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can read own sessions" on public.focus_sessions;
create policy "Users can read own sessions"
  on public.focus_sessions for select
  using (auth.jwt() ->> 'sub' = clerk_user_id);

drop policy if exists "Users can insert own sessions" on public.focus_sessions;
create policy "Users can insert own sessions"
  on public.focus_sessions for insert
  with check (auth.jwt() ->> 'sub' = clerk_user_id);

drop policy if exists "Service role manages sessions" on public.focus_sessions;
create policy "Service role manages sessions"
  on public.focus_sessions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
