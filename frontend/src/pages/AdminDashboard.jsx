import { useState, useEffect, useCallback } from 'react';
import Shell from '../components/shared/Shell';
import LiveMap from '../components/shared/LiveMap';
import RiskBadge from '../components/shared/RiskBadge';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../services/api';
import { formatDateTime, severityColor, statusLabel } from '../utils/helpers';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [tourists, setTourists]   = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones]         = useState([]);
  const [tab, setTab]             = useState('overview');

  const load = useCallback(async () => {
    try {
      const [d, t, inc, z] = await Promise.all([
        api.get('/dashboard'),
        api.get('/tourists'),
        api.get('/incidents'),
        api.get('/zones')
      ]);
      setDashboard(d); setTourists(t); setIncidents(inc); setZones(z);
    } catch {}
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id); }, [load]);

  async function deleteZone(id) {
    await api.delete(`/zones/${id}`);
    load();
  }

  return (
    <Shell title="Admin Dashboard" icon="⚙️">
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {[
            { l: 'Total Tourists',   v: dashboard.activeTourists,    c: 'text-sy-accent' },
            { l: 'Emergencies',      v: dashboard.activeEmergencies, c: 'text-red-400' },
            { l: 'High Risk',        v: dashboard.highRiskTourists,  c: 'text-amber-400' },
            { l: 'Safe',             v: dashboard.safeTourists,      c: 'text-emerald-400' },
            { l: 'Weather Affected', v: dashboard.weatherAffected,   c: 'text-amber-400' },
          ].map((s) => (
            <div key={s.l} className="bg-sy-card border border-sy-border rounded-xl p-3 text-center">
              <p className={`text-2xl font-black ${s.c}`}>{s.v ?? 0}</p>
              <p className="text-[10px] text-sy-muted mt-0.5 leading-tight">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {[['overview','📊 Overview'],['tourists','👥 Tourists'],['incidents','🚨 Incidents'],['zones','📍 Zones']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === k ? 'bg-sy-accent text-sy-bg' : 'bg-sy-card border border-sy-border text-sy-muted hover:text-sy-text'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <LiveMap tourists={tourists} zones={zones}
            incidents={incidents.filter((i) => i.status !== 'resolved')} height="480px" />
          {incidents.filter((i) => i.status !== 'resolved').length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-sy-muted uppercase tracking-widest font-semibold">Active Incidents</p>
              {incidents.filter((i) => i.status !== 'resolved').slice(0, 5).map((inc) => (
                <div key={inc.id || inc.incidentId} className="bg-sy-card border border-sy-border rounded-xl p-3 flex items-center justify-between gap-4">
                  <div>
                    <span className={`font-bold text-xs uppercase ${severityColor((inc.severity || '').toLowerCase())}`}>{inc.severity}</span>
                    <span className="text-sy-text font-semibold ml-2 text-sm">{inc.touristName}</span>
                    <p className="text-xs text-sy-muted">{formatDateTime(inc.createdAt)}</p>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tourists' && (
        <div className="space-y-2">
          <p className="text-xs text-sy-muted mb-2">{tourists.length} registered tourists</p>
          {tourists.map((t) => (
            <div key={t.id || t.touristId} className="bg-sy-card border border-sy-border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-sy-muted font-mono">{t.id || t.touristId}</p>
                <p className="text-xs text-sy-muted">Destination: {t.destination}</p>
                {(t.location || t.lastLocation) && (
                  <p className="text-xs text-sy-muted">📍 {(t.location || t.lastLocation).latitude?.toFixed(4)}, {(t.location || t.lastLocation).longitude?.toFixed(4)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBadge level={t.latestRiskLevel || t.riskLevel} score={t.latestRiskScore ?? t.riskScore} />
                <span className="text-xs text-sy-muted">{statusLabel(t.status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'incidents' && (
        <div className="space-y-3">
          <p className="text-xs text-sy-muted mb-2">{incidents.length} total incidents</p>
          {incidents.map((inc) => (
            <div key={inc.id || inc.incidentId} className="bg-sy-card border border-sy-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-xs uppercase ${severityColor((inc.severity || '').toLowerCase())}`}>{inc.severity}</span>
                    <StatusBadge status={inc.status} />
                    <span className="text-xs text-sy-muted font-mono">{inc.id || inc.incidentId}</span>
                  </div>
                  <p className="font-semibold">{inc.touristName}</p>
                  <p className="text-xs text-sy-muted">{inc.message}</p>
                  <p className="text-xs text-sy-muted">{formatDateTime(inc.createdAt)}</p>
                  {inc.assignedResponder && <p className="text-xs text-sy-blue">Responder: {inc.assignedResponder}</p>}
                </div>
                <RiskBadge level={inc.riskLevel} score={inc.riskScore} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'zones' && (
        <div className="space-y-2">
          <p className="text-xs text-sy-muted mb-2">{zones.length} active zones</p>
          {zones.map((z) => (
            <div key={z._id || z.id} className="bg-sy-card border border-sy-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{z.name}</p>
                <p className="text-xs text-sy-muted">{z.latitude}, {z.longitude} · radius {z.radius} km</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${z.type === 'danger' ? 'bg-red-900/40 text-red-400' : z.type === 'caution' ? 'bg-amber-900/40 text-amber-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                  {z.type}
                </span>
                <button onClick={() => deleteZone(z._id || z.id)}
                  className="text-xs text-red-400 border border-red-800 hover:border-red-600 px-2.5 py-1 rounded-lg transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
