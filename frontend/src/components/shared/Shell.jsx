import { useApp } from '../../store/AppContext';
import NetworkBadge from './NetworkBadge';

export default function Shell({ title, icon, children }) {
  const { state, dispatch } = useApp();
  const user = state.user;
  return (
    <div className="min-h-screen bg-sy-bg flex flex-col">
      <header className="bg-sy-panel border-b border-sy-border px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h1 className="text-sy-accent font-black text-lg leading-none">SafeYatra AI</h1>
            <p className="text-sy-muted text-xs">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NetworkBadge />
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-sy-card border border-sy-border rounded-xl px-3 py-1.5">
              <span className="text-sy-accent text-xs">👤</span>
              <span className="text-xs font-semibold text-sy-text">{user.name}</span>
              <span className="text-xs text-sy-muted capitalize bg-sy-panel px-2 py-0.5 rounded-lg">{user.role}</span>
            </div>
          )}
          <button onClick={() => dispatch({ type: 'LOGOUT' })}
            className="text-xs text-sy-muted hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-sy-border hover:border-red-700">
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
