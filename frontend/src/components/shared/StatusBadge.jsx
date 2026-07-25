const STYLES = {
  detected:            'bg-red-900/40 text-red-400 border-red-700',
  alerted:             'bg-orange-900/40 text-orange-400 border-orange-700',
  acknowledged:        'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  'responder-assigned':'bg-blue-900/40 text-blue-400 border-blue-700',
  'in-progress':       'bg-purple-900/40 text-purple-400 border-purple-700',
  resolved:            'bg-emerald-900/40 text-emerald-400 border-emerald-700'
};

const LABELS = {
  detected: 'Detected', alerted: 'Alerted', acknowledged: 'Acknowledged',
  'responder-assigned': 'Responder Assigned', 'in-progress': 'In Progress', resolved: 'Resolved'
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'bg-slate-800 text-slate-400 border-slate-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cls}`}>
      {LABELS[status] || status}
    </span>
  );
}
