import { ArrowUpRight, Check, CircleAlert, Inbox, Minus, TrendingDown, TrendingUp } from 'lucide-react';

export function Panel({ eyebrow, title, action, children, className = '', tone = 'default' }) {
  const toneClass = tone === 'critical' ? 'border-red-400/40 bg-red-500/[0.06]' : tone === 'accent' ? 'border-sy-accent/30 bg-sy-accent/[0.04]' : 'border-sy-border bg-sy-card';
  return <section className={`border ${toneClass} ${className}`}><div className="flex items-start justify-between gap-4 border-b border-inherit px-4 py-4 sm:px-5"><div className="min-w-0">{eyebrow && <p className="sy-label">{eyebrow}</p>}{title && <h2 className="mt-1 truncate text-sm font-extrabold text-white sm:text-base">{title}</h2>}</div>{action}</div><div className="p-4 sm:p-5">{children}</div></section>;
}

export function MetricCard({ label, value, detail, tone = 'neutral', icon: Icon, trend, className = '' }) {
  const toneMap = { safe: 'text-sy-success', caution: 'text-sy-warning', high: 'text-sy-high', critical: 'text-sy-critical', accent: 'text-sy-accent', blue: 'text-sy-blue', neutral: 'text-white' };
  return <div className={`border border-sy-border bg-sy-card px-4 py-4 ${className}`}><div className="flex items-start justify-between gap-2"><p className="sy-label">{label}</p>{Icon && <Icon size={16} className={`${toneMap[tone] || toneMap.neutral} opacity-80`} />}</div><div className="mt-3 flex items-end justify-between gap-3"><p className={`font-mono text-2xl font-bold tracking-tight ${toneMap[tone] || toneMap.neutral}`}>{value}</p>{trend && <span className={`flex items-center gap-1 text-[10px] font-bold ${trend.direction === 'down' ? 'text-sy-success' : 'text-sy-high'}`}>{trend.direction === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}{trend.value}</span>}</div>{detail && <p className="mt-2 text-[11px] leading-4 text-white/45">{detail}</p>}</div>;
}

export function RiskProgress({ score, level, label = 'Risk score' }) {
  const colorMap = { SAFE: 'bg-sy-success', CAUTION: 'bg-sy-warning', HIGH: 'bg-sy-high', CRITICAL: 'bg-sy-critical', OFFLINE: 'bg-sy-offline' };
  return <div><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs text-white/55">{label}</span><span className="font-mono text-xs font-bold text-white">{score}% <span className="ml-1 text-[10px] text-white/40">{level}</span></span></div><div className="h-2 bg-sy-bg"><div className={`h-full transition-all duration-500 ${colorMap[level] || colorMap.SAFE}`} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></div></div>;
}

export function StatusPill({ children, tone = 'neutral', icon: Icon }) {
  const map = { safe: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200', caution: 'border-amber-300/30 bg-amber-300/10 text-amber-100', high: 'border-orange-300/30 bg-orange-300/10 text-orange-100', critical: 'border-red-300/30 bg-red-300/10 text-red-100', offline: 'border-slate-300/25 bg-slate-300/10 text-slate-200', blue: 'border-sky-300/30 bg-sky-300/10 text-sky-100', neutral: 'border-white/15 bg-white/[0.05] text-white/70' };
  return <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${map[tone] || map.neutral}`}>{Icon && <Icon size={12} />}{children}</span>;
}

export function Timeline({ items = [], compact = false }) {
  return <div className={`relative ${compact ? 'space-y-3' : 'space-y-5'}`}>{items.map((item, index) => <div key={`${item.time}-${index}`} className="relative flex gap-3"><div className="relative flex w-3 shrink-0 justify-center"><span className={`z-10 mt-1.5 h-2.5 w-2.5 rounded-full border-2 ${item.status === 'resolved' ? 'border-sy-success bg-sy-success' : item.status === 'detected' ? 'border-sy-critical bg-sy-critical' : 'border-sy-accent bg-sy-bg'}`} />{index < items.length - 1 && <span className="absolute top-4 h-full w-px bg-sy-border" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-white">{item.label || item.status}</p><span className="font-mono text-[10px] text-white/40">{item.time}</span></div><p className="mt-1 text-[11px] leading-4 text-white/50">{item.actor}{item.note ? ` · ${item.note}` : ''}</p></div></div>)}</div>;
}

export function EmptyState({ title = 'Nothing here yet', description = 'New events will appear here when they are created.', icon: Icon = Inbox, action }) {
  return <div className="grid min-h-44 place-items-center border border-dashed border-sy-border px-6 py-8 text-center"><Icon size={22} className="text-white/30" /><p className="mt-3 text-sm font-bold text-white/80">{title}</p><p className="mt-1 max-w-xs text-xs leading-5 text-white/45">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function PageIntro({ eyebrow, title, description, action }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 border-b border-sy-border pb-5 sm:flex-row sm:items-end"><div><p className="sy-label text-sy-accent">{eyebrow}</p><h2 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p></div>{action}</div>;
}

export function DataRow({ label, value, mono = false, valueClass = 'text-white' }) {
  return <div className="flex items-center justify-between gap-4 border-b border-sy-border/60 py-3 last:border-0"><span className="text-xs text-white/45">{label}</span><span className={`${mono ? 'font-mono' : ''} text-right text-xs font-bold ${valueClass}`}>{value}</span></div>;
}
