-- 정산 기능용 · Supabase → SQL Editor 에 붙여넣고 Run (한 번만)

create table if not exists public.jinan_expenses (
  id         uuid primary key default gen_random_uuid(),
  amount     integer not null check (amount > 0),
  category   text not null,
  payer      smallint not null,
  split      smallint[] not null,
  memo       text not null default '',
  spent_on   date not null default current_date,
  receipt    text,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.jinan_expenses to anon;

alter table public.jinan_expenses enable row level security;
create policy "jinan exp read"   on public.jinan_expenses for select to anon using (true);
create policy "jinan exp insert" on public.jinan_expenses for insert to anon with check (true);
create policy "jinan exp delete" on public.jinan_expenses for delete to anon using (true);

-- 삭제도 실시간 반영되게
alter table public.jinan_expenses replica identity full;
alter publication supabase_realtime add table public.jinan_expenses;
