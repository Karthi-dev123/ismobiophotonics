import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { bearer, registerUser, uniqueEmail } from './helpers/auth';
import { prisma, resetDb } from './helpers/db';

const app = createApp();

/** Asserts no password material anywhere in a response body. */
function expectNoSecrets(body: unknown) {
  const text = JSON.stringify(body);
  expect(text).not.toMatch(/password/i);
  expect(text).not.toMatch(/\$2[aby]\$/); // bcrypt hash prefix
}

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/register', () => {
  it('creates a user, returns user + token, stores only a bcrypt hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: '  Alice Example ', email: ' Alice@Example.COM ', password: 'Password123!' });
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      fullName: 'Alice Example',
      email: 'alice@example.com',
      createdAt: expect.any(String),
    });
    expect(typeof res.body.token).toBe('string');
    expectNoSecrets(res.body);

    const row = await prisma.user.findUniqueOrThrow({ where: { email: 'alice@example.com' } });
    expect(row.passwordHash).not.toBe('Password123!');
    expect(row.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('returned token works on /me', async () => {
    const { token, user } = await registerUser(app);
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(user);
  });

  it('rejects a duplicate email, case-insensitively', async () => {
    await registerUser(app, { email: 'dup@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Other', email: 'DUP@example.com', password: 'Password123!' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
    expect(await prisma.user.count()).toBe(1);
  });

  it('handles concurrent duplicate registrations with one success and one 409', async () => {
    const body = { fullName: 'Race', email: 'race@example.com', password: 'Password123!' };
    const results = await Promise.all([
      request(app).post('/api/auth/register').send(body),
      request(app).post('/api/auth/register').send(body),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
  });

  it.each([
    ['missing fullName', { email: 'a@example.com', password: 'Password123!' }, 'fullName'],
    ['blank fullName', { fullName: '   ', email: 'a@example.com', password: 'Password123!' }, 'fullName'],
    ['fullName too long', { fullName: 'x'.repeat(101), email: 'a@example.com', password: 'Password123!' }, 'fullName'],
    ['missing email', { fullName: 'A', password: 'Password123!' }, 'email'],
    ['invalid email', { fullName: 'A', email: 'not-an-email', password: 'Password123!' }, 'email'],
    ['empty email', { fullName: 'A', email: '', password: 'Password123!' }, 'email'],
    ['missing password', { fullName: 'A', email: 'a@example.com' }, 'password'],
    ['short password (7)', { fullName: 'A', email: 'a@example.com', password: '1234567' }, 'password'],
    ['long password (73)', { fullName: 'A', email: 'a@example.com', password: 'x'.repeat(73) }, 'password'],
    ['non-string password', { fullName: 'A', email: 'a@example.com', password: 12345678 }, 'password'],
  ])('rejects %s with 400', async (_name, body, path) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d: { path: string }) => d.path)).toContain(path);
  });

  it('accepts boundary password lengths 8 and 72', async () => {
    await registerUser(app, { password: '12345678' });
    await registerUser(app, { password: 'x'.repeat(72) });
  });

  it('ignores server-controlled extra fields', async () => {
    const fixedId = '11111111-1111-4111-8111-111111111111';
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Eve',
      email: 'eve@example.com',
      password: 'Password123!',
      id: fixedId,
      passwordHash: 'plaintext',
      createdAt: '2000-01-01T00:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.id).not.toBe(fixedId);
    const row = await prisma.user.findUniqueOrThrow({ where: { email: 'eve@example.com' } });
    expect(row.passwordHash).not.toBe('plaintext');
    expect(row.createdAt.getFullYear()).not.toBe(2000);
  });

  it('rejects a non-object body', async () => {
    const res = await request(app).post('/api/auth/register').send(['a', 'b']);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials (email case-insensitive)', async () => {
    const { user } = await registerUser(app, { email: 'bob@example.com' });
    const res = await request(app).post('/api/auth/login').send({ email: 'BOB@example.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(user);
    expect(typeof res.body.token).toBe('string');
    expectNoSecrets(res.body);
  });

  it('gives the same 401 for wrong password and unknown email', async () => {
    await registerUser(app, { email: 'bob@example.com' });
    const wrongPw = await request(app).post('/api/auth/login').send({ email: 'bob@example.com', password: 'wrong-password' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong-password' });
    expect(wrongPw.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPw.body).toEqual(unknown.body);
    expect(wrongPw.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it.each([
    ['missing email', { password: 'x' }],
    ['missing password', { email: 'a@example.com' }],
    ['empty password', { email: 'a@example.com', password: '' }],
    ['invalid email', { email: 'nope', password: 'x' }],
    ['empty body', {}],
  ])('rejects %s with 400', async (_name, body) => {
    const res = await request(app).post('/api/auth/login').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('treats SQL-injection-like input as plain data', async () => {
    await registerUser(app, { email: 'bob@example.com' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "bob@example.com' OR '1'='1", password: "' OR '1'='1" });
    expect([400, 401]).toContain(res.status);
  });
});

describe('GET /api/auth/me and requireAuth', () => {
  it('rejects a missing Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it.each([
    ['wrong scheme', 'Basic abc'],
    ['empty bearer', 'Bearer '],
    ['garbage token', 'Bearer not.a.jwt'],
    ['extra parts', 'Bearer a b'],
  ])('rejects %s', async (_name, header) => {
    const res = await request(app).get('/api/auth/me').set('Authorization', header);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a token signed with another secret', async () => {
    const { user } = await registerUser(app);
    const forged = jwt.sign({ jti: 'x' }, 'another-secret-another-secret-0000', { subject: user.id, expiresIn: '1h' });
    const res = await request(app).get('/api/auth/me').set(bearer(forged));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects an unsigned alg:none token', async () => {
    const { user } = await registerUser(app);
    const encode = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ sub: user.id, jti: 'x', exp })}.`;
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(401);
  });

  it('rejects a token whose payload was modified', async () => {
    const victim = await registerUser(app);
    const attacker = await registerUser(app);
    const [h, , s] = attacker.token.split('.');
    const payload = JSON.parse(Buffer.from(attacker.token.split('.')[1], 'base64url').toString());
    const tampered = Buffer.from(JSON.stringify({ ...payload, sub: victim.user.id })).toString('base64url');
    const res = await request(app).get('/api/auth/me').set(bearer(`${h}.${tampered}.${s}`));
    expect(res.status).toBe(401);
  });

  it('returns TOKEN_EXPIRED for an expired token', async () => {
    const { user } = await registerUser(app);
    const expired = jwt.sign({ jti: 'expired-jti' }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: -10,
    });
    const res = await request(app).get('/api/auth/me').set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('rejects a valid token for a deleted user', async () => {
    const { token, user } = await registerUser(app);
    await prisma.user.delete({ where: { id: user.id } });
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(401);
  });

  it('rejects a token without jti', async () => {
    const { user } = await registerUser(app);
    const token = jwt.sign({}, env.JWT_SECRET, { subject: user.id, expiresIn: '1h' });
    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('revokes the token used, but not other sessions of the same user', async () => {
    const { token } = await registerUser(app, { email: 'multi@example.com' });
    const login = await request(app).post('/api/auth/login').send({ email: 'multi@example.com', password: 'Password123!' });
    const otherToken = login.body.token as string;

    const res = await request(app).post('/api/auth/logout').set(bearer(token));
    expect(res.status).toBe(204);
    expect(res.text).toBe('');

    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(bearer(otherToken))).status).toBe(200);
    expect((await request(app).post('/api/auth/logout').set(bearer(token))).status).toBe(401);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  it('cleans up revoked entries that have expired', async () => {
    await prisma.revokedToken.create({ data: { jti: 'old', expiresAt: new Date(Date.now() - 1000) } });
    const { token } = await registerUser(app);
    await request(app).post('/api/auth/logout').set(bearer(token));
    expect(await prisma.revokedToken.findUnique({ where: { jti: 'old' } })).toBeNull();
    expect(await prisma.revokedToken.count()).toBe(1);
  });
});

describe('auth rate limiting', () => {
  it('returns 429 RATE_LIMITED after too many login attempts from one IP', async () => {
    const limited = createApp({ authRateLimit: { windowMs: 60_000, max: 3 } });
    const attempt = () =>
      request(limited).post('/api/auth/login').send({ email: uniqueEmail(), password: 'wrong-password' });
    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401);
    const res = await attempt();
    expect(res.status).toBe(429);
    expect(res.body).toEqual({ error: { code: 'RATE_LIMITED', message: expect.any(String) } });
  });

  it('also limits registration', async () => {
    const limited = createApp({ authRateLimit: { windowMs: 60_000, max: 1 } });
    const body = () => ({ fullName: 'A', email: uniqueEmail(), password: 'Password123!' });
    expect((await request(limited).post('/api/auth/register').send(body())).status).toBe(201);
    expect((await request(limited).post('/api/auth/register').send(body())).status).toBe(429);
  });

  it('does not limit authenticated endpoints like /me', async () => {
    const limited = createApp({ authRateLimit: { windowMs: 60_000, max: 1 } });
    const { token } = await registerUser(limited);
    for (let i = 0; i < 3; i++) {
      expect((await request(limited).get('/api/auth/me').set(bearer(token))).status).toBe(200);
    }
  });
});
