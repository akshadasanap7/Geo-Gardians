export function getRiskColor(level) {
  return { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' }[level] || '#64748b';
}

export function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function severityColor(severity) {
  return { critical: 'text-red-400', high: 'text-amber-400', medium: 'text-blue-400', low: 'text-emerald-400' }[severity] || 'text-slate-400';
}

export function statusLabel(status) {
  return { safe: '✅ Safe', monitoring: '👁 Monitoring', 'high-risk': '⚠️ High Risk', emergency: '🚨 Emergency', offline: '📴 Offline' }[status] || status;
}
