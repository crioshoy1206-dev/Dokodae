(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const view = $('#view');

  // ---------- 아이콘: 단색 선 아이콘 (글자색을 따라가요) ----------
  const IC = {
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M8.8 7.8 12 12l3.2-4.2M12 12v5M9.3 12.6h5.4M9.3 15h5.4"/>',
    down: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
    train: '<rect x="5" y="3.5" width="14" height="13" rx="3"/><path d="M5 10h14M8.5 13.2h.01M15.5 13.2h.01M8.5 16.5 6.5 20.5M15.5 16.5l2 4"/>',
    food: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8.5 20.5h7M13 3.5l-4 6M18.5 4l-6 6"/>',
    torii: '<path d="M3 5c3 1.2 15 1.2 18 0M5 9.5h14M7 6.3V21M17 6.3V21M12 6.5v3"/>',
    stay: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M10.5 20.5v-4h3v4"/>',
    sos: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    speak: '<path d="M4 5h16v10.5h-9l-4.5 3.5v-3.5H4z"/><path d="M8 9h8M8 12h5"/>',
    bulb: '<path d="M9.5 17.5h5M10.5 20.5h3M12 3.5a6 6 0 0 0-3.5 10.9v1.6h7v-1.6A6 6 0 0 0 12 3.5z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    map: '<path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>',
    tap: '<path d="M9.5 11.5V5a1.5 1.5 0 0 1 3 0v6m0-1a1.5 1.5 0 0 1 3 0v1.5m0-.5a1.5 1.5 0 0 1 3 0v3.5a6 6 0 0 1-6 6h-.8a6 6 0 0 1-4.9-2.6l-2-3a1.5 1.5 0 0 1 2.4-1.8l1.3 1.6"/>',
    chat: '<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-7l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
    clip: '<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5v-1h6v1M9 10h6M9 13.5h6M9 17h3"/>',
    camera: '<path d="M4 8h3.2l1.5-2.5h6.6L16.8 8H20v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    phone: '<path d="M5 4h4l1.5 4-2.5 1.5a11 11 0 0 0 6.5 6.5l1.5-2.5 4 1.5v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
    chev: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>',
    loc: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    fit: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
    layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>', x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    star: '<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  const I = (n) => IC[n] ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>` : '';
  const panel = $('#panel');
  // 날짜 칩 줄: 마우스 휠과 끌기로도 옆으로 넘길 수 있게 해요 (PC)
  (function () {
    const el = $('#days'); if (!el) return;
    el.addEventListener('wheel', (e) => { if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; el.scrollLeft += e.deltaY; e.preventDefault(); }, { passive: false });
    let x0 = null, s0 = 0, moved = false;
    el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; x0 = e.clientX; s0 = el.scrollLeft; moved = false; });
    window.addEventListener('pointermove', (e) => { if (x0 == null) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; el.scrollLeft = s0 - dx; });
    window.addEventListener('pointerup', () => { x0 = null; });
    el.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  })();
  // 지도 레이어 버튼이 날짜 칩 아래에 오도록 상단 바 높이를 CSS 변수로 넘겨요.
  (function () { const tb = $('#topbar'); if (!tb) return; const f = () => document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px'); f(); if (window.ResizeObserver) new ResizeObserver(f).observe(tb); })();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 로그인한 사용자마다 저장 공간을 따로 써요
  const USER = window.DK_USER || null, OWNER = !!window.DK_OWNER && !!window.ROUTE;
  const NS = window.DK_NS || (USER ? 'th.u.' + USER.id + '.' : 'th.');
  const CL = window.DK_CLOUD && window.DK_CLOUD.user && !window.DK_OWNER ? window.DK_CLOUD : null; // 서버 저장(Firebase) 사용 중
  let VIEW = window.DK_AUTH === 'view' || !!(CL && CL.readonly); // 보기 링크로 열어 읽기만 하는 중
  const store = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} if (CL && (k === 'edits' || k === 'trip')) CL.save(k, v); }
  };
  const DESKQ = window.matchMedia('(min-width:900px), (orientation:landscape) and (max-height:520px) and (min-width:640px)');
  const isDesk = () => DESKQ.matches;

  // ---------- 여행 데이터 ----------
  // 주인 계정(OWNER_EMAILS)만 기존 일본 여행 일정을 받고, 다른 사용자는 빈 일정에서 직접 만들어요.
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const dayRange = (a, b) => { const out = []; const d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); while (d <= e && out.length < 31) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); } return out; };
  const md = (dt) => `${+dt.slice(5, 7)}/${+dt.slice(8, 10)}`;
  const wd = (dt) => WD[new Date(dt + 'T00:00:00Z').getUTCDay()];
  let UT, TRIP_START, TRIP_END, DATES, STAYS, R;
  // 여행을 바꾸거나 새로 만들 때 새로고침 없이 다시 불러요
  function setupTrip() {
  UT = OWNER ? null : store.get('trip', null);
  if (OWNER) {
    TRIP_START = '2027-01-08'; TRIP_END = '2027-01-14';
    DATES = ['2027-01-08', '2027-01-09', '2027-01-10', '2027-01-11', '2027-01-12', '2027-01-13', '2027-01-14'];
    STAYS = [
      { from: '2027-01-08', to: '2027-01-11', name: '마루코우 호텔 아키하바라', addr: '東京都台東区台東1-28-8', tel: '+81-70-9199-5686' },
      { from: '2027-01-11', to: '2027-01-12', name: '심야버스 (버스타 신주쿠 → OCAT 난바)', addr: '예약 메일의 승차장 확인', tel: '' },
      { from: '2027-01-12', to: '2027-01-14', name: 'K HOTEL NAMBA', addr: '大阪市浪速区元町2-11-15', tel: '+81-6-7410-7986', note: '셀프 체크인 15:00~23:00, 체크아웃 10:00' }
    ];
    R = window.ROUTE;
  } else {
    DATES = UT ? dayRange(UT.start, UT.end) : [];
    TRIP_START = DATES[0] || ''; TRIP_END = DATES[DATES.length - 1] || '';
    STAYS = UT && UT.stay ? [{ from: TRIP_START, to: '9999-12-31', name: UT.stay, addr: UT.stayAddr || '', tel: '' }] : [];
    R = { LINES: {}, RIDE: {}, TODO: {}, PLANS: {}, DAYS: DATES.map((dt, i) => ({ id: 'u' + dt, tab: `${md(dt)} ${wd(dt)}`, title: `${md(dt)} (${wd(dt)}) ${i + 1}일차`, sub: UT.title || '', stops: [], meals: [] })) };
    R.DAYS.forEach((d) => { R.PLANS[d.id] = []; });
  }
  }
  const stayOn = (day) => STAYS.find((s) => day >= s.from && day < s.to) || STAYS[STAYS.length - 1] || null;
  const CARD = Object.fromEntries(window.CARDS.map((c) => [c.id, c]));
  const PRI = getComputedStyle(document.documentElement).getPropertyValue('--pri').trim() || '#4E978D';
  let IT = [];
  const TABS = ['plan', 'ask', 'cards', 'phrases', 'pay', 'sos'];
  const firstTab = (location.hash || '').slice(1);
  const S = {
    tab: TABS.includes(firstTab) ? firstTab : 'plan',
    day: null,
    cat: 'all',
    query: '',
    open: null,
    sel: null,
    xp: new Set(),
    chat: store.get('chat', []),
    pendingImg: null,
    busy: false,
    sheet: 'peek'
  };

  // ---------- 시간 ----------
  function nowJST() {
    const sim = store.get('sim', '');
    if (sim) { const [d, t] = sim.split('T'); return { d, t: t.slice(0, 5), sim: true }; }
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = (k) => p.find((x) => x.type === k).value;
    return { d: `${g('year')}-${g('month')}-${g('day')}`, t: `${g('hour') === '24' ? '00' : g('hour')}:${g('minute')}`, sim: false };
  }
  const mins = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
  const ord = (t) => { const m = mins(t); return m < 240 ? m + 1440 : m; }; // 정렬용: 새벽 4시 전은 그날 밤으로
  const inTrip = (n) => n.d >= TRIP_START && n.d <= TRIP_END;
  function stepState(st, n) {
    if (st.d < n.d) return 'past';
    if (st.d > n.d) return 'future';
    const s = mins(st.s), e0 = mins(st.e), e = e0 <= s ? e0 + 1440 : e0, t = mins(n.t);
    if (t < s) return 'future';
    if (t >= e) return 'past';
    return 'cur';
  }
  function findNow(n) {
    let cur = null, next = null;
    for (const st of IT) {
      const s = stepState(st, n);
      if (s === 'cur') cur = cur || st;
      else if (s === 'future' && !next) next = st;
    }
    // 전날 밤 출발해서 아침에 끝나는 단계 (심야버스)
    if (!cur) {
      const prev = IT.filter((x) => x.d < n.d && mins(x.e) < mins(x.s)).pop();
      if (prev) { const dd = new Date(prev.d + 'T00:00:00Z'); dd.setUTCDate(dd.getUTCDate() + 1); if (dd.toISOString().slice(0, 10) === n.d && mins(n.t) < mins(prev.e)) cur = prev; }
    }
    return { cur, next };
  }
  function cardsForText(text, max) {
    const ids = [];
    for (const r of window.STEP_RULES) if (r.re.test(text) && !ids.includes(r.card)) ids.push(r.card);
    return ids.slice(0, max || 3).map((id) => CARD[id]).filter(Boolean);
  }
  const cardsForStep = (st) => cardsForText([st.todo, st.board, st.alight, st.memo].join(' '));
  function searchCards(q, limit) {
    const words = String(q || '').toLowerCase().split(/[\s,.?!]+/).filter((w) => w.length >= 2);
    if (!words.length) return [];
    return window.CARDS.map((c) => {
      const hay = (c.title + ' ' + c.sum + ' ' + c.tags.join(' ')).toLowerCase();
      let sc = 0;
      for (const w of words) {
        if (c.tags.some((t) => w.includes(t) || t.includes(w))) sc += 3;
        else if (hay.includes(w)) sc += 1;
      }
      return { c, sc };
    }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, limit || 5).map((x) => x.c);
  }

  // ---------- 동선 데이터 정리 (기존 동선 지도와 같은 규칙) ----------
  const seg = (key, a, b) => { const st = R.LINES[key].s, i = st.findIndex((x) => x[0] === a), j = st.findIndex((x) => x[0] === b); return i <= j ? st.slice(i, j + 1) : st.slice(j, i + 1).reverse(); };
  function setupRides() {
  R.DAYS.forEach((d, i) => {
    d.date = DATES[i];
    if (d.start) { d.stops.unshift(d.start); d.meals.forEach((m) => m.at++); R.PLANS[d.id] = R.PLANS[d.id].map((x) => (typeof x === 'number' ? x + 1 : x)); }
    // 열차 구간은 그 직전 장소의 할 일 맨 위에 '타는 곳'으로
    d.rides = {}; let mx = 0;
    R.PLANS[d.id].forEach((it) => {
      if (typeof it === 'number') { mx = Math.max(mx, it); return; }
      const [key, a, b] = it, ln = R.LINES[key], x = R.RIDE[it.join('|')];
      if (!x) return;
      const n = seg(key, a, b).length - 1;
      (d.rides[mx] = d.rides[mx] || []).push(`${ln.n}: ${x[0]} → '${x[1]}' 방면 → ${x[2] || n + '정거장 → ' + b + ' 하차'}`);
    });
  });
  }
  // ---------- 일정 편집 (이 기기에 저장) ----------
  // EDITS[dayId] = { mod: {원래순번: {t,n,m,todo,lat,lng}}, del: [원래순번], add: [{id,t,n,m,todo,lat,lng}] }
  let EDITS = {};
  // 같이 편집하는 사람이 고친 내용을 바로 반영해요 (내가 고치던 내용과 합쳐서 와요)
  if (window.DK_CLOUD) window.DK_CLOUD.onRemote((trip, edits, info) => {
    if (info && info.gone) {
      // 만든 사람이 여행을 지웠어요
      try { ['trip', 'edits'].forEach((k) => localStorage.removeItem(NS + k)); } catch (e) {}
      if (CL) CL.close();
      reopenTrip(); toast(info.kicked ? '만든 사람이 이 여행에서 나를 내보냈어요.' : '이 여행은 만든 사람이 지웠어요. 더는 고칠 수 없어요.', null, 6000);
      return;
    }
    try { localStorage.setItem(NS + 'trip', JSON.stringify(trip)); localStorage.setItem(NS + 'edits', JSON.stringify(edits)); } catch (e) {}
    if (!UT || trip.start !== UT.start || trip.end !== UT.end) { if (!S.edit) reopenTrip(); }
    else {
      if (trip.title !== UT.title || trip.stay !== UT.stay) { UT = Object.assign(UT, trip); }
      keepSel(() => { EDITS = edits; R.DAYS.forEach(applyEdits); });
      if (info && info.plan) drawnDay = null;
      if (!S.edit) render(); else renderDays();
    }
    offlineSoon();
    toast(info && info.pay && !info.plan ? '함께 쓰는 사람이 경비를 고쳤어요.' : '함께 편집하는 사람이 일정을 고쳤어요.');
  });
  if (window.DK_CLOUD && window.DK_CLOUD.onStatus) window.DK_CLOUD.onStatus(() => { try { clock(); const el = $('#syncInfo'); if (el) el.innerHTML = syncInfo(); } catch (e) {} });
  // 일정이 바뀌어 순번이 밀려도, 펼쳐 둔 장소·고른 장소·고치던 장소를 그대로 따라가요
  function keepSel(fn) {
    const d = dayOf(S.day);
    if (!d || !d.stops) return fn();
    const k = (i) => (d.stops[i] ? d.stops[i].key : null);
    const sel = S.sel != null ? k(S.sel) : null, xp = [...S.xp].map(k), ed = S.edit && S.edit.i !== 'new' ? k(S.edit.i) : null;
    fn();
    const d2 = dayOf(S.day), at = (key) => (key == null ? -1 : d2.stops.findIndex((x) => x.key === key && !x.del));
    const si = at(sel); S.sel = si >= 0 ? si : null;
    S.xp = new Set(xp.map(at).filter((i) => i >= 0));
    if (ed != null) {
      const ei = at(ed);
      if (ei >= 0) S.edit.i = ei;
      else { S.edit.i = 'new'; S.edit.lost = true; toast('다른 사람이 이 일정을 지웠어요. 저장하면 새 일정으로 들어가요.', null, 5000); }
    }
  }
  const edOf = (d) => { const e = EDITS[d.id] = EDITS[d.id] || {}; e.mod = e.mod || {}; e.del = e.del || []; e.add = e.add || []; return e; };
  const hasEdits = (d) => { const e = EDITS[d.id]; return !!e && (Object.keys(e.mod || {}).length + (e.del || []).length + (e.add || []).length > 0); };
  function applyEdits(d) {
    const e = EDITS[d.id] || {}, mod = e.mod || {}, del = e.del || [];
    d.stops = d.base.map((b, i) => {
      const x = b.slice(); x.key = b[1]; const m = mod[i];
      if (m) {
        if (m.t != null) x[0] = m.t; if (m.n != null) x[1] = m.n; if (m.m != null) x[2] = m.m;
        if (m.lat != null) { x[3] = m.lat; x[4] = m.lng; }
        if (m.todo) x.todo = m.todo;
        x.edited = 1;
      }
      if (del.includes(i)) x.del = 1;
      return x;
    }).concat((e.add || []).map((a) => { const x = [a.t, a.n, a.m || '', a.lat == null ? null : a.lat, a.lng == null ? null : a.lng, 's']; x.key = 'c' + a.id; x.custom = a.id; x.todo = a.todo || []; x.chk = a.chk || []; if (a.go && a.go.m) x.go = a.go; return x; }));
    // 보여주는 순서: 원래 순서는 그대로 두고, 추가한 일정은 시간에 맞춰 끼워 넣어요
    // 새벽 4시 전 일정(예: 00:30 숙소 복귀)은 그날 밤 늦은 일정으로 보고 맨 뒤에 둬요
    const seq = d.base.map((b, i) => i), nb = d.base.length;
    d.stops.slice(nb).map((x, k) => nb + k).sort((a, b) => ord(d.stops[a][0]) - ord(d.stops[b][0])).forEach((ci) => {
      const t = ord(d.stops[ci][0]);
      const pos = seq.findIndex((j, p) => p > 0 && ord(d.stops[j][0]) > t);
      if (pos < 0) seq.push(ci); else seq.splice(pos, 0, ci);
    });
    d.seq = seq;
    d.vis = seq.filter((i) => !d.stops[i].del);
  }
  const numOf = (d, i) => d.vis.indexOf(i) + (d.start ? 0 : 1); // 출발점이 없는 일정은 1번부터
  function saveEdits() { keepSel(() => { store.set('edits', EDITS); R.DAYS.forEach(applyEdits); }); drawnDay = null; offlineSoon(); }
  function loadTrip() {
    setupTrip(); setupRides(); EDITS = store.get('edits', {});
    R.DAYS.forEach((d) => { d.base = d.stops.map((x) => x.slice()); applyEdits(d); });
  }
  loadTrip();

  const FAR = new Set(['나리타공항', '간사이공항 T1', '에노덴 후지사와역']);
  const dayOf = (date) => (date === 'prep' ? null : R.DAYS.find((d) => d.date === date) || R.DAYS[0]);
  const todoList = (d, s) => s.todo || (R.TODO[d.id] || {})[s.key || s[1]] || [];
  const tdKey = (d, s, k) => 'todo|' + d.id + '|' + (s.key || s[1]) + '|' + (s.todo ? 'e' : '') + k;
  const tdGet = (k) => { try { return localStorage.getItem(NS + k) === '1'; } catch (e) { return false; } };
  const tdSet = (k, v) => { try { v ? localStorage.setItem(NS + k, '1') : localStorage.removeItem(NS + k); } catch (e) {} };
  // 예전에 이 기기에만 저장한 체크(줄 번호 기준)도 처음 한 번은 살려서 보여줘요
  const isChk = (d, s, t, k) => (s.chk || []).includes(t) || (!(s.chk || []).length && tdGet(tdKey(d, s, k)));
  function toggleChk(i, k) {
    const d = dayOf(S.day), s = d && d.stops[i]; if (!s || s.custom == null) return;
    const a = edOf(d).add.find((v) => v.id === s.custom); if (!a) return;
    const t = (a.todo || [])[k]; if (t == null) return;
    let c = a.chk ? a.chk.slice() : (a.todo || []).filter((x, j) => tdGet(tdKey(d, s, j)));
    (a.todo || []).forEach((x, j) => tdSet(tdKey(d, s, j), false));
    c = c.includes(t) ? c.filter((x) => x !== t) : c.concat(t);
    a.chk = c.filter((x) => (a.todo || []).includes(x));
    store.set('edits', EDITS); applyEdits(d);
    return a.chk.includes(t);
  }
  const gq = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  // ---------- 노선색 · 역번호 ----------
  // 일정 글에 나온 노선 이름으로 구간 색을 정해요 (실제 노선 표지 색)
  const LINEC = [
    ['메트로 주오선', '#019A66'], ['오사카 주오선', '#019A66'], ['주오·소부', '#FFD400'],
    ['긴자선', '#F39700'], ['마루노우치', '#E60012'], ['히비야', '#9CAEB7'], ['도자이', '#00A7DB'], ['지요다', '#009944'], ['유라쿠초', '#C1A470'],
    ['한조몬', '#8F76D6'], ['난보쿠', '#00AC9B'], ['후쿠토신', '#9C5E31'], ['아사쿠사선', '#E85298'], ['미타선', '#0079C2'], ['신주쿠선', '#6CBB5A'], ['오에도', '#B6007A'],
    ['야마노테', '#80C241'], ['게이힌토호쿠', '#00B2E5'], ['소부', '#FFD400'], ['주오선', '#F15A22'], ['쾌속', '#F15A22'], ['요코스카', '#0067C0'], ['쇼난신주쿠', '#E21F26'],
    ['스카이라이너', '#005AAA'], ['게이세이', '#005AAA'], ['오다큐', '#2288CC'], ['로망스카', '#2288CC'], ['에노덴', '#2E8B57'], ['에노시마 전철', '#2E8B57'], ['모노레일', '#00838F'],
    ['유리카모메', '#1E50A2'], ['린카이', '#00418E'], ['게이큐', '#E5171F'], ['도큐', '#DA0442'], ['게이오', '#DD0077'], ['세이부', '#00A0DE'], ['도부', '#0F378E'],
    ['미도스지', '#E5171F'], ['다니마치', '#522886'], ['요쓰바시', '#0078BA'], ['요츠바시', '#0078BA'], ['주오센', '#019A66'], ['센니치마에', '#E44D93'], ['사카이스지', '#814721'],
    ['나가호리', '#A9CC51'], ['이마자토스지', '#EE7B1A'], ['뉴트램', '#00A3D9'], ['간조', '#F18C43'], ['순환선', '#F18C43'], ['유메사키', '#1E5BAA'], ['난카이', '#F27420'],
    ['한큐', '#7B2F2F'], ['한신', '#0060B6'], ['긴테쓰', '#C7151E'], ['게이한', '#00754A'], ['하루카', '#0D3B8C'], ['신칸센', '#1C5BA8'], ['심야버스', '#4E5968'], ['버스', '#4E5968'], ['택시', '#4E5968']
  ];
  const TOKYO_C = { G: '#F39700', M: '#E60012', Mb: '#E60012', H: '#9CAEB7', T: '#00A7DB', C: '#009944', Y: '#C1A470', Z: '#8F76D6', N: '#00AC9B', F: '#9C5E31', A: '#E85298', I: '#0079C2', S: '#6CBB5A', E: '#B6007A',
    JY: '#80C241', JK: '#00B2E5', JB: '#FFD400', JC: '#F15A22', JO: '#0067C0', JS: '#E21F26', JA: '#00AC9A', KS: '#005AAA', OH: '#2288CC', OE: '#2288CC', EN: '#2E8B57', KK: '#E5171F', TY: '#DA0442', DT: '#DA0442', KO: '#DD0077', SI: '#00A0DE', TS: '#0F378E', U: '#1E50A2', R: '#00418E' };
  const OSAKA_C = { M: '#E5171F', T: '#522886', Y: '#0078BA', C: '#019A66', S: '#E44D93', K: '#814721', N: '#A9CC51', I: '#EE7B1A', P: '#00A3D9', JR: '#F18C43', O: '#F18C43', NK: '#F27420', HK: '#7B2F2F', HS: '#0060B6', KH: '#00754A' };
  // 실제 노선 색은 너무 쨍해서 앱 톤에 맞게 채도를 낮추고 밝기를 고르게 맞춰요 (색 구분은 그대로)
  const DARKC = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  function tone(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    s = s * 0.6; const L2 = Math.min(0.66, Math.max(0.34, (DARKC ? 0.62 : 0.45) + (l - 0.5) * 0.3));
    const c = (1 - Math.abs(2 * L2 - 1)) * s, x = c * (1 - Math.abs((h % 2) - 1)), m = L2 - c / 2;
    const [R, G, B] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
    return '#' + [R, G, B].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  }
  LINEC.forEach((e) => { e[1] = tone(e[1]); });
  [TOKYO_C, OSAKA_C].forEach((t) => Object.keys(t).forEach((k) => { t[k] = tone(t[k]); }));
  const isOsaka = (d) => { const s = d && (d.stops || []).find((x) => x && x[3] != null); return !!(s && s[3] < 35.2); };
  // 이미 esc 된 글에서 (G-14) 같은 역번호를 배지로 바꿔요
  function badges(h, osaka) {
    const tb = osaka ? OSAKA_C : TOKYO_C;
    return h.replace(/\(?\b([A-Z]{1,2})-?(\d{2})\b\)?/g, (m, l, n) => {
      if (!/[-(]/.test(m) && !/^\(/.test(m)) return m;
      const c = tb[l]; if (!c) return m;
      return `<span class="sta" style="--sc:${c}" aria-label="역번호 ${l}${n}"><b>${l}</b><i>${n}</i></span>`;
    });
  }
  // 이 장소로 오는 구간: 할 일 글에서 노선 이름과 걸리는 시간을 찾아요
  const GO_NAME = { walk: '걸어서', rail: '전철', bus: '버스', taxi: '택시' };
  const lineColor = (nm) => { const h = LINEC.find(([k]) => nm && nm.includes(k)); return h ? h[1] : null; };
  function legOf(d, i, prev) {
    const s = d.stops[i];
    // 사용자가 정한 이동 방법이 있으면 그대로 써요
    if (s.go && s.go.m) {
      const g = s.go, min = g.min ? ' · ' + g.min + '분' : '';
      if (g.m === 'walk') return { c: null, walk: true, label: '걸어서' + min };
      const nm = (g.ln || '').trim() || GO_NAME[g.m];
      return { c: lineColor(nm) || (g.m === 'rail' ? '#4E5968' : '#8B95A1'), walk: false, label: nm + min };
    }
    // 일정 글의 "열차 ○○선: …"은 그 장소에서 타고 떠나는 열차라서, 이 장소로 오는 구간은 앞 장소의 열차예요
    const rideOf = (x) => x && todoList(d, x).find((t) => /^열차 /.test(t));
    const pr = rideOf(prev), text = pr ? pr : (d.rides[i] || []).concat(todoList(d, s).filter((t) => !/^열차 /.test(t))).join(' ');
    let hit = null;
    for (const [k, c] of LINEC) { const at = text.indexOf(k); if (at >= 0 && (!hit || at < hit.at)) hit = { at, k, c }; }
    const mm = text.match(/(\d{1,3}(?:\s*[~-]\s*\d{1,3})?)\s*분/);
    const walk = !hit && (/도보|걸어|걷기/.test(text) || (prev && prev[3] != null && s[3] != null && L.latLng(prev[3], prev[4]).distanceTo(L.latLng(s[3], s[4])) < 1500));
    let nm = '';
    if (hit) { const m2 = text.slice(Math.max(0, hit.at - 8), hit.at + hit.k.length + 2).match(/[가-힣A-Za-z]*\s?[가-힣A-Za-z]*$/); nm = hit.k.endsWith('선') || /버스|택시|신칸센|모노레일|하루카|스카이라이너|로망스카/.test(hit.k) ? hit.k : hit.k + '선'; }
    return { c: hit ? hit.c : null, walk, label: hit ? nm + (mm ? ' · ' + mm[1].replace(/\s/g, '') + '분' : '') : walk ? '걸어서' + (mm ? ' · ' + mm[1].replace(/\s/g, '') + '분' : '') : '' };
  }
  function curStop(d, n) {
    if (n.d !== d.date) return -1;
    let idx = -1;
    const now = mins(n.t);
    d.vis.forEach((i) => { if (ord(d.stops[i][0]) <= now) idx = i; });
    return idx;
  }

  // ---------- 지도 ----------
  const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([36.2, 138.3], 5);
  const syncLabels = () => document.getElementById('map').classList.toggle('low-zoom', map.getZoom() < 14);
  map.on('zoomend', syncLabels);
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // 기본 지도는 MapTiler Streets, 상세 지도(OSM)는 토글로 바꿀 수 있어요 (다크 모드는 CSS로 반전)
  // MapTiler 키는 웹에 공개되는 키라서 MapTiler 설정에서 허용 주소로 제한해 둬요.
  const MT_KEY = 'NDPQPUp7siqFUbAkTieA';
  const grey = L.tileLayer('https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + MT_KEY, {
    tileSize: 512, zoomOffset: -1, minZoom: 1, maxZoom: 19, crossOrigin: true,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>'
  });
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, crossOrigin: true, attribution: '© OpenStreetMap contributors'
  });
  let tiles = (store.get('tiles', 'mt') === 'osm' ? osm : grey).addTo(map);
  // 지도 종류 바꾸기: 오른쪽 지도 버튼 묶음에 있어요
  function switchTiles() {
    const next = tiles === grey ? osm : grey;
    map.removeLayer(tiles); tiles = next.addTo(map); store.set('tiles', next === osm ? 'osm' : 'mt');
    toast(next === osm ? 'OSM 지도로 바꿨어요. 골목·건물이 더 자세해요.' : '기본 지도로 바꿨어요.');
  }
  // 인터넷이 안 되거나 타일이 안 오면 앱에 들어 있는 간략 지도를 깔아요
  let baseOn = false, tileErr = 0;
  function useOfflineBase() {
    if (baseOn) return; baseOn = true;
    $('#map').classList.add('offline');
    const sc = document.createElement('script');
    sc.src = '/data/base.js';
    sc.onload = () => {
      const B = window.BASE; if (!B) return;
      map.createPane('base').style.zIndex = 150;
      const rr = L.svg({ pane: 'base', padding: 0.5 });
      const dec = (t) => { const v = t.split(',').map(Number), o = []; let x = 0, y = 0; for (let i = 0; i < v.length; i += 2) { x += v[i]; y += v[i + 1]; o.push([y / 1e4, x / 1e4]); } return o; };
      const poly = (rs, cls) => L.polygon(rs.map(dec), { renderer: rr, className: cls, interactive: false, smoothFactor: 1.5 });
      const lines = (ls, cls) => L.polyline(ls.map(dec), { renderer: rr, className: cls, interactive: false, smoothFactor: 1.5 });
      L.layerGroup([...B.land.map((r) => poly(r, 'b-land')), ...B.built.map((r) => poly(r, 'b-built')), ...B.water.map((r) => poly(r, 'b-water')),
        lines(B.river, 'b-river'), lines(B.road2, 'b-road2'), lines(B.road1, 'b-road1'), lines(B.rail, 'b-rail')]).addTo(map);
      B.labels.forEach(([nm, la, lo]) => L.tooltip({ permanent: true, direction: 'center', className: 'ward', interactive: false }).setLatLng([la, lo]).setContent(nm).addTo(map));
      map.attributionControl.addAttribution('간략 지도: 국토지리원 Global Map Japan');
    };
    document.head.appendChild(sc);
  }
  const onTileErr = (e) => { if (e.tile) e.tile.style.visibility = 'hidden'; if (++tileErr >= 3) useOfflineBase(); };
  grey.on('tileerror', onTileErr); osm.on('tileerror', onTileErr);
  if (!navigator.onLine) useOfflineBase();

  const zoomCls = () => { const z = map.getZoom(), c = map.getContainer().classList; c.toggle('z-st', z < 14); c.toggle('z-fd', z < 15); c.toggle('z-lb', z < 12); c.toggle('z-wd', z < 11); };
  map.on('zoomend', zoomCls);
  // 겹치는 장소 이름표는 앞 번호(또는 고른 곳)만 남기고 숨겨요
  let dcT = 0;
  function declutter() {
    cancelAnimationFrame(dcT);
    dcT = requestAnimationFrame(() => {
      const els = [...document.querySelectorAll('#map .leaflet-tooltip.lb, #map .leaflet-tooltip.fd')];
      els.forEach((e) => e.classList.remove('hid'));
      const pri = (e) => (e.classList.contains('lsel') ? 2 : e.classList.contains('lb') ? 1 : 0), placed = [];
      els.sort((a, b) => pri(b) - pri(a));
      els.forEach((e) => {
        if (!e.offsetWidth) return;
        const r = e.getBoundingClientRect();
        if (placed.some((q) => r.left < q.right - 2 && r.right > q.left + 2 && r.top < q.bottom - 2 && r.bottom > q.top + 2)) e.classList.add('hid'); else placed.push(r);
      });
    });
  }
  map.on('zoomend', declutter);
  const LEG_OFF = '#a3adb3'; let legs = {};
  let layer = L.layerGroup().addTo(map), pickLayer = L.layerGroup().addTo(map), markers = {}, drawnDay = null, fitPts = [];

  // 지도에서 가려지지 않는 영역 (PC: 오른쪽 도구창, 모바일: 아래 시트)
  // 화면 아래에서 시트(+아래 탭 바)가 덮는 높이. 지금 움직이는 중이어도 목표 위치 기준으로 계산해요
  function sheetVisible(state) {
    if (isDesk()) return 0;
    const r = panel.getBoundingClientRect(), cur = new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 || 0;
    return Math.max(0, window.innerHeight - (r.top - cur + snapY(state || S.sheet)));
  }
  const topH = () => { const tb = $('#topbar'); return (tb ? tb.getBoundingClientRect().bottom : 100) + 8; };
  const railW = () => { const nv = $('#nav'); return nv ? nv.offsetWidth : 0; };
  function pad() {
    return isDesk() ? { paddingTopLeft: [40, 70], paddingBottomRight: [panel.offsetWidth + railW() + 84, 40] } : { paddingTopLeft: [24, topH()], paddingBottomRight: [60, sheetVisible() + 20] };
  }
  function focusLL(ll, z) {
    z = Math.max(map.getZoom(), z || 15);
    const dx = isDesk() ? (panel.offsetWidth + railW() + 36) / 2 : 0;
    const dy = isDesk() ? 0 : (sheetVisible() - topH()) / 2;
    const p = map.project(ll, z).add([dx, dy]);
    map.setView(map.unproject(p, z), z);
  }

  // 도보: 처음엔 점선, OpenStreetMap 도보 경로를 받으면 실제 길로 바꿔요 (한 번 받은 경로는 기기에 저장)
  const WALKC = {}, walkQ = []; let walkBusy = false;
  function walkLine(a, b, color, tg, o) {
    o = o || {}; const lb = o.label || '도보', W = o.weight || 4;
    const line = L.polyline([a, b], { color, weight: W - 1, opacity: 0.9, dashArray: '2 7', lineCap: 'round' }).addTo(tg).bindTooltip(lb, { sticky: true });
    const k = 'walk|' + [a.lat, a.lng, b.lat, b.lng].map((v) => v.toFixed(5)).join(',');
    const apply = (w) => {
      const ok = w && w.c && w.c.length > 1, d = ok ? w.d : Math.round(a.distanceTo(b) * 1.3);
      const txt = `약 ${Math.max(1, Math.round(d / 75))}분 · ${d >= 1000 ? (d / 1000).toFixed(1) + 'km' : Math.round(d / 10) * 10 + 'm'}`;
      if (o.done) o.done(txt);
      if (!ok) { line.setTooltipContent(lb + ' ' + txt + ' (직선 거리 기준)'); return; }
      line.setLatLngs([a, ...w.c, b]); line.setStyle({ dashArray: null, weight: W, opacity: 0.85 });
      line.setTooltipContent(lb + ' ' + txt);
      if (tg === layer) paintLegs();
    };
    let w = WALKC[k]; if (!w) { try { w = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {} }
    if (w) { WALKC[k] = w; apply(w); return line; }
    walkQ.push({ k, a, b, apply }); runWalkQ();
    return line;
  }
  async function runWalkQ() {
    if (walkBusy || !navigator.onLine) return; walkBusy = true;
    while (walkQ.length) {
      const j = walkQ.shift();
      if (WALKC[j.k]) { j.apply(WALKC[j.k]); continue; }
      try {
        const r = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${j.a.lng.toFixed(5)},${j.a.lat.toFixed(5)};${j.b.lng.toFixed(5)},${j.b.lat.toFixed(5)}?overview=full&geometries=geojson`);
        const d = await r.json(), rt = d && d.routes && d.routes[0];
        if (rt) {
          const st = j.a.distanceTo(j.b);
          const w = rt.distance > st * 4 + 400 ? { c: [], d: 0 } : { c: rt.geometry.coordinates.map((q) => [+q[1].toFixed(5), +q[0].toFixed(5)]), d: Math.round(rt.distance) };
          WALKC[j.k] = w; try { localStorage.setItem(j.k, JSON.stringify(w)); } catch (e) {} j.apply(w);
        }
      } catch (e) { j.apply(null); }
    }
    walkBusy = false;
  }

  // 열차: 처음엔 직선, 선로 데이터로 같은 노선 선로를 따라 다시 그려요 (한 번 찾은 모양은 기기에 저장)
  const RAILC = {}, railQ = []; let railBusy = false;
  function railLine(a, b, ln, rl, lg, bag) {
    const k = 'rail|' + [a.lat, a.lng, b.lat, b.lng].map((v) => v.toFixed(4)).join(',') + '|' + ln;
    const apply = (p) => {
      if (!p || p.length < 2 || !rl._map) return;
      rl.setLatLngs(p);
      // 역과 일정 위치가 떨어져 있으면 그 사이는 점선으로 이어요
      [[a, p[0]], [p[p.length - 1], b]].forEach(([x, y]) => {
        if (L.latLng(x).distanceTo(y) < 60) return;
        bag.push(L.polyline([x, y], { color: lg.c, weight: 4, opacity: 0.9, dashArray: '2 7', lineCap: 'round', rc: lg.c }).addTo(layer).bindTooltip(lg.label, { sticky: true }));
      });
      paintLegs();
    };
    let p = RAILC[k]; if (!p) { try { p = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {} }
    if (p) { RAILC[k] = p; apply(p); return; }
    railQ.push({ k, a, b, ln, apply }); runRailQ();
  }
  // 선로 데이터(rail.js + /data/rail/*.json)는 열차 구간을 처음 그릴 때 받아요
  let railLib = null;
  const loadRail = () => railLib || (railLib = new Promise((ok) => {
    if (window.DKRail) return ok(window.DKRail);
    const sc = document.createElement('script'); sc.src = '/rail.js'; sc.onload = () => { map.attributionControl.addAttribution('선로: 국토교통성 국토수치정보(철도)'); ok(window.DKRail || null); }; sc.onerror = () => { railLib = null; ok(null); }; document.head.appendChild(sc);
  }));
  async function runRailQ() {
    if (railBusy) return; railBusy = true;
    const R = await loadRail();
    while (R && railQ.length) {
      const j = railQ.shift();
      if (RAILC[j.k]) { j.apply(RAILC[j.k]); continue; }
      try {
        const p = (await R.route([j.a.lat, j.a.lng], [j.b.lat, j.b.lng], j.ln)).map((q) => [+q[0].toFixed(5), +q[1].toFixed(5)]);
        if (p.length) { RAILC[j.k] = p; try { localStorage.setItem(j.k, JSON.stringify(p)); } catch (e) {} j.apply(p); }
      } catch (e) {}
    }
    railBusy = false;
  }

  function drawDay(d, fit) {
    drawnDay = d.id; layer.clearLayers(); pickLayer.clearLayers(); markers = {}; fitPts = [];
    const n = nowJST(), ci = curStop(d, n);
    let last = null;
    // 가까우면 도보 경로, 멀면(2.5km 넘게) 이동 구간으로 곧게 이어요
    // 구간마다 도착하는 일정 번호를 붙여 두고, 고른 일정으로 가는 길만 민트색으로 칠해요
    legs = {}; let to = null;
    const walk = (p) => {
      if (!last) return; const dist = map.distance(last, p);
      if (dist <= 40) return;
      const g = to != null && d.stops[to] && d.stops[to].go;
      if (g && g.m && g.m !== 'walk') {
        const lg = legOf(d, to, null), rl = L.polyline([last, p], { color: lg.c, weight: 5, opacity: 0.9, lineCap: 'round', rc: lg.c, dashArray: g.m === 'rail' ? null : '2 8' }).addTo(layer).bindTooltip(lg.label, { sticky: true });
        const bag = (legs[to] = legs[to] || []); bag.push(rl);
        if (g.m === 'rail') railLine(last, p, g.ln || '', rl, lg, bag);
        return;
      }
      const ln = (dist <= 2500 || (g && g.m === 'walk')) ? walkLine(last, p, LEG_OFF, layer)
        : L.polyline([last, p], { color: LEG_OFF, weight: 4, opacity: 0.75, dashArray: '10 8', lineCap: 'round' }).addTo(layer)
          .bindTooltip(`이동 · 약 ${(dist / 1000).toFixed(1)}km (교통수단은 일정에서 확인)`, { sticky: true });
      if (to != null) (legs[to] = legs[to] || []).push(ln);
    };
    // 동선 순서: 원래 동선(열차 구간 포함) 사이에 내가 추가한 일정을 시간 순서대로 끼워 넣어요
    const P = R.PLANS[d.id] || [], nb = d.base.length, plan = []; let k = 0;
    d.vis.forEach((i) => {
      if (i < nb) { const at = P.indexOf(i, k); if (at >= 0) { plan.push(...P.slice(k, at + 1)); k = at + 1; } else plan.push(i); }
      else plan.push(i);
    });
    plan.push(...P.slice(k).filter((x) => typeof x !== 'number'));
    plan.forEach((it) => {
      if (typeof it === 'number') { const s = d.stops[it]; if (!s || s.del || s[3] == null) return; const p = L.latLng(s[3], s[4]); to = it; walk(p); last = p; return; }
      const [key, a, b] = it, ln = R.LINES[key], part = seg(key, a, b), pts = part.map((x) => L.latLng(x[1], x[2]));
      to = null; walk(pts[0]);
      L.polyline(pts, { color: '#ffffff', weight: 9, opacity: 0.85 }).addTo(layer);
      const rd = R.RIDE[it.join('|')];
      L.polyline(pts, { color: tone(ln.c), weight: 5, opacity: 1 }).addTo(layer).bindTooltip(`${ln.n} · ${a} → ${b}${rd ? " · '" + rd[1] + "' 방면" : ''}`, { sticky: true });
      part.slice(1, -1).forEach((x) => L.circleMarker([x[1], x[2]], { radius: 3, color: tone(ln.c), weight: 2, fillColor: '#fff', fillOpacity: 1 }).addTo(layer).bindTooltip(x[0], { permanent: true, direction: 'right', offset: [4, 0], className: 'st' }));
      last = pts[pts.length - 1];
    });
    d.vis.forEach((i) => {
      const s = d.stops[i], no = numOf(d, i);
      if (s[3] == null) return;
      const cls = 'pin' + (no ? (s[5] === 'm' ? ' move' : '') : ' start') + (i === ci ? ' cur' : '');
      const icon = L.divIcon({ className: '', html: `<div class="${cls}">${no}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
      const m = L.marker([s[3], s[4]], { icon, zIndexOffset: i === ci ? 1000 : no ? 500 : 900 }).addTo(layer)
        .bindPopup(`<div class="popup"><b>${no}${no ? '' : ' (출발)'}. ${esc(s[1])}</b><br>${esc(s[0])}</div>`, { maxWidth: 240, autoPan: false })
        .bindTooltip(s[1], { permanent: true, direction: 'right', offset: [14, 0], className: 'lb' })
        .on('click', () => selectStop(i, false));
      markers['s' + i] = m; if (!FAR.has(s[1])) fitPts.push([s[3], s[4]]);
    });
    d.meals.forEach((ml, mi) => ml.picks.forEach((p, pi) => {
      const icon = L.divIcon({ className: '', html: `<div class="fpin${p[5] ? '' : ' alt'}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
      const m = L.marker([p[3], p[4]], { icon, zIndexOffset: p[5] ? 400 : 300 }).addTo(layer)
        .bindPopup(`<div class="popup"><b>${esc(p[0])}</b><br>${esc(p[2])}<br><a href="${gq(p[1])}" target="_blank" rel="noopener">구글맵에서 보기</a></div>`, { autoPan: false })
        .bindTooltip((p[0].match(/\(([^)]+)\)/) || [0, p[0]])[1], { permanent: true, direction: 'top', offset: [0, -8], className: 'fd' })
        .on('click', () => showPick(mi, pi));
      markers[`f${mi}_${pi}`] = m; fitPts.push([p[3], p[4]]);
    }));
    paintLegs();
    if (meMarker) meMarker.addTo(map);
    if (fit !== false) fitDay();
    zoomCls();
  }
  // 고른 일정(없으면 지금 하는 일정)으로 오는 길만 색을 칠해요 (열차는 노선 색, 걸어서는 민트색), 나머지는 회색
  function paintLegs() {
    const d = dayOf(S.day), on = S.sel != null ? S.sel : d ? curStop(d, nowJST()) : -1;
    Object.keys(legs).forEach((k) => legs[k].forEach((ln) => {
      const hit = +k === on, rc = ln.options && ln.options.rc; ln.setStyle({ color: hit ? rc || PRI : LEG_OFF, opacity: hit ? 1 : 0.55, weight: hit ? 6 : 3 });
      if (hit) ln.bringToFront();
    }));
    Object.keys(markers).forEach((k) => { const el = markers[k].getElement && markers[k].getElement(); const pin = el && el.firstElementChild; if (pin && pin.classList.contains('pin')) pin.classList.toggle('sel', k === 's' + on); const tt = markers[k].getTooltip && markers[k].getTooltip(), te = tt && tt.getElement && tt.getElement(); if (te) te.classList.toggle('lsel', k === 's' + on); });
    declutter();
  }
  function fitDay() { if (fitPts.length) map.fitBounds(L.latLngBounds(fitPts), Object.assign({ maxZoom: 16 }, pad())); }

  // 식당을 고르면: 앞 일정 → 식당 → 다음 일정 도보 경로를 분홍색으로
  function showPick(mi, pi) {
    const d = dayOf(S.day), ml = d.meals[mi], p = ml.picks[pi]; pickLayer.clearLayers();
    document.querySelectorAll('.pick.on').forEach((x) => x.classList.remove('on'));
    const el = document.querySelector(`.pick[data-pick="${mi}_${pi}"]`); if (el) el.classList.add('on');
    const info = el && el.querySelector('.pwalk'); const parts = []; const put = () => { if (info) info.textContent = parts.filter(Boolean).join(' · '); };
    const P = L.latLng(p[3], p[4]), pts = [P];
    const PL = R.PLANS[d.id], at = PL.indexOf(ml.at);
    const nb = (x, end) => { if (x === undefined) return null; if (typeof x === 'number') return d.stops[x]; const s = seg(x[0], x[1], x[2]), e = end ? s[s.length - 1] : s[0]; return ['', e[0] + '역', '', e[1], e[2]]; };
    const prev = at >= 0 ? nb(PL[at - 1], true) : d.stops[ml.at - 1], next = at >= 0 ? nb(PL[at + 1], false) : d.stops[ml.at + 1];
    if (prev) { const A = L.latLng(prev[3], prev[4]); pts.push(A); if (A.distanceTo(P) > 40) walkLine(A, P, '#d6336c', pickLayer, { label: '식당까지 도보', weight: 6, done: (t) => { parts[0] = `${prev[1]}에서 ${t}`; put(); } }); }
    if (next) { const B = L.latLng(next[3], next[4]); pts.push(B); if (B.distanceTo(P) > 40) walkLine(P, B, '#d6336c', pickLayer, { label: '식당에서 다음 장소까지 도보', weight: 6, done: (t) => { parts[1] = `${next[1]}까지 ${t}`; put(); } }); }
    if (info && !pickLayer.getLayers().length) info.textContent = '앞뒤 일정 장소 바로 앞이에요';
    map.fitBounds(L.latLngBounds(pts), Object.assign({ maxZoom: 17 }, pad()));
    const m = markers[`f${mi}_${pi}`]; if (m) m.openPopup();
  }
  function setOpen(i, v) {
    if (v) S.xp.add(i); else S.xp.delete(i);
    const el = document.querySelector(`.stop[data-stop="${i}"]`); if (el) { el.classList.toggle('open', v); el.setAttribute('aria-expanded', v); }
  }
  function selectStop(i, fromList) {
    const d = dayOf(S.day), s = d.stops[i];
    if (fromList) setOpen(i, !S.xp.has(i)); else setOpen(i, true);
    S.sel = i; paintLegs();
    document.querySelectorAll('.stop.on').forEach((x) => x.classList.remove('on'));
    const el = document.querySelector(`.stop[data-stop="${i}"]`);
    if (el) { el.classList.add('on'); if (!fromList) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    if (s[3] == null) { if (fromList) toast('위치가 없는 일정이에요. 일정 편집에서 위치를 넣을 수 있어요.'); return; }
    focusLL(L.latLng(s[3], s[4]), 15);
    const m = markers['s' + i]; if (m && (isDesk() || S.sheet !== 'full')) m.openPopup();
    if (!fromList && S.tab !== 'plan') go('plan');
    if (!fromList && !isDesk() && S.sheet === 'peek') setSheet('half');
  }

  // 내 위치
  let meMarker = null, meCircle = null, watchId = null, firstFix = true;
  function startGeo(userAsked) {
    if (!('geolocation' in navigator)) return toast('이 기기에서는 위치를 쓸 수 없어요.');
    if (watchId != null) { if (meMarker) focusLL(meMarker.getLatLng(), 16); else if (userAsked) toast('위치를 찾는 중이에요…'); return; }
    firstFix = !!userAsked;
    watchId = navigator.geolocation.watchPosition((pos) => {
      const ll = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (!meMarker) {
        meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 2000, interactive: false }).addTo(map);
        meCircle = L.circle(ll, { radius: pos.coords.accuracy, color: '#1a73e8', weight: 1, opacity: 0.4, fillOpacity: 0.08, interactive: false }).addTo(map);
      } else { meMarker.setLatLng(ll); meCircle.setLatLng(ll).setRadius(pos.coords.accuracy); }
      $('#locBtn').classList.add('on');
      store.set('geo', true);
      if (firstFix) { firstFix = false; focusLL(ll, 16); }
    }, (err) => {
      watchId != null && navigator.geolocation.clearWatch(watchId); watchId = null;
      $('#locBtn').classList.remove('on');
      if (userAsked) toast(err.code === 1 ? '위치 권한이 꺼져 있어요. 브라우저 설정에서 위치를 허용해 주세요.' : '위치를 찾지 못했어요. 잠시 후 다시 눌러 주세요.');
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  }
  let toastT = null;
  // 알림: 시트 바로 위에 잠깐 떠요. act = { label, fn } 이면 '되돌리기' 같은 버튼이 붙어요
  function toast(msg, act, ms) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    if (act) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tact'; b.textContent = act.label; b.onclick = (e) => { e.stopPropagation(); t.remove(); act.fn(); }; t.appendChild(b); }
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), ms || (act ? 6000 : 3200));
  }

  // ---------- 뒤로 가기 ----------
  // 휴대폰의 뒤로 가기는 앱을 나가지 않고 열린 창(큰 글씨·안내·편집기·시트)을 하나씩 닫아요
  let skipPop = 0;
  function backPush(kind) {
    const st = history.state;
    if (st && st.dk === kind) return;
    history.pushState({ dk: kind, up: st && st.dk ? st : null }, '', location.hash || '#' + S.tab);
  }
  function backPop(kind) {
    const st = history.state;
    if (st && st.dk === kind) { skipPop++; history.back(); }
  }
  window.addEventListener('popstate', () => {
    if (skipPop) { skipPop--; return; }
    const sh = document.querySelector('.show'); if (sh) { sh.remove(); return; }
    const tu = document.querySelector('.tut'); if (tu) { store.set('tutDone', 1); try { localStorage.setItem('th.tutDone', '1'); } catch (e) {} tu.remove(); return; }
    if (S.edit) {
      if (!okToLeave()) { backPush('edit'); return; }
      closeEditor(); renderPlan(); return;
    }
    if (!isDesk() && S.sheet !== 'peek') setSheet('peek');
  });
  // 지도에서 위치 고르는 중이라는 띠 (취소 버튼 포함)
  function pickBar(on) {
    let b = $('#pickBar');
    if (!on) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'pickBar'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = `${I('pin')} 지도에서 위치를 눌러 주세요 <button type="button" id="pickCancel">취소</button>`;
  }
  // 새로고침해도 보던 날짜·탭·시트 높이를 그대로 (이 탭 안에서만 기억해요)
  function saveUI() { try { sessionStorage.setItem('dk.ui', JSON.stringify({ day: S.day, sheet: S.sheet, tab: S.tab })); } catch (e) {} }
  function restoreUI() { try { return JSON.parse(sessionStorage.getItem('dk.ui') || 'null'); } catch (e) { return null; } }

  // ---------- 모바일 아래 시트 ----------
  // 시트는 아래 탭 위에 떠 있는 카드라, 아래로 내려간 만큼은 잘라서 탭 뒤로 비치지 않게 해요
  function moveSheet(y) {
    panel.style.transform = `translateY(${y}px)`;
    // 위·옆 그림자는 남기고, 보이는 아래쪽 끝은 둥근 모서리로 잘라요
    const W = panel.offsetWidth, B = panel.offsetHeight - y, r = 24, m = 40;
    panel.style.clipPath = `path('M${-m} ${-m}H${W + m}V${B - r}H${W}Q${W} ${B} ${W - r} ${B}H${r}Q0 ${B} 0 ${B - r}H${-m}Z')`;
  }
  function snapY(state) {
    const H = panel.offsetHeight;
    if (state === 'full') return 0;
    if (state === 'half') return Math.max(0, H - Math.round(window.innerHeight * 0.48));
    return Math.max(0, H - 58);
  }
  function setSheet(state, keepMap) {
    if (isDesk()) { panel.style.transform = ''; panel.style.clipPath = ''; view.style.paddingBottom = ''; document.documentElement.style.setProperty('--sv', '0px'); return; }
    const was = S.sheet;
    S.sheet = state;
    document.body.classList.toggle('sheetfull', state === 'full');
    const y = snapY(state);
    moveSheet(y);
    // 시트가 반쯤 열려 있어도 내용 끝(버튼 등)까지 스크롤할 수 있게 가려진 만큼 여백을 둬요
    view.style.paddingBottom = y ? `${y + 20}px` : '';
    // 지도 버튼·알림·지도 출처가 시트 바로 위에 오도록 시트 높이를 넘겨요
    document.documentElement.style.setProperty('--sv', sheetVisible(state) + 'px');
    if (state !== 'peek' && was === 'peek') backPush('sheet');
    saveUI(); clock();
  }
  (function sheetDrag() {
    const grab = $('#grab');
    let y0 = 0, t0 = 0, start = 0, moved = false, id = null;
    grab.addEventListener('pointerdown', (e) => {
      if (isDesk()) return;
      id = e.pointerId; grab.setPointerCapture(id); moved = false;
      y0 = e.clientY; t0 = Date.now(); start = snapY(S.sheet); panel.classList.add('dragging');
    });
    grab.addEventListener('pointermove', (e) => {
      if (id !== e.pointerId) return;
      const dy = e.clientY - y0; if (Math.abs(dy) > 4) moved = true;
      moveSheet(Math.min(snapY('peek'), Math.max(0, start + dy)));
    });
    const end = (e) => {
      if (id !== e.pointerId) return; id = null; panel.classList.remove('dragging');
      const dy = e.clientY - y0, v = dy / Math.max(1, Date.now() - t0);
      if (!moved) return setSheet(S.sheet === 'peek' ? 'half' : S.sheet === 'half' ? 'full' : 'peek');
      const y = start + dy, order = ['full', 'half', 'peek'];
      let best = order.reduce((b, s) => (Math.abs(snapY(s) - y) < Math.abs(snapY(b) - y) ? s : b), 'half');
      if (Math.abs(v) > 0.5) { const i = order.indexOf(S.sheet); best = order[Math.max(0, Math.min(2, i + (v > 0 ? 1 : -1)))]; }
      setSheet(best);
    };
    grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  })();

  // ---------- 공통 ----------
  function clock() {
    const n = nowJST(), up = S.sheet === 'peek' && !isDesk();
    const wait = CL && CL.pending && CL.error ? ' · <span class="wait">저장 대기</span>' : '';
    if (!R.DAYS.length) { $('#clock').innerHTML = `일본 <b>${n.d.slice(5).replace('-', '/')} ${n.t}</b>`; $('#peek').innerHTML = '<b>새 여행 만들기</b>'; return; }
    const dday = Math.round((Date.parse(TRIP_START) - Date.parse(n.d)) / 864e5);
    $('#clock').innerHTML = `일본 <b>${n.d.slice(5).replace('-', '/')} ${n.t}</b>` + (n.sim ? ' · 미리보기' : '') + (dday > 0 ? ` · D-${dday}` : '') + wait;
    const { cur, next } = findNow(n), st = cur || next;
    let pk;
    if (inTrip(n) && st && IT.length) pk = `<b>${cur ? '지금' : '다음'} ${esc(st.s)}</b> · ${esc(st.todo)}`;
    else if (inTrip(n)) {
      const dd = dayOf(n.d), i = dd ? curStop(dd, n) : -1, vi = dd ? dd.vis : [], nx = i >= 0 ? vi[vi.indexOf(i) + 1] : vi[0];
      pk = i >= 0 ? `<b>지금 ${esc(dd.stops[i][0])}</b> · ${esc(dd.stops[i][1])}` : nx != null ? `<b>다음 ${esc(dd.stops[nx][0])}</b> · ${esc(dd.stops[nx][1])}` : vi.length ? '오늘 일정은 모두 끝났어요' : '오늘은 아직 일정이 없어요';
    } else if (n.d < TRIP_START) pk = `<b>여행 전</b> · D-${dday}`;
    else pk = '여행이 끝났어요';
    $('#peek').innerHTML = pk;
  }
  function renderDays() {
    const h = (R.DAYS.length ? `<button class="dchip prepchip ${S.day === 'prep' ? 'on' : ''}" data-day="prep">여행 전</button>` : '') + R.DAYS.map((d) => `<button class="dchip ${d.date === S.day ? 'on' : ''}" data-day="${d.date}">${esc(d.tab)}</button>`).join('');
    // 시트를 끝까지 올렸을 때도 날짜를 바꿀 수 있게 시트 안에도 같은 칩 줄을 둬요
    ['#days', '#days2'].forEach((q) => { const el = $(q); if (!el) return; el.innerHTML = h; const on = el.querySelector('.on'); if (on && el.offsetParent) on.scrollIntoView({ inline: 'nearest', block: 'nearest' }); });
  }
  function showBig(ja, ko) {
    const d = document.createElement('div');
    d.className = 'show';
    d.innerHTML = `<button class="x">닫기</button><div class="ja">${esc(ja)}</div>${ko ? `<div class="ko">${esc(ko)}</div>` : ''}`;
    const close = () => { d.remove(); document.removeEventListener('keydown', k1); backPop('show'); };
    const k1 = (ev) => { if (ev.key === 'Escape') close(); };
    d.addEventListener('click', close); document.addEventListener('keydown', k1);
    document.body.appendChild(d); backPush('show'); d.querySelector('.x').focus();
  }
  function jaList(list) {
    return list.map((p) => `<button class="tag" data-ja="${esc(p.ja)}" data-ko="${esc(p.ko)}" style="text-align:left">${I('speak')} ${esc(p.ja)}<br><span style="color:var(--sub)">${esc(p.ko)}</span></button>`).join('');
  }
  function cardTags(list) {
    return list.map((c) => `<button class="tag" data-card="${c.id}">${esc(c.title)}</button>`).join('');
  }
  function cardBody(c) {
    return `<div class="muted">${esc(c.sum)}</div>
      <ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      ${c.tips.map((t) => `<div class="tip">${I('bulb')} ${esc(t)}</div>`).join('')}
      ${c.ja.length ? `<div class="k" style="margin-top:10px">직원에게 보여주기 (누르면 크게)</div>${jaList(c.ja)}` : ''}
      ${c.verified === 'check' ? '<div style="margin-top:8px"><span class="chk">규정이 바뀔 수 있어요 · 현장 안내 우선</span></div>' : ''}
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-askabout="${c.id}">이 상황 AI에게 더 묻기</button></div>`;
  }

  // ---------- 일정 (기본 화면) ----------
  function mealsHTML(d, list) {
    return list.map((ml) => {
      const mi = d.meals.indexOf(ml);
      return `<div class="meal"><h3>${esc(ml.label)}</h3>${ml.picks.map((p, pi) => `<div class="pick" data-pick="${mi}_${pi}"><span class="mk">${p[5] ? I('star') : '<i class="dia o"></i>'}</span><span>${esc(p[0])} <small>${esc(p[2])}</small><small class="pwalk"></small></span><a href="${gq(p[1])}" target="_blank" rel="noopener">${I('ext')} 지도</a></div>`).join('')}</div>`;
    }).join('');
  }
  function editorHTML(d) {
    const E = S.edit, x = E.draft, isNew = E.i === 'new', orig = !isNew && d.stops[E.i].custom == null;
    const res = E.results;
    return `<div class="card edit" id="editor">
      <div class="k">${isNew ? '새 일정' : '일정 수정'}</div>
      <div class="erow"><label class="et">시간<input type="time" data-ed="t" value="${esc(x.t)}"></label><label style="flex:1;min-width:0">장소·할 일 이름<input type="text" data-ed="n" value="${esc(x.n)}" placeholder="예: 스카이트리 전망대"></label></div>
      <label>메모<input type="text" data-ed="m" value="${esc(x.m)}" placeholder="예: 입장권 미리 예매함"></label>
      <label>체크리스트 <span class="muted">(한 줄에 하나)</span><textarea data-ed="todo" rows="3" placeholder="예: 7번 출구로 나가기">${esc(x.todo)}</textarea></label>
      <div class="k" style="margin-top:12px">여기까지 가는 방법</div>
      <div class="chips gochips">${[['', '자동'], ['walk', '걸어서'], ['rail', '전철·지하철'], ['bus', '버스'], ['taxi', '택시']].map(([v, l]) => `<button type="button" class="chip${(x.gm || '') === v ? ' on' : ''}" data-gm="${v}">${l}</button>`).join('')}</div>
      ${x.gm === 'rail' || x.gm === 'bus' ? `<div class="erow"><label style="flex:1;min-width:0">${x.gm === 'rail' ? '노선' : '버스 이름'}<input type="text" data-ed="gl" list="lineList" value="${esc(x.gl || '')}" placeholder="${x.gm === 'rail' ? '예: 긴자선, JR 야마노테선' : '예: 도에이 버스 都01'}"></label><label class="et" style="width:96px">걸리는 분<input type="text" inputmode="numeric" data-ed="gmin" value="${esc(x.gmin || '')}" placeholder="12"></label></div>
      <datalist id="lineList">${LINEC.filter(([k]) => !/버스|택시|쾌속|순환선/.test(k)).map(([k]) => `<option value="${k.endsWith('선') || /신칸센|모노레일|하루카|스카이라이너|로망스카|에노덴/.test(k) ? k : k + '선'}">`).join('')}</datalist>`
      : x.gm ? `<label style="width:120px">걸리는 분<input type="text" inputmode="numeric" data-ed="gmin" value="${esc(x.gmin || '')}" placeholder="10"></label>` : `<div class="muted" style="margin-top:2px">자동은 할 일 글에 적힌 노선 이름이나 거리로 정해요.</div>`}
      <div class="k" style="margin-top:12px">위치</div>
      <div class="muted" style="margin:2px 0 6px">${x.lat != null ? `${I('pin')} 지도에 표시돼요${x.place ? ' · ' + esc(x.place) : ''}` : '아직 위치가 없어요. 장소를 찾거나 지도에서 찍어 주세요.'}</div>
      <div class="row" style="flex-wrap:nowrap"><input type="search" id="placeQ" value="${esc(E.q || '')}" placeholder="장소 검색 (예: 도쿄 스카이트리)" style="flex:1;min-width:0"><button class="btn ghost" id="placeGo">찾기</button></div>
      ${res ? `<div class="pres">${res.length ? res.map((r, k) => `<button class="pr" data-place="${k}"><b>${esc(r.name)}</b><small>${esc(r.addr)}</small></button>`).join('') : '<div class="muted">찾는 장소가 없어요. 다른 이름이나 일본어로 찾아보세요.</div>'}</div>` : ''}
      <div class="row" style="margin-top:6px"><button class="btn ghost" id="pickMap">${I('map')} 지도에서 찍기</button><button class="btn ghost" id="pickMe">${I('loc')} 내 위치</button>${x.lat != null && !orig ? '<button class="tag" id="clearLL">위치 빼기</button>' : ''}</div>
      <div class="row" style="margin-top:12px;justify-content:space-between"><div class="row"><button class="btn" id="edSave">저장</button><button class="btn ghost" id="edCancel">취소</button></div>${isNew ? '' : '<button class="btn danger" id="edDel">삭제</button>'}</div>
    </div>`;
  }
  function openEditor(i) {
    const d = dayOf(S.day);
    S.editMode = true;
    if (i === 'new') {
      const last = d.vis.length ? d.stops[d.vis[d.vis.length - 1]] : null;
      S.edit = { i, draft: { t: last ? last[0] : '09:00', n: '', m: '', todo: '', lat: null, lng: null, gm: '', gl: '', gmin: '' } };
    } else {
      const s = d.stops[i];
      const g = s.go || {};
      S.edit = { i, draft: { t: s[0], n: s[1], m: s[2] || '', todo: todoList(d, s).join('\n'), lat: s[3], lng: s[4], gm: g.m || '', gl: g.ln || '', gmin: g.min ? String(g.min) : '' } };
    }
    S.edit.orig = JSON.stringify(S.edit.draft);
    renderPlan(); showDraft();
    const el = $('#editor'); if (el) el.scrollIntoView({ block: 'nearest' });
    if (!isDesk() && S.sheet !== 'full') setSheet('full');
    backPush('edit');
  }
  function closeEditor() { S.edit = null; S.picking = false; map.getContainer().classList.remove('picking'); pickLayer.clearLayers(); pickBar(false); }
  // 고치던 내용이 있으면 버리기 전에 물어봐요
  const editDirty = () => !!(S.edit && (S.edit.lost || JSON.stringify(S.edit.draft) !== S.edit.orig));
  const okToLeave = () => !editDirty() || confirm('고치던 일정이 아직 저장되지 않았어요. 저장하지 않고 나갈까요?');
  function showDraft() {
    pickLayer.clearLayers();
    const x = S.edit && S.edit.draft; if (!x || x.lat == null) return;
    L.marker([x.lat, x.lng], { icon: L.divIcon({ className: '', html: '<div class="pin draft">' + I('edit') + '</div>', iconSize: [26, 26], iconAnchor: [13, 13] }), zIndexOffset: 2000 }).addTo(pickLayer);
  }
  function saveEditor() {
    const d = dayOf(S.day), E = S.edit, x = E.draft;
    const t = (x.t || '').trim(), n = (x.n || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(t)) return toast('시간을 넣어 주세요.');
    if (!n) return toast('이름을 넣어 주세요.');
    const todo = String(x.todo || '').split('\n').map((v) => v.trim()).filter(Boolean);
    const mn = parseInt(String(x.gmin || '').replace(/[^0-9]/g, ''), 10);
    const go = x.gm ? { m: x.gm, ln: x.gm === 'rail' || x.gm === 'bus' ? String(x.gl || '').trim().slice(0, 30) : '', min: mn > 0 && mn < 1000 ? mn : 0 } : null;
    const e = edOf(d);
    const a0 = E.i !== 'new' && d.stops[E.i] && d.stops[E.i].custom != null ? e.add.find((v) => v.id === d.stops[E.i].custom) : null;
    if (E.i === 'new' || (d.stops[E.i] && d.stops[E.i].custom != null && !a0)) {
      const na = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t, n, m: (x.m || '').trim(), todo, lat: x.lat, lng: x.lng };
      if (go) na.go = go; e.add.push(na);
    } else if (a0) {
      Object.assign(a0, { t, n, m: (x.m || '').trim(), todo, lat: x.lat, lng: x.lng });
      if (go) a0.go = go; else delete a0.go;
      if (a0.chk) a0.chk = a0.chk.filter((c) => todo.includes(c));
    } else {
      const b = d.base[E.i], m = {};
      if (t !== b[0]) m.t = t; if (n !== b[1]) m.n = n; if ((x.m || '').trim() !== (b[2] || '')) m.m = (x.m || '').trim();
      if (x.lat !== b[3] || x.lng !== b[4]) { m.lat = x.lat; m.lng = x.lng; }
      const ot = (R.TODO[d.id] || {})[b[1]] || [];
      if (todo.join('\n') !== ot.join('\n')) m.todo = todo;
      if (Object.keys(m).length) e.mod[E.i] = m; else delete e.mod[E.i];
    }
    closeEditor(); saveEdits(); render(); backPop('edit');
    toast(CL && (!navigator.onLine || CL.error) ? '이 기기에 저장했어요. 인터넷이 연결되면 서버에 올라가요.' : '저장했어요.');
  }
  async function searchPlace() {
    const q = ($('#placeQ') || {}).value || ''; S.edit.q = q;
    if (!q.trim()) return;
    if (!navigator.onLine) return toast('인터넷이 연결돼야 장소를 찾을 수 있어요.');
    const btn = $('#placeGo'); if (btn) { btn.disabled = true; btn.textContent = '찾는 중'; }
    try {
      const c = map.getCenter();
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=jp&accept-language=ko,ja&viewbox=${c.lng - 1},${c.lat + 1},${c.lng + 1},${c.lat - 1}&q=${encodeURIComponent(q)}`);
      const j = await r.json();
      S.edit.results = (j || []).map((v) => ({ name: v.name || String(v.display_name).split(',')[0], addr: String(v.display_name).split(',').slice(1, 4).join(',').trim(), lat: +(+v.lat).toFixed(5), lng: +(+v.lon).toFixed(5) }));
    } catch (e) { S.edit.results = []; toast('장소를 찾지 못했어요. 지도에서 직접 찍어 주세요.'); }
    if (S.edit) { renderPlan(); const el = $('#editor'); if (el) el.scrollIntoView({ block: 'nearest' }); }
  }

  function acctHTML() {
    if (VIEW) {
      return `<div class="card"><div class="k">공유받은 여행</div><div class="muted">보기 전용으로 열었어요. 로그인하면 내 여행을 만들고, 이 여행을 함께 편집하도록 초대받을 수 있어요.</div>
        <div class="row" style="margin-top:10px;gap:6px"><a class="btn sm" href="/">내 여행 만들기</a><button class="btn ghost sm" id="tutAgain">사용법 보기</button></div></div>`;
    }
    const who = USER ? `<div class="acct">${USER.picture ? `<img src="${esc(USER.picture)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(USER.name)}</b><div class="muted">${esc(USER.email)}</div></div></div>`
      : `<div class="muted">${window.DK_AUTH === 'off' ? '로그인 없이 이 기기에만 저장하고 있어요.' : '로그인 정보를 확인하지 못했어요 (오프라인).'}</div>`;
    const share = CL && CL.tripId && UT ? `<div class="card"><div class="k">${I('chat')} 여행 공유</div>
      <div class="muted">같이 가는 사람에게 링크를 보내요. 함께 편집하는 사람이 고친 내용은 바로 서로에게 보여요.</div>
      <div class="row" style="margin-top:10px;gap:6px">
        <button class="btn sm" id="shareEdit">${I('edit')} 같이 편집 초대 링크</button>
        ${CL.role === 'owner' ? `<button class="btn ghost sm" id="shareView">${I('map')} 보기 전용 링크</button>` : ''}
        ${CL.role === 'owner' && CL.trip && CL.trip.public ? '<button class="tutskip" id="shareStop">보기 링크 끄기</button>' : ''}
      </div>
      <div class="k" style="margin-top:14px">함께하는 사람</div>
      <div class="mlist">${Object.entries((CL.trip && CL.trip.members) || {}).filter(([u]) => (CL.trip.memberIds || []).includes(u)).map(([u, m]) => `<div class="mrow"><span>${esc(m.name || '이름 없음')}${u === CL.trip.owner ? ' <span class="etag">만든 사람</span>' : ''}${CL.user && u === CL.user.uid ? ' <span class="etag">나</span>' : ''}</span>${CL.role === 'owner' && u !== CL.trip.owner ? `<button class="btn ghost sm" data-kick="${esc(u)}">내보내기</button>` : ''}</div>`).join('')}</div></div>` : '';
    const trips = CL ? `<div class="card" id="acct"><div class="k">내 여행</div><div id="tripList" class="muted">불러오는 중…</div>
      ${UT ? `<button class="btn ghost sm" id="tripNew" style="margin-top:8px">${I('plus')} 새 여행</button>` : ''}</div>` : '';
    if (CL) setTimeout(loadTripList, 0);
    return `${share}${trips}${UT ? `<div class="card"><div class="k">${I('down')} 오프라인</div><div class="muted" id="offInfo">${offInfo()}</div></div>` : ''}<div class="card"><div class="k">내 계정</div>${who}
      <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" id="tutAgain">사용법 다시 보기</button>
      ${!OWNER && UT ? `<button class="btn ghost sm" id="tripDel">${CL && CL.role === 'edit' ? '이 여행 닫기' : '이 여행 지우기'}</button>` : ''}
      ${USER ? '<button class="btn ghost sm" id="logout">로그아웃</button>' : ''}</div></div>`;
  }
  const saveErr = (e) => {
    const c = (e && e.code) || '';
    return (c === 'permission-denied' ? '이 여행에 저장할 권한이 없어요. 새로고침한 뒤 다시 해 보세요.'
      : c === 'not-found' || c === 'failed-precondition' ? '서버에서 여행 저장소를 찾지 못했어요. 잠시 후 다시 해 주세요.'
      : c === 'unavailable' || !navigator.onLine ? '서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.'
      : '저장하지 못했어요. 잠시 후 다시 해 주세요.');
  };
  // 저장 상태 안내: 오프라인이거나 아직 못 올린 변경이 있으면 사실대로 알려요
  function syncInfo() {
    if (!CL) return '고친 일정은 이 기기에만 저장돼요.';
    if (CL.error === 'denied') return '서버가 저장을 거절했어요. 이 기기에는 저장돼 있어요. 여행 주인에게 확인해 주세요.';
    if (!navigator.onLine) return '지금 오프라인이에요. 고친 내용은 이 기기에 저장되고, 인터넷이 연결되면 서버에 올라가요.';
    if (CL.pending) return '서버에 저장하는 중이에요…';
    return '고친 일정은 내 계정에 저장되고, 함께 편집하는 사람에게도 바로 보여요.';
  }
  async function loadTripList() {
    const el = $('#tripList'); if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    try {
      const ls = await CL.list();
      const box = $('#tripList'); if (!box) return;
      box.innerHTML = ls.length ? ls.map((t) => `<button class="tripitem${t.id === CL.tripId ? ' on' : ''}" data-trip="${esc(t.id)}"><b>${esc(t.title)}</b><span>${esc(t.start)} ~ ${esc(t.end)}${t.memberIds.length > 1 ? ` · ${t.memberIds.length}명` : ''}</span></button>`).join('')
        : '아직 서버에 저장된 여행이 없어요.';
    } catch (e) { const box = $('#tripList'); if (box) box.textContent = '여행 목록을 불러오지 못했어요.'; }
  }
  async function shareOut(kind) {
    try {
      const url = await CL.shareLink(kind);
      const text = kind === 'edit' ? `도코데에서 "${UT.title}" 일정을 같이 편집해요` : `도코데 "${UT.title}" 일정이에요`;
      if (navigator.share) { try { await navigator.share({ title: 'DokoDae', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
      await navigator.clipboard.writeText(url); toast('링크를 복사했어요. 카톡에 붙여 넣어 보내세요.');
    } catch (e) { toast('링크를 만들지 못했어요. 인터넷 연결을 확인해 주세요.'); }
    if (kind === 'view') renderPlan();
  }
  // ---------- AI 일정 가져오기 ----------
  function importHTML() {
    const st = S.imp || {};
    if (st.plan) {
      const p = st.plan, nStops = p.days.reduce((k, d) => k + d.stops.length, 0), found = st.found || 0;
      return `<div class="card newtrip"><div class="big">${I('cal')} 이렇게 읽었어요</div>
        <div style="margin-top:6px"><b>${esc(p.title)}</b> · ${esc(p.start)} ~ ${esc(p.end)}${p.stay ? ' · ' + esc(p.stay) : ''}</div>
        <div class="muted">장소 ${nStops}곳 중 ${found}곳을 지도에서 찾았어요.${nStops > found ? ' 못 찾은 곳은 나중에 "수정"에서 위치를 찍어 주세요.' : ''}</div>
        ${p.notes ? `<div class="tip">${I('bulb')} ${esc(p.notes)}</div>` : ''}
        <div class="impdays">${p.days.map((d) => `<div class="impday"><b>${esc(d.date.slice(5).replace('-', '/'))}</b> ${d.stops.map((s) => `<span class="${s.lat == null ? 'nf' : ''}">${esc(s.t)} ${esc(s.n)}</span>`).join('')}</div>`).join('')}</div>
        <div class="row" style="margin-top:10px"><button class="btn" id="impSave">${I('cal')} 이 일정으로 만들기</button><button class="btn ghost" id="impBack">다시 넣기</button></div></div>`;
    }
    const files = st.files || [];
    return `<div class="card newtrip"><div class="big">${I('chat')} AI로 일정 가져오기</div>
      <div class="muted">메모, 카톡 대화, 엑셀에 적어 둔 일정을 붙여 넣거나 캡처·txt 파일을 올리면 날짜별 일정과 지도 동선을 만들어 드려요.</div>
      <textarea id="impText" rows="5" placeholder="예: 2/1 오사카 도착, 11시 도톤보리, 1시 구로몬 시장 점심, 4시 오사카성…">${esc(st.text || '')}</textarea>
      <div class="row" style="margin-top:8px"><label class="btn ghost" for="impFile" style="margin:0">${I('camera')} 캡처·txt 올리기</label><input type="file" id="impFile" accept="image/*,.txt,text/plain" multiple hidden>
      ${files.length ? `<span class="muted">${files.length}개 올림 <button class="tutskip" id="impClear">지우기</button></span>` : ''}</div>
      <p class="lmsg" id="impMsg">${esc(st.err || '')}</p>
      <button class="btn" id="impGo" style="width:100%" ${st.busy ? 'disabled' : ''}>${st.busy ? esc(st.busy) : 'AI로 일정 만들기'}</button></div>`;
  }
  function sliceImage(file) {
    // 긴 카톡 캡처도 글자가 읽히게: 폭 1000px로 맞추고 세로 2000px씩 나눠요
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const k = Math.min(1, 1000 / im.width), W = Math.round(im.width * k), H = Math.round(im.height * k), out = [];
        for (let y = 0; y < H && out.length < 4; y += 2000) {
          const h = Math.min(2000, H - y), c = document.createElement('canvas'); c.width = W; c.height = h;
          c.getContext('2d').drawImage(im, 0, y / k, im.width, h / k, 0, 0, W, h);
          out.push({ media_type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.72).split(',')[1] });
        }
        URL.revokeObjectURL(url); resolve(out);
      };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      im.src = url;
    });
  }
  async function geocode(s) {
    const q = [s.ja || s.n, s.city].filter(Boolean).join(' ');
    try {
      const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${MT_KEY}&country=jp&limit=1&language=ko`);
      const j = await r.json(), f = j.features && j.features[0];
      if (f && f.center) return { lat: +f.center[1].toFixed(5), lng: +f.center[0].toFixed(5) };
    } catch (e) {}
    return null;
  }
  async function runImport() {
    const st = S.imp = S.imp || {};
    st.text = ($('#impText') || {}).value || '';
    const files = st.files || [];
    if (!st.text.trim() && !files.length) { st.err = '일정 글을 붙여 넣거나 캡처를 올려 주세요.'; return renderPlan(); }
    if (!navigator.onLine) { st.err = '인터넷이 연결돼야 AI가 일정을 읽을 수 있어요.'; return renderPlan(); }
    st.err = ''; st.busy = 'AI가 일정을 읽는 중… (20초쯤 걸려요)'; renderPlan();
    try {
      let text = st.text; const images = [];
      for (const f of files) {
        if (/^text\/|\.txt$/i.test(f.type || f.name)) text += '\n\n' + (await f.text()).slice(0, 15000);
        else if (/^image\//.test(f.type)) images.push(...(await sliceImage(f)));
      }
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), 90000);
      const r = await fetch('/api/import', { signal: ac.signal, method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, images: images.slice(0, 5), today: nowJST().d }) });
      const j = await r.json().catch(() => ({})); clearTimeout(to);
      if (!r.ok || !j.plan) throw new Error(j.message || (r.status >= 500 ? '서버에 잠깐 문제가 생겼어요. 잠시 후 다시 해 주세요.' : '일정을 읽지 못했어요.'));
      const p = j.plan;
      if (!p.days.length || !p.start) throw new Error('날짜가 있는 일정을 찾지 못했어요. 날짜를 같이 적어 주세요.');
      st.busy = '지도에서 장소를 찾는 중…'; renderPlan();
      const all = p.days.flatMap((d) => d.stops); let found = 0;
      for (let i = 0; i < all.length; i += 4) {
        const res = await Promise.all(all.slice(i, i + 4).map(geocode));
        res.forEach((g, k) => { if (g) { Object.assign(all[i + k], g); found++; } });
      }
      st.plan = p; st.found = found;
    } catch (e) { st.err = e.name === 'AbortError' ? '시간이 너무 오래 걸려서 멈췄어요. 일정을 나눠서 넣어 보세요.' : !navigator.onLine ? '인터넷 연결이 끊겼어요. 연결되면 다시 해 주세요.' : (e.message || '일정을 읽지 못했어요.'); }
    st.busy = ''; renderPlan();
  }
  function saveImport() {
    const p = S.imp.plan;
    if (dayRange(p.start, p.end).length > 30) return toast('여행은 30일까지 만들 수 있어요.');
    const edits = {}; let n = 0;
    p.days.forEach((d) => {
      edits['u' + d.date] = { mod: {}, del: [], add: d.stops.map((s) => ({ id: (Date.now() + n++).toString(36), t: s.t, n: s.n, m: s.m, todo: s.todo, lat: s.lat, lng: s.lng })) };
    });
    const nt = { title: p.title, start: p.start, end: p.end, stay: p.stay, created: Date.now(), via: 'ai' };
    if (CL) return CL.create(nt, edits).then(openTrip).then(() => toast('여행을 만들었어요.')).catch((e) => toast(saveErr(e)));
    store.set('trip', nt);
    store.set('edits', edits);
    reopenTrip();
  }
  function newTripHTML() {
    const t = nowJST().d;
    return `<div class="card newtrip"><div class="big">새 여행 만들기</div>
      <div class="muted">여행 이름과 날짜를 정하면 날짜별로 빈 일정이 생겨요. 그다음 날짜마다 장소를 추가하면 지도에 동선이 그려져요.</div>
      <label for="ntTitle">여행 이름</label><input type="text" id="ntTitle" maxlength="40" placeholder="예: 오사카 3박 4일">
      <div class="two"><div><label for="ntStart">시작일</label><input type="date" id="ntStart" value="${t}"></div>
      <div><label for="ntEnd">마지막 날</label><input type="date" id="ntEnd" value="${t}"></div></div>
      <label for="ntStay">숙소 (선택)</label><input type="text" id="ntStay" maxlength="60" placeholder="예: 난바 OO 호텔">
      <p class="lmsg" id="ntMsg"></p>
      <button class="btn" id="tripMake" style="width:100%;margin-top:4px">여행 만들기</button></div>`;
  }
  function renderPlan() {
    const n = nowJST();
    if (S.day === 'prep' && UT) { view.innerHTML = prepHTML() + acctHTML(); return; }
    const d = dayOf(S.day);
    if (!d) { view.innerHTML = importHTML() + (S.imp && S.imp.plan ? '' : newTripHTML()) + acctHTML(); return; }
    const { cur, next } = findNow(n);
    let top = '';
    if (inTrip(n) && (cur || next)) {
      const st = cur || next;
      top = `<div class="card now">
        <div class="k">${cur ? '지금 할 일' : '다음 할 일'} · ${esc(st.s)}~${esc(st.e)} · ${esc(st.place)}</div>
        <div class="big">${esc(st.todo)}</div>
        ${st.board ? `<div class="det"><b>타는 곳</b> ${esc(st.board)}</div>` : ''}
        ${st.alight ? `<div class="det"><b>내리는 곳</b> ${esc(st.alight)}</div>` : ''}
        ${st.memo ? `<div class="det">${I('bulb')} ${esc(st.memo)}</div>` : ''}
        <div>${cardTags(cardsForStep(st))}</div>
        ${cur && next ? `<div class="det" style="margin-top:8px"><b>다음</b> ${esc(next.s)} ${esc(next.todo)}</div>` : ''}
        <div class="row" style="margin-top:10px"><button class="btn" data-askstep="${IT.indexOf(st)}">${I('chat')} 물어보기</button></div>
      </div>`;
    } else if (inTrip(n) && !IT.length) {
      // 직접 만든 여행: 오늘 일정에서 지금 할 일·다음 할 일을 보여줘요
      const td = dayOf(n.d), ix = td ? curStop(td, n) : -1, vi = td ? td.vis : [], pos = vi.indexOf(ix);
      const now = ix >= 0 ? td.stops[ix] : null, nxi = pos >= 0 ? vi[pos + 1] : vi[0], nx = nxi != null ? td.stops[nxi] : null;
      const main = now || nx;
      if (main) {
        const todos = todoList(td, main).filter((t, k) => !isChk(td, main, t, k)).slice(0, 3);
        const os = isOsaka(td), lg = legOf(td, now ? ix : nxi, null), board = todoList(td, main).find((t) => /타는|승강장|플랫폼|번선|출구|개찰/.test(t));
        top = `<div class="board">
          <div class="bhead"><span class="bk">${now ? '지금' : '다음'}</span><span class="btime">${esc(main[0])}</span>${lg.c ? `<span class="bline" style="--lc:${lg.c}">${esc(lg.label.split(' · ')[0])}</span>` : ''}</div>
          <div class="bdest">${badges(esc(main[1]), os)}</div>
          <div class="bbody">
            ${board ? `<div class="brow"><span class="bl">타는 곳</span><span>${badges(esc(board), os)}</span></div>` : ''}
            ${todos.filter((t) => t !== board).slice(0, 2).map((t, k) => `<div class="brow"><span class="bl">${k ? '' : '할 일'}</span><span>${badges(esc(t), os)}</span></div>`).join('')}
            ${now && nx ? `<div class="brow sub"><span class="bl">다음</span><span><b class="tnum">${esc(nx[0])}</b> ${badges(esc(nx[1]), os)}</span></div>` : ''}
            <div class="row" style="margin-top:12px">${S.day !== n.d ? `<button class="btn ghost" data-day="${esc(n.d)}">오늘 일정</button>` : ''}<button class="btn" data-asknow="${esc(main[1])}">${I('chat')} 물어보기</button></div>
          </div>
        </div>`;
      } else if (td && !vi.length) top = `<div class="card"><div class="muted">오늘은 아직 일정이 없어요.</div></div>`;
      else if (td) top = `<div class="card"><div class="muted">오늘 일정은 모두 끝났어요.</div></div>`;
    } else if (n.d < TRIP_START && !OWNER) {
      const dd = Math.round((Date.parse(TRIP_START) - Date.parse(n.d)) / 864e5);
      top = dd > 0 && !store.get('hintSeen', 0) ? (store.set('hintSeen', 1), `<div class="card hint"><div class="muted">여행 날이 되면 지금 할 일이 여기에 떠요.</div></div>`) : '';
    } else if (n.d < TRIP_START) {
      top = `<div class="card"><div class="k">여행 전</div><div style="font-weight:600;margin:2px 0 4px">여행이 시작되면 여기에 "지금 할 일"이 떠요</div>
        <div class="muted">미리 써 보려면 여행 중 시간으로 바꿔 보세요.</div>
        <div class="row" style="margin-top:8px">
          <button class="btn ghost" data-sim="2027-01-08T15:00">1/8 나리타 도착</button>
          <button class="btn ghost" data-sim="2027-01-10T09:20">1/10 환승 중</button>
          <button class="btn ghost" data-sim="2027-01-11T18:30">1/11 온천</button>
        </div></div>`;
    } else if (n.d > TRIP_END) {
      top = `<div class="card"><b>여행이 끝났어요. 수고 많으셨어요!</b></div>`;
    }
    const ci = curStop(d, n);
    const EM = S.editMode, OS = isOsaka(d);
    // 노선도 선: 미리 구간을 계산해 두고, 장소마다 들어오는 선(--li)과 나가는 선(--lo)을 칠해요
    const WALKBG = 'repeating-linear-gradient(var(--sub) 0 4px,transparent 4px 9px)';
    const live = d.seq.filter((i) => !d.stops[i].del), LEG = {};
    live.forEach((i, k) => { if (k) LEG[i] = legOf(d, i, d.stops[live[k - 1]]); });
    const legBg = (lg) => (!lg ? 'transparent' : lg.c ? lg.c : lg.walk ? WALKBG : 'var(--rail-line)');
    const stops = d.seq.map((i) => {
      const s = d.stops[i], no = numOf(d, i);
      const ml0 = d.meals.filter((ml) => ml.at === i);
      if (S.edit && S.edit.i === i) return editorHTML(d) + mealsHTML(d, ml0);
      if (s.del) return (EM ? `<div class="stop gone"><span class="time">${esc(s[0])}</span><span class="num">–</span><span class="what"><b>${esc(s[1])}</b><small>지운 일정</small><button class="ebtn" data-restore="${i}">되살리기</button></span></div>` : '') + mealsHTML(d, ml0);
      const rides = d.rides[i] || [], todo = todoList(d, s);
      const li = rides.map((t, k) => { const key = tdKey(d, s, 'r' + k); return `<li data-td="${esc(key)}" class="ride${tdGet(key) ? ' done' : ''}" role="checkbox" aria-checked="${tdGet(key)}">${I('train')} ${esc(t)}</li>`; })
        .concat(todo.map((t, k) => {
          // 직접 넣은 장소의 체크는 항목 글자를 따라가고, 함께 편집하는 사람과 같이 보여요
          if (s.custom != null) { const on = isChk(d, s, t, k); return `<li data-chk="${i}|${k}" class="${on ? 'done' : ''}" role="checkbox" aria-checked="${on}" tabindex="0">${esc(t)}</li>`; }
          const key = tdKey(d, s, k); return `<li data-td="${esc(key)}" class="${tdGet(key) ? 'done' : ''}" role="checkbox" aria-checked="${tdGet(key)}" tabindex="0">${esc(t)}</li>`;
        })).join('');
      const tags = cardsForText([s[1], s[2]].concat(rides, todo).join(' '), 2);
      const meals = mealsHTML(d, ml0), op = S.xp.has(i) || EM;
      const nDo = rides.length + todo.length + ml0.length;
      // 노선도: 앞 장소에서 오는 구간을 그 노선 색 선으로 (걸어가면 점선)
      const lg = LEG[i], nx = LEG[live[live.indexOf(i) + 1]];
      const legRow = lg ? `<div class="leg${lg.label ? '' : ' bare'}" style="--lc:${legBg(lg)}"><span>${esc(lg.label)}</span></div>` : '';
      return legRow + `<div class="stop${i === ci ? ' cur' : ''}${i === S.sel ? ' on' : ''}${op ? ' open' : ''}" data-stop="${i}" role="button" tabindex="0" aria-expanded="${!!op}" style="--li:${legBg(lg)};--lo:${legBg(nx)}">
        <span class="time">${esc(s[0])}</span>
        <span class="num${no ? (s[5] === 'm' ? ' move' : '') : ' start'}">${no}</span>
        <span class="what">${EM ? `<button class="ebtn" data-edit="${i}">수정</button>` : ''}<b>${badges(esc(s[1]), OS)}</b>${i === ci ? '<span class="nowtag">지금</span>' : ''}${s.custom != null && d.base.length ? '<span class="etag">추가함</span>' : s.edited ? '<span class="etag">수정함</span>' : ''}${s[3] == null ? '<span class="etag">위치 없음</span>' : ''}${nDo || s[2] ? `<span class="chev" aria-hidden="true">${nDo ? nDo + ' ' : ''}${I('chev')}</span>` : ''}
</span>
          <div class="sdet">${s[2] ? `<small class="memo">${esc(s[2])}</small>` : ''}
          ${li ? `<ul class="todo">${li}</ul>` : ''}
          ${tags.length ? `<div class="stags">${cardTags(tags)}</div>` : ''}</div>
        </div>${meals ? `<div class="smeal">${meals}</div>` : ''}`;
    }).join('');
    const sim = store.get('sim', '');
    const usedLines = [];
    R.PLANS[d.id].forEach((it) => { if (typeof it !== 'number' && !usedLines.includes(R.LINES[it[0]])) usedLines.push(R.LINES[it[0]]); });
    view.innerHTML = `${top}
      <div class="dayhead"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><h2>${esc(d.title)}</h2>${VIEW ? '' : `<button class="btn ${EM ? '' : 'ghost'} sm" id="editMode">${EM ? '편집 끝내기' : I('edit') + ' 일정 편집'}</button>`}</div><div class="sub">${esc(d.sub)}</div>${VIEW ? '' : `<div class="airow"><button class="aibtn${S.ai && S.ai.day === d.id && S.ai.mode === 'polish' ? ' on' : ''}" id="aiPolish">${I('spark')} AI로 일정 다듬기</button><button class="aibtn${S.ai && S.ai.day === d.id && S.ai.mode === 'suggest' ? ' on' : ''}" id="aiSuggest">${I('pin')} 근처 가볼 곳 추천</button></div>`}</div>
      ${S.ai && S.ai.day === d.id ? aiBoxHTML(d) : ''}
      ${usedLines.length || d.meals.length ? `<div class="legend">${usedLines.map((l) => `<span><i style="width:16px;height:5px;border-radius:3px;background:${l.c};display:inline-block"></i>${esc(l.n)}</span>`).join('')}<span><i style="width:16px;border-top:3px dotted var(--c);display:inline-block"></i>도보</span><span style="color:var(--food)"><i class="dia"></i>맛집 후보</span></div>` : ''}
      <div class="route">${stops || `<div class="empty muted">아직 이날 일정이 없어요.${VIEW ? '' : ' 아래 "이날 일정 추가"로 장소를 넣으면 지도에 동선이 그려져요.'}</div>`}</div>
      ${VIEW ? '' : S.edit && S.edit.i === 'new' ? editorHTML(d) : `<button class="addstop" id="addStop">${I('plus')} 이날 일정 추가</button>`}
      ${EM && d.base.length && hasEdits(d) && (Object.keys(edOf(d).mod).length || edOf(d).del.length) ? `<div style="text-align:center;margin:6px 0 4px"><button class="tag" id="resetDay">원래 일정에서 고친 것 되돌리기</button></div>` : ''}
      ${EM ? `<div class="muted" style="margin:4px 2px 0" id="syncInfo">${syncInfo()}</div>` : ''}
      <details class="card setbox"${sim ? ' open' : ''}><summary class="k">설정</summary>
        <label class="muted" for="simIn" style="display:block;margin:6px 0">미리보기 시간 (비워 두면 실제 일본 시각)</label>
        <div class="row"><input type="datetime-local" id="simIn" value="${esc(sim)}" min="${TRIP_START}T00:00" max="${TRIP_END}T23:59" style="flex:1"><button class="btn ghost" id="simClear">실제 시각</button></div>
        <label class="muted" for="codeIn" style="display:block;margin:10px 0 6px">AI 접근 코드 (받은 경우에만)</label>
        <input type="text" id="codeIn" value="${esc(store.get('code', ''))}" placeholder="없으면 비워 두세요">
      </details>${acctHTML()}`;
  }

  // ---------- AI 일정 도우미: 다듬기 · 근처 추천 (결과는 골라서 넣어요) ----------
  const aiStops = (d) => d.vis.map((i) => { const x = d.stops[i]; return { k: x.key, t: x[0], n: x[1], m: x[2] || '', todo: todoList(d, x), go: x.go || undefined, lat: x[3] == null ? undefined : x[3], lng: x[4] == null ? undefined : x[4] }; });
  const stopName = (d, k) => { const i = d.stops.findIndex((x) => x.key === k && !x.del); return i >= 0 ? d.stops[i][1] : ''; };
  const goTxt = (g) => (!g ? '' : g.m === 'walk' ? `걸어서${g.min ? ' ' + g.min + '분' : ''}` : `${g.ln || GO_NAME[g.m] || ''}${g.min ? ' · ' + g.min + '분' : ''}`);
  function aiBoxHTML(d) {
    const A = S.ai, P = A.mode === 'polish', r = A.res;
    const head = `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${P ? 'AI로 일정 다듬기' : '근처 가볼 곳 추천'}</b><button class="tag" id="aiClose" aria-label="닫기">${I('x')}</button></div>`;
    const ask = P ? `<p class="muted" style="margin:6px 0 10px">이동 시간, 영업시간, 동선 순서를 보고 고칠 곳을 알려줘요. 바로 바뀌지 않고, 고른 것만 반영돼요.</p>`
      : `<p class="muted" style="margin:6px 0 8px">이날 동선 근처에서 넣을 만한 곳을 골라 줘요.</p><div class="row" style="flex-wrap:nowrap;gap:6px"><input type="text" id="aiWish" value="${esc(A.wish || '')}" placeholder="바라는 것 (예: 카페, 야경, 비 오는 날)" style="flex:1;min-width:0"></div>`;
    const go = `<button class="btn" id="aiGo" style="width:100%;margin-top:10px"${A.busy ? ' disabled' : ''}>${A.busy ? 'AI가 보는 중… (20초쯤)' : r ? '다시 받기' : P ? '다듬어 보기' : '추천받기'}</button>`;
    let body = '';
    if (A.err) body += `<p class="muted" style="color:var(--warn);margin-top:10px">${esc(A.err)}</p>`;
    if (r && P) {
      const rows = [];
      (r.edits || []).forEach((e, j) => rows.push({ id: 'e' + j, title: stopName(d, e.k) || e.n, lines: [e.t && `시간 → ${e.t}`, e.n && `이름 → ${e.n}`, e.m && `메모 → ${e.m}`, e.go && `오는 방법 → ${goTxt(e.go)}`, e.todo && `할 일 → ${e.todo.join(' · ')}`].filter(Boolean), why: e.why, tag: '고치기' }));
      (r.adds || []).forEach((e, j) => rows.push({ id: 'a' + j, title: e.n, lines: [`${e.t}${e.after ? ' · ' + stopName(d, e.after) + ' 다음' : ''}`, e.m].filter(Boolean), why: e.why, tag: '넣기' }));
      (r.dels || []).forEach((e, j) => rows.push({ id: 'd' + j, title: stopName(d, e.k), lines: [], why: e.why, tag: '빼기' }));
      body += `${r.summary ? `<p style="margin:12px 0 4px">${esc(r.summary)}</p>` : ''}`;
      body += rows.length ? rows.map((x) => `<label class="airow2"><input type="checkbox" data-aipick="${x.id}"${A.off.has(x.id) ? '' : ' checked'}><div><div><span class="aitag">${x.tag}</span><b>${esc(x.title)}</b></div>${x.lines.map((l) => `<div class="det">${esc(l)}</div>`).join('')}${x.why ? `<div class="muted">${esc(x.why)}</div>` : ''}</div></label>`).join('')
        + `<button class="btn" id="aiApply" style="width:100%;margin-top:10px"${A.busy ? ' disabled' : ''}>고른 ${rows.length - [...A.off].filter((v) => rows.some((x) => x.id === v)).length}개 반영하기</button>` : `<p class="muted">고칠 곳이 없어요. 지금 일정 그대로 좋아요.</p>`;
    }
    if (r && !P) {
      body += (r.items || []).map((x, j) => `<div class="aisug"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><div>${x.kind ? `<span class="aitag">${esc(x.kind)}</span>` : ''}<b>${esc(x.n)}</b></div><div class="det">${esc([x.t, x.stay ? x.stay + '분 머물기' : '', x.after ? stopName(d, x.after) + ' 다음' : '', goTxt(x.go)].filter(Boolean).join(' · '))}</div><div class="muted">${esc(x.why)}</div></div>${A.added.has(j) ? `<span class="tag">넣었어요</span>` : `<button class="btn sm" data-aiadd="${j}"${A.busy ? ' disabled' : ''}>${I('plus')} 넣기</button>`}</div></div>`).join('') || '<p class="muted">추천을 찾지 못했어요. 바라는 것을 바꿔 다시 받아 보세요.</p>';
    }
    return `<div class="card aibox" id="aiBox">${head}${r ? '' : ask}${r && !P ? ask : ''}${r && P ? '' : go}${body}${r && P ? go.replace('class="btn"', 'class="btn ghost"') : ''}</div>`;
  }
  async function runAI() {
    const d = dayOf(S.day), A = S.ai; if (!A || A.busy) return;
    if (!navigator.onLine) { A.err = '인터넷이 연결돼야 AI를 쓸 수 있어요.'; return renderPlan(); }
    const w = $('#aiWish'); if (w) A.wish = w.value;
    A.busy = true; A.err = ''; renderPlan();
    try {
      const ac = new AbortController(), to = setTimeout(() => ac.abort(), 60000);
      const r = await fetch('/api/plan', { signal: ac.signal, method: 'POST', headers: { 'content-type': 'application/json', 'x-access-code': store.get('code', '') }, body: JSON.stringify({ mode: A.mode, wish: A.wish || '', trip: UT ? UT.title : '', day: { date: d.id.slice(1), title: d.title, stops: aiStops(d) } }) });
      const j = await r.json().catch(() => ({})); clearTimeout(to);
      if (!r.ok) throw new Error(j.message || 'AI 응답을 받지 못했어요.');
      A.res = j; A.off = new Set(); A.added = new Set();
    } catch (e) { A.err = e.name === 'AbortError' ? 'AI가 너무 오래 걸려요. 잠시 후 다시 해 주세요.' : e.message; }
    A.busy = false; if (S.ai === A) renderPlan();
  }
  // 이날 동선 근처에서 장소 위치 찾기 (50km 넘게 떨어지면 버려요)
  async function geoNear(d, q) {
    const pts = d.vis.map((i) => d.stops[i]).filter((x) => x[3] != null);
    const c = pts.length ? [pts.reduce((a, x) => a + x[3], 0) / pts.length, pts.reduce((a, x) => a + x[4], 0) / pts.length] : null;
    try {
      const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${MT_KEY}&country=jp&limit=1&language=ko${c ? `&proximity=${c[1].toFixed(4)},${c[0].toFixed(4)}` : ''}`);
      const j = await r.json(), f = j.features && j.features[0];
      if (f && f.center) { const p = { lat: +f.center[1].toFixed(5), lng: +f.center[0].toFixed(5) }; if (!c || L.latLng(c).distanceTo([p.lat, p.lng]) < 50000) return p; }
    } catch (e) {}
    return { lat: null, lng: null };
  }
  const newAdd = async (d, x) => { const p = await geoNear(d, x.ja || x.n); const a = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: x.t || '12:00', n: x.n, m: x.m || '', todo: x.todo || [], lat: p.lat, lng: p.lng }; if (x.go) a.go = x.go; edOf(d).add.push(a); return a; };
  async function aiAdd(j) {
    const d = dayOf(S.day), A = S.ai, x = A && A.res && A.res.items && A.res.items[j]; if (!x || A.busy) return;
    A.busy = true; renderPlan();
    const a = await newAdd(d, x); A.added.add(j); A.busy = false;
    saveEdits(); render(); toast(a.lat == null ? `"${x.n}"을 넣었어요. 위치를 못 찾아서 일정 편집에서 위치를 찍어 주세요.` : `"${x.n}"을 ${x.t || ''} 일정에 넣었어요.`);
  }
  async function aiApply() {
    const d = dayOf(S.day), A = S.ai, r = A && A.res; if (!r || A.busy) return;
    A.busy = true; renderPlan();
    const e = edOf(d), at = (k) => d.stops.findIndex((x) => x.key === k && !x.del); let n = 0;
    for (const [j, x] of (r.edits || []).entries()) {
      if (A.off.has('e' + j)) continue; const i = at(x.k); if (i < 0) continue; const st = d.stops[i];
      if (st.custom != null) { const a = e.add.find((v) => v.id === st.custom); if (!a) continue; ['t', 'n', 'm', 'todo'].forEach((f) => { if (x[f] != null) a[f] = x[f]; }); if (x.go) a.go = x.go; }
      else { const m = e.mod[i] = e.mod[i] || {}; ['t', 'n', 'm', 'todo'].forEach((f) => { if (x[f] != null) m[f] = x[f]; }); }
      n++;
    }
    for (const [j, x] of (r.dels || []).entries()) {
      if (A.off.has('d' + j)) continue; const i = at(x.k); if (i < 0) continue; const st = d.stops[i];
      if (st.custom != null) e.add = e.add.filter((v) => v.id !== st.custom); else if (!e.del.includes(i)) e.del.push(i);
      n++;
    }
    for (const [j, x] of (r.adds || []).entries()) { if (A.off.has('a' + j)) continue; await newAdd(d, x); n++; }
    S.ai = null; saveEdits(); render(); toast(n ? `AI 제안 ${n}개를 반영했어요.` : '반영할 것을 고르지 않았어요.');
  }

  // ---------- 사용법 (처음 한 번) ----------
  const TUT = [
    ['map', '도코데에 오신 걸 환영해요', '일본 여행 중에 일정, 동선, 막힐 때 도움을 한곳에서 볼 수 있어요. 처음이니 30초만 둘러볼게요.'],
    ['cal', '1. 여행 만들기', '일정 탭에서 여행 이름과 날짜를 정하면 날짜별 빈 일정이 생겨요. 샘플 일정은 없어요. 처음부터 내 여행으로 채워요.'],
    ['pin', '2. 장소 추가하기', '날짜를 고르고 "이날 일정 추가"를 눌러 장소를 검색해요. 넣은 순서와 시간대로 지도에 번호와 동선이 그려져요.'],
    ['tap', '3. 장소를 누르면 할 일이 펼쳐져요', '평소에는 장소 이름만 보여요. 누르면 메모와 체크리스트가 펼쳐지고, 지도도 그 장소로 이동해요.'],
    ['chat', '4. 막히면 바로 도움 받기', 'AI 묻기에 상황을 적거나 사진을 보내 보세요. 상황카드에는 교통·식당·숙소 대처법이, 긴급 탭에는 연락처가 있어요.']
  ];
  function showTutorial() {
    let k = 0;
    const el = document.createElement('div'); el.className = 'tut'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    const done = () => { store.set('tutDone', 1); try { localStorage.setItem('th.tutDone', '1'); } catch (e) {} el.remove(); document.removeEventListener('keydown', esc1); backPop('tut'); };
    const esc1 = (ev) => { if (ev.key === 'Escape') done(); };
    document.addEventListener('keydown', esc1); backPush('tut');
    const draw = () => {
      let [ico, h, p] = TUT[k]; const last = k === TUT.length - 1;
      if (k === 1 && R.DAYS.length) { h = '1. 날짜를 골라 보세요'; p = '위쪽 날짜를 누르면 그날 일정과 동선이 지도에 그려져요. 맨 앞 "여행 전"에는 준비할 것 목록이 있어요.'; }
      el.innerHTML = `<div class="tutc"><div class="ico">${I(ico)}</div><h3>${esc(h)}</h3><p>${esc(p)}</p>
        <div class="dots">${TUT.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</div>
        <div class="tutf">${last ? '<span></span>' : '<button class="tutskip" data-t="skip">건너뛰기</button>'}<div class="tutb">${k ? '<button class="btn ghost" data-t="prev">이전</button>' : ''}<button class="btn" data-t="next">${last ? '시작하기' : '다음'}</button></div></div></div>`;
    };
    el.addEventListener('click', (ev) => {
      if (ev.target === el) return done();
      const b = ev.target.closest('[data-t]'); if (!b) return; ev.stopPropagation();
      if (b.dataset.t === 'skip') return done();
      if (b.dataset.t === 'prev') { k = Math.max(0, k - 1); return draw(); }
      if (k === TUT.length - 1) { done(); if (!R.DAYS.length) { go('plan'); if (!isDesk()) setSheet('full'); } return; }
      k++; draw();
    });
    draw(); document.body.appendChild(el);
  }

  // ---------- 상황 카드 ----------
  const seg2 = (on) => `<div class="seg"><button data-tab="cards" class="${on === 'cards' ? 'on' : ''}">${I('compass')} 상황카드</button><button data-tab="phrases" class="${on === 'phrases' ? 'on' : ''}">${I('speak')} 보여주기 문장</button></div>`;
  // 검색창은 그대로 두고 아래 목록만 다시 그려요 (한글 입력이 자모로 쪼개지지 않게)
  function renderCards(listOnly) {
    const cq = $('#cq');
    if (listOnly && cq) { $('#cchips').innerHTML = cardChips(); $('#clist').innerHTML = cardList(); return; }
    view.innerHTML = `${seg2('cards')}<input type="search" id="cq" placeholder="무슨 상황이에요? 예: 식권기, 환승, 온천" value="${esc(S.query)}">
      <div class="chips" id="cchips" style="margin-top:8px">${cardChips()}</div>
      <div id="clist">${cardList()}</div>`;
  }
  function cardChips() {
    return [{ id: 'all', name: '전체', icon: '' }, ...window.CATS].map((c) => `<button class="chip ${S.cat === c.id && !S.query ? 'on' : ''}" data-cat="${c.id}">${I(c.icon)} ${esc(c.name)}</button>`).join('');
  }
  function cardList() {
    const list = S.query ? searchCards(S.query, 30) : window.CARDS.filter((c) => S.cat === 'all' || c.cat === S.cat);
    return `${list.map((c) => `<div class="card" id="c-${c.id}">
        <div class="row" data-toggle="${c.id}" style="justify-content:space-between;cursor:pointer;flex-wrap:nowrap"><div><div class="k">${I(window.CATS.find((x) => x.id === c.cat).icon)} ${window.CATS.find((x) => x.id === c.cat).name}</div><b>${esc(c.title)}</b></div><span class="cv">${I(S.open === c.id ? 'up' : 'chev')}</span></div>
        ${S.open === c.id ? cardBody(c) : `<div class="muted" style="margin-top:4px">${esc(c.sum)}</div>`}
      </div>`).join('')}
      <div class="card"><div class="muted">찾는 상황이 없나요?</div><button class="btn" style="margin-top:8px" data-askq="1">AI에게 바로 묻기</button></div>`;
  }

  // ---------- AI 묻기 ----------
  function buildContext(q) {
    const n = nowJST();
    const { cur, next } = findNow(n);
    const day = inTrip(n) ? n.d : (S.day && S.day !== 'prep' ? S.day : TRIP_START);
    const line = (x) => `${x.s}-${x.e} ${x.place} | ${x.todo}${x.board ? ' | 타는곳: ' + x.board : ''}${x.alight ? ' | 내리는곳: ' + x.alight : ''}${x.memo ? ' | 메모: ' + x.memo : ''}`;
    const todays = IT.filter((x) => x.d === day).map(line).join('\n');
    const stay = stayOn(day);
    const cards = searchCards(q, 3);
    let ctx = `[지금 시각] 일본 ${n.d} ${n.t}${inTrip(n) ? '' : ' (아직 여행 전이라 사용자가 미리 물어보는 중일 수 있음)'}\n`;
    ctx += OWNER ? `[여행] 남자 2명, 2027-01-08~14 도쿄(아키하바라 숙소)→가마쿠라 당일→심야버스→오사카(난바 숙소). 교통: Suica, 도쿄 서브웨이 티켓 48h(1/9 14시~1/11 14시), 오다큐 에노시마·가마쿠라 프리패스(1/11), 오사카 엔조이 에코카드(1/12).\n` : `[여행] ${UT ? `${UT.title || '일본 여행'} ${TRIP_START}~${TRIP_END}` : '아직 여행 일정을 만들지 않음'}\n`;
    if (stay) ctx += `[오늘 숙소] ${stay.name} ${stay.addr} ${stay.tel}\n`;
    if (meMarker) { const ll = meMarker.getLatLng(); ctx += `[내 위치] 위도 ${ll.lat.toFixed(4)}, 경도 ${ll.lng.toFixed(4)}\n`; }
    if (cur) ctx += `[지금 단계] ${line(cur)}\n`;
    if (next) ctx += `[다음 단계] ${line(next)}\n`;
    ctx += `[내 일정 ${day}]\n${todays}\n`;
    const dd = dayOf(day);
    if (dd && hasEdits(dd)) ctx += `[사용자가 직접 고친 이날 동선 (위 일정보다 이것을 우선)]\n${dd.vis.map((i) => { const s = dd.stops[i]; return `${s[0]} ${s[1]}${s[2] ? ' - ' + s[2] : ''}${todoList(dd, s).length ? ' | 할 일: ' + todoList(dd, s).join(' / ') : ''}`; }).join('\n')}\n`;
    if (cards.length) ctx += `[관련 상황 카드]\n` + cards.map((c) => `# ${c.title}\n${c.sum}\n${c.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}${c.tips.length ? '\n팁: ' + c.tips.join(' ') : ''}`).join('\n\n');
    return ctx;
  }
  function fmt(text) {
    let h = badges(esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'), isOsaka(dayOf(nowJST().d) || dayOf(S.day)));
    h = h.replace(/📋\s*직원에게 보여주기:?\s*\n?\s*(.+)/, (m, ja) => `<button class="tag" data-ja="${ja.replace(/"/g, '&quot;')}" style="font-size:16px">${I('clip')} 직원에게 보여주기<br><span style="font-size:19px">${ja}</span></button>`);
    return h;
  }
  // 도코데 역무원: 모자 쓴 작은 안내원 (자체 그림)
  const MASCOT = `<svg class="mascot" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="42" r="22" fill="#FFE2C6"/><path d="M14 30c2-11 12-17 22-17s20 6 22 17z" fill="#191F28"/><rect x="12" y="28" width="48" height="7" rx="3.5" fill="#0F7A68"/><path d="M10 35h52" stroke="#191F28" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="21" r="4" fill="#FFC83D"/><circle cx="28" cy="44" r="2.6" fill="#191F28"/><circle cx="44" cy="44" r="2.6" fill="#191F28"/><path d="M30 52c3.5 3 8.5 3 12 0" stroke="#191F28" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="22" cy="50" r="3" fill="#FFB4A2" opacity=".7"/><circle cx="50" cy="50" r="3" fill="#FFB4A2" opacity=".7"/></svg>`;
  function renderAsk() {
    const msgs = S.chat.map((m, i) => `<div class="msg ${m.role === 'user' ? 'u' : 'a'}">${m.img ? `<img src="${m.img}" alt="">` : ''}${m.role === 'user' ? esc(m.content) : fmt(m.content)}${m.cards && m.cards.length ? (m.err && CARD[m.cards[0]] ? `<div style="margin-top:8px"><b>${esc(CARD[m.cards[0]].title)}</b>${cardBody(CARD[m.cards[0]])}${cardTags(m.cards.slice(1).map((id) => CARD[id]).filter(Boolean))}</div>` : `<div>${cardTags(m.cards.map((id) => CARD[id]).filter(Boolean))}</div>`) : ''}${m.role === 'assistant' && i === S.chat.length - 1 && !m.err ? `<div style="margin-top:8px"><button class="tag" data-human="1">AI 답으로 해결 안 됐어요</button></div>` : ''}</div>`).join('');
    view.innerHTML = `${S.chat.length ? '' : `<div class="card">${MASCOT}<div class="big">막히면 물어보세요</div>
        <div class="muted">내 일정과 지금 시각을 알고 답해요. 안내판·메뉴 사진도 보낼 수 있어요.</div>
        <div style="margin-top:8px">${['신주쿠역에서 오다큐선 어디로 가?', '식권기 버튼이 다 일본어야', '신사에서 사진 찍어도 돼?', '심야버스 승차장을 못 찾겠어'].map((q) => `<button class="tag" data-sample="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>`}
      <div class="chat" id="chat">${msgs}${S.busy ? '<div class="typing">답을 찾는 중…</div>' : ''}</div>
      ${S.chat.length ? '<div style="text-align:center;margin-top:14px"><button class="tag" id="clearChat">대화 지우기</button></div>' : ''}
      ${S.pendingImg ? `<div class="card row"><img src="${S.pendingImg.url}" style="width:64px;border-radius:8px"><span class="muted">사진이 첨부됐어요</span><button class="tag" id="dropImg">빼기</button></div>` : ''}`;
    view.scrollTop = view.scrollHeight;
  }
  async function send(q) {
    q = (q || '').trim();
    if (S.busy) return;
    if (!q && !S.pendingImg) return;
    const photoOnly = !q;
    if (!q) q = '이 사진에서 뭘 해야 하는지 알려줘';
    const img = S.pendingImg;
    S.pendingImg = null;
    S.chat.push({ role: 'user', content: q, img: img ? img.url : null });
    const matched = photoOnly ? [] : searchCards(q, 3).map((c) => c.id);
    S.busy = true; render(); busyUI();
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 45000);
    try {
      const r = await fetch('/api/chat', {
        signal: ac.signal,
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-access-code': store.get('code', '') },
        body: JSON.stringify({
          mode: 'chat',
          context: buildContext(q),
          messages: S.chat.filter((m) => !m.err).map((m) => ({ role: m.role, content: m.content })),
          image: img ? { media_type: 'image/jpeg', data: img.b64 } : null
        })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(data.message || '오류'), { code: data.error });
      S.chat.push({ role: 'assistant', content: data.text || '(빈 답변)', cards: matched });
    } catch (e) {
      const offline = !navigator.onLine;
      const msg = offline ? '지금 인터넷이 안 돼요. 상황 카드는 오프라인에서도 열려요.'
        : e.name === 'AbortError' ? '답이 너무 오래 걸려서 멈췄어요. 잠시 후 다시 보내 주세요.'
        : e.code === 'no_key' ? 'AI 연결은 아직 준비 중이에요.'
        : e.code === 'need_code' ? '설정(일정 탭 맨 아래)에 AI 접근 코드를 넣어 주세요.'
        : e.code === 'need_login' ? '로그인이 풀렸어요. 새로고침해서 다시 로그인해 주세요.'
        : (e.message && e.message !== '오류' ? e.message : '답을 받지 못했어요. 잠시 후 다시 보내 주세요.');
      S.chat.push({ role: 'assistant', content: msg + (matched.length ? ' 아래에 가장 가까운 상황 카드를 펼쳐 둘게요.' : '\n관련 카드를 못 찾았어요. 상황카드 탭에서 검색해 보세요.'), cards: matched, err: true });
    } finally { clearTimeout(to); }
    S.chat = S.chat.slice(-30);
    store.set('chat', S.chat.map((m) => ({ ...m, img: null })));
    S.busy = false; render(); busyUI();
  }
  // 답을 기다리는 동안 보내기 버튼을 잠가요
  function busyUI() { const b = $('#send'); if (b) { b.disabled = !!S.busy; b.textContent = S.busy ? '기다리는 중' : '보내기'; } }
  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const im = new Image();
        im.onload = () => {
          const max = 1280, k = Math.min(1, max / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          const url = c.toDataURL('image/jpeg', 0.8);
          resolve({ url, b64: url.split(',')[1] });
        };
        im.onerror = reject; im.src = fr.result;
      };
      fr.onerror = reject; fr.readAsDataURL(file);
    });
  }

  // ---------- 보여주기 ----------
  function renderPhrases() {
    const mine = store.get('myPhrases', []);
    view.innerHTML = `${seg2('phrases')}<div class="card"><div class="k">하고 싶은 말을 일본어 카드로</div>
        <textarea id="pq" rows="2" placeholder="예: 체크아웃 후 오후 1시까지 짐을 맡기고 싶어요" style="margin-top:6px"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn" id="pgo">일본어로 만들기</button><span class="muted" id="pmsg"></span></div>
        ${mine.length ? `<div class="k" style="margin-top:12px">내가 만든 문장</div>${jaList(mine)}` : ''}
      </div>
      ${window.PHRASES.map((g) => `<div class="card"><div class="k">${esc(g.g)}</div>${jaList(g.items)}</div>`).join('')}
      <div class="muted" style="text-align:center">문장을 누르면 화면 가득 크게 보여요. 직원에게 그대로 보여주세요.</div>`;
  }
  async function makePhrase() {
    const q = $('#pq').value.trim();
    if (!q) return;
    $('#pgo').disabled = true; $('#pmsg').textContent = '만드는 중…';
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-access-code': store.get('code', '') }, body: JSON.stringify({ mode: 'phrase', messages: [{ role: 'user', content: q }] }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error === 'no_key' ? 'AI 연결 준비 중이라 아직 만들 수 없어요. 아래 준비된 문장을 써 주세요.' : (data.message || '실패'));
      const m = (data.text || '').match(/\{[\s\S]*\}/);
      const p = m ? JSON.parse(m[0]) : { ja: data.text, ko: q };
      const mine = store.get('myPhrases', []);
      mine.unshift({ ja: p.ja, ko: (p.ko || q) + (p.read ? ` (${p.read})` : '') });
      store.set('myPhrases', mine.slice(0, 20));
      renderPhrases();
      showBig(p.ja, p.ko || q);
    } catch (e) {
      $('#pgo').disabled = false; $('#pmsg').textContent = e.message;
    }
  }

  // ---------- 긴급 ----------
  function renderSos() {
    const n = nowJST();
    const d = inTrip(n) ? n.d : TRIP_START;
    const stay = stayOn(d);
    const unsolved = store.get('unsolved', []);
    view.innerHTML = `<div class="card sosbar"><b>위급하면 바로 전화하세요.</b> 일본은 경찰 110, 구급·소방 119예요.</div>
      ${window.EMERGENCY.map((e) => `<div class="card"><a class="tel" href="tel:${e.num.replace(/[^+\d]/g, '')}"><div><b>${esc(e.name)}</b><div class="muted">${esc(e.note)}${e.check ? ' <span class="chk">출발 전 번호 확인</span>' : ''}</div></div><span class="n">${esc(e.num)}</span></a></div>`).join('')}
      ${stay ? `<div class="card"><div class="k">오늘 숙소</div><b>${esc(stay.name)}</b>
        <div class="row" style="justify-content:space-between;margin-top:4px"><span class="ja" style="font-size:16px">${esc(stay.addr)}</span>${stay.addr && /[都府区]/.test(stay.addr) ? `<button class="tag" data-ja="${esc(stay.addr)}" data-ko="이 주소로 가 주세요 (この住所までお願いします)">택시에 보여주기</button>` : ''}</div>
        ${stay.tel ? `<a class="tag" href="tel:${stay.tel.replace(/[^+\d]/g, '')}">${I('phone')} ${esc(stay.tel)}</a>` : ''}${stay.note ? `<div class="muted">${esc(stay.note)}</div>` : ''}</div>` : ''}
      <div class="k" style="margin-top:14px">이럴 땐 이렇게</div>
      ${['lostthing', 'passport', 'sick', 'quake'].map((id) => `<button class="card" data-card="${id}" style="width:100%;text-align:left"><b>${esc(CARD[id].title)}</b><div class="muted">${esc(CARD[id].sum)}</div></button>`).join('')}
      ${unsolved.length ? `<div class="card"><div class="k">AI로 해결 못 한 질문 (${unsolved.length})</div>${unsolved.slice(-5).reverse().map((u) => `<div class="muted" style="margin-top:6px">• ${esc(u.q)}</div>`).join('')}<div class="muted" style="margin-top:6px">현지인·전문가 연결은 준비 중이에요. 이 목록은 이 휴대폰에만 저장돼요.</div></div>` : ''}`;
  }

  // ---------- 여행 전 준비할 것 ----------
  // 일정과 같은 곳(EDITS._prep)에 저장해서 같이 편집하는 사람과 함께 체크해요
  // EDITS._prep = [{ id, g: 묶음, t: 할 일, due: 언제까지(선택), done: true/false }]
  const PREP_DEFAULT = [
    ['출발 전 등록', 'Visit Japan Web 등록 (입국·세관 QR)'], ['출발 전 등록', 'Suica: 아이폰 지갑에 추가 또는 공항에서 웰컴 Suica'],
    ['출발 전 등록', 'eSIM·포켓와이파이'], ['출발 전 등록', '여행자 보험'], ['출발 전 등록', '환전·트래블카드 충전'],
    ['챙길 것', '여권 (유효기간 확인)'], ['챙길 것', '110V 어댑터 (11자 돼지코)'], ['챙길 것', '보조배터리 (기내 반입)']
  ];
  function prepList() {
    if (!Array.isArray(EDITS._prep)) EDITS._prep = PREP_DEFAULT.map(([g, t], i) => ({ id: 'd' + i, g, t, done: false }));
    return EDITS._prep;
  }
  function prepHTML() {
    const L = prepList(), ro = VIEW, done = L.filter((x) => x.done).length, groups = [];
    L.forEach((x) => { if (!groups.includes(x.g || '기타')) groups.push(x.g || '기타'); });
    return `<div class="card"><div class="k">${I('check')} 여행 전 준비할 것</div>
        <div class="big" style="margin-bottom:2px">${done} / ${L.length} 완료</div>
        <div class="prepbar"><i style="width:${L.length ? Math.round(done / L.length * 100) : 0}%"></i></div>
        <div class="muted">${ro ? '여행 준비 목록이에요. 보기 전용 링크라 체크하거나 고칠 수는 없어요.' : '예약·결제·등록할 것을 모아 두는 곳이에요. 항목을 누르면 고칠 수 있고, 같이 편집하는 사람과 함께 체크돼요.'}</div>
        ${CL && !VIEW ? '<button class="linkbtn" data-goacct="1" style="margin-top:6px">다른 여행 보기·새 여행 만들기</button>' : ''}</div>
      ${groups.map((g) => `<div class="k" style="margin-top:14px">${esc(g)}</div><div class="card preplist">${L.filter((x) => (x.g || '기타') === g).map((x) => `<div class="prep${x.done ? ' done' : ''}">
          <button class="pchk" data-prep="${esc(x.id)}" role="checkbox" aria-checked="${!!x.done}" aria-label="${esc(x.t)} 완료" ${ro ? 'disabled' : ''}>${x.done ? I('check') : ''}</button>
          ${S.prepEdit === x.id ? `<div class="pt pedit">
            <input type="text" id="peT" maxlength="80" value="${esc(x.t)}" placeholder="할 일" aria-label="할 일">
            <input type="text" id="peD" maxlength="40" value="${esc(x.due || '')}" placeholder="언제·메모 (선택)" aria-label="언제·메모">
            <select id="peG" aria-label="묶음">${groups.concat(groups.includes('내가 추가한 것') ? [] : ['내가 추가한 것']).map((o) => `<option${o === (x.g || '기타') ? ' selected' : ''}>${esc(o)}</option>`).join('')}<option value="__new">＋ 새 묶음…</option></select>
            <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm" id="peSave">저장</button><button class="btn ghost sm" id="peCancel">취소</button><button class="btn danger sm" data-preprm="${esc(x.id)}">지우기</button></div></div>`
          : `<button class="pt" ${ro ? 'tabindex="-1" aria-disabled="true"' : `data-prepedit="${esc(x.id)}"`}><span>${esc(x.t)}</span>${x.due ? `<div class="muted">${esc(x.due)}</div>` : ''}</button>
          ${ro ? '' : `<button class="x pe" data-prepedit="${esc(x.id)}" aria-label="고치기">${I('edit')}</button>`}`}</div>`).join('')}</div>`).join('')}
      ${ro ? '' : `<div class="card"><div class="k">준비할 것 추가</div>
        <input type="text" id="prepT" maxlength="80" placeholder="예: 시부야 스카이 예약" aria-label="준비할 것" enterkeyhint="done">
        <div class="row" style="margin-top:8px"><input type="text" id="prepD" maxlength="40" placeholder="언제·메모 (선택)" aria-label="언제·메모" enterkeyhint="done" style="flex:1;width:auto;min-width:0"><button class="btn sm" id="prepAdd">추가</button></div></div>`}`;
  }
  function prepClick(t, d) {
    if (d.prep) { const x = prepList().find((y) => y.id === d.prep); if (x) { x.done = !x.done; store.set('edits', EDITS); renderPlan(); } return true; }
    if (d.prepedit) { S.prepEdit = d.prepedit; renderPlan(); const el = $('#peT'); if (el) el.focus(); return true; }
    if (t.id === 'peCancel') { S.prepEdit = null; renderPlan(); return true; }
    if (t.id === 'peSave') {
      const x = prepList().find((y) => y.id === S.prepEdit), v = ($('#peT').value || '').trim();
      if (!v) { toast('할 일을 적어 주세요.'); return true; }
      if (x) {
        let g = $('#peG').value || x.g;
        if (g === '__new') { g = (prompt('새 묶음 이름을 적어 주세요.', '') || '').trim().slice(0, 20); if (!g) return true; }
        x.t = v.slice(0, 80); x.due = ($('#peD').value || '').trim().slice(0, 40);
        // 묶음을 바꾸면 그 묶음의 맨 아래로 옮겨요
        if (g !== (x.g || '기타')) { x.g = g; EDITS._prep = prepList().filter((y) => y !== x).concat(x); }
        store.set('edits', EDITS);
      }
      S.prepEdit = null; renderPlan(); return true;
    }
    if (d.preprm) { S.prepEdit = null; if (!confirm('이 항목을 지울까요?')) return true; EDITS._prep = prepList().filter((y) => y.id !== d.preprm); store.set('edits', EDITS); renderPlan(); return true; }
    if (t.id === 'prepAdd') {
      const v = ($('#prepT').value || '').trim(); if (!v) return true;
      const L = prepList(); if (L.length >= 80) { toast('80개까지 넣을 수 있어요.'); return true; }
      L.push({ id: Date.now().toString(36), g: '내가 추가한 것', t: v.slice(0, 80), due: ($('#prepD').value || '').trim().slice(0, 40), done: false });
      store.set('edits', EDITS); renderPlan(); const el = $('#prepT'); if (el) el.focus(); return true;
    }
    return false;
  }

  // ---------- 경비 정산 ----------
  // 일정과 같은 곳(EDITS._pay)에 저장해서, 같이 편집하는 사람에게도 바로 보여요
  // EDITS._pay = { ppl: [이름], fx: 직접 넣은 환율(1엔=원), items: [{ id, d, n, a, c: 'JPY'|'KRW', by, for: [이름] }] }
  const PAY = () => { const p = EDITS._pay = EDITS._pay || {}; p.ppl = p.ppl || []; p.items = p.items || []; return p; };
  const won = (v) => '₩' + Math.round(v).toLocaleString('ko-KR');
  const yen = (v) => '¥' + Math.round(v).toLocaleString('ko-KR');
  const nm = (s) => String(s || '').trim().slice(0, 12);
  // 같이 간 사람 = 직접 넣은 이름 + 함께 편집하는 사람 (뺀 사람은 빼고)
  function payPeople() {
    const p = PAY(), gone = p.gone || [];
    const al = p.alias || {}, m = CL && CL.trip && CL.trip.members ? Object.entries(CL.trip.members).map(([u, x]) => nm(al[u] || x.name)).filter(Boolean) : [];
    const out = p.ppl.length ? p.ppl.slice() : m.length ? [] : [nm(USER && USER.name) || '나'];
    m.forEach((x) => { if (!out.includes(x) && !gone.includes(x)) out.push(x); });
    return [...new Set(out)];
  }
  // 금액 읽기: 전각 숫자·천 단위 쉼표·통화 기호를 받아요. 못 읽으면 NaN
  const zen = (v) => String(v || '').replace(/[０-９．，]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  function parseAmt(v) {
    let t = zen(v).trim().replace(/\s/g, '').replace(/^[¥₩]|(원|엔|円|krw|jpy|yen)$/i, '');
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
    return /^\d+(\.\d{1,2})?$/.test(t) ? parseFloat(t) : NaN;
  }
  const amtCur = (v) => { const t = zen(v).toLowerCase(); return /원|₩|krw/.test(t) ? 'KRW' : /엔|円|¥|jpy|yen/.test(t) ? 'JPY' : null; };
  const payDraft = (f) => { try { f ? sessionStorage.setItem('dk.payF', JSON.stringify(f)) : sessionStorage.removeItem('dk.payF'); } catch (e) {} };
  // 계정 이름 대신 고친 이름을 써요 (EDITS._pay.alias[uid] = 이름)
  function myPayName() {
    const p = PAY(), uid = CL && CL.user && CL.user.uid;
    return nm(uid && (p.alias || {})[uid]) || nm(CL && CL.trip && CL.trip.members && uid && (CL.trip.members[uid] || {}).name) || nm(USER && USER.name);
  }
  function fxRate() { const p = PAY(); return p.fx || (store.get('fx', null) || {}).r || 9.2; }
  function fetchFx() {
    const c = store.get('fx', null);
    if ((c && Date.now() - c.t < 6 * 3600e3) || !navigator.onLine || S.fxBusy) return;
    S.fxBusy = true;
    fetch('https://open.er-api.com/v6/latest/JPY').then((r) => r.json()).then((j) => {
      const r = j && j.rates && j.rates.KRW;
      if (r > 1 && r < 30) { store.set('fx', { r, t: Date.now() }); if (S.tab === 'pay') renderPay(); }
    }).catch(() => {}).finally(() => { S.fxBusy = false; });
  }
  function settle() {
    const p = PAY(), fx = fxRate(), paid = {}, share = {}; let total = 0;
    p.items.forEach((it) => {
      const krw = it.c === 'KRW' ? it.a : it.a * fx, f = it.for && it.for.length ? it.for : payPeople();
      total += krw; paid[it.by] = (paid[it.by] || 0) + krw;
      f.forEach((x) => { share[x] = (share[x] || 0) + krw / f.length; });
    });
    const pos = [], neg = [];
    new Set([...Object.keys(paid), ...Object.keys(share)]).forEach((k) => { const v = (paid[k] || 0) - (share[k] || 0); if (v > 0.5) pos.push([k, v]); else if (v < -0.5) neg.push([k, -v]); });
    pos.sort((a, b) => b[1] - a[1]); neg.sort((a, b) => b[1] - a[1]);
    const tx = []; let i = 0, j = 0;
    while (i < neg.length && j < pos.length) {
      const m = Math.min(neg[i][1], pos[j][1]); tx.push([neg[i][0], pos[j][0], m]);
      neg[i][1] -= m; pos[j][1] -= m; if (neg[i][1] < 0.5) i++; if (pos[j][1] < 0.5) j++;
    }
    return { total, paid, share, tx };
  }
  function savePay() { store.set('edits', EDITS); offlineSoon(); }
  function renderPay() {
    if (!UT) { view.innerHTML = `<div class="card"><b>여행을 먼저 만들어 주세요.</b><div class="muted">일정 탭에서 여행을 만들면 같이 간 사람들과 경비를 나눌 수 있어요.</div></div>`; return; }
    if (VIEW) { view.innerHTML = `<div class="card"><b>경비는 함께 편집하는 사람만 볼 수 있어요.</b><div class="muted">보기 전용 링크로 연 여행이에요.</div></div>`; return; }
    fetchFx();
    const p = PAY(), ppl = payPeople(), fx = fxRate(), r = settle(), ro = VIEW;
    let f0 = null; if (!S.payF) { try { f0 = JSON.parse(sessionStorage.getItem('dk.payF') || 'null'); } catch (e) {} }
    const f = S.payF = S.payF || f0 || { c: 'JPY', n: '', a: '' };
    const nn0 = nowJST(), days = R.DAYS.map((x) => x.date);
    if (!f.d || !days.includes(f.d)) f.d = inTrip(nn0) ? nn0.d : (S.day && S.day !== 'prep' ? S.day : days[0]);
    if (!ppl.includes(f.by)) { const me = myPayName(); f.by = ppl.includes(me) ? me : ppl[0]; }
    if (f.for) f.for = f.for.filter((x) => ppl.includes(x));
    const forSel = f.for && f.for.length ? f.for : ppl;
    const byDay = {}; p.items.forEach((it) => (byDay[it.d] = byDay[it.d] || []).push(it));
    const used = (x) => p.items.some((it) => it.by === x || (it.for || []).includes(x));
    view.innerHTML = `<div class="card paysum"><div class="k">${I('coin')} 이 여행 경비</div><div class="big">${won(r.total)}</div>
        <div class="muted">${yen(r.total / fx)} · ${ppl.length}명 · 평균 1인 ${won(r.total / Math.max(1, ppl.length))}</div>
        <div class="muted">1엔 = ${fx.toFixed(2)}원${p.fx ? ' (직접 넣은 환율)' : ''}${ro ? '' : ' <button class="linkbtn" id="fxEdit">환율 고치기</button>'}</div></div>
      <div class="card"><div class="k">정산</div>${r.tx.length ? r.tx.map(([a, b, v]) => `<div class="payrow"><span><b>${esc(a)}</b> → <b>${esc(b)}</b></span><b>${won(v)}</b></div>`).join('')
        : `<div class="muted" style="margin-top:4px">${p.items.length ? '모두 똑같이 냈어요. 보낼 돈이 없어요.' : '경비를 넣으면 누가 누구에게 얼마를 보내면 되는지 알려줘요.'}</div>`}
        ${p.items.length && ppl.length > 1 ? `<div class="paypp">${ppl.map((x) => `<span><b>${esc(x)}</b> 낸 돈 ${won(r.paid[x] || 0)} · 쓴 몫 ${won(r.share[x] || 0)}</span>`).join('')}</div>` : ''}</div>
      ${ro ? '' : `<div class="card payadd" id="payForm"><div class="k">${f.editId ? '경비 고치기' : '경비 넣기'}</div>
        <input type="text" id="payN" maxlength="40" placeholder="어디에 썼나요? 예: 라멘, 스이카 충전" value="${esc(f.n)}" aria-label="쓴 곳">
        <select id="payD" aria-label="쓴 날짜" style="margin-top:8px">${days.map((x) => `<option value="${x}"${x === f.d ? ' selected' : ''}>${md(x)} (${wd(x)})</option>`).join('')}</select>
        <div class="payamt"><input type="text" inputmode="decimal" id="payA" placeholder="금액" aria-label="금액" value="${esc(f.a)}"><div class="seg"><button data-payc="JPY" class="${f.c === 'JPY' ? 'on' : ''}">엔</button><button data-payc="KRW" class="${f.c === 'KRW' ? 'on' : ''}">원</button></div></div>
        <div class="k">낸 사람</div><div class="chips">${ppl.map((x) => `<button class="chip${x === f.by ? ' on' : ''}" data-payby="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="k">같이 쓴 사람 (나눠 낼 사람)</div><div class="chips">${ppl.map((x) => `<button class="chip${forSel.includes(x) ? ' on' : ''}" data-payfor="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <p class="paymsg" id="payMsg"></p>
        <div class="row"><button class="btn" id="payAdd" style="flex:1">${f.editId ? '고친 내용 저장' : '넣기'}</button>${f.editId ? '<button class="btn ghost" id="payEditX">취소</button>' : ''}</div></div>
      <div class="card"><div class="k">같이 간 사람</div><div class="muted">이름을 누르면 바꿀 수 있어요.</div><div class="chips">${ppl.map((x) => `<span class="chip"><button class="linkname" data-payren="${esc(x)}">${esc(x)} ${I('edit')}</button>${ppl.length > 1 && !used(x) ? ` <button class="x" data-paydel="${esc(x)}" aria-label="${esc(x)} 빼기">${I('x')}</button>` : ''}</span>`).join('')}</div>
        <div class="row"><input type="text" id="payP" maxlength="12" placeholder="이름" style="flex:1;width:auto;min-width:0"><button class="btn ghost sm" id="payPAdd">사람 추가</button></div></div>`}
      ${Object.keys(byDay).sort().reverse().map((dd) => `<div class="k" style="margin-top:14px">${md(dd)} (${wd(dd)})</div>` + byDay[dd].slice().reverse().map((it) => {
        const fl = it.for && it.for.length ? it.for : ppl;
        return `<div class="card payitem${f.editId === it.id ? ' on' : ''}"><${ro ? 'div' : `button type="button" data-payedit="${esc(it.id)}" aria-label="${esc(it.n)} 고치기"`} class="pn"><b>${esc(it.n)}</b><div class="muted">${esc(it.by)} 냄 · ${fl.length === ppl.length && ppl.every((x) => fl.includes(x)) ? '모두' : fl.map(esc).join(', ')}</div></${ro ? 'div' : 'button'}>
          <div class="amt">${it.c === 'KRW' ? won(it.a) : yen(it.a)}${it.c === 'JPY' ? `<div class="muted">${won(it.a * fx)}</div>` : ''}</div>${ro ? '' : `<button class="x" data-payrm="${esc(it.id)}" aria-label="지우기">${I('x')}</button>`}</div>`;
      }).join('')).join('')}`;
  }
  function payClick(t, d) {
    const f = S.payF;
    if (d.payc) { f.c = d.payc; return renderPay(), true; }
    if (d.payby != null) { f.by = d.payby; return renderPay(), true; }
    if (d.payfor != null) {
      const cur = (f.for && f.for.length ? f.for : payPeople()).slice(), i = cur.indexOf(d.payfor);
      if (i >= 0) { if (cur.length > 1) cur.splice(i, 1); } else cur.push(d.payfor);
      f.for = cur; return renderPay(), true;
    }
    if (t.id === 'payAdd') {
      const a = parseAmt(f.a), n = (f.n || '').trim(), msg = $('#payMsg');
      if (!n) { msg.textContent = '어디에 썼는지 적어 주세요.'; return true; }
      if (a > 1e9) { msg.textContent = '10억보다 큰 금액은 넣을 수 없어요.'; return true; }
      if (!(a > 0)) { msg.textContent = '금액을 숫자로 넣어 주세요. 예: 1200 또는 1,200'; return true; }
      const p = PAY(); p.ppl = payPeople().slice();
      const it = { id: f.editId || Date.now().toString(36) + Math.random().toString(36).slice(2, 5), d: f.d || TRIP_START, n: n.slice(0, 40), a: Math.round(a * 100) / 100, c: f.c, by: f.by, for: (f.for && f.for.length ? f.for : p.ppl).slice() };
      const ix = f.editId ? p.items.findIndex((x) => x.id === f.editId) : -1;
      if (ix >= 0) p.items[ix] = it; else p.items.push(it);
      const was = !!f.editId;
      S.payF = { c: f.c, n: '', a: '', by: f.by, d: f.d }; payDraft(null); savePay(); toast(was ? '고쳤어요.' : '넣었어요.'); renderPay(); return true;
    }
    if (d.payedit) {
      const it = PAY().items.find((x) => x.id === d.payedit); if (!it) return true;
      S.payF = { editId: it.id, n: it.n, a: String(it.a), c: it.c, by: it.by, for: (it.for || []).slice(), d: it.d };
      renderPay(); const el = $('#payForm'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); return true;
    }
    if (t.id === 'payEditX') { S.payF = null; payDraft(null); renderPay(); return true; }
    if (d.payrm) { if (!confirm('이 경비를 지울까요?')) return true; const p = PAY(); p.items = p.items.filter((x) => x.id !== d.payrm); savePay(); renderPay(); return true; }
    if (t.id === 'payPAdd') {
      const v = nm(($('#payP') || {}).value); if (!v) { toast('추가할 사람의 이름을 적어 주세요.'); const el = $('#payP'); if (el) el.focus(); return true; }
      const p = PAY(); p.ppl = payPeople().slice(); p.gone = (p.gone || []).filter((x) => x !== v);
      if (p.ppl.includes(v)) { toast('이미 있는 이름이에요.'); return true; }
      if (p.ppl.length >= 20) { toast('20명까지 넣을 수 있어요.'); return true; }
      p.ppl.push(v); if (f.for) f.for.push(v); savePay(); renderPay(); return true;
    }
    if (d.payren) {
      const old = d.payren, v = nm(prompt('이 사람을 뭐라고 부를까요?', old));
      if (!v || v === old) return true;
      const p = PAY(); p.ppl = payPeople().slice();
      if (p.ppl.includes(v)) { toast('이미 있는 이름이에요.'); return true; }
      const sw = (x) => (x === old ? v : x);
      p.ppl = p.ppl.map(sw);
      p.items.forEach((it) => { it.by = sw(it.by); if (it.for) it.for = it.for.map(sw); });
      // 같이 편집하는 사람의 계정 이름을 바꾼 거면 기억해 둬요
      const ms = (CL && CL.trip && CL.trip.members) || {}, al = p.alias = p.alias || {};
      Object.entries(ms).forEach(([u, x]) => { if (nm(al[u] || x.name) === old) al[u] = v; });
      if (f.by === old) f.by = v; if (f.for) f.for = f.for.map(sw);
      savePay(); renderPay(); return true;
    }
    if (d.paydel) { const p = PAY(); p.ppl = payPeople().filter((x) => x !== d.paydel); p.gone = [...new Set((p.gone || []).concat(d.paydel))]; savePay(); renderPay(); return true; }
    if (t.id === 'fxEdit') {
      const v = prompt('1엔은 몇 원인가요? 비워 두면 자동 환율을 써요.', fxRate().toFixed(2)); if (v == null) return true;
      const n = parseFloat(zen(v).replace(',', '.')), p = PAY();
      if (!v.trim()) delete p.fx; else if (n > 1 && n < 30) p.fx = n; else { toast('숫자를 확인해 주세요. 예: 9.3'); return true; }
      savePay(); renderPay(); return true;
    }
    return false;
  }

  // ---------- 오프라인 저장 ----------
  // 여행 장소 주변 지도와 앱 파일을 틈틈이 브라우저에 받아 둬요. 인터넷이 끊겨도 일정과 지도가 보여요.
  // (일정·경비는 고칠 때마다 이 기기에 바로 저장되고, 로그인했으면 서버에도 저장돼요)
  const tx2 = (lng, z) => Math.floor((lng + 180) / 360 * 2 ** z);
  const ty2 = (lat, z) => { const r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z); };
  let offT = null, offBusy = false;
  function offlineSoon(ms) { clearTimeout(offT); offT = setTimeout(saveOffline, ms == null ? 5000 : ms); }
  async function saveOffline() {
    if (offBusy || !navigator.onLine || !('caches' in window) || !UT) return;
    if (navigator.connection && navigator.connection.saveData) return;
    const pts = [];
    R.DAYS.forEach((d) => (d.vis || []).forEach((i) => { const s = d.stops[i]; if (s && s[3] != null) pts.push([s[3], s[4]]); }));
    if (!pts.length) return;
    // MapTiler 512px 타일: z9~12는 도시 전체, z13~15는 장소 주변 (약 300m)만
    const urls = new Set(), add = (z, la, ln) => urls.add(`https://api.maptiler.com/maps/streets-v2/${z}/${tx2(ln, z)}/${ty2(la, z)}.png?key=${MT_KEY}`);
    pts.forEach(([la, ln]) => {
      for (let z = 9; z <= 12; z++) add(z, la, ln);
      for (let z = 13; z <= 15; z++) [[0, 0], [0.003, 0.0035], [0.003, -0.0035], [-0.003, 0.0035], [-0.003, -0.0035]].forEach(([a, b]) => add(z, la + a, ln + b));
    });
    const list = [...urls].slice(0, 900);
    offBusy = true; let got = 0, have = 0;
    try {
      const c = await caches.open('th-tiles');
      for (let k = 0; k < list.length; k += 4) {
        if (!navigator.onLine) break;
        await Promise.all(list.slice(k, k + 4).map(async (u) => {
          if (await c.match(u)) { have++; return; }
          try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) { await c.put(u, r); got++; } } catch (e) {}
        }));
        if (got) await new Promise((ok) => setTimeout(ok, 120));
      }
      store.set('offl', { t: Date.now(), n: got + have, total: list.length });
    } catch (e) {} finally { offBusy = false; }
    const el = $('#offInfo'); if (el) el.innerHTML = offInfo();
  }
  function offInfo() {
    const o = store.get('offl', null);
    if (!UT) return '';
    if (!o) return navigator.onLine ? '여행 지도를 이 기기에 받아 두는 중이에요…' : '인터넷이 연결되면 여행 지도를 이 기기에 받아 둘게요. 일정과 경비는 이미 저장돼 있어요.';
    const m = Math.round((Date.now() - o.t) / 60000);
    return `일정·경비와 장소 주변 지도(${o.n}/${o.total}칸)를 이 기기에 받아 뒀어요${navigator.onLine ? '' : '. 지금은 오프라인이라 받아 둔 것으로 보여요'} · ${m < 1 ? '방금' : m < 60 ? m + '분 전' : Math.round(m / 60) + '시간 전'}`;
  }

  // ---------- 라우팅 ----------
  // 다른 여행으로 바꾸기 (새로고침 없이)
  function reopenTrip() {
    loadTrip();
    VIEW = window.DK_AUTH === 'view' || !!(CL && CL.readonly);
    const n = nowJST();
    S.day = inTrip(n) ? n.d : TRIP_START; S.sel = null; S.open = null; S.xp = new Set(); S.imp = null; S.editMode = false;
    closeEditor(); drawnDay = null;
    S.tab = 'plan'; history.replaceState(history.state, '', '#plan');
    setSheet(isDesk() ? 'full' : R.DAYS.length ? 'peek' : 'full');
    render(); view.scrollTop = 0; S.payF = null; offlineSoon();
  }
  async function openTrip(id) {
    try { sessionStorage.removeItem('dk.newTrip'); } catch (e) {}
    const o = await CL.open(id);
    if (!o) throw new Error('not-found');
    try { localStorage.setItem(NS + 'trip', JSON.stringify(o.trip)); localStorage.setItem(NS + 'edits', JSON.stringify(o.edits)); } catch (e) {}
    reopenTrip();
  }
  function render() {
    const navTab = S.tab === 'phrases' ? 'cards' : S.tab;
    document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === navTab));
    $('#composer').classList.toggle('hide', S.tab !== 'ask');
    const d = dayOf(S.day);
    if (d && drawnDay !== d.id) drawDay(d);
    if (!d && drawnDay !== 'none') { drawnDay = 'none'; layer.clearLayers(); pickLayer.clearLayers(); markers = {}; fitPts = []; }
    renderDays();
    ({ plan: renderPlan, cards: renderCards, ask: renderAsk, phrases: renderPhrases, pay: renderPay, sos: renderSos }[S.tab] || renderPlan)();
    clock();
  }
  function go(tab) {
    const same = tab === S.tab;
    if (!same && S.edit && !okToLeave()) return;
    if (!same && S.edit) { closeEditor(); backPop('edit'); }
    S.tab = tab; history.replaceState(history.state, '', '#' + tab); render(); saveUI();
    if (tab !== 'ask') view.scrollTop = 0;
    if (!isDesk()) {
      if (same && S.sheet !== 'peek') setSheet('peek');
      else if (tab === 'ask') setSheet('full');
      else if (S.sheet === 'peek') setSheet('half');
    }
  }
  function setDay(date, fit) {
    if (S.edit && !okToLeave()) return;
    if (S.edit) backPop('edit');
    S.day = date; S.sel = null; S.xp = new Set(); drawnDay = null; closeEditor(); render(); view.scrollTop = 0;
    if (date === 'prep' && !isDesk()) setSheet('full');
    saveUI();
  }

  document.addEventListener('click', async (ev) => {
    const td = ev.target.closest('[data-td]');
    if (td) { const v = !td.classList.contains('done'); td.classList.toggle('done', v); td.setAttribute('aria-checked', v); tdSet(td.dataset.td, v); return; }
    const ck = ev.target.closest('[data-chk]');
    if (ck) {
      if (VIEW) return;
      const [ci, ckk] = ck.dataset.chk.split('|').map(Number), v = toggleChk(ci, ckk);
      if (v == null) return;
      ck.classList.toggle('done', v); ck.setAttribute('aria-checked', v); return;
    }
    if (ev.target.closest('#pickCancel')) { S.picking = false; map.getContainer().classList.remove('picking'); pickBar(false); if (!isDesk()) setSheet('full'); return; }
    if (ev.target.closest('a')) return;
    const pk = ev.target.closest('[data-pick]');
    if (pk) { const [mi, pi] = pk.dataset.pick.split('_').map(Number); if (!isDesk() && S.sheet === 'full') setSheet('half'); return showPick(mi, pi); }
    const t = ev.target.closest('button, [data-toggle], [data-stop]');
    if (!t) return;
    const d = t.dataset;
    if (d.tab) return go(d.tab);
    if (S.tab === 'pay' && payClick(t, d)) return;
    if (S.day === 'prep' && S.tab === 'plan' && prepClick(t, d)) return;
    if (d.day) { if (d.day === S.day) return fitDay(); if (S.tab !== 'plan') S.tab = 'plan'; return setDay(d.day); }
    if (d.sim) { store.set('sim', d.sim); return setDay(d.sim.slice(0, 10)); }
    if (d.cat) { S.cat = d.cat; S.query = ''; return render(); }
    if (d.toggle) { S.open = S.open === d.toggle ? null : d.toggle; return render(); }
    if (d.card) { S.open = d.card; S.query = ''; S.cat = 'all'; go('cards'); const el = document.getElementById('c-' + d.card); if (el) el.scrollIntoView({ block: 'start' }); return; }
    if (d.ja) return showBig(d.ja, d.ko);
    if (d.sample) { go('ask'); return send(d.sample); }
    if (d.askq) { const q = S.query; go('ask'); if (q) $('#q').value = q; return $('#q').focus(); }
    if (d.askabout) { go('ask'); $('#q').value = `"${CARD[d.askabout].title}" 관련해서 `; return $('#q').focus(); }
    if (d.goacct) { const a = $('#acct'); if (a) a.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    if (d.gm != null && S.edit) { S.edit.draft.gm = d.gm; renderPlan(); const el = $('#editor'); if (el) el.querySelector('.gochips').scrollIntoView({ block: 'nearest' }); return; }
    if (d.asknow != null) { go('ask'); $('#q').value = `지금 "${d.asknow}"에 있는데, `; return $('#q').focus(); }
    if (d.askstep) { const st = IT[+d.askstep]; go('ask'); $('#q').value = `지금 "${st.todo}" 단계인데, `; return $('#q').focus(); }
    if (d.edit != null) return openEditor(+d.edit);
    if (d.restore != null) { const e = edOf(dayOf(S.day)); e.del = e.del.filter((v) => v !== +d.restore); saveEdits(); return render(); }
    if (d.place != null) {
      const r = S.edit.results[+d.place]; Object.assign(S.edit.draft, { lat: r.lat, lng: r.lng, place: r.name }); if (!S.edit.draft.n.trim()) S.edit.draft.n = r.name;
      S.edit.results = null; renderPlan(); showDraft(); focusLL(L.latLng(r.lat, r.lng), 16); return;
    }
    if (d.stop != null) { if (S.edit) return; return selectStop(+d.stop, true); }
    if (t.id === 'tutAgain') return showTutorial();
    if (t.id === 'logout') { Promise.all([window.DK_CLOUD ? window.DK_CLOUD.signOut() : null, fetch('/api/me', { method: 'POST' })]).catch(() => {}).finally(() => {
      // 같은 기기를 다른 사람이 쓸 수 있으니 이 계정의 여행·경비 사본을 지워요
      try { const uid = CL && CL.user && CL.user.uid; Object.keys(localStorage).filter((k) => k === 'th.lastUser' || (USER && k.startsWith('th.u.' + USER.id + '.')) || (uid && k.startsWith('th.u.' + uid + '.')) || k.startsWith('th.cp.') || k.startsWith('th.cm.')).forEach((k) => localStorage.removeItem(k)); sessionStorage.clear(); } catch (e) {}
      location.reload();
    }); return; }
    if (t.id === 'tripDel') {
      if (CL && CL.role === 'edit') { if (!confirm('이 여행을 내 여행 목록에서 뺄까요? 다른 사람의 일정은 그대로 남아요.')) return; CL.close(true); }
      else if (!confirm(CL && CL.trip && CL.trip.memberIds.length > 1 ? '이 여행을 지울까요? 함께 편집하는 사람에게서도 사라지고, 되돌릴 수 없어요.' : '이 여행의 날짜와 내가 넣은 일정을 모두 지울까요? 되돌릴 수 없어요.')) return;
      else if (CL) { try { await CL.remove(); } catch (e) { return toast('지우지 못했어요. 인터넷 연결을 확인해 주세요.'); } }
      try { Object.keys(localStorage).filter((k) => k.startsWith(NS + 'todo|') || ['trip', 'edits', 'sim'].some((x) => k === NS + x)).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
      return reopenTrip();
    }
    if (d.kick) {
      const m = ((CL.trip && CL.trip.members) || {})[d.kick] || {}, nm0 = m.name || '이 사람';
      if (!confirm(`${nm0}님을 이 여행에서 내보낼까요? 더는 일정과 경비를 볼 수 없어요. 예전 초대 링크도 막히니, 다른 사람을 부르려면 새 링크를 보내 주세요.`)) return;
      t.disabled = true;
      return CL.kick(d.kick).then(() => { toast(`${nm0}님을 내보냈어요.`); renderPlan(); }).catch(() => { t.disabled = false; toast('내보내지 못했어요. 인터넷 연결을 확인해 주세요.'); });
    }
    if (t.id === 'shareEdit') return shareOut('edit');
    if (t.id === 'shareView') return shareOut('view');
    if (t.id === 'shareStop') { CL.stopPublic().then(() => { toast('보기 링크를 껐어요.'); renderPlan(); }).catch(() => toast('끄지 못했어요.')); return; }
    if (t.id === 'tripNew') { if (!okToLeave()) return; CL.close(); try { sessionStorage.setItem('dk.newTrip', '1'); localStorage.removeItem(NS + 'trip'); localStorage.removeItem(NS + 'edits'); } catch (e) {} return reopenTrip(); }
    const ti = t.closest && t.closest('[data-trip]');
    if (ti) { if (ti.dataset.trip === CL.tripId) return; ti.disabled = true; return openTrip(ti.dataset.trip).catch(() => { ti.disabled = false; toast('여행을 열지 못했어요. 인터넷 연결을 확인해 주세요.'); }); }
    if (t.id === 'impGo') return runImport();
    if (t.id === 'impSave') return saveImport();
    if (t.id === 'impBack') { S.imp.plan = null; return renderPlan(); }
    if (t.id === 'impClear') { S.imp.files = []; S.imp.text = ($('#impText') || {}).value || ''; return renderPlan(); }
    if (t.id === 'tripMake') {
      const title = $('#ntTitle').value.trim(), a = $('#ntStart').value, b = $('#ntEnd').value, stay = $('#ntStay').value.trim(), msg = $('#ntMsg');
      if (!a || !b) { msg.textContent = '시작일과 마지막 날을 골라 주세요.'; return; }
      if (b < a) { msg.textContent = '마지막 날이 시작일보다 빨라요.'; return; }
      if (dayRange(a, b).length > 30) { msg.textContent = '여행은 30일까지 만들 수 있어요.'; return; }
      const nt = { title: title || '일본 여행', start: a, end: b, stay, created: Date.now() };
      if (CL) { t.disabled = true; return CL.create(nt, {}).then(openTrip).catch((e) => { t.disabled = false; msg.textContent = saveErr(e); }); }
      store.set('trip', nt);
      store.set('edits', {});
      return reopenTrip();
    }
    if (t.id === 'aiPolish' || t.id === 'aiSuggest') { const m = t.id === 'aiPolish' ? 'polish' : 'suggest'; const did = dayOf(S.day).id; S.ai = S.ai && S.ai.day === did && S.ai.mode === m ? null : { mode: m, day: did, off: new Set(), added: new Set() }; renderPlan(); const b = $('#aiBox'); if (b) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    if (t.id === 'aiClose') { S.ai = null; return renderPlan(); }
    if (t.id === 'aiGo') return runAI();
    if (t.id === 'aiApply') return aiApply();
    if (t.dataset.aiadd != null) return aiAdd(+t.dataset.aiadd);
    if (t.id === 'editMode') { if (S.editMode && !okToLeave()) return; S.editMode = !S.editMode; if (!S.editMode) { closeEditor(); backPop('edit'); } return renderPlan(); }
    if (t.id === 'addStop') return openEditor('new');
    if (t.id === 'edCancel') { closeEditor(); backPop('edit'); return renderPlan(); }
    if (t.id === 'edSave') return saveEditor();
    if (t.id === 'edDel') {
      const dd = dayOf(S.day), s = dd.stops[S.edit.i];
      if (!confirm(`"${s[1]}" 일정을 지울까요?`)) return;
      const e = edOf(dd), gone = s.custom != null ? e.add.find((v) => v.id === s.custom) : null, bi = S.edit.i;
      if (s.custom != null) e.add = e.add.filter((v) => v.id !== s.custom); else if (!e.del.includes(bi)) e.del.push(bi);
      closeEditor(); saveEdits(); render(); backPop('edit');
      return toast(`"${s[1]}" 일정을 지웠어요.`, { label: '되돌리기', fn: () => {
        const e2 = edOf(dd);
        if (gone) { if (!e2.add.some((v) => v.id === gone.id)) e2.add.push(gone); } else e2.del = e2.del.filter((v) => v !== bi);
        saveEdits(); render(); toast('되돌렸어요.');
      } }, 7000);
    }
    if (t.id === 'resetDay') { if (!confirm('원래 일정에서 고치거나 지운 것을 모두 되돌릴까요? 내가 추가한 일정은 그대로 남아요.')) return; const e = edOf(dayOf(S.day)); e.mod = {}; e.del = []; closeEditor(); saveEdits(); return render(); }
    if (t.id === 'placeGo') return searchPlace();
    if (t.id === 'clearLL') { Object.assign(S.edit.draft, { lat: null, lng: null, place: '' }); renderPlan(); return showDraft(); }
    if (t.id === 'pickMe') {
      if (!meMarker) { startGeo(true); return toast('내 위치를 찾는 중이에요. 찾으면 한 번 더 눌러 주세요.'); }
      const ll = meMarker.getLatLng(); Object.assign(S.edit.draft, { lat: +ll.lat.toFixed(5), lng: +ll.lng.toFixed(5), place: '내 위치' }); renderPlan(); return showDraft();
    }
    if (t.id === 'pickMap') {
      S.picking = true; map.getContainer().classList.add('picking');
      if (!isDesk()) setSheet('peek');
      return pickBar(true);
    }
    if (d.human) {
      const lastQ = [...S.chat].reverse().find((m) => m.role === 'user');
      const u = store.get('unsolved', []); u.push({ q: lastQ ? lastQ.content : '', at: Date.now() }); store.set('unsolved', u);
      S.chat.push({ role: 'assistant', content: '현지인·전문가 연결은 아직 준비 중이에요. 이 질문은 이 휴대폰에 저장해 두었어요.\n\n지금 바로 해결하려면:\n1. 상황카드 탭의 "보여주기 문장"에서 일본어 문장을 골라 근처 직원이나 역무원에게 보여주세요.\n2. 말이 안 통하면 Japan Visitor Hotline(050-3816-2787)에 전화하면 통역을 도와줘요.', err: true });
      store.set('chat', S.chat.map((m) => ({ ...m, img: null })));
      return render();
    }
    if (t.id === 'send') { if (S.busy) return; const qq = $('#q'), q = qq.value; qq.value = ''; qq.style.height = 'auto'; return send(q); }
    if (t.id === 'photoBtn') return $('#photo').click();
    if (t.id === 'dropImg') { S.pendingImg = null; return render(); }
    if (t.id === 'clearChat') { S.chat = []; store.set('chat', []); return render(); }
    if (t.id === 'simClear') { store.set('sim', ''); const n = nowJST(); return setDay(inTrip(n) ? n.d : TRIP_START); }
    if (t.id === 'pgo') return makePhrase();
    if (t.id === 'locBtn') return startGeo(true);
    if (t.id === 'fitBtn') return fitDay();
    if (t.id === 'layerBtn') return switchTiles();
  });
  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'cq') { S.query = ev.target.value; renderCards(true); }
    if (ev.target.id === 'payN' && S.payF) S.payF.n = ev.target.value;
    if (ev.target.id === 'payA' && S.payF) {
      S.payF.a = ev.target.value; const c = amtCur(ev.target.value);
      if (c && c !== S.payF.c) { S.payF.c = c; document.querySelectorAll('[data-payc]').forEach((b) => b.classList.toggle('on', b.dataset.payc === c)); }
    }
    if ((ev.target.id === 'payA' || ev.target.id === 'payN') && S.payF) payDraft(S.payF);
    if (ev.target.id === 'codeIn') store.set('code', ev.target.value.trim());
    if (ev.target.dataset && ev.target.dataset.ed && S.edit) S.edit.draft[ev.target.dataset.ed] = ev.target.value;
    if (ev.target.id === 'placeQ' && S.edit) S.edit.q = ev.target.value;
    if (ev.target.id === 'q') { ev.target.style.height = 'auto'; ev.target.style.height = Math.min(120, ev.target.scrollHeight) + 'px'; }
  });
  document.addEventListener('change', async (ev) => {
    if (ev.target.dataset && ev.target.dataset.aipick && S.ai) {
      const id = ev.target.dataset.aipick; if (ev.target.checked) S.ai.off.delete(id); else S.ai.off.add(id);
      const b = $('#aiApply'), n = document.querySelectorAll('[data-aipick]:checked').length; if (b) b.textContent = `고른 ${n}개 반영하기`; return;
    }
    if (ev.target.id === 'payD' && S.payF) { S.payF.d = ev.target.value; payDraft(S.payF); return; }
    if (ev.target.id === 'simIn') { store.set('sim', ev.target.value); const n = nowJST(); return setDay(ev.target.value ? ev.target.value.slice(0, 10) : (inTrip(n) ? n.d : TRIP_START)); }
    if (ev.target.id === 'impFile' && ev.target.files.length) {
      S.imp = S.imp || {}; S.imp.text = ($('#impText') || {}).value || '';
      S.imp.files = (S.imp.files || []).concat([...ev.target.files]).slice(0, 6); S.imp.err = '';
      return renderPlan();
    }
    if (ev.target.id === 'photo' && ev.target.files[0]) {
      try { S.pendingImg = await resizeImage(ev.target.files[0]); } catch (e) { alert('사진을 읽지 못했어요.'); }
      ev.target.value = ''; render();
    }
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || ev.isComposing) return;
    const id = ev.target.id;
    if (id === 'placeQ') { ev.preventDefault(); searchPlace(); }
    else if (id === 'prepT' || id === 'prepD') { ev.preventDefault(); $('#prepAdd').click(); }
    else if (id === 'peT' || id === 'peD') { ev.preventDefault(); $('#peSave').click(); }
    else if (id === 'payP') { ev.preventDefault(); $('#payPAdd').click(); }
    else if (ev.target.matches && ev.target.matches('[data-chk],[data-stop][role=button]')) { ev.preventDefault(); ev.target.click(); }
  });
  map.on('click', (e) => {
    if (!S.picking || !S.edit) return;
    S.picking = false; map.getContainer().classList.remove('picking'); pickBar(false);
    Object.assign(S.edit.draft, { lat: +e.latlng.lat.toFixed(5), lng: +e.latlng.lng.toFixed(5), place: '지도에서 고른 곳' });
    if (S.tab !== 'plan') go('plan'); else renderPlan();
    showDraft();
    if (!isDesk()) setSheet('full');
    const el = $('#editor'); if (el) el.scrollIntoView({ block: 'nearest' });
  });
  $('#q').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); $('#send').click(); } });
  window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.includes(t) && t !== S.tab) go(t); });
  let rz = null;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { setSheet(S.sheet); map.invalidateSize(); }, 150); });
  window.addEventListener('online', () => { runWalkQ(); offlineSoon(3000); });

  // 시작
  const n0 = nowJST(), ui = restoreUI();
  S.day = inTrip(n0) ? n0.d : TRIP_START;
  if (ui && ui.day && (ui.day === 'prep' ? R.DAYS.length : R.DAYS.some((d) => d.date === ui.day))) S.day = ui.day;
  if (ui && TABS.includes(ui.tab) && !firstTab) S.tab = ui.tab;
  const sh0 = !R.DAYS.length ? 'full' : ui && ['peek', 'half', 'full'].includes(ui.sheet) ? ui.sheet : S.tab !== 'plan' ? 'half' : 'peek';
  setSheet(isDesk() ? 'full' : sh0);
  if (S.sheet !== 'peek' && history.state && history.state.dk) history.replaceState(null, '', location.hash);
  render();
  if (window.DK_NOTICE) setTimeout(() => toast(window.DK_NOTICE, null, 6000), 300);
  if (OWNER) fetch('/data/itinerary.json').then((r) => r.json()).then((d) => { IT = d; render(); }).catch(() => {});
  const tutSeen = () => { try { return localStorage.getItem('th.tutDone') === '1'; } catch (e) { return false; } };
  if (!VIEW && !tutSeen() && !store.get('tutDone', 0)) setTimeout(showTutorial, 400);
  offlineSoon(8000); setInterval(() => offlineSoon(0), 20 * 60000);
  if (store.get('geo', false) && navigator.permissions) navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') startGeo(false); }).catch(() => {});
  setInterval(() => {
    clock();
    const n = nowJST();
    if (inTrip(n) && n.d !== S.day && !n.sim) return;
    if (S.tab === 'plan' && !S.edit && !document.activeElement.matches('input,textarea')) { const st = view.scrollTop; renderPlan(); view.scrollTop = st; }
  }, 60000);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
