import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bell, ChevronLeft, ChevronRight, LogOut, Menu, Shield, X,
  Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { roleNavigation, roleLabels } from '../../config/navigation';
import { useApp } from '../../store/AppContext';
import Icon from './Icon';
import ToastStack from './ToastStack';
import TelemetryBar from './TelemetryBar';
import DemoControlPanel from './DemoControlPanel';

const ROLE_COLORS = {
  tourist:   { accent: '#14B8A6', bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.3)'  },
  authority: { accent: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
  responder: { accent: '#F97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)'  },
  admin:     { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)'  },
};

const NET_CFG = {
  online:  { icon: Wifi,       color: '#22C55E', label: 'Online'   },
  offline: { icon: WifiOff,    color: '#EAB308', label: 'Offline'  },
  syncing: { icon: RefreshCw,  color: '#3B82F6', label: 'Syncing'  },
  synced:  { icon: Wifi,       color: '#14B8A6', label: 'Synced'   },
};

export default function Shell({ title, eyebrow, children, actions = null, className = '' }) {
  const { state, logout } = useApp();
  const location = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);

  const nav    = roleNavigation[state.user?.role] || [];
  const rc     = ROLE_COLORS[state.user?.role] || ROLE_COLORS.tourist;
  const net    = NET_CFG[state.networkStatus] || NET_CFG.online;
  const NetIcon = net.icon;
  const initials = state.user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'SY';
  const activeIncidents = state.incidents?.filter(i => i.status !== 'resolved').length || 0;

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center border-b border-white/[0.06] ${collapsed && !mobile ? 'justify-center px-3 py-5' : 'gap-3 px-5 py-5'}`}>
        <div className="relative flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
            <Shield size={18} style={{ color: rc.accent }} />
          </div>
          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-bg-primary" />
          </span>
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-heading text-sm font-bold text-text-primary leading-none">SafeYatra</p>
            <p className="mt-0.5 text-[10px] font-semibold" style={{ color: rc.accent }}>AI Command Center</p>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!collapsed || mobile) && (
        <div className="mx-4 mt-4 rounded-xl px-3 py-2.5" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: rc.accent }}>
            {roleLabels[state.user?.role] || 'Workspace'}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-text-primary truncate">{state.user?.name || 'Operator'}</p>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed && !mobile ? 'px-2' : 'px-3'}`}>
        {nav.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== nav[0]?.href && location.pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150
                ${collapsed && !mobile ? 'justify-center' : ''}
                ${isActive
                  ? 'text-text-primary'
                  : item.danger
                    ? 'text-danger/70 hover:bg-danger/10 hover:text-danger'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                }`}
              style={isActive ? { background: rc.bg, color: rc.accent, border: `1px solid ${rc.border}` } : {}}
            >
              <Icon name={item.icon} size={17} />
              {(!collapsed || mobile) && <span className="flex-1">{item.label}</span>}
              {(!collapsed || mobile) && item.danger && (
                <span className="h-2 w-2 rounded-full bg-danger animate-blink" />
              )}
              {(!collapsed || mobile) && isActive && (
                <ChevronRight size={13} style={{ color: rc.accent }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div className={`border-t border-white/[0.06] p-3 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl font-heading text-xs font-bold text-bg-primary"
              style={{ background: rc.accent }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-text-primary">{state.user?.name || 'Operator'}</p>
              <p className="truncate text-[10px] capitalize text-text-muted">{state.user?.role || 'guest'}</p>
            </div>
            <button onClick={logout} className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors" title="Sign out">
            <LogOut size={15} />
          </button>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex h-10 items-center justify-center border-t border-white/[0.06] text-text-muted hover:bg-white/[0.03] hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 border-r border-white/[0.06] transition-all duration-200 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/[0.06] animate-slide-in"
            style={{ background: 'var(--bg-secondary)' }}>
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-xl"
          style={{ background: 'rgba(11,17,32,0.85)' }}>
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">

            {/* Left */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-text-secondary hover:border-accent/40 hover:text-accent transition-colors lg:hidden">
                <Menu size={17} />
              </button>
              <div>
                {eyebrow && <p className="label-accent hidden sm:block">{eyebrow}</p>}
                <h1 className="font-heading text-base font-bold text-text-primary sm:text-lg leading-tight">{title}</h1>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Network status */}
              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 sm:flex"
                style={{ background: 'rgba(30,41,59,0.5)' }}>
                <NetIcon size={13} style={{ color: net.color }} className={state.networkStatus === 'syncing' ? 'animate-spin' : ''} />
                <span className="text-[11px] font-semibold" style={{ color: net.color }}>{net.label}</span>
                {state.pendingSync > 0 && (
                  <span className="rounded-full bg-warn/20 px-1.5 py-0.5 text-[10px] font-bold text-warn">{state.pendingSync}</span>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotifOpen(v => !v)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
                  style={{ background: 'rgba(30,41,59,0.5)' }}>
                  <Bell size={16} />
                  {activeIncidents > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {activeIncidents}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-white/[0.08] p-3 shadow-2xl animate-slide-up"
                    style={{ background: 'var(--bg-card)' }}>
                    <p className="label mb-3">Active Incidents</p>
                    {state.incidents?.filter(i => i.status !== 'resolved').slice(0,4).map(inc => (
                      <div key={inc.incidentId} className="mb-2 flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/[0.04]">
                        <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-danger animate-blink" />
                        <div>
                          <p className="text-xs font-bold text-text-primary">{inc.touristName}</p>
                          <p className="text-[10px] text-text-muted">{inc.reason || inc.message}</p>
                        </div>
                      </div>
                    ))}
                    {activeIncidents === 0 && <p className="py-4 text-center text-xs text-text-muted">All clear — no active incidents</p>}
                  </div>
                )}
              </div>

              {actions}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-7 lg:py-6 pb-16 ${className}`}>
          {children}
        </main>
      </div>

      <DemoControlPanel />
      <TelemetryBar />
      <ToastStack />
    </div>
  );
}
