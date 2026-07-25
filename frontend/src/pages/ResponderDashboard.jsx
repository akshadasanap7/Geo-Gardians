import { useState, useEffect, useCallback } from 'react';
import Shell from '../components/shared/Shell';
import LiveMap from '../components/shared/LiveMap';
import StatusBadge from '../components/shared/StatusBadge';
import RiskBadge from '../components/shared/RiskBadge';
import api from '../services/api';
import { useApp } from '../store/AppContext';
import { formatDateTime, severityColor } from '../utils/helpers';

export default function ResponderDashboard() {
  const { state } = useApp();
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones]         = useState([]);
  const [focused, setFocused]     = useState(null);
  const [note, setNote]           = useState('');

  const load = useCallback(async () => {
    try {
      const [inc, z] = await Promise.all([api.get('/incidents?status=active'), api.get('/geofences')]);
      setIncidents(inc);
      setZones(z);
    } catch {}
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  // merge live socket SOS
  useEffect(() => {
    if (state.liveIncidents.length) {
      setIncidents((prev) => {
        const ids = new Set(state.liveIncidents.map((i) => i.incidentId));
        return [...state.liveIncidents.filter((i) => i.status !== 'resolved'), ...prev.filter((i) => !ids.has(i.incidentId))];
      });
    }
  }, [state.liveIncidents]);

  async function updateStatus(id, status) {
    await api.patch(`/incidents/${id}`, { status, responderNotes: note, assignedResponder: state.user?.name });
    setNote('');
    setFocused(null);
    load();
  }

  const focusedInc = incidents.find((i) => i.incidentId === focused || i._id === focused);

  return (
    <Shell title="Responder Dashboard" icon="🚑">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Incident queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Active Incidents</h2>
            <span className="bg-red-500/20 text-red-400 border border-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {incidents.length} active
            </span>
          </div>

          {incidents.length === 0 && (
            <div className="bg-sy-card border border-sy-border rounded-xl p-8 text-center text-sy-muted">
              ✅ No active incidents
            </div>
          )}

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {incidents.map((inc) => {
              const id = inc.incidentId || inc._id;
              const isFocused = focused === id;
              return (
                <div key={id} onClick={() => setFocused(isFocused ? null : id)}
                  className={`bg-sy-card border rounded-xl p-4 cursor-pointer transition-colors ${isFocused ? 'border-sy-accent' : 'border-sy-border hover:border-sy-accent/50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-black text-sm uppercase ${severityColor(inc.severity)}`}>
                          {inc.severity === 'critical' ? '🔴' : '🟠'} {inc.severity}
                        </span>
                        <StatusBadge status={inc.status} />
                      </div>
                      <p className="font-semibold">{inc.touristName}</p>
                      <p className="text-xs text-sy-muted">{inc.message}</p>
                      <p className="text-xs text-sy-muted mt-1">{formatDateTime(inc.createdAt)}</p>
                    </div>
                    <RiskBadge level={inc.riskLevel} score={inc.riskScore} />
                  </div>

                  {isFocused && (
                    <div className="mt-3 pt-3 border-t border-sy-border space-y-2" onClick={(e) => e.stopPropagation()}>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)}
                        placeholder="Add responder notes…" rows={2}
                        className="w-full bg-sy-panel border border-sy-border rounded-lg px-3 py-2 text-xs text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
                      <div className="flex gap-2 flex-wrap">
                        {[['acknowledged','Acknowledge'],['in-progress','In Progress'],['resolved','Resolve ✓']].map(([s,l]) => (
                          <button key={s} onClick={() => updateStatus(id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${s === 'resolved' ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-400 hover:bg-emerald-900/60' : 'bg-sy-panel border border-sy-border text-sy-text hover:border-sy-accent'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div>
          <h2 className="font-bold text-lg mb-3">Incident Map</h2>
          <LiveMap
            tourists={[]}
            zones={zones}
            incidents={incidents}
            center={focusedInc?.location ? [focusedInc.location.latitude, focusedInc.location.longitude] : null}
            height="600px"
          />
        </div>
      </div>
    </Shell>
  );
}
