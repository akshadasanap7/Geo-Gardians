import api from './api';
import {
  getPendingLocations, markLocationSynced,
  getPendingIncidents, markIncidentSynced
} from './db';

let _syncing = false;

export async function syncPendingData(onProgress) {
  if (_syncing) return;
  _syncing = true;
  const results = { locations: 0, incidents: 0, failed: 0 };

  try {
    // ── SOS incidents first (highest priority) ────────────────────────────────
    const incs = await getPendingIncidents();
    for (const inc of incs) {
      try {
        await api.post('/incidents/sos', { ...inc, clientId: inc.clientId });
        await markIncidentSynced(inc.clientId);
        results.incidents++;
        onProgress?.({ type: 'incident', clientId: inc.clientId });
      } catch { results.failed++; }
    }

    // ── locations second ──────────────────────────────────────────────────────
    const locs = await getPendingLocations();
    for (const loc of locs) {
      try {
        await api.post('/locations', { ...loc, clientId: loc.clientId });
        await markLocationSynced(loc.clientId);
        results.locations++;
        onProgress?.({ type: 'location', clientId: loc.clientId });
      } catch { results.failed++; }
    }
  } finally {
    _syncing = false;
  }

  return results;
}

export function startSyncWatcher(onStatusChange, onProgress) {
  let wasOnline = navigator.onLine;

  const check = async () => {
    const isOnline = navigator.onLine;
    if (isOnline && !wasOnline) {
      // came back online — sync immediately
      onStatusChange?.('syncing');
      await syncPendingData(onProgress);
      onStatusChange?.(navigator.onLine ? 'online' : 'offline');
    }
    wasOnline = isOnline;
    onStatusChange?.(isOnline ? 'online' : 'offline');
  };

  window.addEventListener('online',  check);
  window.addEventListener('offline', check);

  // check every 10s (more aggressive than before)
  const interval = setInterval(check, 10000);

  // initial sync on load
  if (navigator.onLine) syncPendingData(onProgress);

  return () => {
    window.removeEventListener('online',  check);
    window.removeEventListener('offline', check);
    clearInterval(interval);
  };
}
