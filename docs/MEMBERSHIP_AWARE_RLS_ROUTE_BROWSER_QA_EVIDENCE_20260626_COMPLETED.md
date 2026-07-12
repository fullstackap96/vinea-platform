# Membership-Aware RLS Route/Browser QA Evidence - Completed 2026-06-26

Status: Completed against the approved reusable disposable Supabase project only. Shared QA and production were not touched. The operational RLS candidate was not applied to shared QA or production and was not moved into `supabase/migrations`.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `scripts/run-membership-aware-rls-route-browser-qa.mjs`

## Safety Confirmation

- Target app host: `kikqtorplsswepqitjys.supabase.co`
- Target database host: `db.kikqtorplsswepqitjys.supabase.co`
- Local app URL: `http://127.0.0.1:3211`
- Production touched: `No`
- Shared QA project `gnfomgsuottcuueasfvi` touched: `No`
- Runtime public intake routing changed: `No`
- Runtime `/api/health` code changed: `No`
- Operational RLS applied to shared QA or production: `No`
- Operational RLS candidate moved into `supabase/migrations`: `No`
- Secret printed or committed: `No`

## Disposable Schema Readiness

The first `/api/health` check against the disposable app returned `checks.schema: false` because the reusable disposable database was missing the already-promoted public-intake routing schema objects.

Applied to the disposable project only:

- `supabase/migrations/20260625193000_public_intake_parish_routing.sql`
- `supabase/migrations/20260626103000_public_intake_domain_verification.sql`

These are existing repo migrations. The membership-aware operational RLS draft was not applied.

After that, `/api/health` returned:

```json
{
  "statusCode": 200,
  "ok": true,
  "schema": true,
  "supabase": true
}
```

## Route/Browser QA Notes

- The in-app browser connected to the local disposable app and loaded the staff login page.
- The initial browser sign-in exposed a disposable setup issue: legacy staff authorization still checks the oldest primary parish, so the throwaway user also needed a disposable staff row in that primary parish.
- After the disposable staff authorization was fixed, the browser dashboard load hit a browser automation timeout.
- The final pass/fail evidence below comes from authenticated live HTTP route checks against the running local app on port `3211`, using the same Supabase SSR auth cookie format and active parish cookie expected by the app.

## Completed Route QA Results

```json
{
  "status": "completed",
  "host": "kikqtorplsswepqitjys.supabase.co",
  "baseUrl": "http://127.0.0.1:3211",
  "requestId": "f4c46749-c3a3-4bd9-abf0-8fc7a8ae2374",
  "results": [
    { "check": "api_health", "status": 200, "ok": true, "schema": true },
    { "check": "request_detail_access_api", "status": 200, "ok": true },
    { "check": "request_detail_page", "status": 200, "renderedWithoutLoginRedirect": true },
    { "check": "staff_document_list_before_upload", "status": 200, "ok": true },
    { "check": "staff_document_upload", "status": 200, "ok": true, "documentIdPresent": true },
    { "check": "staff_signed_url_route", "status": 200, "ok": true, "signedUrlPresent": true },
    { "check": "staff_signed_url_fetch", "status": 200, "bodyMatched": true },
    { "check": "direct_storage_privacy", "denied": true, "statusCode": "404" },
    { "check": "staff_document_review", "status": 200, "ok": true, "statusValue": "approved" },
    { "check": "staff_portal_token_create", "status": 200, "ok": true, "urlPresent": true, "tokenHashExposed": false },
    { "check": "family_portal_page_safety", "status": 200, "hasFamilyStep": true, "unsafeMarkerFound": null },
    { "check": "family_portal_document_upload", "status": 200, "ok": true },
    { "check": "audit_events_for_document_and_portal_actions", "ok": true, "count": 4 }
  ]
}
```

## Pass Criteria Verified

- `/api/health` returned `checks.schema: true`.
- Request detail access honored the active parish cookie and authenticated staff session.
- Request detail page route returned HTTP `200` without login or unauthorized shell.
- Staff document list, upload, signed URL generation, signed URL fetch, and approval worked.
- Direct Supabase Storage download through the anon client was denied.
- Family portal token creation returned a one-time URL without exposing `token_hash`.
- Family portal page showed safe family-facing request/document-step details.
- Family portal page did not expose the seeded private staff note, audit text, AI notes, internal notes, or token hash.
- Family portal document upload worked for the token-scoped request.
- Audit events existed for staff upload, staff review, portal token creation, and family upload.

## Cleanup

- Temporary local app server on port `3211` was stopped.
- Temporary `postgres` runner dependency was removed after applying missing disposable-only migrations.
- Disposable QA rows were left in the approved disposable project as evidence data.

## Remaining Risks Before Promotion

- This gate did not apply the membership-aware operational RLS draft to shared QA or production.
- The in-app browser dashboard interaction timed out after login; the completed evidence is from authenticated live route checks.
- Product-owner, QA, technical, and security/data sign-off are still required before moving the operational RLS candidate into `supabase/migrations`.

## Final Decision

- Decision: `Route QA Passed; Promotion Still Requires Sign-Off`
- Reason: Database-level authenticated RLS QA and final live route/document/family portal QA have passed against the disposable target, but production promotion still requires formal sign-off.
