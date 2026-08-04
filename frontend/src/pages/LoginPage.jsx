import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Phone, Shield, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const ROLE_COPY = {
  tourist:   'Your personal safety companion',
  authority: 'Live control room workspace',
  responder: 'Dispatch and field response',
  admin:     'System control plane'
};

const STAFF_ROLES = ['authority', 'responder', 'admin'];

function Field({ label, type = 'text', value, onChange, placeholder, icon: Icon, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-white/70">{label}</span>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-3.5 text-white/35" />}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`h-11 w-full border border-sy-border bg-sy-panel text-sm text-white placeholder:text-white/30 ${Icon ? 'pl-9' : 'px-3'} ${isPassword ? 'pr-10' : 'pr-3'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-3 text-white/35 hover:text-white/70">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </label>
  );
}

export default function LoginPage({ register = false }) {
  const { state, login } = useApp();
  const navigate = useNavigate();

  // mode: 'login' | 'signup'
  const [mode, setMode]       = useState(register ? 'signup' : 'login');
  const [role, setRole]       = useState('tourist');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    if (state.user) navigate(`/${state.user.role}/dashboard`, { replace: true });
  }, [navigate, state.user]);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setError(''); };

  // client-side validation before hitting API
  function validate() {
    if (mode === 'signup') {
      if (!form.name.trim())  return 'Full name is required.';
      if (!form.email.trim()) return 'Email is required.';
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    } else {
      if (!form.email.trim())    return 'Email is required.';
      if (!form.password.trim()) return 'Password is required.';
    }
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      if (mode === 'signup') {
        await login({ mode: 'signup', ...form });
        // AppContext redirects via useEffect after user is set
      } else {
        await login({ mode: 'login', email: form.email, password: form.password });
      }
    } catch (ex) {
      const msg = ex?.error || ex?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-sy-bg text-sy-text">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">

        {/* Left panel */}
        <section className="relative hidden overflow-hidden border-r border-sy-border bg-sy-bg-soft lg:block">
          <div className="absolute inset-0 sy-grid opacity-30" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-16">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center border border-sy-accent/40 bg-sy-accent/10 text-sy-accent">
                <Shield size={19} />
              </span>
              <span className="text-sm font-extrabold text-white">SafeYatra <span className="text-sy-accent">AI</span></span>
            </Link>
            <div>
              <p className="sy-label text-sy-accent">{isSignup ? 'Tourist registration' : 'Secure access'}</p>
              <h1 className="mt-4 max-w-lg text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
                {isSignup
                  ? 'Register once. Stay protected everywhere.'
                  : 'Every role sees the same truth, at the right moment.'}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/50">
                {isSignup
                  ? 'Create your tourist account to enable live GPS tracking, AI risk scoring, geo-fence alerts and one-tap SOS.'
                  : 'Authority, Responder and Admin accounts are managed by the system administrator. Tourists can register below.'}
              </p>
              <div className="mt-12 grid gap-2">
                {[['DETECT', 'GPS, zones and movement'], ['RESPOND', 'Authority and responder handoff'], ['SYNC', 'Offline queue reconciliation']].map(([label, copy]) => (
                  <div key={label} className="flex items-center gap-4 border-t border-sy-border py-3">
                    <span className="w-16 font-mono text-[10px] text-sy-accent">{label}</span>
                    <span className="text-xs text-white/55">{copy}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">SafeYatra AI · smart tourist safety</p>
          </div>
        </section>

        {/* Right panel — form */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center border border-sy-accent/40 bg-sy-accent/10 text-sy-accent">
                  <Shield size={19} />
                </span>
                <span className="text-sm font-extrabold text-white">SafeYatra <span className="text-sy-accent">AI</span></span>
              </Link>
              <Link to="/" className="text-white/50"><ArrowLeft size={17} /></Link>
            </div>

            <div className="mb-8">
              <p className="sy-label text-sy-accent">{isSignup ? 'Tourist registration' : 'Sign in to your workspace'}</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {isSignup ? 'Create your account.' : 'Welcome back.'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                {isSignup ? 'Fill in your details to get started.' : ROLE_COPY[role]}
              </p>
            </div>

            {/* Mode tabs — only show for tourist or when logging in */}
            <div className="mb-6 grid grid-cols-2 border border-sy-border bg-sy-panel p-1">
              <button onClick={() => { setMode('login'); setError(''); }}
                className={`min-h-10 text-xs font-bold transition-colors ${mode === 'login' ? 'bg-sy-accent text-sy-bg' : 'text-white/50 hover:text-white'}`}>
                Sign in
              </button>
              <button onClick={() => { setMode('signup'); setRole('tourist'); setError(''); }}
                className={`min-h-10 text-xs font-bold transition-colors ${mode === 'signup' ? 'bg-sy-accent text-sy-bg' : 'text-white/50 hover:text-white'}`}>
                Register as Tourist
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 border border-sy-border bg-sy-card p-5 shadow-2xl sm:p-6" noValidate>

              {/* Signup-only fields */}
              {isSignup && (
                <>
                  <Field label="Full name" value={form.name} onChange={set('name')}
                    placeholder="Your full name" icon={UserRound} required autoComplete="name" />
                  <Field label="Mobile number (optional)" type="tel" value={form.phone}
                    onChange={set('phone')} placeholder="+91 98765 43210" icon={Phone} autoComplete="tel" />
                </>
              )}

              {/* Role selector — login only, non-tourist roles */}
              {!isSignup && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-white/70">Role</span>
                  <select value={role} onChange={(e) => setRole(e.target.value)}
                    className="h-11 w-full border border-sy-border bg-sy-panel px-3 text-sm text-white">
                    {Object.entries(ROLE_COPY).map(([key, label]) => (
                      <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)} — {label}</option>
                    ))}
                  </select>
                  {STAFF_ROLES.includes(role) && (
                    <p className="mt-1.5 text-[10px] text-white/40">
                      {role.charAt(0).toUpperCase() + role.slice(1)} accounts are created by the system administrator.
                    </p>
                  )}
                </label>
              )}

              <Field label="Email address" type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" required autoComplete="email" />

              <Field label="Password" type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" icon={LockKeyhole} required autoComplete={isSignup ? 'new-password' : 'current-password'} />

              {isSignup && (
                <Field label="Confirm password" type="password" value={form.confirmPassword}
                  onChange={set('confirmPassword')} placeholder="••••••••" icon={LockKeyhole}
                  required autoComplete="new-password" />
              )}

              {/* Error */}
              {error && (
                <p role="alert" className="border border-red-300/30 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
                  {error}
                </p>
              )}

              {/* Success */}
              {success && (
                <p className="border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs leading-5 text-emerald-200">
                  {success}
                </p>
              )}

              <button disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-sy-accent text-sm font-extrabold text-sy-bg transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
                {loading
                  ? (isSignup ? 'Creating account…' : 'Signing in…')
                  : (isSignup ? 'Create account' : 'Sign in')}
                {!loading && <ArrowRight size={16} />}
              </button>

              {/* Forgot password placeholder */}
              {!isSignup && (
                <p className="text-center text-xs text-white/35">
                  <button type="button" className="hover:text-white/60">Forgot password?</button>
                </p>
              )}
            </form>

            {/* Staff note */}
            {!isSignup && (
              <div className="mt-4 border border-sy-border bg-sy-bg-soft px-4 py-3">
                <p className="text-xs text-white/40 leading-5">
                  <span className="font-bold text-white/60">Authority, Responder & Admin</span> — accounts are provisioned by the system administrator. Contact your supervisor if you need access.
                </p>
              </div>
            )}

            <p className="mt-5 text-center text-xs text-white/35">
              <Link to="/" className="hover:text-white">← Back to public site</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
