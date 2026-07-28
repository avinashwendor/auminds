/** Shared account validation rules used by signup and admin user creation. */

export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateUsername(raw: unknown): ValidationResult<string> {
  const username = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!username) return { ok: false, error: 'Username is required.' };
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: 'Username must be 3-24 characters using lowercase letters, numbers or underscores.',
    };
  }
  return { ok: true, value: username };
}

export function validateEmail(raw: unknown, { required = true } = {}): ValidationResult<string | null> {
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!email) {
    return required ? { ok: false, error: 'Email address is required.' } : { ok: true, value: null };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  return { ok: true, value: email };
}

export function validatePassword(raw: unknown): ValidationResult<string> {
  const password = typeof raw === 'string' ? raw : '';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (password.length > 200) return { ok: false, error: 'Password is too long.' };
  return { ok: true, value: password };
}

export function validateName(raw: unknown): ValidationResult<string> {
  const name = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';
  if (name.length < 2) return { ok: false, error: 'Full name is required.' };
  if (name.length > 80) return { ok: false, error: 'Full name is too long.' };
  return { ok: true, value: name };
}

export function sanitizeFreeText(raw: unknown, maxLength = 400): string | null {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return null;
  return text.slice(0, maxLength);
}
