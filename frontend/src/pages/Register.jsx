import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PasswordField from '../components/PasswordField';
import {
  validateName,
  validateEmail,
  validatePassword,
  stripInvalidNameChars,
} from '../utils/validation';
import './Auth.css';

function serverMessage(err) {
  if (!err.response) return "Can't reach the server. Check your connection and try again.";
  return err.response.data?.msg || 'Something went wrong. Try again.';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [nameNotice, setNameNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    name: validateName(form.name),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirm: !form.confirm
      ? 'Please confirm your password.'
      : form.confirm !== form.password
        ? "Passwords don't match."
        : null,
  };
  const show = (field) => (touched[field] ? errors[field] : null);
  const markTouched = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const cleaned = stripInvalidNameChars(value);
      setNameNotice(cleaned !== value ? 'Names can only contain letters, spaces, hyphens, apostrophes and periods.' : '');
      setForm({ ...form, name: cleaned });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (Object.values(errors).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start tracking every application in one place.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error" role="alert">{error}</div>}

            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jordan Lee"
                value={form.name}
                onChange={handleChange}
                onBlur={markTouched('name')}
                autoComplete="name"
                aria-invalid={show('name') || nameNotice ? true : undefined}
                aria-describedby="name-error"
                maxLength={60}
                required
              />
              {(nameNotice || show('name')) && (
                <p id="name-error" className="field-error" role="alert">
                  {nameNotice || show('name')}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={markTouched('email')}
                autoComplete="email"
                aria-invalid={show('email') ? true : undefined}
                aria-describedby="email-error"
                required
              />
              {show('email') && (
                <p id="email-error" className="field-error" role="alert">{show('email')}</p>
              )}
            </div>

            <PasswordField
              id="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              onBlur={markTouched('password')}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={show('password')}
              showStrength
            />

            <PasswordField
              id="confirm"
              label="Confirm password"
              value={form.confirm}
              onChange={handleChange}
              onBlur={markTouched('confirm')}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={show('confirm')}
            />

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    </div>
  );
}
