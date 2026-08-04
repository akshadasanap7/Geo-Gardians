const STYLES = {
  detected:             { bg:'rgba(239,68,68,0.12)',   color:'#EF4444', border:'rgba(239,68,68,0.25)'   },
  alerted:              { bg:'rgba(249,115,22,0.12)',  color:'#F97316', border:'rgba(249,115,22,0.25)'  },
  acknowledged:         { bg:'rgba(234,179,8,0.12)',   color:'#EAB308', border:'rgba(234,179,8,0.25)'   },
  'responder-assigned': { bg:'rgba(59,130,246,0.12)',  color:'#3B82F6', border:'rgba(59,130,246,0.25)'  },
  'in-progress':        { bg:'rgba(139,92,246,0.12)',  color:'#8B5CF6', border:'rgba(139,92,246,0.25)'  },
  resolved:             { bg:'rgba(34,197,94,0.12)',   color:'#22C55E', border:'rgba(34,197,94,0.25)'   },
};

const LABELS = {
  detected:'Detected', alerted:'Alerted', acknowledged:'Acknowledged',
  'responder-assigned':'Assigned', 'in-progress':'In Progress', resolved:'Resolved',
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] || { bg:'rgba(148,163,184,0.1)', color:'#94A3B8', border:'rgba(148,163,184,0.2)' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {LABELS[status] || status}
    </span>
  );
}
