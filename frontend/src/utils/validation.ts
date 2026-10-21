// Client-side validation. These rules mirror backend/middleware/validators.js —
// the server is still the source of truth; this just gives instant feedback.

// Letters (any language), spaces, hyphens, apostrophes and periods. No digits or symbols.
const NAME_PATTERN = /^\p{L}[\p{L}\s.'’-]*$/u;
const INVALID_NAME_CHARS = /[^\p{L}\s.'’-]/gu;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt silently truncates beyond this

export function validateName(raw: string): string | null {
  const name = raw.trim();
  if (!name) return 'Name is required.';
  if (name.length < 2) return 'Name must be at least 2 characters.';
  if (name.length > 60) return 'Name must be 60 characters or fewer.';
  if (!NAME_PATTERN.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, apostrophes and periods.';
  }
  return null;
}

/** Removes characters a name can't contain, so numbers/symbols can't be typed. */
export function stripInvalidNameChars(value: string): string {
  return value.replace(INVALID_NAME_CHARS, '');
}

export function validateEmail(raw: string): string | null {
  const email = raw.trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return null;
}

export interface PasswordRule {
  id: string;
  label: string;
  passed: boolean;
}

export function checkPassword(password: string): PasswordRule[] {
  return [
    { id: 'length', label: `At least ${PASSWORD_MIN} characters`, passed: password.length >= PASSWORD_MIN },
    { id: 'lower', label: 'One lowercase letter', passed: /[a-z]/.test(password) },
    { id: 'upper', label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', passed: /\d/.test(password) },
    { id: 'special', label: 'One special character (!@#$)', passed: /[^A-Za-z0-9\s]/.test(password) },
  ];
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length > PASSWORD_MAX) return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  const failed = checkPassword(password).find((r) => !r.passed);
  return failed ? `Password needs: ${failed.label.toLowerCase()}.` : null;
}

export interface PasswordStrength {
  /** 0 (empty) to 4 */
  score: 0 | 1 | 2 | 3 | 4;
  label: '' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '' };
  const passed = checkPassword(password).filter((r) => r.passed).length;
  if (passed === 5) {
    return password.length >= 12 ? { score: 4, label: 'Strong' } : { score: 3, label: 'Good' };
  }
  if (passed >= 3) return { score: 2, label: 'Fair' };
  return { score: 1, label: 'Weak' };
}
