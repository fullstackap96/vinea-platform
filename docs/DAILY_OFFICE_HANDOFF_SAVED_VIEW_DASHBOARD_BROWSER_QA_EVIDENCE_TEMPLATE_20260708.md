# Daily Office Handoff Saved-View Dashboard Browser QA Evidence Template - 2026-07-08

Status: `PREPARED - SAFE NON-PRODUCTION BROWSER QA EVIDENCE TEMPLATE`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_EVIDENCE_TEMPLATE_PREPARED_20260708`

Source checklist: `docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md`

This template is for a future safe browser QA run of the Daily Office Handoff saved-view dashboard card. It is label-only and must not include secrets, raw database identifiers, raw private data, storage paths, signed URL values, original filenames, token material, raw audit metadata, or private document contents.

This template does not execute browser QA, does not access production, does not apply migrations, does not change operational RLS, does not mutate records, does not persist saved views, does not send communications, does not call AI, does not run exports, does not access storage, does not create signed URLs, does not generate certificates, does not enable automation, and does not make public trust claims.

## Evidence Header

- Evidence file completed by: `[FILL: evidence owner label only]`
- Date/time completed: `[FILL: date/time and timezone label only]`
- App target label: `[FILL: safe non-production app target label only]`
- Staff session label: `[FILL: safe authenticated staff session label only]`
- Active parish A label: `[FILL: authorized active parish A display label only]`
- Active parish B label: `[FILL: authorized active parish B display label only or NOT_AVAILABLE]`
- Optional no-cue fixture label: `[FILL: fixture parish/scenario label only or NOT_AVAILABLE]`
- Browser/session notes: `[FILL: label-only notes or NONE]`
- Production target used: `NO`
- Secrets captured: `NO`
- Raw IDs captured: `NO`
- Raw private data captured: `NO`

## Preflight Evidence

| Gate | Required result | Actual result | Evidence notes |
|---|---|---|---|
| Non-production target | `PASS` | `[PASS/FAIL]` | `[label only]` |
| `/api/health` | HTTP 200 and `checks.schema: true` | `[PASS/FAIL]` | `[label only]` |
| Staff session | Safe staff session opens `/dashboard` | `[PASS/FAIL]` | `[label only]` |
| Production boundary | No production URL, production credentials, production data, or production flags used | `[PASS/FAIL]` | `[label only]` |

## Dashboard Placement Evidence

| Gate | Required result | Actual result | Evidence notes |
|---|---|---|---|
| Daily Office Handoff Digest visible | `PASS` | `[PASS/FAIL]` | `[label only]` |
| Saved-view card placement | Appears after the Daily Office Handoff Digest and before Parish Health Score | `[PASS/FAIL]` | `[label only]` |
| Preset labels | Front desk opening view, Sacramental records handoff view, and Administrator closeout view visible | `[PASS/FAIL]` | `[label only]` |
| Staff-reviewed boundary | Read-only/staff-reviewed/no-automation language visible | `[PASS/FAIL]` | `[label only]` |

## Active-Parish Scope Evidence

| Gate | Required result | Actual result | Evidence notes |
|---|---|---|---|
| Parish A context | Card reflects selected active parish A context | `[PASS/FAIL]` | `[label only]` |
| Parish A cue safety | Cues match Daily Office Handoff Digest and do not show another parish's work | `[PASS/FAIL]` | `[label only]` |
| Parish B switch | If available, switching to parish B updates context and cues/empty states | `[PASS/FAIL/NOT_AVAILABLE]` | `[label only]` |
| Parish A restore | If parish B is available, switching back restores parish A context and cues/empty states | `[PASS/FAIL/NOT_AVAILABLE]` | `[label only]` |

## Safe Links And Empty States Evidence

| Gate | Required result | Actual result | Evidence notes |
|---|---|---|---|
| Preset links | Open only existing staff-reviewed queues | `[PASS/FAIL]` | `[label only]` |
| Cue links | Open only existing queue/detail paths already present in the Daily Office Handoff Digest | `[PASS/FAIL]` | `[label only]` |
| Empty state | If available, no-cue fixture shows calm empty state instead of missing-data error | `[PASS/FAIL/NOT_AVAILABLE]` | `[label only]` |
| Catholic records boundary | Sacramental/certificate cues remain staff-reviewed and do not imply canonical, pastoral, eligibility, certificate-generation, or register-mutation decisions | `[PASS/FAIL]` | `[label only]` |

## Forbidden Behavior Evidence

The tester must confirm the saved-view card does not expose any of these controls or data types.

| Forbidden item | Required result | Actual result | Evidence notes |
|---|---|---|---|
| Save controls or preference persistence controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Send, email, or outbound communication controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Export or download controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| AI controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Storage, file, or signed URL controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Certificate generation controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Duplicate merge controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Automation controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Forms or mutation controls | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |
| Raw metadata, raw IDs, secrets, storage paths, token material, original filenames, private document contents, or raw exports | `ABSENT` | `[ABSENT/PRESENT]` | `[label only]` |

## Rollback / No-Op Evidence

Rollback for this slice is code removal only. The browser QA evidence should confirm that no data cleanup is needed because the card is read-only.

- Rollback verification executed: `[PASS/FAIL/NOT_RUN]`
- If executed, prior dashboard shape restored after UI removal: `[PASS/FAIL/NOT_APPLICABLE]`
- Database cleanup required: `NO`
- Storage cleanup required: `NO`
- Migration rollback required: `NO`
- Export cleanup required: `NO`
- AI cleanup required: `NO`
- Communication cleanup required: `NO`
- Certificate cleanup required: `NO`
- Automation cleanup required: `NO`
- Notes: `[label-only notes or NONE]`

## Final Decision

- Browser QA decision: `[PASS / BLOCKED / FAIL]`
- Evidence outcome summary: `[FILL: label-only summary]`
- Unresolved risks: `[FILL: label-only risk notes or NONE]`
- Product owner review needed before pilot-ready wording: `YES`
- Production-sensitive gates remain closed: `YES`
- Public trust claims approved: `NO`
- Final sign-off label: `[FILL: product/evidence owner label only or NOT_SIGNED]`

## Approved Passing Summary Shape

Use this shape only after the browser run actually passes:

```text
Daily Office Handoff saved-view dashboard browser QA passed in a safe non-production staff session. The saved-view card appeared after the Daily Office Handoff Digest and before Parish Health Score, followed the selected active parish context, showed the three approved preset labels, linked only to existing staff-reviewed queues, preserved calm empty states where applicable, and exposed no save/send/export/AI/storage/signed URL/certificate/automation/mutation controls. Production-sensitive gates and public trust claims remained closed.
```

## Forbidden Evidence Content

Do not paste:

- database URLs
- Supabase anon or service-role keys
- API keys
- bearer tokens
- JWTs
- OAuth tokens or refresh tokens
- plaintext family portal tokens
- token hashes
- signed URL values
- storage paths
- original filenames
- private document contents
- raw export contents
- raw audit metadata
- raw production record IDs
- staff passwords
- parishioner private contact details
