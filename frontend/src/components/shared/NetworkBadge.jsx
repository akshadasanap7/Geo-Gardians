import { useApp } from '../../store/AppContext';

const CONFIG = {
  online:  { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Online' },
  offline: { dot: 'bg-red-500 animate-pulse', text: 'text-red-400', label: 'Offline' },
  syncing: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'Syncing…' }
};

export default function NetworkBadge() {
  const { state } = useApp();
  const cfg = CONFIG[state.networkStatus] || CONFIG.online;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sy-card border border-sy-border text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className={cfg.text}>{cfg.label}</span>
      {state.pendingSync > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
          {state.pendingSync} pending
        </span>
      )}
    </div>
  );
}
