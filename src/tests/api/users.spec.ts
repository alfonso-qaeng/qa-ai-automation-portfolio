import { test, expect } from '@playwright/test';
import { assertSchema, assertUserSchema, assertIsoDate } from '@utils/schema';
import type { ReqresListResponse, ReqresSingleResponse, ReqresCreatedUser, ReqresUpdatedUser, ReqresLoginSuccess, ReqresErrorResponse } from '@data/reqres';

test.describe('reqres.in REST API', () => {

  // ─── Users resource ───────────────────────────────────────────────────────

  test.describe('GET /api/users', () => {
    test('returns paginated list with correct metadata and valid user schema on every item', async ({ request }) => {
      const response = await request.get('/api/users', { params: { page: 1 } });

      expect(response.status()).toBe(200);

      const body = await response.json() as ReqresListResponse;

      // Pagination envelope schema
      assertSchema(body, {
        page:        'number',
        per_page:    'number',
        total:       'number',
        total_pages: 'number',
      });
      expect(body.page).toBe(1);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(body.per_page);

      // Every user in the list must satisfy the full user schema
      for (const user of body.data) {
        assertUserSchema(user);
      }
    });
  });

  test.describe('GET /api/users/:id', () => {
    test('returns 200 with correct data for an existing user (id 2)', async ({ request }) => {
      const response = await request.get('/api/users/2');

      expect(response.status()).toBe(200);

      const body = await response.json() as ReqresSingleResponse;

      assertUserSchema(body.data);
      expect(body.data.id).toBe(2);
      expect(body.data.email).toContain('@');
    });

    test('returns 404 with empty body for a non-existent user (id 9999)', async ({ request }) => {
      const response = await request.get('/api/users/9999');

      expect(response.status()).toBe(404);

      const body = await response.json() as Record<string, unknown>;
      expect(Object.keys(body)).toHaveLength(0);
    });
  });

  test.describe('POST /api/users', () => {
    test('creates a new user and returns 201 with id and createdAt', async ({ request }) => {
      const payload = { name: 'Jane Doe', job: 'QA Engineer' };

      const response = await request.post('/api/users', { data: payload });

      expect(response.status()).toBe(201);

      const body = await response.json() as ReqresCreatedUser;

      assertSchema(body, { name: 'string', job: 'string', id: 'string', createdAt: 'string' });
      expect(body.name).toBe(payload.name);
      expect(body.job).toBe(payload.job);
      expect(body.id).toBeTruthy();
      assertIsoDate(body.createdAt, 'createdAt');
    });
  });

  test.describe('PUT /api/users/:id', () => {
    test('updates a user and returns 200 with updatedAt timestamp', async ({ request }) => {
      const payload = { name: 'Jane Updated', job: 'Senior QA Engineer' };

      const response = await request.put('/api/users/2', { data: payload });

      expect(response.status()).toBe(200);

      const body = await response.json() as ReqresUpdatedUser;

      assertSchema(body, { name: 'string', job: 'string', updatedAt: 'string' });
      expect(body.name).toBe(payload.name);
      expect(body.job).toBe(payload.job);
      assertIsoDate(body.updatedAt, 'updatedAt');
    });
  });

  test.describe('DELETE /api/users/:id', () => {
    test('returns 204 with no response body', async ({ request }) => {
      const response = await request.delete('/api/users/2');

      expect(response.status()).toBe(204);
      expect(await response.text()).toBe('');
    });
  });

  // ─── Authentication ────────────────────────────────────────────────────────

  test.describe('POST /api/login', () => {
    test('returns 200 with a token for valid credentials', async ({ request }) => {
      const response = await request.post('/api/login', {
        data: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
      });

      expect(response.status()).toBe(200);

      const body = await response.json() as ReqresLoginSuccess;

      assertSchema(body, { token: 'string' });
      expect(body.token).toBeTruthy();
    });

    test('returns 400 with error message when password is missing', async ({ request }) => {
      const response = await request.post('/api/login', {
        data: { email: 'peter@klaven.com' }, // password intentionally omitted
      });

      expect(response.status()).toBe(400);

      const body = await response.json() as ReqresErrorResponse;

      assertSchema(body, { error: 'string' });
      expect(body.error).toBeTruthy();
    });
  });

  // ─── Registration ──────────────────────────────────────────────────────────

  test.describe('POST /api/register', () => {
    test('returns 400 with error message when required fields are missing', async ({ request }) => {
      const response = await request.post('/api/register', {
        data: { email: 'sydney@fife' }, // password intentionally omitted
      });

      expect(response.status()).toBe(400);

      const body = await response.json() as ReqresErrorResponse;

      assertSchema(body, { error: 'string' });
      expect(body.error).toBeTruthy();
    });
  });

});
