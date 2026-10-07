# Project Management System (Web + Mobile)

A web app and an Android app for managing projects and tasks. Both talk to the **same** REST backend and PostgreSQL database, so one account works on both and changes appear on either platform after a refresh.

> Status: under construction — sections marked _TBD_ are filled in as phases complete. Build plan: [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md).

## Links
- Web app: _TBD_
- Backend API: _TBD_
- Android APK / Expo link: _TBD_
- Demo video: _TBD_

## Architecture
```
Web (React) ─┐                              ┌─ PostgreSQL
             ├─ HTTPS/JSON + JWT ─▶ Express REST API (/api) ─▶ Prisma ─┤
Mobile (Expo)┘                              └─ users · projects · tasks
```

## Tech stack
Express + TypeScript · PostgreSQL + Prisma · Zod · JWT + bcrypt · React + Vite · React Native (Expo). Rationale: [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Repository structure
```
backend/   REST API
web/       React web app
mobile/    Expo React Native app
docs/      plan, API contract, decisions, ERD, deployment
```

## Setup
### Prerequisites — _TBD_
### Database setup — _TBD_
### Backend — _TBD_
### Web — _TBD_
### Mobile — _TBD_
### Running the mobile app against the deployed backend — _TBD_

## Environment variables
See `backend/.env.example`, `web/.env.example`, `mobile/.env.example`. Full documentation — _TBD_.

## API documentation
Contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md). Full docs — _TBD_.

## Database schema / ER diagram — _TBD_

## Testing — _TBD_

## Security — _TBD_

## Design decisions & known limitations
See [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Bonus features implemented — _TBD_
