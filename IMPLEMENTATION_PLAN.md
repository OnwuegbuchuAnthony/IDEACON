# IDEACON — Implementation Plan (v1.1)

Derived from `IDEACON-PRD.md`. Nigeria-first GTM, global + industry-agnostic architecture.
Brokered model is the moat: teased ideas, expert + AI review, NDA-gated full disclosure, team-managed handoff. No open creator↔company messaging.

**Locked stack decisions (owner-confirmed):** local PostgreSQL (on-device) · Better Auth · Cloudflare R2 storage · Resend email · no Supabase · no Vercel — self-hosted on local device.

---

## 1. Product recap (what we're building)

- **Two sides:** 4 creator personas (Independent Inventor, Casual Submitter, Vetted Expert, Student Innovator via university hubs) + 3 company roles (Founder/CEO, Enterprise R&D Lead, Product/Strategy Manager).
- **Core loop:** Submit (teased) → Expert review + AI score → Categorize → Discover/match → NDA → Brokered deal (license / revenue-share / advisory partnership).
- **Niches:** HealthTech, AgroTech, FinTech, Business cross-industry. First market: Lagos, Abuja/FCT, Rivers/PH, Kano, Ogun + other commercial centers.
- **Money:** company subscriptions (tiered) + deal commission + freemium. Phase 2: community voting. Trust engine: case studies from first 10–20 matches.

## 2. Design system (build first, reuse everywhere)

Build a token-driven system before any feature screens. This is what makes creator trust + enterprise defensibility visible.

- **Brand:** name "IDEACON", tagline "Idea + Connection". Logo + wordmark, favicon, OG image. Palette (v1.1 Bright): bright azure primary (#0F62FE family), teal freshness (#00C2A8), coral creator energy (#FF5C38), ink text (#0A2540); airy tints for surfaces; semantic mint/sun/violet for score/review/NDA states.
- **Tokens:** color, spacing (4pt grid), radius, shadow, motion (150/250ms), breakpoints (360/768/1024/1440), z-scale. Store as CSS variables + Tailwind theme; single source of truth.
- **Typography:** Sora for display/marketing/teasers; Plus Jakarta Sans for app UI (system fallback offline). Scale: 12/14/16/20/24/32/40. Line-height + tracking rules. Multilingual-ready (English first; Hausa/Yoruba/Igbo labels later without reflow).
- **Components (app + marketing share these):** Button (5 variants × 3 sizes + loading), Input/Textarea/Select/Combobox, File upload (drawings, prototypes, PDFs), Idea Teaser Card (niche, uniqueness badge, stage, score band — NEVER full detail), Filter bar, Score badge, Review queue row, NDA gate modal, Deal timeline, Empty states, Auth pages, Onboarding wizard (creator vs company), Dashboard shells, Data table with audit trail, Toasts, Command-K search.
- **Patterns:** teased-vs-full disclosure rule enforced in UI (full text/files render ONLY behind NDA gate); every score shows "why" (band + factors, not raw model output); every deal step timestamped visibly (proof-of-origin UX).
- **Accessibility + low-bandwidth:** WCAG 2.2 AA contrast/keyboard/focus; works on 3G, small Android screens common in Nigeria; image lazy-load + compressed uploads; offline-tolerant forms (draft autosave).
- **Deliverable:** Storybook (or equivalent) with all components + teaser-card redaction test.

## 3. Architecture decisions (ADRs to lock in Phase 0)

**Locked stack (no Supabase, no Vercel):**
- Web app: TypeScript + Next.js (App Router, standalone output) + Tailwind + shadcn-style component library. One codebase serves marketing, creator app, company app, admin console via route groups + role guards.
- API: Next.js Route Handlers / server actions for MVP; extract to NestJS/Fastify service only when review/AI throughput demands it.
- DB: PostgreSQL running on the local device (official Postgres install or Docker Compose service) + Prisma. `pgvector` extension enabled on the local instance for idea similarity/matching from day one. Nightly `pg_dump` backups to Cloudflare R2.
- Files: Cloudflare R2 (S3-compatible API, private bucket; presigned URLs with short TTL; full-detail files NEVER public). Workers not required in MVP.
- Auth: Better Auth (email/password + email OTP + Google OAuth; phone-OTP/SMS via Termii/Africa's Talking added as a Better Auth custom flow for Nigerian numbers); roles: creator, company_member, reviewer, broker/admin, university_partner. Separate onboarding flows per PRD §4.5. Session tables live in the same local Postgres.
- Search: Postgres full-text first; add Typesense/Meilisearch (self-hosted via Docker) when idea volume > ~10k.
- AI scoring: async worker on the same device (BullMQ + local Redis via Docker, or Trigger.dev self-hosted later) calling LLM + embeddings; stores band + factor breakdown + model version; human review board always overrides. Keep prompts versioned.
- Jobs/queues: idea scoring, PDF/thumbnail generation, NDA reminders, digest emails.
- Audit/proof-of-origin: append-only `events` table (hash-chained: each row stores hash of previous) + UTC timestamps; exportable evidence pack per idea.
- NDA/e-sign: template engine (license / revenue-share / advisory) + click-to-sign + PDF artifact stored in R2; sign event in audit trail. External e-sign (DocuSign/HelloSign) only if Nigerian counsel requires it.
- Billing: Paystack/Flutterwave (NGN, bank transfer, mobile money) first + Stripe (international cards). Subscriptions = tiered company access; commissions tracked as deal ledger entries, invoiced manually in MVP.
- Notifications: email via Resend + SMS (Termii/Africa's Talking) + in-app inbox. No direct creator↔company chat — broker-mediated threads only (§4.6).
- Hosting: self-hosted on the local device — Docker Compose (app + Postgres + Redis), Caddy/Nginx reverse proxy with automatic HTTPS (Cloudflare Tunnel or direct), `next start` standalone server. No Vercel, no Supabase. Preview envs = extra Compose profiles on the same box. Backups: nightly Postgres dumps + R2 sync.
- Analytics: PostHog self-hosted (Docker) or PostHog Cloud (funnels: submit→review→match→NDA→deal; case-study inputs).
- i18n: next-intl scaffold; English only in MVP.

**Key ADRs:**
1. Monolith-first (Next.js + Postgres); split services only on measured pain.
2. Teaser/full split is a DATA rule, not just UI hiding — API never returns full detail without valid NDA grant (enforced server-side + tests).
3. Scores are advisory bands; reviewers decide. Every automated score is versioned + explainable.
4. Hash-chained audit log for origin/NDA/deal events — the legal backbone (§9).
5. Nigeria-first ops (NGN billing, SMS OTP, low-bandwidth) with global-ready schema (country/state, currency, jurisdiction fields from day one).

## 4. Data model (MVP tables)

- `users`, `creator_profiles` (persona type, verification level), `company_profiles` + `company_members` (role: founder/rd_lead/pm), `university_partners` + `ambassadors`.
- `ideas` (title, teaser, FULL detail redacted by policy, niche, problem_type, stage, status: draft→submitted→in_review→scored→approved/flagged→matched→under_nda→deal→closed).
- `idea_files` (private, signed-URL only), `idea_embeddings` (pgvector).
- `reviews` (reviewer, rubric scores, verdict, version), `ai_scores` (originality/feasibility/market_fit bands + factors + model_version).
- `matches` (idea↔company fit, source: ai/manual/curated, broker notes), `nda_grants` (template version, signed PDF, expiry), `deals` (template: licensing/revenue_share/advisory/custom; ledger entries, status), `deal_messages` (broker-mediated only).
- `subscriptions` (tier, seats, filters), `events` (audit chain), `case_studies`.

## 5. Phased delivery

### Phase 0 — Foundations (wk 1–2)
Goals: repo hygiene, design tokens live, auth + roles, audit spine.
- Monorepo scaffold, CI (lint/type/test), preview envs, error tracking, analytics.
- Design tokens + 15 core components in Storybook; teaser-card redaction test.
- Auth via Better Auth (email/password + OTP/Google), creator vs company onboarding wizards, RBAC guards.
- `events` audit chain + idea status machine skeleton.
- Exit: deployable shell; reviewer can sign in as each role; audit event per action.

### Phase 1 — MVP: trusted submission→deal loop (wk 3–8)
Goals: first 10–20 brokered matches; case-study engine on.
- Submission wizard (teaser + full + files; autosave; student/university tag).
- Teaser catalog with filters (niche/problem/stage) — full detail NEVER leaks (server tests).
- Reviewer console: queue, rubric, approve/flag/request-changes; AI score panel (bands + factors).
- AI worker v1: embeddings + 3-band scoring + similar-idea retrieval (pgvector).
- Company workspace: saved searches, request-access → broker queue.
- NDA gate: template select → sign → time-boxed grant → signed PDF.
- Broker console: match suggestions (AI + manual), mediated thread, deal created from 3 templates, timeline.
- Billing v0: free tier + manual invoicing for subs/commission; Paystack/Flutterwave NGN path wired.
- Admin: user verification, university partners, case-study publisher.
- Exit: 20 seeded test ideas across 4 niches; full loop demoable; evidence pack exportable.

### Phase 2 — Matching + monetization (wk 9–14)
Goals: density in Nigeria; repeatable deal flow.
- Match engine v2: role-aware ranking (founder wants speed/edge; R&D wants defensibility docs; PM wants gap-fit brief) + digest emails.
- Subscription tiers + seat enforcement + commission ledger + invoices.
- University portal: bulk intake, ambassador tracking, hackathon import.
- Trust pages: case studies, idea diversity stats, partner logos.
- Exit: paying company pilot in ≥2 states; ≥10 brokered NDAs; pricing validated.

### Phase 3 — Scale + community (later)
Community voting (Phase 2 per PRD) with anti-gaming (verified actions only, rate limits, reviewer weighting); mobile PWA polish; advanced analytics; external e-sign if counsel demands; multi-currency expansion.

### Phase 4 — Enterprise/global hardening
SSO/SAML, DPA/SOC2 posture, jurisdiction packs (2–3 legal regimes before marketing them), data residency options, public API.

## 6. Non-functionals (must-haves, not nice-to-haves)

- Security: RBAC + NDA-grant checks on every full-detail read (tested); private files via signed URLs (short TTL); PII minimization; secrets in env; rate limits; NDPR (Nigeria Data Protection Regulation) compliance.
- Legal: NDA + 3 deal templates reviewed by Nigerian counsel pre-launch; proof-of-origin export; jurisdiction field on every deal (open Q §8 → decided per deal until packs ship).
- Quality: type-safe E2E (submit→review→NDA→deal), redaction tests, accessibility audit, 3G performance budget (<200KB critical JS, image caps).
- Ops: runbooks for review throughput (open Q: board + AI capacity → measure ideas/day in Phase 1, hire/scale rule set before Phase 2).

## 7. Open questions → plan answers

- Scoring rubric → v1 rubric in Phase 1 reviewer console; versioned, tuned from first 50 reviews.
- Pricing tiers → validate in Phase 2 pilot; keep 2–3 tiers + freemium.
- Throughput → instrument in Phase 1; don't promise SLA until measured.
- Jurisdictions → per-deal jurisdiction now; packs for NG + 2 others in Phase 4.
- Voting anti-gaming → deferred to Phase 3 with verified-action gating.

## 8. Milestones

- M0 (wk2): shell + design system live. M1 (wk8): MVP loop + evidence pack. M2 (wk14): paid pilots + 10 NDAs. Success = first published case studies, not raw idea count.
- Shipped log: Phase 0 shell → Phase 1 deal loop → Phase 2 monetization → Phase 3 community/scale → Phase 4 enterprise/API → Phase 5 pilot gate → Phase 6 workspace completion. All milestones built; pilot pilots + NDAs are people work, not code.
