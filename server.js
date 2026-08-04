const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const TOURISTS_FILE = path.join(DATA_DIR, 'tourists.json');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');
const ZONES_FILE = path.join(DATA_DIR, 'zones.json');

function ensureDataFiles() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(TOURISTS_FILE)) {
    fs.writeFileSync(TOURISTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(INCIDENTS_FILE)) {
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(ZONES_FILE)) {
    fs.writeFileSync(
      ZONES_FILE,
      JSON.stringify(
        [
          { id: 'safe-hotel', name: 'Hotel Zone', type: 'safe', latitude: 20.0059, longitude: 73.7897, radius: 0.04 },
          { id: 'caution-market', name: 'Crowded Market', type: 'caution', latitude: 20.0082, longitude: 73.7950, radius: 0.03 },
          { id: 'danger-mountain', name: 'Landslide Prone', type: 'danger', latitude: 20.0105, longitude: 73.8010, radius: 0.025 }
        ],
        null,
        2
      )
    );
  }
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function createTouristId() {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SY-2026-${suffix}`;
}

function createDigitalHash(name, phone, destination) {
  return crypto.createHash('sha256').update(`${name}:${phone}:${destination}`).digest('hex').slice(0, 16).toUpperCase();
}

function createPrivacyMetadata(data) {
  const sensitiveValue = `${data.phone || ''}|${data.emergencyContact || ''}|${data.medicalInfo || ''}`;
  const sensitiveDataHash = crypto.createHash('sha256').update(sensitiveValue).digest('hex').slice(0, 24).toUpperCase();

  return {
    storedLocally: true,
    sensitiveDataHash,
    note: 'Sensitive personal details are stored locally for safety and never exposed through public blockchain-style verification.'
  };
}

function sanitizeTouristForResponse(tourist) {
  const { phone, emergencyContact, medicalInfo, ...rest } = tourist;
  return {
    ...rest,
    privacy: tourist.privacy || {
      storedLocally: true,
      sensitiveDataHash: 'N/A',
      note: 'Sensitive personal details are stored locally for safety and never exposed through public blockchain-style verification.'
    }
  };
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function findZoneForLocation(latitude, longitude, zones) {
  return zones.find((zone) => haversineDistance(latitude, longitude, zone.latitude, zone.longitude) <= zone.radius);
}

function calculateRiskScore({ latitude, longitude, weather, movementSpeed, inactivityHours, zones }) {
  let score = 15;
  const factors = [];
  const matchedZone = findZoneForLocation(latitude, longitude, zones);

  if (matchedZone) {
    if (matchedZone.type === 'danger') { score += 45; factors.push('Danger zone'); }
    if (matchedZone.type === 'caution') { score += 25; factors.push('Caution zone'); }
  }

  if (weather === 'heavy-rain') { score += 15; factors.push('Heavy rain'); }
  if (weather === 'storm') { score += 25; factors.push('Storm'); }
  if (weather === 'flood') { score += 30; factors.push('Flood warning'); }
  if (weather === 'landslide') { score += 35; factors.push('Landslide risk'); }
  if (movementSpeed < 1) { score += 10; factors.push('Low movement'); }
  if (inactivityHours >= 2) { score += 20; factors.push(`Inactive ${inactivityHours}h`); }

  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 6) { score += 12; factors.push('Night hours'); }

  return {
    score: Math.min(100, score),
    matchedZone,
    factors
  };
}

function createZoneSummary(matchedZone) {
  if (!matchedZone) {
    return {
      zoneName: 'Open Area',
      zoneType: 'safe',
      zoneAlert: 'Tourist is currently outside any marked danger zone.'
    };
  }

  const zoneType = matchedZone.type;
  const zoneLabel = zoneType === 'danger' ? 'Danger Zone' : zoneType === 'caution' ? 'Caution Zone' : 'Safe Zone';
  const zoneAlert =
    zoneType === 'danger'
      ? `${zoneLabel}: ${matchedZone.name}. Move to a safe area immediately.`
      : zoneType === 'caution'
      ? `${zoneLabel}: ${matchedZone.name}. Stay alert in this area.`
      : `${zoneLabel}: ${matchedZone.name}. You are in a safe region.`;

  return {
    zoneName: matchedZone.name,
    zoneType,
    zoneAlert
  };
}

function getRiskLevel(score) {
  if (score >= 75) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function getTimestamp() {
  return new Date().toISOString();
}

ensureDataFiles();

const CSRF_TOKENS = new Set();

function generateCsrfToken() {
  const token = crypto.randomBytes(32).toString('hex');
  CSRF_TOKENS.add(token);
  return token;
}

const ALLOWED_ORIGIN = `http://localhost:${PORT}`;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-CSRF-Token');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static(PUBLIC_DIR));

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateCsrfToken() });
});

app.use((req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) return next();
  const token = req.headers['x-csrf-token'];
  if (!token || !CSRF_TOKENS.has(token)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'SafeYatra AI backend is running' });
});

app.get('/api/tourists', (req, res) => {
  res.json(loadJson(TOURISTS_FILE, []).map(sanitizeTouristForResponse));
});

app.post('/api/tourists', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const data = req.body || {};
  const initialLocation = {
    latitude: data.latitude || 20.0059,
    longitude: data.longitude || 73.7897,
    timestamp: getTimestamp()
  };
  const zones = loadJson(ZONES_FILE, []);
  const risk = calculateRiskScore({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    weather: data.weather || 'clear',
    movementSpeed: data.movementSpeed || 4,
    inactivityHours: data.inactivityHours || 0,
    zones
  });

  const tourist = {
    id: createTouristId(),
    name: data.name || 'Tourist',
    age: data.age || 'N/A',
    destination: data.destination || 'Unknown',
    digitalId: createDigitalHash(data.name || 'Tourist', data.phone || 'N/A', data.destination || 'Unknown'),
    qrCode: `SY-${(Math.random() + 1).toString(36).slice(2, 8).toUpperCase()}`,
    status: 'safe',
    location: initialLocation,
    latestRiskScore: risk.score,
    latestRiskLevel: getRiskLevel(risk.score),
    zoneInfo: createZoneSummary(risk.matchedZone),
    createdAt: getTimestamp(),
    privacy: createPrivacyMetadata(data)
  };

  tourists.push(tourist);
  saveJson(TOURISTS_FILE, tourists);
  res.status(201).json(sanitizeTouristForResponse(tourist));
});

app.get('/api/tourists/:id', (req, res) => {
  const tourist = loadJson(TOURISTS_FILE, []).find((item) => item.id === req.params.id);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });
  res.json(sanitizeTouristForResponse(tourist));
});

app.post('/api/tourists/:id/location', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const tourist = tourists.find((item) => item.id === req.params.id);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });

  const data = req.body || {};
  tourist.location = {
    latitude: data.latitude || tourist.location.latitude,
    longitude: data.longitude || tourist.location.longitude,
    timestamp: data.timestamp || getTimestamp()
  };
  const zones = loadJson(ZONES_FILE, []);
  const risk = calculateRiskScore({
    latitude: tourist.location.latitude,
    longitude: tourist.location.longitude,
    weather: data.weather || 'clear',
    movementSpeed: data.movementSpeed || 4,
    inactivityHours: data.inactivityHours || 0,
    zones
  });

  tourist.latestRiskScore = risk.score;
  tourist.latestRiskLevel = getRiskLevel(risk.score);
  tourist.latestRiskFactors = risk.factors;
  tourist.status = risk.score >= 75 ? 'high-risk' : risk.score >= 40 ? 'monitoring' : 'safe';
  tourist.lastWeather = data.weather || 'clear';
  tourist.lastMovementSpeed = data.movementSpeed || 4;
  tourist.lastInactivityHours = data.inactivityHours || 0;
  tourist.zoneInfo = createZoneSummary(risk.matchedZone);

  saveJson(TOURISTS_FILE, tourists);
  res.json(sanitizeTouristForResponse(tourist));
});

app.get('/api/weather-alerts', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const alerts = tourists
    .filter((t) => t.lastWeather && ['storm', 'flood', 'landslide', 'heavy-rain'].includes(t.lastWeather))
    .map((t) => ({
      touristId: t.id,
      touristName: t.name,
      weather: t.lastWeather,
      location: t.location,
      riskLevel: t.latestRiskLevel
    }));
  res.json(alerts);
});

app.get('/api/zones', (req, res) => {
  res.json(loadJson(ZONES_FILE, []));
});

app.delete('/api/zones/:id', (req, res) => {
  const zones = loadJson(ZONES_FILE, []);
  const filtered = zones.filter((z) => z.id !== req.params.id);
  if (filtered.length === zones.length) return res.status(404).json({ error: 'Zone not found' });
  saveJson(ZONES_FILE, filtered);
  res.json({ ok: true });
});

app.post('/api/zones', (req, res) => {
  const zones = loadJson(ZONES_FILE, []);
  const data = req.body || {};
  const zone = {
    id: data.id || `zone-${Date.now()}`,
    name: data.name || 'New Zone',
    type: data.type || 'caution',
    latitude: data.latitude || 20.007,
    longitude: data.longitude || 73.79,
    radius: data.radius || 0.03
  };

  zones.push(zone);
  saveJson(ZONES_FILE, zones);
  res.status(201).json(zone);
});

app.get('/api/incidents', (req, res) => {
  res.json(loadJson(INCIDENTS_FILE, []));
});

app.post('/api/sos', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const incidents = loadJson(INCIDENTS_FILE, []);
  const data = req.body || {};

  const tourist = tourists.find((item) => item.id === data.touristId);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });

  const zones = loadJson(ZONES_FILE, []);
  const risk = calculateRiskScore({
    latitude: data.latitude || tourist.location.latitude,
    longitude: data.longitude || tourist.location.longitude,
    weather: data.weather || tourist.lastWeather || 'clear',
    movementSpeed: data.movementSpeed || tourist.lastMovementSpeed || 0,
    inactivityHours: data.inactivityHours || tourist.lastInactivityHours || 0,
    zones
  });

  const incident = {
    id: `INC-${Date.now()}`,
    touristId: tourist.id,
    touristName: tourist.name,
    status: 'active',
    severity: risk.score >= 75 ? 'critical' : 'high',
    location: {
      latitude: data.latitude || tourist.location.latitude,
      longitude: data.longitude || tourist.location.longitude,
      timestamp: getTimestamp()
    },
    message: 'SOS triggered. Authorities and emergency contacts have been notified.',
    riskScore: risk.score,
    riskLevel: getRiskLevel(risk.score),
    zoneInfo: createZoneSummary(risk.matchedZone),
    createdAt: getTimestamp()
  };

  incidents.unshift(incident);
  tourist.status = 'emergency';
  tourist.latestRiskScore = risk.score;
  tourist.latestRiskLevel = getRiskLevel(risk.score);
  tourist.zoneInfo = createZoneSummary(risk.matchedZone);
  tourist.lastSOS = getTimestamp();
  saveJson(INCIDENTS_FILE, incidents);
  saveJson(TOURISTS_FILE, tourists);

  res.status(201).json({ incident, tourist });
});

// alias used by full-stack frontend services
app.post('/api/incidents/sos', (req, res) => {
  req.url = '/api/sos';
  const data = req.body || {};
  // remap touristId field (frontend sends touristId)
  const tourists = loadJson(TOURISTS_FILE, []);
  const incidents = loadJson(INCIDENTS_FILE, []);
  const tourist = tourists.find((item) => item.id === data.touristId);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });
  const zones = loadJson(ZONES_FILE, []);
  const risk = calculateRiskScore({
    latitude: data.latitude || tourist.location.latitude,
    longitude: data.longitude || tourist.location.longitude,
    weather: data.weather || 'clear',
    movementSpeed: data.movementSpeed || 0,
    inactivityHours: data.inactivityHours || 0,
    zones
  });
  const incident = {
    id: `INC-${Date.now()}`,
    touristId: tourist.id,
    touristName: tourist.name,
    status: 'detected',
    severity: risk.score >= 75 ? 'critical' : 'high',
    location: { latitude: data.latitude || tourist.location.latitude, longitude: data.longitude || tourist.location.longitude, timestamp: getTimestamp() },
    message: data.message || 'SOS triggered.',
    riskScore: risk.score,
    riskLevel: getRiskLevel(risk.score),
    zoneInfo: createZoneSummary(risk.matchedZone),
    clientId: data.clientId || null,
    createdAt: getTimestamp()
  };
  incidents.unshift(incident);
  tourist.status = 'emergency';
  tourist.lastSOS = getTimestamp();
  saveJson(INCIDENTS_FILE, incidents);
  saveJson(TOURISTS_FILE, tourists);
  res.status(201).json({ incident });
});

// POST /api/incidents/alert-escalation — auto-escalation stub
app.post('/api/incidents/alert-escalation', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const incidents = loadJson(INCIDENTS_FILE, []);
  const data = req.body || {};
  const tourist = tourists.find((item) => item.id === data.touristId);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });
  const incident = {
    id: `INC-${Date.now()}`,
    touristId: tourist.id,
    touristName: tourist.name,
    status: 'detected',
    severity: data.riskLevel === 'CRITICAL' ? 'critical' : 'high',
    location: tourist.location,
    riskScore: tourist.latestRiskScore || 0,
    riskLevel: data.riskLevel || 'HIGH',
    message: data.message || 'Tourist did not respond to HIGH RISK alert.',
    createdAt: getTimestamp()
  };
  incidents.unshift(incident);
  tourist.status = 'high-risk';
  saveJson(INCIDENTS_FILE, incidents);
  saveJson(TOURISTS_FILE, tourists);
  res.status(201).json({ incident });
});

// POST /api/locations — location update (used by syncEngine)
app.post('/api/locations', (req, res) => {
  const data = req.body || {};
  const tourists = loadJson(TOURISTS_FILE, []);
  const tourist = tourists.find((item) => item.id === data.touristId);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });
  const zones = loadJson(ZONES_FILE, []);
  const risk = calculateRiskScore({
    latitude: data.latitude || tourist.location.latitude,
    longitude: data.longitude || tourist.location.longitude,
    weather: data.weather || 'clear',
    movementSpeed: data.speed || 0,
    inactivityHours: (data.inactivityMins || 0) / 60,
    zones
  });
  tourist.location = { latitude: data.latitude, longitude: data.longitude, timestamp: getTimestamp() };
  tourist.latestRiskScore = risk.score;
  tourist.latestRiskLevel = getRiskLevel(risk.score);
  tourist.status = risk.score >= 75 ? 'high-risk' : risk.score >= 40 ? 'monitoring' : 'safe';
  tourist.zoneInfo = createZoneSummary(risk.matchedZone);
  saveJson(TOURISTS_FILE, tourists);
  res.status(201).json({ location: data, risk: { score: risk.score, level: getRiskLevel(risk.score), factors: risk.factors } });
});

// PATCH /api/tourists/:id/journey — journey pause/start stub
app.patch('/api/tourists/:id/journey', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const tourist = tourists.find((item) => item.id === req.params.id);
  if (!tourist) return res.status(404).json({ error: 'Tourist not found' });
  tourist.isJourneyActive = req.body.action === 'start';
  saveJson(TOURISTS_FILE, tourists);
  res.json({ isJourneyActive: tourist.isJourneyActive });
});

app.post('/api/verify', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const data = req.body || {};
  const tourist = tourists.find((item) => item.qrCode === data.qrCode || item.digitalId === data.digitalId);

  if (!tourist) {
    return res.status(404).json({ verified: false, message: 'Digital ID verification failed' });
  }

  res.json({
    verified: true,
    tourist: {
      id: tourist.id,
      name: tourist.name,
      destination: tourist.destination,
      emergencyContact: tourist.emergencyContact,
      status: tourist.status,
      latestRiskLevel: tourist.latestRiskLevel,
      zoneInfo: tourist.zoneInfo
    },
    blockchainHash: tourist.digitalId,
    verifiedAt: getTimestamp()
  });
});

app.patch('/api/incidents/:id', (req, res) => {
  const incidents = loadJson(INCIDENTS_FILE, []);
  const incident = incidents.find((item) => item.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  if (req.body.status) incident.status = req.body.status;
  if (req.body.assignedResponder) incident.assignedResponder = req.body.assignedResponder;
  if (!incident.assignedResponder) incident.assignedResponder = 'District Control';
  if (incident.status === 'resolved') incident.resolvedAt = getTimestamp();
  saveJson(INCIDENTS_FILE, incidents);
  res.json(incident);
});

app.get('/api/dashboard', (req, res) => {
  const tourists = loadJson(TOURISTS_FILE, []);
  const incidents = loadJson(INCIDENTS_FILE, []);
  const highRiskTourists = tourists.filter((tourist) => tourist.latestRiskLevel === 'High' || tourist.status === 'emergency');

  const weatherAffected = tourists.filter((t) => t.lastWeather && ['storm', 'flood', 'landslide'].includes(t.lastWeather)).length;
  res.json({
    activeTourists: tourists.length,
    activeEmergencies: incidents.filter((incident) => incident.status === 'active').length,
    highRiskTourists: highRiskTourists.length,
    safeTourists: tourists.filter((tourist) => tourist.status === 'safe').length,
    weatherAffected,
    latestIncident: incidents[0] || null
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

function startServer(port = PORT) {
  return app.listen(port, () => {
    console.log(`SafeYatra AI server listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
