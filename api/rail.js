// 열차 구간을 실제 선로 모양으로: OpenStreetMap 선로 데이터에서 두 지점 사이 최단 선로를 찾아요
// GET /api/rail?a=lat,lng&b=lat,lng&ln=노선 이름  →  { p: [[lat,lng],...] }  (못 찾으면 p: [])
// 같은 질문은 CDN에 1년 저장해서 OpenStreetMap 서버에 다시 묻지 않아요

const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

// 한국어 노선 이름 → OpenStreetMap(일본어) 노선 이름에 들어가는 글자
const JA = [
  ['히비야', '日比谷'], ['긴자', '銀座'], ['지요다', '千代田'], ['후쿠토신', '副都心'], ['마루노우치', '丸ノ内'], ['한조몬', '半蔵門'],
  ['난보쿠', '南北'], ['도자이', '東西'], ['유라쿠초', '有楽町'], ['아사쿠사선', '浅草線'], ['미타', '三田'], ['신주쿠선', '新宿線'],
  ['오에도', '大江戸'], ['야마노테', '山手'], ['게이힌토호쿠', '京浜東北'], ['사이쿄', '埼京'], ['소부', '総武'], ['도카이도', '東海道'],
  ['요코스카', '横須賀'], ['게이세이', '京成'], ['게이큐', '京急'], ['게이오', '京王'], ['오다큐', '小田急'], ['도큐', '東急'],
  ['세이부', '西武'], ['도부', '東武'], ['에노덴', '江ノ島電鉄'], ['쇼난 모노레일', '湘南モノレール'], ['유리카모메', 'ゆりかもめ'],
  ['린카이', 'りんかい'], ['미도스지', '御堂筋'], ['다니마치', '谷町'], ['요쓰바시', '四つ橋'], ['사카이스지', '堺筋'], ['나가호리', '長堀'],
  ['센니치마에', '千日前'], ['이마자토스지', '今里筋'], ['뉴트램', 'ニュートラム'], ['오사카 메트로 주오', '中央線'], ['메트로 주오', '中央線'],
  ['오사카 순환', '大阪環状'], ['순환선', '環状'], ['유메사키', 'ゆめ咲'], ['한신', '阪神'], ['한큐', '阪急'], ['게이한', '京阪'],
  ['긴테쓰', '近鉄'], ['난카이', '南海'], ['신칸센', '新幹線'], ['주오', '中央'], ['게이요', '京葉'], ['조반', '常磐'], ['나리타', '成田'],
  ['도덴', '都電'], ['아라카와', '荒川'], ['나고야', '名古屋'], ['히가시야마', '東山'], ['메이조', '名城'], ['가라스마', '烏丸'],
  ['도자이선', '東西線'], ['사가노', '嵯峨野'], ['나라선', '奈良線'], ['JR 교토', '京都線'], ['고베', '神戸'], ['산요', '山陽'],
];

const num = (s) => { const p = String(s || '').split(',').map(Number); return p.length === 2 && p.every(Number.isFinite) ? p : null; };
const R = 6371000, rad = Math.PI / 180;
function dist(a, b) {
  const x = (b[1] - a[1]) * rad * Math.cos(((a[0] + b[0]) / 2) * rad), y = (b[0] - a[0]) * rad;
  return Math.sqrt(x * x + y * y) * R;
}

// 작은 힙 (다익스트라용)
function Heap() { const h = []; return {
  push(c, v) { h.push([c, v]); let i = h.length - 1; while (i) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } },
  pop() { const top = h[0], end = h.pop(); if (h.length) { h[0] = end; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; },
  get size() { return h.length; },
}; }

// 점이 너무 많으면 줄여요 (15m보다 덜 휘는 점은 빼기)
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [s, e] = st.pop(); let md = 0, mi = -1;
    const A = pts[s], B = pts[e], L = dist(A, B);
    for (let i = s + 1; i < e; i++) {
      const a = dist(A, pts[i]), b = dist(pts[i], B);
      const d = L < 1 ? a : (() => { const p = (a + b + L) / 2; return (2 * Math.sqrt(Math.max(0, p * (p - a) * (p - b) * (p - L)))) / L; })();
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; st.push([s, mi], [mi, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

async function overpass(q) {
  let last;
  for (const u of OVERPASS) {
    try {
      const ac = new AbortController(), t = setTimeout(() => ac.abort(), 22000);
      const r = await fetch(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'dokodae-travel-app' }, signal: ac.signal });
      clearTimeout(t);
      if (r.ok) return await r.json();
      last = new Error('overpass ' + r.status);
    } catch (e) { last = e; }
  }
  throw last;
}

async function route(a, b, ln) {
  const D = dist(a, b);
  const rad_ = Math.round(Math.min(8000, Math.max(1500, D * 0.3)));
  const q = `[out:json][timeout:20];way["railway"~"^(rail|subway|light_rail|monorail|narrow_gauge|tram)$"](around:${rad_},${a[0]},${a[1]},${b[0]},${b[1]})->.w;.w out geom;rel(bw.w)["route"~"^(train|subway|light_rail|railway|monorail|tram)$"];out body;`;
  const data = await overpass(q);
  const ways = data.elements.filter((e) => e.type === 'way' && e.geometry && e.nodes);
  const rels = data.elements.filter((e) => e.type === 'relation');
  // 노선 이름이 맞는 선로는 싸게, 다른 선로는 비싸게 → 같은 노선을 따라가요
  const keys = JA.filter(([k]) => ln.includes(k)).map(([, j]) => j);
  const pref = new Set();
  if (keys.length) rels.forEach((r) => { const nm = [r.tags.name, r.tags['name:ja'], r.tags.ref].filter(Boolean).join(' '); if (keys.some((k) => nm.includes(k))) r.members.forEach((m) => { if (m.type === 'way') pref.add(m.ref); }); });
  const usePref = pref.size > 0;
  const pos = new Map(), adj = new Map();
  const edge = (u, v, w) => { if (!adj.has(u)) adj.set(u, []); adj.get(u).push([v, w]); };
  for (const w of ways) {
    const f = (usePref && !pref.has(w.id) ? 4 : 1) * (w.tags && w.tags.service ? 2 : 1);
    for (let i = 0; i < w.nodes.length; i++) {
      const id = w.nodes[i], g = w.geometry[i]; if (!g) continue;
      pos.set(id, [g.lat, g.lon]);
      if (i) { const p = w.nodes[i - 1], pg = w.geometry[i - 1]; if (!pg) continue; const c = dist([pg.lat, pg.lon], [g.lat, g.lon]) * f; edge(p, id, c); edge(id, p, c); }
    }
  }
  if (!pos.size) return [];
  // 출발점 근처(1.5km) 선로 점 어디서든 시작할 수 있게: 선로까지 거리는 2배로 쳐요
  const SNAP = Math.min(1500, Math.max(600, D * 0.4)), K = 2;
  const end = new Map();
  for (const [id, p] of pos) { const d = dist(p, b); if (d <= SNAP) end.set(id, d * K); }
  if (!end.size) return [];
  const best = new Map(), prev = new Map(), h = Heap();
  for (const [id, p] of pos) { const d = dist(p, a); if (d <= SNAP) { best.set(id, d * K); h.push(d * K, id); } }
  let goal = null, goalC = Infinity;
  while (h.size) {
    const [c, u] = h.pop();
    if (c >= goalC) break;
    if (c > (best.get(u) ?? Infinity)) continue;
    if (end.has(u) && c + end.get(u) < goalC) { goalC = c + end.get(u); goal = u; }
    for (const [v, w] of adj.get(u) || []) { const nc = c + w; if (nc < (best.get(v) ?? Infinity)) { best.set(v, nc); prev.set(v, u); h.push(nc, v); } }
  }
  if (goal == null) return [];
  const path = []; for (let u = goal; u != null; u = prev.get(u)) path.push(pos.get(u));
  path.reverse();
  let len = 0; for (let i = 1; i < path.length; i++) len += dist(path[i - 1], path[i]);
  if (len > D * 3 + 2000) return []; // 말도 안 되게 돌아가면 직선으로 둬요
  return simplify(path, 12).map((p) => [+p[0].toFixed(5), +p[1].toFixed(5)]);
}

module.exports = async function handler(req, res) {
  const a = num(req.query.a), b = num(req.query.b), ln = String(req.query.ln || '').slice(0, 60);
  if (!a || !b) return res.status(400).json({ error: 'a, b 좌표가 필요해요' });
  if (dist(a, b) > 150000) return res.status(200).json({ p: [] });
  try {
    const p = await route(a, b, ln);
    res.setHeader('Cache-Control', p.length ? 'public, s-maxage=31536000, max-age=86400' : 'public, s-maxage=3600');
    res.status(200).json({ p });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'rail_failed', p: [] });
  }
};
