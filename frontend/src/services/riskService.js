const LEVELS = [
  { min: 80, label: 'CRITICAL' },
  { min: 60, label: 'HIGH' },
  { min: 35, label: 'CAUTION' },
  { min: 0, label: 'SAFE' }
];

export function getRiskLevel(score) {
  return LEVELS.find((level) => score >= level.min)?.label || 'SAFE';
}

export function calculateRisk({ baseScore = 18, inDangerZone = false, inactivityMins = 0, weather = 'clear', nightTime = false }) {
  const zoneScore = inDangerZone ? 45 : 0;
  const inactivityScore = Math.min(inactivityMins, 60) * 0.55;
  const weatherScore = { clear: 0, cloudy: 4, 'heavy-rain': 18, storm: 28, flood: 34, landslide: 38 }[weather] || 0;
  const nightScore = nightTime ? 10 : 0;
  const score = Math.min(100, Math.round(Math.max(baseScore, baseScore + zoneScore + inactivityScore + weatherScore + nightScore)));
  const level = getRiskLevel(score);
  const factors = [];
  if (inDangerZone) factors.push('Entered danger zone');
  if (inactivityMins >= 20) factors.push(`No movement for ${inactivityMins} minutes`);
  if (nightTime) factors.push('Night-time travel detected');
  if (weather !== 'clear') factors.push(`Weather risk: ${weather.replace('-', ' ')}`);
  if (!factors.length) factors.push('Baseline monitoring active');
  return { score, level, factors };
}
