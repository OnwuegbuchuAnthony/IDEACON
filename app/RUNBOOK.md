# IDEACON — Local Ops Runbook (single device)

## Daily ops
- App: `cd app` → `npm.cmd run dev` (dev) or `npm.cmd run build` + `npm.cmd run start` (prod, :3000).
- Health: `/browse` → 200. Auth: `/api/auth/get-session` → 200.
- Pilot gate: `node scripts/e2e.mjs` → expect `E2E ALL PASS`.

## Backups
- Script: `app/scripts/backup.ps1` (pg_dump custom format → `C:\IDEACON-backups`, 14-day retention).
- Schedule via Task Scheduler, daily 02:00.
- Restore test: `pg_restore -U ideacon -h localhost -d ideacon_restoretest <file>` then drop the test DB.

## Users & roles
- Sign up in app, then: `node prisma/promote.mjs <email> <creator|reviewer|broker|admin> [company:"Name"]`.
- Tiers: broker console → set tier (free/starter/growth/enterprise).

## Digests
- Broker console → "Send match digests" (or schedule `curl -X POST` via task + service key later).

## Deploys on this box
- `git pull`, `npm.cmd ci`, `npx prisma db push`, `npm.cmd run build`, restart `npm.cmd run start` (or Caddy + `next start`).
- Env lives in `app/.env.local` (gitignored) — back it up separately.

## Incidents
- Audit trail: `/admin/events` (filter by type). Evidence pack: `/api/ideas/:id/evidence`.
- Rate limits: 60/min API, 15/min auth per IP (429 = slow down, not an outage).
- Secrets: rotate `BETTER_AUTH_SECRET` + R2 keys via `.env.local`, restart app.
