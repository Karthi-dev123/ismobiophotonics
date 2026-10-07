# Phase 0 — Repository, Conventions, Contract

Reference: `docs/MASTER_PLAN.md` → Part 19 Phase 0, Part 4 (M0), Part 8 (API contract), Part 13 (agent rules), Part 15 (git).

## Objective
A repository where every later phase (and every coding agent) works against a fixed structure, fixed conventions and a frozen API contract — so nothing built later has to be renamed or reshaped.

## Scope (in)
| # | Deliverable | File(s) |
|---|---|---|
| 0.1 | Folder skeleton | `backend/`, `web/`, `mobile/`, `docs/` (each with a placeholder `README.md`) |
| 0.2 | Root ignore/editor config | `.gitignore` (node_modules, dist, build, .env*, !.env.example, .expo, coverage, *.apk), `.editorconfig`, `.nvmrc` (Node 22) |
| 0.3 | Agent rules | `CLAUDE.md` — layering, ownership scoping rule, error envelope, status codes, enum spellings, allowed-files rule, required checks, report format |
| 0.4 | Frozen API contract | `docs/API_CONTRACT.md` — all 15 endpoints, request/response shapes, query params, error codes (from Master Plan Part 8). Becomes the base for final API docs. |
| 0.5 | Env var inventory | `backend/.env.example`, `web/.env.example`, `mobile/.env.example` (placeholders only) |
| 0.6 | README skeleton | Root `README.md` with section headings to be filled in later phases |
| 0.7 | Decision log | `docs/DECISIONS.md` — stack choices + resolved ambiguities (pending-task definition, 404 vs 403, logout strategy, optional fields, PUT = partial update) |

## Scope (out)
No `package.json`, no dependencies, no code. Those start in Phase 1.

## Decisions to freeze now
- Stack: Express+TS, PostgreSQL+Prisma, Zod, JWT+bcrypt, React (Vite)+TS, Expo RN+TS.
- IDs: UUID. Enums: `NOT_STARTED|IN_PROGRESS|COMPLETED`, `PENDING|IN_PROGRESS|COMPLETED`, `LOW|MEDIUM|HIGH`.
- Auth: `Authorization: Bearer <jwt>` for both clients; logout = server `jti` denylist + client token removal.
- Error envelope: `{ "error": { "code", "message", "details?" } }`.
- Required fields — project: `name`; task: `name`, `projectId`. All others optional; `endDate >= startDate`.
- Dashboard `pendingTasks` = status `PENDING`; also return `inProgressTasks`.

## Tests / verification
- `git status` clean after commit; `.env` patterns ignored (verify with `git check-ignore backend/.env`).
- Contract review: every endpoint in guide p5–6 present in `API_CONTRACT.md`; every field from guide p1–2 present.
- `CLAUDE.md` consistent with `API_CONTRACT.md` (same enums, codes, envelope).

## Human tasks (can run in parallel, needed by Phase 2)
- Confirm the stack/decisions above.
- Ensure the GitHub repo is (or will be) **public**.
- Create free accounts: Render (backend + Postgres) or Neon (Postgres), Vercel (web), Expo (EAS APK builds).

## Definition of Done
All 0.1–0.7 committed and pushed; contract and decisions approved by you; nothing outside the listed files changed.

## Unlocks
Phase 1 — Database schema ∥ Backend foundation.
