-- FoodLoop Supabase schema
-- Paste this into the Supabase SQL editor.
-- IMPORTANT:
-- 1) Use Supabase Authentication for charities, donors, and admins.
-- 2) Never put a service_role or sb_secret key in frontend code.
-- 3) Set user roles with: update public.profiles set role = 'admin' where id = '<auth-user-id>';

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('donor', 'charity', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.donor_type as enum ('Restaurant', 'Home', 'Bakery', 'Cafe', 'Supermarket', 'Hotel');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.food_category as enum ('Meals', 'Bakery', 'Produce', 'Groceries', 'Beverages', 'Desserts');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_status as enum ('Available', 'Reserved', 'Picked Up', 'Expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.freshness_level as enum ('Fresh', 'Use Soon', 'Urgent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.verification_status as enum ('Pending', 'Verified', 'Rejected');
exception when duplicate_object then null;
end $$;
--
-- 1. USERS (formerly Profiles)
-- Extends Supabase Auth users to store application-specific data
-- Renamed from 'profiles' to 'users' to match README.md
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null, -- Added email for direct access
  full_name text,
  avatar_url text, -- Added avatar_url
  role public.app_role not null default 'charity', -- Using app_role enum
  organization_name text, -- From old profiles
  phone text, -- From old profiles
  is_approved boolean default false, -- Admin approval gate (from previous schema)
  created_at timestamptz not null default now()
);

-- Migration: Add verified_at to charity_verifications if it's missing from existing tables
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'charity_verifications' and column_name = 'verified_at') then
    alter table public.charity_verifications add column verified_at timestamptz;
  end if;
end $$;

create table if not exists public.charity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_name text not null,
  contact_name text not null,
  ngo_id text not null unique,
  phone text not null,
  email text not null,
  service_area text not null,
  document_url text,
  status public.verification_status not null default 'Pending',
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_listings (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references auth.users(id) on delete set null,
  donor_name text not null,
  donor_contact text,
  donor_type public.donor_type not null,
  food_name text not null,
  description text not null,
  quantity text not null,
  servings integer not null check (servings > 0),
  category public.food_category not null,
  pickup_location text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  photo_url text,
  pickup_window text,
  pickup_deadline timestamptz not null,
  freshness public.freshness_level not null default 'Fresh',
  status public.listing_status not null default 'Available',
  claim_code text unique,
  claimant_id uuid references auth.users(id) on delete set null,
  claimant_name text,
  claimant_org text,
  claimant_phone text,
  claimed_at timestamptz,
  co2_kg numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.food_listings(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete cascade,
  charity_verification_id uuid not null references public.charity_verifications(id) on delete restrict,
  confirmation_code text not null unique,
  status public.listing_status not null default 'Reserved',
  claimed_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 4. PICKUP SCHEDULES
-- Tracks timing for food handoffs as mentioned in README features
create table if not exists public.pickup_schedules (
  id uuid default gen_random_uuid() primary key,
  claim_id uuid references public.claims(id) on delete cascade,
  scheduled_time timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.food_listings(id) on delete cascade,
  donor_id uuid references auth.users(id) on delete set null,
  message text not null,
  claim_code text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.food_listings(id) on delete set null,
  -- Renamed columns to match ImpactPage.tsx usage
  meals integer not null default 0,
  food_kg numeric(10, 2) not null default 0,
  co2_kg numeric(10, 2) not null default 0,
  pickups integer not null default 0,
  recorded_at timestamptz not null default now()
);

-- 7. BADGES
-- Gamification elements
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon_name text, -- Reference for Lucide icons
  created_at timestamptz not null default now()
);

-- Junction table for Users-Badges
create table if not exists public.user_badges (
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists ( -- Updated to public.users
    select 1 from public.users
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.is_verified_charity()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists ( -- Updated to check public.users role and verification status
    select 1 from public.users u
    join public.charity_verifications cv on u.id = cv.user_id
    where u.id = auth.uid()
    and u.role = 'charity'
    and u.is_approved = true -- Check if the user profile itself is approved
    and cv.status = 'Verified' -- Check if the charity verification record is verified
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role, organization_name, phone) -- Updated to public.users and added email
  values (
    new.id,
    new.email, -- Added email
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'charity'),
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security; -- Updated to public.users
alter table public.charity_verifications enable row level security;
alter table public.food_listings enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;
alter table public.impact_metrics enable row level security;
alter table public.pickup_schedules enable row level security; -- Added RLS for pickup_schedules
alter table public.badges enable row level security; -- Added RLS for badges
alter table public.user_badges enable row level security; -- Added RLS for user_badges

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin" -- Updated policy name
on public.users for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" -- Updated policy name
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role <> 'admin');

drop policy if exists "charity_insert_own" on public.charity_verifications;
create policy "charity_insert_own"
on public.charity_verifications for insert
to authenticated
with check (user_id = auth.uid() and status = 'Pending');

drop policy if exists "charity_select_own_or_admin" on public.charity_verifications;
create policy "charity_select_own_or_admin"
on public.charity_verifications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "charity_update_own_pending" on public.charity_verifications;
create policy "charity_update_own_pending"
on public.charity_verifications for update
to authenticated
using (user_id = auth.uid() and status = 'Pending')
with check (user_id = auth.uid() and status = 'Pending');

drop policy if exists "admin_review_charities" on public.charity_verifications;
create policy "admin_review_charities"
on public.charity_verifications for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "donors_insert_listings" on public.food_listings;
create policy "donors_insert_listings"
on public.food_listings for insert
to authenticated
with check (donor_id = auth.uid());

drop policy if exists "donors_select_own_listings" on public.food_listings;
create policy "donors_select_own_listings"
on public.food_listings for select
to authenticated
using (donor_id = auth.uid() or public.is_admin());

drop policy if exists "verified_charities_select_available_listings" on public.food_listings;
create policy "verified_charities_select_available_listings"
on public.food_listings for select
to authenticated
using (
  public.is_verified_charity()
  and status = 'Available'
  and pickup_deadline > now()
);

drop policy if exists "donors_update_own_listings" on public.food_listings;
create policy "donors_update_own_listings"
on public.food_listings for update
to authenticated
using (donor_id = auth.uid() or public.is_admin())
with check (donor_id = auth.uid() or public.is_admin());

drop policy if exists "verified_charities_reserve_listings" on public.food_listings;
create policy "verified_charities_reserve_listings"
on public.food_listings for update
to authenticated
using (
  public.is_verified_charity()
  and status = 'Available'
  and pickup_deadline > now()
)
with check (
  public.is_verified_charity()
  and status = 'Reserved'
  and claimant_id = auth.uid()
);

-- Policies for claims table
drop policy if exists "claims_insert_verified_charity" on public.claims;
create policy "claims_insert_verified_charity"
on public.claims for insert
to authenticated
with check (
  claimant_id = auth.uid()
  and public.is_verified_charity()
  and (select status from public.food_listings where id = listing_id) = 'Available'
);


drop policy if exists "verified_charities_create_claims" on public.claims;
create policy "verified_charities_create_claims"
on public.claims for insert
to authenticated
with check (
  claimant_id = auth.uid()
  and exists (
    select 1
    from public.charity_verifications cv
    where cv.id = charity_verification_id
    and cv.user_id = auth.uid()
    and cv.status = 'Verified'
  )
);

drop policy if exists "claims_update_status_by_donor_or_claimant" on public.claims;
create policy "claims_update_status_by_donor_or_claimant"
on public.claims for update
to authenticated
using (claimant_id = auth.uid() or (select donor_id from public.food_listings where id = listing_id) = auth.uid())
with check (claimant_id = auth.uid() or (select donor_id from public.food_listings where id = listing_id) = auth.uid());

drop policy if exists "claim_select_related" on public.claims;
create policy "claim_select_related"
on public.claims for select
to authenticated
using (
  claimant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.food_listings fl
    where fl.id = listing_id
    and fl.donor_id = auth.uid()
  )
);

-- Policies for pickup_schedules
drop policy if exists "pickup_schedules_select_related" on public.pickup_schedules;
create policy "pickup_schedules_select_related"
on public.pickup_schedules for select
to authenticated
using (
  exists (
    select 1 from public.claims c
    join public.food_listings fl on c.listing_id = fl.id
    where c.id = claim_id
    and (c.claimant_id = auth.uid() or fl.donor_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "pickup_schedules_update_related" on public.pickup_schedules;
create policy "pickup_schedules_update_related"
on public.pickup_schedules for update
to authenticated
using (exists (select 1 from public.claims c join public.food_listings fl on c.listing_id = fl.id where c.id = claim_id and (c.claimant_id = auth.uid() or fl.donor_id = auth.uid())));

drop policy if exists "notifications_select_donor_or_admin" on public.notifications;
create policy "notifications_select_donor_or_admin"
on public.notifications for select
to authenticated
using (donor_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_insert_authenticated" on public.notifications;
create policy "notifications_insert_authenticated"
on public.notifications for insert
to authenticated
with check (true);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (donor_id = auth.uid() or exists (select 1 from public.claims where id = listing_id and claimant_id = auth.uid()));

drop policy if exists "impact_select_admin" on public.impact_metrics;
create policy "impact_select_admin"
on public.impact_metrics for select
to authenticated
using (public.is_admin());

-- Policies for badges and user_badges
drop policy if exists "badges_viewable_by_all" on public.badges;
create policy "badges_viewable_by_all" on public.badges for select using (true);

drop policy if exists "user_badges_select_own" on public.user_badges;
create policy "user_badges_select_own"
on public.user_badges for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace view public.admin_pending_charities as
select
  cv.id,
  cv.user_id,
  cv.organization_name,
  cv.contact_name,
  cv.ngo_id,
  cv.phone,
  cv.email,
  cv.service_area,
  cv.document_url,
  cv.status,
  cv.admin_notes,
  cv.created_at
from public.charity_verifications cv
where cv.status = 'Pending' or cv.status = 'Rejected'; -- Include rejected for admin review
