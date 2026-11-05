// 구글 로그인: 브라우저가 받은 ID 토큰을 구글에 확인하고 세션 쿠키를 발급해요.
const S = require('./_session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!S.configured()) return res.status(503).json({ error: 'not_configured', message: '로그인 설정이 아직 안 됐어요.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  // Firebase 로그인: 브라우저가 받은 Firebase ID 토큰을 확인해요
  if (body && body.idToken) {
    try {
      const u = await S.verifyFirebaseToken(String(body.idToken).slice(0, 4096));
      if (!u) return res.status(401).json({ error: 'invalid_token', message: '로그인을 확인하지 못했어요.' });
      const user = { id: u.uid, email: u.email, name: u.name, picture: u.picture };
      S.issue(res, user);
      return res.status(200).json({ user, owner: S.isOwner(user.email) });
    } catch (e) {
      console.error(e);
      return res.status(502).json({ error: 'upstream', message: '로그인 확인 서버에 연결하지 못했어요. 잠시 뒤 다시 해 주세요.' });
    }
  }
  const credential = body && body.credential;
  if (!credential || typeof credential !== 'string' || credential.length > 4096) return res.status(400).json({ error: 'bad_request' });
  try {
    const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
    if (!r.ok) return res.status(401).json({ error: 'invalid_token', message: '구글 로그인을 확인하지 못했어요.' });
    const t = await r.json();
    const okIss = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
    if (t.aud !== process.env.GOOGLE_CLIENT_ID || !okIss || String(t.email_verified) !== 'true' || Number(t.exp) * 1000 < Date.now()) {
      return res.status(401).json({ error: 'invalid_token', message: '구글 로그인을 확인하지 못했어요.' });
    }
    const user = { id: t.sub, email: t.email, name: t.name || t.email, picture: t.picture || '' };
    S.issue(res, user);
    return res.status(200).json({ user, owner: S.isOwner(user.email) });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'upstream', message: '구글에 연결하지 못했어요. 잠시 뒤 다시 해 주세요.' });
  }
};
