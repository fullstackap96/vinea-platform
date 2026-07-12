# Vinea AI Safety And Permission-Scoped Retrieval Policy - 2026-06-27

Status: Policy proposal and implementation-tracking document. Production was not accessed, no migrations were applied, flag-off runtime behavior remains legacy-compatible, and operational RLS was not changed while updating this policy.

## Purpose

This policy defines how Vinea should safely use AI for Catholic parish operations. It covers AI summaries, email drafts, future permission-scoped retrieval, source display, human approval, audit metadata, family-facing boundaries, sacramental/canonical restrictions, and data retention.

This is not a runtime AI safety layer, not a completed permission-scoped retrieval implementation, and not a public compliance claim.

## Current Decision State

Current AI safety readiness: `POLICY, NON-RUNTIME DTO CONTRACTS, REQUEST SUMMARY RETRIEVAL DTO, AI REPLY RETRIEVAL DTO, SOURCE DISPLAY CONTRACT, AUDIT METADATA CONTRACT, STAFF REVIEW STATUS CONTRACT, FAMILY/CROSS-PARISH SAFETY CONTRACT, ROUTE WIRING PREFLIGHT, SUMMARY RUNTIME GATE, AND SUMMARY SAFETY-CHAIN ADAPTER PREPARED; RUNTIME AI GENERATION SAFETY LAYER NOT COMPLETE`

Current safe claim:

- Vinea supports staff-gated AI-assisted summaries and email drafts for parish request workflows.

Do not claim:

- AI retrieval is fully permission-scoped.
- AI outputs include complete source citations.
- AI actions are fully audited at runtime.
- AI can make pastoral, sacramental, canonical, legal, or outbound communication decisions.
- AI-generated content is safe to show to families without staff review.
- AI data retention automation is complete.

## Current AI Surfaces

| Surface | Current use | Safety posture |
|---|---|---|
| AI summaries | Staff can request internal summaries for baptism, wedding, funeral, OCIA, and related request data | Staff-gated, but source display and audit metadata are not complete |
| AI email drafts | Staff can generate draft replies or follow-ups | Staff must review before sending; no autonomous send |
| Future AI retrieval | Potential future retrieval across requests, people, households, records, documents, notes, communications, and audit data | Must be permission-scoped before launch |
| Future AI phone/call summaries | Potential future call notes and pastoral follow-up summaries | Must require consent/notice policy, retention policy, and staff review |
| Future document intelligence | Potential extraction from uploaded request documents | Must preserve document privacy and avoid family-facing leakage |

## Non-Runtime AI Feature Registry

Vinea now has a non-runtime AI safety registry and allowed data-class map in `lib/aiSafetyRegistry.ts`.

Current registry status: `NON-RUNTIME CONTRACT PREPARED, NOT WIRED INTO AI ROUTES`

The registry defines:

- Current AI feature IDs for request summaries and email drafts.
- Planned future feature IDs for permission-scoped retrieval and document intelligence.
- Allowed data classes for each feature.
- Family-facing exclusions.
- Sacramental/canonical restrictions.
- Source display requirements.
- Human approval requirements.
- Audit metadata requirements.
- Retention expectations.

The registry is intentionally not wired into `/api/ai/summary`, `/api/ai/reply`, or future retrieval routes yet. It is a safety contract for future implementation gates, not a completed runtime permission system.

Do not claim:

- AI routes are enforced by the registry.
- AI retrieval is permission-scoped at runtime.
- AI route preflight tests are runtime enforcement.
- AI routes generate output from the safety DTO chain.
- AI audit metadata is fully recorded at runtime.
- AI source display is complete in the staff UI.
- AI staff review labels are visible or runtime-enforced in the product.
- Family portal and cross-parish AI retrieval blocking is runtime-enforced.

## Non-Runtime Request Summary Retrieval DTO

Vinea now has a non-runtime request-summary retrieval DTO builder in `lib/aiRequestSummaryRetrievalDto.ts`.

Current DTO status: `REQUEST SUMMARY DTO PREPARED, NOT WIRED INTO AI ROUTES`

The DTO builder:

- Uses the AI feature registry and request-summary allowed data classes.
- Requires active parish scope to match the request's parish.
- Requires the active parish to be in the staff member's authorized parish IDs.
- Preserves object-level request scope.
- Produces safe source labels and permission-checked source references.
- Carries source display requirements.
- Carries audit metadata requirements and a non-invoked audit metadata template.
- Carries family-facing exclusions.
- Carries sacramental/canonical restrictions.
- Carries request-summary retention expectations.
- Fails closed for missing scope, cross-parish scope, unauthorized parish scope, empty sources, unsafe token-like source references, and data classes that are not allowed for request summaries.

The DTO builder does not query Supabase, does not call OpenAI, does not change prompt construction, and does not change `/api/ai/summary` behavior.

Do not claim:

- Request summary AI retrieval is runtime-enforced.
- Request summary prompts are now built from the DTO.
- Source labels are visible in the staff UI.
- AI audit events are written for summary generation.

## Non-Runtime AI Reply Retrieval DTO

Vinea now has a non-runtime AI reply retrieval DTO builder in `lib/aiReplyRetrievalDto.ts`.

Current DTO status: `AI REPLY RETRIEVAL DTO PREPARED, NOT WIRED INTO AI ROUTES`

The DTO builder:

- Uses the AI feature registry and `email_draft` allowed data classes.
- Requires active parish scope to match the request's parish.
- Requires the active parish to be in the staff member's authorized parish IDs.
- Preserves object-level request scope and communication-draft target metadata.
- Preserves draft intent and recipient kind without sending communications.
- Produces safe source labels and permission-checked source references.
- Carries source display requirements.
- Carries audit metadata requirements and a non-invoked audit metadata template.
- Carries family-facing exclusions.
- Carries sacramental/canonical restrictions.
- Carries staff-review-required outbound communication policy.
- Forbids autonomous send.
- Fails closed for missing scope, cross-parish scope, unauthorized parish scope, empty sources, unsafe token-like source references, signed-url references, raw prompt/output markers, and data classes that are not allowed for email drafts.

The DTO builder does not query Supabase, does not call OpenAI, does not change prompt construction, does not write audit events, does not expose source display, does not persist staff disposition, and does not change `/api/ai/reply` behavior.

Do not claim:

- AI reply retrieval is runtime-enforced.
- AI reply prompts are now built from the DTO.
- AI reply source labels are visible in the staff UI.
- AI reply audit events are written at runtime.
- AI reply drafts are safe to send without staff review.

## Non-Runtime Source Display DTO

Vinea now has a non-runtime source display DTO builder in `lib/aiSourceDisplayDto.ts`.

Current source-display DTO status: `SOURCE DISPLAY DTO PREPARED, NOT WIRED INTO AI ROUTES OR STAFF UI`

The source display DTO builder:

- Supports request-summary and email-draft source display contracts.
- Uses the AI feature registry for feature labels and allowed data classes.
- Can build request-summary source cards from the non-runtime request-summary retrieval DTO.
- Requires every source card to have a safe label.
- Requires every source card to have a permission-checked source path.
- Requires every source card to match the active parish scope.
- Preserves staff-only and family-facing-safe flags.
- Preserves sacramental/canonical restriction flags.
- Carries the source display requirements from the AI safety registry.
- Carries family-facing exclusions.
- Carries sacramental/canonical restrictions.
- Exposes display-only source cards, not raw internal note bodies, communication bodies, prompts, model outputs, token material, or document contents.
- Fails closed for unsafe token-like labels, missing permission-checked paths, mismatched parish scope, and feature-disallowed data classes.

The source display DTO builder does not query Supabase, does not call OpenAI, does not render UI, and does not change `/api/ai/summary` or `/api/ai/reply` behavior.

Do not claim:

- AI source display is visible in the product.
- AI source display is runtime-enforced.
- AI prompts are built only from displayed source cards.
- Staff can inspect complete AI citations in the UI.

## Non-Runtime AI Audit Metadata DTO

Vinea now has a non-runtime AI audit metadata DTO builder in `lib/aiAuditMetadataDto.ts`.

Current audit metadata DTO status: `AUDIT METADATA DTO PREPARED, NOT WIRED INTO AI ROUTES OR AUDIT LOG WRITES`

The audit metadata DTO builder:

- Supports request-summary and email-draft audit metadata contracts.
- Uses the AI feature registry for allowed data classes, output destinations, retention expectations, human approval, and family-facing boundaries.
- Can build request-summary audit metadata from the non-runtime request-summary retrieval DTO and source-display DTO.
- Preserves staff identity.
- Preserves parish scope and active parish context.
- Preserves target object type and ID.
- Preserves AI feature ID.
- Preserves input data classes.
- Preserves safe source references.
- Preserves output destination.
- Preserves staff disposition, such as pending review, accepted, edited, discarded, sent, or blocked.
- Preserves a model/provider family placeholder when no model is invoked.
- Preserves blocked reason when an AI action is denied.
- Carries source-display summary metadata without storing internal note bodies, communication bodies, document contents, provider payloads, token material, prompts, or generated text.
- Fails closed for missing staff/parish/target scope, active parish mismatch, feature-disallowed output destinations, feature-disallowed data classes, unsafe source references, and mismatched source-display metadata.

The audit metadata DTO builder does not query Supabase, does not call OpenAI, does not write audit events, and does not change `/api/ai/summary` or `/api/ai/reply` behavior.

Do not claim:

- AI audit events are written for summaries or email drafts at runtime.
- Staff disposition is recorded in the database for AI output yet.
- Runtime AI routes are constrained by the audit metadata DTO.
- AI audit logs contain complete source or model evidence.

## Non-Runtime Staff Review Status DTO

Vinea now has a non-runtime AI staff review/status DTO builder in `lib/aiStaffReviewStatusDto.ts`.

Current staff review/status DTO status: `STAFF REVIEW STATUS DTO PREPARED, NOT WIRED INTO AI ROUTES OR STAFF UI`

The staff review/status DTO builder:

- Supports request-summary and email-draft review labels.
- Uses the AI feature registry for feature labels, human approval requirements, source display requirements, audit metadata requirements, retention boundaries, and family-facing boundaries.
- Uses the source-display DTO to preserve safe source summary counts.
- Uses the audit metadata DTO to preserve staff disposition, output destination, active parish context, target object, and blocked reason.
- Distinguishes draft, review-required, saved, sent, discarded, and blocked states.
- Keeps human approval requirements visible.
- Keeps family-facing exclusions visible.
- Keeps sacramental/canonical restrictions visible, including whether restricted sources are present.
- Carries only safe review labels and source summary counts, not internal note bodies, communication bodies, document contents, provider payloads, token material, prompts, or generated text.
- Fails closed when a review label would misrepresent the audit metadata, such as marking an unsent draft as sent.
- Fails closed when source-display metadata no longer matches the audit metadata.

The staff review/status DTO builder does not query Supabase, does not call OpenAI, does not render UI, does not write audit events, and does not change `/api/ai/summary` or `/api/ai/reply` behavior.

Do not claim:

- AI staff review labels are visible in the staff UI.
- AI staff review labels are runtime-enforced.
- Staff can save, send, discard, or block AI output through this DTO yet.
- Runtime AI routes are constrained by the staff review/status DTO.

## Non-Runtime Family And Cross-Parish AI Safety Contract

Vinea now has a non-runtime family-portal and cross-parish AI safety contract builder in `lib/aiFutureRetrievalSafetyContract.ts`.

Current family/cross-parish AI safety contract status: `FAMILY/CROSS-PARISH SAFETY CONTRACT PREPARED, NOT WIRED INTO AI ROUTES`

The family/cross-parish AI safety contract builder:

- Uses the AI feature registry, request-summary retrieval DTO, AI reply retrieval DTO, source-display DTO, audit metadata DTO, and staff review/status DTO.
- Allows future retrieval only for staff-internal surfaces when active parish context, request parish scope, parish membership authorization, and the full DTO chain match.
- Blocks family-portal AI retrieval and marks AI output as not approved for family-facing display.
- Preserves family-facing exclusions, including internal staff notes, AI notes, portal token hashes, plaintext family portal tokens, and cross-parish context.
- Preserves staff-only and family-facing-safe source counts without exposing private source contents.
- Blocks cross-parish retrieval when active parish context does not match the request parish.
- Blocks unauthorized retrieval when the active parish is not in the staff member's authorized parish IDs.
- Uses generic public blocked reasons while preserving internal blocked reasons for staff-only audit/review contexts.
- Excludes internal note bodies, communication bodies, document contents, provider payloads, token material, prompts, and generated text.
- Fails closed when the retrieval DTO, source-display DTO, audit metadata DTO, or staff review/status DTO chain is incomplete or mismatched.

The family/cross-parish AI safety contract builder does not query Supabase, does not call OpenAI, does not render UI, does not write audit events, and does not change `/api/ai/summary`, `/api/ai/reply`, family portal routes, or operational RLS behavior.

Do not claim:

- Family portal AI retrieval is runtime-blocked by this contract yet.
- Cross-parish AI retrieval is runtime-blocked by this contract yet.
- Runtime AI routes are constrained by the family/cross-parish safety contract.
- Family-facing AI safety has been manually QA-tested in production.

## Non-Runtime AI Runtime Route Wiring Plan

Vinea now has a non-runtime runtime route wiring plan in `docs/AI_RUNTIME_ROUTE_WIRING_PLAN_20260627.md`.

Vinea also has source-level preflight tests in `lib/server/aiRouteRuntimeWiringPreflight.test.ts` and a source validator in `lib/server/aiRouteRuntimeWiringPreflight.ts`.

Current AI route wiring plan status: `ROUTE WIRING PLAN AND PREFLIGHT PREPARED, SUMMARY ROUTE GATED, REPLY ROUTE NOT CHANGED`

The route wiring plan:

- Covers `/api/ai/summary` and `/api/ai/reply`.
- Confirms the current live routes remain legacy staff-gated routes.
- Requires authentication before OpenAI.
- Requires active parish scope before OpenAI.
- Requires object-level request scope before OpenAI.
- Requires family-portal and cross-parish exclusions before OpenAI.
- Requires source-display DTOs before OpenAI.
- Requires AI audit metadata DTOs before OpenAI.
- Requires staff review/status DTOs before OpenAI.
- Requires generic blocked errors before OpenAI.
- Defines future insertion points, QA steps, rollback strategy, and safe claim boundaries.

The preflight tests do not query Supabase, do not call OpenAI, do not change route behavior, do not render UI, do not write audit events, and do not change operational RLS behavior.

Do not claim:

- Runtime AI route safety is complete.
- AI routes are wired to the DTO chain.
- OpenAI prompts are currently built from permission-scoped retrieval DTOs.
- The source-level preflight tests replace runtime QA.
- Family portal or cross-parish AI blocking is runtime-enforced by this phase.

## Disabled-By-Default AI Summary Runtime Gate And Adapter

Vinea now has a disabled-by-default runtime gate, scaffold plan, and non-production safety-chain adapter for future `/api/ai/summary` safety-chain wiring in `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`.

The gate and scaffold live in:

- `lib/server/aiSummaryRuntimeGate.ts`
- `lib/server/aiSummaryRuntimeScaffold.ts`
- `lib/server/aiSummarySafetyChainAdapter.ts`

Current AI summary gate scaffold status: `DISABLED-BY-DEFAULT GATE AND SAFETY-CHAIN ADAPTER WIRED INTO SUMMARY ROUTE, GENERATION STILL FAILS CLOSED`

The gate requires both exact values before the future safety chain can be selected:

- `VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED`
- `VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME`

When either value is missing or incorrect, the scaffold preserves `legacy_staff_gated_summary_route`.

When both values are exact, the scaffold may select `permission_scoped_summary_safety_chain`. The live route now calls `buildAiSummarySafetyChainAdapter`, which validates the prepared staff, active parish, object-level request, source-display, audit metadata, staff review/status, and family/cross-parish DTO chain, then still fails closed with `ai_retrieval_unavailable` before OpenAI.

The gate, scaffold, and adapter are now used by `/api/ai/summary`, but DTO-backed prompt construction, runtime AI audit writes, source display UI, staff disposition handling, and `/api/ai/reply` safety-chain wiring are not implemented.

Do not claim:

- `/api/ai/summary` generates AI summaries from the safety DTO chain.
- The summary safety-chain flags are enabled in production.
- AI summary prompts are permission-scoped at runtime.
- The scaffold replaces route-level QA or manual QA.

## Core Safety Principles

- Staff decides; AI assists.
- AI must not expand a staff member's access.
- AI must use the same parish scope, active parish context, membership authorization, and route/data boundaries as the user.
- AI output must clearly show that it is a draft or summary, not an official record.
- AI must not autonomously send communications.
- AI must not make sacramental, canonical, pastoral, legal, or eligibility decisions.
- AI must never expose internal notes, AI notes, audit logs, token hashes, staff-only data, or private parish data to family-facing surfaces.
- AI-generated text should be retained only when staff saves, sends, or attaches it to a record under the approved retention policy.

## Permission-Scoped Retrieval Requirements

Before Vinea builds retrieval-augmented AI across parish data, every AI request must resolve a safe retrieval scope.

Minimum required scope checks:

1. Authenticated staff identity.
2. Staff authorization status.
3. Active parish context or approved compatibility fallback.
4. Parish membership authorization.
5. Route-level permission for the target object.
6. Object-level parish relationship for requests, people, households, records, documents, notes, communications, workflow steps, and mass intentions.
7. Family-facing exclusion rules.
8. Canonical/sacramental restriction rules.
9. Audit event for AI retrieval and generated output.

Retrieval must fail closed when scope cannot be resolved.

## Source Display Requirements

AI summaries and recommendations should show what information was used.

Future source display should include:

- Source object type, such as request, workflow step, document, note, communication, person, household, or sacramental record.
- Source title or safe label.
- Source timestamp when relevant.
- Parish scope.
- Whether the source is staff-only.
- Whether the source is family-facing safe.
- Link to source only when the staff user already has permission.

Do not show:

- Token hashes.
- Plaintext family portal tokens.
- Private document contents in a general source list.
- Internal notes or AI notes on family-facing pages.
- Cross-parish source labels unless the staff user is authorized for that parish.

## Human Approval Requirements

AI output must remain human-reviewed.

Human approval is required before:

- Sending or scheduling an email.
- Sending SMS or other future outbound communication.
- Updating request status.
- Assigning staff or priest.
- Completing workflow steps.
- Approving or rejecting documents.
- Creating, editing, correcting, or annotating sacramental records.
- Generating or issuing certificates.
- Marking a pastoral or sacramental decision as complete.
- Communicating eligibility, readiness, or canonical status.

AI may suggest, summarize, draft, or flag. Staff must decide and take the action.

## Audit Metadata Requirements

Future AI actions should create audit metadata that records:

- Staff user email or user ID.
- Parish ID and active parish context.
- Target object type and ID.
- AI feature used.
- Input data classes used, with safe source references.
- Output destination, such as draft only, saved summary, sent email, or internal note.
- Whether staff accepted, edited, discarded, or sent the output.
- Model/provider family where safe to record.
- Timestamp.
- Error or blocked reason when retrieval is denied.

Do not store prompts or outputs in audit logs if they contain unnecessary private data. Store safe references and summaries where possible.

## Family-Facing Boundaries

AI output must not appear on family-facing pages unless explicitly approved and designed for that purpose.

Family-facing pages must not expose:

- Internal staff notes.
- AI notes.
- Audit logs.
- Token hashes.
- Staff-only communication history.
- Private parish data.
- Cross-parish context.
- Pastoral assessments or eligibility notes.
- Sacramental/canonical decision rationale.

If Vinea later adds family-facing AI explanations, they must be separately approved, source-limited, reviewed by staff, and tested against the family portal safety rules.

## Sacramental And Canonical Restrictions

AI must not make or finalize Catholic sacramental/canonical decisions.

AI must not:

- Determine sacramental eligibility.
- Decide whether a certificate should be issued.
- Correct sacramental registers.
- Add canonical notations.
- Interpret diocesan canonical policy as a final authority.
- Decide marriage preparation readiness.
- Decide OCIA readiness or sacramental reception.
- Replace pastor, deacon, DRE, OCIA coordinator, or parish staff judgment.

AI may:

- Summarize submitted information for staff review.
- Draft staff-reviewed emails.
- Suggest missing administrative items.
- Flag records that may need human review.
- Help prepare internal handoff summaries.

## Data Retention Requirements

AI inputs and outputs are sensitive derived data.

Retention expectations:

- Unsent and unsaved AI drafts should be treated as transient where practical.
- AI output saved to a request, note, communication, record, or audit trail should follow the parent object's retention policy.
- Sent AI-assisted emails should follow communication-history retention.
- AI summaries saved as internal notes should remain staff-only and follow internal-note retention.
- AI prompts and raw provider payloads should not be retained longer than needed for troubleshooting unless approved by product and legal/data owner.
- AI data retention must align with `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`.

## Incident Response Requirements

AI-related incidents should use the parish data access incident process when AI may expose:

- Wrong-parish data.
- Staff-only data.
- Internal notes.
- Family portal data.
- Document contents.
- Sacramental/canonical records.
- Private communications.

Relevant docs:

- Incident response runbook: `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`
- Incident evidence template: `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`
- Customer communication templates: `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`

## Implementation Gates Before Coding

Do not build broad AI retrieval until:

1. Product owner approves AI use cases.
2. Legal/data owner reviews AI privacy, retention, provider, and customer communication implications.
3. Parish/canonical record owner approves sacramental/canonical restrictions.
4. Engineering designs permission-scoped retrieval DTOs and source labels.
5. Security/data owner approves AI audit metadata.
6. Family portal safety tests explicitly block AI/internal note leakage.
7. Non-production tests prove AI cannot retrieve cross-parish data.
8. Staff UI clearly labels AI output as draft/review-required.
9. Source-level route preflight tests pass before any OpenAI route wiring is merged.
10. Disabled-by-default runtime gates preserve legacy behavior until product owner approval and QA evidence exist.

## Public Trust-Center Claim Boundaries

Safe internal statement:

> Vinea has prepared an AI safety and permission-scoped retrieval policy covering AI summaries, email drafts, source display, human approval, audit metadata, family-facing boundaries, sacramental/canonical restrictions, and data retention.

Do not claim:

- AI retrieval is fully permission-scoped.
- AI outputs have complete source citations.
- AI can act autonomously.
- AI decisions are pastorally, canonically, or legally authoritative.
- AI output is approved for family-facing display.
- AI retention automation is complete.

## Recommended Future Engineering Phases

1. Add AI feature registry and allowed data-class map. `Completed as non-runtime contract.`
2. Add permission-scoped retrieval DTOs for request summaries only. `Completed as non-runtime contract.`
3. Add source display for request summaries and email drafts. `Completed as non-runtime source-display contract.`
4. Add AI audit metadata for summary/draft creation and staff disposition. `Completed as non-runtime audit metadata contract.`
5. Add staff UI labels for draft/review-required state. `Completed as non-runtime staff review/status contract.`
6. Add tests proving family portal excludes AI/internal staff data. `Completed as non-runtime family/cross-parish safety contract.`
7. Add tests proving active parish and membership scope constrain AI retrieval. `Completed as non-runtime family/cross-parish safety contract.`
8. Add runtime route wiring plan and source-level preflight tests for `/api/ai/summary` and `/api/ai/reply`. `Completed as non-runtime plan and source preflight.`
9. Add disabled-by-default runtime gate and scaffold plan for `/api/ai/summary`. `Completed as disabled-by-default route gate.`
10. Add a non-production `/api/ai/summary` safety-chain adapter behind the enabled gate. `Completed as fail-closed adapter before OpenAI.`
11. Expand retrieval only after request-level scope is proven and runtime route wiring is explicitly approved.

## Final Outcome

- Current outcome: `AI safety policy, non-runtime feature registry, request-summary retrieval DTO, AI reply retrieval DTO, source-display DTO, audit metadata DTO, staff review/status DTO, family/cross-parish safety contract, route wiring preflight, summary runtime gate, and summary safety-chain adapter prepared; runtime AI generation safety layer not complete`
- Current recommendation: `Review this policy with product, legal/data, parish/canonical, security/data, and engineering owners before implementing broad AI retrieval`
