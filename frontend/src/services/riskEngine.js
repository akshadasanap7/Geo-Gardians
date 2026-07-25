// Mirrors backend/services/riskEngine.js — runs entirely in the browser

function toRad(v) { return (v * Math.PI) / 180; }

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const WEATHER_SCORES = { clear: 0, cloudy: 5, 'heavy-rain': 15, storm: 25, flood: 30, landslide: 35, 'extreme-heat': 20 };
const ZONE_SCORES    = { safe: 0, caution: 25, danger: 45, restricted: 55 };

export function calculateLocalRisk({ latitude, longitude, weather = 'clear', movementSpeed = 0, inactivityMins = 0, zones = [] }) {
  let score = 10;
  const factors = [];

  const zone = zones.find((z) => haversine(latitude, longitude, z.latitude, z.longitude) <= z.radius);
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
  if (hour >= 0 && hour < 5) { score += 12; factors.push('Late night hours'); }

  const capped = Math.min(100, score);
  return {
    score:   capped,
    level:   capped >= 80 ? 'CRITICAL' : capped >= 60 ? 'HIGH' : capped >= 35 ? 'MEDIUM' : 'LOW',
    factors,
    zone
  };
}

export function getRiskColor(level) {
  return { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' }[level] || '#64748b';
}

export function getRiskBg(level) {
  return { CRITICAL: 'bg-red-900/40 border-red-600', HIGH: 'bg-amber-900/40 border-amber-500', MEDIUM: 'bg-blue-900/40 border-blue-500', LOW: 'bg-emerald-900/40 border-emerald-500' }[level] || 'bg-slate-800 border-slate-600';
}
