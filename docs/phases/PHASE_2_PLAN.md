# Phase 2 — Authentication + First Deployment

Reference: `docs/MASTER_PLAN.md` Part 19 Phase 2, Part 4 (M3, M8), Part 8 (Auth), Part 9 (security), Part 12.2–12.3. Contract: `docs/API_CONTRACT.md` → Authentication. Decisions D4–D6, D17.

## Objective
Working identity end-to-end — register, login, logout, me — protected by JWT middleware and rate limiting, tested, and live on a public HTTPS URL.

## Track A — Auth module (M3)
Files allowed: `backend/src/modules/auth/**`, `backend/src/lib/jwt.ts`, `backend/src/lib/password.ts`, `backend/src/middleware/{requireAuth,rateLimit}.ts`, `backend/src/routes.ts` (mount line), `backend/src/types/express.d.ts`, `backend/tests/auth.test.ts`, `backend/tests/helpers/auth.ts`, `backend/package.json` (+ `jsonwebtoken`, `express-rate-limit`).
1. `auth.schemas.ts` — register `{fullName 1–100, email (trim, lowercase, ≤255), password 8–72}`; login `{email, password non-empty}`.
2. `password.ts` — bcrypt hash (cost 12; lower in tests) / compare.
3. `jwt.ts` — sign `{ sub: userId, jti: random uuid }` with `JWT_SECRET`, `expiresIn: JWT_EXPIRES_IN`, HS256 pinned on verify; distinguish expired vs invalid.
4. `auth.service.ts` — register (409 `EMAIL_TAKEN`, also on race via P2002), login (generic 401 `INVALID_CREDENTIALS`; still runs a bcrypt compare for unknown emails to avoid timing-based user enumeration), logout (insert `jti` into `revoked_tokens`, opportunistically delete expired rows), me. `toPublicUser()` returns only `{id, fullName, email, createdAt}`.
5. `requireAuth` — parse `Authorization: Bearer`, verify, reject revoked `jti`, ensure user still exists, set `req.user = { id, jti, exp }`. Errors: 401 `UNAUTHORIZED` / `TOKEN_EXPIRED`.
6. `rateLimit` — `express-rate-limit` on `POST /auth/register` and `/auth/login`, window/max from env, 429 `RATE_LIMITED` envelope.
7. Routes: `POST /register` (201), `POST /login` (200), `POST /logout` (204, auth), `GET /me` (200, auth).

## Track B — First deployment (M8)
Files allowed: `render.yaml` (root), `docs/DEPLOYMENT.md`, `backend/package.json` scripts.
- Render Blueprint: web service (`rootDir: backend`, build `npm ci && npm run build && npm run db:deploy`, start `npm start`, health check `/api/health`) + free Postgres; env `NODE_ENV=production`, `JWT_SECRET` generated, `CORS_ORIGIN` placeholder until web is deployed.
- **Needs you:** a Render account connected to this GitHub repo (or Neon for the DB). I prepare config + docs; you click "New Blueprint" and share the URL. Then I smoke-test the live API.

## Tests (must pass)
Register: success 201 + token + no hash in body; DB stores bcrypt hash ≠ plaintext; duplicate email 409 incl. different case; missing/blank fullName, bad email, short (7) / long (73) password → 400 with details; extra fields (`passwordHash`, `id`) ignored.
Login: success; wrong password 401; unknown email 401 with identical message; missing fields 400; email case-insensitive.
Me: valid token 200; no header, wrong scheme, garbage token, wrong-secret signature, `alg:none` token, token for deleted user → 401 `UNAUTHORIZED`; expired token → 401 `TOKEN_EXPIRED`.
Logout: 204; same token then on `/me` → 401; without token → 401; other tokens of the same user still work.
Rate limit: (max+1)th login from same IP → 429 `RATE_LIMITED`.
Leakage: no response in this suite contains `password` / `passwordHash`.
Plus: existing 28 tests still green; lint/typecheck/build clean.

Deployment smoke (after you create the service): `/api/health`, register, login, me, logout against the live URL; CORS header absent for an unknown origin.

## Review checklist
Hash cost & no plaintext anywhere (DB, logs, responses); no user enumeration; algorithm pinned; revoked tokens enforced; rate limiter keyed by real client IP behind proxy (`trust proxy`); secrets only in env.

## Definition of Done
All tests green; auth documented in contract (unchanged) and `docs/DEPLOYMENT.md`; live URL passes smoke test; committed and pushed.

## Unlocks
Phase 3 — Projects API ∥ web shell ∥ mobile shell.
