-- Run this in your Supabase SQL editor

create table players (
  id uuid primary key default gen_random_uuid(),
  passphrase_hash text unique not null,
  xp integer not null default 0,
  streak integer not null default 0,
  last_active date not null default current_date,
  current_level integer not null default 1,
  preferred_voice text not null default 'browser',
  created_at timestamptz not null default now()
);

create table word_progress (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  word_id integer not null,
  strength integer not null default 0,
  next_review timestamptz not null default now(),
  attempts integer not null default 0,
  correct integer not null default 0,
  unique(player_id, word_id)
);

-- Row-level security (allow all via anon key for now)
alter table players enable row level security;
alter table word_progress enable row level security;

create policy "Allow all on players" on players for all using (true) with check (true);
create policy "Allow all on word_progress" on word_progress for all using (true) with check (true);
