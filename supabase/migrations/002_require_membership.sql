-- Supabase Auth can be called directly, outside the invitation form. Only
-- accounts with a profile created by a consumed invitation are group members.
create or replace function public.is_memory_map_member()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid())
  );
$$;

revoke all on function public.is_memory_map_member() from public, anon;
grant execute on function public.is_memory_map_member() to authenticated;

drop policy "members read profiles" on public.profiles;
create policy "members read profiles" on public.profiles
for select to authenticated using ((select public.is_memory_map_member()));

drop policy "members read allowed memories" on public.memories;
create policy "members read allowed memories" on public.memories
for select to authenticated using (
  (select public.is_memory_map_member())
  and (owner_id = (select auth.uid()) or visibility = 'Friends')
);

drop policy "members read allowed people" on public.memory_people;
create policy "members read allowed people" on public.memory_people
for select to authenticated using (
  (select public.is_memory_map_member())
  and exists (
    select 1 from public.memories m
    where m.id = memory_id
      and (m.owner_id = (select auth.uid()) or m.visibility = 'Friends')
  )
);

drop policy "members read allowed photos" on public.memory_photos;
create policy "members read allowed photos" on public.memory_photos
for select to authenticated using (
  (select public.is_memory_map_member())
  and exists (
    select 1 from public.memories m
    where m.id = memory_id
      and (m.owner_id = (select auth.uid()) or m.visibility = 'Friends')
  )
);

drop policy "members read likes" on public.memory_likes;
create policy "members read likes" on public.memory_likes
for select to authenticated using ((select public.is_memory_map_member()));

drop policy "members read allowed memory photos" on storage.objects;
create policy "members read allowed memory photos" on storage.objects
for select to authenticated using (
  bucket_id = 'memory-photos'
  and (select public.is_memory_map_member())
  and exists (
    select 1 from public.memories m
    where m.id::text = (storage.foldername(name))[2]
      and (m.owner_id = (select auth.uid()) or m.visibility = 'Friends')
  )
);

drop policy "members upload own memory photos" on storage.objects;
create policy "members upload own memory photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'memory-photos'
  and (select public.is_memory_map_member())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
