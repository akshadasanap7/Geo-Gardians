export function getRiskColor(level) {
  return { CRITICAL: '#dc2626', HIGH: '#f59e0b', MEDIUM: '#3b82f6', LOW: '#10b981' }[level] || '#64748b';
}
