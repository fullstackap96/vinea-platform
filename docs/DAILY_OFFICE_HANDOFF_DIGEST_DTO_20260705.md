# Daily Office Handoff Digest DTO - 2026-07-05

Status: `IMPLEMENTED - READ-ONLY NON-RUNTIME DTO FOUNDATION`

Completion marker: `DAILY_OFFICE_HANDOFF_DIGEST_DTO_IMPLEMENTED_20260705`

This slice adds a read-only Daily Office Handoff Digest DTO that turns existing Parish Health Score and Operational Intelligence signals into a simple parish-office rhythm:

- Opening the office.
- Midday check-in.
- Before closing.

The digest does not send communications, enable reminders, mutate records, merge duplicates, generate certificates, run exports, call AI, access storage, create signed URLs, apply migrations, change operational RLS, access production, or make public trust claims.

## Why This Exists

Parish staff do not need another abstract dashboard. They need a gentle daily rhythm that says what to check first, what can wait until midday, and what should be tidied before the office closes.

This DTO is intentionally non-runtime and read-only. It prepares a future UI surface without adding automation, persistence, notifications, outbound communication, or record changes.

## Source Inputs

| Input | Use |
|---|---|
| Parish Health Score factors | Converts visible risks like ownership gaps, overdue follow-ups, records continuity, duplicate review, and certificate-ready review into handoff items |
| Operational Intelligence insights | Adds practical bottleneck guidance such as request type slowdowns, follow-up reliability, workload balance, and records/documents |

## Output Shape

The digest returns:

- `title`: `Daily office handoff`.
- `headline`: plain-English summary of visible staff-reviewed handoff items.
- `subline`: urgent-item guidance or calm steady-state guidance.
- `slots`: three ordered review moments.
- `coverageNotes`: read-only, staff-reviewed, no-automation, no-record-mutation, Catholic-records boundary language.

Each handoff item includes:

- `phase`.
- `priority`.
- `title`.
- `detail`.
- `staffAction`.
- `source`.
- optional `href`.

## Staff-Facing Boundaries

- Staff decide the next step.
- The digest is not a reminder delivery system.
- The digest is not a certificate issuance workflow.
- The digest is not a sacramental, canonical, pastoral, or eligibility decision.
- The digest does not link records, merge duplicates, send emails/SMS, call AI, run exports, access storage, create signed URLs, or mutate records.

## Implementation Files

- DTO helper: `lib/dailyOfficeHandoffDigest.ts`
- Focused tests: `lib/dailyOfficeHandoffDigest.test.ts`
- Source/docs validation: `lib/server/dailyOfficeHandoffDigestSource.test.ts`
- Build status: `docs/VINEA_BUILD_STATUS.md`
- Roadmap: `docs/VINEA_ROADMAP.md`
- SSoT: `docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md`

## Future UI Acceptance Criteria

A future dashboard UI implementation should be separately approved or selected as a safe runtime UI slice. It should:

- Render the three slots in plain parish-office language.
- Keep empty states visible when each slot has no handoff items.
- Preserve active-parish scoping through the existing Parish Health Score and Operational Intelligence source loaders.
- Never add send buttons, export controls, certificate generation, automatic record linking, or AI actions to the digest.
- Link only to existing staff-reviewed queues.
- Stay readable for front-desk and parish secretary users.

## Production Boundary

This DTO can support internal product development and future non-production UI testing. It does not create a production-sensitive gate, approval, or claim. Production-sensitive features remain NO-GO unless separately approved through their existing packets.
