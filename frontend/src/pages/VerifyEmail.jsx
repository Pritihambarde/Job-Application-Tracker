import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import './Auth.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    api
      .get(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email is verified. You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.msg || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">→</span>
          Pipeline
        </div>

        <div className="auth-box">
          {status === 'verifying' && (
            <>
              <h1 className="auth-title">Verifying…</h1>
              <p className="auth-subtitle">One moment while we confirm your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-title">Email verified ✓</h1>
              <p className="auth-subtitle">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth-title">Verification failed</h1>
              <p className="auth-subtitle">{message}</p>
            </>
          )}

          <p className="auth-switch">
            <Link to="/login">Go to login</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  );
}
