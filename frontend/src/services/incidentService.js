import { mockIncidents } from '../data/mockIncidents';

const statusLabels = {
  detected: 'Detected',
  acknowledged: 'Acknowledged',
  'responder-assigned': 'Responder assigned',
  'in-progress': 'In progress',
  resolved: 'Resolved'
};

export function createIncident({ tourist, reason, source = 'DEMO', status = 'detected', severity = 'CRITICAL', riskScore = 87 }) {
  const id = `INC-2026-${String(mockIncidents.length + Math.floor(Math.random() * 8) + 1).padStart(3, '0')}`;
  return {
    incidentId: id,
    touristId: tourist.touristId,
    touristName: tourist.name,
    severity,
    riskScore,
    reason,
    message: `${source === 'SOS' ? 'SOS alert' : 'Risk event'} created in the SafeYatra demo workflow.`,
    status,
    location: tourist.location,
    zoneName: tourist.zoneName,
    createdAt: new Date().toISOString(),
    assignedResponder: null,
    source,
    timeline: [{ status, label: statusLabels[status] || status, time: new Date().toISOString().slice(11, 19), actor: source === 'SOS' ? 'Tourist device' : 'AI Risk Engine' }]
  };
}

export function advanceIncident(incident, status, actor = 'Control Room', note = '') {
  const timestamp = new Date().toISOString();
  return {
    ...incident,
    status,
    timeline: [...(incident.timeline || []), { status, label: statusLabels[status] || status, time: timestamp.slice(11, 19), actor, note }]
  };
}
