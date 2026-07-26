const STORAGE_KEY = 'sy_pending_events';

export function getPendingEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function queuePendingEvent(event) {
  const queue = [...getPendingEvents(), { ...event, queuedAt: new Date().toISOString() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
}

export function clearPendingEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncPendingEvents(onProgress) {
  const pending = getPendingEvents();
  for (let index = 0; index < pending.length; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    onProgress?.({ completed: index + 1, total: pending.length, event: pending[index] });
  }
  clearPendingEvents();
  return pending;
}
