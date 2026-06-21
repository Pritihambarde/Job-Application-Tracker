import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.msg || 'This link may have expired. Request a new one.');
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
          {done ? (
            <>
              <h1 className="auth-title">Password updated</h1>
              <p className="auth-subtitle">Taking you to the login page…</p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Set a new password</h1>
              <p className="auth-subtitle">Choose something you haven't used before.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="auth-error">{error}</div>}

                <div className="field">
                  <label htmlFor="password">New password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <button className="auth-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}

          <p className="auth-switch">
            <Link to="/login">Back to login</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  );
}
