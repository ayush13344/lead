export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}
