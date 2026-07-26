import { X, CheckCircle2, TriangleAlert, Info, Radio } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const iconMap = { success: CheckCircle2, warning: TriangleAlert, error: TriangleAlert, info: Info, sync: Radio };
const toneMap = {
  success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-300/40 bg-amber-300/10 text-amber-100',
  error: 'border-red-400/40 bg-red-400/10 text-red-100',
  info: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  sync: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
};

export default function ToastStack() {
  const { state, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-[360px]" aria-live="polite">
      {state.toasts.map((toast) => {
        const ToastIcon = iconMap[toast.type] || Info;
        return (
          <div key={toast.id} className={`pointer-events-auto flex w-full items-start gap-3 border px-4 py-3 shadow-2xl animate-slide-up ${toneMap[toast.type] || toneMap.info}`}>
            <ToastIcon size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              {toast.title && <p className="text-xs font-bold uppercase tracking-[0.13em]">{toast.title}</p>}
              <p className="mt-1 text-sm leading-5 text-white/80">{toast.message}</p>
            </div>
            <button onClick={() => dismissToast(toast.id)} className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Dismiss notification"><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}
