// ── state ────────────────────────────────────────────────────────────────────
const state = {
  tourists: [],
  zones: [],
  incidents: [],
  dashboard: {},
  selectedTouristId: null,
  routeHistory: {}          // touristId → [{ lat, lng, ts, riskLevel }]
};

// ── DOM refs ─────────────────────────────────────────────────────────────────
const registerForm    = document.getElementById('register-form');
const touristCard     = document.getElementById('tourist-card');
const verifyResultBox = document.getElementById('verify-result');
const alertNotice     = document.getElementById('alert-notice');
const touristList     = document.getElementById('tourist-list');
const incidentList    = document.getElementById('incident-list');
const mapView         = document.getElementById('map-view');
const zoneSvg         = document.getElementById('zone-svg');
const dashboardStats  = document.getElementById('dashboard-stats');
const weatherBanner   = document.getElementById('weather-banner');
const zoneForm        = document.getElementById('zone-form');
const zoneListEl      = document.getElementById('zone-list');
const riskPanel       = document.getElementById('risk-panel');

// ── CSRF token (fetched from server on boot) ─────────────────────────────────
let CSRF_TOKEN = null;
async function initCsrfToken() {
  const data = await fetch('/api/csrf-token').then((r) => r.json());
  CSRF_TOKEN = data.csrfToken;
}

// ── API helper ────────────────────────────────────────────────────────────────
const ALLOWED_API_PREFIX = '/api/';
async function api(path, options = {}) {
  if (!path.startsWith(ALLOWED_API_PREFIX)) {
    throw new Error(`Blocked request to disallowed path: ${path}`);
  }
  const isWrite = options.method && options.method !== 'GET';
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(isWrite ? { 'X-CSRF-Token': CSRF_TOKEN } : {})
    },
    ...options
  });
  return res.json();
}

// ── inline notification (replaces alert()) ────────────────────────────────────
function notify(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `inline-notify ${type}`;
  el.textContent = msg;
  document.querySelector('.app-shell').prepend(el);
  setTimeout(() => el.remove(), 4000);
}

// ── map coordinate helpers ────────────────────────────────────────────────────
// Map viewport: lon 73.78–73.815, lat 20.003–20.013
const MAP_W = 600, MAP_H = 300;
const LON_MIN = 73.78, LON_MAX = 73.815;
const LAT_MIN = 20.003, LAT_MAX = 20.013;

function toMapX(lon) {
  return ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W;
}
function toMapY(lat) {
  return ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_H;
}
// radius in km → approximate SVG units
function toMapR(radiusKm) {
  return (radiusKm / (LON_MAX - LON_MIN)) * MAP_W * 0.9;
}

// ── weather banner ────────────────────────────────────────────────────────────
const WEATHER_LABELS = {
  storm: '🌩️ Storm warning active',
  flood: '🌊 Flood warning active',
  landslide: '⛰️ Landslide risk detected',
  'heavy-rain': '🌧️ Heavy rain in affected zones'
};

async function refreshWeatherBanner() {
  const alerts = await api('/api/weather-alerts');
  if (!alerts.length) {
    weatherBanner.classList.add('hidden');
    return;
  }
  const types = [...new Set(alerts.map((a) => a.weather))];
  weatherBanner.textContent = types.map((t) => WEATHER_LABELS[t] || t).join('  ·  ');
  weatherBanner.classList.remove('hidden');
}

// ── dashboard stats ───────────────────────────────────────────────────────────
function renderStats() {
  const d = state.dashboard;
  const cards = [
    { label: 'Active tourists',    value: d.activeTourists    || 0, cls: '' },
    { label: 'Active emergencies', value: d.activeEmergencies || 0, cls: d.activeEmergencies ? 'danger' : '' },
    { label: 'High risk tourists', value: d.highRiskTourists  || 0, cls: d.highRiskTourists  ? 'warn'   : '' },
    { label: 'Safe tourists',      value: d.safeTourists      || 0, cls: 'ok' },
    { label: 'Weather affected',   value: d.weatherAffected   || 0, cls: d.weatherAffected   ? 'warn'   : '' }
  ];
  dashboardStats.innerHTML = cards
    .map((c) => `<div class="stat-card ${c.cls}"><span>${c.label}</span><strong>${c.value}</strong></div>`)
    .join('');
}

// ── SVG zone circles + tourist dot + route trail ──────────────────────────────
function renderMap() {
  const tourist = activeTourist();
  zoneSvg.innerHTML = '';

  // zone circles
  state.zones.forEach((z) => {
    const cx = toMapX(z.longitude);
    const cy = toMapY(z.latitude);
    const r  = toMapR(z.radius);
    const colorMap = { safe: '#37c7ab', caution: '#f2b84b', danger: '#ff5b5b' };
    const color = colorMap[z.type] || '#888';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);
    circle.setAttribute('fill-opacity', '0.18');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', '2');
    zoneSvg.appendChild(circle);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', cx);
    label.setAttribute('y', cy - r - 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('fill', color);
    label.textContent = z.name;
    zoneSvg.appendChild(label);
  });

  // route trail for selected tourist
  const history = (tourist && state.routeHistory[tourist.id]) || [];
  if (history.length > 1) {
    const points = history.map((p) => `${toMapX(p.lng)},${toMapY(p.lat)}`).join(' ');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#7eb8ff');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('stroke-dasharray', '4 3');
    zoneSvg.appendChild(polyline);
  }

  // tourist dot
  if (tourist) {
    const cx = toMapX(tourist.location.longitude);
    const cy = toMapY(tourist.location.latitude);
    const isEmergency = tourist.status === 'emergency';

    if (isEmergency) {
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.setAttribute('cx', cx);
      pulse.setAttribute('cy', cy);
      pulse.setAttribute('r', '14');
      pulse.setAttribute('fill', '#ff5b5b');
      pulse.setAttribute('fill-opacity', '0.25');
      pulse.setAttribute('class', 'pulse-ring');
      zoneSvg.appendChild(pulse);
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', '7');
    dot.setAttribute('fill', isEmergency ? '#ff5b5b' : '#37c7ab');
    dot.setAttribute('stroke', 'white');
    dot.setAttribute('stroke-width', '2');
    zoneSvg.appendChild(dot);

    const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameLabel.setAttribute('x', cx + 10);
    nameLabel.setAttribute('y', cy + 4);
    nameLabel.setAttribute('font-size', '11');
    nameLabel.setAttribute('fill', 'white');
    nameLabel.textContent = tourist.name;
    zoneSvg.appendChild(nameLabel);
  }
}

// ── tourist directory ─────────────────────────────────────────────────────────
function renderTourists() {
  touristList.innerHTML = state.tourists.length
    ? state.tourists.map((t) => `
      <div class="tourist-item ${state.selectedTouristId === t.id ? 'selected' : ''}" data-id="${t.id}">
        <strong>${t.name}</strong> · <span class="mono">${t.id}</span>
        <div>Destination: ${t.destination}</div>
        <div>📍 ${t.location.latitude.toFixed(4)}, ${t.location.longitude.toFixed(4)}</div>
        <div>
          <span class="badge ${riskBadgeClass(t.latestRiskLevel)}">Risk: ${t.latestRiskLevel} (${t.latestRiskScore})</span>
          <span class="badge ${statusBadgeClass(t.status)}">${t.status}</span>
        </div>
      </div>`).join('')
    : '<p class="muted">No tourists registered yet.</p>';

  touristList.querySelectorAll('.tourist-item').forEach((item) => {
    item.addEventListener('click', () => {
      state.selectedTouristId = item.dataset.id;
      renderTourists();
      renderTouristCard();
      renderMap();
      renderAlertNotice();
      renderRiskPanel();
    });
  });
}

function riskBadgeClass(level) {
  return level === 'High' ? 'danger' : level === 'Medium' ? 'caution' : 'safe';
}
function statusBadgeClass(status) {
  return status === 'emergency' ? 'danger' : status === 'high-risk' ? 'caution' : 'safe';
}

// ── tourist card + digital ID ─────────────────────────────────────────────────
function renderTouristCard() {
  const t = activeTourist();
  if (!t) {
    touristCard.innerHTML = '<p class="muted">Register a tourist to create a digital ID.</p>';
    return;
  }
  touristCard.innerHTML = `
    <h3>${t.name}</h3>
    <p><strong>ID:</strong> <span class="mono">${t.id}</span></p>
    <p><strong>Digital ID Hash:</strong> <span class="mono">${t.digitalId}</span></p>
    <p><strong>Destination:</strong> ${t.destination}</p>
    <p><strong>Privacy:</strong> ${t.privacy?.note || 'Sensitive details remain local.'}</p>
    <div class="qr-box">${renderQR(t.qrCode)}<div class="qr-label">${t.qrCode}</div></div>
    <span class="badge ${t.zoneInfo?.zoneType || 'safe'}">Zone: ${t.zoneInfo?.zoneName || 'Unknown'}</span>
    <span class="badge ${riskBadgeClass(t.latestRiskLevel)}">Risk: ${t.latestRiskLevel} (${t.latestRiskScore})</span>
    <br/>
    <button id="verify-id" class="verify-btn">🔍 Verify Digital ID</button>
  `;
  document.getElementById('verify-id').addEventListener('click', () => verifyDigitalId(t));
  renderAlertNotice();
}

// simple visual QR-style grid from hash string
function renderQR(code) {
  const chars = (code + code).slice(0, 25);
  let cells = '';
  for (let i = 0; i < 25; i++) {
    const dark = chars.charCodeAt(i) % 2 === 0;
    cells += `<div class="qr-cell ${dark ? 'qr-dark' : ''}"></div>`;
  }
  return `<div class="qr-grid">${cells}</div>`;
}

// ── alert notice ──────────────────────────────────────────────────────────────
function renderAlertNotice() {
  const t = activeTourist();
  if (!t) {
    alertNotice.innerHTML = '<p class="muted">Select a tourist to see live alerts.</p>';
    return;
  }
  const zoneType = t.zoneInfo?.zoneType || 'safe';
  alertNotice.innerHTML = `
    <h3>Live Alert</h3>
    <p>${t.zoneInfo?.zoneAlert || 'No current alert.'}</p>
    <span class="badge ${zoneType}">Zone: ${zoneType}</span>
    <span class="badge ${statusBadgeClass(t.status)}">Status: ${t.status}</span>
    ${t.lastWeather ? `<span class="badge caution">Weather: ${t.lastWeather}</span>` : ''}
  `;
}

// ── AI risk panel ─────────────────────────────────────────────────────────────
function renderRiskPanel() {
  const t = activeTourist();
  if (!t) {
    riskPanel.innerHTML = '<p class="muted">Select a tourist to see risk analysis.</p>';
    return;
  }
  const score = t.latestRiskScore || 0;
  const level = t.latestRiskLevel || 'Low';
  const factors = t.latestRiskFactors || [];
  const barColor = level === 'High' ? '#ff5b5b' : level === 'Medium' ? '#f2b84b' : '#37c7ab';
  const history = state.routeHistory[t.id] || [];

  riskPanel.innerHTML = `
    <div class="risk-score-row">
      <span class="risk-score-num" style="color:${barColor}">${score}</span>
      <span class="risk-score-label badge ${riskBadgeClass(level)}">${level} Risk</span>
    </div>
    <div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${score}%;background:${barColor}"></div></div>
    <div class="risk-factors">
      ${factors.length
        ? factors.map((f) => `<span class="risk-factor">${f}</span>`).join('')
        : '<span class="muted">No elevated risk factors.</span>'}
    </div>
    <h4>Route History</h4>
    <div class="route-history">
      ${history.length
        ? [...history].reverse().slice(0, 6).map((p) => `
          <div class="route-entry">
            <span class="badge ${riskBadgeClass(p.riskLevel)}">${p.riskLevel}</span>
            <span class="mono">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</span>
            <span class="muted">${new Date(p.ts).toLocaleTimeString()}</span>
          </div>`).join('')
        : '<p class="muted">No route history yet. Simulate a route to begin.</p>'}
    </div>
  `;
}

// ── incidents + responder assignment ─────────────────────────────────────────
function renderIncidents() {
  incidentList.innerHTML = state.incidents.length
    ? state.incidents.map((inc) => `
      <div class="incident-item">
        <strong>${inc.touristName}</strong>
        <span class="badge ${inc.severity === 'critical' ? 'danger' : 'caution'}">${inc.severity}</span>
        <span class="badge ${inc.status === 'resolved' ? 'safe' : 'danger'}">${inc.status}</span>
        <div class="muted">${inc.message}</div>
        <div class="muted">Zone: ${inc.zoneInfo?.zoneName || 'Unknown'} · Risk: ${inc.riskLevel}</div>
        ${inc.assignedResponder
          ? `<div>👮 Responder: <strong>${inc.assignedResponder}</strong></div>`
          : ''}
        ${inc.resolvedAt ? `<div class="muted">Resolved: ${new Date(inc.resolvedAt).toLocaleTimeString()}</div>` : ''}
        ${inc.status !== 'resolved' ? `
          <div class="responder-row">
            <input class="responder-input" data-id="${inc.id}" placeholder="Assign responder name" value="${inc.assignedResponder || ''}" />
            <button class="assign-btn" data-id="${inc.id}">Assign</button>
            <button class="resolve-btn" data-id="${inc.id}">✔ Resolve</button>
          </div>` : ''}
      </div>`).join('')
    : '<p class="muted">No incidents recorded.</p>';

  incidentList.querySelectorAll('.assign-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const input = incidentList.querySelector(`.responder-input[data-id="${btn.dataset.id}"]`);
      const name = input?.value.trim();
      if (!name) { notify('Enter a responder name first.', 'warn'); return; }
      await api(`/api/incidents/${btn.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedResponder: name })
      });
      await refresh();
    });
  });

  incidentList.querySelectorAll('.resolve-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await api(`/api/incidents/${btn.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' })
      });
      await refresh();
    });
  });
}

// ── zone manager ──────────────────────────────────────────────────────────────
function renderZones() {
  zoneListEl.innerHTML = state.zones.length
    ? state.zones.map((z) => `
      <div class="tourist-item">
        <strong>${z.name}</strong>
        <span class="badge ${z.type}">${z.type}</span>
        <div class="muted">📍 ${z.latitude}, ${z.longitude} · r=${z.radius} km</div>
        <button class="delete-zone-btn resolve-btn" data-id="${z.id}">🗑 Remove</button>
      </div>`).join('')
    : '<p class="muted">No zones defined.</p>';

  zoneListEl.querySelectorAll('.delete-zone-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await api(`/api/zones/${btn.dataset.id}`, { method: 'DELETE' });
      await refresh();
    });
  });
}

zoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(zoneForm);
  const payload = Object.fromEntries(fd.entries());
  payload.latitude  = parseFloat(payload.latitude);
  payload.longitude = parseFloat(payload.longitude);
  payload.radius    = parseFloat(payload.radius);
  await api('/api/zones', { method: 'POST', body: JSON.stringify(payload) });
  zoneForm.reset();
  await refresh();
});

// ── digital ID verification ───────────────────────────────────────────────────
async function verifyDigitalId(tourist) {
  verifyResultBox.innerHTML = '<p>Verifying digital ID…</p>';
  const result = await api('/api/verify', {
    method: 'POST',
    body: JSON.stringify({ qrCode: tourist.qrCode, digitalId: tourist.digitalId })
  });
  verifyResultBox.innerHTML = `
    <h3>ID Verification</h3>
    <p><strong>Verified:</strong> ${result.verified ? '✅ Yes' : '❌ No'}</p>
    <p><strong>Tourist:</strong> ${result.tourist?.name || '—'}</p>
    <p><strong>Zone:</strong> ${result.tourist?.zoneInfo?.zoneName || 'Unknown'}</p>
    <p><strong>Blockchain hash:</strong> <span class="mono">${result.blockchainHash}</span></p>
    <p class="muted">Verified at: ${result.verifiedAt}</p>
  `;
}

// ── registration ──────────────────────────────────────────────────────────────
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(registerForm).entries());
  const tourist = await api('/api/tourists', { method: 'POST', body: JSON.stringify(payload) });
  state.tourists.push(tourist);
  state.selectedTouristId = tourist.id;
  state.routeHistory[tourist.id] = [];
  renderTourists();
  renderTouristCard();
  renderMap();
  await refresh();
});

// ── simulate risk route ───────────────────────────────────────────────────────
document.getElementById('simulate-route').addEventListener('click', async () => {
  const t = activeTourist();
  if (!t) { notify('Register a tourist before simulating a route.', 'warn'); return; }

  const samples = [
    { latitude: 20.0059, longitude: 73.7897, weather: 'clear',      movementSpeed: 4,   inactivityHours: 0 },
    { latitude: 20.0082, longitude: 73.7950, weather: 'heavy-rain', movementSpeed: 0.8, inactivityHours: 2 },
    { latitude: 20.0105, longitude: 73.8010, weather: 'storm',      movementSpeed: 0.2, inactivityHours: 3 }
  ];

  for (const sample of samples) {
    const updated = await api(`/api/tourists/${t.id}/location`, {
      method: 'POST',
      body: JSON.stringify(sample)
    });
    pushRouteHistory(updated);
    const idx = state.tourists.findIndex((x) => x.id === updated.id);
    if (idx >= 0) state.tourists[idx] = updated;
  }
  await refresh();
});

// ── SOS ───────────────────────────────────────────────────────────────────────
document.getElementById('trigger-sos').addEventListener('click', async () => {
  const t = activeTourist();
  if (!t) { notify('Register a tourist before triggering SOS.', 'warn'); return; }

  const result = await api('/api/sos', {
    method: 'POST',
    body: JSON.stringify({
      touristId: t.id,
      latitude: t.location.latitude,
      longitude: t.location.longitude,
      weather: 'storm',
      movementSpeed: 0.1,
      inactivityHours: 3
    })
  });
  const idx = state.tourists.findIndex((x) => x.id === result.tourist.id);
  if (idx >= 0) state.tourists[idx] = result.tourist;
  state.incidents.unshift(result.incident);
  renderTourists();
  renderTouristCard();
  renderMap();
  renderIncidents();
  renderAlertNotice();
  renderRiskPanel();
  await refresh();
});

// ── route history helper ──────────────────────────────────────────────────────
function pushRouteHistory(tourist) {
  if (!tourist?.id) return;
  if (!state.routeHistory[tourist.id]) state.routeHistory[tourist.id] = [];
  state.routeHistory[tourist.id].push({
    lat: tourist.location.latitude,
    lng: tourist.location.longitude,
    ts: tourist.location.timestamp,
    riskLevel: tourist.latestRiskLevel
  });
}

// ── active tourist helper ─────────────────────────────────────────────────────
function activeTourist() {
  return (
    state.tourists.find((t) => t.id === state.selectedTouristId) ||
    state.tourists[0] ||
    null
  );
}

// ── full refresh ──────────────────────────────────────────────────────────────
async function refresh() {
  const [tourists, zones, incidents, dashboard] = await Promise.all([
    api('/api/tourists'),
    api('/api/zones'),
    api('/api/incidents'),
    api('/api/dashboard')
  ]);

  state.tourists  = tourists;
  state.zones     = zones;
  state.incidents = incidents;
  state.dashboard = dashboard;

  if (!state.selectedTouristId && tourists.length) {
    state.selectedTouristId = tourists[0].id;
  }

  renderStats();
  renderTourists();
  renderTouristCard();
  renderMap();
  renderAlertNotice();
  renderIncidents();
  renderZones();
  renderRiskPanel();
  await refreshWeatherBanner();
}

// ── boot ──────────────────────────────────────────────────────────────────────
initCsrfToken()
  .then(() => refresh())
  .catch(() => {
    document.querySelector('.app-shell').innerHTML =
      '<div class="panel"><h2>Server unavailable</h2><p>Start the backend with <code>node server.js</code>.</p></div>';
  });

// re-fetch CSRF token every 10 min, refresh data every 12 sec
setInterval(initCsrfToken, 10 * 60 * 1000);
setInterval(refresh, 12000);
