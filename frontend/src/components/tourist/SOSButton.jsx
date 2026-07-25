import { useState, useRef } from 'react';
import { escalateSOS, STEPS } from '../../services/sosEscalation';

const HOLD_MS = 1500;

// status → style
const STATUS_STYLE = {
  idle:    'bg-sy-panel border-sy-border text-sy-muted',
  trying:  'bg-amber-900/30 border-amber-600 text-amber-400 animate-pulse',
  success: 'bg-emerald-900/30 border-emerald-600 text-emerald-400',
  failed:  'bg-red-900/20 border-red-800 text-red-500 line-through opacity-50',
  waiting: 'bg-blue-900/30 border-blue-600 text-blue-400 animate-pulse',
};

export default function SOSButton({ tourist, location, onTriggered }) {
  const [phase, setPhase]       = useState('idle'); // idle | holding | escalating | done
  const [progress, setProgress] = useState(0);
  const [stepStatus, setStepStatus] = useState({}); // stepId → status
  const [channel, setChannel]   = useState(null);
  const holdTimer    = useRef(null);
  const progressTimer = useRef(null);

  function updateStep(id, status) {
    setStepStatus((prev) => ({ ...prev, [id]: status }));
  }

  function startHold() {
    if (phase === 'done' || phase === 'escalating') return;
    setPhase('holding');
    setProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / HOLD_MS) * 100);
      setProgress(pct);
    }, 30);
    holdTimer.current = setTimeout(triggerSOS, HOLD_MS);
  }

  function cancelHold() {
    clearTimeout(holdTimer.current);
    clearInterval(progressTimer.current);
    if (phase === 'holding') { setPhase('idle'); setProgress(0); }
  }

  async function triggerSOS() {
    clearInterval(progressTimer.current);
    setProgress(100);
    setPhase('escalating');
    setStepStatus({});

    await escalateSOS({
      tourist,
      location,
      onStep: updateStep,
      onComplete: (result) => {
        setChannel(result.channel);
        setPhase('done');
        onTriggered?.(result);
      }
    });
  }

  const isDone       = phase === 'done';
  const isEscalating = phase === 'escalating';
  const isHolding    = phase === 'holding';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">

      {/* SOS Button */}
      <div className="relative">
        {isDone && (
          <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
        )}
        <button
          onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
          onTouchStart={startHold} onTouchEnd={cancelHold}
          disabled={isEscalating}
          className={`relative w-40 h-40 rounded-full font-black text-white text-2xl shadow-2xl
            transition-all duration-150 select-none border-4
            ${isDone
              ? 'bg-red-700 border-red-500 scale-95'
              : 'bg-red-600 hover:bg-red-500 border-red-400 active:scale-95'
            } ${isEscalating ? 'opacity-70 cursor-not-allowed' : ''}`}
          style={{
            background: isHolding
              ? `conic-gradient(#ef4444 ${progress * 3.6}deg, #7f1d1d ${progress * 3.6}deg)`
              : undefined
          }}
        >
          {isEscalating ? '⏳' : isDone ? '✓ SENT' : '🚨 SOS'}
        </button>
      </div>

      <p className="text-xs text-sy-muted text-center">
        {isDone
          ? `✅ Alert sent via ${channel?.toUpperCase()}`
          : isEscalating
          ? 'Escalating through all channels…'
          : 'Hold for 1.5 seconds to trigger SOS'}
      </p>

      {/* Escalation flow — shown during and after escalation */}
      {(isEscalating || isDone) && (
        <div className="w-full space-y-2">
          <p className="text-xs text-sy-muted uppercase tracking-widest font-semibold text-center mb-3">
            🚨 HIGH RISK — Escalation Chain
          </p>
          {STEPS.map((step, i) => {
            const status = stepStatus[step.id] || 'idle';
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${STATUS_STYLE[status]}`}>
                  <span className="text-base">{step.icon}</span>
                  <span className="flex-1">{step.label}</span>
                  <span className="text-xs">
                    {status === 'trying'  && '⏳'}
                    {status === 'success' && '✅'}
                    {status === 'failed'  && '❌'}
                    {status === 'waiting' && '🔄'}
                  </span>
                </div>
                {/* arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div className="text-sy-muted text-xs my-0.5">↓</div>
                )}
              </div>
            );
          })}

          {isDone && channel && (
            <div className="mt-3 p-3 bg-emerald-900/30 border border-emerald-700 rounded-xl text-center text-emerald-400 text-sm font-bold">
              ✅ SOS delivered via {channel === 'internet' ? '🌐 Internet' : channel === 'sms' ? '📱 SMS' : channel === 'bluetooth' ? '🔵 Bluetooth Mesh' : '💾 Local (syncs when online)'}
            </div>
          )}
        </div>
      )}

      {!tourist && (
        <p className="text-sy-muted text-xs text-center">Register as a tourist first to enable SOS</p>
      )}
    </div>
  );
}
