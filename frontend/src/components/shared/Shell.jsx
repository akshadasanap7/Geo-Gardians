import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Shield, X } from 'lucide-react';
import { roleNavigation, roleLabels } from '../../config/navigation';
import { useApp } from '../../store/AppContext';
import Icon from './Icon';
import NetworkBadge from './NetworkBadge';
import DemoControlPanel from './DemoControlPanel';
import TelemetryBar from './TelemetryBar';
import ToastStack from './ToastStack';

export default function Shell({ title, eyebrow, children, actions = null, className = '' }) {
  const { state, logout } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigation = roleNavigation[state.user?.role] || [];
  const activeItem = useMemo(() => navigation.find((item) => location.pathname.startsWith(item.href)), [location.pathname, navigation]);

  return (
    <div className="min-h-screen bg-sy-bg pb-7 text-sy-text">
      <div className="flex min-h-[calc(100vh-28px)]">
        <aside className={`hidden shrink-0 border-r border-sy-border bg-sy-bg-soft transition-[width] duration-200 lg:block ${collapsed ? 'w-[74px]' : 'w-[248px]'}`}>
          <div className="sticky top-0 flex h-screen flex-col">
            <div className={`flex h-[76px] items-center border-b border-sy-border ${collapsed ? 'justify-center px-3' : 'gap-3 px-5'}`}>
              <Link to={roleNavigation[state.user?.role]?.[0]?.href || '/'} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center border border-sy-accent/40 bg-sy-accent/10 text-sy-accent"><Shield size={19} /></span>
                {!collapsed && <span><span className="block text-sm font-extrabold tracking-tight text-white">SafeYatra <span className="text-sy-accent">AI</span></span><span className="block text-[9px] uppercase tracking-[0.18em] text-white/40">Safety network</span></span>}
              </Link>
            </div>
            <div className={`border-b border-sy-border py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
              {!collapsed && <><p className="sy-label">Workspace</p><p className="mt-1 truncate text-sm font-semibold text-white">{roleLabels[state.user?.role]}</p></>}
              {collapsed && <div className="mx-auto h-2 w-2 rounded-full bg-sy-accent" title={roleLabels[state.user?.role]} />}
            </div>
            <nav className={`flex-1 space-y-1 py-4 ${collapsed ? 'px-3' : 'px-3'}`} aria-label="Primary navigation">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== navigation[0]?.href && location.pathname.startsWith(item.href));
                return <NavLink key={item.href} to={item.href} title={collapsed ? item.label : undefined} className={`group flex min-h-11 items-center gap-3 border px-3 text-sm font-semibold transition ${collapsed ? 'justify-center' : ''} ${isActive ? 'border-sy-accent/40 bg-sy-accent/10 text-sy-accent' : item.danger ? 'border-transparent text-red-300 hover:border-red-400/30 hover:bg-red-400/10' : 'border-transparent text-white/55 hover:border-sy-border hover:bg-white/[0.03] hover:text-white'}`}><Icon name={item.icon} size={17} /><span className={collapsed ? 'sr-only' : ''}>{item.label}</span>{item.danger && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />}</NavLink>;
              })}
            </nav>
            <div className={`border-t border-sy-border py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
              <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                <div className="grid h-9 w-9 shrink-0 place-items-center border border-sy-border bg-sy-panel font-mono text-xs font-bold text-sy-accent">{state.user?.initials || 'SY'}</div>
                {!collapsed && <div className="min-w-0"><p className="truncate text-xs font-bold text-white">{state.user?.name || 'Demo operator'}</p><p className="truncate text-[10px] capitalize text-white/40">{state.user?.role || 'guest'} access</p></div>}
              </div>
              <button onClick={logout} className={`mt-3 flex min-h-10 w-full items-center gap-2 border border-sy-border px-3 text-xs font-bold text-white/55 hover:border-red-300/40 hover:text-red-200 ${collapsed ? 'justify-center' : ''}`} title="Sign out"><Icon name="LogOut" size={15} /><span className={collapsed ? 'sr-only' : ''}>Sign out</span></button>
            </div>
            <button onClick={() => setCollapsed((value) => !value)} className="flex h-10 items-center justify-center border-t border-sy-border text-white/40 hover:bg-white/[0.03] hover:text-white" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-sy-border bg-sy-bg/95 backdrop-blur">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center border border-sy-border text-white/70 hover:border-sy-accent/40 hover:text-white lg:hidden" aria-label="Open navigation"><Menu size={18} /></button>
                <div className="min-w-0"><p className="sy-label">{eyebrow || activeItem?.label || 'Operations'}</p><h1 className="mt-1 truncate text-lg font-extrabold tracking-tight text-white sm:text-xl">{title || activeItem?.label || 'Dashboard'}</h1></div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3"><NetworkBadge /><div className="hidden items-center gap-2 border border-sy-border bg-sy-panel px-3 py-2 md:flex"><span className="h-2 w-2 rounded-full bg-sy-accent" /><span className="font-mono text-[10px] text-white/55">DEMO MODE</span></div>{actions}</div>
            </div>
          </header>
          <main className={`mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 ${className}`}>{children}</main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-7 z-40 flex justify-center px-4 lg:hidden"><nav className="flex max-w-full overflow-x-auto border border-sy-border bg-sy-bg-soft/95 p-1 shadow-2xl backdrop-blur" aria-label="Mobile navigation">{navigation.slice(0, 5).map((item) => <NavLink key={item.href} to={item.href} className={({ isActive }) => `grid min-w-[64px] place-items-center gap-1 px-2 py-2 text-[9px] font-bold uppercase tracking-[0.08em] ${isActive ? 'bg-sy-accent/10 text-sy-accent' : 'text-white/50'}`}><Icon name={item.icon} size={16} /><span>{item.label.split(' ')[0]}</span></NavLink>)}</nav></div>
      {mobileOpen && <div className="fixed inset-0 z-[60] bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[min(82vw,320px)] flex-col border-r border-sy-border bg-sy-bg-soft" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-sy-border px-5 py-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-sy-accent/40 bg-sy-accent/10 text-sy-accent"><Shield size={19} /></span><span className="text-sm font-extrabold text-white">SafeYatra <span className="text-sy-accent">AI</span></span></div><button onClick={() => setMobileOpen(false)} className="text-white/60" aria-label="Close navigation"><X size={18} /></button></div><nav className="space-y-1 p-4">{navigation.map((item) => <NavLink onClick={() => setMobileOpen(false)} key={item.href} to={item.href} className={({ isActive }) => `flex min-h-11 items-center gap-3 border px-3 text-sm font-semibold ${isActive ? 'border-sy-accent/40 bg-sy-accent/10 text-sy-accent' : 'border-transparent text-white/60 hover:border-sy-border hover:text-white'}`}><Icon name={item.icon} size={17} />{item.label}</NavLink>)}</nav></aside></div>}
      <DemoControlPanel />
      <TelemetryBar />
      <ToastStack />
    </div>
  );
}
