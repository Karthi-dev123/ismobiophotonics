# Backend — Express + TypeScript + Prisma (PostgreSQL)

One REST API used by both the web app and the mobile app. Contract: [`../docs/API_CONTRACT.md`](../docs/API_CONTRACT.md). Schema: [`../docs/ERD.md`](../docs/ERD.md).

## Prerequisites
- Node.js 22+
- PostgreSQL 14+ (local install, Docker, or a hosted instance such as Neon)

## Database setup (local)
Using Docker:
```bash
docker run -d --name pms-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
docker exec pms-postgres psql -U postgres -c "CREATE DATABASE pms" -c "CREATE DATABASE pms_test"
```
Or with a local PostgreSQL: `createdb pms && createdb pms_test`.

## Install & run
```bash
cd backend
cp .env.example .env        # then edit values (see below)
npm install                 # also generates the Prisma client
npm run db:migrate          # apply migrations to DATABASE_URL
npm run db:seed             # optional: fake demo data
npm run dev                 # http://localhost:4000/api/health
```
Seeded demo accounts: `alice@example.com` / `bob@example.com`, password `Password123!` (fake test data).

## Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start with auto-reload |
| `npm run build` / `npm start` | Compile to `dist/` / run compiled server |
| `npm test` | Run test suite (uses `TEST_DATABASE_URL`, migrates it automatically, wipes it between tests) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Insert demo data (idempotent) |
| `npm run db:reset` | Drop, re-migrate and re-seed the dev database |
| `./scripts/smoke.sh <url>` | End-to-end auth smoke test against a running API |

## Environment variables
| Variable | Required | Example | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `PORT` | no | `4000` | HTTP port |
| `DATABASE_URL` | yes | `postgresql://postgres:postgres@localhost:5432/pms?schema=public` | Main database |
| `TEST_DATABASE_URL` | tests only | `postgresql://postgres:postgres@localhost:5432/pms_test?schema=public` | Separate DB for automated tests — **its data is deleted** |
| `JWT_SECRET` | yes | output of `openssl rand -hex 32` | Token signing secret, min 32 chars |
| `JWT_EXPIRES_IN` | no | `1h` | Token lifetime (e.g. `15m`, `1h`, `7d`) |
| `CORS_ORIGIN` | yes | `http://localhost:5173` | Comma-separated web origins allowed to call the API |
| `AUTH_RATE_LIMIT_WINDOW_MS` | no | `900000` | Auth rate-limit window |
| `AUTH_RATE_LIMIT_MAX` | no | `10` | Max auth attempts per IP per window |
| `TRUST_PROXY_HOPS` | no | `1` | Reverse proxies in front of the API in production (used to find the client IP) |

The server validates these at startup and refuses to start if any are invalid.

## Structure
```
prisma/            schema.prisma, migrations/, seed.ts
src/app.ts         Express app factory (middleware order, routes, error handling)
src/server.ts      HTTP listener + graceful shutdown
src/config/env.ts  validated environment
src/lib/           prisma client, logger (redacts secrets), errors, jwt, password (bcrypt), asyncHandler
src/middleware/    validate (Zod), requireAuth (JWT), rateLimit, notFound, errorHandler
src/routes.ts      mounts /api routers
src/modules/auth/  register, login, logout (token revocation), me
src/modules/       projects, tasks, dashboard — added in later phases
scripts/smoke.sh   smoke test against a running API (local or deployed)
tests/             Vitest + Supertest suites against a real PostgreSQL test DB
```

Request pipeline: `helmet → cors → request logger → JSON parser (100 kb) → /api routes → 404 → error handler`.

## Docker
```bash
docker build -t pms-api backend
docker run -p 8000:8000 --env-file backend/.env -e PORT=8000 pms-api
```
The container applies migrations on start. Deployment guide: [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).
