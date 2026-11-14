'use strict';

/*
  LIVE MEETING CODES
  - "Share live" gives you a 6-character code. Anyone who enters it sees your position moving on their map.
  - "Follow" lets you enter a friend's code and see them move, with a route to them.
  Sharing stops when you tap Stop, close the page, or after one hour (you can restart the timer).

  How it works: positions are passed through a small Firebase Realtime Database (free plan). The Firebase
  library is only downloaded when someone starts or follows a code, so normal visitors never load it.
  Settings live in js/firebase-config.js. Database rules are in the setup guide.
*/
(function () {
  const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';        // no 0/O or 1/I/L, so codes are easy to read out loud
  const CODE_LENGTH = 6;
  const SHARE_MS = 60 * 60 * 1000;                                  // one hour per timer
  const MIN_PUBLISH_MS = 4000;                                      // at most one update every 4 s while moving
  const HEARTBEAT_MS = 20000;                                       // ...and at least one every 20 s so friends know you are still there
  const MIN_MOVE_METRES = 3;
  const STALE_MS = 45000;                                           // no update for this long = "signal may be lost"
  const SDK_BASE = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const SDK_FILES = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-database-compat.js'];

  const $ = id => document.getElementById(id);
  const api = () => window.YCTMap;
  if (!$('meeting-start') || !$('meeting-join')) return;            // older page without the meeting panel

  let uid = null, db = null, readyPromise = null, serverOffset = 0, connections = 0;
  // sharing
  let hostRef = null, hostCode = '', hostName = 'Friend', hostExpires = 0, hostTimer = null, hostViewers = 0;
  let lastPublish = { at: 0, lat: null, lng: null }, waitingForFix = false, starting = false;
  let connectedRef = null, connectedHandler = null, viewersRef = null, viewersHandler = null, wakeLock = null;
  // following
  let followRef = null, followHandler = null, followConnectedRef = null, followConnectedHandler = null, sessionSeen = false, followCode = '', followName = 'Friend', followUpdated = 0, followTimer = null, followRouted = false, following = false;

  const serverNow = () => Date.now() + serverOffset;
  const configured = () => {
    const c = window.YCT_FIREBASE;
    return !!(c && c.apiKey && c.databaseURL && !/^YOUR_/.test(c.apiKey) && !/^YOUR_/.test(c.databaseURL));
  };

  // ---- small helpers ----------------------------------------------------------------
  function setText(id, text, warning) {
    const element = $(id);
    if (!element) return;
    element.textContent = text;
    element.classList.toggle('person-warning', !!warning);
  }
  const setHostStatus = (text, warning) => setText('meeting-host-status', text, warning);
  const setJoinStatus = (text, warning) => setText('meeting-join-status', text, warning);

  function makeCode() {
    let code = '';
    const limit = 256 - (256 % CODE_ALPHABET.length);               // reject biased bytes so every character is equally likely
    while (code.length < CODE_LENGTH) {
      const bytes = new Uint8Array(16);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
      else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      for (const byte of bytes) { if (byte < limit && code.length < CODE_LENGTH) code += CODE_ALPHABET[byte % CODE_ALPHABET.length]; }
    }
    return code;
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  function friendlyError(error) {
    const text = String((error && (error.code || error.message)) || error);
    if (/permission[_ ]denied/i.test(text)) return 'The live-code service refused the request. Its database rules or anonymous sign-in may not be set up yet.';
    if (/operation-not-allowed|admin-restricted/i.test(text)) return 'Anonymous sign-in is not switched on in Firebase yet.';
    if (/network|failed to load|offline/i.test(text)) return 'Could not reach the live-code service. Check your internet connection and try again.';
    return 'Something went wrong with the live-code service. Please try again.';
  }

  // ---- Firebase (loaded only when needed) ----------------------------------------------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src; script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error('failed to load ' + src));
      document.head.appendChild(script);
    });
  }

  function ready() {
    if (!readyPromise) {
      readyPromise = (async () => {
        if (!window.firebase) { for (const file of SDK_FILES) await loadScript(SDK_BASE + file); }
        if (!window.firebase.apps.length) window.firebase.initializeApp(window.YCT_FIREBASE);
        const credential = await window.firebase.auth().signInAnonymously();
        uid = credential.user.uid;
        db = window.firebase.database();
        db.goOnline();
        const offset = await db.ref('.info/serverTimeOffset').once('value');
        serverOffset = Number(offset.val()) || 0;
      })().catch(error => { readyPromise = null; throw error; });
    }
    return readyPromise.then(() => { connections += 1; if (db) db.goOnline(); });
  }

  function release() {                                              // give the connection slot back when nobody is sharing or following
    connections = Math.max(0, connections - 1);
    if (connections === 0 && db) { try { db.goOffline(); } catch (error) { /* ignore */ } }
  }

  // ---- sharing --------------------------------------------------------------------------
  async function keepScreenOn() {
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (error) { /* optional nicety */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && hostRef) keepScreenOn(); });

  function showHost(visible) {
    $('meeting-host').hidden = !visible;
    $('meeting-start').hidden = visible;
  }

  function renderHost() {
    if (!hostRef) return;
    const remaining = hostExpires - serverNow();
    if (remaining <= 0) { stopSharing('Sharing ended: the one-hour timer ran out.'); return; }
    const watching = hostViewers === 0 ? 'Nobody has joined yet.' : `${hostViewers} ${hostViewers === 1 ? 'person is' : 'people are'} following you.`;
    setHostStatus(`Sharing live as ${hostName}. Ends in ${formatClock(remaining)}. ${watching}`, false);
  }

  function publish(fix) {
    if (!hostRef) return;
    lastPublish = { at: Date.now(), lat: fix.lat, lng: fix.lng };
    const update = {
      lat: fix.lat, lng: fix.lng, accuracy: Math.round(fix.accuracy || 0),
      heading: Number.isFinite(fix.heading) ? Math.round(((fix.heading % 360) + 360) % 360) : null,
      updated: window.firebase.database.ServerValue.TIMESTAMP
    };
    hostRef.update(update).catch(() => { /* a missed update is fine; the next one follows */ });
  }

  function onFix(fix) {
    if (waitingForFix && fix && fix.usable) { waitingForFix = false; startSharing(); return; }
    if (!hostRef || !fix || !fix.usable) return;
    const elapsed = Date.now() - lastPublish.at;
    const moved = lastPublish.lat === null ? Infinity : api().distance(lastPublish, fix);
    if ((elapsed >= MIN_PUBLISH_MS && moved >= MIN_MOVE_METRES) || elapsed >= HEARTBEAT_MS) publish(fix);
  }

  async function startSharing() {
    if (starting || hostRef) return;
    if (!configured()) { showSetupNote(); return; }
    const fix = api().getFix();
    if (!fix || !fix.usable) {
      api().startTracking();
      waitingForFix = true;
      setHostStatus('Finding your position first. Allow location access. Sharing starts automatically as soon as your position is accurate enough.', true);
      return;
    }
    starting = true;
    $('meeting-start').disabled = true;
    hostName = ($('meeting-name').value || '').trim().slice(0, 30) || 'Friend';
    let acquired = false;
    try {
      await ready();
      acquired = true;
      let claimed = null;
      for (let attempt = 0; attempt < 6 && !claimed; attempt++) {     // a clash with someone else's code is refused, so just pick another
        const code = makeCode();
        const ref = db.ref('sessions/' + code);
        const data = { owner: uid, name: hostName, lat: fix.lat, lng: fix.lng, accuracy: Math.round(fix.accuracy || 0),
          updated: window.firebase.database.ServerValue.TIMESTAMP, expires: serverNow() + SHARE_MS };
        if (Number.isFinite(fix.heading)) data.heading = Math.round(fix.heading);
        try { await ref.set(data); claimed = { code, ref }; } catch (error) { if (!/permission[_ ]denied/i.test(String(error.code || error.message))) throw error; }
      }
      if (!claimed) throw Object.assign(new Error('PERMISSION_DENIED'), { code: 'PERMISSION_DENIED' });

      hostRef = claimed.ref; hostCode = claimed.code; hostExpires = serverNow() + SHARE_MS;
      lastPublish = { at: Date.now(), lat: fix.lat, lng: fix.lng };
      hostRef.onDisconnect().remove();                                // closing the page ends sharing, server-side
      connectedRef = db.ref('.info/connected');
      connectedHandler = snapshot => {                                // after a dropped connection, put the session back
        if (snapshot.val() === true && hostRef) {
          const here = api().getFix();
          if (here) hostRef.update({ owner: uid, name: hostName, lat: here.lat, lng: here.lng, accuracy: Math.round(here.accuracy || 0),
            updated: window.firebase.database.ServerValue.TIMESTAMP, expires: hostExpires }).then(() => hostRef && hostRef.onDisconnect().remove()).catch(() => {});
        }
      };
      connectedRef.on('value', connectedHandler);
      viewersRef = db.ref('sessions/' + hostCode + '/viewers');
      viewersHandler = snapshot => { hostViewers = snapshot.numChildren(); renderHost(); };
      viewersRef.on('value', viewersHandler);

      $('meeting-code').textContent = hostCode;
      showHost(true);
      renderHost();
      hostTimer = window.setInterval(renderHost, 1000);
      keepScreenOn();
    } catch (error) {
      hostRef = null;
      setHostStatus(friendlyError(error), true);
      if (acquired) release();
    } finally {
      starting = false;
      $('meeting-start').disabled = false;
    }
  }

  function stopSharing(message) {
    waitingForFix = false;
    if (!hostRef) { setHostStatus(message || '', false); return; }
    const ref = hostRef;
    hostRef = null;
    window.clearInterval(hostTimer); hostTimer = null;
    if (connectedRef && connectedHandler) connectedRef.off('value', connectedHandler);
    if (viewersRef && viewersHandler) viewersRef.off('value', viewersHandler);
    connectedRef = viewersRef = connectedHandler = viewersHandler = null;
    try { ref.onDisconnect().cancel(); } catch (error) { /* ignore */ }
    ref.remove().catch(() => {});
    if (wakeLock) { try { wakeLock.release(); } catch (error) { /* ignore */ } wakeLock = null; }
    hostViewers = 0; hostCode = '';
    showHost(false);
    setHostStatus(message || 'Sharing stopped. Your position is no longer visible to anyone.', false);
    release();
  }

  function copyText(text, doneMessage) {
    const fallback = () => setHostStatus(`Copy this: ${text}`, false);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => setHostStatus(doneMessage, false), fallback);
    else fallback();
  }

  // ---- following ------------------------------------------------------------------------
  function renderFollow() {
    if (!following) return;
    const age = serverNow() - followUpdated;
    if (!followUpdated) return;
    if (age > STALE_MS) setJoinStatus(`Following ${followName}. Last update ${formatClock(age)} ago. Their signal may be weak or their screen may be off.`, true);
    else setJoinStatus(`Following ${followName}. Live, updated ${Math.max(0, Math.round(age / 1000))} s ago.`, false);
  }

  function stopFollowing(options = {}) {
    if (!following) return;
    following = false;                                               // set first, so clearing the person does not loop back here
    window.clearInterval(followTimer); followTimer = null;
    if (followRef && followHandler) followRef.off('value', followHandler);
    if (followConnectedRef && followConnectedHandler) followConnectedRef.off('value', followConnectedHandler);
    followConnectedRef = followConnectedHandler = null; sessionSeen = false;
    try { if (db && uid && followCode) db.ref(`sessions/${followCode}/viewers/${uid}`).remove().catch(() => {}); } catch (error) { /* ignore */ }
    followRef = followHandler = null; followCode = ''; followUpdated = 0; followRouted = false;
    $('meeting-leave').hidden = true;
    if (!options.keepPerson) api().clearPerson();
    release();
  }

  async function follow(rawCode) {
    const code = String(rawCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`).test(code)) { setJoinStatus('A meeting code is 6 letters and numbers, for example K7M2QX.', true); return; }
    if (!configured()) { showSetupNote(); return; }
    stopFollowing({ keepPerson: false });
    setJoinStatus(`Looking for ${code}…`, false);
    try { await ready(); } catch (error) { setJoinStatus(friendlyError(error), true); return; }

    following = true; followCode = code; followRouted = false; followUpdated = 0; followName = 'Friend';
    $('meeting-leave').hidden = false;
    followRef = db.ref('sessions/' + code);
    let first = true;
    const announce = () => {                                          // lets the sharer see that someone is following
      const mine = db.ref(`sessions/${code}/viewers/${uid}`);
      mine.set(true).catch(() => {});
      mine.onDisconnect().remove();
    };
    followConnectedRef = db.ref('.info/connected');
    followConnectedHandler = snapshot => { if (snapshot.val() === true && sessionSeen && following) announce(); };
    followConnectedRef.on('value', followConnectedHandler);
    followHandler = snapshot => {
      const value = snapshot.val();
      const gone = !value || (value.expires && value.expires < serverNow());
      if (gone) {
        const message = first ? 'That code was not found, or sharing has already ended.' : `${followName} stopped sharing, or the timer ran out.`;
        stopFollowing({ keepPerson: false });
        setJoinStatus(message, first);
        return;
      }
      if (first) { first = false; sessionSeen = true; announce(); }
      followName = String(value.name || 'Friend').slice(0, 30);
      followUpdated = Number(value.updated) || serverNow();
      api().setPerson(followName, { lat: value.lat, lng: value.lng }, { live: true });
      if (!followRouted) { followRouted = true; api().routeToPerson(); }
      renderFollow();
    };
    followRef.on('value', followHandler, error => { stopFollowing({ keepPerson: false }); setJoinStatus(friendlyError(error), true); });
    followTimer = window.setInterval(renderFollow, 5000);
  }

  // ---- page wiring ----------------------------------------------------------------------
  function showSetupNote() {
    $('meeting-setup-note').hidden = false;
  }

  $('meeting-start').addEventListener('click', startSharing);
  $('meeting-stop').addEventListener('click', () => stopSharing());
  $('meeting-copy-code').addEventListener('click', () => copyText(hostCode, 'Code copied. Send it to your friend.'));
  $('meeting-copy-link').addEventListener('click', () => {
    const url = new URL(window.location.href); url.search = ''; url.hash = '';
    url.searchParams.set('code', hostCode);
    copyText(url.toString(), 'Link copied. Anyone who opens it can follow you until you stop.');
  });
  $('meeting-extend').addEventListener('click', () => {
    if (!hostRef) return;
    hostExpires = serverNow() + SHARE_MS;
    hostRef.update({ expires: hostExpires }).catch(() => {});
    renderHost();
  });
  $('meeting-join').addEventListener('click', () => follow($('meeting-join-code').value));
  $('meeting-join-code').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); follow($('meeting-join-code').value); } });
  $('meeting-join-code').addEventListener('input', event => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  $('meeting-leave').addEventListener('click', () => { stopFollowing(); setJoinStatus('You stopped following.', false); });
  window.addEventListener('pagehide', () => { if (hostRef) { try { hostRef.remove(); } catch (error) { /* the server removes it anyway */ } } });

  api().onFix(onFix);

  if (!configured()) {
    showSetupNote();
    $('meeting-start').disabled = true;
    $('meeting-join').disabled = true;
  } else {
    // Opened from a shared link such as  ?code=K7M2QX
    const fromLink = new URLSearchParams(window.location.search).get('code');
    if (fromLink) {
      $('meeting-join-code').value = fromLink.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const box = $('person-box'); if (box) box.open = true;
      follow(fromLink);
    }
  }

  window.YCTMeeting = {
    isFollowing: () => following,
    leave: options => stopFollowing(options || {}),
    stop: () => stopSharing()
  };
})();
