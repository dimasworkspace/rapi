-- ============================================================
-- Rapi — Fase 2: kuota pemakaian AI per user
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang.
-- ============================================================

-- Satu baris per user per hari. Reset otomatis karena kuncinya termasuk tanggal.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- User boleh MELIHAT pemakaiannya sendiri (buat tampilkan sisa kuota di UI),
-- tapi tidak boleh mengubahnya — penambahan hanya lewat fungsi di bawah.
drop policy if exists "lihat kuota sendiri" on public.ai_usage;
create policy "lihat kuota sendiri" on public.ai_usage
  for select using (auth.uid() = user_id);

-- ============================================================
-- Pakai 1 jatah kuota, ATOMIK (aman dari klik beruntun / balapan request).
-- security definer: fungsi ini yang berwenang menulis, bukan user langsung.
-- ============================================================
create or replace function public.consume_ai_quota(p_limit int)
returns table (allowed boolean, used int, quota int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_used int;
begin
  if v_user is null then
    return query select false, 0, p_limit;
    return;
  end if;

  insert into public.ai_usage (user_id, day, count)
  values (v_user, current_date, 1)
  on conflict (user_id, day)
    do update set count = ai_usage.count + 1
  returning ai_usage.count into v_used;

  -- Lewat batas → kembalikan jatahnya biar angka tidak terus membengkak
  if v_used > p_limit then
    update public.ai_usage
       set count = ai_usage.count - 1
     where ai_usage.user_id = v_user and ai_usage.day = current_date;
    return query select false, p_limit, p_limit;
    return;
  end if;

  return query select true, v_used, p_limit;
end;
$$;

-- Baca sisa kuota tanpa memakainya (buat ditampilkan di Settings).
create or replace function public.get_ai_quota(p_limit int)
returns table (used int, quota int)
language sql
security definer
set search_path = public
as $$
  select
    coalesce((select count from public.ai_usage
               where user_id = auth.uid() and day = current_date), 0) as used,
    p_limit as quota;
$$;
