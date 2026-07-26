export function isInsideZone(location, zone) {
  if (!location || !zone) return false;
  const latDistance = (location.latitude - zone.latitude) * 111;
  const lonDistance = (location.longitude - zone.longitude) * 111;
  return Math.sqrt(latDistance ** 2 + lonDistance ** 2) <= zone.radius;
}

export function findZone(location, zones = []) {
  return zones.find((zone) => isInsideZone(location, zone)) || null;
}

export function getZoneMessage(zone) {
  if (!zone) return 'Open monitored area';
  const copy = {
    safe: 'You are inside a patrolled safe corridor.',
    caution: 'Stay alert and keep your check-in interval active.',
    danger: 'Move to a safe location immediately and keep SOS ready.',
    restricted: 'This area is restricted. Turn back now.'
  };
  return copy[zone.type] || 'Area monitoring active.';
}
