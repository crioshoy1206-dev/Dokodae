// 서버 저장(Firebase): 로그인, 여행 불러오기·저장, 공유 링크.
// boot.js 가 Firebase 설정이 있을 때 vendor/firebase.js 다음에 불러요. 앱(app.js)은 window.DK_CLOUD 로만 써요.
(function () {
  'use strict';
  const F = window.FB;
  let app, auth, db, user = null;
  const st = { tripId: null, role: null, trip: null, lastJson: null, listeners: [], unsub: null, timer: null, pending: null };

  const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join(''); };
  const curKey = () => 'th.u.' + (user && user.uid) + '.cloudTrip';
  const getCur = () => { try { return localStorage.getItem(curKey()); } catch (e) { return null; } };
  const setCur = (id) => { try { id ? localStorage.setItem(curKey(), id) : localStorage.removeItem(curKey()); } catch (e) {} };
  const tripRef = (id) => F.doc(db, 'trips', id);
  const pick = (t) => ({ title: t.title || '일본 여행', start: t.start, end: t.end, stay: t.stay || '' });

  function init(cfg) {
    app = F.initializeApp(cfg);
    auth = F.getAuth(app);
    let cache;
    try { cache = F.persistentLocalCache(); } catch (e) { cache = F.memoryLocalCache(); }
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
    const s = await F.getDocs(q);
    return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0));
  }
  async function create(trip, edits) {
    const id = rand(20), json = JSON.stringify(edits || {});
    await F.setDoc(tripRef(id), { ...pick(trip), editsJson: json, owner: user.uid, memberIds: [user.uid],
      members: { [user.uid]: { name: user.displayName || user.email || '', role: 'owner' } }, editKey: rand(20), public: false,
      createdAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(), updatedBy: user.uid });
    setCur(id); return id;
  }
  async function join(id, key) {
    await F.updateDoc(tripRef(id), { memberIds: F.arrayUnion(user.uid), ['members.' + user.uid]: { name: user.displayName || user.email || '', role: 'edit' }, joinKey: key });
    setCur(id);
  }
  // 여행 하나를 열어요. 멤버면 편집, 보기 링크면 읽기만
  async function open(id) {
    const s = await F.getDoc(tripRef(id));
    if (!s.exists()) return null;
    const t = s.data();
    st.tripId = id; st.trip = t; st.lastJson = t.editsJson;
    st.role = user && (t.memberIds || []).includes(user.uid) ? (t.owner === user.uid ? 'owner' : 'edit') : 'view';
    if (st.role !== 'view') setCur(id);
    let edits = {}; try { edits = JSON.parse(t.editsJson || '{}'); } catch (e) {}
    // 다른 사람이 고치면 바로 반영해요
    st.unsub = F.onSnapshot(tripRef(id), (snap) => {
      if (!snap.exists() || snap.metadata.hasPendingWrites) return;
      const d = snap.data(); st.trip = d;
      if (d.editsJson === st.lastJson) return;
      st.lastJson = d.editsJson;
      let e = {}; try { e = JSON.parse(d.editsJson || '{}'); } catch (x) {}
      st.listeners.forEach((fn) => fn(pick(d), e));
    }, () => {});
    return { trip: pick(t), edits, role: st.role };
  }
  // 앱에서 일정을 고치면 잠깐 모았다가 저장해요
  function save(k, v) {
    if (!st.tripId || st.role === 'view') return;
    st.pending = { ...(st.pending || {}), ...(k === 'edits' ? { editsJson: JSON.stringify(v || {}) } : pick(v)) };
    clearTimeout(st.timer);
    st.timer = setTimeout(flush, 700);
  }
  function flush() {
    if (!st.pending) return Promise.resolve();
    const p = st.pending; st.pending = null;
    if (p.editsJson != null) st.lastJson = p.editsJson;
    return F.updateDoc(tripRef(st.tripId), { ...p, updatedAt: F.serverTimestamp(), updatedBy: user.uid }).catch((e) => console.warn('save', e));
  }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  async function shareLink(kind) {
    const base = location.origin + '/?t=' + st.tripId;
    if (kind === 'view') {
      if (!st.trip.public) { await F.updateDoc(tripRef(st.tripId), { public: true, updatedAt: F.serverTimestamp() }); st.trip.public = true; }
      return base;
    }
    return base + '&j=' + st.trip.editKey;
  }
  async function stopPublic() { await F.updateDoc(tripRef(st.tripId), { public: false }); st.trip.public = false; }
  async function remove() {
    if (st.role === 'owner') await F.deleteDoc(tripRef(st.tripId));
    setCur(null);
  }
  function close() { setCur(null); }
  function switchTo(id) { setCur(id); }

  window.DK_CLOUD = {
    init, signIn, signOut, idToken, list, create, join, open, save, flush, shareLink, stopPublic, remove, close, switchTo, getCur,
    onRemote: (fn) => st.listeners.push(fn),
    get user() { return user; }, get tripId() { return st.tripId; }, get role() { return st.role; },
    get readonly() { return st.role === 'view'; }, get trip() { return st.trip; }
  };
})();
