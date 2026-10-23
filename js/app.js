'use strict';

const campusLocations = [
  { id: 'main-gate', name: 'Main Gate', position: { lat: 6.5162, lng: 3.3738 }, category: 'Gate', description: 'Main campus entrance (sample coordinate; verify on site).' },
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
  { id: 'multipurpose-hall', name: 'Multipurpose Hall', position: { lat: 6.5155, lng: 3.3778 }, category: 'Events', description: 'Multipurpose Hall (sample coordinate; verify on site).' }
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

// Try to autoplay the welcome message. Browsers may block audible autoplay;
// if blocked, retry after the visitor's first interaction and keep controls visible.
const welcomeAudio = el('welcome-audio');
const audioStatus = el('audio-status');
if (welcomeAudio) {
  const playWelcomeAudio = () => {
    const playAttempt = welcomeAudio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt.then(() => {
        if (audioStatus) audioStatus.textContent = 'Welcome message is playing.';
      }).catch(() => {
        if (audioStatus) audioStatus.textContent = 'Your browser blocked automatic playback. Press Play, or interact with the page once to retry.';
      });
    }
  };
  playWelcomeAudio();
  const retryAudioOnce = () => {
    if (welcomeAudio.paused) playWelcomeAudio();
    document.removeEventListener('pointerdown', retryAudioOnce);
    document.removeEventListener('keydown', retryAudioOnce);
  };
  document.addEventListener('pointerdown', retryAudioOnce, { once: true });
  document.addEventListener('keydown', retryAudioOnce, { once: true });
  welcomeAudio.addEventListener('error', () => {
    if (audioStatus) audioStatus.textContent = 'Welcome audio files were not found. Add welcome_mp3.mp3 or welcome_wav.wav to the audios folder.';
  });
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
    campusLocations.forEach(location => { const option = document.createElement('option'); option.value = location.id; option.textContent = location.name; select.appendChild(option); });
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

el('use-location').addEventListener('click', () => {
  if (!navigator.geolocation) { showToast('This browser does not support location access.'); return; }
  showToast('Requesting your location permission…');
  navigator.geolocation.getCurrentPosition(position => {
    if (typeof window.setUserLocation === 'function') window.setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    const result = el('route-result'); result.textContent = 'Your current location was received. Choose a campus destination to request directions.'; result.classList.remove('notice-warning');
    window.currentUserCoordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
    const sourceOption = document.createElement('option'); sourceOption.value = '__current__'; sourceOption.textContent = 'My current location';
    const source = el('source'); if (![...source.options].some(option => option.value === '__current__')) source.insertBefore(sourceOption, source.options[1]); source.value = '__current__';
  }, error => showToast(error.code === 1 ? 'Location permission was denied.' : 'Could not get your location. Check device and browser location settings.'), { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
});

el('reset-steps').addEventListener('click', () => { checkedSteps.clear(); renderSteps(); showToast('Registration checklist reset.'); });
el('clear-documents').addEventListener('click', () => { checkedDocuments.clear(); renderDocuments(); showToast('Document checklist cleared.'); });
el('directory-search').addEventListener('input', event => renderDirectory(event.target.value));

const menuToggle = el('menu-toggle');
menuToggle.addEventListener('click', () => { const expanded = menuToggle.getAttribute('aria-expanded') === 'true'; menuToggle.setAttribute('aria-expanded', String(!expanded)); el('primary-nav').classList.toggle('open', !expanded); });
document.querySelectorAll('.primary-nav a').forEach(link => link.addEventListener('click', () => { el('primary-nav').classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

// Highlight the navigation item for the section currently in view.
const navLinks = [...document.querySelectorAll('.primary-nav a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  }), { rootMargin: '-25% 0px -60% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

populateLocationSelects(); renderStudentTypes(); renderSteps(); renderDocuments(); renderDirectory(); renderFaqs(); renderEvents();
window.setInterval(updateCountdowns, 60000);

// Back to top: scrolls the window itself instead of jumping to the sticky header (#top),
// which is what stopped the old link from working. Smooth unless the visitor prefers reduced motion.
function scrollToTop(event) {
  if (event) event.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' });
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
}
const footerTop = el('back-to-top'), floatingTop = el('floating-top');
if (footerTop) footerTop.addEventListener('click', scrollToTop);
if (floatingTop) {
  floatingTop.addEventListener('click', scrollToTop);
  const toggleFloatingTop = () => { floatingTop.hidden = window.scrollY < 600; };
  window.addEventListener('scroll', toggleFloatingTop, { passive: true });
  toggleFloatingTop();
}
