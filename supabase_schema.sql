-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Create notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  content text not null check (char_length(content) <= 280),
  is_processed boolean default false, -- True if included in an Undercurrent
  created_at timestamptz default now()
);

-- Create undercurrents table
create table public.undercurrents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  summary_text text not null, -- The thematic synthesis
  questions jsonb not null, -- Array of strings ["Question 1?", "Question 2?"]
  notes_included uuid[] not null, -- Array of note_ids used to generate this
  sentiment_colors text[] default ARRAY['#1e3a5f', '#2d5a7c', '#3d7a9c', '#4d9abc'], -- 4 hex colors for emotional palette
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.undercurrents enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Notes policies
create policy "Users can view own notes"
  on notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert own notes"
  on notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own notes"
  on notes for update
  using ( auth.uid() = user_id );

-- Undercurrents policies
create policy "Users can view own undercurrents"
  on undercurrents for select
  using ( auth.uid() = user_id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
