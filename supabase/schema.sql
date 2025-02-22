-- Create the fart_locations table
create table if not exists public.fart_locations (
  id bigint primary key generated always as identity,
  latitude double precision not null,
  longitude double precision not null,
  description text,
  timestamp timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.fart_locations enable row level security;

-- Create a single policy that allows anyone to read and insert fart_locations
create policy "Public access policy"
  on public.fart_locations
  for all
  to public
  using (true)
  with check (true);

-- Create an index on timestamp for faster queries
create index if not exists fart_locations_timestamp_idx on public.fart_locations (timestamp);

-- Create spatial index for faster location-based queries
create index if not exists fart_locations_location_idx on public.fart_locations using gist (ll_to_earth(latitude, longitude));
