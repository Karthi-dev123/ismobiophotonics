# Phase 1 — Database Schema ∥ Backend Foundation

Reference: `docs/MASTER_PLAN.md` Part 19 Phase 1, Part 4 (M1, M2), Part 7 (schema), Part 9 (security rows for Phase 2 of the plan: error handling, CORS, logging), Part 12.1. Contract: `docs/API_CONTRACT.md`.

## Objective
A migrated PostgreSQL schema and a running, tested Express shell (no feature endpoints yet besides `/api/health`) that every later endpoint plugs into.

## Track A — Database (M1)
Files: `backend/prisma/schema.prisma`, `backend/prisma/migrations/**`, `backend/prisma/seed.ts`, `docs/ERD.md`.
1. Prisma schema per Master Plan Part 7: `User`, `Project`, `Task`, `RevokedToken`; enums; UUID PKs; FKs with `onDelete: Cascade`; unique `email`; indexes `projects(userId,status)`, `tasks(projectId,status)`, `revoked_tokens(expiresAt)`; `@db.Date` for date fields; snake_case table/column mapping.
2. Raw-SQL addition in the migration: `CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)` on projects (DB-level backstop for D11).
3. Seed script: 2 fake users (`alice@example.com`, `bob@example.com`, bcrypt-hashed password), a few projects and tasks across all statuses/priorities. Idempotent.
4. `docs/ERD.md` with a Mermaid `erDiagram`.

## Track B — Backend foundation (M2)
Files: `backend/package.json`, `tsconfig*.json`, ESLint config, `backend/src/{app.ts,server.ts}`, `src/config/env.ts`, `src/lib/{prisma.ts,logger.ts,errors.ts}`, `src/middleware/{validate.ts,errorHandler.ts,notFound.ts}`, `src/routes.ts`, `backend/tests/**`, `backend/vitest.config.ts`, `backend/README.md`.
1. TypeScript + Express 4, scripts: `dev` (tsx watch), `build` (tsc), `start`, `lint`, `typecheck`, `test`, `db:migrate`, `db:deploy`, `db:seed`, `db:reset`.
2. `env.ts`: Zod-validated env; app refuses to start with missing/weak `JWT_SECRET` (≥32 chars) or bad `DATABASE_URL`.
3. `app.ts` factory (no `listen`) → middleware order: `helmet` → `cors` (origins from `CORS_ORIGIN` list) → `express.json({limit:'100kb'})` → `pino-http` (redacts `authorization`, `password`) → routes → `notFound` → `errorHandler`. `trust proxy` set in production.
4. `errors.ts`: `AppError` + `ValidationError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`.
5. `errorHandler.ts`: maps AppError → envelope; Zod → 400 `VALIDATION_ERROR` with `details`; body-parser JSON error → 400 `INVALID_JSON`; too-large → 413; Prisma `P2002` → 409, `P2025` → 404; everything else → 500 `INTERNAL_ERROR` (logged; no stack in body).
6. `validate({ body?, params?, query? })` middleware using Zod; replaces `req.*` with parsed values.
7. `GET /api/health` → `{status:"ok"}`.
8. Test harness: Vitest + Supertest; tests use `TEST_DATABASE_URL`; helper truncates tables between tests.

Dependencies: express, cors, helmet, pino, pino-http, zod, @prisma/client, bcrypt, dotenv · dev: typescript, tsx, prisma, vitest, supertest, @types/*, eslint + typescript-eslint.

## Local DB for this phase
Postgres 16 in Docker (`pms` + `pms_test` databases). Documented in `backend/README.md`.

## Tests (must pass)
Foundation (Supertest):
- `GET /api/health` → 200 JSON.
- Unknown route → 404 `NOT_FOUND` envelope.
- Malformed JSON body → 400 `INVALID_JSON` (not HTML).
- Oversized body → 413 `PAYLOAD_TOO_LARGE`.
- Thrown unknown error → 500 `INTERNAL_ERROR`, no stack/message leak in production mode.
- `validate()` → 400 with `details[]` paths.
- CORS: allowed origin gets `Access-Control-Allow-Origin`; disallowed origin does not.
- `env.ts` rejects a short `JWT_SECRET`.

Database (via Prisma against test DB, Master Plan 12.1):
- Valid user/project/task insert; defaults (`NOT_STARTED`, `PENDING`, `MEDIUM`, `createdAt`) applied.
- Duplicate email → P2002.
- Task with nonexistent `projectId` → FK violation.
- Project with nonexistent `userId` → FK violation.
- `end_date < start_date` → CHECK violation.
- Deleting a project cascades its tasks; deleting a user cascades projects and tasks.
- Invalid enum value via raw parameterized insert → rejected.
- Unicode names round-trip.

Also: `prisma migrate reset` from empty succeeds; `npm run lint`, `typecheck`, `build` clean; seed runs twice without error.

## Review checklist (Master Plan Part 14)
Schema matches Part 7 & contract; no plaintext password column; error handler never leaks internals; log redaction works; CORS not `*`; no secrets committed.

## Definition of Done
All tests above green; lint/typecheck/build clean; ERD committed; `backend/README.md` explains local DB + commands; committed and pushed.

## Unlocks
Phase 2 — Authentication + first deployment.
