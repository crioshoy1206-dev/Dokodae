(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const view = $('#view');
  const panel = $('#panel');
  // 지도 레이어 버튼이 날짜 칩 아래에 오도록 상단 바 높이를 CSS 변수로 넘겨요.
  (function () { const tb = $('#topbar'); if (!tb) return; const f = () => document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px'); f(); if (window.ResizeObserver) new ResizeObserver(f).observe(tb); })();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 로그인한 사용자마다 저장 공간을 따로 써요
  const USER = window.DK_USER || null, OWNER = !!window.DK_OWNER && !!window.ROUTE;
  const NS = USER ? 'th.u.' + USER.id + '.' : 'th.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };
  const isDesk = () => window.matchMedia('(min-width:900px)').matches;

  // ---------- 여행 데이터 ----------
  // 주인 계정(OWNER_EMAILS)만 기존 일본 여행 일정을 받고, 다른 사용자는 빈 일정에서 직접 만들어요.
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const dayRange = (a, b) => { const out = []; const d = new Date(a + 'T00:00:00Z'), e = new Date(b + 'T00:00:00Z'); while (d <= e && out.length < 31) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); } return out; };
  const md = (dt) => `${+dt.slice(5, 7)}/${+dt.slice(8, 10)}`;
  const wd = (dt) => WD[new Date(dt + 'T00:00:00Z').getUTCDay()];
  const UT = OWNER ? null : store.get('trip', null);
  let TRIP_START, TRIP_END, DATES, STAYS, R;
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
  const stayOn = (day) => STAYS.find((s) => day >= s.from && day < s.to) || STAYS[STAYS.length - 1] || null;
  const CARD = Object.fromEntries(window.CARDS.map((c) => [c.id, c]));
  const PRI = getComputedStyle(document.documentElement).getPropertyValue('--pri').trim() || '#4E978D';
  let IT = [];
  const TABS = ['plan', 'ask', 'cards', 'phrases', 'sos'];
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
  R.DAYS.forEach((d, i) => {
    d.date = DATES[i];
    if (d.start) { d.stops.unshift(d.start); d.meals.forEach((m) => m.at++); R.PLANS[d.id] = R.PLANS[d.id].map((x) => (typeof x === 'number' ? x + 1 : x)); }
    // 열차 구간은 그 직전 장소의 할 일 맨 위에 '🚃 타는 곳'으로
    d.rides = {}; let mx = 0;
    R.PLANS[d.id].forEach((it) => {
      if (typeof it === 'number') { mx = Math.max(mx, it); return; }
      const [key, a, b] = it, ln = R.LINES[key], x = R.RIDE[it.join('|')];
      if (!x) return;
      const n = seg(key, a, b).length - 1;
      (d.rides[mx] = d.rides[mx] || []).push(`🚃 ${ln.n}: ${x[0]} → '${x[1]}' 방면 → ${x[2] || n + '정거장 → ' + b + ' 하차'}`);
    });
  });
  // ---------- 일정 편집 (이 기기에 저장) ----------
  // EDITS[dayId] = { mod: {원래순번: {t,n,m,todo,lat,lng}}, del: [원래순번], add: [{id,t,n,m,todo,lat,lng}] }
  let EDITS = store.get('edits', {});
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
    }).concat((e.add || []).map((a) => { const x = [a.t, a.n, a.m || '', a.lat == null ? null : a.lat, a.lng == null ? null : a.lng, 's']; x.key = 'c' + a.id; x.custom = a.id; x.todo = a.todo || []; return x; }));
    // 보여주는 순서: 원래 순서는 그대로 두고, 추가한 일정은 시간에 맞춰 끼워 넣어요
    const seq = d.base.map((b, i) => i), nb = d.base.length;
    d.stops.slice(nb).map((x, k) => nb + k).sort((a, b) => mins(d.stops[a][0]) - mins(d.stops[b][0])).forEach((ci) => {
      const t = mins(d.stops[ci][0]);
      const pos = seq.findIndex((j, p) => p > 0 && mins(d.stops[j][0]) > t);
      if (pos < 0) seq.push(ci); else seq.splice(pos, 0, ci);
    });
    d.seq = seq;
    d.vis = seq.filter((i) => !d.stops[i].del);
  }
  const numOf = (d, i) => d.vis.indexOf(i) + (d.start ? 0 : 1); // 출발점이 없는 일정은 1번부터
  function saveEdits() { store.set('edits', EDITS); R.DAYS.forEach(applyEdits); drawnDay = null; }
  R.DAYS.forEach((d) => { d.base = d.stops.map((x) => x.slice()); applyEdits(d); });

  const FAR = new Set(['나리타공항', '간사이공항 T1', '에노덴 후지사와역']);
  const dayOf = (date) => R.DAYS.find((d) => d.date === date) || R.DAYS[0];
  const todoList = (d, s) => s.todo || (R.TODO[d.id] || {})[s.key || s[1]] || [];
  const tdKey = (d, s, k) => 'todo|' + d.id + '|' + (s.key || s[1]) + '|' + (s.todo ? 'e' : '') + k;
  const tdGet = (k) => { try { return localStorage.getItem(NS + k) === '1'; } catch (e) { return false; } };
  const tdSet = (k, v) => { try { v ? localStorage.setItem(NS + k, '1') : localStorage.removeItem(NS + k); } catch (e) {} };
  const gq = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  function curStop(d, n) {
    if (n.d !== d.date) return -1;
    let idx = -1;
    d.vis.forEach((i) => { if (mins(d.stops[i][0]) <= mins(n.t)) idx = i; });
    return idx;
  }

  // ---------- 지도 ----------
  const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([36.2, 138.3], 5);
  const syncLabels = () => document.getElementById('map').classList.toggle('low-zoom', map.getZoom() < 14);
  map.on('zoomend', syncLabels);
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // CARTO 타일은 API 키가 필요해져서 OpenStreetMap 기본 타일을 써요 (다크 모드는 CSS로 반전)
  // 기본은 글자가 적은 회색 지도(Esri), 상세 지도(OSM)는 토글로 바꿀 수 있어요
  const grey = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, maxNativeZoom: 16, crossOrigin: true, attribution: 'Tiles © Esri'
  });
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, crossOrigin: true, attribution: '© OpenStreetMap contributors'
  });
  const tiles = grey.addTo(map);
  L.control.layers({ '간결 지도': grey, '상세 지도': osm }, null, { position: 'bottomleft', collapsed: true }).addTo(map);
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
  let layer = L.layerGroup().addTo(map), pickLayer = L.layerGroup().addTo(map), markers = {}, drawnDay = null, fitPts = [];

  // 지도에서 가려지지 않는 영역 (PC: 오른쪽 도구창, 모바일: 아래 시트)
  function sheetVisible() { return isDesk() ? 0 : panel.offsetHeight - snapY(S.sheet) + (window.innerHeight - panel.getBoundingClientRect().bottom); }
  function pad() {
    const top = (isDesk() ? 70 : 110);
    return isDesk() ? { paddingTopLeft: [40, top], paddingBottomRight: [panel.offsetWidth + 48, 40] } : { paddingTopLeft: [24, top], paddingBottomRight: [60, sheetVisible() + 20] };
  }
  function focusLL(ll, z) {
    z = Math.max(map.getZoom(), z || 15);
    const dx = isDesk() ? (panel.offsetWidth + 24) / 2 : 0;
    const dy = isDesk() ? 0 : (sheetVisible() - 50) / 2;
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
    };
    let w = WALKC[k]; if (!w) { try { w = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) {} }
    if (w) { WALKC[k] = w; apply(w); return; }
    walkQ.push({ k, a, b, apply }); runWalkQ();
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

  function drawDay(d, fit) {
    drawnDay = d.id; layer.clearLayers(); pickLayer.clearLayers(); markers = {}; fitPts = [];
    const n = nowJST(), ci = curStop(d, n);
    let last = null;
    // 가까우면 도보 경로, 멀면(2.5km 넘게) 이동 구간으로 곧게 이어요
    const walk = (p) => {
      if (!last) return; const dist = map.distance(last, p);
      if (dist <= 40) return;
      if (dist <= 2500) return walkLine(last, p, PRI, layer);
      L.polyline([last, p], { color: PRI, weight: 4, opacity: 0.75, dashArray: '10 8', lineCap: 'round' }).addTo(layer)
        .bindTooltip(`이동 · 약 ${(dist / 1000).toFixed(1)}km (교통수단은 일정에서 확인)`, { sticky: true });
    };
    // 동선 순서: 원래 동선(열차 구간 포함) 사이에 내가 추가한 일정을 시간 순서대로 끼워 넣어요
    const P = R.PLANS[d.id] || [], nb = d.base.length, plan = []; let k = 0;
    d.vis.forEach((i) => {
      if (i < nb) { const at = P.indexOf(i, k); if (at >= 0) { plan.push(...P.slice(k, at + 1)); k = at + 1; } else plan.push(i); }
      else plan.push(i);
    });
    plan.push(...P.slice(k).filter((x) => typeof x !== 'number'));
    plan.forEach((it) => {
      if (typeof it === 'number') { const s = d.stops[it]; if (!s || s.del || s[3] == null) return; const p = L.latLng(s[3], s[4]); walk(p); last = p; return; }
      const [key, a, b] = it, ln = R.LINES[key], part = seg(key, a, b), pts = part.map((x) => L.latLng(x[1], x[2]));
      walk(pts[0]);
      L.polyline(pts, { color: '#ffffff', weight: 9, opacity: 0.85 }).addTo(layer);
      const rd = R.RIDE[it.join('|')];
      L.polyline(pts, { color: ln.c, weight: 5, opacity: 1 }).addTo(layer).bindTooltip(`${ln.n} · ${a} → ${b}${rd ? " · '" + rd[1] + "' 방면" : ''}`, { sticky: true });
      part.slice(1, -1).forEach((x) => L.circleMarker([x[1], x[2]], { radius: 3, color: ln.c, weight: 2, fillColor: '#fff', fillOpacity: 1 }).addTo(layer).bindTooltip(x[0], { permanent: true, direction: 'right', offset: [4, 0], className: 'st' }));
      last = pts[pts.length - 1];
    });
    d.vis.forEach((i) => {
      const s = d.stops[i], no = numOf(d, i);
      if (s[3] == null) return;
      const cls = 'pin' + (no ? (s[5] === 'm' ? ' move' : '') : ' start') + (i === ci ? ' cur' : '');
      const icon = L.divIcon({ className: '', html: `<div class="${cls}">${no}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
      const items = (d.rides[i] || []).concat(todoList(d, s));
      const m = L.marker([s[3], s[4]], { icon, zIndexOffset: i === ci ? 1000 : no ? 500 : 900 }).addTo(layer)
        .bindPopup(`<div class="popup"><b>${no}${no ? '' : ' (출발)'}. ${esc(s[1])}</b><br>${esc(s[0])}${s[2] ? ' · ' + esc(s[2]) : ''}${items.length ? `<ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`, { maxWidth: 280, autoPan: false })
        .bindTooltip(s[1], { permanent: true, direction: 'right', offset: [14, 0], className: 'lb' })
        .on('click', () => selectStop(i, false));
      markers['s' + i] = m; if (!FAR.has(s[1])) fitPts.push([s[3], s[4]]);
    });
    d.meals.forEach((ml, mi) => ml.picks.forEach((p, pi) => {
      const icon = L.divIcon({ className: '', html: `<div class="fpin${p[5] ? '' : ' alt'}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
      const m = L.marker([p[3], p[4]], { icon, zIndexOffset: p[5] ? 400 : 300 }).addTo(layer)
        .bindPopup(`<div class="popup"><b>${p[5] ? '★ ' : ''}${esc(p[0])}</b><br>${esc(p[2])}<br><a href="${gq(p[1])}" target="_blank" rel="noopener">구글맵에서 보기 ↗</a></div>`, { autoPan: false })
        .bindTooltip((p[0].match(/\(([^)]+)\)/) || [0, p[0]])[1], { permanent: true, direction: 'top', offset: [0, -8], className: 'fd' })
        .on('click', () => showPick(mi, pi));
      markers[`f${mi}_${pi}`] = m; fitPts.push([p[3], p[4]]);
    }));
    if (meMarker) meMarker.addTo(map);
    if (fit !== false) fitDay();
    zoomCls();
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
    S.sel = i;
    document.querySelectorAll('.stop.on').forEach((x) => x.classList.remove('on'));
    const el = document.querySelector(`.stop[data-stop="${i}"]`);
    if (el) { el.classList.add('on'); if (!fromList) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    if (s[3] == null) { if (fromList) toast('위치가 없는 일정이에요. 일정 편집에서 위치를 넣을 수 있어요.'); return; }
    focusLL(L.latLng(s[3], s[4]), 15);
    const m = markers['s' + i]; if (m) m.openPopup();
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
  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200);
  }

  // ---------- 모바일 아래 시트 ----------
  function snapY(state) {
    const H = panel.offsetHeight;
    if (state === 'full') return 0;
    if (state === 'half') return Math.max(0, H - Math.round(window.innerHeight * 0.48));
    return Math.max(0, H - 58);
  }
  function setSheet(state, keepMap) {
    if (isDesk()) { panel.style.transform = ''; return; }
    S.sheet = state;
    document.body.classList.toggle('sheetfull', state === 'full');
    panel.style.transform = `translateY(${snapY(state)}px)`;
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
      panel.style.transform = `translateY(${Math.min(snapY('peek'), Math.max(0, start + dy))}px)`;
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
    const n = nowJST();
    if (!R.DAYS.length) { $('#clock').innerHTML = `일본 <b>${n.d.slice(5).replace('-', '/')} ${n.t}</b>`; $('#peek').innerHTML = '<b>새 여행 만들기</b> · 위로 올려서 시작해요'; return; }
    const dday = Math.round((Date.parse(TRIP_START) - Date.parse(n.d)) / 864e5);
    $('#clock').innerHTML = `일본 <b>${n.d.slice(5).replace('-', '/')} ${n.t}</b>` + (n.sim ? ' · 미리보기' : '') + (dday > 0 ? ` · D-${dday}` : '');
    const { cur, next } = findNow(n), st = cur || next;
    const cs = !OWNER && inTrip(n) ? (() => { const dd = dayOf(n.d), i = curStop(dd, n); return i != null && dd.stops[i] ? dd.stops[i] : null; })() : null;
    $('#peek').innerHTML = cs ? `<b>지금 ${esc(cs[0])}</b> · ${esc(cs[1])}` : inTrip(n) && st ? `<b>${cur ? '지금' : '다음'} ${esc(st.s)}</b> · ${esc(st.todo)}` : n.d < TRIP_START ? '<b>여행 전</b> · 위로 올려서 일정 보기' : '여행이 끝났어요';
  }
  function renderDays() {
    $('#days').innerHTML = R.DAYS.map((d) => `<button class="dchip ${d.date === S.day ? 'on' : ''}" data-day="${d.date}">${esc(d.tab)}</button>`).join('');
    const on = $('#days .on'); if (on) on.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
  function showBig(ja, ko) {
    const d = document.createElement('div');
    d.className = 'show';
    d.innerHTML = `<button class="x">닫기</button><div class="ja">${esc(ja)}</div>${ko ? `<div class="ko">${esc(ko)}</div>` : ''}`;
    d.addEventListener('click', () => d.remove());
    document.body.appendChild(d);
  }
  function jaList(list) {
    return list.map((p) => `<button class="tag" data-ja="${esc(p.ja)}" data-ko="${esc(p.ko)}" style="text-align:left">🇯🇵 ${esc(p.ja)}<br><span style="color:var(--sub)">${esc(p.ko)}</span></button>`).join('');
  }
  function cardTags(list) {
    return list.map((c) => `<button class="tag" data-card="${c.id}">${esc(c.title)}</button>`).join('');
  }
  function cardBody(c) {
    return `<div class="muted">${esc(c.sum)}</div>
      <ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      ${c.tips.map((t) => `<div class="tip">💡 ${esc(t)}</div>`).join('')}
      ${c.ja.length ? `<div class="k" style="margin-top:10px">직원에게 보여주기 (누르면 크게)</div>${jaList(c.ja)}` : ''}
      ${c.verified === 'check' ? '<div style="margin-top:8px"><span class="chk">규정이 바뀔 수 있어요 · 현장 안내 우선</span></div>' : ''}
      <div class="row" style="margin-top:10px"><button class="btn ghost" data-askabout="${c.id}">이 상황 AI에게 더 묻기</button></div>`;
  }

  // ---------- 일정 (기본 화면) ----------
  function mealsHTML(d, list) {
    return list.map((ml) => {
      const mi = d.meals.indexOf(ml);
      return `<div class="meal"><h3>${esc(ml.label)}</h3>${ml.picks.map((p, pi) => `<div class="pick" data-pick="${mi}_${pi}"><span class="mk">${p[5] ? '★' : '◇'}</span><span>${esc(p[0])} <small>${esc(p[2])}</small><small class="pwalk"></small></span><a href="${gq(p[1])}" target="_blank" rel="noopener">지도 ↗</a></div>`).join('')}</div>`;
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
      <div class="k" style="margin-top:8px">위치</div>
      <div class="muted" style="margin:2px 0 6px">${x.lat != null ? `📍 지도에 표시돼요${x.place ? ' · ' + esc(x.place) : ''}` : '아직 위치가 없어요. 장소를 찾거나 지도에서 찍어 주세요.'}</div>
      <div class="row" style="flex-wrap:nowrap"><input type="search" id="placeQ" value="${esc(E.q || '')}" placeholder="장소 검색 (예: 도쿄 스카이트리)" style="flex:1;min-width:0"><button class="btn ghost" id="placeGo">찾기</button></div>
      ${res ? `<div class="pres">${res.length ? res.map((r, k) => `<button class="pr" data-place="${k}"><b>${esc(r.name)}</b><small>${esc(r.addr)}</small></button>`).join('') : '<div class="muted">찾는 장소가 없어요. 다른 이름이나 일본어로 찾아보세요.</div>'}</div>` : ''}
      <div class="row" style="margin-top:6px"><button class="btn ghost" id="pickMap">🗺 지도에서 찍기</button><button class="btn ghost" id="pickMe">◎ 내 위치</button>${x.lat != null && !orig ? '<button class="tag" id="clearLL">위치 빼기</button>' : ''}</div>
      <div class="row" style="margin-top:12px;justify-content:space-between"><div class="row"><button class="btn" id="edSave">저장</button><button class="btn ghost" id="edCancel">취소</button></div>${isNew ? '' : '<button class="btn danger" id="edDel">삭제</button>'}</div>
    </div>`;
  }
  function openEditor(i) {
    const d = dayOf(S.day);
    S.editMode = true;
    if (i === 'new') {
      const last = d.vis.length ? d.stops[d.vis[d.vis.length - 1]] : null;
      S.edit = { i, draft: { t: last ? last[0] : '09:00', n: '', m: '', todo: '', lat: null, lng: null } };
    } else {
      const s = d.stops[i];
      S.edit = { i, draft: { t: s[0], n: s[1], m: s[2] || '', todo: todoList(d, s).join('\n'), lat: s[3], lng: s[4] } };
    }
    renderPlan(); showDraft();
    const el = $('#editor'); if (el) el.scrollIntoView({ block: 'nearest' });
    if (!isDesk() && S.sheet !== 'full') setSheet('full');
  }
  function closeEditor() { S.edit = null; S.picking = false; map.getContainer().classList.remove('picking'); pickLayer.clearLayers(); }
  function showDraft() {
    pickLayer.clearLayers();
    const x = S.edit && S.edit.draft; if (!x || x.lat == null) return;
    L.marker([x.lat, x.lng], { icon: L.divIcon({ className: '', html: '<div class="pin draft">✎</div>', iconSize: [26, 26], iconAnchor: [13, 13] }), zIndexOffset: 2000 }).addTo(pickLayer);
  }
  function saveEditor() {
    const d = dayOf(S.day), E = S.edit, x = E.draft;
    const t = (x.t || '').trim(), n = (x.n || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(t)) return toast('시간을 넣어 주세요.');
    if (!n) return toast('이름을 넣어 주세요.');
    const todo = String(x.todo || '').split('\n').map((v) => v.trim()).filter(Boolean);
    const e = edOf(d);
    if (E.i === 'new') {
      e.add.push({ id: Date.now().toString(36), t, n, m: (x.m || '').trim(), todo, lat: x.lat, lng: x.lng });
    } else if (d.stops[E.i].custom != null) {
      const a = e.add.find((v) => v.id === d.stops[E.i].custom);
      Object.assign(a, { t, n, m: (x.m || '').trim(), todo, lat: x.lat, lng: x.lng });
    } else {
      const b = d.base[E.i], m = {};
      if (t !== b[0]) m.t = t; if (n !== b[1]) m.n = n; if ((x.m || '').trim() !== (b[2] || '')) m.m = (x.m || '').trim();
      if (x.lat !== b[3] || x.lng !== b[4]) { m.lat = x.lat; m.lng = x.lng; }
      const ot = (R.TODO[d.id] || {})[b[1]] || [];
      if (todo.join('\n') !== ot.join('\n')) m.todo = todo;
      if (Object.keys(m).length) e.mod[E.i] = m; else delete e.mod[E.i];
    }
    closeEditor(); saveEdits(); render(); toast('저장했어요.');
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
    const who = USER ? `<div class="acct">${USER.picture ? `<img src="${esc(USER.picture)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(USER.name)}</b><div class="muted">${esc(USER.email)}</div></div></div>`
      : `<div class="muted">${window.DK_AUTH === 'off' ? '로그인 없이 이 기기에만 저장하고 있어요.' : '로그인 정보를 확인하지 못했어요 (오프라인).'}</div>`;
    return `<div class="card"><div class="k">내 계정</div>${who}
      <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" id="tutAgain">사용법 다시 보기</button>
      ${!OWNER && UT ? '<button class="btn ghost sm" id="tripDel">이 여행 지우기</button>' : ''}
      ${USER ? '<button class="btn ghost sm" id="logout">로그아웃</button>' : ''}</div></div>`;
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
    const d = dayOf(S.day);
    if (!d) { view.innerHTML = newTripHTML() + acctHTML(); return; }
    const { cur, next } = findNow(n);
    let top = '';
    if (inTrip(n) && (cur || next)) {
      const st = cur || next;
      top = `<div class="card now">
        <div class="k">${cur ? '지금 할 일' : '다음 할 일'} · ${esc(st.s)}~${esc(st.e)} · ${esc(st.place)}</div>
        <div class="big">${esc(st.todo)}</div>
        ${st.board ? `<div class="det"><b>타는 곳</b> ${esc(st.board)}</div>` : ''}
        ${st.alight ? `<div class="det"><b>내리는 곳</b> ${esc(st.alight)}</div>` : ''}
        ${st.memo ? `<div class="det">💡 ${esc(st.memo)}</div>` : ''}
        <div>${cardTags(cardsForStep(st))}</div>
        ${cur && next ? `<div class="det" style="margin-top:8px"><b>다음</b> ${esc(next.s)} ${esc(next.todo)}</div>` : ''}
        <div class="row" style="margin-top:10px"><button class="btn" data-askstep="${IT.indexOf(st)}">여기서 막혔어요 → AI에게 묻기</button></div>
      </div>`;
    } else if (n.d < TRIP_START && !OWNER) {
      const dd = Math.round((Date.parse(TRIP_START) - Date.parse(n.d)) / 864e5);
      top = `<div class="card"><div class="k">여행 전 · D-${dd}</div><div class="muted">여행 중에는 지금 시각에 맞는 장소가 '지금'으로 표시돼요. 장소를 누르면 할 일이 펼쳐져요.</div></div>`;
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
    const EM = S.editMode;
    const stops = d.seq.map((i) => {
      const s = d.stops[i], no = numOf(d, i);
      const ml0 = d.meals.filter((ml) => ml.at === i);
      if (S.edit && S.edit.i === i) return editorHTML(d) + mealsHTML(d, ml0);
      if (s.del) return (EM ? `<div class="stop gone"><span class="time">${esc(s[0])}</span><span class="num">–</span><span class="what"><b>${esc(s[1])}</b><small>지운 일정</small><button class="ebtn" data-restore="${i}">되살리기</button></span></div>` : '') + mealsHTML(d, ml0);
      const rides = d.rides[i] || [], todo = todoList(d, s);
      const li = rides.map((t, k) => { const key = tdKey(d, s, 'r' + k); return `<li data-td="${esc(key)}" class="ride${tdGet(key) ? ' done' : ''}" role="checkbox" aria-checked="${tdGet(key)}">${esc(t)}</li>`; })
        .concat(todo.map((t, k) => { const key = tdKey(d, s, k); return `<li data-td="${esc(key)}" class="${tdGet(key) ? 'done' : ''}" role="checkbox" aria-checked="${tdGet(key)}">${esc(t)}</li>`; })).join('');
      const tags = cardsForText([s[1], s[2]].concat(rides, todo).join(' '), 2);
      const meals = mealsHTML(d, ml0), op = S.xp.has(i) || EM;
      const nDo = rides.length + todo.length + ml0.length;
      return `<div class="stop${i === ci ? ' cur' : ''}${i === S.sel ? ' on' : ''}${op ? ' open' : ''}" data-stop="${i}" aria-expanded="${op}">
        <span class="time">${esc(s[0])}</span>
        <span class="num${no ? (s[5] === 'm' ? ' move' : '') : ' start'}">${no}</span>
        <span class="what">${EM ? `<button class="ebtn" data-edit="${i}">수정</button>` : ''}<b>${esc(s[1])}</b>${i === ci ? '<span class="nowtag">지금</span>' : ''}${s.custom != null ? '<span class="etag">추가함</span>' : s.edited ? '<span class="etag">수정함</span>' : ''}${s[3] == null ? '<span class="etag">위치 없음</span>' : ''}${nDo || s[2] ? `<span class="chev" aria-hidden="true">${nDo ? nDo + ' ' : ''}▾</span>` : ''}
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
      <div class="dayhead"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><h2>${esc(d.title)}</h2><button class="btn ${EM ? '' : 'ghost'} sm" id="editMode">${EM ? '편집 끝내기' : '✎ 일정 편집'}</button></div><div class="sub">${esc(d.sub)}</div></div>
      ${usedLines.length || d.meals.length ? `<div class="legend">${usedLines.map((l) => `<span><i style="width:16px;height:5px;border-radius:3px;background:${l.c};display:inline-block"></i>${esc(l.n)}</span>`).join('')}<span><i style="width:16px;border-top:3px dotted var(--c);display:inline-block"></i>도보</span><span style="color:var(--food)">◆ 맛집 후보</span></div>` : ''}
      <div>${stops}</div>
      ${S.edit && S.edit.i === 'new' ? editorHTML(d) : `<button class="addstop" id="addStop">＋ 이날 일정 추가</button>`}
      ${EM && hasEdits(d) ? `<div style="text-align:center;margin:6px 0 4px"><button class="tag" id="resetDay">이날 일정 원래대로 되돌리기</button></div>` : ''}
      ${EM ? `<div class="muted" style="margin:4px 2px 0">고친 일정은 이 기기에만 저장돼요.</div>` : ''}
      <div class="card"><div class="k">설정</div>
        <div class="muted" style="margin:6px 0">미리보기 시간 (비워 두면 실제 일본 시각)</div>
        <div class="row"><input type="datetime-local" id="simIn" value="${esc(sim)}" min="${TRIP_START}T00:00" max="${TRIP_END}T23:59" style="flex:1"><button class="btn ghost" id="simClear">실제 시각</button></div>
        <div class="muted" style="margin:10px 0 6px">AI 접근 코드 (받은 경우에만)</div>
        <input type="text" id="codeIn" value="${esc(store.get('code', ''))}" placeholder="없으면 비워 두세요">
      </div>${acctHTML()}`;
  }

  // ---------- 사용법 (처음 한 번) ----------
  const TUT = [
    ['🗾', '도코데에 오신 걸 환영해요', '일본 여행 중에 일정, 동선, 막힐 때 도움을 한곳에서 볼 수 있어요. 처음이니 30초만 둘러볼게요.'],
    ['🗓️', '1. 여행 만들기', '일정 탭에서 여행 이름과 날짜를 정하면 날짜별 빈 일정이 생겨요. 샘플 일정은 없어요. 처음부터 내 여행으로 채워요.'],
    ['📍', '2. 장소 추가하기', '날짜를 고르고 "이날 일정 추가"를 눌러 장소를 검색해요. 넣은 순서와 시간대로 지도에 번호와 동선이 그려져요.'],
    ['👆', '3. 장소를 누르면 할 일이 펼쳐져요', '평소에는 장소 이름만 보여요. 누르면 메모와 체크리스트가 펼쳐지고, 지도도 그 장소로 이동해요.'],
    ['💬', '4. 막히면 바로 도움 받기', 'AI 묻기에 상황을 적거나 사진을 보내 보세요. 상황카드에는 교통·식당·숙소 대처법이, 긴급 탭에는 연락처가 있어요.']
  ];
  function showTutorial() {
    let k = 0;
    const el = document.createElement('div'); el.className = 'tut'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    const done = () => { store.set('tutDone', 1); el.remove(); };
    const draw = () => {
      const [ico, h, p] = TUT[k], last = k === TUT.length - 1;
      el.innerHTML = `<div class="tutc"><div class="ico">${ico}</div><h3>${esc(h)}</h3><p>${esc(p)}</p>
        <div class="dots">${TUT.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</div>
        <div class="tutf">${last ? '<span></span>' : '<button class="tutskip" data-t="skip">건너뛰기</button>'}<div class="tutb">${k ? '<button class="btn ghost" data-t="prev">이전</button>' : ''}<button class="btn" data-t="next">${last ? '시작하기' : '다음'}</button></div></div></div>`;
    };
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-t]'); if (!b) return; ev.stopPropagation();
      if (b.dataset.t === 'skip') return done();
      if (b.dataset.t === 'prev') { k = Math.max(0, k - 1); return draw(); }
      if (k === TUT.length - 1) { done(); if (!R.DAYS.length) { go('plan'); if (!isDesk()) setSheet('full'); } return; }
      k++; draw();
    });
    draw(); document.body.appendChild(el);
  }

  // ---------- 상황 카드 ----------
  const seg2 = (on) => `<div class="seg"><button data-tab="cards" class="${on === 'cards' ? 'on' : ''}">🧭 상황카드</button><button data-tab="phrases" class="${on === 'phrases' ? 'on' : ''}">🇯🇵 보여주기 문장</button></div>`;
  function renderCards() {
    const list = S.query ? searchCards(S.query, 30) : window.CARDS.filter((c) => S.cat === 'all' || c.cat === S.cat);
    const chips = [{ id: 'all', name: '전체', icon: '' }, ...window.CATS].map((c) => `<button class="chip ${S.cat === c.id && !S.query ? 'on' : ''}" data-cat="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('');
    view.innerHTML = `${seg2('cards')}<input type="search" id="cq" placeholder="무슨 상황이에요? 예: 식권기, 환승, 온천" value="${esc(S.query)}">
      <div class="chips" style="margin-top:8px">${chips}</div>
      <div id="clist">${list.map((c) => `<div class="card" id="c-${c.id}">
        <div class="row" data-toggle="${c.id}" style="justify-content:space-between;cursor:pointer;flex-wrap:nowrap"><div><div class="k">${window.CATS.find((x) => x.id === c.cat).icon} ${window.CATS.find((x) => x.id === c.cat).name}</div><b>${esc(c.title)}</b></div><span>${S.open === c.id ? '▲' : '▼'}</span></div>
        ${S.open === c.id ? cardBody(c) : `<div class="muted" style="margin-top:4px">${esc(c.sum)}</div>`}
      </div>`).join('')}
      <div class="card"><div class="muted">찾는 상황이 없나요?</div><button class="btn" style="margin-top:8px" data-askq="1">AI에게 바로 묻기</button></div></div>`;
  }

  // ---------- AI 묻기 ----------
  function buildContext(q) {
    const n = nowJST();
    const { cur, next } = findNow(n);
    const day = inTrip(n) ? n.d : (S.day || TRIP_START);
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
    let h = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    h = h.replace(/📋\s*직원에게 보여주기:?\s*\n?\s*(.+)/, (m, ja) => `<button class="tag" data-ja="${ja.replace(/"/g, '&quot;')}" style="font-size:16px">📋 직원에게 보여주기<br><span style="font-size:19px">${ja}</span></button>`);
    return h;
  }
  function renderAsk() {
    const msgs = S.chat.map((m, i) => `<div class="msg ${m.role === 'user' ? 'u' : 'a'}">${m.img ? `<img src="${m.img}" alt="">` : ''}${m.role === 'user' ? esc(m.content) : fmt(m.content)}${m.cards && m.cards.length ? (m.err && CARD[m.cards[0]] ? `<div style="margin-top:8px"><b>${esc(CARD[m.cards[0]].title)}</b>${cardBody(CARD[m.cards[0]])}${cardTags(m.cards.slice(1).map((id) => CARD[id]).filter(Boolean))}</div>` : `<div>${cardTags(m.cards.map((id) => CARD[id]).filter(Boolean))}</div>`) : ''}${m.role === 'assistant' && i === S.chat.length - 1 && !m.err ? `<div style="margin-top:8px"><button class="tag" data-human="1">AI 답으로 해결 안 됐어요</button></div>` : ''}</div>`).join('');
    view.innerHTML = `${S.chat.length ? '' : `<div class="card"><div class="big">현장에서 막히면 물어보세요</div>
        <div class="muted">내 일정과 지금 시각을 알고 답해요. 안내판·메뉴·매표기 사진도 📷로 보낼 수 있어요.</div>
        <div style="margin-top:8px">${['신주쿠역에서 오다큐선 어디로 가?', '식권기 버튼이 다 일본어야', '신사에서 사진 찍어도 돼?', '심야버스 승차장을 못 찾겠어'].map((q) => `<button class="tag" data-sample="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>`}
      <div class="chat" id="chat">${msgs}${S.busy ? '<div class="typing">답을 찾는 중…</div>' : ''}</div>
      ${S.chat.length ? '<div style="text-align:center;margin-top:14px"><button class="tag" id="clearChat">대화 지우기</button></div>' : ''}
      ${S.pendingImg ? `<div class="card row"><img src="${S.pendingImg.url}" style="width:64px;border-radius:8px"><span class="muted">사진이 첨부됐어요</span><button class="tag" id="dropImg">빼기</button></div>` : ''}`;
    view.scrollTop = view.scrollHeight;
  }
  async function send(q) {
    q = (q || '').trim();
    if (!q && !S.pendingImg) return;
    if (!q) q = '이 사진에서 뭘 해야 하는지 알려줘';
    const img = S.pendingImg;
    S.pendingImg = null;
    S.chat.push({ role: 'user', content: q, img: img ? img.url : null });
    const matched = searchCards(q, 3).map((c) => c.id);
    S.busy = true; render();
    try {
      const r = await fetch('/api/chat', {
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
      const msg = offline ? '지금 인터넷이 안 돼요. 아래 상황 카드는 오프라인에서도 열려요.'
        : e.code === 'no_key' ? 'AI 연결은 준비 중이에요. 대신 가장 가까운 상황 카드를 펼쳐 드릴게요.'
        : e.code === 'need_code' ? '설정(일정 탭 맨 아래)에 AI 접근 코드를 넣어 주세요.'
        : (e.message || '답을 받지 못했어요.');
      S.chat.push({ role: 'assistant', content: msg + (matched.length ? '' : '\n관련 카드를 못 찾았어요. 상황카드 탭에서 검색해 보세요.'), cards: matched, err: true });
    }
    S.chat = S.chat.slice(-30);
    store.set('chat', S.chat.map((m) => ({ ...m, img: null })));
    S.busy = false; render();
  }
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
        ${stay.tel ? `<a class="tag" href="tel:${stay.tel.replace(/[^+\d]/g, '')}">📞 ${esc(stay.tel)}</a>` : ''}${stay.note ? `<div class="muted">${esc(stay.note)}</div>` : ''}</div>` : ''}
      <div class="k" style="margin-top:14px">이럴 땐 이렇게</div>
      ${['lostthing', 'passport', 'sick', 'quake'].map((id) => `<button class="card" data-card="${id}" style="width:100%;text-align:left"><b>${esc(CARD[id].title)}</b><div class="muted">${esc(CARD[id].sum)}</div></button>`).join('')}
      ${unsolved.length ? `<div class="card"><div class="k">AI로 해결 못 한 질문 (${unsolved.length})</div>${unsolved.slice(-5).reverse().map((u) => `<div class="muted" style="margin-top:6px">• ${esc(u.q)}</div>`).join('')}<div class="muted" style="margin-top:6px">현지인·전문가 연결은 준비 중이에요. 이 목록은 이 휴대폰에만 저장돼요.</div></div>` : ''}`;
  }

  // ---------- 라우팅 ----------
  function render() {
    const navTab = S.tab === 'phrases' ? 'cards' : S.tab;
    document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b.dataset.tab === navTab));
    $('#composer').classList.toggle('hide', S.tab !== 'ask');
    const d = dayOf(S.day);
    if (d && drawnDay !== d.id) drawDay(d);
    if (!d && drawnDay !== 'none') { drawnDay = 'none'; layer.clearLayers(); pickLayer.clearLayers(); markers = {}; fitPts = []; }
    renderDays();
    ({ plan: renderPlan, cards: renderCards, ask: renderAsk, phrases: renderPhrases, sos: renderSos }[S.tab] || renderPlan)();
    clock();
  }
  function go(tab) {
    const same = tab === S.tab;
    S.tab = tab; history.replaceState(null, '', '#' + tab); render();
    if (tab !== 'ask') view.scrollTop = 0;
    if (!isDesk()) {
      if (same && S.sheet !== 'peek') setSheet('peek');
      else if (tab === 'ask') setSheet('full');
      else if (S.sheet === 'peek') setSheet('half');
    }
  }
  function setDay(date, fit) {
    S.day = date; S.sel = null; S.xp = new Set(); drawnDay = null; closeEditor(); render(); view.scrollTop = 0;
    if (fit === false) return;
  }

  document.addEventListener('click', (ev) => {
    const td = ev.target.closest('[data-td]');
    if (td) { const v = !td.classList.contains('done'); td.classList.toggle('done', v); td.setAttribute('aria-checked', v); tdSet(td.dataset.td, v); return; }
    if (ev.target.closest('a')) return;
    const pk = ev.target.closest('[data-pick]');
    if (pk) { const [mi, pi] = pk.dataset.pick.split('_').map(Number); if (!isDesk() && S.sheet === 'full') setSheet('half'); return showPick(mi, pi); }
    const t = ev.target.closest('button, [data-toggle], [data-stop]');
    if (!t) return;
    const d = t.dataset;
    if (d.tab) return go(d.tab);
    if (d.day) { if (d.day === S.day) return fitDay(); if (S.tab !== 'plan') S.tab = 'plan'; return setDay(d.day); }
    if (d.sim) { store.set('sim', d.sim); return setDay(d.sim.slice(0, 10)); }
    if (d.cat) { S.cat = d.cat; S.query = ''; return render(); }
    if (d.toggle) { S.open = S.open === d.toggle ? null : d.toggle; return render(); }
    if (d.card) { S.open = d.card; S.query = ''; S.cat = 'all'; go('cards'); const el = document.getElementById('c-' + d.card); if (el) el.scrollIntoView({ block: 'start' }); return; }
    if (d.ja) return showBig(d.ja, d.ko);
    if (d.sample) { go('ask'); return send(d.sample); }
    if (d.askq) { const q = S.query; go('ask'); if (q) $('#q').value = q; return $('#q').focus(); }
    if (d.askabout) { go('ask'); $('#q').value = `"${CARD[d.askabout].title}" 관련해서 `; return $('#q').focus(); }
    if (d.askstep) { const st = IT[+d.askstep]; go('ask'); $('#q').value = `지금 "${st.todo}" 단계인데, `; return $('#q').focus(); }
    if (d.edit != null) return openEditor(+d.edit);
    if (d.restore != null) { const e = edOf(dayOf(S.day)); e.del = e.del.filter((v) => v !== +d.restore); saveEdits(); return render(); }
    if (d.place != null) {
      const r = S.edit.results[+d.place]; Object.assign(S.edit.draft, { lat: r.lat, lng: r.lng, place: r.name }); if (!S.edit.draft.n.trim()) S.edit.draft.n = r.name;
      S.edit.results = null; renderPlan(); showDraft(); focusLL(L.latLng(r.lat, r.lng), 16); return;
    }
    if (d.stop != null) { if (S.edit) return; return selectStop(+d.stop, true); }
    if (t.id === 'tutAgain') return showTutorial();
    if (t.id === 'logout') { fetch('/api/me', { method: 'POST' }).catch(() => {}).finally(() => { try { localStorage.removeItem('th.lastUser'); } catch (e) {} location.reload(); }); return; }
    if (t.id === 'tripDel') {
      if (!confirm('이 여행의 날짜와 내가 넣은 일정을 모두 지울까요? 되돌릴 수 없어요.')) return;
      try { Object.keys(localStorage).filter((k) => k.startsWith(NS + 'todo|') || ['trip', 'edits', 'sim'].some((x) => k === NS + x)).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
      return location.reload();
    }
    if (t.id === 'tripMake') {
      const title = $('#ntTitle').value.trim(), a = $('#ntStart').value, b = $('#ntEnd').value, stay = $('#ntStay').value.trim(), msg = $('#ntMsg');
      if (!a || !b) { msg.textContent = '시작일과 마지막 날을 골라 주세요.'; return; }
      if (b < a) { msg.textContent = '마지막 날이 시작일보다 빨라요.'; return; }
      if (dayRange(a, b).length > 30) { msg.textContent = '여행은 30일까지 만들 수 있어요.'; return; }
      store.set('trip', { title: title || '일본 여행', start: a, end: b, stay, created: Date.now() });
      store.set('edits', {});
      return location.reload();
    }
    if (t.id === 'editMode') { S.editMode = !S.editMode; if (!S.editMode) closeEditor(); return renderPlan(); }
    if (t.id === 'addStop') return openEditor('new');
    if (t.id === 'edCancel') { closeEditor(); return renderPlan(); }
    if (t.id === 'edSave') return saveEditor();
    if (t.id === 'edDel') {
      const dd = dayOf(S.day), s = dd.stops[S.edit.i];
      if (!confirm(`"${s[1]}" 일정을 지울까요?`)) return;
      const e = edOf(dd);
      if (s.custom != null) e.add = e.add.filter((v) => v.id !== s.custom); else if (!e.del.includes(S.edit.i)) e.del.push(S.edit.i);
      closeEditor(); saveEdits(); render(); return toast('지웠어요.');
    }
    if (t.id === 'resetDay') { if (!confirm('이날 고친 일정을 모두 지우고 원래 일정으로 되돌릴까요?')) return; delete EDITS[dayOf(S.day).id]; closeEditor(); saveEdits(); return render(); }
    if (t.id === 'placeGo') return searchPlace();
    if (t.id === 'clearLL') { Object.assign(S.edit.draft, { lat: null, lng: null, place: '' }); renderPlan(); return showDraft(); }
    if (t.id === 'pickMe') {
      if (!meMarker) { startGeo(true); return toast('내 위치를 찾는 중이에요. 찾으면 한 번 더 눌러 주세요.'); }
      const ll = meMarker.getLatLng(); Object.assign(S.edit.draft, { lat: +ll.lat.toFixed(5), lng: +ll.lng.toFixed(5), place: '내 위치' }); renderPlan(); return showDraft();
    }
    if (t.id === 'pickMap') {
      S.picking = true; map.getContainer().classList.add('picking');
      if (!isDesk()) setSheet('peek');
      return toast('지도에서 위치를 눌러 주세요.');
    }
    if (d.human) {
      const lastQ = [...S.chat].reverse().find((m) => m.role === 'user');
      const u = store.get('unsolved', []); u.push({ q: lastQ ? lastQ.content : '', at: Date.now() }); store.set('unsolved', u);
      S.chat.push({ role: 'assistant', content: '현지인·전문가 연결은 아직 준비 중이에요. 이 질문은 이 휴대폰에 저장해 두었어요.\n\n지금 바로 해결하려면:\n1. 상황카드 탭의 "보여주기 문장"에서 일본어 문장을 골라 근처 직원이나 역무원에게 보여주세요.\n2. 말이 안 통하면 Japan Visitor Hotline(050-3816-2787)에 전화하면 통역을 도와줘요.', err: true });
      store.set('chat', S.chat.map((m) => ({ ...m, img: null })));
      return render();
    }
    if (t.id === 'send') { const q = $('#q').value; $('#q').value = ''; return send(q); }
    if (t.id === 'photoBtn') return $('#photo').click();
    if (t.id === 'dropImg') { S.pendingImg = null; return render(); }
    if (t.id === 'clearChat') { S.chat = []; store.set('chat', []); return render(); }
    if (t.id === 'simClear') { store.set('sim', ''); const n = nowJST(); return setDay(inTrip(n) ? n.d : TRIP_START); }
    if (t.id === 'pgo') return makePhrase();
    if (t.id === 'locBtn') return startGeo(true);
    if (t.id === 'fitBtn') return fitDay();
  });
  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'cq') { S.query = ev.target.value; const pos = ev.target.selectionStart; renderCards(); const el = $('#cq'); el.focus(); el.setSelectionRange(pos, pos); }
    if (ev.target.id === 'codeIn') store.set('code', ev.target.value.trim());
    if (ev.target.dataset && ev.target.dataset.ed && S.edit) S.edit.draft[ev.target.dataset.ed] = ev.target.value;
    if (ev.target.id === 'placeQ' && S.edit) S.edit.q = ev.target.value;
    if (ev.target.id === 'q') { ev.target.style.height = 'auto'; ev.target.style.height = Math.min(120, ev.target.scrollHeight) + 'px'; }
  });
  document.addEventListener('change', async (ev) => {
    if (ev.target.id === 'simIn') { store.set('sim', ev.target.value); const n = nowJST(); return setDay(ev.target.value ? ev.target.value.slice(0, 10) : (inTrip(n) ? n.d : TRIP_START)); }
    if (ev.target.id === 'photo' && ev.target.files[0]) {
      try { S.pendingImg = await resizeImage(ev.target.files[0]); } catch (e) { alert('사진을 읽지 못했어요.'); }
      ev.target.value = ''; render();
    }
  });
  document.addEventListener('keydown', (ev) => { if (ev.target.id === 'placeQ' && ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); searchPlace(); } });
  map.on('click', (e) => {
    if (!S.picking || !S.edit) return;
    S.picking = false; map.getContainer().classList.remove('picking');
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
  window.addEventListener('online', runWalkQ);

  // 시작
  const n0 = nowJST();
  S.day = inTrip(n0) ? n0.d : TRIP_START;
  if (!R.DAYS.length && !isDesk()) S.sheet = 'full';
  setSheet(isDesk() ? 'full' : R.DAYS.length ? 'peek' : 'full');
  render();
  if (OWNER) fetch('/data/itinerary.json').then((r) => r.json()).then((d) => { IT = d; render(); }).catch(() => {});
  if (!store.get('tutDone', 0)) setTimeout(showTutorial, 400);
  if (store.get('geo', false) && navigator.permissions) navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') startGeo(false); }).catch(() => {});
  setInterval(() => {
    clock();
    const n = nowJST();
    if (inTrip(n) && n.d !== S.day && !n.sim) return;
    if (S.tab === 'plan' && !S.edit && !document.activeElement.matches('input,textarea')) { const st = view.scrollTop; renderPlan(); view.scrollTop = st; }
  }, 60000);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
