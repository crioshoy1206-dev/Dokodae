// AI 일정 도우미: 하루 일정을 다듬거나(polish), 동선 근처 가볼 만한 곳을 추천해요(suggest).
// 결과는 바로 바꾸지 않고 앱에서 사용자가 골라서 넣어요.
// 필요한 환경 변수: ANTHROPIC_API_KEY, AI_MODEL (선택)

const COMMON = `너는 한국인의 일본 자유여행 일정을 돕는 여행 플래너야.
[하루 일정]의 각 장소에는 k(장소 번호), t(시간), n(이름), m(메모), todo(할 일), go(여기까지 오는 방법: m=walk/rail/bus/taxi, ln=노선, min=분), lat/lng가 있어.
결과는 아래 형식의 JSON 하나만 출력해. 설명 문장이나 코드 블록 없이 JSON만.
모든 글은 한국어로, 짧고 바로 따라 할 수 있게. 확실하지 않은 영업시간·요금은 "확인 필요"라고 적어.`;

const POLISH = `${COMMON}

할 일: 이 하루 일정을 실제로 다닐 수 있게 다듬어. 사용자가 고른 장소와 큰 틀은 존중하고, 꼭 필요한 것만 고쳐.
보는 것:
- 이동 시간이 모자라거나 남는 시간 (앞 장소 머무는 시간 + 이동 시간)
- 영업 시작 전이나 문 닫은 뒤에 가는 곳, 줄이 긴 곳은 시간 조정
- 동선이 되돌아가는 순서
- go가 빠진 이동 구간은 노선 이름(예: 긴자선, JR 야마노테선)과 분을 채우기
- 꼭 챙길 할 일(예약, 현금, 여권)이 빠졌으면 todo에 추가
{"summary":"전체 평가 한두 문장",
 "edits":[{"k":"장소 번호","t":"HH:MM","n":"이름","m":"메모","todo":["할 일 전체 목록"],"go":{"m":"rail","ln":"노선","min":10},"why":"왜 바꾸는지 한 문장"}],
 "adds":[{"after":"이 장소 번호 다음에","t":"HH:MM","n":"이름","ja":"지도 검색용 일본어 이름","m":"메모","todo":[],"go":{"m":"walk","min":5},"why":"한 문장"}],
 "dels":[{"k":"장소 번호","why":"한 문장"}]}
규칙: edits에는 바꾸는 항목만 넣어 (안 바꾸는 필드는 빼). edits 8개, adds 2개, dels 2개까지. 고칠 게 없으면 빈 배열과 summary만.`;

const SUGGEST = `${COMMON}

할 일: 이 하루 동선 근처(걸어서 15분 또는 전철 2~3정거장 안)에서 일정에 넣을 만한 관광지·맛집·카페를 추천해.
[바라는 것]이 있으면 그걸 우선해. 이미 일정에 있는 곳은 빼. 실제로 있는 유명하거나 평이 좋은 곳만.
{"items":[{"after":"이 장소 번호 다음에 넣으면 좋아요","t":"HH:MM","stay":40,"n":"이름(한국어)","ja":"지도 검색용 일본어 이름","kind":"관광|맛집|카페|쇼핑|야경|체험","why":"추천 이유 한 문장","m":"짧은 메모","todo":["할 일"],"go":{"m":"walk","min":5}}]}
규칙: 5개. t는 그 위치에 넣었을 때 앞뒤 일정과 맞는 시간.`;

const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const T = /^([01]?\d|2[0-3]):[0-5]\d$/;
const tm = (v) => (T.test(String(v || '')) ? String(v).padStart(5, '0') : '');
const goOf = (g) => {
  if (!g || !['walk', 'rail', 'bus', 'taxi'].includes(g.m)) return null;
  const min = Math.max(0, Math.min(999, parseInt(g.min, 10) || 0));
  return { m: g.m, ln: g.m === 'rail' || g.m === 'bus' ? str(g.ln, 30) : '', min };
};
const todoOf = (a) => (Array.isArray(a) ? a.map((x) => str(x, 120)).filter(Boolean).slice(0, 10) : null);
function parse(s) { const a = s.indexOf('{'), b = s.lastIndexOf('}'); if (a < 0 || b <= a) return null; try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; } }

function clean(mode, p, keys) {
  if (mode === 'suggest') {
    return { items: (Array.isArray(p.items) ? p.items : []).slice(0, 6).map((x) => ({
      after: keys.has(String(x.after)) ? String(x.after) : '', t: tm(x.t), stay: Math.max(0, Math.min(600, parseInt(x.stay, 10) || 0)),
      n: str(x.n, 60), ja: str(x.ja, 80), kind: str(x.kind, 10), why: str(x.why, 160), m: str(x.m, 120), todo: todoOf(x.todo) || [], go: goOf(x.go),
    })).filter((x) => x.n) };
  }
  const edits = (Array.isArray(p.edits) ? p.edits : []).filter((e) => e && keys.has(String(e.k))).slice(0, 8).map((e) => {
    const o = { k: String(e.k), why: str(e.why, 160) };
    if (tm(e.t)) o.t = tm(e.t); if (e.n) o.n = str(e.n, 60); if (e.m != null && e.m !== '') o.m = str(e.m, 200);
    const td = todoOf(e.todo); if (td) o.todo = td; const g = goOf(e.go); if (g) o.go = g;
    return o;
  }).filter((e) => Object.keys(e).length > 2);
  const adds = (Array.isArray(p.adds) ? p.adds : []).slice(0, 2).map((x) => ({
    after: keys.has(String(x.after)) ? String(x.after) : '', t: tm(x.t), n: str(x.n, 60), ja: str(x.ja, 80), m: str(x.m, 120), todo: todoOf(x.todo) || [], go: goOf(x.go), why: str(x.why, 160),
  })).filter((x) => x.n && x.t);
  const dels = (Array.isArray(p.dels) ? p.dels : []).filter((d) => d && keys.has(String(d.k))).slice(0, 2).map((d) => ({ k: String(d.k), why: str(d.why, 160) }));
  return { summary: str(p.summary, 300), edits, adds, dels };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const SS = require('./_session');
  if (SS.configured() && !SS.read(req)) return res.status(401).json({ error: 'need_login', message: '로그인하면 AI 일정 도우미를 쓸 수 있어요.' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'no_key', message: 'AI 키가 아직 설정되지 않았어요.' });
  const code = process.env.ACCESS_CODE;
  if (code && req.headers['x-access-code'] !== code) return res.status(401).json({ error: 'need_code', message: '접근 코드가 필요해요.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const mode = body.mode === 'suggest' ? 'suggest' : 'polish';
  const day = body.day || {};
  const stops = (Array.isArray(day.stops) ? day.stops : []).slice(0, 40).map((s) => ({
    k: str(s.k, 40), t: str(s.t, 5), n: str(s.n, 60), m: str(s.m, 200), todo: (todoOf(s.todo) || []).slice(0, 8),
    go: s.go ? goOf(s.go) : undefined, lat: typeof s.lat === 'number' ? +s.lat.toFixed(4) : undefined, lng: typeof s.lng === 'number' ? +s.lng.toFixed(4) : undefined,
  })).filter((s) => s.k && s.n);
  if (!stops.length && mode === 'polish') return res.status(400).json({ error: 'empty', message: '이날 일정이 아직 없어요. 장소를 하나 이상 넣은 뒤 다듬어 주세요.' });
  const keys = new Set(stops.map((s) => s.k));
  const user = `[날짜] ${str(day.date, 20)} ${str(day.title, 40)}\n[여행] ${str(body.trip, 60)}\n${body.wish ? `[바라는 것] ${str(body.wish, 200)}\n` : ''}[하루 일정]\n${JSON.stringify(stops)}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-5-5', max_tokens: 3000, system: mode === 'suggest' ? SUGGEST : POLISH, messages: [{ role: 'user', content: user }] }),
    });
    const data = await r.json();
    if (!r.ok) { console.error('anthropic error', r.status, JSON.stringify(data).slice(0, 500)); return res.status(502).json({ error: 'upstream', message: 'AI 응답을 받지 못했어요. 잠시 후 다시 해 주세요.' }); }
    const out = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
    const p = parse(out);
    if (!p) return res.status(422).json({ error: 'parse', message: 'AI 답을 읽지 못했어요. 한 번 더 해 주세요.' });
    return res.status(200).json(clean(mode, p, keys));
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'upstream', message: 'AI에 연결하지 못했어요. 잠시 후 다시 해 주세요.' });
  }
};
module.exports.clean = clean;
