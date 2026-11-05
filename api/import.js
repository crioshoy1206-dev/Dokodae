// AI 일정 가져오기: 메모·txt·카톡 캡처에서 여행 날짜와 장소를 읽어 도코데 일정(JSON)으로 바꿔요.
// 필요한 환경 변수: ANTHROPIC_API_KEY, AI_MODEL (선택)

const SYSTEM = `너는 한국인의 일본 여행 일정 메모를 구조화하는 도우미야.
사용자가 붙여 넣은 글이나 캡처 이미지(카톡 대화, 메모, 엑셀, 블로그)에서 여행 일정을 읽어 아래 JSON 하나만 출력해. 설명이나 코드 블록 없이 JSON만.

{"title":"여행 이름","start":"YYYY-MM-DD","end":"YYYY-MM-DD","stay":"숙소 이름 또는 빈 문자열",
 "days":[{"date":"YYYY-MM-DD","stops":[{"t":"HH:MM","n":"장소 이름(한국어)","ja":"일본어 또는 영어 공식 이름","city":"도시","m":"짧은 메모","todo":["할 일"]}]}],
 "notes":"읽지 못했거나 추측한 부분을 한국어 한두 문장으로"}

규칙:
- 날짜에 연도가 없으면 [오늘]보다 뒤에 오는 가장 가까운 날짜로 정해.
- "1일차", "둘째 날"처럼 날짜 대신 순서만 있으면 시작일을 알 수 있을 때만 날짜로 바꾸고, 모르면 [오늘] 기준 다음 달 1일부터라고 가정하고 notes에 적어.
- 시간이 없으면 그날 순서에 맞게 09:00부터 2시간 간격 정도로 추측해서 넣어.
- 한 장소는 실제로 찾아갈 수 있는 곳 하나만. "점심", "자유시간"처럼 장소가 없는 일은 바로 앞 장소의 todo로 넣어.
- 식당·카페·가게 이름도 장소로 넣어. 이동(전철 타기 등)은 장소로 넣지 말고 다음 장소의 m이나 todo에 짧게 적어.
- ja에는 지도 검색에 쓸 일본어 이름을 써 (예: 도톤보리 → 道頓堀). 모르면 영어 이름.
- 숙소가 있으면 stay에 넣고, 체크인처럼 숙소에 가는 일정도 장소로 넣어.
- end는 마지막 날짜. 여행은 30일을 넘지 않아.
- 일정이 아니라고 판단되면 {"error":"일정을 찾지 못했어요"}만 출력해.`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const SS = require('./_session');
  if (SS.configured() && !SS.read(req)) return res.status(401).json({ error: 'need_login', message: '로그인하면 AI로 일정을 가져올 수 있어요.' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'no_key', message: 'AI 키가 아직 설정되지 않았어요. 직접 만들기를 써 주세요.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const text = String(body.text || '').slice(0, 20000);
  const imgs = (Array.isArray(body.images) ? body.images : []).filter((im) => im && typeof im.data === 'string' && im.data.length < 1500000 && /^image\/(jpeg|png|webp)$/.test(im.media_type)).slice(0, 6);
  if (!text.trim() && !imgs.length) return res.status(400).json({ error: 'empty', message: '일정 글이나 캡처를 넣어 주세요.' });

  const today = String(body.today || '').match(/^\d{4}-\d{2}-\d{2}$/) ? body.today : new Date().toISOString().slice(0, 10);
  const content = imgs.map((im) => ({ type: 'image', source: { type: 'base64', media_type: im.media_type, data: im.data } }));
  content.push({ type: 'text', text: `[오늘] ${today}\n\n[일정 자료]\n${text.trim() || '(위 캡처 이미지를 읽어 주세요)'}` });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-5-5', max_tokens: 6000, system: SYSTEM, messages: [{ role: 'user', content }] })
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('anthropic error', r.status, JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: 'upstream', message: 'AI 응답을 받지 못했어요. 잠시 후 다시 해 주세요.' });
    }
    const out = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
    const plan = parsePlan(out);
    if (!plan) return res.status(422).json({ error: 'parse', message: '일정을 읽지 못했어요. 날짜와 장소가 보이게 다시 넣어 주세요.' });
    if (plan.error) return res.status(422).json({ error: 'not_plan', message: plan.error });
    return res.status(200).json({ plan: clean(plan) });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'upstream', message: 'AI에 연결하지 못했어요. 잠시 후 다시 해 주세요.' });
  }
};

function parsePlan(s) {
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

const D = /^\d{4}-\d{2}-\d{2}$/, T = /^\d{1,2}:\d{2}$/;
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
function clean(p) {
  const days = (Array.isArray(p.days) ? p.days : []).filter((d) => d && D.test(d.date)).slice(0, 30).map((d) => ({
    date: d.date,
    stops: (Array.isArray(d.stops) ? d.stops : []).slice(0, 25).map((s) => ({
      t: T.test(String(s.t)) ? String(s.t).padStart(5, '0') : '09:00',
      n: str(s.n, 60), ja: str(s.ja, 80), city: str(s.city, 30), m: str(s.m, 200),
      todo: (Array.isArray(s.todo) ? s.todo : []).map((x) => str(x, 120)).filter(Boolean).slice(0, 10)
    })).filter((s) => s.n)
  }));
  const dates = days.map((d) => d.date).sort();
  let start = D.test(p.start) ? p.start : dates[0], end = D.test(p.end) ? p.end : dates[dates.length - 1];
  if (dates.length) { if (dates[0] < start) start = dates[0]; if (dates[dates.length - 1] > end) end = dates[dates.length - 1]; }
  return { title: str(p.title, 40) || '일본 여행', start, end, stay: str(p.stay, 60), days, notes: str(p.notes, 300) };
}
