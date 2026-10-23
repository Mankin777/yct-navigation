'use strict';

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
    center: { lat: 6.5170, lng: 3.3760 },
    zoom: 16,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });
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
  if (window.google && google.maps) { initMap(); return; }
  if (mapLoadAttempted) return;                // a request is already in flight

  const key = window.YCT_CONFIG?.googleMapsApiKey;
  if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') {
    updateMapStatus('Map setup required');
    showMapPlaceholder('No Google Maps API key is configured. Add your restricted key to js/config.js, reload, then try again.', 'Click the button to try again');
    return;
  }

  mapLoadAttempted = true;
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
