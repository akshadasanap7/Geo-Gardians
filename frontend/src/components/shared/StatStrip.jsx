import { Activity, CloudOff, Siren, TriangleAlert, UsersRound } from 'lucide-react';
import { MetricCard } from './Primitives';

export default function StatStrip({ dashboard }) {
  const d = dashboard || {};
  const stats = [
    { label: 'Active tourists',    value: d.activeTourists    ?? 0, detail: 'Live monitored devices',        icon: UsersRound,    tone: 'accent'   },
    { label: 'Active emergencies', value: d.activeEmergencies ?? 0, detail: 'Require a control-room action',  icon: Siren,         tone: 'critical' },
    { label: 'Critical risk',      value: d.criticalRisk                    ?? 0, detail: 'AI score 80% and above',        icon: TriangleAlert, tone: 'critical' },
    { label: 'High risk',          value: d.highRisk ?? d.highRiskTourists   ?? 0, detail: 'Tourist warning active',         icon: Activity,      tone: 'high'     },
    { label: 'Offline tourists',   value: d.offlineTourists                  ?? 0, detail: 'Local safety still active',      icon: CloudOff,      tone: 'neutral'  }
  ];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{stats.map((stat) => <MetricCard key={stat.label} {...stat} />)}</div>;
}
