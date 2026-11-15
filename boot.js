// 시작: 로그인 상태를 확인하고 앱을 불러와요.
// - 로그인 설정 전: 로그인 없이 이 기기에 저장하는 모드
// - Firebase 설정이 있으면: Firebase 로그인 + 여행을 서버(Firestore)에 저장, 공유 링크 지원
// - 예전 설정(GOOGLE_CLIENT_ID 만): 구글 로그인 + 이 기기에 저장
// - 오프라인: 마지막으로 로그인했던 사용자로 계속 사용
(function () {
  'use strict';
  const LAST = 'th.lastUser', FBCFG = 'th.fbcfg', MODE = 'th.mode';
  const $ = (s) => document.querySelector(s);
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const load = (srcs) => srcs.reduce((p, src) => p.then(() => new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error(src)); document.body.appendChild(s);
  })), Promise.resolve());

  // 앱이 열리면 한 번 보여줄 안내 (링크 문제 등)
  const notice = (t) => { window.DK_NOTICE = t; };
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
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
    let why = '';
    if (P.t && !P.j) {
      try {
        const o = await C.open(P.t);
        if (o) { stage(o, 'th.v.' + P.t + '.'); return start(null, false, 'view'); }
        why = '링크의 여행을 찾지 못했어요. 지워졌거나 잘못된 링크예요.';
      } catch (e) {
        why = e && e.code === 'permission-denied' ? '보기 링크가 꺼져 있어요. 보낸 사람에게 다시 공유해 달라고 해 주세요. 함께 편집하는 사람이면 로그인해 주세요.'
          : '여행을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.';
      }
    }
    showFbLogin(P.j ? '초대받은 여행이에요. 로그인하면 같이 볼 수 있고 고칠 수 있어요.' : why);
  }
  function showFbLogin(note) {
    const box = $('#login'); box.hidden = false;
    const msg = $('#loginMsg'); msg.textContent = note || '';
    const g = $('#gbtn');
    g.innerHTML = '<button type="button" class="gsi"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.2 5.6c4.2-3.9 7.1-9.6 7.1-16.9z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.7 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg><span>Google로 계속하기</span></button>';
    g.firstChild.onclick = async () => {
      if (!navigator.onLine) { msg.textContent = '인터넷 연결을 확인하고 다시 눌러 주세요.'; return; }
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
        msg.textContent = (why || (navigator.onLine ? '로그인하지 못했어요. 다시 해 주세요.' : '인터넷 연결을 확인하고 다시 눌러 주세요.')) + (c ? '\u00a0(' + c.replace('auth/', '') + ')' : '');
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
      let linkId = P.t;
      if (P.t && P.j) {
        try { const r = await C.join(P.t, P.j); if (r === 'joined') notice('초대받은 여행에 들어왔어요. 이제 같이 고칠 수 있어요.'); }
        catch (e) {
          console.warn('join', e);
          notice(e && e.code === 'not-found' ? '초대받은 여행을 찾지 못했어요. 지워졌거나 잘못된 링크예요.'
            : e && e.code === 'permission-denied' ? '초대 링크가 바뀌었거나 잘못됐어요. 보낸 사람에게 새 링크를 받아 주세요.'
            : '초대받은 여행에 들어가지 못했어요. 인터넷 연결을 확인하고 링크를 다시 열어 주세요.');
          linkId = null;
        }
      }
      // '새 여행'을 누르고 다시 열렸으면 예전 여행을 자동으로 열지 않고 새로 만들기 화면을 보여줘요
      let fresh = false; try { fresh = sessionStorage.getItem('dk.newTrip') === '1'; } catch (e) {}
      const tryOpen = async (id) => {
        try { const o = await C.open(id); if (o) { stage(o, o.role === 'view' ? 'th.v.' + id + '.' : ns); return true; } return null; }
        catch (e) { return e; }
      };
      let opened = false;
      if (linkId) {
        const r = await tryOpen(linkId);
        if (r === true) opened = true;
        else notice(r === null ? '링크의 여행을 찾지 못했어요. 지워졌거나 잘못된 링크예요.'
          : r && r.code === 'permission-denied' ? '이 여행을 볼 수 없어요. 보기 링크가 꺼졌거나, 함께 편집하는 사람만 볼 수 있어요.'
          : '링크의 여행을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.');
      }
      if (!opened && !fresh) {
        let id = C.getCur();
        if (!id) { const ls = await C.list().catch(() => []); id = ls[0] && ls[0].id; }
        if (!id) id = await migrateLocal(C, u.uid);
        if (id) {
          const r = await tryOpen(id);
          if (r === true) opened = true;
          else if (r === null) { C.close(); lsSet(ns + 'trip', null); lsSet(ns + 'edits', null); } // 서버에서 정말 없어진 여행
          // 그 밖의 오류(오프라인 등)는 이 기기에 남은 일정으로 그대로 열어요
        } else { lsSet(ns + 'trip', null); lsSet(ns + 'edits', null); }
      }
      if (fresh && !opened) { lsSet(ns + 'trip', null); lsSet(ns + 'edits', null); }
    } catch (e) { console.warn('cloud', e); } // 오프라인이면 이 기기에 남은 일정으로 열어요
    clearParams();
    start(user, owner, 'google');
  }
  // 로그인 전에 이 기기에서 만든 여행이 있으면 처음 한 번 서버로 옮겨요
  // (다른 계정의 사본은 절대 가져오지 않아요)
  async function migrateLocal(C, uid) {
    const keys = ['th.u.' + uid + '.trip', 'th.trip'];
    for (const k of keys) {
      const t = lsGet(k);
      if (t && t.start && t.end) {
        const id = await C.create(t, lsGet(k.replace(/trip$/, 'edits')) || {});
        lsSet(k, null); return id;
      }
    }
    return null;
  }

  // 응답 없는 네트워크(지하철 와이파이 등)에서 멈추지 않게 6초까지만 기다려요
  const ctl = window.AbortController ? new AbortController() : null;
  const meT = setTimeout(() => ctl && ctl.abort(), 6000);
  function boot() {
    return fetch('/api/me', { credentials: 'same-origin', cache: 'no-store', signal: ctl && ctl.signal })
      .then((r) => { if (!r.ok) throw new Error('me ' + r.status); return r.json(); })
      .then((m) => {
        clearTimeout(meT);
        if (!m.configured) { lsSet(MODE, 'off'); return start(null, false, 'off'); }
        if (m.firebase) { lsSet(MODE, 'fb'); return firebaseFlow(m.firebase, m).catch((e) => { console.warn(e); start(m.user, m.owner, 'google'); }); }
        lsSet(MODE, 'gis');
        if (m.user) { remember(m.user, m.owner); return start(m.user, m.owner, 'google'); }
        lsSet(LAST, null);
        showGisLogin(m.clientId);
      })
      .catch(() => {
        clearTimeout(meT);
        // 오프라인·서버 오류: 지난번 방식대로 열어요. Firebase 설정이 남아 있으면 저장된 사본(오프라인 캐시)으로
        const cfg = lsGet(FBCFG), c = lsGet(LAST), mode = lsGet(MODE);
        if (cfg && (mode === 'fb' || !mode)) return firebaseFlow(cfg, c && c.user ? { user: c.user, owner: c.owner } : null).catch(() => c && c.user ? start(c.user, c.owner, 'google') : serverDown());
        if (mode === 'off') return start(null, false, 'off');
        if (c && c.user) return start(c.user, c.owner, 'google');
        serverDown();
      });
  }
  // 처음 쓰는 기기인데 서버에 닿지 않을 때: 조용히 다른 모드로 열지 않고 알려요
  function serverDown() {
    const box = $('#login'); box.hidden = false;
    $('#loginMsg').textContent = navigator.onLine ? '서버에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.' : '인터넷에 연결되지 않았어요. 연결한 뒤 다시 시도해 주세요.';
    $('#gbtn').innerHTML = '<button type="button" class="gsi"><span>다시 시도</span></button>';
    $('#gbtn').firstChild.onclick = () => location.reload();
  }
  boot();
})();
