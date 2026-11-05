// 로그인 세션: 서명한 쿠키 하나로 관리해요. (_ 로 시작하는 파일은 Vercel 함수로 배포되지 않아요)
// 필요한 환경 변수: AUTH_SECRET (긴 임의 문자열), FIREBASE_CONFIG (웹 앱 설정 JSON) 또는 예전 방식의 GOOGLE_CLIENT_ID,
// OWNER_EMAILS (선택, 쉼표로 구분)
const crypto = require('crypto');

const COOKIE = 'dk_s';
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', process.env.AUTH_SECRET || '').update(data).digest('base64url');

// Firebase 웹 앱 설정 (공개해도 되는 값). 없으면 null
function fbConfig() {
  try {
    const c = JSON.parse(process.env.FIREBASE_CONFIG || 'null');
    return c && c.apiKey && c.projectId && c.authDomain ? { apiKey: c.apiKey, authDomain: c.authDomain, projectId: c.projectId, appId: c.appId || '' } : null;
  } catch (e) { return null; }
}

function configured() {
  return !!((process.env.GOOGLE_CLIENT_ID || fbConfig()) && process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16);
}

// Firebase 로그인 토큰(ID 토큰)을 구글 공개키로 확인해요. 맞으면 { uid, email, name, picture }
let CERTS = null, CERTS_AT = 0;
async function certs() {
  if (CERTS && Date.now() - CERTS_AT < 3600e3) return CERTS;
  const r = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!r.ok) throw new Error('certs ' + r.status);
  CERTS = await r.json(); CERTS_AT = Date.now(); return CERTS;
}
async function verifyFirebaseToken(token) {
  const fc = fbConfig(); if (!fc || typeof token !== 'string') return null;
  const [h, p, sig] = token.split('.'); if (!h || !p) return null;
  let head, pay;
  try { head = JSON.parse(Buffer.from(h, 'base64url')); pay = JSON.parse(Buffer.from(p, 'base64url')); } catch (e) { return null; }
  const now = Date.now() / 1000;
  if (pay.aud !== fc.projectId || pay.iss !== 'https://securetoken.google.com/' + fc.projectId) return null;
  if (!pay.sub || pay.exp < now || pay.iat > now + 300) return null;
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) { if (head.alg !== 'none') return null; } // 로컬 테스트 전용
  else {
    if (head.alg !== 'RS256' || !sig) return null;
    const pem = (await certs())[head.kid]; if (!pem) return null;
    const ok = crypto.createVerify('RSA-SHA256').update(h + '.' + p).verify(crypto.createPublicKey(pem), Buffer.from(sig, 'base64url'));
    if (!ok) return null;
  }
  if (pay.email && pay.email_verified === false) return null;
  return { uid: pay.sub, email: pay.email || '', name: pay.name || pay.email || '여행자', picture: pay.picture || '' };
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

module.exports = { configured, fbConfig, verifyFirebaseToken, isOwner, issue, clear, read };
