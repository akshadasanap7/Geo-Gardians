import { ArrowRight, BadgeCheck, BrainCircuit, CheckCircle2, CloudOff, Database, MapPinned, Radio, ShieldCheck, Siren } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PublicLayout from '../components/shared/PublicLayout';

const aboutContent = {
  '/about': {
    eyebrow: 'About SafeYatra AI',
    title: 'A safety network for the moments before an emergency.',
    intro: 'SafeYatra AI is a public-safety prototype that connects tourists, authorities and responders with context that stays useful online or offline.',
    items: [
      ['Protect the journey', 'A digital companion watches location, movement, zones and weather without turning travel into surveillance.'],
      ['Reduce response time', 'The right team sees the right signal, with the identity, location and incident history needed to act.'],
      ['Build trust at the edge', 'Digital ID verification confirms the person without exposing sensitive profile information.']
    ]
  },
  '/how-it-works': {
    eyebrow: 'How the safety loop works',
    title: 'DETECT → WARN → ANALYZE → ESCALATE → VERIFY → RESPOND → SYNC',
    intro: 'Every state has a job. The system is designed to make safe actions obvious and unsafe gaps visible.',
    items: [
      ['Detect and warn', 'GPS and geo-fence signals identify a change. The tourist receives a clear prompt before the control room receives noise.'],
      ['Analyze and escalate', 'Risk score combines place, time, weather and movement. If risk rises or the tourist cannot respond, the escalation chain begins.'],
      ['Verify, respond and sync', 'Authority verifies identity, responders coordinate the lifecycle, and every offline packet reconciles into one audit trail.']
    ]
  }
};

const architecture = [
  { title: 'Local signals', description: 'GPS + geo-fencing + local risk rules', icon: MapPinned },
  { title: 'AI risk engine', description: 'Contextual score + reasons + prompts', icon: BrainCircuit },
  { title: 'Response network', description: 'Authority + responder + emergency contact', icon: Radio },
  { title: 'Offline sync', description: 'Indexed local queue + automatic reconciliation', icon: CloudOff }
];

export default function InfoPage() {
  const content = aboutContent[useLocation().pathname] || aboutContent['/about'];
  return <PublicLayout><main><section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="max-w-4xl"><p className="sy-label text-sy-accent">{content.eyebrow}</p><h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-6xl">{content.title}</h1><p className="mt-7 max-w-2xl text-base leading-7 text-white/55">{content.intro}</p></div><div className="mt-14 grid gap-px overflow-hidden border border-sy-border bg-sy-border md:grid-cols-3">{content.items.map(([title, copy], index) => <div key={title} className="bg-sy-panel p-6 sm:p-8"><span className="font-mono text-sm text-sy-accent">0{index + 1}</span><h2 className="mt-12 text-xl font-extrabold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-white/50">{copy}</p></div>)}</div></section><section className="border-y border-sy-border bg-sy-bg-soft"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sy-label text-sy-accent">System architecture</p><h2 className="mt-2 text-3xl font-extrabold text-white">Safety is a connected chain, not a single button.</h2></div><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">Built to connect to a real backend</span></div><div className="mt-10 grid gap-3 md:grid-cols-4">{architecture.map(({ title, description, icon: Icon }) => <div key={title} className="border border-sy-border bg-sy-panel p-5"><Icon size={20} className="text-sy-accent" /><h3 className="mt-8 text-sm font-extrabold text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-white/45">{description}</p></div>)}</div></div></section><section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="border border-sy-accent/30 bg-sy-accent/[0.06] p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="sy-label text-sy-accent">Try the full workflow</p><h2 className="mt-2 text-2xl font-extrabold text-white">Simulate the journey from movement to resolution.</h2></div><Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-2 bg-sy-accent px-4 text-sm font-extrabold text-sy-bg">Open the demo <ArrowRight size={15} /></Link></div></div></section></main></PublicLayout>;
}
