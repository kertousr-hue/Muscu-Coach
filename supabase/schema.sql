-- Schéma Supabase de Muscu Coach (projet « muscultation », organisation Musculation).
-- RLS activée partout : chaque utilisateur ne voit que ses propres lignes.

create table public.muscu_settings (user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade, data jsonb not null default '{}', updated_at timestamptz default now());
create table public.muscu_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, done_on date not null, data jsonb not null, created_at timestamptz default now());
create table public.weights (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, measured_on date not null, kg numeric not null);
create table public.muscu_food_log (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, eaten_on date not null, meal smallint, name text, grams numeric, kcal_100 numeric, protein_100 numeric, carbs_100 numeric, fat_100 numeric, fiber_100 numeric, sugar_100 numeric, created_at timestamptz default now());
create table public.foods (id bigint generated always as identity primary key, owner uuid default auth.uid() references auth.users(id) on delete cascade, name text not null, category text, barcode text, portion_g numeric, kcal numeric, protein numeric, carbs numeric, fat numeric, fiber numeric, sugar numeric);

-- Cardio (montre Bluetooth ou Health Connect)
create table public.muscu_heart (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, done_on date not null, label text, started_at timestamptz, minutes numeric(6,1), hr_avg smallint, hr_max smallint, hr_min smallint, kcal smallint, src text, zones jsonb, samples jsonb, ext_id text, created_at timestamptz not null default now());
create unique index muscu_heart_ext_uidx on public.muscu_heart(user_id, ext_id);

-- Clé personnelle du webhook « montre » (Health Connect Webhook)
create table public.muscu_watch_key (user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade, token text not null unique default encode(gen_random_bytes(18),'hex'), last_push timestamptz, created_at timestamptz not null default now());

-- RLS + politiques « propriétaire » (voir le projet Supabase pour le détail exact)
alter table public.muscu_settings enable row level security;
alter table public.muscu_sessions enable row level security;
alter table public.weights enable row level security;
alter table public.muscu_food_log enable row level security;
alter table public.foods enable row level security;
alter table public.muscu_heart enable row level security;
alter table public.muscu_watch_key enable row level security;
-- Exemple de politique : create policy "own" on public.muscu_heart for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
