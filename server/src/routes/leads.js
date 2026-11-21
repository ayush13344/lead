import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { SORTABLE_COLUMNS, SOURCES, STATUSES } from '../constants.js';
import { badRequest, notFound } from '../errors.js';
import { validateLead } from '../validate.js';

const toInt = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function leadsRouter(db) {
  const router = Router();
  router.use(requireAuth);

  const findOwned = (id, userId) =>
    db.prepare('SELECT * FROM leads WHERE id = ? AND user_id = ?').get(id, userId);

  // GET /api/leads/meta : dropdown options so the client never hardcodes them
  router.get('/meta', (req, res) => res.json({ statuses: STATUSES, sources: SOURCES }));

  // GET /api/leads/stats : count of leads per status for the dashboard
  router.get('/stats', (req, res) => {
    const rows = db
      .prepare('SELECT status, COUNT(*) AS count FROM leads WHERE user_id = ? GROUP BY status')
      .all(req.userId);
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const r of rows) byStatus[r.status] = r.count;
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    res.json({ total, byStatus });
  });

  // GET /api/leads?search=&status=&sort=&order=&page=&limit=
  router.get('/', (req, res) => {
    const { search = '', status = '', sort = 'created_at', order = 'desc' } = req.query;
    const page = toInt(req.query.page, 1);
    const limit = Math.min(toInt(req.query.limit, 10), 50);

    if (status && !STATUSES.includes(status)) {
      throw badRequest({ status: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    const sortCol = SORTABLE_COLUMNS.includes(sort) ? sort : 'created_at';
    const sortDir = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where = ['user_id = ?'];
    const params = [req.userId];
    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    const term = String(search).trim();
    if (term) {
      // Escape LIKE wildcards so a search for "50%" matches literally.
      const like = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
      where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\')");
      params.push(like, like, like);
    }
    const whereSql = where.join(' AND ');

    const total = db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE ${whereSql}`).get(...params).n;
    const items = db
      .prepare(
        `SELECT * FROM leads WHERE ${whereSql}
         ORDER BY ${sortCol} COLLATE NOCASE ${sortDir}, id DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, (page - 1) * limit);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  });

  router.get('/:id', (req, res) => {
    const lead = findOwned(req.params.id, req.userId);
    if (!lead) throw notFound('Lead not found');
    res.json(lead);
  });

  router.post('/', (req, res) => {
    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) throw badRequest(errors);

    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO leads (user_id, name, email, phone, company, source, status)
         VALUES (@userId, @name, @email, @phone, @company, @source, @status)`,
      )
      .run({ ...value, userId: req.userId });

    res.status(201).json(findOwned(lastInsertRowid, req.userId));
  });

  router.put('/:id', (req, res) => {
    if (!findOwned(req.params.id, req.userId)) throw notFound('Lead not found');

    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) throw badRequest(errors);

    db.prepare(
      `UPDATE leads
          SET name = @name, email = @email, phone = @phone, company = @company,
              source = @source, status = @status, updated_at = datetime('now')
        WHERE id = @id AND user_id = @userId`,
    ).run({ ...value, id: req.params.id, userId: req.userId });

    res.json(findOwned(req.params.id, req.userId));
  });

  router.delete('/:id', (req, res) => {
    const { changes } = db
      .prepare('DELETE FROM leads WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);
    if (!changes) throw notFound('Lead not found');
    res.status(204).end();
  });

  return router;
}
