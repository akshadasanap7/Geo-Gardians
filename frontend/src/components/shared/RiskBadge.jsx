const STYLES = {
  CRITICAL: { bg:'rgba(239,68,68,0.12)',  color:'#EF4444', border:'rgba(239,68,68,0.3)'  },
  HIGH:     { bg:'rgba(249,115,22,0.12)', color:'#F97316', border:'rgba(249,115,22,0.3)' },
  MEDIUM:   { bg:'rgba(59,130,246,0.12)', color:'#3B82F6', border:'rgba(59,130,246,0.3)' },
  SAFE:     { bg:'rgba(34,197,94,0.12)',  color:'#22C55E', border:'rgba(34,197,94,0.3)'  },
  LOW:      { bg:'rgba(34,197,94,0.12)',  color:'#22C55E', border:'rgba(34,197,94,0.3)'  },
  OFFLINE:  { bg:'rgba(148,163,184,0.1)', color:'#94A3B8', border:'rgba(148,163,184,0.2)'},
};

export default function RiskBadge({ level, score, size = 'sm' }) {
  const s = STYLES[level] || STYLES.OFFLINE;
  const pad = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad}`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {level}{score !== undefined && ` · ${score}`}
    </span>
  );
}
