# Decision Log

Decisions approved in Phase 0. Rationale details: `docs/MASTER_PLAN.md` Parts 3, 7, 8.

| # | Decision | Why |
|---|---|---|
| D1 | Backend: Node.js + Express + TypeScript | Allowed by guide; makes required middleware/route organization explicit and easy to explain. |
| D2 | Database: PostgreSQL via Prisma ORM | Allowed by guide; native enums, free hosting; Prisma parameterizes all queries (SQL-injection requirement) and manages migrations. |
| D3 | Validation: Zod on the backend (authoritative); same style on clients for UX | Guide requires backend validation of every request regardless of client. |
| D4 | Auth: JWT (HS256) in `Authorization: Bearer` header for both web and mobile; bcrypt password hashing | Guide requires JWT + bcrypt; one auth path for both clients. |
| D5 | Token lifetime configurable (`JWT_EXPIRES_IN`, default `1h`); expired → 401 `TOKEN_EXPIRED` | Guide: logged in "until logout or token expiration"; clients must show a clear expired-session message. |
| D6 | Logout: server stores the token's `jti` in a `revoked_tokens` table until expiry; client deletes token | Makes logout real server-side with minimal complexity. |
| D7 | Web: React + Vite + TypeScript (SPA) | Allowed; no need for SSR or Next.js server features; static deploy. |
| D8 | Mobile: React Native with Expo + TypeScript; token in `expo-secure-store` (Android Keystore) | Allowed; meets secure-storage requirement; EAS builds an APK. |
| D9 | IDs are UUIDs | Non-guessable (defense in depth — authorization is still enforced). |
| D10 | Enum values `NOT_STARTED/IN_PROGRESS/COMPLETED`, `PENDING/IN_PROGRESS/COMPLETED`, `LOW/MEDIUM/HIGH`; UIs map to labels | Stable machine values, readable UI. |
| D11 | Required fields — project: `name`; task: `projectId`, `name`. Others optional. `endDate >= startDate` | Guide lists fields but not which are required; minimal required set. |
| D12 | Accessing another user's resource returns **404**, not 403 | Doesn't reveal that the resource exists. |
| D13 | Dashboard `pendingTasks` = tasks with status `PENDING`; response also includes `inProgressTasks` | Guide's "Pending Tasks" matches the `Pending` status; extra field makes totals reconcile. |
| D14 | `PUT` = partial update; "mark complete" = `PUT /api/tasks/:id {status:"COMPLETED"}` | Uses only the endpoints the guide lists. |
| D15 | Tasks under a project = `GET /api/tasks?projectId=` | Avoids inventing extra routes. |
| D16 | Deleting a project cascades to its tasks | Tasks cannot exist without a project. |
| D17 | Emails stored lowercase and trimmed; uniqueness case-insensitive | "Email addresses must be unique" — `A@x.com` and `a@x.com` are the same address. |
| D18 | Single monorepo with plain folders `backend/ web/ mobile/ docs/` (no workspace tooling) | One public link; avoids Expo/Metro monorepo friction. |
| D19 | Hosting: PostgreSQL on Neon, backend on Koyeb (Docker image from GitHub), web on Vercel, APK via EAS. *(Changed in Phase 2 from Render at the owner's request.)* | Free tiers, no expiring database, standard Docker image portable to any host. |
