import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { getApiError } from '../api/client.js';

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { isAuthenticated, authenticate } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authenticate(mode, {
        ...(isRegister ? { name: form.name.trim() } : {}),
        email: form.email.trim(),
        password: form.password,
      });
      const destination = location.state?.from;
      navigate(typeof destination === 'string' ? destination : destination?.pathname || '/', {
        replace: true,
      });
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not authenticate. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-art-orb" />
        <div className="auth-art-grid" />
        <span className="auth-art-index">MODFORGE / ACCESS</span>
        <p>Every great world<br />starts with <em>curiosity.</em></p>
      </div>
      <section className="auth-card">
        <div className="eyebrow"><span /> YOUR NEXT ADVENTURE</div>
        <h1>{isRegister ? 'Join the forge.' : 'Welcome back.'}</h1>
        <p className="auth-intro">
          {isRegister
            ? 'Create an account to save mods and share what you think.'
            : 'Sign in to pick up where your next adventure begins.'}
        </p>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              <span>DISPLAY NAME</span>
              <input
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="How should we call you?"
              />
            </label>
          )}
          <label>
            <span>EMAIL ADDRESS</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            <span>PASSWORD</span>
            <input
              required
              type="password"
              minLength={8}
              maxLength={72}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 8 characters"
            />
          </label>
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already one of us?' : 'New to ModForge?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
        <Link className="auth-back" to="/">← Back to discovery</Link>
      </section>
    </main>
  );
}
