# 운일암반일암 원정

10.8 – 10.11 진안 캠핑 · 야외 볼더링 페이지.
GitHub Pages로 띄우고, 장보기·준비 체크는 Supabase로 4명이 실시간 공유합니다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 화면 (이동 · 식단 · 장보기 · 준비) |
| `style.css` | 스타일, 라이트·다크 모드 |
| `app.js` | 탭, 체크리스트, 서버 동기화 |
| `config.js` | Supabase 주소와 키 |
| `supabase.sql` | 테이블 · 권한 · 실시간 설정 |

## 1. Supabase (약 5분)

1. 기존 Supabase 프로젝트를 그대로 써도 됨 (테이블 이름이 `jinan_checks` 라 안 겹침). 새로 만들려면 **New project**, 리전은 Seoul
2. 왼쪽 **SQL Editor** → `supabase.sql` 내용 붙여넣고 **Run**
3. **Project Settings → API** 에서 `Project URL`, `anon public` 키 복사
4. `config.js` 에 붙여넣기

## 2. GitHub Pages

```bash
git init
git add .
git commit -m "운일암반일암 원정 페이지"
git branch -M main
git remote add origin https://github.com/<아이디>/jinan-trip.git
git push -u origin main
```

저장소 **Settings → Pages → Branch: main / (root) → Save**
1~2분 뒤 `https://<아이디>.github.io/jinan-trip/` 로 열림 → 카톡에 공유.

## 참고

- 장보기 탭 상단에 `실시간 공유 중` 이 뜨면 연결 성공. 한 명이 체크하면 다른 폰에도 바로 반영됩니다.
- `config.js` 를 비워 두면 체크는 각자 폰에만 저장됩니다.
- anon 키는 공개돼도 되는 키지만, 링크를 아는 사람은 누구나 체크를 바꿀 수 있습니다. 여행용이라 이 정도로 충분.
- Supabase 무료 프로젝트는 **일주일 동안 안 쓰면 일시정지**됩니다. 출발 전에 한 번 열어 두고, 멈췄으면 대시보드에서 Restore.
- 체크 초기화: SQL Editor 에서 `delete from public.jinan_checks;`
