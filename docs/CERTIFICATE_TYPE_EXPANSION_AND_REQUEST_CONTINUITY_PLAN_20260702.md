# Certificate Type Expansion And Request-To-Record Continuity Plan

Status: Prepared as non-runtime planning only.

Date prepared: 2026-07-02

Completion marker: `CERTIFICATE_TYPE_EXPANSION_AND_REQUEST_CONTINUITY_PLAN_20260702`

Decision state:

`CERTIFICATE TYPE EXPANSION AND REQUEST CONTINUITY PLAN PREPARED; BROADER CERTIFICATE GENERATION NOT IMPLEMENTED; CERTIFICATE ISSUANCE LOGGING RUNTIME NOT APPROVED; PRODUCTION CERTIFICATE WORKFLOWS REMAIN NO-GO`

## Safety Boundary

This plan does not wire routes, apply migrations, change operational RLS, mutate sacramental records, enable production flags, generate certificates automatically, create certificate PDFs automatically, make canonical or sacramental eligibility decisions, make pastoral decisions, expose family-facing certificate state, or make public trust claims.

This plan is for product, UX, QA, and implementation sequencing only. It keeps broader certificate work separate from live certificate generation, certificate issuance logging, correction/notation workflows, and canonical/pastoral decisions.

## Related Materials

- `docs/CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702.md`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702.md`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md`
- `docs/CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`
- `docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md`

## Product Goal

Vinea should eventually help parish staff understand three simple questions:

1. Does this sacramental record have a clear originating request?
2. Is a certificate ready for staff review, generated for review, issued, voided, or replaced?
3. What does staff need to verify before taking the next safe action?

The system should never imply that Vinea has decided eligibility, canonical status, pastoral readiness, or whether a certificate should be issued. Vinea can organize the work, show continuity, and preserve review history. Parish staff remain responsible for sacramental and canonical judgment.

## Certificate Type Planning Matrix

| Certificate type | Source record requirement | Request continuity expectation | Future staff review fields | Explicit exclusions | Runtime status |
|---|---|---|---|---|---|
| Baptism certificate | Existing baptism sacramental record with parish-scoped access | Link to baptism request when present; manual review when missing | certificate type, safe person label, staff-reviewed issuance status, delivery method, continuity state | no automatic eligibility decision, no automatic PDF creation beyond separately approved existing generation path, no register mutation | Existing baptism PDF generation exists; broader issuance logging not implemented |
| Confirmation certificate | Confirmation sacramental record required | Link to OCIA, confirmation prep, or manual request when present; manual review when missing | certificate type, safe person label, staff-reviewed issuance status, continuity state | no automatic generation, no canonical notation, no eligibility decision | Planned only |
| First Communion certificate | First Communion or Eucharist sacramental record required | Link to sacramental prep or manual request when present; manual review when missing | certificate type, safe person label, staff-reviewed issuance status, continuity state | no automatic generation, no readiness decision, no record mutation | Planned only |
| Marriage certificate | Marriage sacramental record required | Link to wedding request when present; manual review when missing | certificate type, safe couple label, staff-reviewed issuance status, continuity state | no automatic generation, no eligibility decision, no canonical notation entry | Planned only |
| OCIA initiation or reception certificate | Appropriate initiation, reception, confirmation, Eucharist, or baptism record required based on parish practice | Link to OCIA request when present; manual review when missing | certificate type, safe person label, staff-reviewed issuance status, continuity state | no automatic generation, no canonical/sacramental decision, no pastoral readiness decision | Planned only |
| Sacramental record extract or status letter | Source sacramental record or parish-approved record extract required | Link to request when present; manual review when missing | document type, safe person label, staff-reviewed status, continuity state | not treated as a sacramental certificate without separate approval; no automatic generation | Planned only |

## Request-To-Record Continuity States

Future UI and DTOs should use plain-English states that help staff review the record without overstating certainty:

- `linked_request_verified`: The record has a same-parish request link and the request ownership check passes.
- `record_without_request_manual_review`: The record exists without an originating request link, so staff should verify continuity manually.
- `request_without_record_blocked`: A request appears ready for a certificate-related step, but no safe same-parish sacramental record link is present.
- `cross_parish_mismatch_denied`: The request or record belongs to a different parish than the selected active parish.
- `legacy_record_manual_review`: The record appears to predate Vinea workflow history and needs staff review before any certificate status is shown as ready.

## UX Planning Notes

Future sacramental record detail pages should include a calm request-to-record continuity card that uses plain parish-office language:

- "Linked to Baptism Request" when a safe same-parish request link exists.
- "No request link found. Please verify the register manually." when continuity is missing.
- "Certificate ready for staff review" only when safe staff-reviewed conditions are present.
- "Certificate generated for staff review" only when a separately approved generation path produced a staff-review document.
- "Certificate issued" only when a separately approved issuance logging path records a staff-reviewed issuance event.
- "Certificate voided or replaced" only when a separately approved issuance logging path records that staff action.

Future labels must avoid implying decisions Vinea cannot make:

- Use "Ready for staff review."
- Do not use "eligible."
- Do not use "canonically approved."
- Do not use "pastorally approved."
- Do not use "valid for issuance" unless a parish-approved staff workflow defines that phrase later.

Family-facing certificate state must remain excluded until separately approved. Family portal users should not see staff-only issuance metadata, correction/notation review metadata, raw register details, internal notes, audit metadata, storage paths, signed URLs, token material, or AI material.

## Safe Future Read Model

A future read model, if separately approved, should include only safe labels and staff-reviewed status:

- certificate type
- sacramental record type
- safe person or couple label
- safe active parish label
- safe linked request label
- continuity state
- staff-reviewed certificate status
- safe delivery method label
- audit metadata reference label
- family-facing excluded flag
- correction/notation separate approval flag
- canonical decision blocked flag
- sacramental eligibility decision blocked flag
- automatic generation blocked flag

It must not include raw notes, document contents, storage paths, signed URLs, original filenames, token material, family portal private data, AI prompts, AI outputs, service-role keys, database URLs, raw exports, or raw metadata.

## Workflow Separation

Future implementation must keep these concepts separate:

- Certificate generation: creating a certificate document from an approved template.
- Certificate issuance logging: recording staff-reviewed issuance, generated-for-review, voided, or replaced metadata.
- Correction and notation: staff-reviewed register integrity workflows that require separate approval.
- Canonical or sacramental eligibility: never decided by Vinea.
- Family-facing certificate state: excluded until separately approved.

This separation is important because a certificate document, an issuance history event, a correction review, a notation review, and a pastoral/canonical judgment are different things.

## Future QA Gates

Before broader certificate type work becomes runtime behavior, Vinea should require:

1. Flag-off baseline for any gated non-production scaffold.
2. Staff authentication and active-parish membership scope.
3. Same-parish record ownership.
4. Same-parish linked-request ownership when a request link exists.
5. Manual review handling for missing request links and legacy records.
6. Cross-parish denial with generic staff-safe messaging.
7. Family/unauthenticated denial.
8. Certificate-type-specific template rendering QA if document generation is in scope.
9. Proof that no automatic certificate generation occurs unless separately approved.
10. Proof that no sacramental record fields are mutated.
11. Proof that no correction or notation workflow is invoked.
12. Proof that no canonical, sacramental eligibility, or pastoral decision is made.
13. Safe audit metadata checks before any approved event write.
14. Rollback/no-op verification.

## Future Approval Gates

Broader certificate type work requires separate approvals before runtime implementation:

- Product owner approval for the specific certificate type.
- Parish/canonical record owner approval for wording, labels, and boundaries.
- Security/data owner approval for data fields, retention, audit metadata, and family-facing exclusions.
- QA owner approval for same-parish, cross-parish, missing-link, and rollback evidence.
- Support owner approval for staff-facing help text and incident handling.

Production certificate workflows remain NO-GO until non-production evidence, production-safe smoke fixtures, named owners, rollback criteria, and explicit product-owner approval are complete.

## Recommended Next Safe Slice

Prepare a read-only UX planning spec for the future request-to-record continuity card on sacramental record detail pages. That spec should remain non-runtime until separately approved.

## What Changed Plain English

This plan gives Vinea a careful map for adding more certificate types later, such as Confirmation, First Communion, Marriage, and OCIA-related certificates. It also defines how staff should eventually see whether a certificate is connected to an original request. Nothing live was changed. No certificates are generated, no records are edited, and Vinea still does not make sacramental, canonical, or pastoral decisions.
