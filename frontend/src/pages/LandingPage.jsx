import { useState } from 'react';

const FLOW_STEPS = [
  { icon: '🧳', label: 'Tourist Starts Journey' },
  { icon: '📡', label: 'GPS Tracking' },
  { icon: '🗺️', label: 'Geo-Fence Detection' },
  { icon: '🧠', label: 'AI Risk Analysis' },
  { icon: '⚠️', label: 'High Risk?' },
  { icon: '🔔', label: 'Alert Tourist' },
  { icon: '📵', label: 'No Response?' },
  { icon: '📩', label: 'Emergency Contact SMS' },
  { icon: '👮', label: 'Authority Alert' },
  { icon: '🚑', label: 'Responder Assigned' },
  { icon: '✅', label: 'Incident Resolved' },
];

const INTERFACES = [
  {
    icon: '📱', title: 'Tourist App', color: 'border-sy-accent',
    features: ['Risk score & AI analysis', 'Live GPS location', 'One-tap SOS', 'Blockchain Digital ID', 'Safety alerts', 'Offline status'],
  },
  {
    icon: '🚨', title: 'Authority Command Center', color: 'border-sy-blue',
    features: ['Live map with danger zones', 'High-risk tourist list', 'Active emergencies', 'Geo-fence management', 'Incident management'],
  },
  {
    icon: '🧑‍🚒', title: 'Emergency Responder', color: 'border-amber-500',
    features: ['Assigned incidents', 'Tourist last location', 'Risk reason & factors', 'Navigation assist', 'Update incident status'],
  },
];

const BLOCKCHAIN_STEPS = [
  'Tourist Registration', 'Generate Tourist ID', 'Generate Identity Hash',
  'Store Hash on Blockchain', 'Generate QR Code', 'Authority Scans QR', 'Identity Verified ✓',
];

export default function LandingPage({ onGetStarted }) {
  const [smsDemo, setSmsDemo] = useState(false);

  return (
    <div className="min-h-screen bg-sy-bg text-sy-text font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-sy-panel/90 backdrop-blur border-b border-sy-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-sy-accent font-black text-lg">SafeYatra AI</span>
        </div>
        <button onClick={onGetStarted}
          className="px-5 py-2 rounded-xl bg-sy-accent text-sy-bg font-bold text-sm hover:opacity-90 transition-opacity">
          Sign In
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="text-6xl mb-4 animate-pulse">🛡️</div>
        <h1 className="text-4xl md:text-5xl font-black text-sy-accent leading-tight mb-4">
          SafeYatra AI
        </h1>
        <p className="text-xl text-sy-text font-semibold mb-2">
          Intelligent Tourist Safety &amp; Emergency Response System
        </p>
        <p className="text-sy-muted mb-10 max-w-xl mx-auto">
          Real-time AI risk scoring, geo-fence alerts, offline-first SOS, and blockchain digital identity — all in one platform.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={onGetStarted}
            className="px-8 py-3 rounded-2xl bg-sy-accent text-sy-bg font-black text-base hover:opacity-90 transition-opacity shadow-lg">
            🚀 Start Safe Journey
          </button>
          <a href="#dashboard"
            className="px-8 py-3 rounded-2xl border border-sy-accent text-sy-accent font-bold text-base hover:bg-sy-accent/10 transition-colors">
            📊 Explore Safety Dashboard
          </a>
          <button onClick={onGetStarted}
            className="px-8 py-3 rounded-2xl bg-red-600 text-white font-black text-base hover:bg-red-500 transition-colors shadow-lg">
            🚨 Emergency SOS
          </button>
        </div>
      </section>

      {/* ── OFFLINE MODE ── */}
      <section className="px-6 py-16 bg-sy-panel border-y border-sy-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-sy-accent mb-2">📵 Offline-First Safety</h2>
          <p className="text-sy-muted mb-10">Safety continues even when the network stops.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📡', title: 'Online', color: 'border-sy-accent text-sy-accent', items: ['Real-time AI Risk Scoring', 'Cloud Alerts', 'Live Authority Dashboard', 'Socket.io Updates'] },
              { icon: '📵', title: 'Offline', color: 'border-amber-500 text-amber-400', items: ['GPS + Geo-fencing', 'Local AI Risk Engine', 'SOS Queue (IndexedDB)', 'Bluetooth Mesh Broadcast'] },
              { icon: '🔄', title: 'Network Restored', color: 'border-sy-blue text-sy-blue', items: ['Auto Data Sync', 'Pending SOS Sent', 'Location History Uploaded', 'Incidents Reconciled'] },
            ].map((col) => (
              <div key={col.title} className={`bg-sy-card border-2 ${col.color.split(' ')[0]} rounded-2xl p-6`}>
                <div className="text-3xl mb-2">{col.icon}</div>
                <h3 className={`font-black text-lg mb-4 ${col.color.split(' ')[1]}`}>{col.title}</h3>
                <ul className="space-y-2 text-sm text-sy-muted text-left">
                  {col.items.map((item) => <li key={item} className="flex items-center gap-2"><span className="text-sy-accent">→</span>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 INTERFACES ── */}
      <section id="dashboard" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-sy-accent text-center mb-2">3 Dedicated Interfaces</h2>
        <p className="text-sy-muted text-center mb-10">Each role gets a purpose-built experience.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTERFACES.map((iface) => (
            <div key={iface.title} className={`bg-sy-card border-2 ${iface.color} rounded-2xl p-6`}>
              <div className="text-3xl mb-2">{iface.icon}</div>
              <h3 className="font-black text-lg mb-4">{iface.title}</h3>
              <ul className="space-y-2 text-sm text-sy-muted">
                {iface.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-sy-accent">✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── SYSTEM FLOW ── */}
      <section className="px-6 py-16 bg-sy-panel border-y border-sy-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-sy-accent mb-2">🧠 How It Works</h2>
          <p className="text-sy-muted mb-10">End-to-end automated safety pipeline.</p>
          <div className="flex flex-col items-center gap-1">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center gap-3 bg-sy-card border border-sy-border rounded-xl px-6 py-3 w-72">
                  <span className="text-xl">{step.icon}</span>
                  <span className="font-semibold text-sm">{step.label}</span>
                </div>
                {i < FLOW_STEPS.length - 1 && <span className="text-sy-muted text-lg leading-none py-0.5">↓</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMS ALERT DEMO ── */}
      <section className="px-6 py-16 max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-black text-sy-accent mb-2">🚨 Automatic Alert Escalation</h2>
        <p className="text-sy-muted mb-8">Tourist → Emergency Contact → Authority — fully automated.</p>
        <button onClick={() => setSmsDemo((v) => !v)}
          className="mb-6 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors">
          {smsDemo ? 'Hide Demo' : '▶ Simulate High Risk Alert'}
        </button>
        {smsDemo && (
          <div className="bg-sy-card border-2 border-red-600 rounded-2xl overflow-hidden animate-slide-up text-left">
            <div className="bg-red-600 px-5 py-4 text-center">
              <p className="text-white font-black text-lg">🚨 HIGH RISK DETECTED</p>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-sy-muted">Tourist</span><span className="font-bold">Rahul Sharma</span></div>
              <div className="flex justify-between"><span className="text-sy-muted">Risk Score</span><span className="font-black text-red-400">87%</span></div>
              <div className="flex justify-between"><span className="text-sy-muted">Reason</span><span className="text-amber-400">Danger Zone + Inactivity</span></div>
              <hr className="border-sy-border" />
              <div className="flex items-center justify-between bg-sy-panel rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold">📩 Emergency Contact Alert</p>
                  <p className="text-xs text-sy-muted">SMS to registered contact</p>
                </div>
                <span className="text-sy-accent font-black text-xs">SENT ✓</span>
              </div>
              <div className="flex items-center justify-between bg-sy-panel rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold">👮 Authority Alert</p>
                  <p className="text-xs text-sy-muted">Live dashboard notification</p>
                </div>
                <span className="text-sy-accent font-black text-xs">RECEIVED ✓</span>
              </div>
              <p className="text-xs text-sy-muted text-center pt-1">Real SMS via Twilio/MSG91 API in production. Demo shows simulated notification.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── BLOCKCHAIN ID ── */}
      <section className="px-6 py-16 bg-sy-panel border-y border-sy-border">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-black text-sy-accent mb-2">🔗 Blockchain Digital ID</h2>
          <p className="text-sy-muted mb-10">Tamper-proof identity verification. Sensitive data stays off-chain.</p>
          <div className="flex flex-col items-center gap-1">
            {BLOCKCHAIN_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`px-6 py-2.5 rounded-xl border text-sm font-semibold w-64 text-center
                  ${i === BLOCKCHAIN_STEPS.length - 1
                    ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400'
                    : 'bg-sy-card border-sy-border text-sy-text'}`}>
                  {step}
                </div>
                {i < BLOCKCHAIN_STEPS.length - 1 && <span className="text-sy-muted text-lg leading-none py-0.5">↓</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="text-center px-6 py-16">
        <h2 className="text-2xl font-black text-sy-accent mb-4">Ready to travel safely?</h2>
        <button onClick={onGetStarted}
          className="px-10 py-4 rounded-2xl bg-sy-accent text-sy-bg font-black text-lg hover:opacity-90 transition-opacity shadow-xl">
          🚀 Get Started — It's Free
        </button>
      </section>
    </div>
  );
}
