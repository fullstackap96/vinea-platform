# Membership-Aware Operational RLS Production Human Intake Checklist - 2026-06-29

Status: Human-fillable checklist prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, and no secrets were exposed while preparing this checklist.

## Purpose

Use this checklist to collect the human-provided values needed before Vinea can review membership-aware operational RLS for a future production rollout.

This checklist is designed to be filled by a product owner or operator without exposing secrets. It does not approve production work. It only collects safe names, safe labels, and non-secret planning information.

## Before You Fill This Out

Do:

- Use real human names for owners.
- Use team names or channel names when helpful.
- Use safe labels for records, such as `Production RLS Smoke Request A`.
- Use redacted or generic identifiers when a raw id would be sensitive.
- Write `UNKNOWN` if a field is not ready.

Do not paste:

- Passwords.
- Database URLs or connection strings.
- Supabase service-role keys or anon keys.
- OAuth secrets, access tokens, refresh tokens, or authorization codes.
- OpenAI API keys.
- Raw family portal tokens or token hashes.
- Signed document URLs.
- Private document contents.
- Internal note bodies.
- AI prompts, raw AI outputs, or private AI audit payloads.
- Sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents.
- Google Calendar event ids, calendar ids, or real parish calendar data.

## Related Readiness Packet

- Readiness packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_PACKET_20260629.md`
- Capture form: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md`
- Blocker register: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md`

## Current Decision

Current decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`

This decision means the non-secret intake values are filled enough to ask for a separate explicit product-owner production approval prompt. It does not approve production work.

## Section 1 - Owner Roll Call

Fill this with names and safe contact paths. Do not include passwords, private phone numbers, personal email inbox contents, or private links.

| Required role | What to enter | Safe example format | Your value |
|---|---|---|---:|
| Product owner | Person who can approve or stop the production rollout | `Jane Doe - Product Owner - Slack #vinea-prod-rollout` | `Alex Perez - Product Owner` |
| Technical owner | Person responsible for migration commands, health checks, and rollback mechanics | `Name - Engineering - Slack #vinea-prod-rollout` | `Alex Perez - Technical Owner` |
| QA owner | Person responsible for production-safe smoke testing evidence | `Name - QA - Slack #vinea-prod-rollout` | `Alex Perez - QA Owner` |
| Security/data owner | Person responsible for cross-parish safety, privacy, and redaction approval | `Name - Security/Data - Slack #vinea-prod-rollout` | `Alex Perez - Security/Data Owner` |
| Rollback owner | Person available to decide and execute rollback if needed | `Name - Engineering - available during rollout window` | `Alex Perez - Rollback Owner - available during rollout window` |
| Monitoring owner | Person watching health, auth, storage, family portal, and error signals | `Name - Monitoring - channel label only` | `Alex Perez - Monitoring Owner` |
| Support owner | Person responsible for support/customer communication escalation | `Name - Support - escalation channel label only` | `Alex Perez - Support Owner` |
| Evidence storage owner | Person responsible for storing and redacting rollout evidence | `Name - Evidence owner - folder label only` | `Alex Perez - Evidence Owner` |

Owner roll call status: `COMPLETE`

## Section 2 - Safe Smoke Fixtures

Use safe labels only. Do not paste passwords, raw tokens, signed URLs, private document contents, or sensitive parishioner details.

| Fixture | What to enter | Safe example format | Your value |
|---|---|---|---:|
| Staff account | Safe label for the staff user used in smoke testing | `Production RLS Smoke Staff Account - no password recorded` | `Production RLS Smoke Staff Account - no password recorded` |
| Active parish | Safe label for the parish intentionally selected during smoke testing | `Production RLS Smoke Parish A` | `Production RLS Smoke Parish A` |
| Active parish id | Record only if safe; otherwise write `REDACTED` | `REDACTED` or `safe internal id approved by security/data owner` | `REDACTED` |
| Cross-parish denial parish or substitute | Safe label for the parish/request that should be denied, or a documented substitute if not available | `Production RLS Denial Parish B` | `Production RLS Denial Parish B` |
| Same-parish request | Safe label for a same-parish request that is non-sensitive and reversible | `Production RLS Smoke Request A - non-sensitive` | `Production RLS Smoke Request A - non-sensitive` |
| Cross-parish denied request | Safe label for the request that should return generic denied/not-found behavior | `Production RLS Denied Request B - generic denial expected` | `Production RLS Denied Request B - generic denial expected` |
| Workflow step | Safe label for a workflow step tied to the same-parish request | `Production RLS Smoke Workflow Step - document safe` | `Production RLS Smoke Workflow Step - document safe` |
| Staff test document | Synthetic staff-facing document label | `Vinea production RLS smoke test staff document - synthetic file only` | `Vinea production RLS smoke test staff document - synthetic file only` |
| Family test document | Synthetic family-facing document label | `Vinea production RLS smoke test family document - synthetic file only` | `Vinea production RLS smoke test family document - synthetic file only` |
| Family portal token plan | Plan for creating/deactivating a token without recording the raw token | `Create during smoke window; do not record raw token; deactivate immediately after smoke` | `Create during smoke window; do not record raw token; deactivate immediately after smoke` |
| Cleanup plan | How test documents, token, and any changed request state will be cleaned up | `Delete synthetic docs, deactivate token, restore request status if changed` | `Delete synthetic docs, deactivate token, restore request status if changed` |

Safe smoke fixture status: `COMPLETE`

## Section 3 - Rollout Window And Rollback

Fill this only with non-secret scheduling and ownership information.

| Field | What to enter | Safe example format | Your value |
|---|---|---|---:|
| Proposed production rollout window | Low-traffic date/time window | `YYYY-MM-DD 8:00-8:30 PM Central` | `2026-07-01 8:00-8:30 PM Central` |
| Rollback decision deadline | Latest time to decide rollback during the window | `YYYY-MM-DD 8:20 PM Central` | `2026-07-01 8:20 PM Central` |
| Rollback owner availability | Confirmation rollback owner is reachable and ready | `Confirmed by named rollback owner` | `Alex Perez confirmed available during rollout window` |
| Monitoring channel | Safe label for where monitoring observations will be recorded | `Slack #vinea-prod-rollout` | `Local Codex session and Vercel/Supabase dashboards` |
| Support escalation path | Safe label for escalation flow | `Support owner -> technical owner -> security/data owner` | `Alex Perez reviews issues and pauses rollout if needed` |
| Evidence storage location | Safe label only; avoid private links if unsafe | `Vinea Production RLS Evidence Folder - restricted` | `Vinea Production RLS Evidence Folder - restricted` |

Rollout and rollback status: `COMPLETE`

## Section 4 - Product Owner Final Approval Prompt

After every field above is complete and reviewed, the product owner must provide a separate explicit approval prompt. Do not use this checklist as the approval.

Required final approval prompt must name:

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

Final approval prompt status: `REQUIRED_SEPARATELY`

## Section 5 - Completion Review

| Review item | Required value before final go/no-go review | Current value |
|---|---:|---:|
| Every owner field is filled with a real human owner or approved owner group | `YES` | `YES` |
| Every fixture field is filled with a safe label or approved redacted value | `YES` | `YES` |
| No secrets or private parish data are present | `YES` | `YES` |
| Rollout window is selected | `YES` | `YES` |
| Rollback owner and deadline are selected | `YES` | `YES` |
| Monitoring owner/channel is selected | `YES` | `YES` |
| Support owner/escalation path is selected | `YES` | `YES` |
| Evidence storage owner/location is selected | `YES` | `YES` |
| Product owner final approval prompt has been provided separately | `YES` | `NO - REQUIRED SEPARATELY` |

Checklist decision: `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`

## What Changed Plain English

This checklist is the simple version of the production RLS readiness packet. It now has safe owner names, safe fixture labels, rollout timing, rollback timing, monitoring notes, support notes, and evidence-storage notes. It still does not approve production work. Production remains blocked until the product owner provides a separate explicit production approval prompt.
