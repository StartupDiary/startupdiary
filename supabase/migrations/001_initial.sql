-- profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  handle text unique,
  display_name text,
  public_profile boolean default false,
  created_at timestamptz default now()
);

-- diary_entries table
create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  entry_type text default 'text',
  mood_score float,
  mood_label text,
  themes text[],
  ai_insight text,
  is_milestone boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table diary_entries enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Public profiles viewable by all" on profiles for select using (public_profile = true);

create policy "Users can read own entries" on diary_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on diary_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on diary_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on diary_entries for delete using (auth.uid() = user_id);

create policy "Public entry mood data viewable" on diary_entries for select using (
  exists (
    select 1 from profiles
    where profiles.id = diary_entries.user_id
    and profiles.public_profile = true
  )
);
