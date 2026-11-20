import { useState } from 'react';
import { ApiError } from '../api.js';
import { useAuth } from '../auth.jsx';
import Field from '../components/Field.jsx';
import { CupIcon } from '../components/Icons.jsx';
import { validateAuthForm } from '../validators.js';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';
  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup');
    setErrors({});
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateAuthForm(values, mode);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFormError('');
    try {
      await (isSignup ? signup(values) : login(values));
    } catch (err) {
      if (err instanceof ApiError && err.details && Object.keys(err.details).length) setErrors(err.details);
      else setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth-aside">
        <div className="brand brand-light"><CupIcon width={26} height={26} /> Lead Manager</div>
        <div>
          <h1>Every lead,<br />one warm place.</h1>
          <p>Capture new contacts, follow their journey from first hello to closed deal, and never lose track of who’s next.</p>
        </div>
        <small>Sales, kept simple.</small>
      </aside>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="muted">{isSignup ? 'Start tracking your leads in a minute.' : 'Log in to see your leads.'}</p>

          {isSignup && (
            <Field label="Your name" error={errors.name}>
              <input value={values.name} onChange={set('name')} autoComplete="name" autoFocus />
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            <input type="email" value={values.email} onChange={set('email')} autoComplete="email" autoFocus={!isSignup} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" value={values.password} onChange={set('password')} autoComplete={isSignup ? 'new-password' : 'current-password'} />
          </Field>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'One moment…' : isSignup ? 'Create account' : 'Log in'}
          </button>
          <p className="switch">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <button type="button" className="link-btn" onClick={switchMode}>
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
