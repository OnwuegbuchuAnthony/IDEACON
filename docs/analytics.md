# Analytics (Umami, self-hosted)

Cookie-free, no third-party calls. The tracker (`lib/analytics.tsx`) loads
only `afterInteractive` and renders nothing until both public vars are set:

- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` — e.g. `http://localhost:3001/script.js`
  (production: your Umami origin + `/script.js`)
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — from the Umami dashboard after adding the site

## Run it (local device, per stack)

```bash
export UMAMI_DB_PASSWORD="$(openssl rand -hex 24)"
export UMAMI_APP_SECRET="$(openssl rand -hex 32)"
docker compose up -d umami-db umami   # dashboard at http://localhost:3001
```

Default login is `admin` / `umami` — change it immediately. Add website
`ideacon`, copy the Website ID + script URL into `.env.local`, restart the app.

## Events

Pageviews are automatic. Custom events via `trackEvent(name, data)`:

| Event | When | Properties (never personal data) |
|---|---|---|
| `hero_cta_click` | Hero "Get started" pressed | — |
| `role_selected` | Role picked in hero chooser | `role`: creator \| company \| student |
| `waitlist_submit` | Waitlist join succeeds | `variant`: compact \| full \| student |
| `faq_opened` | FAQ accordion opened | `index`: question position |

Rules: no emails, names, IPs, or free text in properties. Role/variant/index
describe the UI, never the person.
