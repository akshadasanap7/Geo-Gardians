import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Clock3 } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const statusCopy = {
  online: { label: 'ONLINE', detail: 'WSS://CONNECTED', Icon: Cloud, className: 'text-emerald-300' },
  offline: { label: 'OFFLINE', detail: 'LOCAL_CACHE', Icon: CloudOff, className: 'text-amber-200' },
  syncing: { label: 'SYNCING', detail: 'UPLOADING_PACKETS', Icon: RefreshCw, className: 'text-sky-200' },
  synced: { label: 'SYNC COMPLETE', detail: 'PACKETS_RECONCILED', Icon: Cloud, className: 'text-cyan-200' }
};

export default function TelemetryBar() {
  const { state } = useApp();
  const [time, setTime] = useState(new Date());
  const config = statusCopy[state.networkStatus] || statusCopy.online;
  const StatusIcon = config.Icon;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 flex h-7 items-center justify-between gap-3 border-t border-sy-border bg-sy-bg/95 px-3 font-mono text-[9px] uppercase tracking-[0.12em] backdrop-blur ${state.networkStatus === 'offline' ? 'animate-pulse-soft' : ''}`}>
      <div className={`flex min-w-0 items-center gap-2 ${config.className}`}><StatusIcon size={12} className={state.networkStatus === 'syncing' ? 'animate-spin' : ''} /><span>{config.label}</span><span className="hidden text-white/45 sm:inline">{config.detail}</span></div>
      <div className="flex items-center gap-2 text-white/60"><span className="hidden sm:inline">PENDING</span><span className="text-white">{state.pendingSync}</span><span className="hidden xs:inline">PKT</span></div>
      <div className="flex items-center gap-1.5 text-white/50"><Clock3 size={11} /><span>{time.toISOString().slice(11, 19)} UTC</span></div>
    </div>
  );
}
