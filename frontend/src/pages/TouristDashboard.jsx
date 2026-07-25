import { useState, useEffect, useRef } from 'react';
import Shell from '../components/shared/Shell';
import LiveMap from '../components/shared/LiveMap';
import RiskMeter from '../components/tourist/RiskMeter';
import SOSButton from '../components/tourist/SOSButton';
import DigitalID from '../components/tourist/DigitalID';
import HighRiskAlert from '../components/tourist/HighRiskAlert';
import { useTourist } from '../hooks/useTourist';
import { statusLabel } from '../utils/helpers';

const WEATHER_OPTIONS = ['clear','cloudy','heavy-rain','storm','flood','landslide','extreme-heat'];

export default function TouristDashboard() {
  const { tourist, zones, loading, tracking, registerTourist, startTracking, stopTracking } = useTourist();
  const [regForm, setRegForm] = useState({ name: '', age: '', phone: '', emergencyContact: '', destination: '', medicalInfo: '' });
  const [weather, setWeather] = useState('clear');
  const [regError, setRegError] = useState('');
  const [tab, setTab] = useState('map');
  const [alert, setAlert] = useState(null);   // null | { riskLevel, riskFactors }
  const prevRiskRef = useRef('LOW');

  // watch for HIGH/CRITICAL risk transitions
  useEffect(() => {
    const level = tourist?.latestRiskLevel;
    if (!level) return;
    const wasHighRisk = ['HIGH','CRITICAL'].includes(prevRiskRef.current);
    const isHighRisk  = ['HIGH','CRITICAL'].includes(level);
    if (isHighRisk && !wasHighRisk && !alert) {
      setAlert({ riskLevel: level, riskFactors: tourist?.latestRiskFactors || [] });
    }
    prevRiskRef.current = level;
  }, [tourist?.latestRiskLevel]);

  const setField = (k) => (e) => setRegForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e) {
    e.preventDefault();
    setRegError('');
    try { await registerTourist({ ...regForm, weather }); }
    catch (err) { setRegError(err?.error || 'Registration failed'); }
  }

  function dismissAlert() { setAlert(null); }

  const location = tourist?.lastLocation
    ? [tourist.lastLocation.latitude, tourist.lastLocation.longitude]
    : null;

  if (loading) return (
    <Shell title="Tourist Dashboard" icon="🧳">
      <div className="flex items-center justify-center h-64 text-sy-muted">Loading…</div>
    </Shell>
  );

  return (
    <Shell title="Tourist Dashboard" icon="🧳">
      {/* High Risk Alert overlay */}
      {alert && tourist && (
        <HighRiskAlert
          tourist={tourist}
          riskLevel={alert.riskLevel}
          riskFactors={alert.riskFactors}
          onSafe={dismissAlert}
          onEscalated={dismissAlert}
        />
      )}
      {/* Status bar */}
      {tourist && (
        <div className="mb-4 p-4 bg-sy-card border border-sy-border rounded-2xl flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-sy-muted">Tourist ID</p>
            <p className="font-black text-sy-accent font-mono">{tourist.touristId}</p>
          </div>
          <div>
            <p className="text-xs text-sy-muted">Status</p>
            <p className="font-semibold text-sm">{statusLabel(tourist.status)}</p>
          </div>
          <div>
            <p className="text-xs text-sy-muted">Destination</p>
            <p className="font-semibold text-sm">{tourist.destination}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <select value={weather} onChange={(e) => setWeather(e.target.value)}
              className="bg-sy-panel border border-sy-border rounded-lg px-3 py-1.5 text-xs text-sy-text">
              {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <button onClick={() => tracking ? stopTracking() : startTracking({ weather })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${tracking ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-sy-accent text-sy-bg hover:opacity-90'}`}>
              {tracking ? '⏹ Stop Tracking' : '▶ Start Tracking'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['map','sos','id','risk'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-sy-accent text-sy-bg' : 'bg-sy-card border border-sy-border text-sy-muted hover:text-sy-text'}`}>
            {t === 'sos' ? '🚨 SOS' : t === 'id' ? '🪪 Digital ID' : t === 'risk' ? '📊 Risk' : '🗺 Map'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'map' && (
        <div className="space-y-4">
          <LiveMap tourists={tourist ? [{ ...tourist, riskLevel: tourist.latestRiskLevel, riskScore: tourist.latestRiskScore }] : []}
            zones={zones} center={location} height="450px" />
          {tourist?.zoneInfo && (
            <div className="p-4 bg-sy-card border border-sy-border rounded-xl text-sm">
              <span className="font-semibold">{tourist.zoneInfo.zoneName}</span>
              <span className="text-sy-muted ml-2">{tourist.zoneInfo.zoneAlert}</span>
            </div>
          )}
        </div>
      )}

      {tab === 'sos' && (
        <div className="flex flex-col items-center justify-center py-12">
          <SOSButton tourist={tourist} location={tourist?.lastLocation}
            onTriggered={(r) => console.log('SOS triggered', r)} />
          {!tourist && <p className="text-sy-muted text-sm mt-6">Register first to enable SOS</p>}
        </div>
      )}

      {tab === 'id' && (
        <div className="max-w-sm mx-auto">
          {tourist ? <DigitalID tourist={tourist} /> : (
            <div className="bg-sy-card border border-sy-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Register as Tourist</h3>
              <form onSubmit={handleRegister} className="space-y-3">
                {[['name','Full name'],['age','Age'],['phone','Phone'],['emergencyContact','Emergency contact'],['destination','Destination']].map(([k,p]) => (
                  <input key={k} value={regForm[k]} onChange={setField(k)} placeholder={p} required={k !== 'age'}
                    className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-2.5 text-sm text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
                ))}
                <textarea value={regForm.medicalInfo} onChange={setField('medicalInfo')} placeholder="Medical info (optional)"
                  className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-2.5 text-sm text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" rows={2} />
                {regError && <p className="text-red-400 text-xs">{regError}</p>}
                <button type="submit" className="w-full py-2.5 rounded-xl bg-sy-accent text-sy-bg font-bold text-sm">Register</button>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'risk' && (
        <div className="max-w-sm mx-auto">
          <RiskMeter score={tourist?.latestRiskScore || 0} level={tourist?.latestRiskLevel || 'LOW'} factors={tourist?.latestRiskFactors || []} />
        </div>
      )}
    </Shell>
  );
}
