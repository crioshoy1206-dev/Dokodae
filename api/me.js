// 지금 로그인한 사용자와 로그인 설정(구글 클라이언트 ID)을 알려줘요. POST 는 로그아웃.
const S = require('./_session');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'POST') { S.clear(res); return res.status(200).json({ ok: true }); }
  if (!S.configured()) return res.status(200).json({ configured: false, user: null });
  const u = S.read(req);
  const user = u ? { id: u.id, email: u.email, name: u.name, picture: u.picture } : null;
  return res.status(200).json({ configured: true, clientId: process.env.GOOGLE_CLIENT_ID, user, owner: !!u && S.isOwner(u.email) });
};
