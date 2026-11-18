-- Migration déjà appliquée au projet Supabase "SamaDealL" (17 nov. 2026).
-- Les tables (profiles, listings, favorites, conversations, messages, reports, notifications) existaient déjà ;
-- cette migration corrige l'inscription, protège les annonces et crée le stockage des photos.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_samadeal_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, email, phone, whatsapp, city, neighborhood, account_type, shop_name, avatar_url, is_verified, role, updated_at)
  values (
    new.id,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), nullif(new.raw_user_meta_data ->> 'name',''), 'Membre SamaDeal'), 80),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'city',''), 'Dakar'),
    nullif(new.raw_user_meta_data ->> 'neighborhood',''),
    case when new.raw_user_meta_data ->> 'account_type' = 'pro' then 'pro' else 'particulier' end,
    nullif(new.raw_user_meta_data ->> 'shop_name',''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    new.email_confirmed_at is not null,
    case when new.raw_user_meta_data ->> 'account_type' = 'pro' then 'seller' else 'user' end,
    now()
  )
  on conflict (id) do update set
    email = excluded.email, is_verified = excluded.is_verified, updated_at = now();
  return new;
end $$;

create or replace function public.guard_listing() returns trigger
language plpgsql set search_path = '' as $$
declare p record;
begin
  select name, phone, whatsapp, is_verified, created_at into p from public.profiles where id = new.seller_id;
  if found then
    new.seller_name := p.name;
    new.seller_phone := coalesce(p.phone, '');
    new.seller_whatsapp := coalesce(nullif(p.whatsapp,''), p.phone, '');
    new.seller_is_verified := p.is_verified;
    new.seller_member_since := to_char(p.created_at, 'MM/YYYY');
  end if;
  if current_user in ('authenticated','anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.is_featured := false; new.views_count := 0; new.status := 'active';
    else
      new.seller_id := old.seller_id;
      new.is_featured := old.is_featured; new.views_count := old.views_count;
      if old.status in ('pending','rejected') then new.status := old.status; end if;
    end if;
  end if;
  return new;
end $$;
create trigger guard_listing before insert or update on public.listings
  for each row execute function public.guard_listing();

create or replace function public.sync_listing_seller() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.name is distinct from old.name or new.phone is distinct from old.phone
     or new.whatsapp is distinct from old.whatsapp or new.is_verified is distinct from old.is_verified then
    update public.listings set
      seller_name = new.name, seller_phone = coalesce(new.phone,''),
      seller_whatsapp = coalesce(nullif(new.whatsapp,''), new.phone, ''), seller_is_verified = new.is_verified
    where seller_id = new.id;
  end if;
  return new;
end $$;
create trigger sync_listing_seller after update on public.profiles
  for each row execute function public.sync_listing_seller();
revoke execute on function public.sync_listing_seller() from public, anon, authenticated;

create or replace function public.increment_views(p_listing_id uuid) returns void
language sql security definer set search_path = '' as $$
  update public.listings set views_count = views_count + 1 where id = p_listing_id and status = 'active'
$$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Non connecté'; end if;
  delete from public.messages where sender_id = uid
    or conversation_id in (select id from public.conversations where buyer_id = uid or seller_id = uid);
  delete from public.conversations where buyer_id = uid or seller_id = uid;
  delete from public.reports where reporter_id = uid;
  delete from public.listings where seller_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'avatars';

create policy "SamaDeal listing images upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "SamaDeal listing images delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()));
