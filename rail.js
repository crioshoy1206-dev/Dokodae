// 열차 구간을 실제 선로 모양으로 그려요.
// 선로 데이터: 국토교통성 국토수치정보 철도 데이터(N02, 2024)를 1도 칸으로 나눈 /data/rail/{위도}_{경도}.json
// 두 지점 사이에서 같은 노선 선로를 따라가는 가장 짧은 길을 찾아요. 못 찾으면 빈 배열.
(function (G) {
  // 한국어 노선 이름 → 데이터의 '회사+노선 이름'에 들어가는 글자 (긴 이름이 맞으면 그 안의 짧은 이름은 안 써요)
  const JA = [
    ['게이세이 본선', '京成電鉄本線'], ['게이세이', '京成'], ['스카이라이너', '京成'], ['히비야', '日比谷'], ['긴자', '銀座'], ['지요다', '千代田'],
    ['후쿠토신', '副都心'], ['마루노우치', '丸ノ内'], ['한조몬', '半蔵門'], ['난보쿠', '南北線'], ['도자이', '東西線'], ['유라쿠초', '有楽町'],
    ['아사쿠사선', '浅草線'], ['미타선', '三田線'], ['신주쿠선', '新宿線'], ['오에도', '大江戸'], ['야마노테', '山手'], ['게이힌토호쿠', '京浜東北'],
    ['사이쿄', '埼京'], ['소부', '総武'], ['도카이도', '東海道'], ['요코스카', '横須賀'], ['게이큐', '京浜急行'], ['게이오', '京王'],
    ['오다큐', '小田急'], ['도큐', '東急'], ['세이부', '西武'], ['도부', '東武'], ['에노덴', '江ノ島電鉄'], ['쇼난 모노레일', '湘南モノレール'],
    ['유리카모메', 'ゆりかもめ'], ['린카이', 'りんかい'], ['미도스지', '御堂筋'], ['다니마치선', '谷町'], ['요쓰바시', '四つ橋'], ['사카이스지', '堺筋'],
    ['나가호리', '長堀'], ['센니치마에', '千日前'], ['이마자토스지', '今里筋'], ['뉴트램', '南港ポートタウン'], ['메트로 주오', '4号線(中央線)'],
    ['오사카 순환', '大阪環状'], ['순환선', '環状'], ['유메사키', '桜島線'], ['한신 난바', '阪神電気鉄道阪神なんば'], ['한신', '阪神電気鉄道'],
    ['한큐', '阪急'], ['게이한', '京阪'], ['긴테쓰', '近畿日本'], ['난카이', '南海'], ['신칸센', '新幹線'], ['주오', '中央'], ['게이요', '京葉'],
    ['조반', '常磐'], ['나리타선', '成田線'], ['도덴', '荒川線'], ['모노레일', 'モノレール'], ['간사이공항선', '関西空港線'], ['하루카', '関西空港線'],
    ['JR 교토선', '西日本旅客鉄道東海道'], ['JR 고베선', '西日本旅客鉄道東海道'], ['산요', '山陽'], ['나라선', '奈良線'], ['사가노', '山陰'],
    ['히가시야마', '東山線'], ['메이조', '名城線'], ['가라스마', '烏丸線'],
  ];
  const keysOf = (ln) => {
    const hit = JA.filter(([k]) => ln.includes(k));
    return hit.filter(([k]) => !hit.some(([k2]) => k2 !== k && k2.includes(k))).map(([, j]) => j);
  };
  const rad = Math.PI / 180;
  const dist = (a, b) => { const x = (b[1] - a[1]) * rad * Math.cos(((a[0] + b[0]) / 2) * rad), y = (b[0] - a[0]) * rad; return Math.sqrt(x * x + y * y) * 6371000; };
  function dec(s) {
    const out = []; let i = 0, la = 0, lo = 0;
    while (i < s.length) {
      for (const k of [0, 1]) {
        let r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32);
        const v = r & 1 ? ~(r >> 1) : r >> 1; if (k) lo += v; else la += v;
      }
      out.push([la / 1e5, lo / 1e5]);
    }
    return out;
  }
  const TILE = {};
  let getJSON = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const tile = (la, lo) => { const k = la + '_' + lo; return TILE[k] || (TILE[k] = getJSON('/data/rail/' + k + '.json').then((t) => (t ? t.f.map((f) => ({ name: t.o[f[0]] + t.n[f[1]], p: dec(f[2]) })) : []))); };

  function Heap() { const h = []; return {
    push(c, v) { h.push([c, v]); let i = h.length - 1; while (i) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } },
    pop() { const t = h[0], e = h.pop(); if (h.length) { h[0] = e; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return t; },
    get size() { return h.length; },
  }; }

  async function route(a, b, ln) {
    const D = dist(a, b); if (D > 300000 || D < 50) return [];
    const pad = Math.max(0.02, D / 111000 * 0.25);
    const s = Math.min(a[0], b[0]) - pad, n = Math.max(a[0], b[0]) + pad, w = Math.min(a[1], b[1]) - pad, e = Math.max(a[1], b[1]) + pad;
    const jobs = [];
    for (let la = Math.floor(s); la <= Math.floor(n); la++) for (let lo = Math.floor(w); lo <= Math.floor(e); lo++) jobs.push(tile(la, lo));
    const seen = new Set(), feats = [];
    (await Promise.all(jobs)).flat().forEach((f) => { const k = f.name + f.p[0] + f.p[f.p.length - 1] + f.p.length; if (seen.has(k)) return; seen.add(k); if (f.p.some((q) => q[0] >= s && q[0] <= n && q[1] >= w && q[1] <= e)) feats.push(f); });
    if (!feats.length) return [];
    const keys = keysOf(ln || ''), pref = (f) => keys.some((k) => f.name.includes(k));
    const usePref = keys.length && feats.some(pref);
    const id = (q) => q[0].toFixed(5) + ',' + q[1].toFixed(5);
    const pos = new Map(), adj = new Map(), onPref = new Set();
    const edge = (u, v, c) => { let l = adj.get(u); if (!l) adj.set(u, (l = [])); l.push([v, c]); };
    feats.forEach((f) => {
      const fac = usePref && !pref(f) ? 4 : 1;
      f.p.forEach((q, i) => {
        const u = id(q); pos.set(u, q); if (fac === 1 && usePref) onPref.add(u);
        if (i) { const v = id(f.p[i - 1]), c = dist(f.p[i - 1], q) * fac; edge(u, v, c); edge(v, u, c); }
      });
    });
    // 일정 위치에서 선로까지: 근처(최대 1.5km) 어느 점에서든 탈 수 있고, 선로까지 거리는 2배로 쳐요
    const SNAP = Math.min(1500, Math.max(700, D * 0.4)), K = 2;
    const near = (x) => { const m = new Map(); for (const [u, q] of pos) { if (usePref && !onPref.has(u)) continue; const d = dist(q, x); if (d <= SNAP) m.set(u, d * K); } return m; };
    const st = near(a), en = near(b); if (!st.size || !en.size) return [];
    const best = new Map(), prev = new Map(), h = Heap();
    st.forEach((c, u) => { best.set(u, c); h.push(c, u); });
    let goal = null, gc = Infinity;
    while (h.size) {
      const [c, u] = h.pop(); if (c >= gc) break; if (c > best.get(u)) continue;
      if (en.has(u) && c + en.get(u) < gc) { gc = c + en.get(u); goal = u; }
      for (const [v, w2] of adj.get(u) || []) { const nc = c + w2; if (nc < (best.get(v) ?? Infinity)) { best.set(v, nc); prev.set(v, u); h.push(nc, v); } }
    }
    if (goal == null) return [];
    const path = []; for (let u = goal; u != null; u = prev.get(u)) path.push(pos.get(u));
    path.reverse();
    let len = 0; for (let i = 1; i < path.length; i++) len += dist(path[i - 1], path[i]);
    return len > D * 3 + 2000 ? [] : path;
  }
  const api = { route, keysOf, setFetch: (f) => { getJSON = f; } };
  if (typeof module !== 'undefined') module.exports = api; else G.DKRail = api;
})(typeof window !== 'undefined' ? window : globalThis);
