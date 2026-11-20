import { useEffect, useState } from 'react';
import { ApiError } from '../api.js';
import { validateLeadForm } from '../validators.js';
import Field from './Field.jsx';
import { CloseIcon } from './Icons.jsx';

const EMPTY = { name: '', email: '', phone: '', company: '', source: '', status: 'New' };

export default function LeadForm({ lead, meta, onSubmit, onClose }) {
  const [values, setValues] = useState(lead ? { ...EMPTY, ...lead } : EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saving, onClose]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateLeadForm(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && err.details && Object.keys(err.details).length) setErrors(err.details);
      else setFormError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form className="dialog" onSubmit={handleSubmit} noValidate aria-labelledby="lead-form-title">
        <header className="dialog-head">
          <h2 id="lead-form-title">{lead ? 'Edit lead' : 'Add a new lead'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={saving}>
            <CloseIcon />
          </button>
        </header>

        <div className="form-grid">
          <Field label="Full name" error={errors.name}>
            <input value={values.name} onChange={set('name')} placeholder="Asha Verma" autoFocus maxLength={100} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={values.email} onChange={set('email')} placeholder="asha@company.com" />
          </Field>
          <Field label="Phone" error={errors.phone} optional>
            <input type="tel" value={values.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Company" error={errors.company} optional>
            <input value={values.company} onChange={set('company')} placeholder="Acme Pvt. Ltd." maxLength={100} />
          </Field>
          <Field label="Source" error={errors.source}>
            <select value={values.source} onChange={set('source')}>
              <option value="">Select a source</option>
              {meta.sources.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status" error={errors.status}>
            <select value={values.status} onChange={set('status')}>
              {meta.statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {formError && <p className="form-error" role="alert">{formError}</p>}

        <footer className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : lead ? 'Save changes' : 'Add lead'}
          </button>
        </footer>
      </form>
    </div>
  );
}
