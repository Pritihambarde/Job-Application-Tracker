import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
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
          {sent ? (
            <>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It expires in 1 hour.
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Forgot your password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <button className="auth-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}

          <p className="auth-switch">
            Remembered it? <Link to="/login">Log in</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  );
}
