// 서버 저장(Firebase): 로그인, 여행 불러오기·저장, 공유 링크.
// boot.js 가 Firebase 설정이 있을 때 vendor/firebase.js 다음에 불러요. 앱(app.js)은 window.DK_CLOUD 로만 써요.
//
// 저장 구조
//  trips/{id}            여행 이름·날짜, 일정(editsJson), 멤버. 보기 링크가 켜져 있으면 누구나 읽을 수 있어요.
//  trips/{id}/priv/main  편집 초대 키(editKey)와 경비(payJson). 멤버만 읽고 써요.
//
// 함께 편집: 저장할 때 서버의 최신 내용을 읽어서 내가 고친 부분만 합쳐 써요(트랜잭션).
// 그래서 두 사람이 동시에 고치거나 오프라인에서 각자 고쳐도 서로의 내용이 지워지지 않아요.
// 아직 서버에 못 올린 변경은 이 기기에 남겨 두었다가, 연결되면 다시 올려요.
(function () {
  'use strict';
  const F = window.FB;
  let app, auth, db, user = null;
  const st = {
    tripId: null, role: null, trip: null, priv: null, privOk: true,
    base: null,     // 서버에서 마지막으로 확인한 일정(경비 포함)
    mine: null,     // 아직 서버에 못 올린 내 일정(경비 포함). 없으면 null
    view: null,     // 앱이 지금 보고 있는 일정
    force: false, busy: false, timer: null, retry: 0, retryT: null, err: null,
    listeners: [], status: [], unsub: [], metaPending: null
  };

  const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join(''); };
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const curKey = () => 'th.u.' + (user && user.uid) + '.cloudTrip';
  const hideKey = () => 'th.u.' + (user && user.uid) + '.hidden';
  const getCur = () => { try { return localStorage.getItem(curKey()); } catch (e) { return null; } };
  const setCur = (id) => { try { id ? localStorage.setItem(curKey(), id) : localStorage.removeItem(curKey()); } catch (e) {} };
  const hidden = () => lsGet(hideKey()) || [];
  const setHidden = (id, on) => { const h = hidden().filter((x) => x !== id); if (on) h.push(id); lsSet(hideKey(), h.slice(-50)); };
  const pendKey = (id) => 'th.cp.' + id;     // 아직 못 올린 변경
  const stashKey = (id) => 'th.cm.' + id;    // 오프라인에서 열 때 쓰는 여행 정보(역할 등)
  const tripRef = (id) => F.doc(db, 'trips', id);
  const privRef = (id) => F.doc(db, 'trips', id, 'priv', 'main');
  const pick = (t) => ({ title: t.title || '일본 여행', start: t.start, end: t.end, stay: t.stay || '' });
  const parse = (s) => { try { return JSON.parse(s || '{}') || {}; } catch (e) { return {}; } };
  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
  const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(Object.assign(new Error('timeout'), { code: 'unavailable' })), ms))]);

  // ---------- 합치기 (3-way merge) ----------
  // base: 마지막으로 같이 본 내용, mine: 내가 고친 것, theirs: 지금 서버 내용
  const canon = (v) => (v === undefined ? 'u' : JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, kk) => ((o[kk] = x[kk]), o), {}) : x)));
  const same = (a, b) => canon(a) === canon(b);
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const idList = (a) => Array.isArray(a) && a.every((x) => isObj(x) && x.id != null);
  function merge3(base, mine, theirs) {
    if (same(mine, base)) return theirs;
    if (same(theirs, base) || same(mine, theirs)) return mine;
    if (isObj(mine) && isObj(theirs)) {
      const b = isObj(base) ? base : {}, out = {};
      new Set([...Object.keys(mine), ...Object.keys(theirs)]).forEach((k) => {
        const v = merge3(b[k], mine[k], theirs[k]); if (v !== undefined) out[k] = v;
      });
      return out;
    }
    if (Array.isArray(mine) && Array.isArray(theirs)) {
      const b = Array.isArray(base) ? base : [];
      if (idList(mine) && idList(theirs) && (idList(b) || !b.length)) {
        const B = new Map(b.map((x) => [String(x.id), x])), M = new Map(mine.map((x) => [String(x.id), x])), out = [];
        theirs.forEach((t) => {
          const k = String(t.id);
          if (M.has(k)) out.push(merge3(B.get(k), M.get(k), t));
          else if (!B.has(k)) out.push(t);                       // 상대가 새로 넣은 것
          else if (!same(B.get(k), t)) out.push(t);              // 내가 지웠지만 상대가 고친 것은 남겨요
        });
        mine.forEach((m) => { const k = String(m.id); if (!B.has(k) && !theirs.some((t) => String(t.id) === k)) out.push(m); });
        return out;
      }
      const bs = b.map(canon), ms = mine.map(canon), ts = theirs.map(canon);
      const out = theirs.filter((t, i) => !(bs.includes(ts[i]) && !ms.includes(ts[i])));
      mine.forEach((m, i) => { if (!bs.includes(ms[i]) && !ts.includes(ms[i])) out.push(m); });
      return out;
    }
    return mine; // 같은 칸을 둘 다 고쳤으면 내 것
  }

  // 서버 문서 두 개를 앱이 쓰는 일정 하나로 합쳐요
  function combine(main, priv) {
    const e = parse(main && main.editsJson);
    if (priv && priv.payJson != null) { const p = parse(priv.payJson); if (Object.keys(p).length) e._pay = p; else delete e._pay; }
    return e;
  }

  function init(cfg) {
    app = F.initializeApp(cfg);
    auth = F.getAuth(app);
    let cache;
    // 탭이나 PWA 창을 여러 개 열어도 오프라인 사본을 같이 써요
    try { cache = F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }); } catch (e) {
      try { cache = F.persistentLocalCache(); } catch (x) { cache = F.memoryLocalCache(); }
    }
    db = F.initializeFirestore(app, { localCache: cache });
    if (window.DK_EMU) { F.connectAuthEmulator(auth, window.DK_EMU.auth, { disableWarnings: true }); F.connectFirestoreEmulator(db, '127.0.0.1', window.DK_EMU.fs); }
    return new Promise((ok) => { const off = F.onAuthStateChanged(auth, (u) => { user = u; off(); ok(u); }); });
  }
  const signIn = () => F.signInWithPopup(auth, new F.GoogleAuthProvider()).then((r) => (user = r.user));
  const signOut = () => F.signOut(auth).catch(() => {});
  const idToken = () => (user ? user.getIdToken() : Promise.resolve(null));

  async function list() {
    if (!user) return [];
    const q = F.query(F.collection(db, 'trips'), F.where('memberIds', 'array-contains', user.uid));
    const s = await timeout(F.getDocs(q), 8000);
    const hid = hidden();
    return s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((t) => !hid.includes(t.id))
      .sort((a, b) => ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0));
  }
  async function create(trip, edits) {
    const id = rand(20), e = clone(edits || {}), pay = e._pay; delete e._pay;
    await F.setDoc(tripRef(id), { ...pick(trip), editsJson: JSON.stringify(e), owner: user.uid, memberIds: [user.uid],
      members: { [user.uid]: { name: user.displayName || user.email || '', role: 'owner' } }, public: false,
      createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(), updatedBy: user.uid });
    await F.setDoc(privRef(id), { editKey: rand(20), payJson: JSON.stringify(pay || {}) });
    setCur(id); setHidden(id, false); return id;
  }
  // 편집 초대 링크로 들어와요. 이미 멤버면 아무것도 바꾸지 않아요.
  async function join(id, key) {
    const s = await timeout(F.getDoc(tripRef(id)), 8000).catch((e) => { if (e && e.code === 'permission-denied') return null; throw e; });
    if (s && !s.exists()) throw Object.assign(new Error('not-found'), { code: 'not-found' });
    if (s && (s.data().memberIds || []).includes(user.uid)) { setCur(id); setHidden(id, false); return 'member'; }
    await F.updateDoc(tripRef(id), { memberIds: F.arrayUnion(user.uid), ['members.' + user.uid]: { name: user.displayName || user.email || '', role: 'edit' }, joinKey: key });
    setCur(id); setHidden(id, false);
    return 'joined';
  }

  function emit(view, info) { st.view = view; st.listeners.forEach((fn) => { try { fn(pick(st.trip || {}), clone(view), info || {}); } catch (e) { console.warn(e); } }); }
  function emitStatus() { st.status.forEach((fn) => { try { fn(); } catch (e) {} }); }
  function persist() { if (st.tripId) lsSet(pendKey(st.tripId), st.mine || st.force ? { base: st.base, mine: st.mine || st.base } : null); }
  function stash() {
    if (!st.tripId || !st.trip) return;
    const t = st.trip;
    lsSet(stashKey(st.tripId), { role: st.role, trip: { ...pick(t), owner: t.owner, memberIds: t.memberIds, members: t.members, public: !!t.public }, privOk: st.privOk });
  }

  // 여행 하나를 열어요. 멤버면 편집, 보기 링크면 읽기만
  async function open(id) {
    let main = null, fromStash = false;
    try {
      const s = await timeout(F.getDoc(tripRef(id)), 8000);
      if (!s.exists()) return null;
      main = s.data();
    } catch (e) {
      if (e && e.code === 'permission-denied') throw e;
      // 오프라인: 이 기기의 사본으로 열어요
      try { const c = await F.getDocFromCache(tripRef(id)); if (c.exists()) main = c.data(); } catch (x) {}
      if (!main) { const sv = lsGet(stashKey(id)); if (!sv) throw e; main = sv.trip; fromStash = true; }
    }
    await detach();
    st.tripId = id; st.trip = main; st.err = null; st.retry = 0;
    const sv = lsGet(stashKey(id));
    const member = user && (main.memberIds || []).includes(user.uid);
    st.role = member ? (main.owner === user.uid ? 'owner' : 'edit') : fromStash && sv ? sv.role : 'view';
    st.priv = null; st.privOk = sv && sv.privOk === false ? false : true;
    if (st.role !== 'view') {
      setCur(id); setHidden(id, false);
      try { const p = await timeout(F.getDoc(privRef(id)), 6000); st.priv = p.exists() ? p.data() : null; st.privOk = true; }
      catch (e) {
        if (e && e.code === 'permission-denied') st.privOk = false; // 아직 새 보안 규칙이 아니에요 (예전 방식으로 저장)
        else { try { const c = await F.getDocFromCache(privRef(id)); st.priv = c.exists() ? c.data() : null; } catch (x) {} }
      }
    }
    const theirs = combine(main, st.priv);
    const pend = lsGet(pendKey(id));
    if (pend && st.role !== 'view') { st.base = pend.base; st.mine = merge3(pend.base, pend.mine, theirs); st.base = theirs; if (same(st.mine, theirs)) st.mine = null; }
    else { st.base = theirs; st.mine = null; }
    st.view = st.mine || st.base;
    stash();
    // 예전 방식 여행(편집 키가 공개 문서에 있음)이면 비공개 문서로 옮겨요
    if (st.role !== 'view' && st.privOk && (main.editKey || !st.priv || (st.priv && parse(main.editsJson)._pay))) st.force = true;
    persist();
    listen(id);
    if (st.mine || st.force) soon(300);
    return { trip: pick(main), edits: clone(st.view), role: st.role };
  }
  // 다른 사람이 고치면 바로 반영해요
  function listen(id) {
    // 여행에서 내보내지면 더는 읽을 수 없어요
    const onErr = (e) => { if (st.tripId === id && e && e.code === 'permission-denied' && st.role !== 'view') gone(true); };
    st.unsub.push(F.onSnapshot(tripRef(id), (snap) => {
      if (st.tripId !== id) return;
      if (!snap.exists()) { if (!snap.metadata.fromCache) gone(); return; }
      if (st.role !== 'view' && !snap.metadata.fromCache && !(snap.data().memberIds || []).includes(user.uid)) return gone(true);
      st.trip = snap.data(); stash(); remote();
    }, onErr));
    if (st.role !== 'view' && st.privOk) st.unsub.push(F.onSnapshot(privRef(id), (snap) => {
      if (st.tripId !== id) return;
      st.priv = snap.exists() ? snap.data() : null; remote();
    }, () => {}));
  }
  function remote() {
    const theirs = combine(st.trip, st.priv);
    if (same(theirs, st.base)) return;
    const prev = st.view;
    if (st.mine) { st.mine = merge3(st.base, st.mine, theirs); st.base = theirs; if (same(st.mine, theirs)) st.mine = null; }
    else st.base = theirs;
    persist();
    const view = st.mine || st.base;
    if (same(view, prev)) return;
    emit(view, { pay: !same((prev || {})._pay, view._pay), plan: !same({ ...(prev || {}), _pay: 0 }, { ...view, _pay: 0 }) });
  }
  function gone(kicked) {
    const id = st.tripId;
    if (!id) return;
    st.unsub.forEach((u) => u()); st.unsub = [];
    clearTimeout(st.timer); clearTimeout(st.retryT); st.mine = null; st.force = false;
    lsSet(pendKey(id), null); lsSet(stashKey(id), null);
    if (getCur() === id) setCur(null);
    st.listeners.forEach((fn) => { try { fn(null, null, { gone: true, kicked: !!kicked }); } catch (e) {} });
  }

  // 앱에서 일정을 고치면 잠깐 모았다가 저장해요
  function save(k, v) {
    if (!st.tripId || st.role === 'view') return;
    if (k === 'edits') { st.mine = clone(v || {}); st.view = st.mine; persist(); }
    else st.metaPending = { ...(st.metaPending || {}), ...pick(v) };
    soon(700);
  }
  function soon(ms) { clearTimeout(st.timer); st.timer = setTimeout(flush, ms); emitStatus(); }
  async function flush() {
    clearTimeout(st.timer);
    if (!st.tripId || st.role === 'view') return;
    const id = st.tripId;
    if (st.metaPending) {
      const m = st.metaPending; st.metaPending = null;
      F.updateDoc(tripRef(id), { ...m, updatedAt: F.serverTimestamp(), updatedBy: user.uid }).catch((e) => console.warn('meta', e));
    }
    if (!st.mine && !st.force) return;
    if (st.busy) { st.again = true; return; }
    if (!navigator.onLine) { st.err = 'offline'; emitStatus(); return; }
    st.busy = true; st.again = false;
    const sent = clone(st.mine || st.view || st.base), base = clone(st.base), privOk = st.privOk, owner = st.role === 'owner';
    try {
      const merged = await timeout(F.runTransaction(db, async (tx) => {
        const ms = await tx.get(tripRef(id));
        if (!ms.exists()) throw Object.assign(new Error('gone'), { code: 'gone' });
        const main = ms.data();
        const ps = privOk ? await tx.get(privRef(id)) : null;
        const priv = ps && ps.exists() ? ps.data() : null;
        const out = merge3(base, sent, combine(main, priv));
        const body = { ...out };
        const upd = { updatedAt: F.serverTimestamp(), updatedBy: user.uid };
        if (privOk) {
          const pay = body._pay; delete body._pay;
          const pv = { payJson: JSON.stringify(pay || {}) };
          if (!priv) pv.editKey = main.editKey || rand(20);
          tx.set(privRef(id), pv, { merge: true });
          if (owner && main.editKey) upd.editKey = F.deleteField();
        }
        upd.editsJson = JSON.stringify(body);
        tx.update(tripRef(id), upd);
        return out;
      }), 20000);
      if (st.tripId !== id) return;
      st.force = false; st.err = null; st.retry = 0;
      const prevView = st.view;
      // 저장하는 동안 더 고친 게 있으면 그것도 이어서 올려요
      if (st.mine && !same(st.mine, sent)) { st.mine = merge3(sent, st.mine, merged); st.base = merged; if (same(st.mine, merged)) st.mine = null; }
      else { st.base = merged; st.mine = null; }
      persist();
      const view = st.mine || st.base;
      if (!same(view, prevView)) emit(view, { pay: !same((prevView || {})._pay, view._pay), plan: !same({ ...(prevView || {}), _pay: 0 }, { ...view, _pay: 0 }) });
      if (st.mine || st.again) soon(300);
    } catch (e) {
      if (st.tripId !== id) return;
      const c = (e && e.code) || '';
      if (c === 'gone' || c === 'not-found') gone();
      else if (c === 'permission-denied') { st.err = 'denied'; console.warn('save', e); }
      else { // 연결 문제: 조금 뒤에 다시 올려요
        st.err = navigator.onLine ? 'retry' : 'offline';
        st.retry = Math.min(st.retry + 1, 6);
        clearTimeout(st.retryT); st.retryT = setTimeout(flush, [2, 4, 8, 15, 30, 60][st.retry - 1] * 1000);
      }
    } finally { st.busy = false; emitStatus(); }
  }
  window.addEventListener('online', () => { st.retry = 0; soon(500); });
  window.addEventListener('pagehide', () => { flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  async function shareLink(kind) {
    const base = location.origin + '/?t=' + st.tripId;
    if (kind === 'view') {
      if (!st.trip.public) { await F.updateDoc(tripRef(st.tripId), { public: true, updatedAt: F.serverTimestamp() }); st.trip.public = true; }
      return base;
    }
    let key = (st.priv && st.priv.editKey) || st.trip.editKey;
    if (!key && st.privOk) { const p = await F.getDoc(privRef(st.tripId)); key = p.exists() && p.data().editKey; }
    if (!key) throw new Error('no-key');
    return base + '&j=' + key;
  }
  // 만든 사람만: 함께 편집하던 사람을 내보내고, 예전 초대 링크로 다시 못 들어오게 초대 키를 바꿔요
  async function kick(uid) {
    if (st.role !== 'owner' || !uid || uid === user.uid) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
    const id = st.tripId;
    await F.updateDoc(tripRef(id), { memberIds: F.arrayRemove(uid), ['members.' + uid]: F.deleteField(), updatedAt: F.serverTimestamp(), updatedBy: user.uid });
    if (st.privOk) await F.setDoc(privRef(id), { editKey: rand(20) }, { merge: true });
  }
  async function stopPublic() { await F.updateDoc(tripRef(st.tripId), { public: false }); st.trip.public = false; }
  async function remove() {
    const id = st.tripId;
    if (st.role === 'owner') {
      clearTimeout(st.timer); st.mine = null; st.force = false;
      st.unsub.forEach((u) => u()); st.unsub = [];
      if (st.privOk) await F.deleteDoc(privRef(id)).catch(() => {});
      await F.deleteDoc(tripRef(id));
      lsSet(pendKey(id), null); lsSet(stashKey(id), null);
    }
    close();
  }
  // 지금 열린 여행에서 손을 떼요: 남은 저장을 마치고, 실시간 반영을 끊어요
  async function detach() {
    clearTimeout(st.timer); clearTimeout(st.retryT);
    if (st.tripId && (st.mine || st.metaPending)) await timeout(flush(), 4000).catch(() => {});
    st.unsub.forEach((u) => u()); st.unsub = [];
    st.tripId = null; st.role = null; st.trip = null; st.priv = null; st.base = null; st.mine = null; st.view = null; st.force = false; st.err = null;
  }
  // 이 기기에서 여행을 닫아요. 함께 편집하는 여행이면 목록에서도 숨겨요 (초대 링크로 다시 열 수 있어요)
  function close(hide) { const id = st.tripId; setCur(null); if (hide && id) setHidden(id, true); detach(); }
  function switchTo(id) { setCur(id); }

  window.DK_CLOUD = {
    init, signIn, signOut, idToken, list, create, join, open, save, flush, shareLink, stopPublic, kick, remove, close, switchTo, getCur, merge3,
    onRemote: (fn) => st.listeners.push(fn),
    onStatus: (fn) => st.status.push(fn),
    get user() { return user; }, get tripId() { return st.tripId; }, get role() { return st.role; },
    get readonly() { return st.role === 'view'; }, get trip() { return st.trip; },
    // 아직 서버에 못 올린 변경이 있는지, 왜 못 올렸는지 ('offline' | 'retry' | 'denied' | null)
    get pending() { return !!(st.mine || st.busy); }, get error() { return st.err; }
  };
})();
