import request from 'supertest';
import type { Express } from 'express';

let counter = 0;

export function uniqueEmail(prefix = 'user') {
  counter += 1;
  return `${prefix}${counter}@example.com`;
}

/** Registers a fresh user and returns its token and public user. */
export async function registerUser(app: Express, overrides: Partial<{ fullName: string; email: string; password: string }> = {}) {
  const body = {
    fullName: 'Test User',
    email: uniqueEmail(),
    password: 'Password123!',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(body);
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { token: res.body.token as string, user: res.body.user, password: body.password };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
