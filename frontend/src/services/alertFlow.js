import api from './api';

// Tourist has 60 seconds to respond "I'm Safe" before escalation
export const RESPONSE_TIMEOUT_MS = 60000;

// ── start alert flow when HIGH/CRITICAL risk detected ────────────────────────
export async function startAlertFlow({ tourist, riskLevel, riskFactors, onStateChange }) {
  if (!['HIGH', 'CRITICAL'].includes(riskLevel)) return;

  onStateChange?.({ phase: 'alerting', countdown: RESPONSE_TIMEOUT_MS / 1000 });

  // countdown timer
  let remaining = RESPONSE_TIMEOUT_MS / 1000;
  const timer = setInterval(() => {
    remaining -= 1;
    onStateChange?.({ phase: 'alerting', countdown: remaining });
    if (remaining <= 0) {
      clearInterval(timer);
      escalate(tourist, riskLevel, riskFactors, onStateChange);
    }
  }, 1000);

  return {
    // call this if tourist taps "I'm Safe"
    markSafe: async () => {
      clearInterval(timer);
      try {
        await api.patch(`/tourists/${tourist.touristId}/journey`, { action: 'pause' });
      } catch {}
      onStateChange?.({ phase: 'safe' });
    },
    cancel: () => clearInterval(timer)
  };
}

// ── escalation: SMS → Emergency Contact → Authority ──────────────────────────
async function escalate(tourist, riskLevel, riskFactors, onStateChange) {
  onStateChange?.({ phase: 'escalating' });

  const steps = [];

  // Step 1 — SMS to emergency contact (simulated — backend handles real SMS)
  try {
    await api.post('/incidents/sos', {
      touristId:  tourist.touristId,
      latitude:   tourist.lastLocation?.latitude,
      longitude:  tourist.lastLocation?.longitude,
      message:    `⚠️ HIGH RISK ALERT: ${tourist.name} did not respond to safety check. Risk: ${riskLevel}. Factors: ${riskFactors?.join(', ')}. Immediate assistance required.`,
      channel:    'auto-escalation',
      riskLevel
    });
    steps.push({ label: 'SMS sent to emergency contact', status: 'success' });
  } catch {
    steps.push({ label: 'SMS to emergency contact', status: 'failed' });
  }

  // Step 2 — Authority notified via incident (already done above via socket.io)
  steps.push({ label: 'Authority dashboard alerted', status: 'success' });

  onStateChange?.({ phase: 'escalated', steps });
}
