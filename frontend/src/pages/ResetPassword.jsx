import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import PasswordField from '../components/PasswordField';
import { validatePassword } from '../utils/validation';
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

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

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

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {error && <div className="auth-error" role="alert">{error}</div>}

                <PasswordField
                  id="password"
                  label="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  showStrength
                />

                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />

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
