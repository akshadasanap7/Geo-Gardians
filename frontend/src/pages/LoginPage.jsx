import { useState } from 'react';
import api from '../services/api';
import { useApp } from '../store/AppContext';

export default function LoginPage({ onBack }) {
  const { dispatch } = useApp();
  const [tab, setTab]         = useState('login');
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'tourist' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(null); // { name, role }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload  = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      const data = await api.post(endpoint, payload);
      setWelcome({ name: data.user.name, role: data.user.role });
      setTimeout(() => dispatch({ type: 'LOGIN', token: data.token, user: data.user }), 1800);
    } catch (err) {
      setError(err?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sy-bg px-4">
      {/* Welcome toast */}
      {welcome && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-sy-accent text-sy-bg px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-slide-up flex items-center gap-2">
          ✅ Welcome, {welcome.name}! Logged in as <span className="capitalize">{welcome.role}</span>
        </div>
      )}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {onBack && (
            <button onClick={onBack} className="text-xs text-sy-muted hover:text-sy-accent mb-4 flex items-center gap-1 mx-auto transition-colors">
              ← Back to Home
            </button>
          )}
          <div className="text-4xl mb-2">🛡️</div>
          <h1 className="text-3xl font-black text-sy-accent">SafeYatra AI</h1>
          <p className="text-sy-muted text-sm mt-1">Smart Tourist Safety Monitoring</p>
        </div>

        <div className="bg-sy-card border border-sy-border rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-xl bg-sy-panel p-1 mb-6">
            {['login','register'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize
                  ${tab === t ? 'bg-sy-accent text-sy-bg' : 'text-sy-muted hover:text-sy-text'}`}>
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === 'register' && (
              <input value={form.name} onChange={set('name')} placeholder="Full name" required
                className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-3 text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
            )}
            <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" required
              className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-3 text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
            <input type="password" value={form.password} onChange={set('password')} placeholder="Password" required
              className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-3 text-sy-text placeholder-sy-muted focus:outline-none focus:border-sy-accent" />
            {tab === 'register' && (
              <select value={form.role} onChange={set('role')}
                className="w-full bg-sy-panel border border-sy-border rounded-xl px-4 py-3 text-sy-text focus:outline-none focus:border-sy-accent">
                <option value="tourist">Tourist</option>
                <option value="authority">Authority</option>
                <option value="responder">Responder</option>
                <option value="admin">Admin</option>
              </select>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-sy-accent text-sy-bg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-sy-panel rounded-xl border border-sy-border">
            <p className="text-xs text-sy-muted font-semibold mb-2">Demo accounts</p>
            <div className="space-y-1 text-xs text-sy-muted font-mono">
              <div>admin@safeyatra.com / admin123 (Admin)</div>
              <div>auth@safeyatra.com / auth123 (Authority)</div>
              <div>resp@safeyatra.com / resp123 (Responder)</div>
              <div>tourist@safeyatra.com / tour123 (Tourist)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
