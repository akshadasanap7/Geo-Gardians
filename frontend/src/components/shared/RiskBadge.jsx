const STYLES = {
  CRITICAL: 'bg-red-900/50 text-red-400 border-red-700',
  HIGH:     'bg-amber-900/50 text-amber-400 border-amber-700',
  MEDIUM:   'bg-blue-900/50 text-blue-400 border-blue-700',
  LOW:      'bg-emerald-900/50 text-emerald-400 border-emerald-700'
};

export default function RiskBadge({ level, score, size = 'sm' }) {
  const cls = STYLES[level] || 'bg-slate-800 text-slate-400 border-slate-600';
  const pad = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${cls} ${pad}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level}{score !== undefined && ` · ${score}`}
    </span>
  );
}
