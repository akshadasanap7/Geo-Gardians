import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const CONFIG = {
  online: { dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'ONLINE', detail: 'All systems connected', Icon: Cloud },
  offline: { dot: 'bg-amber-300 animate-pulse', text: 'text-amber-200', label: 'OFFLINE', detail: 'Safety features continue locally', Icon: CloudOff },
  syncing: { dot: 'bg-sky-300 animate-pulse', text: 'text-sky-200', label: 'SYNCING', detail: 'Uploading pending data', Icon: RefreshCw },
  synced: { dot: 'bg-cyan-300', text: 'text-cyan-200', label: 'SYNC COMPLETE', detail: 'Packets reconciled', Icon: CheckCircle2 }
};

export default function NetworkBadge() {
  const { state } = useApp();
  const cfg = CONFIG[state.networkStatus] || CONFIG.online;
  const StatusIcon = cfg.Icon;
  return <div className="group relative flex items-center gap-2 border border-sy-border bg-sy-panel px-2.5 py-2 text-[10px] font-bold tracking-[0.08em]" title={cfg.detail}><StatusIcon size={13} className={cfg.text} /><span className={`hidden sm:inline ${cfg.text}`}>{cfg.label}</span>{state.pendingSync > 0 && <span className="font-mono text-amber-200">{state.pendingSync}</span>}</div>;
}
