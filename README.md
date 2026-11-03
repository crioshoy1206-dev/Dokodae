# 도코데 (Dokodae)

일본 여행 현장 도우미. 지도 위에 일정·동선을 보여 주고, 도구창에서 일정 보기·수정, AI 묻기, 상황카드, 긴급 안내를 제공합니다.

## 구조
- `index.html`: 화면과 스타일, 앱 로더
- `app.js`: 앱 로직 (지도, 일정, 일정 편집, AI 묻기)
- `data/route.js`, `data/cards.js`, `data/itinerary.json`: 동선·상황카드·일정 데이터
- `api/chat.js`: AI 묻기 서버 함수 (Vercel)
- `sw.js`, `manifest.json`: 오프라인 캐시와 홈 화면 설치

## 배포
Vercel 프로젝트 `japan-trip-helper`에 연결합니다. AI 기능에는 `ANTHROPIC_API_KEY` 환경 변수가 필요하며, 키는 코드에 넣지 않습니다.
