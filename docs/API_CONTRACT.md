# API Contract (frozen in Phase 0)

Single backend used by **both** the web app and the mobile app. Changes to this file require explicit approval and must be reflected in `CLAUDE.md`, backend, web and mobile.

## Conventions

- Base path: `/api`. JSON request/response bodies (`Content-Type: application/json`).
- Field names: camelCase. IDs: UUID strings. Dates (`startDate`, `endDate`, `dueDate`): `YYYY-MM-DD`. Timestamps (`createdAt`, `updatedAt`): ISO-8601 UTC.
- Authentication: `Authorization: Bearer <jwt>` on every endpoint except register/login.
- Success bodies: single resource → `{ "data": {...} }`; list → `{ "data": [...] }`. Auth endpoints → `{ "user": {...}, "token": "..." }` / `{ "user": {...} }`.
- `PUT` performs a **partial update**: any subset of updatable fields, at least one.
- Unknown body fields are ignored. Server-controlled fields (`id`, `userId`, `createdAt`, `updatedAt`) are never accepted from clients.
- Text inputs are trimmed; whitespace-only strings count as empty.

### Enums
| Enum | Values | UI labels |
|---|---|---|
| ProjectStatus | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` | Not Started, In Progress, Completed |
| TaskStatus | `PENDING`, `IN_PROGRESS`, `COMPLETED` | Pending, In Progress, Completed |
| TaskPriority | `LOW`, `MEDIUM`, `HIGH` | Low, Medium, High |

### Error envelope
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed",
             "details": [ { "path": "email", "message": "Invalid email address" } ] } }
```
`details` is present only for validation errors.

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | body/params/query fail validation (incl. malformed UUID, bad enum, bad date, end < start) |
| 400 | `INVALID_JSON` | body is not valid JSON |
| 401 | `UNAUTHORIZED` | missing, malformed, invalid-signature or revoked token |
| 401 | `TOKEN_EXPIRED` | token expired → clients send user to login with "session expired" message |
| 401 | `INVALID_CREDENTIALS` | wrong email or password (same message for both) |
| 404 | `NOT_FOUND` | resource does not exist **or belongs to another user**; unknown route |
| 409 | `EMAIL_TAKEN` | registration with an existing email (case-insensitive) |
| 413 | `PAYLOAD_TOO_LARGE` | body over limit |
| 429 | `RATE_LIMITED` | too many auth attempts from the same IP |
| 500 | `INTERNAL_ERROR` | unexpected; no internals exposed |

### Resource shapes
```ts
User    { id, fullName, email, createdAt }                       // never includes password/hash
Project { id, name, description: string|null, status: ProjectStatus,
          startDate: string|null, endDate: string|null, createdAt, updatedAt, taskCount: number }
Task    { id, projectId, name, description: string|null, priority: TaskPriority,
          status: TaskStatus, dueDate: string|null, createdAt, updatedAt,
          project: { id, name } }
```

---

## Authentication

### `POST /api/auth/register` — public, rate-limited
Body: `{ fullName: string(1–100), email: valid email (stored lowercase, ≤255), password: string(8–72) }`
→ `201 { user, token }` · Errors: 400, 409 `EMAIL_TAKEN`, 429

### `POST /api/auth/login` — public, rate-limited
Body: `{ email, password }` (both required)
→ `200 { user, token }` · Errors: 400, 401 `INVALID_CREDENTIALS`, 429

### `POST /api/auth/logout` — auth
Revokes the presented token server-side (its `jti`). Client must also delete its stored token.
→ `204` · Errors: 401

### `GET /api/auth/me` — auth
→ `200 { user }` · Errors: 401

---

## Projects (auth; only the caller's own projects are ever visible)

### `GET /api/projects`
Query: `search?` (string ≤100, case-insensitive substring of name), `status?` (ProjectStatus). Combined with AND. Ordered by `createdAt` desc.
→ `200 { data: Project[] }` · Errors: 400, 401

### `GET /api/projects/:id`
→ `200 { data: Project }` · Errors: 400 (bad UUID), 401, 404

### `POST /api/projects`
Body: `{ name: string(1–150) required, description?: string(≤2000)|null, status?: ProjectStatus (default NOT_STARTED), startDate?: date|null, endDate?: date|null }` — `endDate >= startDate` when both set.
→ `201 { data: Project }` · Errors: 400, 401

### `PUT /api/projects/:id`
Body: any subset of POST fields (≥1). Date rule checked against the merged (existing + new) values.
→ `200 { data: Project }` · Errors: 400, 401, 404

### `DELETE /api/projects/:id`
Deletes the project **and all its tasks**.
→ `204` · Errors: 400, 401, 404

---

## Tasks (auth; ownership is through the task's project)

### `GET /api/tasks`
Query: `projectId?` (UUID — must be caller's project, else 404), `search?` (≤100, case-insensitive name substring), `status?` (TaskStatus), `priority?` (TaskPriority). AND-combined. Without `projectId`: all of the caller's tasks. Ordered by `createdAt` desc.
→ `200 { data: Task[] }` · Errors: 400, 401, 404

### `GET /api/tasks/:id`
→ `200 { data: Task }` · Errors: 400, 401, 404

### `POST /api/tasks`
Body: `{ projectId: UUID required (caller's project), name: string(1–150) required, description?: string(≤2000)|null, priority?: TaskPriority (default MEDIUM), status?: TaskStatus (default PENDING), dueDate?: date|null }`
→ `201 { data: Task }` · Errors: 400, 401, 404 (project not found/not owned)

### `PUT /api/tasks/:id`
Body: any subset of POST fields (≥1). If `projectId` is given it must be the caller's project. "Mark as completed" = `{ "status": "COMPLETED" }`.
→ `200 { data: Task }` · Errors: 400, 401, 404

### `DELETE /api/tasks/:id`
→ `204` · Errors: 400, 401, 404

---

## Dashboard

### `GET /api/dashboard` — auth
Counts cover only the caller's data.
```json
{ "data": { "totalProjects": 0, "projectsInProgress": 0,
            "totalTasks": 0, "completedTasks": 0, "pendingTasks": 0, "inProgressTasks": 0 } }
```
`pendingTasks` = tasks with status `PENDING`; `projectsInProgress` = projects with status `IN_PROGRESS`.
→ `200` · Errors: 401

---

## Utility (not in the guide's minimum list; operational only)
### `GET /api/health` — public → `200 { "status": "ok" }`
