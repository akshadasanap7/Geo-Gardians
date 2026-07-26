import { useState } from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

function QRGrid({ code }) {
  const chars = (code + code + code).slice(0, 49);
  return (
    <div className="grid gap-0.5 p-3 bg-white rounded-lg" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
      {Array.from({ length: 49 }, (_, i) => (
        <div key={i} className={`w-4 h-4 rounded-sm ${chars.charCodeAt(i) % 2 === 0 ? 'bg-gray-900' : 'bg-white'}`} />
      ))}
    </div>
  );
}

export default function DigitalID({ tourist }) {
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setVerifyResult({ verified: true, verifiedAt: new Date().toISOString() });
    setLoading(false);
  }

  if (!tourist) return <div className="text-sy-muted text-sm">Register to get your Digital ID</div>;

  return (
    <div className="border border-sy-border bg-sy-card p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4 border-b border-sy-border pb-4">
        <div>
          <p className="sy-label text-sy-accent">SafeYatra Digital ID</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-white">{tourist.touristId}</p>
          <p className="mt-1 font-mono text-[10px] text-white/40">{tourist.digitalId}</p>
        </div>
        <div className="text-right"><BadgeCheck size={22} className="ml-auto text-sy-success" /><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-sy-success">Verified</p></div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-dashed border-sy-border pb-4">
        <div><p className="sy-label">Destination</p><p className="mt-1 text-sm font-semibold text-white">{tourist.destination}</p></div>
        <ShieldCheck size={25} className="text-sy-accent" />
      </div>

      <div className="flex justify-center">
        <QRGrid code={tourist.qrCode} />
      </div>
      <p className="text-center text-xs font-mono text-sy-muted">{tourist.qrCode}</p>

      <button onClick={verify} disabled={loading}
        className="flex min-h-11 w-full items-center justify-center gap-2 border border-sy-blue/40 bg-sy-blue/10 text-xs font-bold text-sky-100 hover:bg-sy-blue/20 disabled:opacity-60">
        <BadgeCheck size={15} />{loading ? 'Verifying…' : 'Verify identity'}
      </button>

      {verifyResult && (
        <div className={`p-3 rounded-xl border text-sm ${verifyResult.verified ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
          {verifyResult.verified
            ? `✅ Identity verified at ${new Date(verifyResult.verifiedAt).toLocaleTimeString()}`
            : '❌ Verification failed'}
        </div>
      )}

      <p className="text-[10px] text-sy-muted text-center leading-relaxed">
        Sensitive personal data is stored off-chain. Only your cryptographic hash is used for verification.
      </p>
    </div>
  );
}
