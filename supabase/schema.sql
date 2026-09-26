-- ============================================================
-- Schema reconstructed from live Supabase database introspection
-- on 2026-09-26. Replaces the previously out-of-date schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

create table meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date timestamptz not null,
  duration_minutes int not null,
  participant_count int not null,
  participants text[] not null default '{}',
  meeting_type text not null default 'enhanced',
  created_at timestamptz default now(),
  thumbnail_url text,
  user_id uuid,
  audio_url text
);

create table transcript_lines (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  speaker text not null,
  timestamp_seconds int not null,
  text text not null,
  line_order int not null
);

create table summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  template text not null,
  content text not null,
  created_at timestamptz default now(),
  unique (meeting_id, template)
);

create table action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  text text not null,
  owner text,
  is_done boolean default false
);

create table highlights (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  transcript_line_id uuid references transcript_lines(id) on delete cascade,
  note text
);

create table meeting_bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  bot_id text not null unique,
  meeting_url text not null,
  calendar_event_id text,
  title text,
  status text not null default 'sent',
  meeting_id uuid references meetings(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  recording_started_at timestamptz,
  live_notes jsonb default '[]'::jsonb
);

create table google_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- Indexes
-- (primary keys / unique constraints create these automatically;
--  listed here for completeness since they appeared in the live dump)
-- ------------------------------------------------------------

create index idx_meeting_bots_user_id on meeting_bots(user_id);
create index idx_meeting_bots_meeting_id on meeting_bots(meeting_id);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table meetings enable row level security;
alter table transcript_lines enable row level security;
alter table summaries enable row level security;
alter table action_items enable row level security;
alter table highlights enable row level security;
alter table meeting_bots enable row level security;
alter table google_connections enable row level security;

-- ------------------------------------------------------------
-- Policies
-- ------------------------------------------------------------

-- meetings
create policy "users insert own meetings" on meetings
  for insert
  with check (auth.uid() = user_id);

create policy "users read own meetings" on meetings
  for select
  using (auth.uid() = user_id);

create policy "users update own meetings" on meetings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- transcript_lines
create policy "public insert" on transcript_lines
  for insert
  with check (true);

create policy "users insert own transcript lines" on transcript_lines
  for insert
  with check (
    exists (
      select 1 from meetings
      where meetings.id = transcript_lines.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

create policy "users read own transcript lines" on transcript_lines
  for select
  using (
    exists (
      select 1 from meetings
      where meetings.id = transcript_lines.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

-- summaries
create policy "users insert own summaries" on summaries
  for insert
  with check (
    exists (
      select 1 from meetings
      where meetings.id = summaries.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

create policy "users read own summaries" on summaries
  for select
  using (
    exists (
      select 1 from meetings
      where meetings.id = summaries.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

-- action_items
create policy "users insert own action items" on action_items
  for insert
  with check (
    exists (
      select 1 from meetings
      where meetings.id = action_items.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

create policy "users read own action items" on action_items
  for select
  using (
    exists (
      select 1 from meetings
      where meetings.id = action_items.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

create policy "users update own action items" on action_items
  for update
  using (
    exists (
      select 1 from meetings
      where meetings.id = action_items.meeting_id
      and meetings.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from meetings
      where meetings.id = action_items.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

-- highlights
create policy "users insert own highlights" on highlights
  for insert
  with check (
    exists (
      select 1 from meetings
      where meetings.id = highlights.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

create policy "users read own highlights" on highlights
  for select
  using (
    exists (
      select 1 from meetings
      where meetings.id = highlights.meeting_id
      and meetings.user_id = auth.uid()
    )
  );

-- meeting_bots
create policy "users read own meeting bots" on meeting_bots
  for select
  using (auth.uid() = user_id);

-- google_connections
-- NOTE: no policies found in the live introspection for this table.
-- RLS is enabled with zero policies, which means ALL access is
-- currently blocked (including for the owning user) unless your
-- app talks to this table exclusively via the Supabase service-role
-- key (which bypasses RLS). Confirm this is intentional — if your
-- webhook/admin client uses the service role for all google_connections
-- reads/writes, this is fine as-is. If any client-side code expects
-- to read/write this table as the authenticated user, you need a
-- policy such as:
--
-- create policy "users manage own google connection" on google_connections
--   for all
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);