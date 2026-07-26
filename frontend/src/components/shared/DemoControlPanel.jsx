import { ChevronDown, Radio, RotateCcw, Route, TriangleAlert, Siren, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../store/AppContext';

export default function DemoControlPanel() {
  const { state, simulateNetworkLoss, restoreNetwork, simulateMovement, enterDangerZone, simulateHighRisk, triggerSOS, resolveLatestIncident } = useApp();
  const [open, setOpen] = useState(true);
  const isOffline = state.networkStatus === 'offline';

  return (
    <div className="fixed bottom-10 right-3 z-40 w-[calc(100vw-1.5rem)] max-w-[340px] sm:right-5">
      <div className="border border-sy-border bg-sy-panel/95 shadow-2xl backdrop-blur">
        <button onClick={() => setOpen((value) => !value)} className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.03]" aria-expanded={open}>
          <span className="flex items-center gap-2"><Radio size={16} className="text-sy-accent" /><span><span className="block text-xs font-bold uppercase tracking-[0.14em] text-white">Demo controls</span><span className="block text-[10px] text-white/45">Use these actions during your walkthrough</span></span></span>
          <ChevronDown size={16} className={`text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="grid grid-cols-2 gap-2 border-t border-sy-border p-3">
            <button onClick={isOffline ? restoreNetwork : simulateNetworkLoss} className={`flex min-h-10 items-center gap-2 border px-3 text-left text-[11px] font-bold ${isOffline ? 'border-sy-accent/40 text-sy-accent' : 'border-amber-400/40 text-amber-200'}`}>
              {isOffline ? <RotateCcw size={14} /> : <Radio size={14} />}{isOffline ? 'Restore network' : 'Simulate loss'}
            </button>
            <button onClick={simulateMovement} className="flex min-h-10 items-center gap-2 border border-sy-blue/40 px-3 text-left text-[11px] font-bold text-sky-200"><Route size={14} />Simulate movement</button>
            <button onClick={enterDangerZone} className="flex min-h-10 items-center gap-2 border border-orange-300/40 px-3 text-left text-[11px] font-bold text-orange-200"><TriangleAlert size={14} />Enter danger zone</button>
            <button onClick={simulateHighRisk} className="flex min-h-10 items-center gap-2 border border-red-300/40 px-3 text-left text-[11px] font-bold text-red-200"><TriangleAlert size={14} />Simulate high risk</button>
            <button onClick={() => triggerSOS()} className="flex min-h-10 items-center gap-2 border border-red-400/60 bg-red-500/10 px-3 text-left text-[11px] font-bold text-red-100"><Siren size={14} />Trigger SOS</button>
            <button onClick={resolveLatestIncident} className="flex min-h-10 items-center gap-2 border border-emerald-300/40 px-3 text-left text-[11px] font-bold text-emerald-200"><CheckCheck size={14} />Resolve latest</button>
          </div>
        )}
      </div>
    </div>
  );
}
