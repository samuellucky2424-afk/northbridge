alter table public.profiles_nbb
  add column if not exists profile_picture_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_public_read'
  ) then
    create policy "profile_pictures_public_read"
      on storage.objects
      for select
      using (bucket_id = 'profile-pictures');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_insert_own_folder'
  ) then
    create policy "profile_pictures_insert_own_folder"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'profile-pictures'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_update_own_folder'
  ) then
    create policy "profile_pictures_update_own_folder"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'profile-pictures'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'profile-pictures'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_pictures_delete_own_folder'
  ) then
    create policy "profile_pictures_delete_own_folder"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'profile-pictures'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
