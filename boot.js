// 시작: 로그인 상태를 확인하고 앱을 불러와요.
// - 로그인 설정 전(서버에 GOOGLE_CLIENT_ID 없음): 로그인 없이 이 기기에 저장하는 모드
// - 로그인 안 함: 구글 로그인 화면
// - 오프라인: 마지막으로 로그인했던 사용자로 계속 사용
(function () {
  'use strict';
  const LAST = 'th.lastUser';
  const $ = (s) => document.querySelector(s);
  const load = (srcs) => srcs.reduce((p, src) => p.then(() => new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error(src)); document.body.appendChild(s);
  })), Promise.resolve());

  function start(user, owner, mode) {
    window.DK_USER = user || null;
    window.DK_OWNER = !!owner;
    window.DK_AUTH = mode; // 'google' | 'off'
    const box = $('#login'); if (box) box.hidden = true;
    const files = ['/data/cards.js'];
    if (owner) files.push('/data/route.js');
    files.push('/app.js');
    load(files).catch((e) => { $('#view').innerHTML = '<div class="card">앱을 불러오지 못했어요. 인터넷 연결 후 다시 열어 주세요. (' + e.message + ')</div>'; });
  }
  function remember(user, owner) { try { localStorage.setItem(LAST, JSON.stringify({ user, owner: !!owner })); } catch (e) {} }

  function showLogin(clientId) {
    const box = $('#login'); box.hidden = false;
    const msg = $('#loginMsg');
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onerror = () => { msg.textContent = '구글 로그인을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'; };
    s.onload = () => {
      google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'popup',
        callback: async (r) => {
          msg.textContent = '확인하는 중…';
          try {
            const res = await fetch('/api/auth', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ credential: r.credential }) });
            const j = await res.json();
            if (!res.ok) throw new Error(j.message || '로그인하지 못했어요.');
            remember(j.user, j.owner);
            start(j.user, j.owner, 'google');
          } catch (e) { msg.textContent = e.message; }
        }
      });
      google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'ko', width: 280 });
    };
    document.head.appendChild(s);
  }

  fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
    .then((r) => { if (!r.ok) throw new Error('me ' + r.status); return r.json(); })
    .then((m) => {
      if (!m.configured) return start(null, false, 'off');
      if (m.user) { remember(m.user, m.owner); return start(m.user, m.owner, 'google'); }
      try { localStorage.removeItem(LAST); } catch (e) {}
      showLogin(m.clientId);
    })
    .catch(() => {
      let c = null; try { c = JSON.parse(localStorage.getItem(LAST) || 'null'); } catch (e) {}
      start(c && c.user, c && c.owner, c ? 'google' : 'off');
    });
})();
