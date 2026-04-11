# Vinea Platform

**Vinea Platform** is a Next.js application for parish **Parish Operations**: families submit baptism, funeral, and wedding requests through public intake forms; staff manage follow-up, scheduling, checklists, communications, AI-assisted drafts, and optional Google Calendar sync from a protected dashboard.

Product naming and default site metadata live in `lib/productBranding.ts`.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | 10–15 minute scripted walkthrough (seeded demo requests) |
| [docs/DEMO_PILOT_RUNBOOK.md](docs/DEMO_PILOT_RUNBOOK.md) | Environment prep, seed data, optional integrations |
| [project-status.md](project-status.md) | Routes, data model overview, env var names, known limitations |

## Prerequisites

- Node.js compatible with the version pinned for this repo (see `package.json` engines if present)
- A [Supabase](https://supabase.com) project with schema matching the app (tables for parishioners, requests, checklists, communications, funeral/wedding detail tables as used in code)
- Environment variables configured (names only — see **project-status.md** or **docs/DEMO_PILOT_RUNBOOK.md**)

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page. Staff routes require sign-in at `/login`.

## Demo data

Re-runnable SQL seed with three fixed requests (baptism, funeral, wedding): **`supabase/seed_demo.sql`**. Run it in the Supabase SQL Editor (or equivalent) against the same database the app uses. Deep links and a presenter script are in **docs/DEMO_SCRIPT.md**.

## License / contribution

Add your organization’s license and contribution guidelines here if this repository is published or shared externally.
