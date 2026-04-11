# Vinea Platform — Scripted demo (10–15 minutes)

Use this script with the **seeded demo data** from `supabase/seed_demo.sql`. All names, emails, and phone numbers are **fictional** (`example.com`, sample content).

**Replace `{ORIGIN}`** with your app base URL (e.g. `https://demo.vinea.example` or `http://localhost:3000`).

---

## Seeded request IDs and deep links

Use these UUIDs in URLs and when searching the dashboard.

| Workflow | Request ID (UUID) | Request detail URL |
|----------|-------------------|---------------------|
| **Baptism** | `20202020-2020-4020-8020-202020202001` | `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202001` |
| **Funeral** | `20202020-2020-4020-8020-202020202002` | `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202002` |
| **Wedding** | `20202020-2020-4020-8020-202020202003` | `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202003` |

**Copy-paste paths (relative):**

```text
/dashboard/requests/20202020-2020-4020-8020-202020202001   # Baptism — Lucia Marie O'Brien / contact Margaret O'Brien
/dashboard/requests/20202020-2020-4020-8020-202020202002   # Funeral — Helen Rosa Martinez / contact James Martinez
/dashboard/requests/20202020-2020-4020-8020-202020202003   # Wedding — Elena Kowalski & Thomas Brennan
```

> **Verify URLs:** each path must use the **full** UUID above (all four blocks, e.g. wedding ends in `…202020202003`). A single typo triggers “Request not found.”

**Dashboard list:** `{ORIGIN}/dashboard`

**Public intake (optional end of demo):**

- `{ORIGIN}/baptism-request`
- `{ORIGIN}/funeral-request`
- `{ORIGIN}/wedding-request`

---

## Cast of characters (from seed)

| Request type | Parishioner / contact | Story hook (seeded) |
|--------------|------------------------|---------------------|
| Baptism | **Margaret O’Brien** — `margaret.obrien@example.com` | Child **Lucia Marie O’Brien**; suggested dates set; **no** confirmed baptism yet; **reply draft** already on file; stale contact; partial checklist |
| Funeral | **James Martinez** — `james.martinez@example.com` | Deceased **Helen Rosa Martinez**; status **new**; rich funeral detail rows; never contacted; urgent pastoral tone |
| Wedding | **Elena Kowalski** — `elena.kowalski@example.com` | Partner **Thomas Brennan**; proposed future wedding date; ceremony notes; phone + email comm history |

---

## Timing overview

| Segment | Time | Where |
|---------|------|--------|
| A. Opening + landing | ~1–2 min | `/` |
| B. Staff dashboard | ~2–3 min | `/dashboard` |
| C. Baptism request | ~4–5 min | baptism URL above |
| D. Funeral request | ~2–3 min | funeral URL above |
| E. Wedding request | ~2–3 min | wedding URL above |
| F. Optional intake | ~1–2 min | public form |

**Total:** ~12–18 minutes; trim segments B or F if you need a hard 15-minute stop.

---

## Segment A — Opening (~1–2 min)

**Navigate:** `{ORIGIN}/`

**Say (example):**

> “This is **Vinea Platform** — families use simple intake forms, and parish staff work from one dashboard for baptism, funeral, and wedding coordination. I’ll show you the staff view with realistic sample data, not a real parish.”

**Click:** Scroll the landing if needed; optionally click **Staff sign in** when you transition to the product (or go straight to `/login`).

**Avoid:** Do not submit real PII on public forms during the opener unless this is a dedicated sandbox.

---

## Segment B — Staff dashboard (~2–3 min)

**Navigate:** `{ORIGIN}/login` → sign in → `{ORIGIN}/dashboard`

**Say (example):**

> “After login, staff see every open request in one place. The queue highlights who needs a follow-up, a confirmed date or time, or checklist work — the same ideas apply across baptism, funeral, and wedding.”

**Click:**

- Point at the **Follow-Up Queue** (or equivalent summary) and name the three demo families without opening detail yet.
- Optionally change the **status filter** tabs (e.g. **New**, **In progress**) to show how work is segmented.

**Avoid:**

- Do not delete or merge data in Supabase during the call.
- Avoid mass-editing requests you are not showcasing unless you plan to re-run `seed_demo.sql` after.

---

## Segment C — Baptism request (~4–5 min)

**Navigate:** `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202001`

**Say (example):**

> “Here’s a baptism in progress. Margaret’s contact info is at the top; Lucia is the child. Staff already captured preferred timing and notes. You’ll see suggested dates, internal staff notes, and a draft reply the team can edit before sending.”

**Click (in suggested order):**

1. **Summary block** — Contact, email, phone, child, preferred dates, notes, status. Narrate “single record of truth.”
2. **Checklist** — Point out **Birth certificate** and **Godparent information** complete; **Prep class** and **Baptism date confirmed** still open.
3. **Suggested Dates** — Show the three datetime fields (seeded relative to `now()`).
4. **Confirmed Baptism Date** — Note it is **not** set yet (scheduling story).
5. **Communication** — Expand **Last contacted** / **Latest notes**; scroll **History** to show multiple logged touches (email entries in seed).
6. **Internal Staff Notes** — Read the first line as “how the team coordinates.”
7. **AI Tools** — If `OPENAI_API_KEY` is configured: click **Generate AI Summary** *or* **Generate Reply Draft** once, narrate speed. If **not** configured: **do not click**; instead scroll to show the pre-seeded **reply draft** conceptually (“we already have a draft on file for this demo”).
8. Optionally **Copy Reply Draft** if a draft is visible (clipboard is low risk).

**Avoid (live demo):**

- **Send email** — Only click if Resend is configured **and** you intend to send mail to a safe address. Otherwise say: “In pilot, this sends through your parish-configured provider.”
- **Google Calendar** — Do not create/update/delete events unless OAuth and calendar env are verified; wrong clicks leave orphan events or broken state.
- **Save** on suggested/confirmed dates unless you want to explain changed data and re-seed later.

---

## Segment D — Funeral request (~2–3 min)

**Navigate:** `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202002`

**Say (example):**

> “Funerals need a different tone and different fields. This request is still **new** — nobody has logged outreach yet, which is exactly the kind of item the queue surfaces.”

**Click:**

1. **Summary** — Deceased name **Helen Rosa Martinez**, date of death, funeral home / location, preferred service notes, confirmed service time **not set**.
2. **Funeral details** section — Briefly show editable fields (without saving unless you accept re-seeding).
3. **Checklist** — **Death certificate** complete; obituary, music, cemetery items open — “pastoral checklist, not a CRM bolt-on.”

**Avoid:**

- Do not rush through sensitive copy; keep tone respectful.
- Same as baptism: skip **Send email** and **Google Calendar** unless pre-checked.

---

## Segment E — Wedding request (~2–3 min)

**Navigate:** `{ORIGIN}/dashboard/requests/20202020-2020-4020-8020-202020202003`

**Say (example):**

> “Weddings pull partner names, a proposed date, and ceremony notes into the same request model — so reporting and follow-up stay consistent with baptism and funeral.”

**Click:**

1. **Summary** — Partners **Elena Kowalski** & **Thomas Brennan**, proposed date, ceremony notes, confirmed ceremony **not set**.
2. **Wedding details** — Glance at fields (save optional).
3. **Communication** — Show **History** with email + phone entries from seed.

**Avoid:** Calendar and email same as above.

---

## Segment F — Optional public intake (~1–2 min)

**Navigate:** `{ORIGIN}/baptism-request` (or funeral/wedding)

**Say (example):**

> “Families never see the dashboard — they see a branded form. Submissions appear as new requests for staff.”

**Click:** Scroll the form; **optionally** show validation on one field **without** submitting, **or** submit only in a throwaway environment.

**Avoid:** Do not submit real family data in a shared demo database.

---

## Quick “if something breaks” cheatsheet

| Symptom | Likely cause |
|---------|----------------|
| Request not found | Wrong UUID in URL (especially wedding `…2003`) |
| Empty dashboard | Seed not run, wrong Supabase project, or RLS blocking reads |
| AI buttons error | Missing or invalid `OPENAI_API_KEY` — fall back to pre-seeded text |
| No demo banner | `NEXT_PUBLIC_DEMO_SITE` not set to `1` or app not restarted |

---

## Prep cross-reference

Full environment and reset steps: [DEMO_PILOT_RUNBOOK.md](./DEMO_PILOT_RUNBOOK.md).
