export default function Field({ label, error, optional, children }) {
  return (
    <label className={`field${error ? ' has-error' : ''}`}>
      <span className="field-label">
        {label}
        {optional && <em>optional</em>}
      </span>
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}
