import { Panel } from './Primitives';

export default function ChartCard({ title, eyebrow, children, action }) {
  return <Panel eyebrow={eyebrow} title={title} action={action} className="min-w-0"><div className="h-[250px] w-full">{children}</div></Panel>;
}
