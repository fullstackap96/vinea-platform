# Membership-Aware Operational RLS Production Human Intake Guided Worksheet - 2026-06-29

Status: Product-owner worksheet prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this worksheet.

## Purpose

Use this worksheet to fill `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` with safe, non-secret production readiness values.

This worksheet does not approve production work. It only helps the product owner gather the owner names, fixture labels, rollout details, rollback details, monitoring plan, support plan, and evidence plan needed before the validation gate can recommend asking for a separate production approval prompt.

## Absolute Safety Rules

Do not paste:

- Passwords.
- Database URLs or connection strings.
- Supabase service-role keys or anon keys.
- OAuth secrets, access tokens, refresh tokens, authorization codes, or Google Calendar ids.
- OpenAI API keys.
- Raw family portal tokens, token hashes, or signed document URLs.
- Private document contents, internal note bodies, AI prompts, AI outputs, or private audit payloads.
- Sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents.

Safe answers should use:

- Human names and role labels.
- Team or channel labels.
- Generic fixture labels.
- `REDACTED` when an id exists but should not be written into the checklist.
- `UNKNOWN` only when a value is genuinely not ready yet.

## Step 1 - Owner Roll Call Questions

Answer these with a person name or approved owner group plus a safe contact path.

| Checklist field | Plain-English question | Safe answer format |
|---|---|---:|
| Product owner | Who can approve or stop the production rollout? | `Name - Product Owner - safe channel label` |
| Technical owner | Who will run or supervise the migration, health checks, and rollback mechanics? | `Name - Engineering - safe channel label` |
| QA owner | Who will run and review the production-safe smoke tests? | `Name - QA - safe channel label` |
| Security/data owner | Who is responsible for privacy, redaction, and cross-parish safety approval? | `Name - Security/Data - safe channel label` |
| Rollback owner | Who can make and execute the rollback decision during the rollout window? | `Name - Engineering - available during rollout window` |
| Monitoring owner | Who will watch health, auth, storage, family portal, and error signals? | `Name - Monitoring - safe channel label` |
| Support owner | Who handles support or customer communication escalation? | `Name - Support - safe escalation label` |
| Evidence storage owner | Who stores and redacts rollout evidence? | `Name - Evidence owner - safe folder label` |

## Step 2 - Safe Smoke Fixture Questions

Answer these with safe labels only. Do not include passwords, raw tokens, private record ids, private names, real document contents, signed URLs, or sensitive parish details.

| Checklist field | Plain-English question | Safe answer format |
|---|---|---:|
| Staff account | Which staff account label will be used for smoke testing? | `Production RLS Smoke Staff Account - no password recorded` |
| Active parish | Which parish label should be selected during smoke testing? | `Production RLS Smoke Parish A` |
| Active parish id | Is the id safe to record? If not, use redaction. | `REDACTED` |
| Cross-parish denial parish or substitute | What safe parish/request label should prove cross-parish denial? | `Production RLS Denial Parish B` |
| Same-parish request | Which non-sensitive same-parish request label should load successfully? | `Production RLS Smoke Request A - non-sensitive` |
| Cross-parish denied request | Which request label should return generic denied/not-found behavior? | `Production RLS Denied Request B - generic denial expected` |
| Workflow step | Which workflow step label belongs to the same-parish request? | `Production RLS Smoke Workflow Step - safe label only` |
| Staff test document | What synthetic staff-facing document label should be used? | `Synthetic staff document - production RLS smoke only` |
| Family test document | What synthetic family-facing document label should be used? | `Synthetic family document - production RLS smoke only` |
| Family portal token plan | How will a portal token be created and cleaned up without recording it? | `Create during smoke window; do not record raw token; deactivate immediately after smoke` |
| Cleanup plan | How will documents, tokens, and changed request state be cleaned up? | `Delete synthetic docs, deactivate token, restore request state if changed` |

## Step 3 - Rollout, Rollback, Monitoring, Support, And Evidence Questions

Answer these with non-secret scheduling and ownership details.

| Checklist field | Plain-English question | Safe answer format |
|---|---|---:|
| Proposed production rollout window | What low-traffic date/time window is proposed? | `YYYY-MM-DD 8:00-8:30 PM Central` |
| Rollback decision deadline | What is the latest time rollback must be decided during the window? | `YYYY-MM-DD 8:20 PM Central` |
| Rollback owner availability | Has the rollback owner confirmed availability? | `Confirmed by named rollback owner` |
| Monitoring channel | Where will health/error observations be recorded? | `Safe monitoring channel label` |
| Support escalation path | What is the support escalation chain? | `Support owner -> technical owner -> security/data owner` |
| Evidence storage location | Where will redacted evidence be stored? | `Restricted evidence folder label only` |

## Step 4 - Final Approval Boundary

After the checklist is fully filled and passes validation, the product owner must still provide a separate final production approval prompt.

That approval prompt must include safe labels for:

- Production target app host without credentials.
- Production target database host without connection string.
- Production-intended commit or release label.
- Rollout window.
- Rollback owner.
- Monitoring owner/channel.
- Confirmation that public intake runtime routing remains out of scope unless separately approved.
- Confirmation that AI production flag enablement remains out of scope unless separately approved.
- Confirmation that Google Calendar data mutation remains out of scope unless separately approved.
- Confirmation that final readiness decision is `GO`.

## Copy-Paste Prompt For The Product Owner

Use this prompt when you are ready to fill the checklist. Replace bracketed placeholders with safe, non-secret values only.

```text
Fill docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md with the following non-secret production RLS owner and fixture values. Do not access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records, or expose secrets. Preserve any unknown value as UNKNOWN.

Owners:
- Product owner: [Name - role - safe channel label]
- Technical owner: [Name - role - safe channel label]
- QA owner: [Name - role - safe channel label]
- Security/data owner: [Name - role - safe channel label]
- Rollback owner: [Name - role - availability label]
- Monitoring owner: [Name - role - safe channel label]
- Support owner: [Name - role - safe escalation label]
- Evidence storage owner: [Name - role - safe folder label]

Safe smoke fixtures:
- Staff account label: [safe label, no password]
- Active parish label: [safe label]
- Active parish id: [REDACTED unless security/data owner approves writing a safe id]
- Cross-parish denial parish or substitute: [safe label]
- Same-parish request label: [safe label]
- Cross-parish denied request label: [safe label]
- Workflow step label: [safe label]
- Staff test document label: [synthetic document label only]
- Family test document label: [synthetic document label only]
- Family portal token plan: [do not record raw token; include deactivate plan]
- Cleanup plan: [safe cleanup steps]

Rollout and rollback:
- Proposed production rollout window: [date/time with timezone]
- Rollback decision deadline: [date/time with timezone]
- Rollback owner availability: [confirmed/not confirmed]
- Monitoring channel: [safe label]
- Support escalation path: [safe label]
- Evidence storage location: [safe folder label only]

After filling the checklist, validate it using docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md and keep production RLS NO-GO unless every required field is complete and a separate final product-owner approval prompt is provided.
```

## Current Validation Result

Validation source: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`

Validation gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md`

Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`

Reason:

- The source checklist now contains safe owner names, safe fixture labels, rollout timing, rollback timing, monitoring notes, support notes, and evidence-storage notes.
- The source checklist does not contain passwords, database URLs, service-role keys, raw portal tokens, token hashes, signed URLs, private document contents, or private parish data.
- Production remains blocked until the product owner provides a separate explicit production approval prompt.

Safety confirmation:

- Production was not accessed.
- No migrations were applied.
- Runtime behavior was not changed.
- Operational RLS was not changed.
- Google Calendar data was not touched.
- Records were not mutated.
- No secrets or private parish data were exposed.

## What Changed Plain English

This worksheet turns the formal production RLS checklist into simple questions. It tells you what kind of answer is safe, what must never be pasted, and what prompt to use when you are ready for Codex to fill the checklist from your non-secret values. The checklist now has safe planning values, but production is still not approved until the product owner gives a separate explicit production approval prompt.
