-- سنع (Sanea) — initial database schema
-- Run this once in Supabase Dashboard > SQL Editor > New query > Run

-- Profiles: one row per authenticated user
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trips: a driver posts "من X إلى Y" that auto-expires in 20-30 minutes.
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references profiles(id) on delete cascade,
  from_city text not null,
  to_city text not null,
  accepts_passengers boolean not null default true,
  accepts_parcels boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table trips enable row level security;

create policy "Active trips are viewable by everyone"
  on trips for select
  using (expires_at > now());

create policy "Drivers can view their own trips"
  on trips for select
  using (auth.uid() = driver_id);

create policy "Drivers can insert their own trips"
  on trips for insert
  with check (auth.uid() = driver_id);

create policy "Drivers can delete their own trips"
  on trips for delete
  using (auth.uid() = driver_id);

-- A profile is only publicly readable when it's your own, or it belongs to a
-- driver with at least one currently-active trip (the only case the app needs
-- to show someone else's name/phone). Must come after `trips` exists.
create policy "Profiles are viewable by owner or via an active trip"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from trips
      where trips.driver_id = profiles.id
      and trips.expires_at > now()
    )
  );

-- Anonymous visitors can browse trips and driver names, but never phone
-- numbers -- table-level grants override column-level revokes in Postgres,
-- so the blanket grant must be dropped and replaced with an explicit column
-- list (see tawseela-web migration 009 for the same lesson learned there).
revoke select on public.profiles from anon;
grant select (id, full_name, created_at) on public.profiles to anon;
