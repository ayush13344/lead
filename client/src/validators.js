// Mirrors server/src/validate.js so users get instant feedback. The server stays the source of truth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]+$/;

export function validateLeadForm(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required';
  else if (v.name.trim().length > 100) e.name = 'Name must be 100 characters or fewer';

  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';

  const phone = v.phone.trim();
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (!PHONE_RE.test(phone) || digits.length < 7 || digits.length > 15) {
      e.phone = 'Enter a valid phone number (7–15 digits)';
    }
  }

  if (v.company.trim().length > 100) e.company = 'Company must be 100 characters or fewer';
  if (!v.source) e.source = 'Pick a source';
  return e;
}

export function validateAuthForm(v, mode) {
  const e = {};
  if (mode === 'signup' && !v.name.trim()) e.name = 'Name is required';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.password) e.password = 'Password is required';
  else if (mode === 'signup' && v.password.length < 8) e.password = 'Use at least 8 characters';
  return e;
}
