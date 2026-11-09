'use strict';

const CAMPUS_CENTER = { lat: 6.5170, lng: 3.3760 };

let campusMap;
let directionsService;
let directionsRenderer;
let campusMarkers = [];
let mapLoadAttempted = false;

function updateMapStatus(text, configured = false) {
  const status = document.getElementById('map-status');
  if (status) { status.textContent = text; status.classList.toggle('status-ready', configured); }
}

function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || !window.google || !google.maps) return;
  mapElement.innerHTML = '';
  campusMap = new google.maps.Map(mapElement, {
    center: CAMPUS_CENTER,
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });
  userMarker = null; accuracyCircle = null; initialCentreDone = false;
  campusMap.addListener('dragstart', () => { followUser = false; });   // stop auto-follow when the user pans away
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: campusMap, suppressMarkers: false, preserveViewport: false });
  campusMarkers = [];
  window.campusLocations.forEach(location => {
    const marker = new google.maps.Marker({ position: location.position, map: campusMap, title: location.name });
    const info = new google.maps.InfoWindow({ content: `<strong>${escapeMapText(location.name)}</strong><br><span>${escapeMapText(location.description)}</span>` });
    marker.addListener('click', () => info.open({ map: campusMap, anchor: marker }));
    campusMarkers.push(marker);
  });
  updateMapStatus('Interactive map loaded', true);
  document.getElementById('route-result').textContent = 'Map loaded. Choose two locations to request walking directions.';
  renderUserMarker(); centreOnUserFirstTime(); updatePanel();          // show the tracker if a fix already arrived
}

function escapeMapText(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function requestCampusRoute(sourceId, destinationId) {
  const source = sourceId === '__current__' ? null : window.campusLocations.find(location => location.id === sourceId);
  const destination = window.campusLocations.find(location => location.id === destinationId);
  const result = document.getElementById('route-result');
  if (!destination || (sourceId !== '__current__' && !source)) { result.textContent = 'Please select valid locations.'; return; }
  const origin = sourceId === '__current__' ? window.currentUserCoordinates : source?.position;
  if (!origin) { result.textContent = 'Allow location access first, or select a campus starting point.'; return; }
  if (!directionsService || !directionsRenderer) { result.textContent = 'Load the map first (press the map button), then request the route again.'; return; }
  result.textContent = 'Calculating walking route…';
  directionsService.route({ origin, destination: destination.position, travelMode: google.maps.TravelMode.WALKING }, (response, status) => {
    if (status === 'OK' && response.routes?.[0]?.legs?.[0]) {
      directionsRenderer.setDirections(response);
      const leg = response.routes[0].legs[0];
      result.innerHTML = `<strong>Walking route found</strong><br>From: ${escapeMapText(source ? source.name : 'My current location')}<br>To: ${escapeMapText(destination.name)}<br><br>Estimated distance: ${escapeMapText(leg.distance.text)}<br>Estimated walking time: ${escapeMapText(leg.duration.text)}<br><span class="fine-print">Google Maps estimate; check the route and actual campus access.</span>`;
      result.classList.remove('notice-warning');
    } else {
      result.textContent = `Could not calculate a walking route (${status}). The selected coordinates or pedestrian routing coverage may need verification.`;
      result.classList.add('notice-warning');
    }
  });
}

function setUserLocation(position) {
  if (campusMap) { campusMap.panTo(position); campusMap.setZoom(17); }
}

window.requestCampusRoute = requestCampusRoute;
window.setUserLocation = setUserLocation;


// ---- Live location tracking --------------------------------------------------
// Started when the visitor presses the map button, so the browser's permission prompt
// appears right after that click. The position never leaves the browser: this site does
// not store or upload it.
let trackingWatchId = null;
let userMarker = null;
let accuracyCircle = null;
let lastFix = null;            // { lat, lng } of the latest position
let lastAccuracy = 0;          // metres
let lastHeading = null;        // degrees clockwise from north, or null if unknown
let followUser = false;
let initialCentreDone = false;

function distanceMeters(a, b) {                       // straight-line (Haversine)
  const R = 6371000, rad = d => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingDegrees(a, b) {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

function formatDistance(metres) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

function injectTrackerStyles() {
  if (document.getElementById('tracker-styles')) return;
  const style = document.createElement('style');
  style.id = 'tracker-styles';
  style.textContent = `
    .tracker-panel{margin-top:14px;padding:14px 16px;border-radius:12px;background:#f0f7f0;border-left:4px solid var(--green);font-size:.9rem;color:#344a36}
    .tracker-status{margin:0 0 8px;font-weight:800}
    .tracker-heading{margin:10px 0 4px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5d6a5e}
    .tracker-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #dbe8dc}
    .tracker-row:last-child{border-bottom:0}.tracker-row strong{color:var(--green);white-space:nowrap}
    .tracker-dest{background:#fff8e3;border-radius:8px;padding:8px 10px;border-bottom:0;margin-bottom:4px}
    .tracker-actions{display:flex;gap:18px;flex-wrap:wrap;margin-top:6px}
    .tracker-panel .fine-print{margin:8px 0 0}`;
  document.head.appendChild(style);
}

function ensureTrackerPanel() {
  if (document.getElementById('tracker-panel')) return;
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  const panel = document.createElement('div');
  panel.className = 'tracker-panel';
  panel.id = 'tracker-panel';
  panel.setAttribute('aria-live', 'polite');
  panel.innerHTML = `
    <p class="tracker-status" id="tracker-status"></p>
    <div id="tracker-nearby"></div>
    <div class="tracker-actions">
      <button type="button" class="text-button" id="tracker-center">Centre on me</button>
      <button type="button" class="text-button" id="tracker-toggle">Pause tracking</button>
    </div>
    <p class="fine-print">Your position stays in your browser; this site does not store or upload it. Distances are straight-line estimates.</p>`;
  mapElement.insertAdjacentElement('afterend', panel);

  document.getElementById('tracker-center').addEventListener('click', () => {
    if (!lastFix || !campusMap) { setTrackerStatus('Your position is not available yet.'); return; }
    followUser = true;
    campusMap.panTo(lastFix);
    campusMap.setZoom(17);
  });
  document.getElementById('tracker-toggle').addEventListener('click', () => {
    if (trackingWatchId !== null) pauseTracking(); else startTracking();
  });
  const destination = document.getElementById('destination');
  if (destination) destination.addEventListener('change', updatePanel);
}

function setTrackerStatus(text) {
  const status = document.getElementById('tracker-status');
  if (status) status.textContent = text;
}

function setToggleLabel(text) {
  const toggle = document.getElementById('tracker-toggle');
  if (toggle) toggle.textContent = text;
}

function startTracking() {
  if (trackingWatchId !== null) return;
  injectTrackerStyles();
  ensureTrackerPanel();
  if (!navigator.geolocation) {
    setTrackerStatus('This browser does not support location access, so your position cannot be shown.');
    return;
  }
  setTrackerStatus('Waiting for location permission…');
  setToggleLabel('Pause tracking');
  trackingWatchId = navigator.geolocation.watchPosition(onPosition, onPositionError,
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
}

function stopWatching() {
  if (trackingWatchId !== null) navigator.geolocation.clearWatch(trackingWatchId);
  trackingWatchId = null;
}

function pauseTracking() {
  stopWatching();
  if (userMarker) { userMarker.setMap(null); userMarker = null; }
  if (accuracyCircle) { accuracyCircle.setMap(null); accuracyCircle = null; }
  lastFix = null; lastHeading = null; followUser = false;
  const nearby = document.getElementById('tracker-nearby'); if (nearby) nearby.innerHTML = '';
  setTrackerStatus('Tracking paused.');
  setToggleLabel('Resume tracking');
}

function onPosition(position) {
  const here = { lat: position.coords.latitude, lng: position.coords.longitude };
  let heading = Number.isFinite(position.coords.heading) ? position.coords.heading : null;
  if (heading === null && lastFix && distanceMeters(lastFix, here) > 4) heading = bearingDegrees(lastFix, here);
  if (heading !== null) lastHeading = heading;

  lastFix = here;
  lastAccuracy = position.coords.accuracy || 0;
  window.currentUserCoordinates = here;        // also used by "My current location" routing
  addCurrentLocationOption();
  renderUserMarker();
  centreOnUserFirstTime();
  if (followUser && campusMap) campusMap.panTo(here);
  updatePanel();
}

function onPositionError(error) {
  if (error.code === 1) {
    stopWatching();
    setTrackerStatus('Location permission was denied. The map still works. To see your position, allow location for this site in your browser settings, then press "Try again".');
    setToggleLabel('Try again');
  } else if (error.code === 2) {
    setTrackerStatus('Your position is unavailable right now. Check that location is turned on for your device.');
  } else {
    setTrackerStatus('Still looking for your position… this can take a moment, especially indoors.');
  }
}

function addCurrentLocationOption() {
  const source = document.getElementById('source');
  if (!source || [...source.options].some(option => option.value === '__current__')) return;
  const option = document.createElement('option');
  option.value = '__current__';
  option.textContent = 'My current location';
  source.insertBefore(option, source.options[1] || null);
}

function renderUserMarker() {
  if (!campusMap || !lastFix || !window.google) return;
  const icon = lastHeading === null
    ? { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#1a73e8', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 }
    : { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, rotation: lastHeading, fillColor: '#1a73e8', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 };
  if (!userMarker) {
    userMarker = new google.maps.Marker({ position: lastFix, map: campusMap, title: 'You are here', zIndex: 999, icon });
    accuracyCircle = new google.maps.Circle({ map: campusMap, center: lastFix, radius: lastAccuracy,
      strokeColor: '#1a73e8', strokeOpacity: 0.35, strokeWeight: 1, fillColor: '#1a73e8', fillOpacity: 0.12, clickable: false });
  } else {
    userMarker.setPosition(lastFix);
    userMarker.setIcon(icon);
    accuracyCircle.setCenter(lastFix);
    accuracyCircle.setRadius(lastAccuracy);
  }
}

// On the first fix, move the map to the visitor only if they are actually near campus;
// otherwise (e.g. testing from home) keep showing the campus.
function centreOnUserFirstTime() {
  if (!campusMap || !lastFix || initialCentreDone) return;
  initialCentreDone = true;
  if (distanceMeters(lastFix, CAMPUS_CENTER) <= 2000) {
    campusMap.panTo(lastFix);
    campusMap.setZoom(17);
    followUser = true;
  }
}

function updatePanel() {
  const nearby = document.getElementById('tracker-nearby');
  if (!nearby || !lastFix) return;
  let status = `Tracking your position (accuracy ±${Math.round(lastAccuracy)} m)`;
  if (lastAccuracy > 150) status += ' — weak signal, distances may be off';
  setTrackerStatus(status);

  const ranked = window.campusLocations
    .map(location => ({ location, metres: distanceMeters(lastFix, location.position) }))
    .sort((a, b) => a.metres - b.metres);

  let html = '';
  const toCampus = distanceMeters(lastFix, CAMPUS_CENTER);
  if (toCampus > 2000) html += `<p class="fine-print">You are about ${formatDistance(toCampus)} from campus, so the map stays centred on campus.</p>`;

  const destinationId = document.getElementById('destination')?.value;
  const chosen = ranked.find(item => item.location.id === destinationId);
  if (chosen) html += `<div class="tracker-row tracker-dest"><span>To ${escapeMapText(chosen.location.name)}</span><strong>${formatDistance(chosen.metres)}</strong></div>`;

  html += '<p class="tracker-heading">Closest locations</p>';
  html += ranked.slice(0, 3).map(item =>
    `<div class="tracker-row"><span>${escapeMapText(item.location.name)}</span><strong>${formatDistance(item.metres)}</strong></div>`).join('');
  nearby.innerHTML = html;
}

// ---- Click-to-load map -------------------------------------------------------
// Nothing is requested from Google until the visitor presses the load/retry button.
function showMapPlaceholder(message, buttonLabel) {
  const mapElement = document.getElementById('map');
  mapElement.innerHTML = `
    <div class="map-fallback" id="map-placeholder">
      <span class="map-emoji">🗺️</span>
      <strong>Campus map</strong>
      <p>${escapeMapText(message)}</p>
      <button type="button" class="map-load-button" id="load-map-button" aria-label="${escapeMapText(buttonLabel)}">&#8635;</button>
      <p class="map-hint">${escapeMapText(buttonLabel)}</p>
    </div>`;
  document.getElementById('load-map-button').addEventListener('click', loadMap);
}

function loadMap() {
  if (campusMap) return;                       // already showing
  if (window.google && google.maps) { startTracking(); initMap(); return; }
  if (mapLoadAttempted) return;                // a request is already in flight

  const key = window.YCT_CONFIG?.googleMapsApiKey;
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') {
    updateMapStatus('Map setup required');
    showMapPlaceholder('No Google Maps API key is configured. Add your restricted key to js/config.js, reload, then try again.', 'Click the button to try again');
    return;
  }

  mapLoadAttempted = true;
  startTracking();                             // triggers the browser's location prompt
  const button = document.getElementById('load-map-button');
  if (button) button.disabled = true;
  updateMapStatus('Loading map…');

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    script.remove();
    mapLoadAttempted = false;                  // allow another attempt
    updateMapStatus('Map failed to load');
    showMapPlaceholder('The map could not be loaded. Check your internet connection and API key.', 'Click the button to retry');
  };
  window.initMap = initMap;
  document.head.appendChild(script);
}

// Google calls this if the key is invalid or not allowed for this website.
window.gm_authFailure = () => {
  campusMap = undefined;
  mapLoadAttempted = false;
  updateMapStatus('Map key problem');
  showMapPlaceholder('Google rejected the API key. Check its restrictions and that Maps JavaScript API is enabled.', 'Click the button to retry');
};

window.loadMap = loadMap;
const loadMapButton = document.getElementById('load-map-button');
if (loadMapButton) loadMapButton.addEventListener('click', loadMap);
