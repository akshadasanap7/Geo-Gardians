import { useState, useEffect, useCallback } from 'react';
import Shell from '../components/shared/Shell';
import LiveMap from '../components/shared/LiveMap';
import RiskBadge from '../components/shared/RiskBadge';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../services/api';
import { useApp } from '../store/AppContext';
import { formatDateTime, severityColor } from '../utils/helpers';

export default function AuthorityDashboard() {
  const { state } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones]         = useState([]);
  const [tab, setTab]             = useState('overview');
  const [selected, setSelected]   = useState(null);
  const [zoneForm, setZoneForm]   = useState({ name: '', type: 'caution', latitude: '', longitude: '', radius: '0.03' });

  const load = useCallback(async () => {
    try {
      const [d, inc, z] = await Promise.all([api.get('/dashboard'), api.get('/incidents'), api.get('/geofences')]);
      setDashboard(d);
      setIncidents(inc);
      setZones(z);
      // merge live socket updates
      if (state.liveIncidents.length) {
        setIncidents((prev) => {
          const ids = new Set(state.liveIncidents.map((i) => i.incidentId));
          return [...state.liveIncidents, ...prev.filter((i) => !ids.has(i.incidentId))];
        });
      }
    } catch {}
  }, [state.liveIncidents]);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  async function resolveIncident(id) {
    await api.patch(`/incidents/${id}`, { status: 'resolved' });
    load();
  }

  async function assignResponder(id, responder) {
    await api.patch(`/incidents/${id}`, { assignedResponder: responder, status: 'responder-assigned' });
    load();
  }

  async function addZone(e) {
    e.preventDefault();
    await api.post('/geofences', { ...zoneForm, latitude: +zoneForm.latitude, longitude: +zoneForm.longitude, radius: +zoneForm.radius });
    setZoneForm({ name: '', type: 'caution', latitude: '', longitude: '', radius: '0.03' });
    load();
  }

  const tourists = dashboard?.touristLocations || [];
  const activeInc = incidents.filter((i) => i.status !== 'resolved');

  const STAT_CARDS = dashboard ? [
    { label: 'Active Tourists',    value: dashboard.activeTourists,    color: 'text-sy-accent' },
    { label: 'Active Emergencies', value: dashboard.activeEmergencies, color: 'text-red-400' },
    { label: 'Critical Risk',      value: dashboard.criticalRisk,      color: 'text-red-400' },
    { label: 'High Risk',          value: dashboard.highRisk,          color: 'text-amber-400' },
    { label: 'Safe',               value: dashboard.safeTourists,      color: 'text-emerald-400' },
    { label: 'Weather Affected',   value: dashboard.weatherAffected,   color: 'text-amber-400' },
  ] : [];

  return (
    <Shell title="Authority Dashboard" icon="🏛️">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="bg-sy-card border border-sy-border rounded-xl p-4 text-center">
            <p className={`text-3xl font-black ${c.color}`}>{c.value ?? '—'}</p>
            <p className="text-xs text-sy-muted mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['overview','🗺 Live Map'],['incidents','🚨 Incidents'],['tourists','👥 Tourists'],['zones','📍 Zones']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === k ? 'bg-sy-accent text-sy-bg' : 'bg-sy-card border border-sy-border text-sy-muted hover:text-sy-text'}`}>
            {l} {k === 'incidents' && activeInc.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeInc.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <LiveMap tourists={tourists} zones={zones} incidents={activeInc}
          center={selected ? [selected.location?.latitude, selected.location?.longitude] : null} height="500px" />
      )}

      {tab === 'incidents' && (
        <div className="space-y-3">
          {incidents.length === 0 && <p className="text-sy-muted text-sm">No incidents recorded.</p>}
          {incidents.map((inc) => (
            <div key={inc.incidentId || inc._id} className="bg-sy-card border border-sy-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm uppercase ${severityColor(inc.severity)}`}>{inc.severity}</span>
                    <StatusBadge status={inc.status} />
                    <span className="text-xs text-sy-muted font-mono">{inc.incidentId}</span>
                  </div>
                  <p className="font-semibold">{inc.touristName}</p>
                  <p className="text-xs text-sy-muted">{inc.message}</p>
                  <p className="text-xs text-sy-muted mt-1">{formatDateTime(inc.createdAt)}</p>
                  {inc.assignedResponder && <p className="text-xs text-sy-blue mt-1">Responder: {inc.assignedResponder}</p>}
                </div>
                {inc.status !== 'resolved' && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => assignResponder(inc.incidentId || inc._id, 'District Control')}
                      className="px-3 py-1.5 rounded-lg bg-sy-blue/20 border border-sy-blue/40 text-sy-blue text-xs font-semibold hover:bg-sy-blue/30">
                      Assign Responder
                    </button>
                    <button onClick={() => resolveIncident(inc.incidentId || inc._id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-700 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/50">
                      Resolve
                    </button>
                  </div>
                )}
              </div>
              {/* Timeline */}
              {inc.timeline?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sy-border space-y-1">
                  {inc.timeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-sy-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-sy-border flex-shrink-0" />
                      <span className="font-semibold text-sy-text">{t.status}</span>
                      {t.note && <span>— {t.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'tourists' && (
        <div className="space-y-2">
          {tourists.length === 0 && <p className="text-sy-muted text-sm">No tourists registered.</p>}
          {tourists.map((t) => (
            <div key={t.touristId} onClick={() => { setSelected(t); setTab('overview'); }}
              className="bg-sy-card border border-sy-border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-sy-accent transition-colors">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-sy-muted font-mono">{t.touristId}</p>
                {t.zoneInfo && <p className="text-xs text-sy-muted mt-0.5">{t.zoneInfo.zoneName}</p>}
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={t.riskLevel} score={t.riskScore} />
                <span className={`text-xs font-semibold ${t.isOnline ? 'text-emerald-400' : 'text-sy-muted'}`}>
                  {t.isOnline ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'zones' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Add Geo-Fence Zone</h3>
            <form onSubmit={addZone} className="space-y-3">
              {[['name','Zone name'],['latitude','Latitude'],['longitude','Longitude'],['radius','Radius (km)']].map(([k,p]) => (
                <input key={k} value={zoneForm[k]} onChange={(e) => setZoneForm((f) => ({ ...f, [k]: e.target.value }))}
                  placeholder={p} required type={k === 'name' ? 'text' : 'number'} step="any"
                  className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-2.5 text-sm text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
              ))}
              <select value={zoneForm.type} onChange={(e) => setZoneForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-2.5 text-sm text-sy-text focus:outline-none focus:border-sy-accent">
                {['safe','caution','danger','restricted'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-sy-accent text-sy-bg font-bold text-sm">Add Zone</button>
            </form>
          </div>
          <div>
            <h3 className="font-bold mb-3">Active Zones ({zones.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {zones.map((z) => (
                <div key={z._id || z.id} className="bg-sy-card border border-sy-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{z.name}</p>
                    <p className="text-xs text-sy-muted">{z.latitude}, {z.longitude} · r={z.radius}km</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${z.type === 'danger' ? 'bg-red-900/40 text-red-400' : z.type === 'caution' ? 'bg-amber-900/40 text-amber-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                    {z.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
