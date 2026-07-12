# Membership-Aware Operational RLS Production Readiness Packet - 2026-06-29

Status: Prepared with non-secret owner and fixture placeholders only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, and no secrets were exposed while preparing this packet.

## Purpose

This packet uses `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md` to assemble the remaining production-readiness inputs for membership-aware operational RLS.

It is not production approval. It is a safe, non-secret packet showing exactly what still must be filled by humans before the final go/no-go review can happen.

## Source Capture Form

- Capture form: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md`
- Final go/no-go checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- Blocker register: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Smoke fixture worksheet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md`

## Current Decision

Current decision: `NO_GO_PENDING_HUMAN_OWNER_NAMES_AND_FIXTURE_SELECTION`

This packet must not be used to apply production RLS. Human owner names, production-safe fixture selections, rollout window, monitoring owner/channel, support owner, rollback owner, evidence storage owner, and explicit product-owner approval are still missing.

## Non-Secret Owner Packet

The owner slots below are intentionally filled with non-secret placeholders. Replace each placeholder with a real human name and contact path only after the product owner provides those values.

| Role | Named owner placeholder | Backup/contact path placeholder | Required approval evidence | Current decision |
|---|---|---|---|---:|
| Product owner | `PROVIDE_PRODUCT_OWNER_NAME` | `PROVIDE_PRODUCT_OWNER_BACKUP_OR_CHANNEL` | Final readiness record, blocker register, fixture plan, explicit approval prompt | `REQUIRES_HUMAN_CONFIRMATION` |
| Technical owner | `PROVIDE_TECHNICAL_OWNER_NAME` | `PROVIDE_TECHNICAL_OWNER_BACKUP_OR_CHANNEL` | Forward migration, rollback draft, command sequence, health checks | `REQUIRES_HUMAN_CONFIRMATION` |
| QA owner | `PROVIDE_QA_OWNER_NAME` | `PROVIDE_QA_OWNER_BACKUP_OR_CHANNEL` | Disposable QA, shared QA, route/browser QA, production smoke plan | `REQUIRES_HUMAN_CONFIRMATION` |
| Security/data owner | `PROVIDE_SECURITY_DATA_OWNER_NAME` | `PROVIDE_SECURITY_DATA_OWNER_BACKUP_OR_CHANNEL` | Cross-parish denial, document privacy, family portal safety, redaction rules | `REQUIRES_HUMAN_CONFIRMATION` |
| Rollback owner | `PROVIDE_ROLLBACK_OWNER_NAME` | `PROVIDE_ROLLBACK_OWNER_BACKUP_OR_CHANNEL` | Rollback SQL, rollback deadline, rollback verification | `REQUIRES_HUMAN_CONFIRMATION` |
| Monitoring owner | `PROVIDE_MONITORING_OWNER_NAME` | `PROVIDE_MONITORING_CHANNEL_AND_BACKUP` | Health, auth, 403/404, storage, family portal, support signals | `REQUIRES_HUMAN_CONFIRMATION` |
| Support owner | `PROVIDE_SUPPORT_OWNER_NAME` | `PROVIDE_SUPPORT_OWNER_BACKUP_OR_CHANNEL` | Support note, escalation path, customer communication boundaries | `REQUIRES_HUMAN_CONFIRMATION` |
| Evidence storage owner | `PROVIDE_EVIDENCE_STORAGE_OWNER_NAME` | `PROVIDE_EVIDENCE_STORAGE_BACKUP_OR_CHANNEL` | Storage location, redaction rules, retention expectations | `REQUIRES_HUMAN_CONFIRMATION` |

## Non-Secret Fixture Packet

The fixture placeholders below are labels only. Do not paste production credentials, raw ids, raw tokens, signed URLs, private document content, or sensitive parishioner data.

| Fixture | Production-safe placeholder | Required safety check | Cleanup/deactivation placeholder | Current decision |
|---|---|---|---|---:|
| Staff account | `PROVIDE_SAFE_STAFF_ACCOUNT_LABEL_NO_PASSWORD` | Staff belongs to active parish by membership and has least privilege for smoke | `PROVIDE_STAFF_ACCOUNT_RESTORE_OR_DEACTIVATION_PLAN` | `REQUIRES_HUMAN_CONFIRMATION` |
| Active parish | `PROVIDE_ACTIVE_PARISH_SAFE_LABEL` | Parish is intentionally selected and safe for smoke evidence | `NO_DATA_MUTATION_EXPECTED` | `REQUIRES_HUMAN_CONFIRMATION` |
| Active parish id | `PROVIDE_ACTIVE_PARISH_ID_ONLY_IF_SAFE_TO_RECORD` | Id can be redacted or safely stored in evidence | `NO_DATA_MUTATION_EXPECTED` | `REQUIRES_HUMAN_CONFIRMATION` |
| Cross-parish denial parish or substitute | `PROVIDE_DENIAL_PARISH_SAFE_LABEL_OR_DOCUMENTED_SUBSTITUTE` | Staff must not be authorized for denied parish | `NO_DATA_MUTATION_EXPECTED` | `REQUIRES_HUMAN_CONFIRMATION` |
| Same-parish request | `PROVIDE_SAFE_SAME_PARISH_REQUEST_LABEL` | Request is non-sensitive, non-funeral, non-canonical, reversible, and clearly test-safe | `PROVIDE_REQUEST_RESTORE_PLAN` | `REQUIRES_HUMAN_CONFIRMATION` |
| Cross-parish denied request | `PROVIDE_SAFE_CROSS_PARISH_DENIED_REQUEST_LABEL` | Denial result must be generic and must not reveal private data | `NO_DATA_MUTATION_EXPECTED` | `REQUIRES_HUMAN_CONFIRMATION` |
| Workflow step | `PROVIDE_SAFE_WORKFLOW_STEP_LABEL` | Step belongs to same-parish request and can accept synthetic document smoke | `PROVIDE_STEP_RESTORE_PLAN_IF_CHANGED` | `REQUIRES_HUMAN_CONFIRMATION` |
| Staff test document | `Vinea production RLS smoke test staff document - synthetic file only` | No private document content; staff-only visibility verified | `PROVIDE_STAFF_DOCUMENT_DELETE_OR_RETAIN_DECISION` | `REQUIRES_HUMAN_CONFIRMATION` |
| Family test document | `Vinea production RLS smoke test family document - synthetic file only` | No private document content; family portal visibility scoped only to token request | `PROVIDE_FAMILY_DOCUMENT_DELETE_OR_RETAIN_DECISION` | `REQUIRES_HUMAN_CONFIRMATION` |
| Family portal token | `CREATE_DURING_APPROVED_SMOKE_WINDOW_DO_NOT_RECORD_RAW_TOKEN` | Token is generated only for safe same-parish request and not copied into evidence | `PROVIDE_TOKEN_DEACTIVATION_OR_EXPIRATION_PLAN` | `REQUIRES_HUMAN_CONFIRMATION` |
| Evidence redaction | `PROVIDE_REDACTION_OWNER_AND_RULES_CONFIRMATION` | Screenshots and outputs redact private data, secrets, ids when needed, and signed URLs | `PROVIDE_EVIDENCE_REDACTION_REVIEW_PLAN` | `REQUIRES_HUMAN_CONFIRMATION` |

## Rollout And Rollback Placeholders

| Field | Non-secret placeholder | Current decision |
|---|---|---:|
| Proposed rollout window | `PROVIDE_LOW_TRAFFIC_PRODUCTION_ROLLOUT_WINDOW` | `REQUIRES_HUMAN_CONFIRMATION` |
| Rollback decision deadline | `PROVIDE_ROLLBACK_DECISION_DEADLINE` | `REQUIRES_HUMAN_CONFIRMATION` |
| Rollback owner availability | `PROVIDE_ROLLBACK_OWNER_AVAILABILITY_CONFIRMATION` | `REQUIRES_HUMAN_CONFIRMATION` |
| Monitoring channel | `PROVIDE_MONITORING_CHANNEL_LABEL_NO_SECRET_WEBHOOKS` | `REQUIRES_HUMAN_CONFIRMATION` |
| Support escalation path | `PROVIDE_SUPPORT_ESCALATION_LABEL` | `REQUIRES_HUMAN_CONFIRMATION` |
| Evidence storage location | `PROVIDE_EVIDENCE_STORAGE_LOCATION_LABEL_NO_PRIVATE_LINK_IF_UNSAFE` | `REQUIRES_HUMAN_CONFIRMATION` |
| Production app host | `PROVIDE_PRODUCTION_APP_HOST_WITHOUT_CREDENTIALS` | `REQUIRES_HUMAN_CONFIRMATION` |
| Production database host | `PROVIDE_PRODUCTION_DATABASE_HOST_WITHOUT_CONNECTION_STRING` | `REQUIRES_HUMAN_CONFIRMATION` |

## Explicit Forbidden Content Confirmation

The following are intentionally absent from this packet:

- Passwords.
- Database URLs or connection strings.
- Supabase service-role keys or anon keys.
- OAuth client secrets, access tokens, refresh tokens, or authorization codes.
- OpenAI API keys.
- Raw family portal tokens or token hashes.
- Signed document URLs.
- Private document contents.
- Internal note bodies.
- AI prompts, raw AI outputs, or private AI audit payloads.
- Sensitive parishioner names, family names, phone numbers, emails, pastoral details, funeral details, canonical details, or real private documents.
- Google Calendar event ids, calendar ids, or real parish calendar data.

## Blocker Status

| Blocker | Current status | Resolution needed |
|---|---:|---|
| Human owners named | `BLOCKED` | Replace every `PROVIDE_*_OWNER_NAME` placeholder with a real human owner. |
| Owner backup/contact paths recorded | `BLOCKED` | Replace every backup/channel placeholder with a non-secret contact path. |
| Production-safe fixtures selected | `BLOCKED` | Replace fixture labels with approved safe production smoke labels. |
| Fixture safety approved | `BLOCKED` | Product, QA, and security/data owners must approve all fixture choices. |
| Rollout window selected | `BLOCKED` | Product, technical, rollback, monitoring, and support owners must approve the window. |
| Monitoring/support/evidence storage ready | `BLOCKED` | Named owners and safe locations/channels must be recorded. |
| Final explicit product-owner approval | `BLOCKED` | Product owner must provide a separate explicit production approval prompt. |

## Validation Result

Validation result: `PACKET_PREPARED_WITH_NON_SECRET_PLACEHOLDERS`

Production decision remains: `NO-GO`

This packet is ready for human completion, not execution.

## What Changed Plain English

This packet turns the blank production RLS capture form into a concrete readiness packet with safe placeholders. It shows exactly which people, test records, monitoring plans, rollback plans, and evidence locations still need to be filled in, without exposing passwords, tokens, private parish data, or sensitive records.
