-- ============================================================
-- Rapi — Skema Database (Fase 1: akun + sync data)
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- ---------- PROFIL ----------
-- 1 baris per user, otomatis dibuat saat daftar (lihat trigger di bawah).
create table if not exists public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  name            text        not null default '',
  initial_balance bigint      not null default 0,
  created_at      timestamptz not null default now()
);

-- ---------- TRANSAKSI ----------
create table if not exists public.transactions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users on delete cascade,
  type         text        not null check (type in ('income', 'expense', 'transfer')),
  amount       bigint      not null check (amount >= 0),
  category     text        not null,
  note         text        not null default '',
  date         timestamptz not null,
  input_method text        not null default 'text' check (input_method in ('text', 'voice', 'photo')),
  ai_parsed    boolean     not null default false,
  created_at   timestamptz not null default now()
);
-- Dashboard & laporan selalu urut tanggal terbaru → indeks ini bikin query cepat
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- ---------- INVESTASI ----------
create table if not exists public.investments (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users on delete cascade,
  type          text        not null check (type in ('saham', 'reksadana', 'kripto', 'emas', 'deposito')),
  name          text        not null,
  units         numeric     not null check (units > 0),   -- numeric: kripto bisa 0.002
  buy_price     bigint      not null check (buy_price >= 0),
  current_price bigint      not null check (current_price >= 0),
  updated_at    timestamptz not null default now()
);
create index if not exists investments_user_idx on public.investments (user_id);

-- ---------- KATEGORI ----------
-- Menyimpan SELURUH kategori milik user (default + buatan sendiri), karena
-- user boleh menghapus kategori bawaan.
create table if not exists public.categories (
  id         text        not null,          -- slug, mis. 'makanan'
  user_id    uuid        not null references auth.users on delete cascade,
  name       text        not null,
  emoji      text        not null default '🏷️',
  type       text        not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ============================================================
-- ROW LEVEL SECURITY — inti keamanannya.
-- Tanpa ini, siapa pun yang punya anon key bisa baca semua data.
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.transactions enable row level security;
alter table public.investments  enable row level security;
alter table public.categories   enable row level security;

-- Profil: user hanya boleh menyentuh barisnya sendiri
drop policy if exists "profil sendiri" on public.profiles;
create policy "profil sendiri" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Transaksi / Investasi / Kategori: hanya baris milik sendiri
drop policy if exists "transaksi sendiri" on public.transactions;
create policy "transaksi sendiri" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "investasi sendiri" on public.investments;
create policy "investasi sendiri" on public.investments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "kategori sendiri" on public.categories;
create policy "kategori sendiri" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: bikin profil otomatis begitu user daftar,
-- ambil nama dari metadata Google kalau ada.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
