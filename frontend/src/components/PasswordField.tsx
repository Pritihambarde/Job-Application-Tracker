import { useId, useState } from 'react';
import type { ChangeEventHandler, ReactNode } from 'react';
import { checkPassword, passwordStrength } from '../utils/validation';

interface PasswordFieldProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete: 'new-password' | 'current-password';
  error?: string | null;
  /** Show the live strength bar and requirement checklist (use on sign-up / reset). */
  showStrength?: boolean;
  /** Extra content on the right of the label row, e.g. a "Forgot password?" link. */
  labelAside?: ReactNode;
}

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  showStrength = false,
  labelAside,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = useId();
  const rulesId = useId();
  const strength = passwordStrength(value);
  const rules = checkPassword(value);

  const describedBy =
    [error ? errorId : null, showStrength ? rulesId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={id}>{label}</label>
        {labelAside}
      </div>

      <div className="password-wrap">
        <input
          id={id}
          name={name ?? id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}

      {showStrength && (
        <div id={rulesId} className="pw-help">
          <div className={`pw-meter pw-score-${strength.score}`} aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <p className="pw-strength-label" aria-live="polite">
            {strength.label ? `Password strength: ${strength.label}` : 'Choose a strong password'}
          </p>
          <ul className="pw-rules">
            {rules.map((r) => (
              <li key={r.id} className={r.passed ? 'pw-rule-ok' : ''}>
                <span aria-hidden="true">{r.passed ? '✓' : '○'}</span>
                {r.label}
                <span className="sr-only">{r.passed ? ' (met)' : ' (not met)'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
