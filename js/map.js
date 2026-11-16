'use strict';

const CAMPUS_CENTER = { lat: 6.5173, lng: 3.3755 };      // middle of the surveyed campus points
const OFF_CAMPUS_METRES = 500;               // farther than this from every campus marker = "off campus"
const ROUTE_COLOUR = '#1A73E8';              // one clear blue for the "Me" tag and every route line
const WALKING_METRES_PER_MINUTE = 80;        // about 4.8 km/h
const PIN_COLOURS = { building: '#0b7010', entrance: '#c98a00' };
const GOOD_ACCURACY_METRES = 30;             // at or below this the position counts as accurate
const WEAK_ACCURACY_METRES = 100;            // above this we show tips for a better signal
const UNUSABLE_ACCURACY_METRES = 300;        // above this: no "off campus" verdict and no routing from Me
const PERSON_ID = '__person__';
const PERSON_COLOUR = '#8E24AA';            // purple: easy to tell apart from Me (blue), buildings (green) and gates (gold)
const WALKING_NOISE_MPS = 3;                 // how far a walker may plausibly move per second (used when smoothing)
const TRANSPARENT_PIXEL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');

let campusMap;
let directionsService;
let directionsRenderer;
let campusMarkers = [];
let markerById = {};
let openCampusInfo = null;
let fallbackLine = null;
let meInfo = null;
let activeRoute = null;                      // { sourceId, destinationId } of the route currently shown
let lastRouteOrigin = null;
let lastRouteTime = 0;
let mapLoadAttempted = false;
let person = null;             // { name, position, shown, trail, updated } for "Find a person"
let personMarker = null;
let personTrail = null;
let personInfo = null;
let personGlideFrame = null;
let routePersonPosition = null;
let mapRouteWaiting = false;     // a route was asked for while the map was still closed
let pendingFocusId = null;       // a place to show as soon as the map opens
let fallbackCasing = null;   // where the person was when the current route was drawn

function updateMapStatus(text, configured = false) {
  const status = document.getElementById('map-status');
  if (status) { status.textContent = text; status.classList.toggle('status-ready', configured); }
}

// ---- Marker styles --------------------------------------------------------------------
// Same pin shape and size everywhere; green = building, gold = entrance / "front of" spot.
function markerKind(location) {
  return /\b(front of|entrance|gate)\b/i.test(location.name) ? 'entrance' : 'building';
}

function pinIcon(kind) {
  const colour = PIN_COLOURS[kind];
  const glyph = kind === 'entrance'
    ? `<path d="M11 24V15a6 6 0 0 1 12 0v9z" fill="#fff"/><path d="M14.5 24v-8a2.5 2.5 0 0 1 5 0v8z" fill="${colour}"/>`
    : `<rect x="11" y="9" width="12" height="15" rx="1" fill="#fff"/><g fill="${colour}"><rect x="13" y="11.5" width="3" height="3"/><rect x="18" y="11.5" width="3" height="3"/><rect x="13" y="16.5" width="3" height="3"/><rect x="18" y="16.5" width="3" height="3"/><rect x="15.5" y="20.5" width="3" height="3.5"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8 1 1 8 1 16.6 1 28.5 17 43 17 43s16-14.5 16-26.4C33 8 26 1 17 1z" fill="${colour}" stroke="#fff" stroke-width="2"/>${glyph}</svg>`;
  return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(34, 44), anchor: new google.maps.Point(17, 43) };
}

function showCampusInfo(item) {
  if (openCampusInfo) openCampusInfo.close();
  item.info.open({ map: campusMap, anchor: item.marker });
  openCampusInfo = item.info;
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
  userMarker = null; userLabel = null; accuracyCircle = null; initialCentreDone = false;
  campusMap.addListener('dragstart', () => { followUser = false; });   // stop auto-follow when the user pans away
  meInfo = new google.maps.InfoWindow();
  directionsService = null; directionsRenderer = null;        // the older Directions service is only created if it is ever needed
  campusMarkers = []; markerById = {}; openCampusInfo = null; activeRoute = null; fallbackLine = null; fallbackCasing = null;
  personMarker = null; personTrail = null; personInfo = null;
  window.campusLocations.forEach(location => {
    const marker = new google.maps.Marker({ position: location.position, map: campusMap, title: location.name, icon: pinIcon(markerKind(location)) });
    const info = new google.maps.InfoWindow({ content: `<strong>${escapeMapText(location.name)}</strong><br><span>${escapeMapText(location.description)}</span>` });
    const item = { marker, info };
    marker.addListener('click', () => showCampusInfo(item));
    campusMarkers.push(marker);
    markerById[location.id] = item;
  });
  updateMapStatus('Interactive map loaded', true);
  document.getElementById('route-result').textContent = 'Map loaded. Choose a starting point and a destination to see the route.';
  renderUserMarker(); centreOnUserFirstTime(); updatePanel();          // show the tracker if a fix already arrived
  renderPerson();                                                      // and the person, if one was located before the map loaded
  mapRouteWaiting = false;
  if (person) centreOnPerson();
  if (pendingFocusId) { const id = pendingFocusId; pendingFocusId = null; focusPlace(id); }
  if (typeof window.autoRoute === 'function') window.autoRoute();       // draw the route if both lists were already filled in
}

function escapeMapText(value) {
  return String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function plainText(html) {
  return new DOMParser().parseFromString(String(html || ''), 'text/html').body.textContent || '';
}

function findLocation(id) {
  if (id === PERSON_ID) return person ? { id: PERSON_ID, name: person.name, position: person.position, description: `${person.name} (person)` } : null;
  return window.campusLocations.find(location => location.id === id);
}

function showRouteNote(text, warning) {
  const result = document.getElementById('route-result');
  result.textContent = text;
  result.classList.toggle('notice-warning', !!warning);
}

// ---- Routes ---------------------------------------------------------------------------
function requestCampusRoute(sourceId, destinationId, options = {}) {
  const silent = !!options.silent;                       // silent = quiet refresh while walking
  const usingMe = sourceId === '__current__';
  const source = usingMe ? null : findLocation(sourceId);
  const destination = findLocation(destinationId);
  if (!destination || (!usingMe && !source)) { showRouteNote('Please select valid locations.', true); return; }
  if (!campusMap) {                                      // no button press needed: the map opens by itself
    mapRouteWaiting = true;
    showRouteNote('Opening the map… your route will appear as soon as it is ready.', false);
    loadMap();
    return;
  }
  if (usingMe && unusable) { showRouteNote(UNUSABLE_TEXT, true); return; }
  if (usingMe && offCampus) { showRouteNote(OFF_CAMPUS_TEXT + ' Or choose a campus starting point.', true); return; }
  if (usingMe && !lastFix) { showRouteNote('Finding your position… allow location access when your browser asks.', false); return; }

  const origin = usingMe ? { lat: lastFix.lat, lng: lastFix.lng } : source.position;
  const fromName = usingMe ? 'Me' : source.name;
  activeRoute = { sourceId, destinationId };
  routePersonPosition = sourceId === PERSON_ID ? { ...source.position } : destinationId === PERSON_ID ? { ...destination.position } : null;
  lastRouteOrigin = origin;
  lastRouteTime = Date.now();
  if (!silent) showRouteNote('Finding the walking route…', false);

  const stale = () => !activeRoute || activeRoute.sourceId !== sourceId || activeRoute.destinationId !== destinationId;   // selection changed meanwhile
  const useFallback = status => {
    clearRenderedRoute();
    drawFallbackRoute(origin, destination.position, silent);
    showFallbackRoute(fromName, destination, origin, status);
    if (!silent) focusDestination(destinationId);
  };

  (async () => {
    // 1) Google's newer Routes service (needs "Routes API" switched on for the key's project)
    let routesError = null;
    try {
      const route = await computeWalkingRoute(origin, destination.position);
      if (stale()) return;
      clearRenderedRoute();
      drawRibbon(pathPoints(route.path), silent);
      showRoutesRoute(fromName, destination, route, origin);
      if (!silent) focusDestination(destinationId);
      return;
    } catch (error) { routesError = error; }
    if (stale()) return;

    // 2) the older Directions service, in case only that one is switched on
    const service = ensureDirectionsService();
    if (service) {
      try {
        service.route({ origin, destination: destination.position, travelMode: google.maps.TravelMode.WALKING }, (response, status) => {
          if (stale()) return;
          if (status === 'OK' && response.routes?.[0]?.legs?.[0]) {
            clearFallbackLine();
            const renderer = ensureDirectionsRenderer();
            renderer.setOptions({ preserveViewport: silent });
            renderer.setDirections(response);
            showWalkingRoute(fromName, destination, response.routes[0].legs[0]);
            if (!silent) focusDestination(destinationId);
          } else {
            warnDirectionsSetup(routesError, status);
            useFallback(`Routes API: ${describeError(routesError)} · older service: ${status}`);
          }
        });
        return;
      } catch (error) { /* fall through to the ribbon */ }
    }
    // 3) a blue straight-line ribbon, so there is always something to follow
    warnDirectionsSetup(routesError, 'unavailable');
    useFallback(`Routes API: ${describeError(routesError)}`);
  })();
}

// ---- Google routing helpers --------------------------------------------------------------
function describeError(error) {
  return String((error && (error.code || error.status || error.message)) || 'unavailable').replace(/\s+/g, ' ').slice(0, 110);
}

// For whoever runs the site: the visitor only sees a short code, the fix is explained in the browser console.
function warnDirectionsSetup(routesError, legacyStatus) {
  console.warn('[YCT] Walking directions are not available. In Google Cloud, switch on "Routes API" for this key\'s project, add it to the key\'s API restrictions, and make sure billing is linked (demo keys cannot use it). Routes error:', routesError, '| older Directions status:', legacyStatus);
}

async function computeWalkingRoute(origin, destinationPosition) {
  const { Route } = await google.maps.importLibrary('routes');
  const { routes } = await Route.computeRoutes({
    origin, destination: destinationPosition, travelMode: 'WALKING',
    fields: ['path', 'distanceMeters', 'durationMillis', 'legs']
  });
  const route = routes && routes[0];
  if (!route || !route.path || route.path.length < 2) throw new Error('ZERO_RESULTS');
  return route;
}

function ensureDirectionsService() {
  if (!directionsService && google.maps.DirectionsService) directionsService = new google.maps.DirectionsService();
  return directionsService;
}

function ensureDirectionsRenderer() {
  if (!directionsRenderer) {
    directionsRenderer = new google.maps.DirectionsRenderer({
      map: campusMap, suppressMarkers: true, preserveViewport: false,
      polylineOptions: { strokeColor: ROUTE_COLOUR, strokeOpacity: 0.95, strokeWeight: 7 }
    });
  }
  return directionsRenderer;
}

function pathPoints(path) {
  return path.map(point => ({ lat: typeof point.lat === 'function' ? point.lat() : point.lat, lng: typeof point.lng === 'function' ? point.lng() : point.lng }));
}

function showRoutesRoute(fromName, destination, route, origin) {
  const result = document.getElementById('route-result');
  const leg = route.legs && route.legs[0];
  const metres = route.distanceMeters ?? (leg && leg.distanceMeters) ?? distanceMeters(origin, destination.position);
  const text = value => (typeof value === 'string' && value ? value : '');
  const minutes = Math.max(1, Math.round(((route.durationMillis ?? (leg && leg.durationMillis)) || (metres / WALKING_METRES_PER_MINUTE) * 60000) / 60000));
  const distanceText = text(leg && leg.localizedValues && leg.localizedValues.distance) || formatDistance(metres);
  const durationText = text(leg && leg.localizedValues && leg.localizedValues.duration) || `${minutes} min`;
  const steps = ((leg && leg.steps) || []).filter(step => step.instructions).slice(0, 10).map(step => {
    const stepDistance = text(step.localizedValues && step.localizedValues.distance) || formatDistance(step.distanceMeters || 0);
    return `<li>${escapeMapText(plainText(step.instructions))} <span class="fine-print">(${escapeMapText(stepDistance)})</span></li>`;
  }).join('');
  result.innerHTML = `<strong>${escapeMapText(fromName)} → ${escapeMapText(destination.name)}</strong><br>Walking distance: ${escapeMapText(distanceText)} · about ${escapeMapText(durationText)}${steps ? `<ol class="route-steps">${steps}</ol>` : '<br>'}<span class="fine-print">Walking directions from Google Maps. Check actual campus access on the ground.</span>`;
  result.classList.remove('notice-warning');
}

function showWalkingRoute(fromName, destination, leg) {
  const result = document.getElementById('route-result');
  const steps = (leg.steps || []).slice(0, 10).map(step =>
    `<li>${escapeMapText(plainText(step.instructions))} <span class="fine-print">(${escapeMapText(step.distance?.text || '')})</span></li>`).join('');
  result.innerHTML = `<strong>${escapeMapText(fromName)} → ${escapeMapText(destination.name)}</strong><br>Walking distance: ${escapeMapText(leg.distance.text)} · about ${escapeMapText(leg.duration.text)}<ol class="route-steps">${steps}</ol><span class="fine-print">Google Maps walking directions. Check actual campus access on the ground.</span>`;
  result.classList.remove('notice-warning');
}

function showFallbackRoute(fromName, destination, origin, status) {
  const result = document.getElementById('route-result');
  const metres = distanceMeters(origin, destination.position);
  const minutes = Math.max(1, Math.round(metres / WALKING_METRES_PER_MINUTE));
  const direction = compassPoint(bearingDegrees(origin, destination.position));
  result.innerHTML = `<strong>${escapeMapText(fromName)} → ${escapeMapText(destination.name)}</strong><br>Head <strong>${direction}</strong> for about ${formatDistance(metres)} (roughly ${minutes} min on foot).<br><span class="fine-print">The blue ribbon on the map is a straight-line guide. Turn-by-turn walking directions are unavailable (${escapeMapText(status || 'unavailable')}).</span>`;
  result.classList.remove('notice-warning');
}

// A solid blue ribbon with a white edge and an arrowhead pointing at the destination.
function drawRibbon(points, silent) {
  clearFallbackLine();
  fallbackCasing = new google.maps.Polyline({ path: points, map: campusMap, strokeColor: '#ffffff', strokeOpacity: 0.95, strokeWeight: 10, zIndex: 1 });
  fallbackLine = new google.maps.Polyline({
    path: points, map: campusMap, strokeColor: ROUTE_COLOUR, strokeOpacity: 0.95, strokeWeight: 6, zIndex: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3.5, strokeColor: '#ffffff', strokeWeight: 1, fillColor: ROUTE_COLOUR, fillOpacity: 1 }, offset: '100%' }]
  });
  if (!silent) {
    const bounds = new google.maps.LatLngBounds();
    points.forEach(point => bounds.extend(point));
    campusMap.fitBounds(bounds, 70);
  }
}

function drawFallbackRoute(origin, destinationPosition, silent) {
  drawRibbon([origin, destinationPosition], silent);
}

function clearFallbackLine() {
  [fallbackLine, fallbackCasing].forEach(line => { if (line) line.setMap(null); });
  fallbackLine = null; fallbackCasing = null;
}
function clearRenderedRoute() { try { if (directionsRenderer) directionsRenderer.setDirections({ routes: [] }); } catch (error) { /* nothing drawn yet */ } }

function focusDestination(destinationId) {
  if (destinationId === PERSON_ID) refreshPersonInfo();
  const item = markerById[destinationId];
  if (item && campusMap) showCampusInfo(item);
}

function setUserLocation(position) {
  if (campusMap) { campusMap.panTo(position); campusMap.setZoom(17); }
}

window.requestCampusRoute = requestCampusRoute;
window.setUserLocation = setUserLocation;

// ---- Live location tracking ------------------------------------------------------------
// Started when the visitor presses the map button (or picks "Me"), so the browser's permission
// prompt appears right after that action. The position never leaves the browser: this site does
// not store or upload it.
const OFF_CAMPUS_TEXT = 'You are off campus. Please use this while you are on campus.';
const UNUSABLE_TEXT = 'Your location is too imprecise to guide you from where you are. Allow Precise location and move outdoors, or choose a campus starting point.';
let trackingWatchId = null;
let userMarker = null;
let userLabel = null;
let accuracyCircle = null;
let lastFix = null;            // { lat, lng } of the latest position
let lastAccuracy = 0;          // metres
let lastHeading = null;        // degrees clockwise from north, or null if unknown
let followUser = false;
let initialCentreDone = false;
let offCampus = false;
let weakSignal = false;
let unusable = false;
let smoothed = null;           // smoothed position estimate { lat, lng, variance, time }
let fixCount = 0;
let lastFixTimestamp = 0;
let recentAccuracies = [];     // the phone's own accuracy figures for the last 3 readings

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

function compassPoint(degrees) {
  return ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(degrees / 45) % 8];
}

function formatDistance(metres) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

function nearestCampusMetres(point) {
  return Math.min(...window.campusLocations.map(location => distanceMeters(point, location.position)));
}

function injectTrackerStyles() {
  if (document.getElementById('tracker-styles')) return;
  const style = document.createElement('style');
  style.id = 'tracker-styles';
  style.textContent = `
    .tracker-panel{margin-top:14px;padding:14px 16px;border-radius:12px;background:#f0f7f0;border-left:4px solid var(--green);font-size:.9rem;color:#344a36}
    .tracker-panel.tracker-off{background:#fff8e3;border-left-color:#d69b00}
    .tracker-status{margin:0 0 8px;font-weight:800}
    .tracker-heading{margin:10px 0 4px;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5d6a5e}
    .tracker-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #dbe8dc}
    .tracker-row:last-child{border-bottom:0}.tracker-row strong{color:var(--green);white-space:nowrap}
    .tracker-dest{background:#e8f0fe;border-radius:8px;padding:8px 10px;border-bottom:0;margin-bottom:4px}.tracker-dest strong{color:${ROUTE_COLOUR}}
    .tracker-actions{display:flex;gap:18px;flex-wrap:wrap;margin-top:6px}
    .tracker-panel .fine-print{margin:8px 0 0}
    .person-label{background:${PERSON_COLOUR};border:2px solid #fff;border-radius:12px;padding:1px 9px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
    .me-label{background:${ROUTE_COLOUR};border:2px solid #fff;border-radius:12px;padding:1px 9px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
    .me-info{font-size:.9rem;line-height:1.5}.me-info .text-button{padding:4px 0}`;
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
    if (offCampus) return;
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
  smoothed = null; fixCount = 0; lastFixTimestamp = 0; recentAccuracies = [];
  // maximumAge 0 = never reuse a cached (possibly stale or coarse) position
  trackingWatchId = navigator.geolocation.watchPosition(onPosition, onPositionError,
    { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
}

function stopWatching() {
  if (trackingWatchId !== null) navigator.geolocation.clearWatch(trackingWatchId);
  trackingWatchId = null;
}

function removeUserMarkers() {
  [userMarker, userLabel, accuracyCircle].forEach(item => { if (item) item.setMap(null); });
  userMarker = null; userLabel = null; accuracyCircle = null;
  if (meInfo) meInfo.close();
}

function pauseTracking() {
  stopWatching();
  removeUserMarkers();
  lastFix = null; lastHeading = null; followUser = false; offCampus = false; weakSignal = false; unusable = false; smoothed = null; fixCount = 0; lastFixTimestamp = 0; recentAccuracies = [];
  const nearby = document.getElementById('tracker-nearby'); if (nearby) nearby.innerHTML = '';
  const panel = document.getElementById('tracker-panel'); if (panel) panel.classList.remove('tracker-off');
  setTrackerStatus('Tracking paused.');
  setToggleLabel('Resume tracking');
}

// Weighted smoothing (a simple Kalman filter): precise readings pull the estimate strongly, vague
// ones barely move it, so the marker stops jumping around and one bad reading cannot throw it off.
function smoothFix(raw, accuracy, timestamp) {
  const reading = Math.max(accuracy || 50, 3);
  if (!smoothed) { smoothed = { lat: raw.lat, lng: raw.lng, variance: reading * reading, time: timestamp }; return smoothed; }
  const seconds = Math.max(0, (timestamp - smoothed.time) / 1000);
  const variance = smoothed.variance + seconds * WALKING_NOISE_MPS * WALKING_NOISE_MPS;
  const gain = variance / (variance + reading * reading);
  smoothed = {
    lat: smoothed.lat + gain * (raw.lat - smoothed.lat),
    lng: smoothed.lng + gain * (raw.lng - smoothed.lng),
    variance: (1 - gain) * variance,
    time: timestamp
  };
  return smoothed;
}

function onPosition(position) {
  const timestamp = position.timestamp || Date.now();
  if (timestamp < lastFixTimestamp) return;                    // ignore out-of-order readings
  lastFixTimestamp = timestamp;
  fixCount += 1;

  const previous = lastFix;
  const estimate = smoothFix({ lat: position.coords.latitude, lng: position.coords.longitude }, position.coords.accuracy, timestamp);
  const here = { lat: estimate.lat, lng: estimate.lng };
  // Smoothing makes the marker steadier, but it cannot make the signal itself better, so the accuracy
  // shown is the phone's own figure (median of the last 3 readings, so one odd reading does not flicker).
  recentAccuracies.push(Math.max(position.coords.accuracy || 50, 3));
  if (recentAccuracies.length > 3) recentAccuracies.shift();
  lastAccuracy = Math.max(5, [...recentAccuracies].sort((a, b) => a - b)[Math.floor(recentAccuracies.length / 2)]);

  let heading = Number.isFinite(position.coords.heading) && (position.coords.speed || 0) > 0.5 ? position.coords.heading : null;
  if (heading === null && previous && lastAccuracy <= WEAK_ACCURACY_METRES && distanceMeters(previous, here) > 5) heading = bearingDegrees(previous, here);
  if (heading !== null) lastHeading = heading;

  lastFix = here;
  window.currentUserCoordinates = here;        // also used by "Me (my location)" routing
  weakSignal = lastAccuracy > WEAK_ACCURACY_METRES;
  unusable = lastAccuracy > UNUSABLE_ACCURACY_METRES;
  // Only say "off campus" when the reading is precise enough to be sure.
  offCampus = !unusable && nearestCampusMetres(here) > OFF_CAMPUS_METRES;
  renderUserMarker();
  centreOnUserFirstTime();
  if (followUser && campusMap && !offCampus && !unusable) campusMap.panTo(here);
  updatePanel();
  refreshMeRoute();
  fixListeners.forEach(callback => { try { callback(currentFix()); } catch (error) { /* a listener must never break tracking */ } });
}

function onPositionError(error) {
  if (error.code === 1) {
    stopWatching();
    setTrackerStatus('Location permission was denied. The map still works. To see your position, allow location for this site in your browser settings, then press "Try again".');
    setToggleLabel('Try again');
    showRouteNote('Location permission was denied, so "Me" cannot be used. Choose a campus starting point instead.', true);
  } else if (error.code === 2) {
    setTrackerStatus('Your position is unavailable right now. Check that location is turned on for your device.');
  } else {
    setTrackerStatus('Still looking for your position… this can take a moment, especially indoors.');
  }
}

// "Me" tag: an arrow (turns as you walk) with a blue "Me" label under it. Tap either to
// open a small card with a "Use as starting point" button.
function renderUserMarker() {
  if (!campusMap || !lastFix || !window.google) return;
  if (offCampus) { removeUserMarkers(); return; }
  const icon = lastHeading === null
    ? { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: ROUTE_COLOUR, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 }
    : { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, rotation: lastHeading, fillColor: ROUTE_COLOUR, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 };
  if (!userMarker) {
    userMarker = new google.maps.Marker({ position: lastFix, map: campusMap, title: 'Me — you are here', zIndex: 999, icon });
    userLabel = new google.maps.Marker({
      position: lastFix, map: campusMap, zIndex: 1000, title: 'Me — you are here',
      icon: { url: TRANSPARENT_PIXEL, scaledSize: new google.maps.Size(1, 1), anchor: new google.maps.Point(0, 0), labelOrigin: new google.maps.Point(0, 26) },
      label: { text: 'Me', color: '#ffffff', fontSize: '12px', fontWeight: '800', className: 'me-label' }
    });
    accuracyCircle = new google.maps.Circle({ map: campusMap, center: lastFix, radius: lastAccuracy,
      strokeColor: ROUTE_COLOUR, strokeOpacity: 0.35, strokeWeight: 1, fillColor: ROUTE_COLOUR, fillOpacity: 0.12, clickable: false });
    userMarker.addListener('click', openMeInfo);
    userLabel.addListener('click', openMeInfo);
  } else {
    userMarker.setPosition(lastFix);
    userMarker.setIcon(icon);
    userLabel.setPosition(lastFix);
    accuracyCircle.setCenter(lastFix);
    accuracyCircle.setRadius(lastAccuracy);
  }
}

function openMeInfo() {
  if (!campusMap || !lastFix || !userMarker || !meInfo) return;
  const box = document.createElement('div');
  box.className = 'me-info';
  const title = document.createElement('strong'); title.textContent = 'Me — you are here';
  const accuracy = document.createElement('div'); accuracy.textContent = `Accuracy ±${Math.round(lastAccuracy)} m`;
  const button = document.createElement('button'); button.type = 'button'; button.className = 'text-button'; button.textContent = 'Use as starting point';
  button.addEventListener('click', () => {
    const source = document.getElementById('source');
    if (source) { source.value = '__current__'; source.dispatchEvent(new Event('change')); }
    meInfo.close();
  });
  box.append(title, accuracy, button);
  meInfo.setContent(box);
  meInfo.open({ map: campusMap, anchor: userMarker });
}

// On the first on-campus fix, move the map to the visitor and keep following until they pan away.
function centreOnUserFirstTime() {
  if (!campusMap || !lastFix || initialCentreDone || offCampus || lastAccuracy > WEAK_ACCURACY_METRES) return;
  initialCentreDone = true;
  campusMap.panTo(lastFix);
  campusMap.setZoom(17);
  followUser = true;
}

const ACCURACY_TIP = 'For a more accurate position: allow <strong>Precise</strong> location for this site (not "Approximate"), turn on your phone\'s Location with high accuracy, and stand in the open away from tall buildings. It can take up to a minute to settle.';

function accuracyLabel() {
  const metres = `±${Math.round(lastAccuracy)} m`;
  if (lastAccuracy <= GOOD_ACCURACY_METRES) return `Accurate position (${metres})`;
  if (fixCount < 4) return `Improving accuracy… (${metres})`;
  if (lastAccuracy <= WEAK_ACCURACY_METRES) return `Fair position (${metres})`;
  return `Weak position (${metres})`;
}

function updatePanel() {
  const nearby = document.getElementById('tracker-nearby');
  const panel = document.getElementById('tracker-panel');
  if (!nearby || !panel || !lastFix) return;
  panel.classList.toggle('tracker-off', offCampus || unusable);
  const tip = weakSignal ? `<p class="fine-print">${ACCURACY_TIP}</p>` : '';

  if (unusable) {
    setTrackerStatus(`Your location is too imprecise (±${Math.round(lastAccuracy)} m) to guide you reliably.`);
    nearby.innerHTML = tip;
    return;
  }
  if (offCampus) {
    setTrackerStatus(OFF_CAMPUS_TEXT);
    nearby.innerHTML = tip;
    return;
  }

  setTrackerStatus(accuracyLabel());
  const ranked = window.campusLocations
    .map(location => ({ location, metres: distanceMeters(lastFix, location.position) }))
    .sort((a, b) => a.metres - b.metres);

  let html = '';
  const destinationId = document.getElementById('destination')?.value;
  const chosen = destinationId ? findLocation(destinationId) : null;
  if (chosen) {
    const direction = compassPoint(bearingDegrees(lastFix, chosen.position));
    html += `<div class="tracker-row tracker-dest"><span>From Me to ${escapeMapText(chosen.name)}</span><strong>${formatDistance(distanceMeters(lastFix, chosen.position))} · ${direction}</strong></div>`;
  }
  html += '<p class="tracker-heading">Closest locations</p>';
  html += ranked.slice(0, 3).map(item =>
    `<div class="tracker-row"><span>${escapeMapText(item.location.name)}</span><strong>${formatDistance(item.metres)}</strong></div>`).join('');
  nearby.innerHTML = html + tip;
}

// While "Me" is the starting point: draw the route as soon as the first position arrives, then
// quietly refresh it every ~15 s once you have moved about 25 m (keeps Google usage modest).
function refreshMeRoute() {
  const sourceId = document.getElementById('source')?.value;
  const destinationId = document.getElementById('destination')?.value;
  if (sourceId !== '__current__' || !destinationId || !lastFix) return;
  if (unusable) { showRouteNote(UNUSABLE_TEXT, true); return; }
  if (offCampus) { showRouteNote(OFF_CAMPUS_TEXT + ' Or choose a campus starting point.', true); return; }
  if (!campusMap) return;
  const sameRoute = activeRoute && activeRoute.sourceId === '__current__' && activeRoute.destinationId === destinationId;
  const moved = lastRouteOrigin ? distanceMeters(lastRouteOrigin, lastFix) : Infinity;
  if (!sameRoute || (moved > 25 && Date.now() - lastRouteTime > 15000)) requestCampusRoute('__current__', destinationId, { silent: !!sameRoute });
}

window.startTracking = startTracking;

// Small bridge used by js/meeting.js (live meeting codes).
const fixListeners = [];
function currentFix() {
  return lastFix ? { lat: lastFix.lat, lng: lastFix.lng, accuracy: lastAccuracy, heading: lastHeading, usable: !unusable, offCampus } : null;
}
// Pans to a place and opens its card (used when a place is picked from the search box).
function focusPlace(id) {
  if (!campusMap) { pendingFocusId = id; loadMap(); return; }          // open the map first, then show the place
  const item = markerById[id], location = findLocation(id);
  if (!item || !location) return;
  campusMap.panTo(location.position);
  campusMap.setZoom(17);
  showCampusInfo(item);
}
window.YCTMap = {
  getFix: currentFix, focusPlace, centreOnPerson,
  onFix: callback => { fixListeners.push(callback); },
  startTracking,
  distance: distanceMeters,
  setPerson, clearPerson, routeToPerson, setPersonStatus, showRouteNote
};

// ---- Find a person ---------------------------------------------------------------------
// The other person sends their location (a Google Maps link or coordinates). We show them as a pulsing
// purple marker with their name, draw a trail when they are updated, and route to them like any place.
function parseDms(text) {
  const part = /(?:([NSEW])\s*)?(\d{1,3})\s*[°º]\s*(\d{1,2})\s*['′’]\s*(\d{1,2}(?:\.\d+)?)\s*(?:''|["″”]|′′|’’)?(?:\s*([NSEW])(?!\s*\d))?/gi;
  const found = [...text.matchAll(part)];
  if (found.length < 2) return null;
  const toDegrees = match => {
    const hemisphere = (match[1] || match[5] || '').toUpperCase();
    const value = Number(match[2]) + Number(match[3]) / 60 + Number(match[4]) / 3600;
    return { value: hemisphere === 'S' || hemisphere === 'W' ? -value : value, hemisphere };
  };
  let [first, second] = found.slice(0, 2).map(toDegrees);
  if (/[EW]/.test(first.hemisphere) && /[NS]/.test(second.hemisphere)) [first, second] = [second, first];
  return { lat: first.value, lng: second.value };
}

// Accepts "6.5170, 3.3760", a Google Maps link containing the coordinates, or degrees-minutes-seconds.
function parseCoordinates(input) {
  const raw = String(input || '').trim();
  if (!raw) return { error: 'Paste their coordinates or a Google Maps link first.' };
  if (/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(raw)) {
    return { error: 'Short Google Maps links cannot be read here. Open the link, then copy the coordinates (or the long address from the browser bar) and paste that instead.' };
  }
  let text = raw;
  try { text = decodeURIComponent(raw); } catch (error) { /* keep the text as typed */ }
  const number = '-?\\d{1,3}(?:\\.\\d+)?';
  let lat, lng, match;
  const urlPatterns = [
    new RegExp(`@(${number}),(${number})`),
    new RegExp(`!3d(${number})!4d(${number})`),
    new RegExp(`[?&](?:q|ll|query|destination|center|daddr|saddr)=\\+?(${number})[,+ ]+(${number})`)
  ];
  for (const pattern of urlPatterns) { match = text.match(pattern); if (match) { lat = Number(match[1]); lng = Number(match[2]); break; } }
  if (lat === undefined) { const dms = parseDms(text); if (dms) ({ lat, lng } = dms); }
  if (lat === undefined) {
    match = text.match(new RegExp(`(${number})\\s*°?\\s*([NS])?\\s*[,;/\\s]\\s*(${number})\\s*°?\\s*([EW])?`, 'i'));
    if (match) {
      lat = Number(match[1]) * (/s/i.test(match[2] || '') ? -1 : 1);
      lng = Number(match[3]) * (/w/i.test(match[4] || '') ? -1 : 1);
    }
  }
  if (lat === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'That does not look like coordinates. Try something like 6.5170, 3.3760 or a Google Maps link.' };
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { error: 'Those numbers are outside the valid range for coordinates (latitude -90 to 90, longitude -180 to 180).' };
  return { lat, lng };
}

function setPersonStatus(text, warning) {
  const status = document.getElementById('person-status');
  if (!status) return;
  status.textContent = text;
  status.classList.toggle('person-warning', !!warning);
}

function personIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="10" fill="${PERSON_COLOUR}" opacity=".4"><animate attributeName="r" values="10;22;10" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".45;0;.45" dur="1.8s" repeatCount="indefinite"/></circle>
    <circle cx="24" cy="24" r="11" fill="${PERSON_COLOUR}" stroke="#fff" stroke-width="3"/>
    <circle cx="24" cy="20.5" r="3.2" fill="#fff"/><path d="M17.8 31c.8-4 3.3-5.6 6.2-5.6s5.4 1.6 6.2 5.6z" fill="#fff"/></svg>`;
  return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 24), labelOrigin: new google.maps.Point(24, 47) };
}

function personLabel() {
  return { text: person.name, color: '#ffffff', fontSize: '12px', fontWeight: '800', className: 'person-label' };
}

function centreOnPerson() {
  if (!campusMap || !person) return;
  campusMap.panTo(person.position);
  campusMap.setZoom(17);
}

function refreshPersonInfo() {
  if (!person || !personInfo) return;
  const box = document.createElement('div');
  box.className = 'me-info';
  const title = document.createElement('strong'); title.textContent = `${person.name} (person)`;
  const when = document.createElement('div'); when.textContent = `${person.live ? 'Live · ' : ''}Last updated ${person.updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  box.append(title, when);
  if (lastFix && !unusable) {
    const away = document.createElement('div');
    away.textContent = `About ${formatDistance(distanceMeters(lastFix, person.position))} ${compassPoint(bearingDegrees(lastFix, person.position))} of you`;
    box.appendChild(away);
  }
  personInfo.setContent(box);
}

function renderPerson() {
  if (!campusMap || !person || !window.google) return;
  injectTrackerStyles();
  if (!personMarker) {
    personMarker = new google.maps.Marker({ position: person.shown, map: campusMap, title: `${person.name} (person)`, zIndex: 998, icon: personIcon(), label: personLabel() });
    personInfo = new google.maps.InfoWindow();
    personMarker.addListener('click', () => { refreshPersonInfo(); showCampusInfo({ marker: personMarker, info: personInfo }); });
    personTrail = new google.maps.Polyline({
      map: campusMap, path: [], strokeOpacity: 0,
      icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, strokeColor: PERSON_COLOUR, scale: 2 }, offset: '0', repeat: '10px' }]
    });
    markerById[PERSON_ID] = { marker: personMarker, info: personInfo };
  } else {
    personMarker.setTitle(`${person.name} (person)`);
    personMarker.setLabel(personLabel());
  }
  personTrail.setPath(person.trail);
}

// Smoothly slides the marker to the person's new position so they read as a body in motion.
function glidePerson(to) {
  if (personGlideFrame) window.cancelAnimationFrame(personGlideFrame);
  const from = { ...person.shown }, started = Date.now(), duration = 1200;
  const step = () => {
    const t = Math.min(1, (Date.now() - started) / duration);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    person.shown = { lat: from.lat + (to.lat - from.lat) * eased, lng: from.lng + (to.lng - from.lng) * eased };
    if (personMarker) personMarker.setPosition(person.shown);
    personGlideFrame = t < 1 ? window.requestAnimationFrame(step) : null;
  };
  personGlideFrame = window.requestAnimationFrame(step);
}

function syncPersonOptions() {
  ['source', 'destination'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    let option = [...select.options].find(item => item.value === PERSON_ID);
    if (!person) { if (option) { if (select.value === PERSON_ID) select.value = ''; option.remove(); } return; }
    if (!option) { option = document.createElement('option'); option.value = PERSON_ID; select.insertBefore(option, select.options[id === 'source' ? 2 : 1] || null); }
    option.textContent = `📍 ${person.name} (person)`;
  });
}

function setPerson(name, position, options = {}) {
  const label = String(name || '').trim().slice(0, 30) || 'Friend';
  let moved = false;
  if (!person) {
    person = { name: label, position, shown: { ...position }, trail: [position], updated: new Date(), live: !!options.live };
  } else {
    moved = distanceMeters(person.position, position) > 3;
    person.name = label; person.updated = new Date(); person.position = position; person.live = !!options.live;
    if (moved) { person.trail = [...person.trail, position].slice(-25); glidePerson(position); }
  }
  renderPerson();
  syncPersonOptions();
  if (options.live && moved) refreshPersonRoute();
}

// A live person keeps moving, so quietly redraw the route when they have moved ~15 m (at most every 10 s).
function refreshPersonRoute() {
  if (!activeRoute || !campusMap || !person) return;
  if (activeRoute.sourceId !== PERSON_ID && activeRoute.destinationId !== PERSON_ID) return;
  const movedSince = routePersonPosition ? distanceMeters(routePersonPosition, person.position) : Infinity;
  if (movedSince > 15 && Date.now() - lastRouteTime > 10000) requestCampusRoute(activeRoute.sourceId, activeRoute.destinationId, { silent: true });
}

// Selects Me -> person in the lists, which draws the route.
function routeToPerson() {
  const source = document.getElementById('source'), destination = document.getElementById('destination');
  destination.value = PERSON_ID;
  if (!source.value) source.value = '__current__';              // start from Me unless a starting point was already chosen
  destination.dispatchEvent(new Event('change'));
}

function clearPerson() {
  if (window.YCTMeeting && window.YCTMeeting.isFollowing()) window.YCTMeeting.leave({ keepPerson: true });
  if (personGlideFrame) { window.cancelAnimationFrame(personGlideFrame); personGlideFrame = null; }
  [personMarker, personTrail].forEach(item => { if (item) item.setMap(null); });
  if (personInfo) personInfo.close();
  personMarker = null; personTrail = null; personInfo = null; delete markerById[PERSON_ID];
  const wasInRoute = activeRoute && (activeRoute.sourceId === PERSON_ID || activeRoute.destinationId === PERSON_ID);
  person = null;
  syncPersonOptions();
  if (wasInRoute) { clearRenderedRoute(); clearFallbackLine(); activeRoute = null; showRouteNote('Person cleared. Choose a starting point and a destination.', false); }
  ['person-name', 'person-coords'].forEach(id => { const field = document.getElementById(id); if (field) field.value = ''; });
  setPersonStatus('Person cleared.', false);
}

function onLocatePerson() {
  const result = parseCoordinates(document.getElementById('person-coords').value);
  if (result.error) { setPersonStatus(result.error, true); return; }
  if (window.YCTMeeting && window.YCTMeeting.isFollowing()) window.YCTMeeting.leave({ keepPerson: true });
  setPerson(document.getElementById('person-name').value, { lat: result.lat, lng: result.lng });
  loadMap();                                                    // the map opens by itself
  centreOnPerson();
  routeToPerson();                                              // draws the route
  const farKm = nearestCampusMetres(person.position) / 1000;
  let message = `${person.name} located.` + (campusMap ? '' : ' Press the map button to see them on the map.');
  if (farKm > 1) message += ` Note: this point is about ${farKm.toFixed(1)} km from campus.`;
  setPersonStatus(message, farKm > 1);
}

// Builds a link containing your current spot. Whoever opens it sees you as a person on their map.
async function shareMyLocation() {
  if (!lastFix || unusable) {
    startTracking();
    setPersonStatus('Finding your position first. Allow location access, wait a moment, then press "Share my location" again.', true);
    return;
  }
  const url = new URL(window.location.href);
  url.search = ''; url.hash = '';
  url.searchParams.set('person', `${lastFix.lat.toFixed(6)},${lastFix.lng.toFixed(6)}`);
  const link = url.toString();
  const accuracy = weakSignal ? ` (your accuracy is only ±${Math.round(lastAccuracy)} m right now)` : '';
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Where I am on campus', text: 'This is where I am right now:', url: link });
      setPersonStatus('Shared. They can open the link to see this spot and get a route to you.' + accuracy, !!accuracy);
      return;
    }
  } catch (error) { if (error && error.name === 'AbortError') return; }
  try {
    await navigator.clipboard.writeText(link);
    setPersonStatus('Link copied. Paste it into WhatsApp or a message.' + accuracy, !!accuracy);
  } catch (error) {
    setPersonStatus('Copy this link and send it: ' + link, false);
  }
}

function loadPersonFromLink() {
  const params = new URLSearchParams(window.location.search);
  const result = parseCoordinates(params.get('person'));
  if (!params.get('person') || result.error) return;
  const name = (params.get('name') || '').slice(0, 30);
  setPerson(name, { lat: result.lat, lng: result.lng });
  document.getElementById('person-coords').value = `${result.lat}, ${result.lng}`;
  document.getElementById('person-name').value = name;
  const box = document.getElementById('person-box'); if (box) box.open = true;
  setPersonStatus(`${person.name}'s location was shared with you. The map is opening with a route from Me to ${person.name}.`, false);
  loadMap();
  routeToPerson();
}

function initPersonTools() {
  const locate = document.getElementById('person-locate');
  if (!locate) return;
  locate.addEventListener('click', onLocatePerson);
  document.getElementById('person-clear').addEventListener('click', clearPerson);
  document.getElementById('share-my-location').addEventListener('click', shareMyLocation);
  document.getElementById('person-coords').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); onLocatePerson(); } });
  loadPersonFromLink();
}

window.parseCoordinates = parseCoordinates;

// ---- Click-to-load map -------------------------------------------------------
// Nothing is requested from Google until the visitor presses the load/retry button.
function mapFailedNote() {
  if (mapRouteWaiting) { mapRouteWaiting = false; showRouteNote('The map could not be opened, so the route cannot be drawn yet. Press the ↻ button in the map to try again.', true); }
}

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
    mapFailedNote();
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
    mapFailedNote();
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
  mapFailedNote();
  showMapPlaceholder('Google rejected the API key. Check its restrictions and that Maps JavaScript API is enabled.', 'Click the button to retry');
};

window.loadMap = loadMap;
const loadMapButton = document.getElementById('load-map-button');
if (loadMapButton) loadMapButton.addEventListener('click', loadMap);
initPersonTools();
