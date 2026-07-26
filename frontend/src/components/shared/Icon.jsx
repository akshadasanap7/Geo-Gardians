import * as Icons from 'lucide-react';

export default function Icon({ name, size = 18, strokeWidth = 1.8, ...props }) {
  const Component = Icons[name] || Icons.Circle;
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
