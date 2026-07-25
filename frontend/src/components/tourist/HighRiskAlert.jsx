import { useEffect, useRef, useState } from 'react';
import { startAlertFlow, RESPONSE_TIMEOUT_MS } from '../../services/alertFlow';

export default function HighRiskAlert({ tourist, riskLevel, riskFactors, onSafe, onEscalated }) {
  const [phase, setPhase]       = useState('alerting'); // alerting | safe | escalating | escalated
  const [countdown, setCountdown] = useState(RESPONSE_TIMEOUT_MS / 1000);
  const [steps, setSteps]       = useState([]);
  const flowRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    startAlertFlow({
      tourist,
      riskLevel,
      riskFactors,
      onStateChange: (s) => {
        if (!mounted) return;
        if (s.phase)     setPhase(s.phase);
        if (s.countdown !== undefined) setCountdown(s.countdown);
        if (s.steps)     setSteps(s.steps);
        if (s.phase === 'safe')      onSafe?.();
        if (s.phase === 'escalated') onEscalated?.(s.steps);
      }
    }).then((flow) => { flowRef.current = flow; });

    return () => {
      mounted = false;
      flowRef.current?.cancel();
    };
  }, []);

  const pct = (countdown / (RESPONSE_TIMEOUT_MS / 1000)) * 100;
  const isRed = countdown <= 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-sy-card border-2 border-red-600 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-red-600 px-5 py-4 text-center">
          <p className="text-white font-black text-xl tracking-wide">🚨 HIGH RISK DETECTED</p>
          <p className="text-red-200 text-xs mt-1">{riskLevel} · {tourist?.name}</p>
        </div>

        {/* Flow diagram */}
        <div className="px-5 py-4 space-y-2 text-sm">

          {/* Step 1 — Alert Tourist */}
          <FlowStep icon="⚠️" label="Alert Tourist" status="done" />
          <Arrow />

          {/* Step 2 — Tourist Responds? */}
          {phase === 'alerting' && (
            <>
              <div className="bg-amber-900/30 border border-amber-600 rounded-xl p-3 text-center">
                <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">Are you safe?</p>
                <p className="text-sy-muted text-xs">Respond within</p>
                <p className={`text-4xl font-black mt-1 ${isRed ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                  {countdown}s
                </p>
                {/* progress bar */}
                <div className="mt-2 h-1.5 bg-sy-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${isRed ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
              <Arrow />

              {/* Risk factors */}
              <div className="bg-sy-panel border border-sy-border rounded-xl p-3 space-y-1">
                <p className="text-xs text-sy-muted uppercase tracking-widest font-semibold">Risk Factors</p>
                {(riskFactors || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-sy-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Arrow />

              {/* YES / NO buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={() => flowRef.current?.markSafe()}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-colors">
                  ✅ YES — I'm Safe
                </button>
                <button onClick={() => { flowRef.current?.cancel(); setPhase('escalating'); }}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-colors">
                  🚨 NO — SOS
                </button>
              </div>
            </>
          )}

          {/* Safe path */}
          {phase === 'safe' && (
            <>
              <FlowStep icon="✅" label="Tourist responded — Marked Safe" status="done" color="emerald" />
              <div className="text-center py-4">
                <p className="text-emerald-400 font-black text-lg">You're marked safe!</p>
                <p className="text-sy-muted text-xs mt-1">Monitoring continues in background</p>
              </div>
            </>
          )}

          {/* Escalation path */}
          {(phase === 'escalating' || phase === 'escalated') && (
            <>
              <FlowStep icon="❌" label="No response from tourist" status="done" color="red" />
              <Arrow />
              <FlowStep icon="📱" label="SMS → Emergency Contact"
                status={phase === 'escalated' ? (steps[0]?.status || 'done') : 'trying'} />
              <Arrow />
              <FlowStep icon="🏛️" label="Authority Notified"
                status={phase === 'escalated' ? 'done' : 'trying'} />

              {phase === 'escalated' && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-xl text-center">
                  <p className="text-red-400 font-bold text-sm">🚨 Authorities have been alerted</p>
                  <p className="text-sy-muted text-xs mt-1">Emergency contact notified via SMS</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return <div className="text-center text-sy-muted text-sm">↓</div>;
}

function FlowStep({ icon, label, status, color = 'default' }) {
  const styles = {
    done:    color === 'emerald' ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400'
           : color === 'red'     ? 'bg-red-900/30 border-red-700 text-red-400'
           :                       'bg-sy-panel border-sy-border text-sy-text',
    trying:  'bg-amber-900/30 border-amber-600 text-amber-400 animate-pulse',
    success: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    failed:  'bg-red-900/20 border-red-800 text-red-400',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-semibold ${styles[status] || styles.done}`}>
      <span>{icon}</span>
      <span className="flex-1">{label}</span>
      {status === 'trying'  && <span className="text-xs animate-pulse">⏳</span>}
      {status === 'success' && <span className="text-xs">✅</span>}
      {status === 'failed'  && <span className="text-xs">❌</span>}
    </div>
  );
}
