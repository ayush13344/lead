import { before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';

const validLead = {
  name: 'Asha Verma',
  email: 'asha@acme.io',
  phone: '+91 98765 43210',
  company: 'Acme',
  source: 'Website',
  status: 'New',
};

let app;

async function signup(email = `u${Math.random().toString(36).slice(2)}@test.io`) {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: 'Tester', email, password: 'password123' });
  assert.equal(res.status, 201);
  return { token: res.body.token, email };
}

const authed = (token) => ({ Authorization: `Bearer ${token}` });

before(() => {
  app = createApp(openDb(':memory:'));
});

describe('auth', () => {
  test('signup then login works', async () => {
    const { email } = await signup();
    const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('rejects duplicate email, weak password and bad login', async () => {
    const { email } = await signup();
    const dup = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'X', email, password: 'password123' });
    assert.equal(dup.status, 409);

    const weak = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'X', email: 'new@test.io', password: 'short' });
    assert.equal(weak.status, 400);
    assert.ok(weak.body.details.password);

    const bad = await request(app).post('/api/auth/login').send({ email, password: 'nope-nope' });
    assert.equal(bad.status, 401);
  });

  test('leads endpoints require a token', async () => {
    const res = await request(app).get('/api/leads');
    assert.equal(res.status, 401);
  });
});

describe('leads CRUD', () => {
  test('creates, reads, updates status, and deletes a lead', async () => {
    const { token } = await signup();

    const created = await request(app).post('/api/leads').set(authed(token)).send(validLead);
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'New');
    const id = created.body.id;

    const updated = await request(app)
      .put(`/api/leads/${id}`)
      .set(authed(token))
      .send({ ...validLead, status: 'Qualified' });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.status, 'Qualified');

    const del = await request(app).delete(`/api/leads/${id}`).set(authed(token));
    assert.equal(del.status, 204);

    const gone = await request(app).get(`/api/leads/${id}`).set(authed(token));
    assert.equal(gone.status, 404);
  });

  test('validates input and reports every bad field', async () => {
    const { token } = await signup();
    const res = await request(app)
      .post('/api/leads')
      .set(authed(token))
      .send({ name: '', email: 'not-an-email', phone: 'abc', source: 'Nope', status: 'Maybe' });
    assert.equal(res.status, 400);
    for (const field of ['name', 'email', 'phone', 'source', 'status']) {
      assert.ok(res.body.details[field], `expected an error for ${field}`);
    }
  });

  test("users cannot see, edit or delete each other's leads", async () => {
    const alice = await signup();
    const bob = await signup();
    const { body } = await request(app).post('/api/leads').set(authed(alice.token)).send(validLead);

    const list = await request(app).get('/api/leads').set(authed(bob.token));
    assert.equal(list.body.total, 0);

    const put = await request(app)
      .put(`/api/leads/${body.id}`)
      .set(authed(bob.token))
      .send(validLead);
    assert.equal(put.status, 404);

    const del = await request(app).delete(`/api/leads/${body.id}`).set(authed(bob.token));
    assert.equal(del.status, 404);
  });
});

describe('search, filter, sort, pagination, stats', () => {
  test('filters by status and searches by name', async () => {
    const { token } = await signup();
    const make = (name, status) =>
      request(app)
        .post('/api/leads')
        .set(authed(token))
        .send({ ...validLead, name, email: `${name.toLowerCase()}@x.io`, status });
    await make('Alpha', 'New');
    await make('Bravo', 'Lost');
    await make('Alphonse', 'Lost');

    const lost = await request(app).get('/api/leads?status=Lost').set(authed(token));
    assert.equal(lost.body.total, 2);

    const search = await request(app).get('/api/leads?search=alph').set(authed(token));
    assert.equal(search.body.total, 2);

    const both = await request(app).get('/api/leads?search=alph&status=Lost').set(authed(token));
    assert.equal(both.body.total, 1);
    assert.equal(both.body.items[0].name, 'Alphonse');

    const badStatus = await request(app).get('/api/leads?status=Bogus').set(authed(token));
    assert.equal(badStatus.status, 400);
  });

  test('paginates and sorts', async () => {
    const { token } = await signup();
    for (const n of ['Cara', 'Aman', 'Beth', 'Dev', 'Esha']) {
      await request(app)
        .post('/api/leads')
        .set(authed(token))
        .send({ ...validLead, name: n, email: `${n}@x.io` });
    }
    const page = await request(app)
      .get('/api/leads?limit=2&page=2&sort=name&order=asc')
      .set(authed(token));
    assert.equal(page.body.total, 5);
    assert.equal(page.body.totalPages, 3);
    assert.deepEqual(
      page.body.items.map((l) => l.name),
      ['Cara', 'Dev'],
    );
  });

  test('stats count leads per status', async () => {
    const { token } = await signup();
    await request(app).post('/api/leads').set(authed(token)).send(validLead);
    await request(app)
      .post('/api/leads')
      .set(authed(token))
      .send({ ...validLead, email: 'b@x.io', status: 'Contacted' });
    const res = await request(app).get('/api/leads/stats').set(authed(token));
    assert.deepEqual(res.body, {
      total: 2,
      byStatus: { New: 1, Contacted: 1, Qualified: 0, Lost: 0 },
    });
  });
});
