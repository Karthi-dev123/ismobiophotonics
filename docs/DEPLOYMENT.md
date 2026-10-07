# Deployment

| Part | Host | Status |
|---|---|---|
| PostgreSQL | Neon (free) | _TBD_ |
| Backend API | Koyeb (free instance, Docker build from GitHub) | _URL TBD_ |
| Web app | Vercel | Phase 7 |
| Android app | EAS Build (APK) | Phase 7 |

The backend image is defined in [`backend/Dockerfile`](../backend/Dockerfile). On start, the container runs `prisma migrate deploy` (applies any new migrations) and then the server.

## 1. Database on Neon

1. Sign up at https://neon.tech and **create a project** (PostgreSQL 16, region close to your Koyeb region, e.g. Frankfurt or Washington).
2. Open **Connection Details**, choose the database `neondb` (or create `pms`), and turn **Connection pooling OFF** — copy the **direct** connection string. It looks like:
   ```
   postgresql://<user>:<password>@ep-xxxx-xxxx.<region>.aws.neon.tech/neondb?sslmode=require
   ```
   (The direct string is needed for Prisma migrations; traffic for this app is small, so pooling isn't needed.)
3. Keep this string secret — it goes only into Koyeb's environment settings, never into the repo.

## 2. Backend on Koyeb

1. Sign up at https://www.koyeb.com and connect your GitHub account (grant access to `ismobiophotonics`).
2. **Create Web Service → GitHub** → select the repository and branch (`claude/master-dev-plan-scxci1`, or `main` after merging).
3. Build settings:
   - **Builder:** Dockerfile
   - **Work directory:** `backend`
   - **Dockerfile location:** `Dockerfile` (relative to the work directory)
4. Instance: **Free** (eco). Region: one of those offered for the free instance.
5. **Exposed port:** `8000`, protocol HTTP, route `/`.
6. **Health check:** HTTP, port `8000`, path `/api/health`.
7. **Environment variables** (use Koyeb *Secrets* for the two sensitive ones):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon direct connection string (secret) |
   | `JWT_SECRET` | random 64-char hex — generate with `openssl rand -hex 32` (secret) |
   | `PORT` | `8000` |
   | `NODE_ENV` | `production` |
   | `JWT_EXPIRES_IN` | `1h` |
   | `CORS_ORIGIN` | `http://localhost:5173` for now → **replace with the Vercel URL** after the web deploy (comma-separate several) |
   | `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` |
   | `AUTH_RATE_LIMIT_MAX` | `10` |
   | `TRUST_PROXY_HOPS` | `1` |

8. Name the service (e.g. `pms-api`) and **Deploy**. Build logs should end with `API listening on port 8000`; the public URL looks like `https://pms-api-<org>.koyeb.app`.

## 3. Verify

```bash
cd backend
./scripts/smoke.sh https://pms-api-<org>.koyeb.app
```
All checks must print `ok`, ending with `ALL SMOKE CHECKS PASSED`.

Optional demo data (fake users only), from your machine:
```bash
cd backend && DATABASE_URL='<neon direct string>' npm run db:seed
```

## Notes
- **Cold starts:** the free instance scales to zero when idle; the first request after a pause can take a while. Open `/api/health` a minute before demos or recordings.
- **Redeploys:** every push to the selected branch triggers a new build automatically.
- **Rate limiting behind the proxy:** `TRUST_PROXY_HOPS` tells Express how many proxies sit in front of it so limits apply per real client IP. If all users appear to share one limit, adjust this value.
- **Secrets:** never commit `.env`; rotate `JWT_SECRET` in Koyeb if it is ever exposed (this logs everyone out).

## Web (Vercel) — Phase 7
## Android APK (EAS) — Phase 7
