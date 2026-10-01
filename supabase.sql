-- Supabase → SQL Editor 에 통째로 붙여넣고 Run

create table if not exists public.jinan_checks (
  id         text primary key,
  done       boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Data API 로 접근 허용 (Automatically expose new tables 를 껐을 때 필요)
grant select, insert, update on public.jinan_checks to anon;

-- 링크 있는 사람은 누구나 읽고 체크할 수 있게 (여행 체크리스트용)
alter table public.jinan_checks enable row level security;

create policy "jinan read"   on public.jinan_checks for select to anon using (true);
create policy "jinan insert" on public.jinan_checks for insert to anon with check (true);
create policy "jinan update" on public.jinan_checks for update to anon using (true) with check (true);

-- 실시간 반영 켜기
alter publication supabase_realtime add table public.jinan_checks;

-- 체크 전부 초기화할 때:
-- delete from public.jinan_checks;
