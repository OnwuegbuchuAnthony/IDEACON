# Contributing to IDEACON

## Branching

`main` is protected — no direct commits, even solo. Every change goes through a branch + PR, both for rollback safety and as a self-review checkpoint.

Branch naming: `<type>/<short-description>`

- `feat/submission-wizard`
- `fix/nda-gate-timeout`
- `chore/gitignore-cleanup`
- `docs/prd-legal-section`

## Commit messages (Conventional Commits)

```
<type>: <short summary>

[optional body — why, not just what]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

Examples:
```
feat: add teaser card lock state for unsigned NDA
fix: remove compiled index.html committed by mistake
chore: expand .gitignore for build artifacts and env files
```

Tie commits to plan version bumps where relevant — e.g. a design-token change should reference the `design.html` version it updates.

## Pull requests

- One logical change per PR. Use the PR template checklist.
- Require at least a self-review pass before merge, even solo — read the diff as if reviewing someone else's code.
- CI (lint, typecheck, test, build) must pass before merge.

## Releases / tags

Tag a release at each phase exit from `IMPLEMENTATION_PLAN.md`'s own milestones, so a demoed state is checkoutable later:

- `v0.1-phase0-foundations` — design tokens live, auth + roles, audit spine
- `v0.2-phase1-mvp` — submission→review→NDA→deal loop demoable, evidence pack exportable
- `v0.3-phase2-monetization` — paying pilot, ≥10 brokered NDAs

## Secrets

Never commit real values. Keep a `.env.example` with placeholder keys only (Paystack/Flutterwave, Resend, Termii, LLM provider, DB connection string). Real values live in the host's Docker Compose environment or a secrets manager — never in git history, since this stack is self-hosted with no platform (Vercel/Supabase) to catch a leak for you.

## Docs

`IDEACON-PRD.md`, `IDEACON-PRD refined.md`, and `IMPLEMENTATION_PLAN.md` should not drift into duplicates. Treat `IDEACON-PRD refined.md` as canonical; the non-refined version should be archived or deleted once confirmed superseded.
