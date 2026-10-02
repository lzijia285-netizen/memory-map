create extension if not exists pgcrypto with schema extensions;

create type public.memory_visibility as enum ('Only Me', 'Friends');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  label text,
  code_hash text not null unique,
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  event_time timestamptz not null,
  event_timezone text not null default 'Australia/Brisbane',
  location_name text not null,
  location_city text not null default '',
  location_country text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  mood text not null default '😊',
  mood_label text not null default 'A memory',
  visibility public.memory_visibility not null default 'Only Me',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memory_people (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  linked_user_id uuid references public.profiles(id) on delete set null,
  display_name text,
  constraint memory_person_has_identity check (linked_user_id is not null or nullif(trim(display_name), '') is not null)
);

create table public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table public.memory_likes (
  memory_id uuid not null references public.memories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, user_id)
);

create index memories_owner_event_idx on public.memories(owner_id, event_time desc);
create index memories_visibility_event_idx on public.memories(visibility, event_time desc);
create index memory_people_memory_idx on public.memory_people(memory_id);
create index memory_photos_memory_idx on public.memory_photos(memory_id, sort_order);

alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.memories enable row level security;
alter table public.memory_people enable row level security;
alter table public.memory_photos enable row level security;
alter table public.memory_likes enable row level security;

create policy "members read profiles" on public.profiles for select to authenticated using (true);
create policy "members update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "members read allowed memories" on public.memories for select to authenticated using (owner_id = auth.uid() or visibility = 'Friends');
create policy "members create own memories" on public.memories for insert to authenticated with check (owner_id = auth.uid());
create policy "owners update memories" on public.memories for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners delete memories" on public.memories for delete to authenticated using (owner_id = auth.uid());
create policy "members read allowed people" on public.memory_people for select to authenticated using (exists (select 1 from public.memories m where m.id = memory_id and (m.owner_id = auth.uid() or m.visibility = 'Friends')));
create policy "owners manage people" on public.memory_people for all to authenticated using (exists (select 1 from public.memories m where m.id = memory_id and m.owner_id = auth.uid())) with check (exists (select 1 from public.memories m where m.id = memory_id and m.owner_id = auth.uid()));
create policy "members read allowed photos" on public.memory_photos for select to authenticated using (exists (select 1 from public.memories m where m.id = memory_id and (m.owner_id = auth.uid() or m.visibility = 'Friends')));
create policy "owners manage photos" on public.memory_photos for all to authenticated using (exists (select 1 from public.memories m where m.id = memory_id and m.owner_id = auth.uid())) with check (exists (select 1 from public.memories m where m.id = memory_id and m.owner_id = auth.uid()));
create policy "members read likes" on public.memory_likes for select to authenticated using (true);
create policy "members like shared memories" on public.memory_likes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.memories m where m.id = memory_id and m.visibility = 'Friends'));
create policy "members remove own likes" on public.memory_likes for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('memory-photos', 'memory-photos', false) on conflict (id) do nothing;
create policy "members upload own memory photos" on storage.objects for insert to authenticated with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "members read allowed memory photos" on storage.objects for select to authenticated using (bucket_id = 'memory-photos' and exists (select 1 from public.memories m where m.id::text = (storage.foldername(name))[2] and (m.owner_id = auth.uid() or m.visibility = 'Friends')));
create policy "members delete own memory photos" on storage.objects for delete to authenticated using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.issue_invite(invite_label text default null)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare plain_code text;
begin
  plain_code := upper(encode(gen_random_bytes(8), 'hex'));
  insert into public.invites(label, code_hash, expires_at) values (invite_label, encode(digest(plain_code, 'sha256'), 'hex'), now() + interval '30 days');
  return plain_code;
end $$;
revoke all on function public.issue_invite(text) from public, anon, authenticated;
grant execute on function public.issue_invite(text) to service_role;

create or replace function public.consume_invite(p_code_hash text, p_user_id uuid, p_email text, p_display_name text)
returns boolean language plpgsql security definer set search_path = public as $$
declare claimed_id uuid;
begin
  update public.invites set used_at = now(), used_by = p_user_id
  where id = (select id from public.invites where code_hash = p_code_hash and used_at is null and (expires_at is null or expires_at > now()) for update skip locked limit 1)
  returning id into claimed_id;
  if claimed_id is null then return false; end if;
  insert into public.profiles(id, email, display_name) values (p_user_id, lower(p_email), nullif(trim(p_display_name), ''));
  return true;
end $$;
revoke all on function public.consume_invite(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.consume_invite(text, uuid, text, text) to service_role;
