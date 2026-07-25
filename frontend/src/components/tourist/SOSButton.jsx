import { useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import api from '../../services/api';
import { saveIncidentOffline } from '../../services/db';
import { useApp } from '../../store/AppContext';

export default function SOSButton({ tourist, location, onTriggered }) {
  const { state } = useApp();
  const [phase, setPhase]   = useState('idle');   // idle | holding | sending | sent | error
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef(null);
  const progressTimer = useRef(null);

  const HOLD_MS = 1500;

  function startHold() {
    if (phase === 'sent') return;
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
    setPhase('sending');

    const clientId = uuid();
    const payload = {
      touristId:  tourist?.touristId,
      latitude:   location?.latitude,
      longitude:  location?.longitude,
      clientId,
      message:    'SOS triggered by tourist'
    };

    try {
      if (state.networkStatus === 'online') {
        await api.post('/incidents/sos', payload);
      } else {
        await saveIncidentOffline({ ...payload, type: 'sos', severity: 'high' });
      }
      setPhase('sent');
      onTriggered?.({ clientId, offline: state.networkStatus !== 'online' });
    } catch {
      await saveIncidentOffline({ ...payload, type: 'sos', severity: 'high' });
      setPhase('sent');
      onTriggered?.({ clientId, offline: true });
    }
  }

  const isSent = phase === 'sent';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* pulse ring for emergency */}
        {isSent && (
          <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        )}
        <button
          onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
          onTouchStart={startHold} onTouchEnd={cancelHold}
          disabled={phase === 'sending'}
          className={`relative w-36 h-36 rounded-full font-black text-white text-xl shadow-2xl
            transition-all duration-150 select-none border-4
            ${isSent
              ? 'bg-red-700 border-red-500 scale-95'
              : 'bg-red-600 hover:bg-red-500 border-red-400 active:scale-95'
            }`}
          style={{
            background: phase === 'holding'
              ? `conic-gradient(#ef4444 ${progress * 3.6}deg, #7f1d1d ${progress * 3.6}deg)`
              : undefined
          }}
        >
          {phase === 'sending' ? '…' : isSent ? '✓ SENT' : '🚨 SOS'}
        </button>
      </div>
      <p className="text-xs text-sy-muted text-center">
        {isSent
          ? `Emergency alert sent${state.networkStatus !== 'online' ? ' (queued offline)' : ''}`
          : 'Hold for 1.5 seconds to trigger SOS'}
      </p>
    </div>
  );
}
