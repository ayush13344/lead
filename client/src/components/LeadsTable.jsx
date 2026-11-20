import { formatDate } from '../hooks.js';
import { ArrowIcon, EditIcon, TrashIcon } from './Icons.jsx';
import StatusBadge from './StatusBadge.jsx';

const COLUMNS = [
  { key: 'name', label: 'Lead', sortable: true },
  { key: 'contact', label: 'Contact' },
  { key: 'source', label: 'Source', sortable: true, className: 'col-source' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'created_at', label: 'Added', sortable: true, className: 'col-added' },
];

export default function LeadsTable({ leads, sort, order, onSort, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = sort === c.key;
              return (
                <th key={c.key} className={c.className} aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable ? (
                    <button type="button" className="th-btn" onClick={() => onSort(c.key)}>
                      {c.label}
                      {active && <ArrowIcon dir={order === 'asc' ? 'up' : 'down'} />}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
            <th className="col-actions"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td>
                <div className="lead-name">{l.name}</div>
                <div className="muted small">{l.company || '—'}</div>
              </td>
              <td>
                <a className="link" href={`mailto:${l.email}`}>{l.email}</a>
                <div className="muted small">{l.phone || '—'}</div>
              </td>
              <td className="col-source">{l.source}</td>
              <td><StatusBadge status={l.status} /></td>
              <td className="col-added muted">{formatDate(l.created_at)}</td>
              <td className="col-actions">
                <button type="button" className="icon-btn" onClick={() => onEdit(l)} aria-label={`Edit ${l.name}`} title="Edit">
                  <EditIcon />
                </button>
                <button type="button" className="icon-btn icon-btn-danger" onClick={() => onDelete(l)} aria-label={`Delete ${l.name}`} title="Delete">
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
