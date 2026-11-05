// 시작: 로그인 상태를 확인하고 앱을 불러와요.
// - 로그인 설정 전: 로그인 없이 이 기기에 저장하는 모드
// - Firebase 설정이 있으면: Firebase 로그인 + 여행을 서버(Firestore)에 저장, 공유 링크 지원
// - 예전 설정(GOOGLE_CLIENT_ID 만): 구글 로그인 + 이 기기에 저장
// - 오프라인: 마지막으로 로그인했던 사용자로 계속 사용
(function () {
  'use strict';
  const LAST = 'th.lastUser', FBCFG = 'th.fbcfg';
  const $ = (s) => document.querySelector(s);
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const load = (srcs) => srcs.reduce((p, src) => p.then(() => new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error(src)); document.body.appendChild(s);
  })), Promise.resolve());

  function start(user, owner, mode) {
    window.DK_USER = user || null;
    window.DK_OWNER = false; // 모든 사용자를 똑같이 다뤄요 (예전 주인 전용 일정 모드는 쓰지 않아요)
    window.DK_AUTH = mode; // 'google' | 'off' | 'view'
    const box = $('#login'); if (box) box.hidden = true;
    const files = ['/data/cards.js'];
    files.push('/app.js');
    load(files).catch((e) => { $('#view').innerHTML = '<div class="card">앱을 불러오지 못했어요. 인터넷 연결 후 다시 열어 주세요. (' + e.message + ')</div>'; });
  }
  function remember(user, owner) { lsSet(LAST, { user, owner: !!owner }); }

  // ---------- 예전 방식: 구글 로그인(GIS) ----------
  function showGisLogin(clientId) {
    const box = $('#login'); box.hidden = false;
    const msg = $('#loginMsg');
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onerror = () => { msg.textContent = '구글 로그인을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'; };
    s.onload = () => {
      google.accounts.id.initialize({
        client_id: clientId, ux_mode: 'popup',
        callback: async (r) => {
          msg.textContent = '확인하는 중…';
          try {
            const res = await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ credential: r.credential }) });
            const j = await res.json();
            if (!res.ok) throw new Error(j.message || '로그인하지 못했어요.');
            remember(j.user, j.owner); start(j.user, j.owner, 'google');
          } catch (e) { msg.textContent = e.message; }
        }
      });
      google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'ko', width: 280 });
    };
    document.head.appendChild(s);
  }

  // ---------- Firebase ----------
  const params = new URLSearchParams(location.search);
  const P = { t: params.get('t'), j: params.get('j') };
  const clearParams = () => { if (P.t || P.j) history.replaceState(null, '', location.pathname + location.hash); };

  async function firebaseFlow(cfg, me) {
    lsSet(FBCFG, cfg);
    await load(['/vendor/firebase.js', '/cloud.js']);
    const C = window.DK_CLOUD;
    const fbUser = await C.init(cfg);
    if (fbUser) return signedIn(me);
    // 로그인 안 함: 보기 링크면 로그인 없이 보여줘요
    if (P.t && !P.j) {
      try {
        const o = await C.open(P.t);
        if (o) { stage(o, 'th.v.' + P.t + '.'); return start(null, false, 'view'); }
      } catch (e) {}
    }
    showFbLogin(P.j ? '초대받은 여행이에요. 로그인하면 같이 볼 수 있고 고칠 수 있어요.' : '');
  }
  function showFbLogin(note) {
    const box = $('#login'); box.hidden = false;
    const msg = $('#loginMsg'); msg.textContent = note || '';
    const g = $('#gbtn');
    g.innerHTML = '<button type="button" class="gsi"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.2 5.6c4.2-3.9 7.1-9.6 7.1-16.9z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.7 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg><span>Google로 계속하기</span></button>';
    g.firstChild.onclick = async () => {
      msg.textContent = '로그인 창을 여는 중…';
      try { await window.DK_CLOUD.signIn(); msg.textContent = '확인하는 중…'; await signedIn(null); }
      catch (e) {
        const c = (e && e.code) || '';
        const why = {
          'auth/popup-blocked': '로그인 창이 막혔어요. 팝업을 허용하고 다시 눌러 주세요.',
          'auth/popup-closed-by-user': '로그인 창이 닫혔어요. 다시 눌러 주세요.',
          'auth/cancelled-popup-request': '로그인 창이 닫혔어요. 다시 눌러 주세요.',
          'auth/unauthorized-domain': '이 주소가 Firebase 승인된 도메인에 없어요. (Authentication → 설정 → 승인된 도메인)',
          'auth/operation-not-allowed': 'Firebase에서 Google 로그인이 아직 꺼져 있어요. (Authentication → 로그인 방법)',
          'auth/network-request-failed': '인터넷 연결을 확인하고 다시 눌러 주세요.'
        }[c];
        msg.textContent = (why || '로그인하지 못했어요. 다시 해 주세요.') + (c ? ' [' + c + ']' : e && e.message ? ' [' + String(e.message).slice(0, 80) + ']' : '');
        console.warn('login', e);
      }
    };
  }
  // 앱이 읽는 이 기기 저장소에 여행을 펼쳐 둬요
  function stage(o, ns) {
    window.DK_NS = ns;
    lsSet(ns + 'trip', o.trip); lsSet(ns + 'edits', o.edits);
  }
  async function signedIn(me) {
    const C = window.DK_CLOUD, u = C.user;
    let user = { id: u.uid, email: u.email || '', name: u.displayName || u.email || '여행자', picture: u.photoURL || '' }, owner = false;
    // 서버(AI 등)도 같은 사람으로 알도록 쿠키를 맞춰요
    if (me && me.user && me.user.id === u.uid) owner = !!me.owner;
    else {
      try {
        const r = await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: await C.idToken() }) });
        const j = await r.json(); if (r.ok) { owner = !!j.owner; } else throw new Error(j.message);
      } catch (e) { const l = lsGet(LAST); owner = !!(l && l.user && l.user.id === u.uid && l.owner); }
    }
    remember(user, owner);
    const ns = 'th.u.' + u.uid + '.';
    try {
      if (P.t && P.j) await C.join(P.t, P.j).catch((e) => console.warn('join', e));
      // '새 여행'을 누르고 다시 열렸으면 예전 여행을 자동으로 열지 않고 새로 만들기 화면을 보여줘요
      let fresh = false; try { fresh = sessionStorage.getItem('dk.newTrip') === '1'; sessionStorage.removeItem('dk.newTrip'); } catch (e) {}
      let id = P.t || C.getCur();
      if (!id && !fresh) { const ls = await C.list(); id = ls[0] && ls[0].id; }
      if (!id && !fresh) id = await migrateLocal(C, u.uid);
      if (id) {
        const o = await C.open(id).catch(() => null);
        if (o) stage(o, o.role === 'view' ? 'th.v.' + id + '.' : ns);
        else { C.close(); lsSet(ns + 'trip', null); lsSet(ns + 'edits', null); }
      } else { lsSet(ns + 'trip', null); lsSet(ns + 'edits', null); }
    } catch (e) { console.warn('cloud', e); } // 오프라인이면 이 기기에 남은 일정으로 열어요
    clearParams();
    start(user, owner, 'google');
  }
  // 로그인 전에 이 기기에서 만든 여행이 있으면 처음 한 번 서버로 옮겨요
  async function migrateLocal(C, uid) {
    const keys = ['th.u.' + uid + '.trip', 'th.trip'];
    try { Object.keys(localStorage).forEach((k) => { if (/^th\.u\.[^.]+\.trip$/.test(k) && !keys.includes(k)) keys.push(k); }); } catch (e) {}
    for (const k of keys) {
      const t = lsGet(k);
      if (t && t.start && t.end) {
        const id = await C.create(t, lsGet(k.replace(/trip$/, 'edits')) || {});
        lsSet(k, null); return id;
      }
    }
    return null;
  }

  fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
    .then((r) => { if (!r.ok) throw new Error('me ' + r.status); return r.json(); })
    .then((m) => {
      if (!m.configured) return start(null, false, 'off');
      if (m.firebase) return firebaseFlow(m.firebase, m).catch((e) => { console.warn(e); start(m.user, m.owner, 'google'); });
      if (m.user) { remember(m.user, m.owner); return start(m.user, m.owner, 'google'); }
      lsSet(LAST, null);
      showGisLogin(m.clientId);
    })
    .catch(() => {
      // 오프라인: Firebase 설정이 남아 있으면 저장된 사본(Firestore 오프라인 캐시)으로 열어요
      const cfg = lsGet(FBCFG), c = lsGet(LAST);
      if (cfg && c && c.user) return firebaseFlow(cfg, { user: c.user, owner: c.owner }).catch(() => start(c.user, c.owner, 'google'));
      start(c && c.user, c && c.owner, c ? 'google' : 'off');
    });
})();
