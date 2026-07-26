const items = [
  ['bg-sy-success', 'Safe zone'],
  ['bg-sy-warning', 'Caution zone'],
  ['bg-sy-critical', 'Danger / critical'],
  ['bg-sy-offline', 'Offline / restricted']
];

export default function MapLegend() {
  return <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">{items.map(([dot, label]) => <span key={label} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>)}</div>;
}
