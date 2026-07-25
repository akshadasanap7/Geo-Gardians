import { useState } from 'react';
import api from '../../services/api';

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
    try {
      const result = await api.post('/verify', { qrCode: tourist.qrCode, digitalId: tourist.digitalId });
      setVerifyResult(result);
    } catch {
      setVerifyResult({ verified: false });
    } finally {
      setLoading(false);
    }
  }

  if (!tourist) return <div className="text-sy-muted text-sm">Register to get your Digital ID</div>;

  return (
    <div className="bg-sy-card border border-sy-border rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-sy-muted uppercase tracking-widest mb-1">Digital Tourist ID</p>
          <p className="text-2xl font-black text-sy-accent tracking-wider">{tourist.touristId}</p>
          <p className="text-xs text-sy-muted mt-1 font-mono">{tourist.digitalId}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-sy-muted">Destination</p>
          <p className="text-sm font-semibold">{tourist.destination}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <QRGrid code={tourist.qrCode} />
      </div>
      <p className="text-center text-xs font-mono text-sy-muted">{tourist.qrCode}</p>

      <button onClick={verify} disabled={loading}
        className="w-full py-2.5 rounded-xl bg-sy-blue/20 border border-sy-blue/40 text-sy-blue text-sm font-semibold hover:bg-sy-blue/30 transition-colors">
        {loading ? 'Verifying…' : '🔍 Verify Identity'}
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
