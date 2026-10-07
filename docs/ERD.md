# Database Schema / ER Diagram

PostgreSQL, managed by Prisma migrations (`backend/prisma/`). Source of truth: `backend/prisma/schema.prisma`.

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ TASKS : contains

    USERS {
        uuid id PK
        varchar(100) full_name "NOT NULL"
        varchar(255) email "NOT NULL, UNIQUE, lowercase"
        varchar(255) password_hash "NOT NULL, bcrypt"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL"
    }
    PROJECTS {
        uuid id PK
        uuid user_id FK "NOT NULL -> users.id ON DELETE CASCADE"
        varchar(150) name "NOT NULL"
        varchar(2000) description "NULL"
        project_status status "NOT NULL, default NOT_STARTED"
        date start_date "NULL"
        date end_date "NULL, CHECK end_date >= start_date"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL"
    }
    TASKS {
        uuid id PK
        uuid project_id FK "NOT NULL -> projects.id ON DELETE CASCADE"
        varchar(150) name "NOT NULL"
        varchar(2000) description "NULL"
        task_priority priority "NOT NULL, default MEDIUM"
        task_status status "NOT NULL, default PENDING"
        date due_date "NULL"
        timestamptz created_at "NOT NULL, default now()"
        timestamptz updated_at "NOT NULL"
    }
    REVOKED_TOKENS {
        varchar(64) jti PK "id of a logged-out JWT"
        timestamptz expires_at "NOT NULL, indexed"
    }
```

## Enums
| Type | Values |
|---|---|
| `project_status` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `task_status` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `task_priority` | `LOW`, `MEDIUM`, `HIGH` |

## Relationships & rules
- A user owns many projects; a project contains many tasks. Tasks reach their owner **through** the project (no duplicated `user_id`, 3NF).
- Deleting a project deletes its tasks; deleting a user deletes their projects and tasks (`ON DELETE CASCADE`).
- `revoked_tokens` is standalone: it stores logged-out token ids until they expire.

## Indexes
- `users.email` (unique)
- `projects (user_id, status)` — list/filter a user's projects, dashboard counts
- `tasks (project_id, status)` — list/filter a project's tasks, dashboard counts
- `revoked_tokens (expires_at)` — cleanup of expired entries

## Responsibilities
The database guarantees integrity (types, NOT NULL, UNIQUE, FK, CHECK, enums). Input format validation, authentication and **authorization (ownership)** are enforced by the backend — see `docs/API_CONTRACT.md` and `CLAUDE.md`.
