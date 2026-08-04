import { ArrowUpRight, Check, Inbox, TrendingDown, TrendingUp } from 'lucide-react';

export function Panel({ eyebrow, title, action, children, className = '', tone = 'default' }) {
  const toneStyle =
    tone === 'critical' ? { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16 }
    : tone === 'accent'  ? { background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16 }
    : tone === 'warn'    ? { background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 16 }
    : {};
  return (
    <section className={`card overflow-hidden ${className}`} style={tone !== 'default' ? toneStyle : {}}>
      {(eyebrow || title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            {eyebrow && <p className="label">{eyebrow}</p>}
            {title && <h2 className="mt-1 font-heading text-sm font-bold text-text-primary sm:text-base truncate">{title}</h2>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function MetricCard({ label, value, detail, tone = 'neutral', icon: Icon, trend, className = '' }) {
  const toneMap = {
    safe:    { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'   },
    warn:    { color: '#EAB308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.2)'   },
    caution: { color: '#EAB308', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.2)'   },
    high:    { color: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)'  },
    critical:{ color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
    accent:  { color: '#14B8A6', bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.2)'  },
    blue:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
    purple:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)'  },
    neutral: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
  };
  const t = toneMap[tone] || toneMap.neutral;
  return (
    <div className={`card p-5 transition-all duration-200 hover:scale-[1.02] ${className}`}
      style={{ borderColor: t.border }}>
      <div className="flex items-start justify-between gap-2">
        <p className="label">{label}</p>
        {Icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: t.bg }}>
            <Icon size={15} style={{ color: t.color }} />
          </div>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold leading-none" style={{ color: t.color }}>{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {detail && <p className="text-[11px] leading-4 text-text-muted">{detail}</p>}
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-bold ${trend.direction === 'down' ? 'text-safe' : 'text-danger'}`}>
            {trend.direction === 'down' ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export function RiskProgress({ score, level, label = 'Risk score' }) {
  const colorMap = {
    SAFE:    '#22C55E',
    MEDIUM:  '#3B82F6',
    HIGH:    '#F97316',
    CRITICAL:'#EF4444',
    OFFLINE: '#94A3B8',
  };
  const color = colorMap[level] || colorMap.SAFE;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="font-mono text-xs font-bold text-text-primary">{score}% <span className="ml-1 text-[10px] text-text-muted">{level}</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

export function StatusPill({ children, tone = 'neutral', icon: Icon }) {
  const map = {
    safe:    { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E', border: 'rgba(34,197,94,0.25)'   },
    caution: { bg: 'rgba(234,179,8,0.12)',   color: '#EAB308', border: 'rgba(234,179,8,0.25)'   },
    high:    { bg: 'rgba(249,115,22,0.12)',  color: '#F97316', border: 'rgba(249,115,22,0.25)'  },
    critical:{ bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
    offline: { bg: 'rgba(148,163,184,0.1)',  color: '#94A3B8', border: 'rgba(148,163,184,0.2)'  },
    blue:    { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6', border: 'rgba(59,130,246,0.25)'  },
    accent:  { bg: 'rgba(20,184,166,0.12)',  color: '#14B8A6', border: 'rgba(20,184,166,0.25)'  },
    neutral: { bg: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: 'rgba(255,255,255,0.1)'  },
  };
  const s = map[tone] || map.neutral;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

export function Timeline({ items = [], compact = false }) {
  return (
    <div className={`relative ${compact ? 'space-y-3' : 'space-y-4'}`}>
      {items.map((item, i) => (
        <div key={`${item.time}-${i}`} className="relative flex gap-3">
          <div className="relative flex w-4 flex-shrink-0 justify-center">
            <span className={`z-10 mt-1.5 h-2.5 w-2.5 rounded-full border-2 ${
              item.status === 'resolved' ? 'border-safe bg-safe'
              : item.status === 'detected' ? 'border-danger bg-danger'
              : 'border-accent bg-bg-primary'
            }`} />
            {i < items.length - 1 && <span className="absolute top-4 h-full w-px bg-white/[0.08]" />}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-text-primary">{item.label || item.status}</p>
              <span className="font-mono text-[10px] text-text-muted">{item.time}</span>
            </div>
            <p className="mt-0.5 text-[11px] leading-4 text-text-muted">{item.actor}{item.note ? ` · ${item.note}` : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', description = 'New events will appear here when they are created.', icon: Icon = Inbox, action }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-white/[0.08] px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Icon size={20} className="text-text-muted" />
      </div>
      <p className="mt-3 font-heading text-sm font-bold text-text-primary">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="label-accent">{eyebrow}</p>}
        <h2 className="mt-2 max-w-3xl font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function DataRow({ label, value, mono = false, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-3 last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`${mono ? 'font-mono' : 'font-semibold'} text-right text-xs text-text-primary ${valueClass}`}>{value}</span>
    </div>
  );
}
