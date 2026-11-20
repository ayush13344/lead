import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { CupIcon, PlusIcon, SearchIcon } from '../components/Icons.jsx';
import LeadForm from '../components/LeadForm.jsx';
import LeadsTable from '../components/LeadsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import StatsRow from '../components/StatsRow.jsx';
import { useToast } from '../components/Toast.jsx';
import { useDebounced } from '../hooks.js';

const PAGE_SIZE = 8;

export default function LeadsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);

  const [editing, setEditing] = useState(null); // null | 'new' | lead
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadStats = useCallback(() => api.stats().then(setStats).catch(() => {}), []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.listLeads({ search: debouncedSearch, status, sort, order, page, limit: PAGE_SIZE });
      // Deleting the last row of a page would leave us on an empty page; step back.
      if (res.items.length === 0 && page > 1) setPage(res.totalPages);
      else setData(res);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, sort, order, page]);

  useEffect(() => { api.meta().then(setMeta).catch((e) => setLoadError(e.message)); loadStats(); }, [loadStats]);
  useEffect(() => { loadLeads(); }, [loadLeads]);

  const refresh = () => Promise.all([loadLeads(), loadStats()]);

  const changeStatus = (s) => { setStatus(s); setPage(1); };
  const changeSearch = (v) => { setSearch(v); setPage(1); };
  const changeSort = (key) => {
    if (key === sort) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSort(key); setOrder('asc'); }
    setPage(1);
  };

  async function saveLead(values) {
    const isEdit = editing !== 'new';
    if (isEdit) await api.updateLead(editing.id, values);
    else await api.createLead(values);
    setEditing(null);
    toast(isEdit ? 'Lead updated' : 'Lead added');
    refresh();
  }

  async function confirmDelete() {
    setDeleteBusy(true);
    try {
      await api.deleteLead(deleting.id);
      toast('Lead deleted');
      setDeleting(null);
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const filtered = Boolean(debouncedSearch || status);
  const clearFilters = () => { setSearch(''); setStatus(''); setPage(1); };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><CupIcon width={24} height={24} /> Lead Manager</div>
        <div className="topbar-right">
          <span className="muted hide-sm">Signed in as <strong>{user.name}</strong></span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="content">
        <div className="page-head">
          <div>
            <h1>Your leads</h1>
            <p className="muted">Keep every conversation moving, from first hello to closed deal.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')} disabled={!meta}>
            <PlusIcon /> Add lead
          </button>
        </div>

        <StatsRow stats={stats} activeStatus={status} onPick={changeStatus} />

        <section className="card">
          <div className="toolbar">
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search by name, email or company"
                aria-label="Search leads"
              />
            </label>
            <select value={status} onChange={(e) => changeStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              {meta?.statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loadError ? (
            <div className="state state-error">
              <p>{loadError}</p>
              <button type="button" className="btn btn-ghost" onClick={refresh}>Try again</button>
            </div>
          ) : loading && data.items.length === 0 ? (
            <div className="state muted">Loading leads…</div>
          ) : data.items.length === 0 ? (
            <div className="state">
              <h3>{filtered ? 'No leads match your search' : 'No leads yet'}</h3>
              <p className="muted">
                {filtered ? 'Try a different name or clear the filters.' : 'Add your first lead to get started.'}
              </p>
              {filtered
                ? <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
                : <button type="button" className="btn btn-primary" onClick={() => setEditing('new')} disabled={!meta}><PlusIcon /> Add lead</button>}
            </div>
          ) : (
            <div className={loading ? 'is-loading' : undefined}>
              <LeadsTable leads={data.items} sort={sort} order={order} onSort={changeSort} onEdit={setEditing} onDelete={setDeleting} />
              <Pagination page={page} totalPages={data.totalPages} total={data.total} limit={PAGE_SIZE} onPage={setPage} />
            </div>
          )}
        </section>
      </main>

      {editing && meta && (
        <LeadForm lead={editing === 'new' ? null : editing} meta={meta} onSubmit={saveLead} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <ConfirmDialog lead={deleting} busy={deleteBusy} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}
