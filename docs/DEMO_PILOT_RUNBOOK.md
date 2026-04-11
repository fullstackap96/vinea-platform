# Vinea Platform — Demo & pilot runbook

Operational checklist for **repeatable demos** and **early pilot** environments. All fictional data lives in `supabase/seed_demo.sql`. For the spoken walkthrough, see [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

---

## 1. What you are preparing

| Item | Purpose |
|------|---------|
| Supabase project | Database + Auth for the app |
| Next.js app (local or hosted) | UI; must point at that Supabase project |
| `seed_demo.sql` | Three fixed demo requests (baptism, funeral, wedding) + checklists + sample communications |
| `NEXT_PUBLIC_DEMO_SITE=1` | Shows the **Demo Environment** banner on staff dashboard pages |
| Staff user | Supabase Auth email/password user who can sign in at `/login` |

---

## 2. Environment variables (names only)

**Required for core demo (dashboard + intake + DB)**

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase client |

**Optional — enable only if you will demo that capability live**

| Variable | Used for |
|----------|----------|
| `OPENAI_API_KEY` | `/api/ai/summary` and `/api/ai/reply` (Generate AI Summary / Reply Draft) |
| `RESEND_API_KEY` | Outbound email (`/api/email/send`) |
| `RESEND_FROM_EMAIL` | From address for Resend |
| `GOOGLE_CALENDAR_ID` | Target calendar for sync |
| `GOOGLE_CLIENT_ID` | OAuth (calendar API) |
| `GOOGLE_CLIENT_SECRET` | OAuth |
| `GOOGLE_REFRESH_TOKEN` | Long-lived access for server-side calendar calls |

**Demo presentation**

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_DEMO_SITE` | Set to `1` to show demo banner on `/dashboard` and nested routes |

---

## 3. Prep steps (do in order)

### 3.1 Database schema

Ensure your Supabase database has all tables and columns the app expects (`parishioners`, `requests`, `checklist_items`, `request_communications`, `funeral_request_details`, `wedding_request_details`, etc.). The seed file assumes these exist. Apply any project migrations or SQL you maintain **before** seeding.

### 3.2 Load demo seed data

1. Open the **Supabase SQL Editor** (or any privileged SQL client against the same database).
2. Paste and run the full contents of **`supabase/seed_demo.sql`** in one transaction.

The script is **re-runnable**: it deletes prior rows tied to the fixed demo UUIDs, then inserts fresh rows. Safe to run again after a demo to reset checklists and timestamps relative to `now()`.

3. Confirm in **Table Editor** (or SQL): three rows in `requests` with IDs ending in `…2001`, `…2002`, `…2003` (full UUIDs in [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)).

### 3.3 Staff login

1. In Supabase: **Authentication → Users → Add user** (or invite flow you prefer).
2. Use an email and password you control for live demos.
3. Ensure **Row Level Security** and policies (if any) allow this user to read/write the demo rows your app needs. If the pilot uses a fresh project with permissive policies for staff, document that explicitly for security reviews.

**Dry-run:** Open `/login`, sign in, confirm redirect to `/dashboard` and that the three demo requests appear.

### 3.4 App configuration

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (local) or your host’s environment (deployed).
2. For demo **presentations**, set `NEXT_PUBLIC_DEMO_SITE=1`.
3. Restart the Next.js process after env changes.

### 3.5 Optional integration checks (before promising them in the room)

| Capability | Quick check |
|------------|-------------|
| **OpenAI** | On a request detail page, click **Generate AI Summary** once; expect text, not an error. If this fails, demo using pre-seeded `ai_summary` / `reply_draft` only (baptism seed includes a reply draft). |
| **Email send** | Only test if `RESEND_*` is set and **from/to** are allowed. Prefer **not** sending real mail during a prospect call unless intentional. |
| **Google Calendar** | Only expand this part of the demo if OAuth env vars and calendar ID are verified in a non-production calendar. |

---

## 4. Right before the demo (5 minutes)

- [ ] Incognito/private window (clean session) **or** staff browser logged out, then log in fresh.
- [ ] Run `seed_demo.sql` again if a previous session changed data you care about (checklist toggles, notes, etc.).
- [ ] Confirm demo banner visible if `NEXT_PUBLIC_DEMO_SITE=1`.
- [ ] Close unrelated tabs; silence notifications.
- [ ] Open [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) on a second screen or printout.

---

## 5. After the demo

- **Reset:** Re-run `seed_demo.sql` if you want canonical data back.
- **Pilots:** Agree whether the parish gets a **dedicated** Supabase project or a shared demo project; document data ownership and who can sign in.

---

## 6. Related docs

- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — 10–15 minute scripted walkthrough and deep links.
- [project-status.md](../project-status.md) — current routes, features, and known limitations.
