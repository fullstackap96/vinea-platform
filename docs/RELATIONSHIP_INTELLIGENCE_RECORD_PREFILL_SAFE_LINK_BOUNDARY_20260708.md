# Relationship Intelligence Record Prefill Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY RELATIONSHIP INTELLIGENCE LINK HARDENING`

Completion marker: `RELATIONSHIP_INTELLIGENCE_RECORD_PREFILL_SAFE_LINK_BOUNDARY_20260708`

This slice centralizes Relationship Intelligence record prefill and suggested-action detail links through shared helpers so suggested actions and request-detail record suggestions use the same dashboard-only sanitizer path.

## Scope

Protected links:

- Dashboard suggested action links for creating a sacramental record from a completed request.
- Dashboard suggested action links for opening an existing sacramental record or source request.
- Request detail "Prefill new record" links in the Suggested next step card.

## Why This Matters

Request-to-record continuity is one of Vinea's Catholic-specific strengths. Staff should be able to move from a completed baptism-style request into a reviewed register-entry form without each UI surface rebuilding the prefill URL differently. Certificate-ready and person-match suggested actions should also fall back to safe list pages when an unexpected blank id reaches presentation code.

## Safety Boundary

This change:

- does not mutate records.
- does not create records automatically.
- does not generate certificates.
- does not make sacramental, canonical, pastoral, or eligibility decisions.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not touch Google Calendar data.
- does not make public trust claims.

The prefill remains staff-reviewed: Vinea may prepare a form link, but staff must review and save the record.

## Verification

Focused tests prove:

- `recordPrefillHrefForRequest` encodes unsafe-shaped request ids.
- blank request ids fall back to `/dashboard/records`.
- `recordDetailHrefForSuggestedAction` encodes unsafe-shaped record ids and falls back to `/dashboard/records`.
- `requestDetailHrefForSuggestedAction` encodes unsafe-shaped request ids and falls back to `/dashboard/requests`.
- suggested-action record creation links reuse the shared helper.
- the request-detail Suggested next step card consumes the shared helper instead of rebuilding the URL locally.

Command:

```powershell
npm.cmd test -- lib\relationshipIntelligence\relationshipIntelligence.test.ts lib\server\relationshipIntelligenceRecordPrefillSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
