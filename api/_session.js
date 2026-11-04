// 로그인 세션: 서명한 쿠키 하나로 관리해요. (_ 로 시작하는 파일은 Vercel 함수로 배포되지 않아요)
// 필요한 환경 변수: GOOGLE_CLIENT_ID, AUTH_SECRET (긴 임의 문자열), OWNER_EMAILS (선택, 쉼표로 구분)
const crypto = require('crypto');

const COOKIE = 'dk_s';
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', process.env.AUTH_SECRET || '').update(data).digest('base64url');

function configured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
}

function isOwner(email) {
  const list = String(process.env.OWNER_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  return !!email && list.includes(String(email).toLowerCase());
}

function issue(res, user) {
  const body = b64(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  const value = `${body}.${sign(body)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

function clear(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function read(req) {
  if (!configured()) return null;
  const raw = String(req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [body, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!body || !sig) return null;
  const want = sign(body);
  if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  try {
    const u = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!u.exp || u.exp < Date.now() / 1000) return null;
    return u;
  } catch (e) {
    return null;
  }
}

module.exports = { configured, isOwner, issue, clear, read };
