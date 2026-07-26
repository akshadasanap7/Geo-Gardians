import { X } from 'lucide-react';

export default function Modal({ open, title, eyebrow, children, onClose, actions }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}><div className="w-full max-w-lg border border-sy-border bg-sy-panel shadow-2xl animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4 border-b border-sy-border px-5 py-4"><div>{eyebrow && <p className="sy-label text-sy-accent">{eyebrow}</p>}<h2 id="dialog-title" className="mt-1 text-lg font-extrabold text-white">{title}</h2></div><button onClick={onClose} className="grid h-8 w-8 place-items-center text-white/50 hover:bg-white/[0.06] hover:text-white" aria-label="Close modal"><X size={17} /></button></div><div className="p-5">{children}</div>{actions && <div className="flex flex-col-reverse gap-2 border-t border-sy-border px-5 py-4 sm:flex-row sm:justify-end">{actions}</div>}</div></div>;
}
