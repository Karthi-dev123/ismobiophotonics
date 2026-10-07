import { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from '../src/app';
import { parseEnv } from '../src/config/env';
import { validate } from '../src/middleware/validate';

const testRoutes = Router();
testRoutes.post('/test/echo', (req, res) => res.json(req.body));
testRoutes.get('/test/boom', () => {
  throw new Error('secret internal detail');
});
testRoutes.post(
  '/test/validate/:id',
  validate({
    params: z.object({ id: z.string().uuid() }),
    query: z.object({ status: z.enum(['A', 'B']).optional() }),
    body: z.object({ name: z.string().trim().min(1), email: z.string().email() }),
  }),
  (req, res) => res.json({ body: req.body, query: req.query }),
);

const app = createApp({ extraRoutes: testRoutes });

describe('foundation', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('unknown route returns 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  it('malformed JSON returns 400 INVALID_JSON as JSON', async () => {
    const res = await request(app)
      .post('/test/echo')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('oversized body returns 413', async () => {
    const res = await request(app).post('/test/echo').send({ blob: 'x'.repeat(200 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('unexpected errors return 500 without leaking internals', async () => {
    const res = await request(app).get('/test/boom');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
    expect(JSON.stringify(res.body)).not.toContain('secret internal detail');
    expect(JSON.stringify(res.body)).not.toContain('at ');
  });

  it('does not expose x-powered-by and sets security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('validate middleware', () => {
  const id = '3f1c2a52-8a43-4a5e-9a3e-2b2f1f0a9c11';

  it('passes and replaces with parsed values', async () => {
    const res = await request(app)
      .post(`/test/validate/${id}?status=A`)
      .send({ name: '  Alice  ', email: 'a@example.com', extra: 'ignored' });
    expect(res.status).toBe(200);
    expect(res.body.body).toEqual({ name: 'Alice', email: 'a@example.com' });
    expect(res.body.query).toEqual({ status: 'A' });
  });

  it('collects details from params, query and body', async () => {
    const res = await request(app)
      .post('/test/validate/not-a-uuid?status=Z')
      .send({ name: '   ', email: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const paths = res.body.error.details.map((d: { path: string }) => d.path).sort();
    expect(paths).toEqual(['email', 'name', 'params.id', 'query.status']);
  });

  it('rejects a missing body', async () => {
    const res = await request(app).post(`/test/validate/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('CORS', () => {
  it('allows the configured web origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://allowed.example');
    expect(res.headers['access-control-allow-origin']).toBe('http://allowed.example');
  });

  it('does not allow other origins', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers preflight for allowed origin with Authorization header allowed', async () => {
    const res = await request(app)
      .options('/api/projects')
      .set('Origin', 'http://allowed.example')
      .set('Access-Control-Request-Method', 'PUT')
      .set('Access-Control-Request-Headers', 'authorization,content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-headers']).toMatch(/Authorization/i);
  });
});

describe('env validation', () => {
  const base = {
    DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
    JWT_SECRET: 'x'.repeat(32),
    CORS_ORIGIN: 'http://a.example, http://b.example',
  };

  it('parses valid env and splits CORS origins', () => {
    const env = parseEnv(base);
    expect(env.CORS_ORIGIN).toEqual(['http://a.example', 'http://b.example']);
    expect(env.JWT_EXPIRES_IN).toBe('1h');
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => parseEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => parseEnv({ ...base, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });
});
