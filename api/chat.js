// AI 도우미: 일정·현재 시각·관련 상황 카드를 함께 보내 Claude에게 묻는다.
// 필요한 환경 변수: ANTHROPIC_API_KEY (필수), AI_MODEL (선택), ACCESS_CODE (선택: 설정하면 앱에서 같은 코드를 입력해야 함)

const SYSTEM_CHAT = `너는 일본을 자유여행 중인 한국인을 현장에서 돕는 도우미야.
사용자는 지금 역, 식당, 관광지 같은 현장에서 막혀 있어. 짧고 바로 따라 할 수 있게 답해.

규칙:
- 한국어로, 번호 매긴 단계 3~6개로 답해. 서론과 인사는 빼.
- 아래 [내 일정]과 [지금 시각]을 보고 사용자가 지금 어디서 무엇을 하려는지 추측해서 맞춤으로 답해.
- [관련 상황 카드]에 있는 내용은 검증된 정보이니 우선해서 써.
- 역 이름·표지판 문구는 일본어 원문을 괄호로 같이 써 (예: 乗換, ○○方面).
- 확실하지 않은 정보(시각표, 요금, 영업시간, 규정)는 "확실하지 않아요"라고 말하고 확인 방법(역무원, 공식 사이트, 구글맵)을 알려줘.
- 직원이나 현지인에게 물어보는 게 빠르면 마지막에 "📋 직원에게 보여주기:" 한 줄 뒤에 일본어 문장 하나를 써.
- 사진이 있으면 사진 속 글자(안내판, 메뉴, 버튼)를 읽고 무엇을 누르거나 어디로 가야 하는지 구체적으로 말해.
- 생명·건강이 걸린 상황이면 첫 줄에 119(구급) 또는 110(경찰)을 안내해.`;

const SYSTEM_PHRASE = `사용자가 일본 현지 직원에게 보여줄 문장을 만들고 싶어 해.
사용자의 한국어 요청을 정중하고 짧은 일본어 문장 1~2개로 바꿔.
반드시 아래 JSON만 출력해: {"ja":"일본어 문장","ko":"한국어 뜻","read":"한글 발음"}`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  // 구글 로그인이 설정돼 있으면 로그인한 사람만 AI를 쓸 수 있어요
  const SS = require('./_session');
  if (SS.configured() && !SS.read(req)) return res.status(401).json({ error: 'need_login', message: '로그인하면 AI에게 물어볼 수 있어요.' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'no_key', message: 'AI 키가 아직 설정되지 않았어요.' });

  const code = process.env.ACCESS_CODE;
  if (code && req.headers['x-access-code'] !== code) {
    return res.status(401).json({ error: 'need_code', message: '접근 코드가 필요해요.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const mode = body.mode === 'phrase' ? 'phrase' : 'chat';
  const ctx = String(body.context || '').slice(0, 6000);
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  if (!msgs.length) return res.status(400).json({ error: 'empty' });

  const messages = msgs.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 2000) || '...'
  }));
  if (messages[0].role !== 'user') messages.shift();

  const img = body.image;
  if (img && typeof img.data === 'string' && img.data.length < 1500000 && /^image\/(jpeg|png|webp)$/.test(img.media_type)) {
    const last = messages[messages.length - 1];
    last.content = [
      { type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } },
      { type: 'text', text: last.content }
    ];
  }

  const system = mode === 'phrase' ? SYSTEM_PHRASE : SYSTEM_CHAT + (ctx ? '\n\n' + ctx : '');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-5-5',
        max_tokens: mode === 'phrase' ? 300 : 900,
        system,
        messages
      })
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('anthropic error', r.status, JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: 'upstream', message: 'AI 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.' });
    }
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server', message: '서버 오류가 났어요.' });
  }
};
