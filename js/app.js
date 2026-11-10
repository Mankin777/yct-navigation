'use strict';

const campusLocations = [
  { id: 'main-gate', name: 'Front Entrance (Main Gate)', position: { lat: 6.518978, lng: 3.372324 }, category: 'Gate', description: 'Front entrance to Yaba College of Technology.' },
  { id: 'science', name: 'School of Science', position: { lat: 6.5158, lng: 3.3748 }, category: 'Academic', description: 'School of Science / science complex (sample coordinate; verify on site).' },
  { id: 'engineering', name: 'School of Engineering', position: { lat: 6.5180, lng: 3.3778 }, category: 'Academic', description: 'School of Engineering (sample coordinate; verify on site).' },
  { id: 'library', name: 'Library', position: { lat: 6.5182, lng: 3.3752 }, category: 'Study', description: 'Library (sample coordinate; verify on site).' },
  { id: 'ict', name: 'ICT Centre', position: { lat: 6.5178, lng: 3.3772 }, category: 'Support', description: 'ICT Centre (sample coordinate; verify on site).' },
  { id: 'medical', name: 'Medical Centre', position: { lat: 6.5167, lng: 3.3768 }, category: 'Health', description: 'Medical Centre (sample coordinate; verify on site).' },
  { id: 'computer-tech', name: 'Computer Technology Department', position: { lat: 6.5165, lng: 3.3780 }, category: 'Academic', description: 'Department location (sample coordinate; verify on site).' },
  { id: 'bursary', name: 'Bursary', position: { lat: 6.5175, lng: 3.3740 }, category: 'Administration', description: 'Bursary (sample coordinate; verify on site).' },
  { id: 'student-affairs', name: 'Student Affairs', position: { lat: 6.5155, lng: 3.3778 }, category: 'Support', description: 'Student support office (location needs verification).' },
  { id: 'arts', name: 'Arts Complex', position: { lat: 6.5150, lng: 3.3760 }, category: 'Academic', description: 'Arts complex (sample coordinate; verify on site).' },
  { id: 'food-village', name: 'Food Village', position: { lat: 6.5160, lng: 3.3790 }, category: 'Food', description: 'Food Village (sample coordinate; verify on site).' },
  { id: 'multipurpose-hall', name: 'Multipurpose Hall', position: { lat: 6.5155, lng: 3.3778 }, category: 'Events', description: 'Multipurpose Hall (sample coordinate; verify on site).' },
  { id: 'nacos-office', name: 'NACOS Office', position: { lat: 6.516913, lng: 3.374910 }, category: 'Support', description: 'NACOS Office.' },
  { id: 'front-engineering', name: 'Front of Engineering Building', position: { lat: 6.517018, lng: 3.374772 }, category: 'Academic', description: 'Area in front of the Engineering building.' },
  { id: 'mechanical-workshop-2', name: 'Front of Mechanical Workshop 2', position: { lat: 6.517065, lng: 3.374846 }, category: 'Academic', description: 'Area in front of Mechanical Workshop 2.' },
  { id: 'metallurgical-engineering', name: 'Department of Metallurgical Engineering', position: { lat: 6.517253, lng: 3.374637 }, category: 'Academic', description: 'Department of Metallurgical Engineering.' },
  { id: 'mechanical-workshop-1', name: 'Front of Mechanical Workshop 1', position: { lat: 6.517573, lng: 3.374137 }, category: 'Academic', description: 'Area in front of Mechanical Workshop 1.' },
  { id: 'cnc-workshop', name: 'Front of CNC Engineering Workshop', position: { lat: 6.517610, lng: 3.374169 }, category: 'Academic', description: 'Area in front of the CNC Engineering Workshop.' },
  { id: 'entrepreneurship-centre', name: 'Centre for Entrepreneurship Development / Entrepreneurship Development Building', position: { lat: 6.517581, lng: 3.374109 }, category: 'Academic', description: 'Centre for Entrepreneurship Development building.' },
  { id: 'liberal-studies', name: 'School of Liberal Studies', position: { lat: 6.517850, lng: 3.374076 }, category: 'Academic', description: 'School of Liberal Studies.' },
  { id: 'zenith-bank', name: 'Front of Zenith Bank', position: { lat: 6.517273, lng: 3.374090 }, category: 'Banking', description: 'Area in front of Zenith Bank.' },
  { id: 'yct-microfinance-bank', name: 'Front of YCT Microfinance Bank', position: { lat: 6.517341, lng: 3.373996 }, category: 'Banking', description: 'Area in front of YCT Microfinance Bank.' },
  { id: 'horology-instrumentation', name: 'Entrance to Horology and Instrumentation Section', position: { lat: 6.517483, lng: 3.373926 }, category: 'Academic', description: 'Entrance to the Horology and Instrumentation section.' },
  { id: 'science-complex-entrance-1', name: 'Entrance 1 to Dr Philip Adegbile Science Complex', position: { lat: 6.517596, lng: 3.374057 }, category: 'Academic', description: 'Entrance 1 to the Dr Philip Adegbile Science Complex.' },
  { id: 'art-museum', name: 'Yaba Art Museum / School of Art, Design and Printing Technology', position: { lat: 6.517633, lng: 3.373079 }, category: 'Academic', description: 'Yaba Art Museum and School of Art, Design and Printing Technology.' },
  { id: 'science-technology-complex', name: 'Entrance to Science and Technology Complex', position: { lat: 6.518023, lng: 3.372494 }, category: 'Academic', description: 'Entrance to the Science and Technology Complex.' },
  { id: 'cyber-cafe', name: 'General Cyber Cafe and Snacks Stand', position: { lat: 6.518119, lng: 3.372498 }, category: 'Support', description: 'General cyber cafe and snacks stand.' },
  { id: 'etf-new-building', name: 'Entrance to ETF/NEW Building', position: { lat: 6.517987, lng: 3.374024 }, category: 'Administration', description: 'Entrance to the ETF/NEW building.' },
  { id: 'lotus-bank', name: 'Lotus Bank', position: { lat: 6.518873, lng: 3.372755 }, category: 'Banking', description: 'Lotus Bank.' },
  { id: 'financial-studies', name: 'School of Financial Studies', position: { lat: 6.518067, lng: 3.373788 }, category: 'Academic', description: 'School of Financial Studies.' }
];
window.campusLocations = campusLocations;

const studentTypes = [
  { icon: '🎓', title: 'Aspiring student', description: 'Start by checking current admission requirements, application deadlines and course information through official channels.' },
  { icon: '✅', title: 'Newly admitted', description: 'Confirm acceptance, clearance, fee and registration steps for your admission year before making payments.' },
  { icon: '🔄', title: 'Returning student', description: 'Check current fee instructions, course registration dates and academic announcements.' },
  { icon: '👋', title: 'Visitor or parent', description: 'Use the directory as a starting point and confirm appointments and office locations before travelling.' }
];

const registrationSteps = [
  ['Admission confirmation', 'Check your admission status and follow the current official acceptance instructions.'],
  ['Acceptance requirements', 'Confirm whether an acceptance fee or acceptance process applies to your admission.'],
  ['School fee instructions', 'Verify the approved fee schedule and official payment channel before paying.'],
  ['Medical clearance', 'Confirm whether medical screening is required and where it is conducted.'],
  ['Document verification', 'Check which original documents and copies your admission category requires.'],
  ['Departmental registration', 'Contact your department for current departmental instructions.'],
  ['Course registration', 'Use the official portal and confirm your approved course list.'],
  ['Student identity card', 'Check the current student ID application or collection procedure.'],
  ['Final confirmation', 'Keep copies of receipts and completed forms, and verify that your registration is complete.']
];

const documents = [
  'Admission letter (if applicable)', 'JAMB result or admission evidence (if applicable)', 'O’Level result(s)', 'Birth certificate or age declaration', 'Local government / state of origin certificate (if requested)', 'Recent passport photographs', 'Payment receipts (where applicable)', 'Student biodata or registration form', 'Course registration form or slip', 'Medical documents (if requested)', 'Identification document', 'Photocopies of documents requested by the College'
];

const directory = [
  ['Admissions Office', 'Admission enquiries, application status and admission documentation.', 'Confirm the current office location.'],
  ['Bursary', 'Fee schedules, payment queries and financial clearance.', 'Use only payment channels confirmed by the College.'],
  ['Registry / Academic Records', 'Student records, document verification and academic documentation.', 'Confirm the correct unit for your request.'],
  ['Medical Centre', 'Student health services and medical-screening enquiries.', 'Check opening hours and current requirements.'],
  ['ICT Centre / Portal Support', 'Student portal access and technical support.', 'Never share your password or one-time codes.'],
  ['Library', 'Study resources, library access and research support.', 'Confirm access and borrowing rules.'],
  ['Student Affairs', 'Student welfare, campus support and student-life enquiries.', 'Confirm the responsible office for your issue.'],
  ['Department Office', 'Departmental announcements, course guidance and academic queries.', 'Contact your own department for course-specific instructions.'],
  ['School / Faculty Office', 'School-level academic administration and general enquiries.', 'Exact names and arrangements may vary.']
];

const faqs = [
  ['Where can I confirm admission requirements?', 'Use the official YABATECH portal and current admission notices. Requirements may differ by programme and admission year.'],
  ['How do I know which documents to bring?', 'Follow the current instructions for your admission category and ask the relevant office if anything is unclear. This checklist is only a general reminder.'],
  ['Can I pay school fees through this website?', 'No. This project does not collect payments. Use only payment instructions and channels verified through official College sources.'],
  ['Are the map pins exact?', 'Not yet. The current coordinates are development samples and must be checked against actual campus locations.'],
  ['Does the route tool work without a Google Maps API key?', 'The page still loads, but interactive map routing requires a valid, restricted Google Maps JavaScript API key.'],
  ['Are the events listed official?', 'The current event cards are examples. Replace them with confirmed events, dates, venues and official source links before publication.'],
  ['Can I use this page on my phone?', 'Yes. The layout is responsive for desktop and mobile screens.'],
  ['Who should I contact about a portal problem?', 'Use the College’s official ICT or student portal support channel. Do not share passwords or verification codes.']
];

// Demo events: replace these sample records with verified event information before public use.
const events = [
  { title: 'New Student Orientation', date: '2026-11-02T09:00:00', venue: 'Venue to be confirmed', type: 'DEMO EVENT', description: 'Sample event card. Confirm the actual date, venue and details with the College.' },
  { title: 'Student Skills Workshop', date: '2026-11-12T10:00:00', venue: 'Venue to be confirmed', type: 'DEMO EVENT', description: 'Sample event card for a student workshop or seminar announcement.' },
  { title: 'Campus Club Showcase', date: '2026-11-20T12:00:00', venue: 'Venue to be confirmed', type: 'DEMO EVENT', description: 'Sample event card for clubs, societies and student activities.' }
];

const checkedSteps = new Set();
const checkedDocuments = new Set();
let activeStudentType = '';
let toastTimeout;

function el(id) { return document.getElementById(id); }

// Welcome message: tries to autoplay (browsers may block audible autoplay) and shows a live
// frequency display that follows the audio's highs and lows while it plays.
const welcomeAudio = el('welcome-audio');
const audioStatus = el('audio-status');
const visualizer = el('audio-visualizer');

function setAudioStatus(text) { if (audioStatus) { audioStatus.textContent = text || ''; audioStatus.hidden = !text; } }

let audioContext = null, analyser = null, frequencyData = null, visualizerConnected = false, visualizerRunning = false;
const BAR_COUNT = 28;

function sizeVisualizer() {
  if (!visualizer) return;
  const ratio = window.devicePixelRatio || 1, box = visualizer.getBoundingClientRect();
  visualizer.width = Math.max(1, Math.round((box.width || 260) * ratio));
  visualizer.height = Math.max(1, Math.round((box.height || 44) * ratio));
}

function drawVisualizer() {
  if (!visualizer) return;
  const canvas = visualizer.getContext('2d');
  if (!canvas) return;
  const width = visualizer.width, height = visualizer.height, middle = height / 2;
  const playing = welcomeAudio && !welcomeAudio.paused && !welcomeAudio.ended;
  const live = playing && visualizerConnected;
  if (live) analyser.getByteFrequencyData(frequencyData);

  canvas.clearRect(0, 0, width, height);
  const step = width / BAR_COUNT, barWidth = Math.max(2, step * 0.55);
  const gradient = canvas.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#3fae45'); gradient.addColorStop(0.5, '#0b7010'); gradient.addColorStop(1, '#3fae45');
  canvas.lineCap = 'round'; canvas.lineWidth = barWidth;

  for (let i = 0; i < BAR_COUNT; i++) {
    let level = 0;
    if (live) {                                   // low bars = bass, high bars = treble (log-spaced bins)
      const first = Math.floor(Math.pow(i / BAR_COUNT, 1.7) * 63) + 1;
      const last = Math.max(first + 1, Math.floor(Math.pow((i + 1) / BAR_COUNT, 1.7) * 63) + 1);
      let sum = 0; for (let bin = first; bin < last; bin++) sum += frequencyData[bin];
      level = Math.min(1, Math.pow(sum / (last - first) / 255, 1.15) * 1.25);
    }
    const half = Math.max(live ? barWidth / 2 : barWidth / 2, level * (height / 2 - barWidth / 2));
    const x = step * i + step / 2;
    canvas.strokeStyle = live ? gradient : '#a9cfab';
    canvas.beginPath(); canvas.moveTo(x, middle - half); canvas.lineTo(x, middle + half); canvas.stroke();
  }
  if (playing) window.requestAnimationFrame(drawVisualizer); else visualizerRunning = false;
}

function startVisualizerLoop() { if (!visualizerRunning) { visualizerRunning = true; window.requestAnimationFrame(drawVisualizer); } }

// Connects the audio to an analyser. Done only once the browser lets the audio engine run
// (after a click/tap/key), because routing audio through a suspended engine would mute it.
async function attachVisualizer() {
  if (visualizerConnected || !welcomeAudio || !visualizer) return;
  if (!/^https?:$/.test(window.location.protocol)) return;          // a file:// page would be muted by browser security rules
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  try {
    audioContext = audioContext || new AudioEngine();
    if (audioContext.state !== 'running') await Promise.race([audioContext.resume(), new Promise(resolve => window.setTimeout(resolve, 400))]);
    if (audioContext.state !== 'running') return;                    // try again after the next user gesture
    const source = audioContext.createMediaElementSource(welcomeAudio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser); analyser.connect(audioContext.destination);
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    visualizerConnected = true;
    if (!welcomeAudio.paused) startVisualizerLoop();
  } catch (error) { /* the audio itself keeps playing normally without the display */ }
}

if (welcomeAudio) {
  sizeVisualizer(); drawVisualizer();
  window.addEventListener('resize', () => { sizeVisualizer(); if (!visualizerRunning) drawVisualizer(); });
  welcomeAudio.addEventListener('play', () => { setAudioStatus(''); attachVisualizer(); startVisualizerLoop(); });
  ['pause', 'ended'].forEach(name => welcomeAudio.addEventListener(name, () => window.setTimeout(drawVisualizer, 60)));

  const playWelcomeAudio = () => {
    const playAttempt = welcomeAudio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.catch(() => setAudioStatus('Your browser blocked automatic playback. Press play, or tap the page once to retry.'));
    }
  };
  playWelcomeAudio();
  const retryOnGesture = () => {
    if (welcomeAudio.paused && !welcomeAudio.ended && welcomeAudio.currentTime === 0) playWelcomeAudio();
    attachVisualizer();
    if (visualizerConnected) { ['pointerdown', 'keydown', 'touchstart'].forEach(name => document.removeEventListener(name, retryOnGesture)); }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(name => document.addEventListener(name, retryOnGesture, { passive: true }));
  welcomeAudio.addEventListener('error', () => setAudioStatus('Welcome audio files were not found. Add welcome_mp3.mp3 or welcome_wav.wav to the audios folder.'));
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function showToast(message) {
  const toast = el('toast'); toast.textContent = message; toast.classList.add('visible');
  window.clearTimeout(toastTimeout); toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function renderStudentTypes() {
  el('student-type-grid').innerHTML = studentTypes.map((item, index) => `
    <button type="button" class="student-card ${activeStudentType === item.title ? 'selected' : ''}" data-student-type="${index}" aria-pressed="${activeStudentType === item.title}">
      <span class="card-icon">${item.icon}</span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description)}</span>
    </button>`).join('');
  document.querySelectorAll('[data-student-type]').forEach(button => button.addEventListener('click', () => {
    activeStudentType = studentTypes[Number(button.dataset.studentType)].title;
    renderStudentTypes(); showToast(`Guide selected: ${activeStudentType}`);
  }));
}

function renderSteps() {
  el('steps-list').innerHTML = registrationSteps.map((step, index) => `
    <label class="step-row ${checkedSteps.has(index) ? 'complete' : ''}">
      <input type="checkbox" data-step="${index}" ${checkedSteps.has(index) ? 'checked' : ''}>
      <span class="step-number">${checkedSteps.has(index) ? '✓' : index + 1}</span>
      <span class="step-copy"><strong>${escapeHtml(step[0])}</strong><small>${escapeHtml(step[1])}</small></span>
    </label>`).join('');
  document.querySelectorAll('[data-step]').forEach(input => input.addEventListener('change', () => {
    const index = Number(input.dataset.step); input.checked ? checkedSteps.add(index) : checkedSteps.delete(index); renderSteps();
  }));
  const count = checkedSteps.size; el('progress-label').textContent = `${count} of ${registrationSteps.length} complete`;
  el('progress-bar').style.width = `${count / registrationSteps.length * 100}%`;
}

function renderDocuments() {
  el('documents-list').innerHTML = documents.map((documentName, index) => `
    <label class="document-row ${checkedDocuments.has(index) ? 'complete' : ''}"><input type="checkbox" data-document="${index}" ${checkedDocuments.has(index) ? 'checked' : ''}><span>${escapeHtml(documentName)}</span></label>`).join('');
  document.querySelectorAll('[data-document]').forEach(input => input.addEventListener('change', () => {
    const index = Number(input.dataset.document); input.checked ? checkedDocuments.add(index) : checkedDocuments.delete(index); renderDocuments();
  }));
  const count = checkedDocuments.size, percent = Math.round(count / documents.length * 100);
  el('docs-count').textContent = `${count} ready`; el('docs-percent').textContent = `${percent}%`;
  el('docs-ring').style.setProperty('--progress', `${percent * 3.6}deg`);
  el('docs-summary').textContent = count === documents.length ? 'All items on this general reminder list are ticked. Confirm the official requirements.' : `${count} of ${documents.length} reminder items marked ready.`;
}

function renderDirectory(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = directory.filter(item => item.join(' ').toLowerCase().includes(query));
  el('directory-grid').innerHTML = filtered.length ? filtered.map((item, index) => `
    <article class="directory-card"><span class="card-icon">${['📋','💳','📁','🏥','💻','📚','🤝','🎓','🏢'][directory.indexOf(item)]}</span><h3>${escapeHtml(item[0])}</h3><p>${escapeHtml(item[1])}</p><small>${escapeHtml(item[2])}</small></article>`).join('') : '<p class="notice">No matching service found. Try another search.</p>';
}

function renderFaqs() {
  el('faq-list').innerHTML = faqs.map((item, index) => `<details class="faq-item"><summary>${escapeHtml(item[0])}</summary><p>${escapeHtml(item[1])}</p></details>`).join('');
}

function renderEvents() {
  el('events-grid').innerHTML = events.map((event, index) => `
    <article class="event-card"><div class="event-meta"><span class="status-pill demo-pill">${escapeHtml(event.type)}</span><span>${new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
      <h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.description)}</p><div class="event-footer"><span>📍 ${escapeHtml(event.venue)}</span><strong id="countdown-${index}">Countdown loading…</strong></div></article>`).join('');
  updateCountdowns();
}
function updateCountdowns() {
  events.forEach((event, index) => {
    const target = new Date(event.date).getTime(), difference = target - Date.now(), output = el(`countdown-${index}`); if (!output) return;
    if (difference <= 0) { output.textContent = 'Date passed / update event'; return; }
    const days = Math.floor(difference / 86400000), hours = Math.floor((difference % 86400000) / 3600000);
    output.textContent = `${days}d ${hours}h to demo date`;
  });
}

function populateLocationSelects() {
  ['source', 'destination'].forEach(id => {
    const select = el(id);
    if (id === 'source') { const me = document.createElement('option'); me.value = '__current__'; me.textContent = 'Me (my location)'; select.appendChild(me); }
    [...campusLocations].sort((a, b) => a.name.localeCompare(b.name)).forEach(location => { const option = document.createElement('option'); option.value = location.id; option.textContent = location.name; select.appendChild(option); });
  });
}

el('route-form').addEventListener('submit', event => {
  event.preventDefault();
  const source = el('source').value, destination = el('destination').value;
  if (!source || !destination) { el('route-result').textContent = 'Please choose both a starting point and a destination.'; return; }
  if (source === destination) { el('route-result').textContent = 'Choose two different locations to request a route.'; return; }
  if (typeof window.requestCampusRoute === 'function') { window.requestCampusRoute(source, destination); }
  else {
    const a = campusLocations.find(item => item.id === source), b = campusLocations.find(item => item.id === destination);
    el('route-result').innerHTML = `<strong>Route preview</strong><br>From: ${escapeHtml(a.name)}<br>To: ${escapeHtml(b.name)}<br><br>The interactive map is not configured. No distance or walking time has been estimated. Configure the Maps API key and verify the campus coordinates to calculate a real route.`;
    el('route-result').classList.add('notice-warning');
  }
});

// Picking a starting point and a destination draws the route straight away.
function autoRoute() {
  const source = el('source').value, destination = el('destination').value;
  renderAudioGuide();
  if (source === '__current__' && typeof window.startTracking === 'function') window.startTracking();   // asks for location access
  if (!source || !destination) return;
  if (source === destination) { el('route-result').textContent = 'Choose two different locations to request a route.'; return; }
  if (typeof window.requestCampusRoute === 'function') window.requestCampusRoute(source, destination);
}
window.autoRoute = autoRoute;
el('source').addEventListener('change', autoRoute);
el('destination').addEventListener('change', autoRoute);

el('use-location').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('This browser does not support location access.'); return; }
  showToast('Requesting your location permission…');
  el('source').value = '__current__';
  autoRoute();
});

// ---- Audio guide: notes are added by hand in js/audio-notes.js ---------------------
function audioNoteCard(note) {
  const card = document.createElement('div');
  card.className = 'audio-note';
  const title = document.createElement('strong'); title.textContent = note.title || 'Audio note'; card.appendChild(title);
  if (note.text) { const text = document.createElement('p'); text.textContent = note.text; card.appendChild(text); }
  const player = document.createElement('audio');
  player.controls = true; player.preload = 'none'; player.src = note.file;
  const problem = document.createElement('p'); problem.className = 'fine-print'; problem.hidden = true;
  problem.textContent = 'This audio file could not be loaded. Check its path in js/audio-notes.js.';
  player.addEventListener('error', () => { problem.hidden = false; });
  card.appendChild(player); card.appendChild(problem);
  return card;
}

function renderAudioGuide() {
  const box = el('audio-guide');
  if (!box) return;
  const notes = (window.audioNotes || []).filter(note => note && note.file && note.to);
  const source = el('source').value, destination = el('destination').value;
  box.textContent = '';
  const heading = document.createElement('h4'); heading.textContent = '🎧 Audio guide'; box.appendChild(heading);

  if (!destination) {
    const hint = document.createElement('p'); hint.className = 'fine-print'; hint.textContent = 'Choose a destination to hear its audio note.'; box.appendChild(hint);
  } else {
    const routeNotes = notes.filter(note => note.from && note.from === source && note.to === destination);
    const placeNotes = notes.filter(note => !note.from && note.to === destination);
    const matches = [...routeNotes, ...placeNotes];
    if (matches.length) matches.forEach(note => box.appendChild(audioNoteCard(note)));
    else { const none = document.createElement('p'); none.className = 'fine-print'; none.textContent = 'No audio note has been added for this place yet.'; box.appendChild(none); }
  }

  if (notes.length) {
    const all = document.createElement('details'); all.className = 'audio-all';
    const summary = document.createElement('summary'); summary.textContent = `Browse all audio notes (${notes.length})`; all.appendChild(summary);
    notes.forEach(note => all.appendChild(audioNoteCard(note)));
    box.appendChild(all);
  }
}

el('reset-steps').addEventListener('click', () => { checkedSteps.clear(); renderSteps(); showToast('Registration checklist reset.'); });
el('clear-documents').addEventListener('click', () => { checkedDocuments.clear(); renderDocuments(); showToast('Document checklist cleared.'); });
el('directory-search').addEventListener('input', event => renderDirectory(event.target.value));

// The sticky header is taller on phones/tablets (brand row + section tabs). Measure it so jumps to a
// section never leave its title hidden underneath.
const siteHeader = document.querySelector('.site-header');
function syncHeaderHeight() { if (siteHeader) document.documentElement.style.setProperty('--header-h', `${siteHeader.offsetHeight}px`); }
syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);
window.addEventListener('orientationchange', () => window.setTimeout(syncHeaderHeight, 250));
window.addEventListener('load', syncHeaderHeight);
if ('ResizeObserver' in window && siteHeader) new ResizeObserver(syncHeaderHeight).observe(siteHeader);

// Highlight the tab for the section currently in view and keep that tab visible in the
// scrolling tab strip (phones and tablets show the section titles as swipeable tabs).
const primaryNav = el('primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
function centreActiveTab(link) {
  if (!primaryNav || primaryNav.scrollWidth <= primaryNav.clientWidth) return;
  const left = link.offsetLeft - (primaryNav.clientWidth - link.offsetWidth) / 2;
  if (primaryNav.scrollTo) primaryNav.scrollTo({ left, behavior: 'smooth' }); else primaryNav.scrollLeft = left;
}
function setActiveTab(hash) {
  navLinks.forEach(link => {
    const active = link.hash === hash;
    link.classList.toggle('active', active);
    if (active) { link.setAttribute('aria-current', 'true'); centreActiveTab(link); } else link.removeAttribute('aria-current');
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) setActiveTab(`#${entry.target.id}`);
  }), { rootMargin: '-25% 0px -60% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
navLinks.forEach(link => link.addEventListener('click', () => setActiveTab(link.hash)));

populateLocationSelects(); renderAudioGuide(); renderStudentTypes(); renderSteps(); renderDocuments(); renderDirectory(); renderFaqs(); renderEvents();
window.setInterval(updateCountdowns, 60000);

// Back to top: scrolls the window itself instead of jumping to the sticky header (#top),
// which is what stopped the old link from working. Smooth unless the visitor prefers reduced motion.
function scrollToTop(event) {
  if (event) event.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' });
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
}
const floatingTop = el('floating-top');
if (floatingTop) {
  floatingTop.addEventListener('click', scrollToTop);
  const toggleFloatingTop = () => { floatingTop.hidden = window.scrollY < 600; };
  window.addEventListener('scroll', toggleFloatingTop, { passive: true });
  toggleFloatingTop();
}
