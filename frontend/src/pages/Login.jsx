import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">→</span>
          Pipeline
        </div>

        <div className="auth-box">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to pick up your search where you left off.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="field-hint-link">Forgot password?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  );
}
