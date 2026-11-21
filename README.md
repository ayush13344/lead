# Lead Manager

A small full-stack app for capturing and tracking sales leads: React frontend, Express REST API, SQLite database.

**Features**

- Add, edit, delete (with confirmation) and list leads
- Status tracking: New / Contacted / Qualified / Lost
- Search by name, email or company, and filter by status
- Validation on both the frontend and the backend
- Signup/login, so every user sees only their own leads
- Sortable, paginated table
- Dashboard cards with a count per status (click one to filter)
- Automated API tests (9 tests)

## Run it locally

Requires Node.js 18 or newer.

```bash
# 1. install dependencies for both apps
npm run setup

# 2. configure the server
cp server/.env.example server/.env      # then set JWT_SECRET to any long random string

# 3. start API (http://localhost:4000) and web app (http://localhost:5173) together
npm run dev
```

Open http://localhost:5173, create an account, and add a lead. The SQLite file is created automatically at `server/data/leads.db`.

If you prefer two terminals: `npm run dev --prefix server` and `npm run dev --prefix client`.

**Tests:** `npm test`

**Production-style run** (Express serves the built React app, one process, one port):

```bash
npm run build
npm start        # http://localhost:4000
```

## Tech choices

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite, plain CSS | Matches the team's stack. Vite gives a fast dev loop. Plain CSS with variables keeps the coffee theme in one place without a UI-kit look. |
| Backend | Node + Express 4 | Small, familiar, and enough for a REST API this size. |
| Database | SQLite (`better-sqlite3`) | Zero setup for reviewers, real SQL, foreign keys and indexes. Swapping to PostgreSQL would only touch `db.js` and the queries. |
| Auth | bcrypt (`bcryptjs`) + JWT | Stateless, simple, and each lead is scoped to its owner. |
| Tests | `node:test` + `supertest` | No extra test framework needed. |

## API

All `/api/leads` routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account, returns `{ token, user }` |
| POST | `/api/auth/login` | Log in, returns `{ token, user }` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/leads?search=&status=&sort=&order=&page=&limit=` | Paginated list |
| GET | `/api/leads/stats` | Count per status |
| GET | `/api/leads/meta` | Allowed statuses and sources (drives the dropdowns) |
| GET | `/api/leads/:id` | One lead |
| POST | `/api/leads` | Create |
| PUT | `/api/leads/:id` | Update (including status) |
| DELETE | `/api/leads/:id` | Delete |

Errors use a consistent shape: `{ "error": "message", "details": { "field": "message" } }`, with 400 for validation, 401 for auth, 404 for missing or not-owned leads, and 409 for a duplicate email.

## Database

- `users(id, name, email UNIQUE, password_hash, created_at)`
- `leads(id, user_id → users, name, email, phone, company, source, status CHECK(...), created_at, updated_at)`
- Indexes on `(user_id, status)` and `(user_id, created_at)`, matching the two ways the table is queried.

## Assumptions

- Name, email and source are required. Phone and company are optional, since a lead often starts with just a name and an email.
- Phone numbers are validated loosely (7–15 digits, with `+ - ( ) .` and spaces allowed) because formats vary by country.
- Source options are a fixed list defined once on the server: Website, Referral, LinkedIn, Cold Call, Email Campaign, Trade Show, Other.
- Search matches name, email and company (a superset of the "name" requirement).
- Duplicate lead emails are allowed, since the same person can arrive through different channels.
- A lead belonging to another user returns 404 (not 403) so lead IDs can't be probed.

## What I cut, and what I'd improve with more time

- **Database migrations** (currently `CREATE TABLE IF NOT EXISTS`), and PostgreSQL for a multi-instance deployment.
- **Frontend tests** (component tests with Vitest/Testing Library, plus a Playwright flow).
- **Auth hardening:** rate limiting on login, refresh tokens or httpOnly cookies instead of `localStorage`, password reset.
- **Lead notes and activity history**, plus bulk actions and CSV import/export.
- **Optimistic updates** so status changes feel instant.
- **Deployment:** the app is ready to run as a single service (`npm run build && npm start`); I haven't deployed it.
