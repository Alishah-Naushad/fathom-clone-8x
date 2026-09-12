create table meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date timestamptz not null,
  duration_minutes int not null,
  participant_count int not null,
  participants text[] not null default '{}',
  meeting_type text not null default 'enhanced',
  created_at timestamptz default now()
);

create table transcript_lines (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  speaker text not null,
  timestamp_seconds int not null,
  text text not null,
  line_order int not null
);

create table summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  template text not null,
  content text not null,
  created_at timestamptz default now(),
  unique (meeting_id, template)
);

create table action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  text text not null,
  owner text,
  is_done boolean default false
);

create table highlights (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  transcript_line_id uuid not null references transcript_lines(id) on delete cascade,
  note text
);

create index idx_transcript_lines_meeting_id on transcript_lines(meeting_id);
create index idx_action_items_meeting_id on action_items(meeting_id);
create index idx_summaries_meeting_id on summaries(meeting_id);
create index idx_highlights_meeting_id on highlights(meeting_id);

alter table meetings enable row level security;
alter table transcript_lines enable row level security;
alter table summaries enable row level security;
alter table action_items enable row level security;
alter table highlights enable row level security;

create policy "public read" on meetings for select using (true);
create policy "public read" on transcript_lines for select using (true);
create policy "public read" on summaries for select using (true);
create policy "public read" on action_items for select using (true);
create policy "public read" on highlights for select using (true);