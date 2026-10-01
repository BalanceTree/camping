# 운일암반일암 원정 🏕️

10.8 – 10.11 진안 캠핑 · 야외 볼더링 페이지 → https://balancetree.github.io/camping/

| 페이지 | 내용 |
| --- | --- |
| 홈 `index.html` | 사용법, D-day 카운트다운, 날씨 · 다음 일정 · 진행률 · 정산 요약 |
| 이동 `move.html` | 멤버, 목요일 동선 (투싼 · 창섭 차) |
| 식단 `food.html` | 끼니별 메뉴와 양 |
| 장보기 `shop.html` | 체크리스트 (4명 실시간 공유) |
| 준비 `prep.html` | 출발 전 확인 (공유), 야영장 규칙, 보관 계획 |
| 날씨 `weather.html` | Open-Meteo 예보 모델 5개 합의값, 캠핑 조언 |
| 정산 `money.html` | 지출 기록, 영수증 자동 입력, 최소 송금 계산 (공유) |

- 내용 수정: `data.js` 한 파일만 고치면 모든 페이지에 반영
- 공통 상단바 · 메뉴 · 서버 연결: `common.js`
- 서버: Supabase (`config.js`) · 테이블 `jinan_checks` (`supabase.sql`), `jinan_expenses` (`supabase-money.sql`)
- 영수증 분석: 도쿄 때 만든 Cloudflare Worker 재사용
- 오프라인 · 홈 화면 추가: `sw.js`, `manifest.json` — 파일 바꾸면 `sw.js` 의 VERSION 올리기
