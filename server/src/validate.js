import { SOURCES, STATUSES } from './constants.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

/** Returns { errors, value }. `errors` is an object keyed by field name (empty when valid). */
export function validateLead(body = {}) {
  const value = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    phone: str(body.phone),
    company: str(body.company),
    source: str(body.source),
    status: str(body.status) || 'New',
  };
  const errors = {};

  if (!value.name) errors.name = 'Name is required';
  else if (value.name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!value.email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(value.email)) errors.email = 'Enter a valid email address';
  else if (value.email.length > 254) errors.email = 'Email is too long';

  if (value.phone) {
    const digits = value.phone.replace(/\D/g, '');
    if (!PHONE_RE.test(value.phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a valid phone number (7–15 digits)';
    }
  }

  if (value.company.length > 100) errors.company = 'Company must be 100 characters or fewer';

  if (!value.source) errors.source = 'Source is required';
  else if (!SOURCES.includes(value.source)) errors.source = 'Pick a source from the list';

  if (!STATUSES.includes(value.status)) errors.status = 'Pick a status from the list';

  return { errors, value };
}

export function validateSignup(body = {}) {
  const value = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = {};

  if (!value.name) errors.name = 'Name is required';
  else if (value.name.length > 100) errors.name = 'Name must be 100 characters or fewer';

  if (!value.email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(value.email)) errors.email = 'Enter a valid email address';

  if (!value.password) errors.password = 'Password is required';
  else if (value.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (value.password.length > 72) errors.password = 'Password must be 72 characters or fewer';

  return { errors, value };
}

export function validateLogin(body = {}) {
  const value = {
    email: str(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = {};
  if (!value.email) errors.email = 'Email is required';
  if (!value.password) errors.password = 'Password is required';
  return { errors, value };
}
