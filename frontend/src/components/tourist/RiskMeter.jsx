import { getRiskColor } from '../../services/riskEngine';

function Arc({ score }) {
  const r = 54, cx = 64, cy = 64;
  const circumference = Math.PI * r;   // half circle
  const offset = circumference * (1 - score / 100);
  const color = getRiskColor(score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW');

  return (
    <svg viewBox="0 0 128 80" className="w-full max-w-[180px]">
      {/* track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1e3a5f" strokeWidth="10" strokeLinecap="round" />
      {/* fill */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="9">RISK SCORE</text>
    </svg>
  );
}

export default function RiskMeter({ score = 0, level = 'LOW', factors = [] }) {
  const color = getRiskColor(level);
  return (
    <div className="bg-sy-card border border-sy-border rounded-2xl p-5 space-y-3">
      <div className="flex justify-center">
        <Arc score={score} />
      </div>
      <div className="text-center">
        <span className="text-lg font-black" style={{ color }}>{level} RISK</span>
      </div>
      {factors.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-sy-muted uppercase tracking-widest">Risk Factors</p>
          {factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-sy-text">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
