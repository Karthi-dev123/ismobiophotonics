# CLAUDE.md — Rules for coding agents

Project: Project Management System — one Express backend + PostgreSQL shared by a React web app and an Expo React Native (Android) app.

Read before any task:
- `docs/MASTER_PLAN.md` — master blueprint (phases, modules, security, tests)
- `docs/API_CONTRACT.md` — **frozen** API contract; implement it exactly
- `docs/DECISIONS.md` — approved decisions
- `docs/phases/PHASE_<n>_PLAN.md` — the current phase plan

## Scope rules
- Modify **only** the files/folders the task allows. If something outside is needed, stop and report it instead of changing it.
- Do not change `docs/API_CONTRACT.md`, `docs/DECISIONS.md` or `prisma/schema.prisma` unless the task explicitly says so.
- Do not add dependencies beyond those the task lists without stating why in the report.
- Never commit `.env` files or secrets. Never log passwords, tokens or `Authorization` headers.
- Use only fake test data (e.g. `alice@example.com`).

## Repository layout
```
backend/  Express + TS + Prisma      web/  React + Vite + TS      mobile/  Expo RN + TS      docs/
```

## Backend architecture
`routes → middleware (requireAuth, validate) → controller → service → Prisma`
- Controllers: parse `req`, call service, send response. No Prisma here.
- Services: business logic + all DB access.
- Validation: Zod schemas per module (`*.schemas.ts`), applied via `validate()` middleware to body, params and query.
- Errors: throw `AppError` subclasses; the central error handler formats the envelope. No stack traces in responses when `NODE_ENV=production`.
- No raw SQL. If ever unavoidable, only tagged-template `prisma.$queryRaw` — never `$queryRawUnsafe`.

## Authorization rule (non-negotiable)
Every query on user-owned data is scoped to `req.user.id`:
```ts
prisma.project.findFirst({ where: { id, userId } })
prisma.task.findFirst({ where: { id, project: { userId } } })
```
- Never `findUnique({ where: { id } })` on projects/tasks without the owner filter.
- Never accept `userId` from the client.
- Any `projectId` from body or query must be verified to belong to the caller.
- Not found **or not owned** → 404 `NOT_FOUND`.

## Contract essentials (full detail in docs/API_CONTRACT.md)
- Enums: ProjectStatus `NOT_STARTED|IN_PROGRESS|COMPLETED`; TaskStatus `PENDING|IN_PROGRESS|COMPLETED`; TaskPriority `LOW|MEDIUM|HIGH`.
- Error envelope: `{ "error": { "code", "message", "details?" } }`.
- Codes: 400 `VALIDATION_ERROR`/`INVALID_JSON`, 401 `UNAUTHORIZED`/`TOKEN_EXPIRED`/`INVALID_CREDENTIALS`, 404 `NOT_FOUND`, 409 `EMAIL_TAKEN`, 413 `PAYLOAD_TOO_LARGE`, 429 `RATE_LIMITED`, 500 `INTERNAL_ERROR`.
- Success: `{ data }` for resources; `{ user, token }` / `{ user }` for auth; `204` for delete/logout.
- User objects never include the password hash.

## Clients (web & mobile)
- All data comes from the real API — no mock backends.
- Every request screen handles loading, error (with retry) and empty states.
- 401 `TOKEN_EXPIRED`/`UNAUTHORIZED` → clear token, go to login with "Your session has expired. Please log in again."
- No response from server → "Cannot reach the server / No internet connection" message, never a crash or blank screen.
- Mobile token: `expo-secure-store` only. **Never** AsyncStorage for tokens.
- Client-side validation is for UX only; always display server validation `details`.

## Required checks before finishing a task
Run in each package you touched (when the scripts exist): `npm run lint`, `npm run typecheck` (or `build`), `npm test`. Tests must cover negative cases, and for any resource route, a second user who must get 404.

## Final report format
1. Files inspected 2. Files created 3. Files modified 4. Changes made 5. Commands/tests run 6. Test results 7. Assumptions 8. Known issues 9. Needs human verification 10. Recommended next step

## Git
Small logical commits, Conventional Commit messages (`feat(api): ...`, `fix(web): ...`, `docs: ...`). Never force-push or rewrite shared history.
