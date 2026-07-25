import { v4 as uuid } from 'uuid';
import api from './api';
import { saveIncidentOffline, getPendingIncidents, markIncidentSynced } from './db';

// ── escalation step labels shown in UI ───────────────────────────────────────
export const STEPS = [
  { id: 'internet',   label: 'Sending online alert…',        icon: '🌐' },
  { id: 'sms',        label: 'Trying SMS fallback…',         icon: '📱' },
  { id: 'bluetooth',  label: 'Scanning nearby devices…',     icon: '🔵' },
  { id: 'local',      label: 'Storing SOS locally…',         icon: '💾' },
  { id: 'sync',       label: 'Will sync when online',        icon: '🔄' },
];

// ── check internet by hitting health endpoint ─────────────────────────────────
async function hasInternet() {
  if (!navigator.onLine) return false;
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

// ── simulate SMS (Web SMS API not available in browsers — show UI feedback) ───
async function trySMS(tourist, payload) {
  // In production: call backend → Twilio/MSG91
  // Here we simulate a 1s attempt and mark as "queued"
  await new Promise((r) => setTimeout(r, 1000));
  const smsPayload = {
    ...payload,
    smsQueued: true,
    smsTarget: tourist?.emergencyContact || 'emergency-contact',
    smsText: `🚨 SOS from ${tourist?.name || 'Tourist'} (${tourist?.touristId}). Location: ${payload.latitude?.toFixed(4)}, ${payload.longitude?.toFixed(4)}. Risk: HIGH. Please respond immediately.`
  };
  // save to offline store with sms flag so backend can send on sync
  await saveIncidentOffline({ ...smsPayload, type: 'sos', severity: 'high', channel: 'sms' });
  return true;
}

// ── simulate Bluetooth mesh (Web Bluetooth API — flag for nearby devices) ─────
async function tryBluetooth(payload) {
  // Web Bluetooth requires user gesture + HTTPS in production
  // We simulate detection and store with mesh flag
  await new Promise((r) => setTimeout(r, 800));
  await saveIncidentOffline({ ...payload, type: 'sos', severity: 'high', channel: 'bluetooth-mesh', meshBroadcast: true });
  return true;
}

// ── main escalation function ──────────────────────────────────────────────────
export async function escalateSOS({ tourist, location, onStep, onComplete }) {
  const clientId = uuid();
  const payload = {
    touristId:  tourist?.touristId,
    latitude:   location?.latitude  || tourist?.lastLocation?.latitude,
    longitude:  location?.longitude || tourist?.lastLocation?.longitude,
    clientId,
    message:    '🚨 SOS triggered by tourist via escalation engine',
    riskLevel:  tourist?.latestRiskLevel || 'HIGH',
    timestamp:  new Date().toISOString()
  };

  const result = {
    clientId,
    channel: null,   // which channel succeeded
    offline: false,
    steps:   []
  };

  // ── STEP 1: Internet ────────────────────────────────────────────────────────
  onStep?.('internet', 'trying');
  const online = await hasInternet();

  if (online) {
    try {
      await api.post('/incidents/sos', payload);
      onStep?.('internet', 'success');
      result.channel = 'internet';
      onComplete?.({ ...result, offline: false });
      return result;
    } catch {
      onStep?.('internet', 'failed');
    }
  } else {
    onStep?.('internet', 'failed');
  }

  // ── STEP 2: SMS fallback ────────────────────────────────────────────────────
  onStep?.('sms', 'trying');
  try {
    await trySMS(tourist, payload);
    onStep?.('sms', 'success');
    result.channel = 'sms';
    result.offline = true;
    onComplete?.({ ...result });
    return result;
  } catch {
    onStep?.('sms', 'failed');
  }

  // ── STEP 3: Bluetooth mesh ──────────────────────────────────────────────────
  onStep?.('bluetooth', 'trying');
  try {
    await tryBluetooth(payload);
    onStep?.('bluetooth', 'success');
    result.channel = 'bluetooth';
    result.offline = true;
    onComplete?.({ ...result });
    return result;
  } catch {
    onStep?.('bluetooth', 'failed');
  }

  // ── STEP 4: Store locally ───────────────────────────────────────────────────
  onStep?.('local', 'trying');
  await saveIncidentOffline({ ...payload, type: 'sos', severity: 'high', channel: 'local' });
  onStep?.('local', 'success');
  result.channel = 'local';
  result.offline = true;

  // ── STEP 5: Register sync watcher ──────────────────────────────────────────
  onStep?.('sync', 'waiting');
  registerOnlineSync(clientId, payload, onStep);

  onComplete?.({ ...result });
  return result;
}

// ── auto-sync when network comes back ────────────────────────────────────────
function registerOnlineSync(clientId, payload, onStep) {
  async function attemptSync() {
    if (!navigator.onLine) return;
    try {
      const pending = await getPendingIncidents();
      const mine = pending.find((p) => p.clientId === clientId);
      if (!mine) return; // already synced
      await api.post('/incidents/sos', { ...mine });
      await markIncidentSynced(clientId);
      onStep?.('sync', 'success');
      window.removeEventListener('online', attemptSync);
    } catch {}
  }
  window.addEventListener('online', attemptSync);
  // also try every 30s
  const interval = setInterval(async () => {
    await attemptSync();
    const pending = await getPendingIncidents();
    if (!pending.find((p) => p.clientId === clientId)) clearInterval(interval);
  }, 30000);
}
