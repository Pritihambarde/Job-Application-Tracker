import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PasswordField from '../components/PasswordField';
import { validateEmail } from '../utils/validation';
import './Auth.css';

function serverMessage(err) {
  if (!err.response) return "Can't reach the server. Check your connection and try again.";
  return err.response.data?.msg || 'Something went wrong. Try again.';
}

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
    const emailError = validateEmail(form.email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(serverMessage(err));
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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error" role="alert">{error}</div>}

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

            <PasswordField
              id="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              autoComplete="current-password"
              labelAside={<Link to="/forgot-password" className="field-hint-link">Forgot password?</Link>}
            />

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
