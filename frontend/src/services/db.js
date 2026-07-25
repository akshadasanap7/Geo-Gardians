import { openDB } from 'idb';

const DB_NAME    = 'safeyatra';
const DB_VERSION = 1;

let _db = null;

async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('locations')) {
        const ls = db.createObjectStore('locations', { keyPath: 'clientId' });
        ls.createIndex('touristId', 'touristId');
        ls.createIndex('synced',    'synced');
      }
      if (!db.objectStoreNames.contains('incidents')) {
        const is = db.createObjectStore('incidents', { keyPath: 'clientId' });
        is.createIndex('touristId', 'touristId');
        is.createIndex('synced',    'synced');
      }
      if (!db.objectStoreNames.contains('tourists')) {
        db.createObjectStore('tourists', { keyPath: 'touristId' });
      }
      if (!db.objectStoreNames.contains('zones')) {
        db.createObjectStore('zones', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const sq = db.createObjectStore('syncQueue', { keyPath: 'clientId' });
        sq.createIndex('status', 'status');
      }
    }
  });
  return _db;
}

// ── locations ─────────────────────────────────────────────────────────────────
export async function saveLocationOffline(record) {
  const db = await getDB();
  await db.put('locations', { ...record, synced: false, createdAt: new Date().toISOString() });
}

export async function getPendingLocations() {
  const db = await getDB();
  return db.getAllFromIndex('locations', 'synced', false);
}

export async function markLocationSynced(clientId) {
  const db = await getDB();
  const rec = await db.get('locations', clientId);
  if (rec) await db.put('locations', { ...rec, synced: true });
}

// ── incidents ─────────────────────────────────────────────────────────────────
export async function saveIncidentOffline(record) {
  const db = await getDB();
  await db.put('incidents', { ...record, synced: false, createdAt: new Date().toISOString() });
}

export async function getPendingIncidents() {
  const db = await getDB();
  return db.getAllFromIndex('incidents', 'synced', false);
}

export async function markIncidentSynced(clientId) {
  const db = await getDB();
  const rec = await db.get('incidents', clientId);
  if (rec) await db.put('incidents', { ...rec, synced: true });
}

// ── tourists ──────────────────────────────────────────────────────────────────
export async function cacheTourist(tourist) {
  const db = await getDB();
  await db.put('tourists', tourist);
}

export async function getCachedTourist(touristId) {
  const db = await getDB();
  return db.get('tourists', touristId);
}

// ── zones ─────────────────────────────────────────────────────────────────────
export async function cacheZones(zones) {
  const db = await getDB();
  const tx = db.transaction('zones', 'readwrite');
  await Promise.all(zones.map((z) => tx.store.put(z)));
  await tx.done;
}

export async function getCachedZones() {
  const db = await getDB();
  return db.getAll('zones');
}

// ── sync queue ────────────────────────────────────────────────────────────────
export async function getPendingCount() {
  const db = await getDB();
  const locs = await getPendingLocations();
  const incs = await getPendingIncidents();
  return locs.length + incs.length;
}
