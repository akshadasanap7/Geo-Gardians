const axios = require('axios');

function toRad(v) { return (v * Math.PI) / 180; }

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findZone(lat, lon, zones) {
  return zones.find((z) => haversine(lat, lon, z.latitude, z.longitude) <= z.radius);
}

const WEATHER_SCORES = { clear: 0, cloudy: 5, 'heavy-rain': 15, storm: 25, flood: 30, landslide: 35, 'extreme-heat': 20 };
const ZONE_SCORES    = { safe: 0, caution: 25, danger: 45, restricted: 55 };

function localScore({ latitude, longitude, weather, movementSpeed, inactivityMins, zones }) {
  let score = 10;
  const factors = [];
  const zone = findZone(latitude, longitude, zones);

  if (zone) {
    const zs = ZONE_SCORES[zone.type] || 0;
    score += zs;
    if (zs > 0) factors.push(`${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} zone: ${zone.name}`);
  }

  const ws = WEATHER_SCORES[weather] || 0;
  if (ws > 0) { score += ws; factors.push(`Weather: ${weather}`); }

  if (movementSpeed < 0.5) { score += 10; factors.push('No movement detected'); }
  if (inactivityMins >= 30) { score += 20; factors.push(`Inactive for ${inactivityMins} min`); }
  else if (inactivityMins >= 15) { score += 10; factors.push(`Inactive for ${inactivityMins} min`); }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) { score += 12; factors.push('Late night hours (12am–5am)'); }

  const capped = Math.min(100, score);
  return {
    score: capped,
    level: capped >= 80 ? 'CRITICAL' : capped >= 60 ? 'HIGH' : capped >= 35 ? 'MEDIUM' : 'LOW',
    factors,
    zone
  };
}

async function calculateRisk(params) {
  const local = localScore(params);
  try {
    const aiUrl = process.env.AI_SERVICE_URL;
    if (aiUrl) {
      const { data } = await axios.post(`${aiUrl}/predict-risk`, {
        locationRisk:      ZONE_SCORES[local.zone?.type] || 0,
        inactivityMinutes: params.inactivityMins || 0,
        speed:             params.movementSpeed || 0,
        nightTime:         (new Date().getHours() < 5 || new Date().getHours() >= 22) ? 1 : 0,
        weatherRisk:       WEATHER_SCORES[params.weather] || 0
      }, { timeout: 2000 });
      return {
        score:   data.riskScore,
        level:   data.riskLevel,
        factors: data.reasons || local.factors,
        zone:    local.zone
      };
    }
  } catch { /* AI service unavailable — fall back to local */ }
  return local;
}

module.exports = { calculateRisk, localScore, haversine, findZone };
