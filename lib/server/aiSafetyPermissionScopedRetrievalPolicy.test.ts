import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const policyPath = join(
  process.cwd(),
  'docs',
  'AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md'
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('AI safety and permission-scoped retrieval policy', () => {
  it('is explicitly policy-only and avoids production/runtime changes', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Status: Policy proposal and implementation-tracking document.',
      'Production was not accessed',
      'no migrations were applied',
      'flag-off runtime behavior remains legacy-compatible',
      'operational RLS was not changed',
      'This is not a runtime AI safety layer',
      'Current AI safety readiness: `POLICY, NON-RUNTIME DTO CONTRACTS, REQUEST SUMMARY RETRIEVAL DTO, AI REPLY RETRIEVAL DTO, SOURCE DISPLAY CONTRACT, AUDIT METADATA CONTRACT, STAFF REVIEW STATUS CONTRACT, FAMILY/CROSS-PARISH SAFETY CONTRACT, ROUTE WIRING PREFLIGHT, SUMMARY RUNTIME GATE, AND SUMMARY SAFETY-CHAIN ADAPTER PREPARED; RUNTIME AI GENERATION SAFETY LAYER NOT COMPLETE`',
      'Current outcome: `AI safety policy, non-runtime feature registry, request-summary retrieval DTO, AI reply retrieval DTO, source-display DTO, audit metadata DTO, staff review/status DTO, family/cross-parish safety contract, route wiring preflight, summary runtime gate, and summary safety-chain adapter prepared; runtime AI generation safety layer not complete`',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('covers summaries, drafts, retrieval, sources, approval, audit, family boundaries, canonical limits, and retention', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'AI summaries',
      'AI email drafts',
      '## Non-Runtime AI Feature Registry',
      'Vinea now has a non-runtime AI safety registry and allowed data-class map in `lib/aiSafetyRegistry.ts`.',
      'Current registry status: `NON-RUNTIME CONTRACT PREPARED, NOT WIRED INTO AI ROUTES`',
      '## Non-Runtime Request Summary Retrieval DTO',
      'Vinea now has a non-runtime request-summary retrieval DTO builder in `lib/aiRequestSummaryRetrievalDto.ts`.',
      'Current DTO status: `REQUEST SUMMARY DTO PREPARED, NOT WIRED INTO AI ROUTES`',
      '## Non-Runtime AI Reply Retrieval DTO',
      'Vinea now has a non-runtime AI reply retrieval DTO builder in `lib/aiReplyRetrievalDto.ts`.',
      'Current DTO status: `AI REPLY RETRIEVAL DTO PREPARED, NOT WIRED INTO AI ROUTES`',
      'Forbids autonomous send.',
      'The DTO builder does not query Supabase, does not call OpenAI, does not change prompt construction, does not write audit events, does not expose source display, does not persist staff disposition, and does not change `/api/ai/reply` behavior.',
      '## Non-Runtime Source Display DTO',
      'Vinea now has a non-runtime source display DTO builder in `lib/aiSourceDisplayDto.ts`.',
      'Current source-display DTO status: `SOURCE DISPLAY DTO PREPARED, NOT WIRED INTO AI ROUTES OR STAFF UI`',
      '## Non-Runtime AI Audit Metadata DTO',
      'Vinea now has a non-runtime AI audit metadata DTO builder in `lib/aiAuditMetadataDto.ts`.',
      'Current audit metadata DTO status: `AUDIT METADATA DTO PREPARED, NOT WIRED INTO AI ROUTES OR AUDIT LOG WRITES`',
      'Preserves staff disposition, such as pending review, accepted, edited, discarded, sent, or blocked.',
      'Carries source-display summary metadata without storing internal note bodies, communication bodies, document contents, provider payloads, token material, prompts, or generated text.',
      '## Non-Runtime Staff Review Status DTO',
      'Vinea now has a non-runtime AI staff review/status DTO builder in `lib/aiStaffReviewStatusDto.ts`.',
      'Current staff review/status DTO status: `STAFF REVIEW STATUS DTO PREPARED, NOT WIRED INTO AI ROUTES OR STAFF UI`',
      'Distinguishes draft, review-required, saved, sent, discarded, and blocked states.',
      'Fails closed when a review label would misrepresent the audit metadata, such as marking an unsent draft as sent.',
      '## Non-Runtime Family And Cross-Parish AI Safety Contract',
      'Vinea now has a non-runtime family-portal and cross-parish AI safety contract builder in `lib/aiFutureRetrievalSafetyContract.ts`.',
      'Current family/cross-parish AI safety contract status: `FAMILY/CROSS-PARISH SAFETY CONTRACT PREPARED, NOT WIRED INTO AI ROUTES`',
      'Uses the AI feature registry, request-summary retrieval DTO, AI reply retrieval DTO, source-display DTO, audit metadata DTO, and staff review/status DTO.',
      'Blocks family-portal AI retrieval and marks AI output as not approved for family-facing display.',
      'Blocks cross-parish retrieval when active parish context does not match the request parish.',
      'Uses generic public blocked reasons while preserving internal blocked reasons for staff-only audit/review contexts.',
      '## Non-Runtime AI Runtime Route Wiring Plan',
      'Vinea now has a non-runtime runtime route wiring plan in `docs/AI_RUNTIME_ROUTE_WIRING_PLAN_20260627.md`.',
      'Vinea also has source-level preflight tests in `lib/server/aiRouteRuntimeWiringPreflight.test.ts` and a source validator in `lib/server/aiRouteRuntimeWiringPreflight.ts`.',
      'Current AI route wiring plan status: `ROUTE WIRING PLAN AND PREFLIGHT PREPARED, SUMMARY ROUTE GATED, REPLY ROUTE NOT CHANGED`',
      'Requires authentication before OpenAI.',
      'Requires active parish scope before OpenAI.',
      'Requires object-level request scope before OpenAI.',
      'Requires family-portal and cross-parish exclusions before OpenAI.',
      'Requires source-display DTOs before OpenAI.',
      'Requires AI audit metadata DTOs before OpenAI.',
      'Requires staff review/status DTOs before OpenAI.',
      'Requires generic blocked errors before OpenAI.',
      '## Disabled-By-Default AI Summary Runtime Gate And Adapter',
      'Vinea now has a disabled-by-default runtime gate, scaffold plan, and non-production safety-chain adapter for future `/api/ai/summary` safety-chain wiring in `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`.',
      'Current AI summary gate scaffold status: `DISABLED-BY-DEFAULT GATE AND SAFETY-CHAIN ADAPTER WIRED INTO SUMMARY ROUTE, GENERATION STILL FAILS CLOSED`',
      'lib/server/aiSummarySafetyChainAdapter.ts',
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED',
      'VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME',
      'legacy_staff_gated_summary_route',
      'permission_scoped_summary_safety_chain',
      '## Permission-Scoped Retrieval Requirements',
      'Retrieval must fail closed when scope cannot be resolved.',
      '## Source Display Requirements',
      'Source object type, such as request, workflow step, document, note, communication, person, household, or sacramental record.',
      '## Human Approval Requirements',
      'AI may suggest, summarize, draft, or flag. Staff must decide and take the action.',
      '## Audit Metadata Requirements',
      '## Family-Facing Boundaries',
      '## Sacramental And Canonical Restrictions',
      'AI must not make or finalize Catholic sacramental/canonical decisions.',
      '## Data Retention Requirements',
      'AI data retention must align with `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('blocks unsafe AI claims and autonomous pastoral/canonical/outbound actions', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Do not claim:',
      'AI retrieval is fully permission-scoped.',
      'AI outputs include complete source citations.',
      'AI can make pastoral, sacramental, canonical, legal, or outbound communication decisions.',
      'AI-generated content is safe to show to families without staff review.',
      'AI routes are enforced by the registry.',
      'AI route preflight tests are runtime enforcement.',
      'AI routes generate output from the safety DTO chain.',
      'Request summary AI retrieval is runtime-enforced.',
      'Request summary prompts are now built from the DTO.',
      'AI reply retrieval is runtime-enforced.',
      'AI reply prompts are now built from the DTO.',
      'AI reply drafts are safe to send without staff review.',
      'Runtime AI route safety is complete.',
      'OpenAI prompts are currently built from permission-scoped retrieval DTOs.',
      'The source-level preflight tests replace runtime QA.',
      '/api/ai/summary` generates AI summaries from the safety DTO chain.',
      'The summary safety-chain flags are enabled in production.',
      'The scaffold replaces route-level QA or manual QA.',
      'AI source display is visible in the product.',
      'AI source display is runtime-enforced.',
      'AI audit metadata is fully recorded at runtime.',
      'AI audit events are written for summaries or email drafts at runtime.',
      'Staff disposition is recorded in the database for AI output yet.',
      'AI staff review labels are visible in the staff UI.',
      'AI staff review labels are runtime-enforced.',
      'Family portal AI retrieval is runtime-blocked by this contract yet.',
      'Cross-parish AI retrieval is runtime-blocked by this contract yet.',
      'AI must not autonomously send communications.',
      'Determine sacramental eligibility.',
      'Decide whether a certificate should be issued.',
      'Correct sacramental registers.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('updates the trust-center packet while preserving conservative AI claims', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'AI safety and permission-scoped retrieval policy: `docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md`',
      'Non-runtime AI feature registry and allowed data-class map: `lib/aiSafetyRegistry.ts`',
      'Non-runtime request-summary retrieval DTO builder: `lib/aiRequestSummaryRetrievalDto.ts`',
      'Non-runtime source display DTO builder: `lib/aiSourceDisplayDto.ts`',
      'Non-runtime AI audit metadata DTO builder: `lib/aiAuditMetadataDto.ts`',
      'Non-runtime AI staff review/status DTO builder: `lib/aiStaffReviewStatusDto.ts`',
      'Non-runtime family/cross-parish AI safety contract builder: `lib/aiFutureRetrievalSafetyContract.ts`',
      'Non-runtime AI runtime route wiring plan: `docs/AI_RUNTIME_ROUTE_WIRING_PLAN_20260627.md`',
      'Source-level AI route preflight validator: `lib/server/aiRouteRuntimeWiringPreflight.ts`',
      'Source-level AI route preflight tests: `lib/server/aiRouteRuntimeWiringPreflight.test.ts`',
      'Disabled-by-default AI summary runtime gate scaffold plan: `docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md`',
      'Disabled-by-default AI summary runtime gate: `lib/server/aiSummaryRuntimeGate.ts`',
      'AI summary runtime scaffold descriptor: `lib/server/aiSummaryRuntimeScaffold.ts`',
      'Fail-closed AI summary safety-chain adapter: `lib/server/aiSummarySafetyChainAdapter.ts`',
      '| AI privacy | AI summary/reply routes, AI safety policy, non-runtime AI feature registry/data-class map, request-summary retrieval DTO, source-display DTO, audit metadata DTO, staff review/status DTO, family/cross-parish safety contract, route-wiring source preflight, disabled summary runtime gate wiring, and a fail-closed summary safety-chain adapter exist, but DTO-backed prompt construction, runtime permission-scoped AI generation, staff-visible source display, and audit event writes are not complete | `POLICY, SUMMARY GATE, AND FAIL-CLOSED ADAPTER WIRED; GENERATION SAFETY LAYER NOT COMPLETE` | Wire approved DTOs into AI prompt construction only after preflight gates, disabled runtime gates, staff UI labels, human approval labels, runtime AI audit writes, family-portal safety tests, and cross-parish runtime tests are designed |',
      'Current status: `POLICY, SUMMARY GATE, AND FAIL-CLOSED ADAPTER WIRED; RUNTIME GENERATION SAFETY LAYER NOT COMPLETE`',
      'Current safe claim:',
      'Vinea supports staff-gated AI-assisted summaries and email drafts for parish request workflows.',
      'Do not claim AI generation is fully permission-scoped until retrieval DTOs, source display, audit metadata, and cross-parish/family-portal safety tests are implemented in the generating route path.',
      'Do not claim the AI feature registry is runtime-enforced for generation until the AI routes are deliberately wired to it and tested.',
      'Do not claim the request-summary retrieval DTO is runtime-enforced for generation until `/api/ai/summary` builds prompts from it and passes flag-on QA.',
      'Do not claim AI source display is visible or runtime-enforced until `/api/ai/summary`, `/api/ai/reply`, and the staff UI are deliberately wired to the source-display DTO and tested.',
      'Do not claim AI audit metadata is recorded at runtime until `/api/ai/summary`, `/api/ai/reply`, staff disposition handling, and audit event writes are deliberately wired to the audit metadata DTO and tested.',
      'Do not claim AI staff review labels are visible or runtime-enforced until `/api/ai/summary`, `/api/ai/reply`, staff disposition handling, and staff UI are deliberately wired to the staff review/status DTO and tested.',
      'Do not claim family-portal or cross-parish AI generation blocking is runtime-enforced until `/api/ai/summary`, `/api/ai/reply`, family portal routes, active parish scope, membership scope, and runtime tests are deliberately wired to the family/cross-parish safety contract and tested.',
      'Do not claim AI route source-level preflight is runtime enforcement. It is a merge-time guard for future route wiring, not live permission-scoped retrieval.',
      'Do not claim the disabled AI summary runtime gate is full AI safety enforcement until `/api/ai/summary` generates from the safety DTO chain and passes flag-off and flag-on QA.',
      'A rule that AI cannot autonomously make canonical, pastoral, sacramental, legal, or outbound communication decisions.',
      'AI safety limitations are documented.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
