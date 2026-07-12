# Vinea Export Audit Review Non-Production Drill Filled Inputs - 2026-06-30

Status: Filled as non-secret drill input labels only. Production was not accessed, production export flags were not enabled, staff-facing production export UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, export routes were not called, audit metadata was not written, and no secrets were exposed while filling these inputs.

These labels are derived from the completed live non-production export smoke evidence:

- `docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`

Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL INPUTS FILLED; DRILL NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_FILLED_INPUTS_20260630`

## Filled Non-Secret Inputs

```text
NON_PRODUCTION_APP_URL=localhost non-production
SAFE_EXPORT_QA_STAFF=Existing non-production QA staff environment values, not printed
SAFE_EXPORT_PARISH_A=Derived active parish from QA staff active parish memberships
SAFE_EXPORT_SAME_PARISH_REQUEST=Derived same-parish request from QA staff active parish memberships
SAFE_EXPORT_CROSS_PARISH_DENIED_REQUEST=Forged unauthorized active parish cookie denial against authenticated QA staff session
SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF=Existing non-production QA staff environment values, not printed
SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Derived active parish from QA staff active parish memberships
SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Derived same-parish request with workflow steps and request-document metadata
SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Derived same-parish request-document metadata from QA staff active parish memberships
SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Forged unauthorized active parish cookie denial against authenticated QA staff session
EXPORT_DRILL_BLOCKED_FIELD_ATTEMPT=request_list_basic fields=request_reference,access_token; request_document_manifest fields=request_reference,signed_url and fields=request_reference,storage_path
EXPORT_DRILL_FAMILY_OR_UNAUTH_DENIAL_METHOD=Unauthenticated direct route access as family-facing substitute
EXPORT_DRILL_MONITORING_OWNER=Codex local QA operator
ROLLBACK_OWNER_NAME=Codex local QA operator
```

## Why These Labels Are Safe

- They come from completed non-production smoke evidence, not production.
- They do not include raw parish ids, request ids, document ids, passwords, session cookies, Supabase keys, database URLs, Google OAuth tokens, OpenAI keys, family portal tokens, signed URLs, storage paths, original filenames, raw CSV contents, raw manifests, notes, communications, AI material, or sacramental/canonical details.
- They preserve the prior smoke-test approach of deriving safe fixtures from the authenticated QA staff account's active parish memberships instead of hard-coding sensitive identifiers.
- They keep cross-parish checks generic by using a forged unauthorized active parish cookie denial rather than exposing a real cross-parish request id.
- They keep family-facing checks generic by using unauthenticated direct route access as the safe family-facing substitute.

## Execution Boundary

These labels are enough to prepare a drill execution request, but they are not proof that a live drill has been executed today.

Before a live drill run, the executor must still verify:

- The local non-production app target is running.
- The local app is backed by the approved non-production/shared-QA environment.
- `QA_STAFF_EMAIL` and `QA_STAFF_PASSWORD` are present by name only.
- Export runtime flags are off before baseline.
- Runtime flags are enabled only as `VINEA_EXPORT_RUNTIME=ENABLED`, `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`, and `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`.
- Runtime flags are disabled again for rollback verification.
- Any safe audit metadata written by the drill is expected and recorded in the evidence template.

## Filled Approval Text For Future Drill Execution

```text
Continue Vinea development. Execute the export audit review non-production drill against the approved local non-production target only.

Use:
NON_PRODUCTION_APP_URL=localhost non-production
SAFE_EXPORT_QA_STAFF=Existing non-production QA staff environment values, not printed
SAFE_EXPORT_PARISH_A=Derived active parish from QA staff active parish memberships
SAFE_EXPORT_SAME_PARISH_REQUEST=Derived same-parish request from QA staff active parish memberships
SAFE_EXPORT_CROSS_PARISH_DENIED_REQUEST=Forged unauthorized active parish cookie denial against authenticated QA staff session
SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF=Existing non-production QA staff environment values, not printed
SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Derived active parish from QA staff active parish memberships
SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Derived same-parish request with workflow steps and request-document metadata
SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Derived same-parish request-document metadata from QA staff active parish memberships
SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Forged unauthorized active parish cookie denial against authenticated QA staff session
EXPORT_DRILL_BLOCKED_FIELD_ATTEMPT=request_list_basic fields=request_reference,access_token; request_document_manifest fields=request_reference,signed_url and fields=request_reference,storage_path
EXPORT_DRILL_FAMILY_OR_UNAUTH_DENIAL_METHOD=Unauthenticated direct route access as family-facing substitute
EXPORT_DRILL_MONITORING_OWNER=Codex local QA operator
ROLLBACK_OWNER_NAME=Codex local QA operator

Do not access production, enable production flags, add production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved safe audit metadata, or expose secrets. Run checks, update build status, summarize, and include the estimated total project completion percentage.
```

## Remaining Execution Risk

The prior smoke evidence says the stored `QA_REQUEST_ID` was stale and safe fixtures were derived at runtime. A future live drill should continue using derived same-parish fixtures unless fresh explicit non-secret fixture labels are supplied.
