# Master Development Plan — Project Management System (Web + Mobile)

> Source of truth: *Full Stack Developer Task: Project Management System (Web + Mobile)* (7-page task guide).
> Notation used throughout:
> - **[REQ]** — explicitly stated in the task guide (page reference where useful, e.g. `[REQ p5]`).
> - **[BONUS]** — listed under "Bonus Features (Optional)" in the guide.
> - **[REC]** — my recommendation; not required by the guide. Can be dropped without failing the task.
>
> No durations or deadlines appear anywhere in this plan by design.

---

## Table of Contents

1. [Part 1 — Requirements Analysis](#part-1--requirements-analysis)
2. [Part 2 — System Architecture](#part-2--system-architecture)
3. [Part 3 — Technology Stack](#part-3--technology-stack)
4. [Part 4 — Modules](#part-4--modules)
5. [Part 5 — Dependency Graph](#part-5--dependency-graph)
6. [Part 6 — Vertical-Slice Strategy](#part-6--vertical-slice-strategy)
7. [Part 7 — Database Design](#part-7--database-design)
8. [Part 8 — REST API Plan](#part-8--rest-api-plan)
9. [Part 9 — Security Plan](#part-9--security-plan)
10. [Part 10 — Web Plan](#part-10--web-plan)
11. [Part 11 — Mobile Plan](#part-11--mobile-plan)
12. [Part 12 — Testing Strategy](#part-12--testing-strategy)
13. [Part 13 — Agent Workflow](#part-13--agent-assisted-development-workflow)
14. [Part 14 — Review Agent](#part-14--code-review-agent)
15. [Part 15 — Git Workflow](#part-15--git-workflow)
16. [Part 16 — Definition of Done](#part-16--definition-of-done)
17. [Part 17 — What Not To Do](#part-17--what-not-to-do)
18. [Part 18 — Priority System](#part-18--priority-system)
19. [Part 19 — Final Execution Plan](#part-19--final-master-execution-plan)
20. [Part 20 — Master Checklist](#part-20--final-master-checklist)

---

# Part 1 — Requirements Analysis

### 1.1 Authentication
| ID | Requirement | Type |
|---|---|---|
| A1 | User registration | Mandatory [REQ p1] |
| A2 | User login | Mandatory [REQ p1] |
| A3 | User logout | Mandatory [REQ p1] |
| A4 | User fields: Full Name, Email Address, Password | Mandatory [REQ p1] |
| A5 | Email addresses unique | Mandatory [REQ p1] |
| A6 | Passwords never stored in plain text; hashed with bcrypt or equivalent | Mandatory [REQ p1, p5] |
| A7 | Users stay logged in until logout **or token expiration** (⇒ tokens must expire) | Mandatory [REQ p1] |
| A8 | One account works on web and mobile (register on one, log in on the other) | Mandatory [REQ p1, p3] |
| A9 | JWT authentication | Mandatory [REQ p5] |
| A10 | Refresh tokens | Bonus [BONUS] |

### 1.2 Project Management
| ID | Requirement | Type |
|---|---|---|
| P1 | Create / view details / edit / delete project | Mandatory |
| P2 | View all projects **they own** | Mandatory |
| P3 | Fields: Name, Description, Status (`Not Started`, `In Progress`, `Completed`), Start Date, End Date, Created Date | Mandatory |
| P4 | Pagination, sorting of lists | Bonus |

Note: the guide does **not** say which project fields are required vs optional, nor that end ≥ start. Those are [REC] decisions (see Part 7).

### 1.3 Task Management
| ID | Requirement | Type |
|---|---|---|
| T1 | Each project can contain multiple tasks | Mandatory |
| T2 | Create / edit / delete tasks; mark completed; view tasks under a project | Mandatory |
| T3 | Fields: Name, Description, Priority (`Low`,`Medium`,`High`), Status (`Pending`,`In Progress`,`Completed`), Due Date, Created Date | Mandatory |

### 1.4 Dashboard
| ID | Requirement | Type |
|---|---|---|
| D1 | Total Projects, Total Tasks, Completed Tasks, Pending Tasks, Projects In Progress | Mandatory |
| D2 | Based on the authenticated user's data only | Mandatory |
| D3 | Available on web and mobile | Mandatory (mobile: "View the dashboard") |

Ambiguity: "Pending Tasks" — the guide has a task status literally named `Pending`. [REC] Define `pendingTasks = count(status = 'PENDING')`, and also return `inProgressTasks` so the numbers add up; document the definition in API docs.

### 1.5 Search & Filtering
| ID | Requirement | Type |
|---|---|---|
| S1 | Search projects by name | Mandatory (web; mobile not required to search projects) |
| S2 | Search tasks by name | Mandatory (web + mobile) |
| S3 | Filter projects by status | Mandatory (web) |
| S4 | Filter tasks by status | Mandatory (web + mobile) |
| S5 | Filter tasks by priority | Mandatory (web + mobile) |

### 1.6 Web Application
| ID | Requirement | Type |
|---|---|---|
| W1 | React **or** Next.js | Mandatory choice |
| W2 | Responsive design | Mandatory |
| W3 | Proper component structure | Mandatory |
| W4 | Form validation | Mandatory |
| W5 | Loading indicators | Mandatory |
| W6 | Error handling | Mandatory |
| W7 | Clean UX | Mandatory |
| W8 | All functional features 1–5 available on web | Mandatory (implied: web is the full app) |

### 1.7 Mobile Application
| ID | Requirement | Type |
|---|---|---|
| M1 | React Native (Expo or bare) **or** Flutter | Mandatory choice |
| M2 | Android required; iOS optional | Mandatory / Optional |
| M3 | Same backend & DB — **no separate mobile backend** | Mandatory |
| M4 | Register, login, logout with same account | Mandatory |
| M5 | View dashboard | Mandatory |
| M6 | View all projects and tasks under each project | Mandatory |
| M7 | Create, edit, delete tasks | Mandatory |
| M8 | Mark tasks completed; change status & priority | Mandatory |
| M9 | Search tasks; filter by status and priority | Mandatory |
| M10 | Cross-platform change visible after refresh (pull-to-refresh) | Mandatory |
| M11 | Token in secure storage (Keystore/Keychain), **not** plain local storage | Mandatory |
| M12 | Token expiry → back to login with clear message | Mandatory |
| M13 | No network → clear message, no crash/blank screen | Mandatory |
| M14 | Proper navigation & screen structure; form validation; loading indicators; clean phone UX | Mandatory |
| M15 | Project create/edit/delete on mobile | **Not required** (mobile list says *view* projects only) |
| M16 | Push notifications for tasks due tomorrow | Bonus |
| M17 | Offline viewing of tasks | Bonus |

### 1.8 Backend / REST API
| ID | Requirement | Type |
|---|---|---|
| B1 | Node.js + Express **or** NestJS; one backend for both clients | Mandatory |
| B2 | REST architecture, proper route organization | Mandatory |
| B3 | Middleware usage | Mandatory |
| B4 | Error handling | Mandatory |
| B5 | Logging | Mandatory |
| B6 | Clean code structure | Mandatory |
| B7 | CORS configured for the web app's domain | Mandatory |
| B8 | Minimum endpoints (auth ×4, projects ×5, tasks ×5, dashboard ×1), used by **both** apps | Mandatory |

### 1.9 Database
| ID | Requirement | Type |
|---|---|---|
| DB1 | PostgreSQL **or** MySQL | Mandatory choice |
| DB2 | Proper relational design, FKs, normalized | Mandatory |
| DB3 | SQL injection protection (ORM / parameterized queries) | Mandatory |

### 1.10 Security
| ID | Requirement | Type |
|---|---|---|
| SEC1 | bcrypt (or equivalent) hashing | Mandatory |
| SEC2 | Protected APIs require authentication; JWT; auth middleware; protected routes | Mandatory |
| SEC3 | Authorization: users only view/modify/delete own projects & tasks — web **and** mobile | Mandatory |
| SEC4 | Backend validation of all requests: required fields, email format, date values, empty strings, enum values; appropriate error responses | Mandatory |
| SEC5 | No sensitive info in API responses (e.g. password hash) | Mandatory |
| SEC6 | Rate limiting on auth endpoints (e.g. login by IP) | Mandatory |
| SEC7 | CORS for web domain | Mandatory |
| SEC8 | Secure mobile token storage | Mandatory |
| SEC9 | Role-Based Access Control; Audit logs | Bonus |

### 1.11 Testing
| ID | Requirement | Type |
|---|---|---|
| TS1 | Unit tests | **Bonus** [BONUS] |
| TS2 | Integration tests | **Bonus** [BONUS] |

Important: automated tests are formally a *bonus*. However, "good engineering practices" and "security practices" are evaluation criteria, and tests are the cheapest way to *prove* authorization and validation work. [REC] Treat backend integration tests as P1 (Part 18).

### 1.12 Documentation
| ID | Requirement | Type |
|---|---|---|
| DOC1 | Setup instructions for backend, web, mobile | Mandatory |
| DOC2 | Environment variable documentation | Mandatory |
| DOC3 | Database setup instructions | Mandatory |
| DOC4 | API documentation | Mandatory |
| DOC5 | How to run the mobile app against the deployed backend | Mandatory |
| DOC6 | Easy for another developer to run | Mandatory |
| DOC7 | DB schema or ER diagram | Mandatory (submission) |

### 1.13 Deployment
| ID | Requirement | Type |
|---|---|---|
| DEP1 | Deployed web app URL | Mandatory |
| DEP2 | Deployed backend URL | Mandatory |
| DEP3 | Android APK or Expo / Firebase App Distribution link | Mandatory |
| DEP4 | Docker support; CI/CD pipeline | Bonus |

### 1.14 Submission
1. Public GitHub repo viewable without login (mono or multi-repo) — Mandatory
2. DB schema or ER diagram — Mandatory
3. API documentation — Mandatory
4. README — Mandatory
5. Deployment URLs (web + backend) — Mandatory
6. Android APK / Expo / Firebase link — Mandatory
7. 5-minute screen recording: same account on web + mobile, create a task on one, show it on the other — Mandatory
8. Test data only; no real personal data — Mandatory
9. Be able to explain implementation & design decisions in review — Mandatory (implied: you must understand agent-written code)

### 1.15 Bonus (complete list from guide)
Docker · Unit tests · Integration tests · Pagination · Sorting · Audit logs · RBAC · CI/CD · Refresh tokens · Push notifications (tasks due tomorrow) · Offline task viewing on mobile · Shared types/validation across web, mobile, backend.

### 1.16 Complete Requirements Checklist (compact)
```
AUTH      [ ] register [ ] login [ ] logout [ ] /me [ ] unique email [ ] bcrypt
          [ ] JWT with expiry [ ] same account web+mobile [ ] rate limit auth
PROJECTS  [ ] CRUD [ ] list own only [ ] fields name/desc/status/start/end/created
          [ ] status enum Not Started/In Progress/Completed
TASKS     [ ] CRUD [ ] mark complete [ ] list under project [ ] fields name/desc/priority/status/due/created
          [ ] priority enum Low/Medium/High [ ] status enum Pending/In Progress/Completed
DASHBOARD [ ] total projects [ ] total tasks [ ] completed tasks [ ] pending tasks [ ] projects in progress [ ] per-user
SEARCH    [ ] projects by name [ ] tasks by name [ ] projects by status [ ] tasks by status [ ] tasks by priority
WEB       [ ] React/Next [ ] responsive [ ] components [ ] form validation [ ] loading [ ] errors [ ] clean UX
MOBILE    [ ] RN/Flutter [ ] Android build [ ] auth [ ] dashboard [ ] projects+tasks view [ ] task CRUD
          [ ] status/priority change [ ] task search/filter [ ] pull-to-refresh [ ] secure storage
          [ ] expired token → login w/ message [ ] no-network message [ ] form validation [ ] loading
BACKEND   [ ] Express/Nest [ ] REST routes [ ] middleware [ ] error handling [ ] logging [ ] CORS web domain
DB        [ ] Postgres/MySQL [ ] FKs [ ] normalized [ ] no SQL injection
SECURITY  [ ] authz on every project/task route [ ] backend validation [ ] no sensitive data in responses
DOCS      [ ] setup backend/web/mobile [ ] env vars [ ] DB setup [ ] API docs [ ] mobile→deployed backend [ ] ERD
DEPLOY    [ ] web URL [ ] backend URL [ ] APK/Expo link
SUBMIT    [ ] public repo [ ] README [ ] 5-min video [ ] test data only
```

---

# Part 2 — System Architecture

```
 ┌──────────────┐        HTTPS + JSON        ┌───────────────────────────────┐      SQL (ORM,      ┌──────────────┐
 │  Web (React) │ ── Authorization: Bearer ─▶│  Express REST API  (/api/*)    │ ── parameterized) ─▶│  PostgreSQL  │
 └──────────────┘                             │  routes → middleware →        │                     │  users       │
 ┌──────────────┐        HTTPS + JSON        │  validation → service → ORM   │◀────────────────────│  projects    │
 │ Mobile (Expo)│ ── Authorization: Bearer ─▶│  (single deployment)          │                     │  tasks       │
 └──────────────┘                             └───────────────────────────────┘                     └──────────────┘
```

**Required [REQ]:** one backend, one database, both clients use the same `/api/...` endpoints; JWT auth; CORS for the web domain; relational DB with FKs.

**Recommended [REC]:** stateless Bearer-token auth for *both* clients (not cookies) so the backend has exactly one auth path; layered backend (routes → controllers → services → Prisma).

### Responsibilities
| Layer | Owns | Does NOT own |
|---|---|---|
| **Web** | Rendering, routing, UX form validation (convenience only), holding the token in memory/storage, attaching `Authorization` header, handling 401 → login, loading/error/empty states | Authorization decisions, business rules, any security guarantee |
| **Mobile** | Same as web + secure token storage (SecureStore → Android Keystore), pull-to-refresh, network-state detection, expired-session redirect | Same as web |
| **Backend** | **Authentication** (verify JWT in middleware), **authorization** (ownership scoping in every query), **validation** (Zod schemas on body/params/query), business logic (dashboard aggregation, filters), error shaping, logging, rate limiting, CORS | Presentation |
| **Database** | Data integrity: PK, FK, NOT NULL, UNIQUE(email), enums, cascade deletes, indexes | Authorization (no row-level security needed), input format validation |

- **Authentication happens** in backend `requireAuth` middleware (verifies signature + expiry, loads `req.user.id`).
- **Authorization happens** in the backend service layer: *every* project/task query includes `userId = req.user.id` (directly or via the project relation). Never trust IDs from the client alone.
- **Validation happens** authoritatively on the backend (Zod) and is mirrored on clients for UX only.
- **Business logic** lives in backend services only. Clients are thin.

### Data flow (example: mobile marks task complete)
1. Mobile `PUT /api/tasks/42 {status:"COMPLETED"}` with Bearer token.
2. `rateLimit` (auth routes only) → `cors` → `json` → `requireAuth` → `validate(params, body)` → controller → `taskService.update(userId, 42, data)`.
3. Service runs `UPDATE tasks ... WHERE id=42 AND project.user_id=userId` (via Prisma `updateMany`/`findFirst`). No row → 404.
4. Response returns task JSON. DB now holds the change.
5. Web user refreshes / re-navigates → `GET /api/tasks?projectId=...` → sees the update.

### Synchronization
[REQ] only requires "appears on the other after a refresh". Therefore: **the database is the single source of truth; clients never cache authoritatively.** [REC] Web re-fetches on page mount and after every mutation (TanStack Query invalidation + `refetchOnWindowFocus`); mobile re-fetches on screen focus and on pull-to-refresh. No websockets/polling needed.

---

# Part 3 — Technology Stack

| Concern | Allowed options [REQ] | Recommendation | Why |
|---|---|---|---|
| Web | React or Next.js | **React + Vite + TypeScript** | Pure SPA consuming an external API; Next.js adds SSR/server routes you don't need and a second "backend-like" layer that blurs the single-backend story. Vite is fast, trivially deployed as static files. Tradeoff: no SSR (irrelevant here). |
| Web routing / data | — | **React Router**, **TanStack Query**, **axios** | Query gives loading/error states and refetch-after-mutation for free → satisfies loading indicators + sync with little code. |
| Web forms / UI | — | **react-hook-form + zod**, **Tailwind CSS** | Form validation with the same schema style as backend. Tailwind gives responsive design without a component-library learning curve. |
| Mobile | React Native (Expo/bare) or Flutter | **React Native with Expo (TypeScript)** | Same language as web/backend (one mental model, agents reuse patterns), `expo-secure-store` uses Android Keystore (satisfies M11 exactly), EAS Build produces an APK (satisfies DEP3), `@react-native-community/netinfo` for no-network. Tradeoff: EAS build requires an Expo account. |
| Mobile nav | — | **React Navigation** (native stack + bottom tabs) | Standard, well documented. (expo-router also fine; pick one.) |
| Backend | Express or NestJS | **Express + TypeScript** | Guide explicitly asks for "middleware usage" and "route organization" — Express makes both visible and explainable in review. NestJS adds DI/decorators overhead. Tradeoff: you must impose structure yourself (folder convention below). |
| Database | PostgreSQL or MySQL | **PostgreSQL** | Native enums, excellent free hosting (Neon, Render, Supabase), case-insensitive search via `ILIKE`/Prisma `mode:'insensitive'`. |
| ORM | — | **Prisma** | Parameterized queries by default (SQL-injection requirement), migrations, schema file doubles as ERD source, typed client. Tradeoff: `aggregate/groupBy` sometimes clunky — fine for 5 counts. |
| Auth | JWT required | **jsonwebtoken + bcrypt (or bcryptjs)** | Direct match to guide. Access token TTL e.g. `1h`, configurable via env. |
| Validation | — | **Zod** | One schema → type + runtime check; reusable on clients. |
| Security middleware | — | **cors, express-rate-limit, helmet** [REC helmet] | Directly meets CORS + rate-limit; helmet is a cheap extra. |
| Logging | Logging required | **pino + pino-http** (or morgan) | Structured request logs; redact `authorization` header and `password`. |
| Testing | Bonus | **Vitest/Jest + Supertest** (backend, against a real test Postgres) | Proves authz/validation. Web/mobile automated UI tests: optional; manual checklist instead. |
| API docs | Required | **OpenAPI 3 YAML + Swagger UI at `/api/docs`** (or a well-structured `docs/API.md`) | Swagger UI is reviewer-friendly. Minimum: Markdown. |
| Deployment | URLs required | **Backend + Postgres: Render (or Railway); DB alt: Neon. Web: Vercel/Netlify. Mobile: EAS Build APK.** | Free tiers; zero-ops. Tradeoff: Render free tier sleeps → warm it before the demo. |
| Repo | mono or multi | **Single monorepo** `/backend /web /mobile /docs` (no workspace tooling initially) | One public link; plain folders avoid Expo/Metro monorepo friction. |
| Shared types | Bonus | Defer (P2) | Monorepo package sharing with Metro is a known time-sink; copy small Zod schemas first. |

---

# Part 4 — Modules

Repository layout target:
```
/backend
  prisma/schema.prisma, prisma/migrations/, prisma/seed.ts
  src/app.ts            (express app factory — no listen; testable)
  src/server.ts         (listen)
  src/config/env.ts     (zod-validated env)
  src/lib/prisma.ts, src/lib/logger.ts, src/lib/jwt.ts, src/lib/errors.ts
  src/middleware/       requireAuth.ts, validate.ts, errorHandler.ts, rateLimit.ts, notFound.ts
  src/modules/auth/     auth.routes.ts, auth.controller.ts, auth.service.ts, auth.schemas.ts
  src/modules/projects/ projects.routes.ts, .controller.ts, .service.ts, .schemas.ts
  src/modules/tasks/    tasks.routes.ts, .controller.ts, .service.ts, .schemas.ts
  src/modules/dashboard/dashboard.routes.ts, .service.ts
  src/routes.ts         (mounts /api/*)
  tests/                helpers/, auth.test.ts, projects.test.ts, tasks.test.ts, dashboard.test.ts, security.test.ts
/web     src/api/, src/auth/, src/pages/, src/components/, src/hooks/, src/lib/
/mobile  src/api/, src/auth/, src/screens/, src/components/, src/navigation/, src/hooks/
/docs    MASTER_PLAN.md, API.md / openapi.yaml, ERD.md, DEPLOYMENT.md, MANUAL_TEST_CHECKLIST.md
CLAUDE.md, README.md
```

Below, each module is scoped so an agent touches only its folder.

### M0 — Repository & Conventions
- **Purpose:** skeleton, conventions, agent rules. **Requirements:** enables all; DOC6.
- **Responsibilities:** folder layout, `.gitignore`, `.editorconfig`, root `README.md` stub, `CLAUDE.md` (agent rules: layering, never touch other modules, run tests), `.env.example` per app.
- **Files:** root files, `/docs`. **Inputs:** this plan. **Outputs:** structure every later task assumes.
- **Dependencies:** none. **Independent:** yes. **Before start:** nothing. **Parallel:** nothing (it's the base).
- **Tests:** none. **Security:** `.env` gitignored; no secrets committed.
- **DoD:** repo pushed, `CLAUDE.md` contains conventions + API contract summary (Part 8) + error format.

### M1 — Database Schema & Migrations
- **Purpose:** authoritative data model. **Requirements:** A4, A5, P3, T1, T3, DB1, DB2.
- **Responsibilities:** `schema.prisma`, initial migration, seed script with fake data, ERD.
- **Files:** `backend/prisma/**`, `docs/ERD.md`. **Inputs:** Part 7. **Outputs:** migrated DB, Prisma client.
- **Dependencies:** M0, a reachable Postgres (local Docker or Neon dev DB). **Independent:** yes.
- **Parallel:** M2 can start simultaneously (it only needs the Prisma client at the end).
- **Tests:** DB constraint tests (Part 12.1) run in M3+ test harness; manual: `prisma migrate reset` works from scratch.
- **Security:** no plaintext password column — name it `password_hash`.
- **DoD:** migrate from empty DB succeeds; seed creates 2 users with projects/tasks; ERD committed; constraints verified (unique email, FKs, cascade).

### M2 — Backend Foundation
- **Purpose:** app shell every endpoint plugs into. **Requirements:** B1–B7, SEC7, part of SEC6.
- **Responsibilities:** `app.ts` factory, env validation, logger (with redaction), CORS from `CORS_ORIGIN` env (comma list), `helmet`, JSON body limit, `/api/health`, `AppError` class, central error handler (Zod → 400, Prisma P2002 → 409, P2025 → 404, unknown → 500 without stack in prod), 404 handler, `validate()` middleware, test harness (Supertest + test DB reset).
- **Files:** `backend/src/{app,server,config,lib,middleware}/**`, `backend/tests/helpers/**`, `backend/package.json`, `tsconfig`.
- **Dependencies:** M0. **Independent:** yes. **Parallel:** M1.
- **Tests:** health 200; unknown route 404 JSON; malformed JSON → 400 JSON (not HTML stack); CORS header present for allowed origin, absent for others.
- **Security:** no stack traces in prod responses; log redaction of `authorization`, `password`.
- **DoD:** `npm run dev`, `npm test`, `npm run build` all pass; uniform error envelope `{ error: { code, message, details? } }`.

### M3 — Authentication
- **Purpose:** identity. **Requirements:** A1–A9, SEC1, SEC2, SEC5, SEC6.
- **Responsibilities:** register/login/logout/me; bcrypt (cost ≥ 10); JWT sign/verify (`sub`, `jti`, `exp`); `requireAuth` middleware; rate limiter on `/api/auth/login` + `/register`; `toPublicUser()` serializer; logout strategy (Part 8).
- **Files:** `backend/src/modules/auth/**`, `backend/src/lib/jwt.ts`, `backend/src/middleware/{requireAuth,rateLimit}.ts`, `backend/tests/auth.test.ts`.
- **Dependencies:** M1, M2. **Parallel:** web/mobile auth screens can be built against the contract once M3 contract is frozen.
- **Tests:** Part 12.2 auth list. **Security:** generic "Invalid email or password" (no user enumeration on login); email lowercased+trimmed; never return `passwordHash`.
- **DoD:** all auth tests green; token expiry configurable; rate limit returns 429 with JSON body.

### M4 — Projects API
- **Purpose:** project CRUD + search/filter. **Requirements:** P1–P3, S1, S3, SEC3, SEC4.
- **Files:** `backend/src/modules/projects/**`, `backend/tests/projects.test.ts`.
- **Dependencies:** M3 (`requireAuth`). **Parallel:** M5 once ownership helper is agreed; M6.
- **Tests:** CRUD happy path, validation failures, cross-user 404 on GET/PUT/DELETE, list only own, search case-insensitive, filter by status, cascade delete removes tasks.
- **Security:** every query scoped by `userId`; `userId` never accepted from body.
- **DoD:** endpoints match Part 8; tests green; reviewer approved.

### M5 — Tasks API
- **Purpose:** task CRUD + search/filter. **Requirements:** T1–T3, S2, S4, S5, M7, M8, SEC3, SEC4.
- **Files:** `backend/src/modules/tasks/**`, `backend/tests/tasks.test.ts`.
- **Dependencies:** M4 (needs projects to exist; ownership via project). **Parallel:** M6.
- **Tests:** create under own project; create under **another user's** project → 404; move task to another user's project via PUT → 404; filters combine; invalid enum → 400.
- **DoD:** as M4.

### M6 — Dashboard API
- **Purpose:** per-user stats. **Requirements:** D1, D2.
- **Files:** `backend/src/modules/dashboard/**`, `backend/tests/dashboard.test.ts`.
- **Dependencies:** M1, M3 (can be written in parallel with M4/M5; tests need data via Prisma directly).
- **Tests:** zero state; counts per status; user B's data never counted for user A.
- **DoD:** response shape frozen and documented.

### M7 — API Documentation
- **Purpose:** DOC4, submission item 3. **Files:** `docs/openapi.yaml` (+ Swagger UI mount in `app.ts`) or `docs/API.md`.
- **Dependencies:** M3–M6 contracts. Can be drafted from Part 8 *before* implementation and updated after.
- **DoD:** every endpoint: method, path, auth, body, query, responses, error codes, examples.

### M8 — Deployment (backend + DB) — *early*
- **Purpose:** DEP2; also gives mobile a real HTTPS URL early. **Requirements:** DEP2, B7.
- **Responsibilities:** hosted Postgres, Render service, `prisma migrate deploy` on build, env vars, `trust proxy` for rate limiter behind proxy.
- **Dependencies:** M3 minimum (deploy as soon as auth works; redeploy continuously).
- **DoD:** `https://<backend>/api/health` 200; register/login work against prod DB; `docs/DEPLOYMENT.md` started.

### M9 — Web App
Sub-modules (each an agent task): W-a shell (Vite, Router, Query, axios client w/ interceptors, AuthContext), W-b auth pages, W-c projects list/detail/forms, W-d tasks in project, W-e dashboard, W-f search/filter, W-g responsive + polish, W-h deploy (Vercel) + CORS update.
- **Requirements:** W1–W8, S1–S5, D1. **Dependencies:** API contract (Part 8) frozen; real endpoints for integration.
- **Security:** never store password; on 401 clear token and redirect; don't render HTML from API (React escapes by default).
- **DoD:** see Part 16.

### M10 — Mobile App
Sub-modules: MB-a shell (Expo, navigation, API client, SecureStore token, NetInfo), MB-b auth, MB-c dashboard, MB-d projects list → project tasks, MB-e task create/edit/delete/status/priority, MB-f task search/filter, MB-g session-expiry + offline handling, MB-h EAS APK build.
- **Requirements:** M1–M14. **Dependencies:** deployed backend (M8) preferable — Android device/emulator can't reach `localhost` (use `10.0.2.2` for emulator or LAN IP otherwise).
- **DoD:** see Part 16.

### M11 — Hardening & Test Completion
Security test suite (Part 12.3), manual cross-platform checklist, log review, dependency audit (`npm audit`).

### M12 — Documentation & Submission
README, env docs, DB setup, mobile→deployed backend instructions, ERD, API docs, recording.

---

# Part 5 — Dependency Graph

```
M0 Repo
 ├──▶ M1 DB schema ──┐
 └──▶ M2 Backend foundation ──┤
                              ▼
                        M3 Auth ──▶ M8 Deploy backend (first deploy, then continuous)
                              │
              ┌───────────────┼──────────────────┐
              ▼               ▼                  ▼
          M4 Projects     M6 Dashboard      [contract frozen] ──▶ W-a / MB-a shells + auth screens
              │
              ▼
          M5 Tasks
              │
              ▼
   M7 API docs (finalize)   M9 Web features (W-b..W-f)   M10 Mobile features (MB-b..MB-g)
              │                     │                          │
              └──────────┬──────────┴──────────────────────────┘
                         ▼
             M11 Hardening + cross-platform tests ──▶ W-h deploy web, MB-h APK ──▶ M12 Docs/Recording
```

**Recommended order:** M0 → (M1 ∥ M2) → M3 → M8(first deploy) → M4 → M5 → M6 → M9 → M10 → M11 → M12.

**Parallelizable:**
- M1 ∥ M2.
- After M3: web shell+auth (W-a, W-b) ∥ M4.
- M6 ∥ M4/M5 (different files).
- Web features ∥ Mobile features once M5 is merged (both consume a stable API).
- API docs drafting at any time from Part 8.

**Critical path:** M0 → M1 → M3 → M4 → M5 → M10 (mobile task CRUD) → MB-h APK → recording. The mobile build/APK is the riskiest deliverable (build tooling, device networking, Keystore) — so it should start as soon as the API exists, and an *early throwaway APK build* of the shell is recommended to de-risk EAS.

**Rework sources & mitigations:**
| Source | Mitigation |
|---|---|
| Changing enum spellings/field names after clients built | Freeze contract (Part 8) before any client work; enums stored as `NOT_STARTED` etc., UI maps labels |
| Changing error format | Fix error envelope in M2 |
| Adding authorization late | Scope by userId from the first project query (M4) |
| Mobile can't reach backend | Deploy backend right after M3 |
| CORS failures at web deploy | `CORS_ORIGIN` env list from M2; add Vercel URL when known |
| Changing auth mechanism (cookies vs bearer) | Decide Bearer for both now |

**Why this order:** everything stores data → DB first; nothing is authorization-safe without auth → auth before resources; tasks reference projects → projects before tasks; clients are thin over a stable contract → clients after the API they consume; mobile depends on a reachable HTTPS host → early deploy.

---

# Part 6 — Vertical-Slice Strategy

**Slice 1 ("walking skeleton"):** DB(users) → register/login/me → deployed → web login page → web shows "Hello, {fullName}" → mobile login screen → mobile shows same name.
This proves: one DB, one backend, both clients, JWT, CORS, deployment, secure storage. It exercises every integration risk with minimal code.

**Slice 2:** projects CRUD backend (with authz + tests) → web projects list/create.
**Slice 3:** tasks CRUD backend → web project detail with tasks → mobile project→tasks + task CRUD. **Now the demo scenario (create on one, see on other) works.**
**Slice 4:** dashboard + search/filter backend → web + mobile UIs.
**Slice 5:** hardening, polish, docs, APK, recording.
**Slice 6:** bonuses.

No mock backends: clients are built only against real endpoints that already exist (the backend is always ahead of the clients). The only "mock" allowed is a hard-coded screen layout while its endpoint is in review, and it is replaced by the real query in the same task.

---

# Part 7 — Database Design

### Tables

**users**
| Column | Type | Constraints |
|---|---|---|
| id | `uuid` (or `serial`) | PK, default `gen_random_uuid()` |
| full_name | `varchar(100)` | NOT NULL |
| email | `varchar(255)` | NOT NULL, **UNIQUE** (store lowercased) |
| password_hash | `varchar(255)` | NOT NULL |
| created_at | `timestamptz` | NOT NULL default now() |
| updated_at | `timestamptz` | NOT NULL |

**projects**
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | NOT NULL, **FK → users.id ON DELETE CASCADE** |
| name | varchar(150) | NOT NULL |
| description | text | NULL [REC optional] |
| status | enum `project_status` (`NOT_STARTED`,`IN_PROGRESS`,`COMPLETED`) | NOT NULL default `NOT_STARTED` |
| start_date | date | NULL [REC optional] |
| end_date | date | NULL; [REC] CHECK `end_date >= start_date` when both set (enforce in Zod; DB CHECK via raw migration optional) |
| created_at | timestamptz | NOT NULL default now() — this is "Created Date" |
| updated_at | timestamptz | NOT NULL |

**tasks**
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | NOT NULL, **FK → projects.id ON DELETE CASCADE** |
| name | varchar(150) | NOT NULL |
| description | text | NULL |
| priority | enum `task_priority` (`LOW`,`MEDIUM`,`HIGH`) | NOT NULL default `MEDIUM` |
| status | enum `task_status` (`PENDING`,`IN_PROGRESS`,`COMPLETED`) | NOT NULL default `PENDING` |
| due_date | date | NULL |
| created_at, updated_at | timestamptz | NOT NULL |

**revoked_tokens** [REC, for server-side logout]
| jti (PK, varchar) | expires_at (timestamptz, indexed) |

### Relationships & normalization
- users 1—N projects 1—N tasks. Tasks do **not** carry `user_id` (3NF: owner derivable through project). Ownership checks join through project.
- "Created Date" = `created_at`, server-set, never client-supplied.
- Delete behavior: deleting a project deletes its tasks (CASCADE) — [REC] the UI confirms "This deletes N tasks". Deleting a user cascades (no user-delete endpoint is required).

### Indexes
- `users(email)` unique (implicit).
- `projects(user_id)`, `projects(user_id, status)`.
- `tasks(project_id)`, `tasks(project_id, status)`.
- Name search uses `ILIKE '%term%'` via Prisma `contains, mode:'insensitive'` — dataset is small; trigram index unnecessary.

### Prisma sketch
```prisma
enum ProjectStatus { NOT_STARTED IN_PROGRESS COMPLETED }
enum TaskStatus    { PENDING IN_PROGRESS COMPLETED }
enum TaskPriority  { LOW MEDIUM HIGH }

model User {
  id           String    @id @default(uuid()) @db.Uuid
  fullName     String    @map("full_name") @db.VarChar(100)
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  projects     Project[]
  @@map("users")
}
model Project {
  id          String        @id @default(uuid()) @db.Uuid
  userId      String        @map("user_id") @db.Uuid
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String        @db.VarChar(150)
  description String?
  status      ProjectStatus @default(NOT_STARTED)
  startDate   DateTime?     @map("start_date") @db.Date
  endDate     DateTime?     @map("end_date") @db.Date
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  tasks       Task[]
  @@index([userId, status])
  @@map("projects")
}
model Task {
  id          String       @id @default(uuid()) @db.Uuid
  projectId   String       @map("project_id") @db.Uuid
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name        String       @db.VarChar(150)
  description String?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(PENDING)
  dueDate     DateTime?    @map("due_date") @db.Date
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  @@index([projectId, status])
  @@map("tasks")
}
```
UUIDs [REC] make ID-guessing harder (defense in depth; **not** a substitute for authz).

### Responsibility split
| Concern | Database | Backend validation (Zod) | Authentication | Authorization |
|---|---|---|---|---|
| Email unique | UNIQUE (race-safe) | format, trim, lowercase; map P2002→409 | — | — |
| Required fields | NOT NULL | non-empty after trim, max length | — | — |
| Enums | DB enum type | `z.enum` → 400 with allowed values | — | — |
| Dates | `date` type | valid ISO date, end ≥ start | — | — |
| Ownership | FK integrity only | — | identifies `userId` | `WHERE user_id = :me` / `project.userId = :me` |
| Password | stores hash only | min length (e.g. 8), max 72 bytes (bcrypt limit) | bcrypt compare | — |

**Preventing cross-user access:** services never call `findUnique({id})` for user-owned data. Pattern:
```ts
const project = await prisma.project.findFirst({ where: { id, userId } });
if (!project) throw new NotFoundError('Project not found');   // 404, not 403: don't reveal existence
```
For tasks: `prisma.task.findFirst({ where: { id, project: { userId } } })`. On task create/update with a `projectId`, verify that project belongs to `userId` first.

### DB edge cases to test
Duplicate email (incl. different case `A@x.com` vs `a@x.com`); FK to non-existent project; invalid enum at DB level; null in NOT NULL; very long names (>150); end < start; project delete cascades tasks; user B cannot see user A's rows; empty strings / whitespace-only names; invalid UUID format in path → 400/404 not 500; dates like `2024-02-30`; bulk seed (hundreds of tasks) dashboard counts correct.

---

# Part 8 — REST API Plan

**Conventions [REC]:**
- JSON in/out; camelCase fields; enums as `NOT_STARTED` etc. (UI maps to labels).
- Auth header: `Authorization: Bearer <jwt>`.
- Errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{ "path": "email", "message": "Invalid email" }] } }`.
- Status codes: 200 OK, 201 Created, 204 No Content, 400 validation/malformed, 401 missing/invalid/expired token (`code: TOKEN_EXPIRED` vs `UNAUTHORIZED` so clients can show the right message), 404 not found / not owned, 409 duplicate email, 429 rate limited, 500 generic.
- PUT accepts partial body [REC] (simplifies "mark complete": `PUT /api/tasks/:id {status:"COMPLETED"}`); document this. No extra PATCH endpoint needed.
- Path `:id` validated as UUID → 400 if malformed.

### Authentication
| Method/Route | Auth | Body | Response | Errors | Validation | DB | Tests |
|---|---|---|---|---|---|---|---|
| `POST /api/auth/register` | public, rate-limited | `{fullName, email, password}` | 201 `{user, token}` [REC auto-login] | 400, 409, 429 | fullName 1–100 trimmed non-empty; email valid, lowercased; password 8–72 | insert user w/ bcrypt hash | success; dup email (case-insens.) 409; each missing field; bad email; short pwd; extra field `passwordHash` ignored; response lacks hash |
| `POST /api/auth/login` | public, rate-limited | `{email, password}` | 200 `{user, token}` | 400, 401 (generic msg), 429 | email format, password non-empty | select by email, bcrypt.compare | success; wrong pwd; unknown email (same message); N+1th attempt 429 |
| `POST /api/auth/logout` | required | — | 204 | 401 | — | insert `jti` into revoked_tokens [REC] | after logout, same token on `/me` → 401 |
| `GET /api/auth/me` | required | — | 200 `{user}` | 401 | — | select user | valid; no token; malformed; expired; wrong signature; deleted user |

`user` = `{id, fullName, email, createdAt}` — never `passwordHash`.

Logout note: JWT is stateless; the guide only requires logout to exist. Minimum: client deletes token, server returns 204. [REC] Add the `jti` denylist (one small table + one check in `requireAuth`) so logout is real server-side — easy to explain in review.

### Projects (all require auth; all scoped to `req.user.id`)
| Method/Route | Query/Body | Response | Errors | Notes |
|---|---|---|---|---|
| `GET /api/projects` | `?search=&status=` [BONUS later: `page,limit,sortBy,order`] | 200 `{data: Project[]}` (each with `taskCount` [REC]) | 400 bad status | `name contains search (insensitive)`, `status` enum |
| `GET /api/projects/:id` | — | 200 `{data: Project}` | 400 bad id, 404 | |
| `POST /api/projects` | `{name, description?, status?, startDate?, endDate?}` | 201 `{data}` | 400 | `userId` from token only; `createdAt` server-set |
| `PUT /api/projects/:id` | same fields, all optional, at least one | 200 `{data}` | 400, 404 | cross-field date check considers existing values |
| `DELETE /api/projects/:id` | — | 204 | 404 | cascades tasks |

Tests per route: happy path; missing auth 401; another user's id 404; random uuid 404; malformed id 400; invalid enum/date/empty-name 400; unknown fields stripped; `userId` in body ignored.

### Tasks (all require auth; ownership via project)
| Method/Route | Query/Body | Response | Errors | Notes |
|---|---|---|---|---|
| `GET /api/tasks` | `?projectId=&search=&status=&priority=` | 200 `{data: Task[]}` | 400, 404 if `projectId` not owned | without projectId: all user's tasks (needed for mobile/web global task search) |
| `GET /api/tasks/:id` | — | 200 `{data: Task}` (incl. `project: {id,name}`) | 400, 404 | |
| `POST /api/tasks` | `{projectId, name, description?, priority?, status?, dueDate?}` | 201 | 400, 404 (project not owned) | |
| `PUT /api/tasks/:id` | any subset incl. `projectId` | 200 | 400, 404 | if `projectId` changes, new project must be owned |
| `DELETE /api/tasks/:id` | — | 204 | 404 | |

"View tasks under a project" = `GET /api/tasks?projectId=...` — reuses the required endpoint; **no** extra nested route needed.

### Dashboard
`GET /api/dashboard` (auth) → 200
```json
{ "data": { "totalProjects": 4, "projectsInProgress": 2, "totalTasks": 17,
            "completedTasks": 6, "pendingTasks": 7, "inProgressTasks": 4 } }
```
Implementation: `project.count({where:{userId}})`, `project.count({where:{userId,status:'IN_PROGRESS'}})`, `task.groupBy({by:['status'], where:{project:{userId}}, _count:true})`, in one `Promise.all` / `$transaction`. Tests: zero state, mixed statuses, isolation from other user.

### Search & filtering design
Query params on the existing list endpoints; Zod schema for query (`search: z.string().trim().max(100).optional()`, `status: z.enum([...]).optional()`), build a Prisma `where` object — never string-concatenate SQL. Combined filters are AND. Empty `search` = no filter.

---

# Part 9 — Security Plan

| Mechanism | Protects | Where | When (phase) | How tested |
|---|---|---|---|---|
| Password hashing (bcrypt, cost 10–12) | stored credentials if DB leaks | `auth.service` | Phase 3 | test DB row ≠ plaintext and starts `$2`; login works |
| JWT (HS256, secret ≥ 32 random bytes from env, `expiresIn` env e.g. `1h`) | identity | `lib/jwt.ts` | Phase 3 | tampered signature, `alg:none`, expired token (sign with `-1s`) → 401 |
| `requireAuth` middleware | all non-auth routes | mounted on `/api/projects`, `/api/tasks`, `/api/dashboard`, `/api/auth/me|logout` | Phase 3 | route table test: every protected route without token → 401 |
| Authorization / ownership | other users' data | every service query (Part 7 pattern) | Phase 4–5 (from first line) | two-user tests on every route (GET/PUT/DELETE/POST-into-other-project/list) |
| Input validation (Zod, `.strict()` or strip) | bad data, mass assignment | `validate()` middleware per route | Phase 2 (middleware), per route in 3–6 | negative tests per field |
| SQL injection | DB | Prisma only; no `$queryRawUnsafe`; any raw query uses tagged `$queryRaw` | always; reviewer greps | search `' OR 1=1 --`, `%`, `_` returns no leak/500 |
| Rate limiting | brute force on login/register | `express-rate-limit` on auth routes; `app.set('trust proxy', 1)` in prod | Phase 3 | loop N+1 logins → 429 |
| CORS | browser cross-origin use of API | `cors({origin: env.CORS_ORIGIN list})` | Phase 2; update at web deploy | request with disallowed Origin gets no ACAO header |
| Token expiration | stolen token lifetime | JWT `exp`; client handling | Phase 3 (server), Phase 8/9 (clients) | expired token → 401 `TOKEN_EXPIRED`; web/mobile redirect w/ message |
| Sensitive data protection | hashes, stack traces, secrets | `toPublicUser`, error handler hides internals in prod, logger redaction, `.env` gitignored | Phase 2–3 | response snapshot never contains `passwordHash`; forced 500 hides stack |
| Secure mobile token storage | token theft from device | `expo-secure-store` (Keystore) — never AsyncStorage | Phase 9 (MB-a) | code review grep `AsyncStorage` for token; manual |
| Network failure handling | crash/blank screens | mobile API client: no response → `NetworkError`; NetInfo banner; web error states | Phase 8/9 | airplane mode manual test; backend stopped |
| Invalid/expired tokens on clients | stale sessions | axios response interceptor: 401 → clear storage → navigate Login with "Session expired, please log in again" | Phase 8/9 | set short `JWT_EXPIRES_IN=60s` in a test deploy / local, wait, act |
| Logout revocation [REC] | token reuse after logout | `revoked_tokens` check in `requireAuth` | Phase 3 | /me after logout → 401 |
| Web token storage [REC] | XSS token theft | Keep token in memory + `localStorage` is acceptable for this task (guide restricts only mobile); React escaping; no `dangerouslySetInnerHTML` | Phase 8 | review |

---

# Part 10 — Web Development Plan

**Pages / routes**
| Route | Page | Auth |
|---|---|---|
| `/login`, `/register` | AuthPages | public (redirect to `/` if logged in) |
| `/` | DashboardPage | protected |
| `/projects` | ProjectsListPage (search box + status filter + "New project") | protected |
| `/projects/:id` | ProjectDetailPage (project info, edit/delete, task list w/ search + status + priority filters, add task) | protected |
| `/tasks` [REC] | AllTasksPage (global task search/filter) | protected |
| `*` | NotFound | — |

**Components (independent, buildable in isolation):** `AppLayout` (responsive nav: sidebar ≥ md, top bar/hamburger on mobile), `ProtectedRoute`, `FormField`, `Button` (with loading), `Spinner`, `ErrorMessage`/`ErrorBoundary`, `EmptyState`, `ConfirmDialog`, `StatusBadge`, `PriorityBadge`, `ProjectForm` (modal or page), `TaskForm`, `TaskRow` (inline status select + "mark complete" checkbox), `SearchInput` (debounced), `SelectFilter`, `StatCard`.

**Flows**
- Auth: form (RHF + Zod) → `POST /login` → store token → `GET /me` on app load to restore session → logout calls API then clears token and query cache.
- Projects: list (Query key `['projects', {search,status}]`) → create/edit → invalidate `projects` + `dashboard`.
- Tasks: in project detail, `['tasks',{projectId,search,status,priority}]`; mutations invalidate `tasks`, `projects`, `dashboard`.
- Filters live in URL search params (shareable, survives refresh) [REC].

**States:** every query shows Spinner / ErrorMessage with Retry / EmptyState. Every submit button disables + shows spinner. Server validation errors (`details[]`) map onto form fields. Global 401 → redirect to login with message. Network error → toast/banner "Cannot reach server".

**Order:** shell+API client+auth → projects → project detail+tasks → dashboard → filters → responsive pass → deploy.

---

# Part 11 — Mobile Development Plan

**Navigation**
```
RootNavigator
 ├─ AuthStack (if no token): Login, Register
 └─ AppTabs (if token):
     ├─ Dashboard
     ├─ ProjectsStack: ProjectsList → ProjectTasks → TaskForm (create/edit) / TaskDetail
     ├─ TasksStack [REC]: AllTasks (search + status/priority filters) → TaskForm
     └─ Account: user info + Logout
```

**Features & API prerequisites**
| Feature | Needs API | Notes |
|---|---|---|
| Auth (login/register/logout) | M3 deployed | `expo-secure-store` for token; on launch read token → `GET /me` → route |
| Dashboard | `GET /api/dashboard` | StatCards; pull-to-refresh; refetch on focus |
| Projects list | `GET /api/projects` | FlatList + RefreshControl (view only per guide) |
| Tasks under project | `GET /api/tasks?projectId=` | FlatList + RefreshControl |
| Create/edit/delete task | POST/PUT/DELETE `/api/tasks` | form validation; delete confirm `Alert` |
| Mark complete / change status & priority | `PUT /api/tasks/:id` | segmented controls / pickers; optimistic optional |
| Search & filter tasks | `GET /api/tasks?search&status&priority` | debounced input; chips for filters |
| Pull-to-refresh | all GETs | required for cross-platform sync demo |
| Loading/error | — | ActivityIndicator; ErrorView with Retry |
| No network | — | NetInfo `isConnected===false` → banner "No internet connection"; API client maps no-response to friendly error; never blank |
| Token expiry | backend `TOKEN_EXPIRED` | interceptor: delete SecureStore token → reset nav to Login → show "Your session has expired. Please log in again." |

**Config:** `EXPO_PUBLIC_API_URL` in `.env` / `app.config` / EAS profile env. Android release builds block cleartext HTTP → use the HTTPS deployed backend for APK.

**Build:** `eas build -p android --profile preview` with `buildType: "apk"`. Do a trial build right after MB-a.

Recommended libs: TanStack Query (same patterns as web), axios, react-hook-form + zod, `@react-native-community/netinfo`, `expo-secure-store`, `@react-navigation/*`.

---

# Part 12 — Testing Strategy

Test levels:
- **Unit** — pure functions: Zod schemas, jwt helpers, `toPublicUser`, dashboard result mapper.
- **Integration (backend)** — Supertest → Express app → real Postgres test DB (truncate between tests). **Primary investment.**
- **E2E** — [optional] Playwright on web for login → create project → create task. Mobile E2E: manual.
- **Manual** — `docs/MANUAL_TEST_CHECKLIST.md` for UI states, cross-platform sync, airplane mode, session expiry.

### 12.1 Database
Valid insert; missing NOT NULL → error; duplicate email (also mixed case, enforced by lowercase normalization) → 409; FK to nonexistent project → 404 from service (pre-check) / P2003 mapped; invalid enum → 400 at Zod (DB never sees it); boundary lengths (1, 150, 151 chars); malformed dates (`2024-13-01`, `abc`, `2024-02-30`); end < start → 400; project delete cascades tasks; ownership: user B's queries return 0 of A's rows; batch seed (e.g. 500 tasks) → dashboard counts exact; unicode/emoji names round-trip.

### 12.2 Backend/API
- Success for all 15 endpoints.
- Validation failures for each field rule.
- Missing auth (no header, `Bearer` with empty, wrong scheme `Basic`).
- Expired token, invalid signature, garbage token, token for deleted user, revoked (post-logout) token.
- Unauthorized resource access: user B GET/PUT/DELETE user A project & task → 404; B POST task into A's project → 404; B PUT own task with `projectId` of A's project → 404; B list `?projectId=A's` → 404.
- Invalid IDs (non-UUID → 400), nonexistent UUID → 404.
- Malformed JSON body → 400; wrong content-type; oversized body → 413.
- Duplicate registration → 409. Repeated login → 429 after limit.
- Unexpected payloads: extra fields (`userId`, `id`, `createdAt`, `passwordHash`) ignored/rejected; arrays instead of objects; numbers instead of strings; `null` values.

### 12.3 Security
Authentication bypass (every protected route table-driven without token); authorization bypass/ID manipulation (above); SQL injection strings in `search`, `email`, path ids → no 500, no extra rows; sensitive data leakage (assert no `passwordHash`/`password` key anywhere in any response, no stack in 500); rate limit; token misuse (`alg:none`, token signed with other secret, modified payload `sub`).

### 12.4 Integration (cross-platform) — manual, recorded in checklist
1. Register on web → log in on mobile with same creds → same name/dashboard.
2. Create task on web → mobile pull-to-refresh → appears.
3. Mark complete on mobile → web refresh → completed; dashboard counts change on both.
4. Delete project on web → mobile tasks for it gone after refresh (and open task screen handles 404 gracefully).
5. Register on mobile → login on web.

### 12.5 UI (manual; optional automated)
Loading spinners visible (throttle network); error with retry when backend down; empty states (new user); invalid forms show field messages and block submit; server 400 details shown; network off (mobile airplane mode, web devtools offline); expired session (short TTL) → login with message on both; responsive web at 375px / 768px / 1280px.

---

# Part 13 — Agent-Assisted Development Workflow

```
MASTER PLAN → MODULE → SMALL TASK (one PR-sized unit) → CODING AGENT (own branch)
→ TESTS (agent runs) → REVIEW AGENT (fresh context) → FIXES → HUMAN VERIFICATION (run it) → COMMIT/MERGE → NEXT TASK
```

**Rules of thumb**
- One task = one module sub-part, ideally < ~10 files changed.
- Agent always works on a branch; human merges.
- `CLAUDE.md` at repo root holds permanent rules so each task prompt can stay short:
  - layering (routes → controller → service → prisma; no Prisma in controllers),
  - every user-owned query scoped by `userId`,
  - error envelope & status codes,
  - enum spellings,
  - "do not modify files outside the allowed list; if you must, stop and report",
  - "run `npm test`, `npm run lint`, `npm run build` in the touched package before finishing",
  - "never commit `.env`; never log secrets",
  - final report format (below).

### Agent task template
```markdown
## Task: <ID> <name>
### Context
Project: Project Management System (see docs/MASTER_PLAN.md Part <x>). Current state: <what's merged>.
### Objective
<one sentence outcome>
### Requirements (traceable)
- [REQ] <copied from guide>   - [REC] <decision from plan>
### Files to inspect
CLAUDE.md, docs/MASTER_PLAN.md §<n>, <specific files>
### Files allowed to modify/create
<explicit globs>
### Files that must NOT be modified
everything else, especially <prisma/schema.prisma | other modules | lockfiles of other packages>
### Constraints
- Use existing helpers: validate(), requireAuth, AppError, prisma singleton
- No new dependencies unless listed: <list>
- Follow API contract in MASTER_PLAN Part 8 exactly
### Tests required
- <list of positive and negative cases>
### Definition of done
- All listed tests exist and pass; lint/build pass; no TODOs left; docs/API updated if contract touched
### Final report (required format)
1 Files inspected 2 Created 3 Modified 4 Changes summary 5 Commands run
6 Test results (paste summary) 7 Assumptions 8 Known issues 9 Needs human verification 10 Recommended next step
```

### Example concrete task (M4)
```markdown
## Task: B-04 Projects CRUD API
Objective: implement GET/POST/PUT/DELETE /api/projects[/:id] with search/status filter, scoped to req.user.id.
Allowed: backend/src/modules/projects/**, backend/src/routes.ts (one mount line), backend/tests/projects.test.ts, docs/API.md (projects section)
Forbidden: backend/prisma/**, backend/src/modules/auth/**, middleware/**, web/**, mobile/**
Tests: 2-user isolation on every route; invalid enum/date/empty name/end<start → 400; malformed uuid → 400; search case-insensitive; cascade delete verified.
```

Human verification after each task: read the diff, run the tests yourself, hit one endpoint with curl/HTTP client (or click through the UI), and make sure you can explain the code (it will be asked in review).

---

# Part 14 — Code Review Agent

Run in a **fresh session** (no implementation context), given: the task spec, `git diff main...<branch>`, `CLAUDE.md`, relevant plan section, and the guide requirements.

### Review prompt template
```markdown
You are a strict code reviewer. Do NOT rewrite code. Do NOT modify files.
Inputs: task spec (below), diff (`git diff main...HEAD`), CLAUDE.md, docs/MASTER_PLAN.md Part <n>.
Evaluate:
- Correctness: does it satisfy every bullet of the task spec?
- Architecture: logic in the right layer? Prisma only in services? no duplication?
- Security: can user B read/modify/delete user A's data through ANY route or field (path id, body projectId, query projectId)? any unvalidated input? any raw SQL? any sensitive field in responses/logs?
- Database: constraints, relations, cascades, indexes consistent with Part 7?
- API: routes, status codes, error envelope, validation messages match Part 8?
- Maintainability: naming, size of functions, dead code, consistency.
- Testing: positive AND negative cases; 2-user authorization tests present? run the tests and report.
- Requirements: cite the guide requirement each change serves; flag missing ones.
Output exactly:
CRITICAL ISSUES / HIGH / MEDIUM / LOW / MISSING TESTS / SECURITY ISSUES / ARCHITECTURAL ISSUES / RECOMMENDED CHANGES
(each item: file:line, problem, why it matters, suggested fix)
VERDICT: APPROVED | NOT APPROVED (NOT APPROVED if any Critical/High or any Security issue)
```
Fix loop: hand CRITICAL/HIGH/SECURITY items back to the implementation agent as a new small task; re-review only the delta. LOW items may be batched into a later cleanup task.

---

# Part 15 — Git Workflow

- **Branches:** `main` (always runnable, deployable). Feature branches per task: `feat/backend-auth`, `feat/web-projects`, `fix/tasks-authz`, `docs/readme`. Agents never commit to `main`.
- **Commits:** small, logical, Conventional Commits (`feat(api): add projects CRUD with ownership scoping`). Commit when a coherent step passes tests — e.g. schema; then service+routes; then tests — not "WIP".
- **Isolation:** one agent per branch; for parallel agents use separate git worktrees (`git worktree add ../pm-web feat/web-shell`) so they never share a working directory. Assign disjoint allowed-file lists (backend vs web vs mobile).
- **Diff review:** `git diff main...feat/x --stat` first (detects out-of-scope files), then full diff; reject if files outside the allow-list changed.
- **Preventing overwrites:** allow-lists in prompts; rebase/merge `main` into branch before review; never let an agent run `git push --force` or `git reset --hard` on shared branches.
- **Recovery:** uncommitted mess → `git restore .` / `git stash`; bad commit on branch → `git revert <sha>` or drop the branch and re-run the task; tag known-good states (`git tag slice-1-ok`).
- **Merge:** when review = APPROVED, tests green, human verified. Prefer squash-merge per task for a clean history (or merge commits if you want granular history). Optional [BONUS] GitHub Actions CI running backend tests on PRs.

---

# Part 16 — Definition of Done

Universal DoD (every module): implemented per spec · tests written (positive + negative) and passing · lint/typecheck/build pass · validation & error handling in place · security reviewed (authz, sensitive data) · review agent APPROVED · human ran it · docs updated if contract/env changed · merged to `main`.

| Module | Additional "done" criteria |
|---|---|
| M0 Repo | structure + CLAUDE.md + .gitignore + .env.example files; public repo |
| M1 DB | clean migrate from empty; seed; ERD in docs; FKs/unique/cascade verified by tests |
| M2 Foundation | health, 404, error envelope, malformed JSON 400, CORS env-driven, logging w/ redaction, test harness works |
| M3 Auth | 4 endpoints; bcrypt; JWT expiry; requireAuth; 429 on brute force; no hash in any response; expired/invalid token tests |
| M4 Projects | 5 endpoints; search+status filter; two-user isolation tests on all routes; cascade |
| M5 Tasks | 5 endpoints; projectId ownership on create/update/list; search+status+priority filters; isolation tests |
| M6 Dashboard | 5 required stats (+inProgressTasks); isolation + zero state tests; definition documented |
| M7 API docs | every endpoint documented with examples and errors; matches implementation |
| M8 Backend deploy | HTTPS URL live; migrations applied; env set; CORS includes web URL; trust proxy; health check |
| M9 Web | all pages; all CRUD; dashboard; all 5 search/filter features; loading/error/empty states; form validation w/ server error mapping; 401 redirect w/ message; responsive at 375px; deployed URL works against prod API |
| M10 Mobile | all M4–M14 items; SecureStore; pull-to-refresh on every list; NetInfo message; session-expiry redirect w/ message; APK installs on a real Android device and works against deployed backend |
| M11 Hardening | security test suite green; manual checklist fully passed and recorded; `npm audit` reviewed |
| M12 Submission | README complete; all 7 submission items gathered; video ≤ 5 min shows required scenario; repo public verified in incognito |

---

# Part 17 — What Not To Do

1. **Don't build web/mobile screens before the endpoint exists** — the API is cheap to finish first and clients must match it exactly.
2. **Don't postpone DB design** — enum spellings and nullability ripple into every layer.
3. **Don't build in-memory/mock backends** — the guide's core value is "same backend, same DB"; mocks are pure throwaway.
4. **Don't start bonuses** (Docker, refresh tokens, push notifications, offline, RBAC, audit logs) before P0+P1 are done. RBAC and audit logs are especially low value here.
5. **Don't let agents touch unrelated files** — enforce allow-lists and check `--stat`.
6. **Don't trust generated code unread** — you must explain every design decision in the review session.
7. **Don't test only happy paths** — authorization and validation are explicitly graded.
8. **Don't add authorization later** — scope by `userId` in the first query you write.
9. **Don't rely on frontend validation** — guide: "Validate all incoming requests on the backend, whichever app sent them."
10. **Don't leave deployment to the end** — mobile on a physical device needs an HTTPS host; CORS and proxy/rate-limit issues only show in deployment; APK builds can fail for tooling reasons.
11. **Don't over-architect** — no microservices, no separate mobile API/BFF (explicitly forbidden: "no separate backend for mobile"), no GraphQL, no Redux, no repository-pattern abstraction over Prisma, no websockets.
12. **Don't invent extra endpoints** — e.g. use `GET /api/tasks?projectId=` instead of `/api/projects/:id/tasks`; use `PUT` for "mark complete".
13. **Don't use AsyncStorage for the mobile token** — explicitly prohibited.
14. **Don't return 403 for others' resources** [REC] — 404 avoids revealing existence.
15. **Don't use real personal data** — seed with obviously fake users (`alice@example.com`).
16. **Don't commit secrets** — `.env` gitignored; JWT secret only in host env.
17. **Don't rely on Next.js API routes as the backend** — the backend must be Express/NestJS.

---

# Part 18 — Priority System

### P0 — Mandatory / Submission-critical
All of Part 1 marked Mandatory: auth (4 endpoints, bcrypt, unique email, JWT w/ expiry, rate limit), project & task CRUD with all fields/enums, dashboard 5 stats, 5 search/filter features, authorization, backend validation, no sensitive data, SQL-injection-safe ORM, CORS, logging, middleware, error handling, web (React, responsive, validation, loading, errors), mobile (Android, all M-features, secure storage, expiry, no-network, pull-to-refresh), docs (setup ×3, env vars, DB setup, API docs, mobile→deployed backend, ERD), deployments (web, backend, APK), public repo, README, 5-min recording.

### P1 — Engineering Quality
Backend integration tests for auth/authz/validation (formally bonus, but the evidence for P0 security claims) · consistent error envelope · `TOKEN_EXPIRED` code · server-side logout denylist · helmet · log redaction · UUID ids · env validation at startup · seed script · manual test checklist · OpenAPI/Swagger UI · URL-synced filters · empty states · confirm dialogs.

### P2 — Bonus (order of value-for-effort, [REC])
1. CI/CD (GitHub Actions running backend tests — tests already exist)
2. Docker (`docker-compose` with Postgres + backend)
3. Pagination + Sorting (query params on existing list endpoints)
4. Shared validation package
5. Refresh tokens
6. Offline viewing of tasks (cache last fetch)
7. Push notifications for tasks due tomorrow (needs scheduler + device tokens table + Expo push)
8. Audit logs
9. RBAC (no roles exist in the domain → least natural)

Rule: no P2 work until every P0 and P1 box in Part 20 is checked.

---

# Part 19 — Final Master Execution Plan

Order derived from Part 5. Each phase lists agent tasks (A-xx) sized for a single agent run.

### Phase 0 — Repository, Conventions, Contract
- **Objective:** a repo where agents can work safely against a frozen contract.
- **Why first:** every task depends on structure and the contract; fixing them now removes rework.
- **Modules:** M0. **Dependencies:** none.
- **Agent tasks:** A-00 create folders, root `.gitignore`, `CLAUDE.md` (rules + Part 8 contract summary + error format + enum list), `README.md` skeleton, `docs/` stubs.
- **Human tasks:** confirm stack choices; create public GitHub repo; create accounts (Render/Neon, Vercel, Expo).
- **Tests:** n/a. **Review:** CLAUDE.md matches this plan.
- **DoD:** pushed to `main`. **Unlocks:** Phase 1.

### Phase 1 — Database + Backend Foundation (parallel)
- **Objective:** migrated schema and a running Express shell with test harness.
- **Why now:** all features need both.
- **Modules:** M1 ∥ M2.
- **Agent tasks:** A-01 `backend/` init (TS, Express, Prisma, pino, Zod, Vitest/Jest, Supertest, ESLint), env schema, `app.ts`/`server.ts`, error handler, validate middleware, 404, CORS, helmet, health route, test DB helper. A-02 `schema.prisma` per Part 7, migration, seed with fake data, `docs/ERD.md` (Mermaid `erDiagram`).
- **Human:** local Postgres (Docker or Neon dev branch); verify `migrate reset` + `npm test`.
- **Tests:** foundation tests (M2); migration runs clean.
- **Review:** error envelope, no stack leak, schema vs Part 7.
- **DoD:** M1+M2 DoD. **Unlocks:** auth.

### Phase 2 — Authentication + First Deploy (Slice 1 backend)
- **Objective:** working identity end-to-end on a public URL.
- **Why now:** authz for all resources depends on `req.user`; deploying now de-risks mobile/CORS.
- **Modules:** M3, M8 (initial).
- **Agent tasks:** A-03 auth module (register/login/logout/me, bcrypt, jwt, requireAuth, rate limiter, revoked_tokens migration *if adopted — allow `prisma/` for this task only*), full auth test suite. A-04 deployment config: `render.yaml` or build/start scripts (`prisma migrate deploy && node dist/server.js`), `trust proxy`, `docs/DEPLOYMENT.md`.
- **Human:** create Render service + Postgres, set `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`; curl register/login/me on prod.
- **Tests:** Part 12.2 auth items; prod smoke via curl.
- **Review:** security focus (hash, enumeration, rate limit, expiry, no hash in responses).
- **DoD:** M3 DoD + live `/api/health` and `/api/auth/*`. **Unlocks:** resource APIs and both client shells in parallel.

### Phase 3 — Client Shells + Auth Screens (Slice 1 clients) ∥ Projects API
Run three tracks in parallel (separate worktrees, disjoint folders).
- **Track B — Projects API (M4):** A-05 per Part 8 + isolation tests.
- **Track W — Web shell (W-a, W-b):** A-06 Vite+TS+Tailwind+Router+Query, axios client (baseURL env, auth header, 401 interceptor → login with message, network-error mapping), AuthContext, Login/Register pages with RHF+Zod, ProtectedRoute, AppLayout, placeholder Home showing `/me` name, logout.
- **Track M — Mobile shell (MB-a, MB-b):** A-07 Expo TS app, React Navigation, API client (same behaviors), SecureStore token, NetInfo banner, Login/Register/Account(logout) screens, Home showing `/me`. A-08 EAS config with `apk` profile + **trial APK build** against deployed backend.
- **Human:** register on web, log in on mobile (A8 proven); install trial APK.
- **DoD:** Slice 1 working across both clients; M4 merged. **Unlocks:** task API and project UIs.

### Phase 4 — Tasks API + Dashboard API ∥ Web Projects UI
- **Agent tasks:** A-09 Tasks module (M5) with ownership-through-project and all filters + tests. A-10 Dashboard module (M6) + tests. A-11 Web projects list (search + status filter) + create/edit/delete + project detail info (W-c).
- **Human:** verify isolation manually with two accounts via curl/HTTP file.
- **Review:** reviewer specifically attacks `projectId` in task body/query.
- **DoD:** all 15 endpoints live on prod with tests green; API docs draft A-12 (`docs/openapi.yaml` + Swagger UI or `docs/API.md`). **Unlocks:** all remaining client work against a complete API.

### Phase 5 — Core Client Features (Slices 3–4)
Parallel tracks:
- **Web:** A-13 tasks in project detail (list, create/edit/delete, inline status/priority, mark complete, search/status/priority filters) (W-d, W-f). A-14 Dashboard page (W-e) + global Tasks page [REC]. 
- **Mobile:** A-15 Dashboard screen + Projects list + ProjectTasks (pull-to-refresh, loading, errors, empty). A-16 Task form create/edit, delete, status/priority/mark-complete. A-17 AllTasks search + status/priority filters.
- **Human:** run the demo scenario: create task on web → pull-to-refresh on mobile; complete on mobile → refresh web; dashboard numbers agree.
- **DoD:** every functional requirement in Part 1 §1.2–1.7 works on prod backend. **Unlocks:** hardening.

### Phase 6 — Hardening (P1)
- **Agent tasks:** A-18 security test suite (Part 12.3: route-table auth bypass, injection strings, leakage assertion across all responses, token misuse). A-19 Web UX pass: responsive at 375/768/1280, empty states, server-error-to-field mapping, confirm dialogs, consistent spinners. A-20 Mobile robustness: airplane mode on every screen, session-expiry flow message, keyboard-avoiding forms, double-submit prevention. A-21 `docs/MANUAL_TEST_CHECKLIST.md`.
- **Human:** execute manual checklist (short `JWT_EXPIRES_IN` locally to test expiry on both clients); `npm audit`.
- **Review:** full-repo review agent pass against Part 1 checklist ("Requirements" section of reviewer prompt).
- **DoD:** M11 DoD.

### Phase 7 — Final Deployment
- **Agent tasks:** A-22 web deploy config (Vercel SPA rewrites `/* → /index.html`, `VITE_API_URL`), docs. A-23 EAS production APK profile with prod `EXPO_PUBLIC_API_URL`.
- **Human:** set Vercel env, add Vercel domain to backend `CORS_ORIGIN`, redeploy; build APK; install on physical Android; full smoke on prod.
- **DoD:** web URL, backend URL, APK/Expo link all working with the same account.

### Phase 8 — Documentation & Submission
- **Agent tasks:** A-24 README: overview, architecture diagram, stack + justification, repo structure, setup for backend/web/mobile, env var tables per app, DB setup (local Docker command, migrate, seed), running tests, deployment URLs, how to run mobile against deployed backend (Expo Go with `EXPO_PUBLIC_API_URL`, or install APK), test accounts (fake), design decisions (404 vs 403, logout strategy, pending definition), known limitations. Finalize API docs + ERD.
- **Human:** follow README on a clean clone (or have an agent do it in a fresh container) to verify DOC6; check repo public in incognito; record ≤5-min video (warm Render first): login same account on web & mobile → create task on web → pull-to-refresh on mobile → modify on mobile → refresh web → dashboard.
- **DoD:** all 7 submission items ready.

### Phase 9 — Bonus (P2) only after Part 20 P0/P1 fully checked
A-25 GitHub Actions CI (backend tests with Postgres service). A-26 Docker/docker-compose. A-27 pagination + sorting (backend params + UI controls). Then others per Part 18 order. Each bonus is its own branch; update README "Bonus features implemented" section.

---

# Part 20 — Final Master Checklist

## Requirements
- [ ] Every Part 1 Mandatory item traced to a checklist line below
- [ ] Ambiguities resolved & documented (pending definition, required fields, date rules, logout)

## Architecture
- [ ] One Express backend serves web and mobile; no mobile-specific backend
- [ ] Both clients use the same `/api/*` endpoints with Bearer JWT
- [ ] Layered backend: routes → middleware → controllers → services → Prisma

## Database
- [ ] PostgreSQL; tables users, projects, tasks (+ revoked_tokens if used)
- [ ] FKs projects.user_id → users, tasks.project_id → projects; ON DELETE CASCADE
- [ ] UNIQUE email (normalized lowercase); NOT NULL on required columns
- [ ] Enums: project status 3 values; task status 3 values; priority 3 values
- [ ] created_at server-set on projects & tasks
- [ ] Migrations reproducible from empty DB; seed with fake data only
- [ ] ERD / schema in docs

## Backend
- [ ] Route organization per module; middleware used (auth, validation, errors, rate limit, CORS, logging)
- [ ] Central error handler with consistent JSON envelope; no stack traces in prod
- [ ] Request logging (secrets redacted)
- [ ] CORS restricted to web app domain(s)
- [ ] Env validated at startup; `.env.example` present

## Authentication
- [ ] POST /api/auth/register  - [ ] POST /api/auth/login  - [ ] POST /api/auth/logout  - [ ] GET /api/auth/me
- [ ] bcrypt hashing; no plaintext anywhere (DB, logs, responses)
- [ ] JWT with expiration; expired → 401 `TOKEN_EXPIRED`
- [ ] Rate limiting on login/register (429)
- [ ] Same account works on web and mobile (verified both directions)

## Authorization
- [ ] Every project query scoped by userId
- [ ] Every task query scoped via project.userId; projectId in body/query ownership-checked
- [ ] Cross-user GET/PUT/DELETE/list → 404 (tested)
- [ ] userId never accepted from client

## Security
- [ ] Backend validation on all bodies, params, queries (required, email, dates, empty strings, enums)
- [ ] No sensitive fields in responses
- [ ] No raw unsafe SQL; injection strings tested
- [ ] Secrets only in env; `.env` not committed
- [ ] Mobile token in SecureStore (Keystore)

## REST API
- [ ] Projects: GET list, GET :id, POST, PUT :id, DELETE :id
- [ ] Tasks: GET list (projectId/search/status/priority), GET :id, POST, PUT :id, DELETE :id
- [ ] GET /api/dashboard
- [ ] Correct status codes (200/201/204/400/401/404/409/429/500)
- [ ] API documentation complete and matches implementation

## Web
- [ ] React app; component structure
- [ ] Register / login / logout; session persists until logout/expiry
- [ ] Projects: list own, create, view detail, edit, delete
- [ ] Tasks under project: create, edit, delete, mark complete, status & priority change
- [ ] Form validation (client) + server error display
- [ ] Loading indicators, error states, empty states
- [ ] Expired session → login with message
- [ ] Responsive (phone/tablet/desktop)

## Mobile
- [ ] React Native (Expo); Android build
- [ ] Register / login / logout with same account
- [ ] Dashboard
- [ ] Projects list → tasks per project
- [ ] Create / edit / delete tasks
- [ ] Mark complete; change status & priority
- [ ] Search tasks; filter by status & priority
- [ ] Pull-to-refresh on lists
- [ ] Form validation; loading indicators; error handling
- [ ] Token in secure storage (not AsyncStorage)
- [ ] Expired token → login screen with clear message
- [ ] No network → clear message, no crash/blank

## Dashboard
- [ ] Total Projects  - [ ] Total Tasks  - [ ] Completed Tasks  - [ ] Pending Tasks  - [ ] Projects In Progress
- [ ] Only authenticated user's data; shown on web and mobile

## Search & Filtering
- [ ] Search projects by name (web)
- [ ] Filter projects by status (web)
- [ ] Search tasks by name (web + mobile)
- [ ] Filter tasks by status (web + mobile)
- [ ] Filter tasks by priority (web + mobile)

## Testing
- [ ] Backend integration tests: auth, projects, tasks, dashboard (positive + negative)
- [ ] Two-user authorization tests on every resource route
- [ ] Security tests: bypass, injection, leakage, token misuse, rate limit
- [ ] Manual UI checklist executed (loading, errors, empty, invalid forms, offline, expiry, responsive)

## Integration
- [ ] Web create → mobile pull-to-refresh shows it
- [ ] Mobile change → web refresh shows it
- [ ] Dashboard consistent across platforms
- [ ] Register on mobile → login on web

## Deployment
- [ ] Backend deployed (HTTPS), migrations applied, env configured, trust proxy set
- [ ] Web deployed; SPA routing works on refresh; CORS allows it
- [ ] Android APK / Expo link pointing at deployed backend; installs & works on device

## Documentation
- [ ] Setup: backend, web, mobile
- [ ] Environment variables (per app, with examples, no real secrets)
- [ ] Database setup (create, migrate, seed)
- [ ] API documentation
- [ ] How to run mobile against deployed backend
- [ ] ER diagram / schema
- [ ] Design decisions & known limitations
- [ ] Verified by following README from a clean clone

## GitHub
- [ ] Public repo, viewable logged out
- [ ] Clean history of small commits; no secrets in history
- [ ] README at root links docs, URLs, APK

## Demo
- [ ] ≤ 5-minute recording
- [ ] Same account logged in on web and mobile
- [ ] Task created on one platform, shown on the other after refresh
- [ ] Backend warmed up before recording
- [ ] Only test data visible

## Submission
- [ ] 1 Repo link  - [ ] 2 Schema/ERD  - [ ] 3 API docs  - [ ] 4 README
- [ ] 5 Web + backend URLs  - [ ] 6 APK/Expo link  - [ ] 7 Recording
- [ ] Able to explain every design decision (auth, authz, validation, schema, stack)

## Bonus Features (only after all above)
- [ ] CI/CD  - [ ] Docker  - [ ] Unit tests  - [ ] Integration tests (likely already done → claim it)
- [ ] Pagination  - [ ] Sorting  - [ ] Shared types/validation  - [ ] Refresh tokens
- [ ] Offline task viewing (mobile)  - [ ] Push notifications (tasks due tomorrow)  - [ ] Audit logs  - [ ] RBAC

---

## Quick answers to the 12 key questions

1. **Build first:** repo conventions + frozen API contract, then DB schema and backend foundation (in parallel).
2. **Why:** every layer depends on schema and contract; changing them later ripples into both clients.
3. **Depends on it:** auth → all resource APIs → both clients → deployment → submission.
4. **Parallel:** DB ∥ foundation; after auth: projects API ∥ web shell ∥ mobile shell; dashboard API ∥ tasks API; web features ∥ mobile features.
5. **Agent does:** one module sub-task per run using the Part 13 template.
6. **Files allowed:** only that module's folder + listed mount/doc lines (Part 4 + task allow-lists).
7. **Test:** positive + negative + two-user isolation for every endpoint; manual cross-platform & failure-mode checklist for clients.
8. **Reviewer checks:** Part 14 prompt — security/authz first.
9. **Finished when:** Part 16 DoD met, review APPROVED, human verified, merged.
10. **Next:** follow Part 19 phase order.
11. **Satisfied the task when:** every Part 20 box in sections Requirements→Submission is checked.
12. **Before submission:** all P0 + P1 items, deployed URLs + APK verified on a device, README verified from clean clone, ≤5-min recording.
