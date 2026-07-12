import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  AI_SUMMARY_AUDIT_WRITE_ACK,
  AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
  AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
  AI_SUMMARY_AUDIT_WRITE_FLAG,
} from './aiSummaryAuditWriteApproval'
import {
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
} from './aiSummaryGenerationApproval'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from './aiSummaryRuntimeGate'
import {
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from './aiSummarySafeResponseExposureAcceptance'

const root = process.cwd()
const templatePath = join(
  root,
  'docs',
  'AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md'
)
const approvalPacketPath = join(
  root,
  'docs',
  'AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md'
)

describe('AI summary non-production QA evidence template', () => {
  it('records a completed non-production-only evidence run without migration or runtime side effects', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      'AI Summary Non-Production Safety-Chain QA Evidence - 2026-06-27',
      'Status: Completed in an explicitly approved non-production local route/test-harness environment.',
      'Non-production target confirmed: `Yes`',
      'Production flags were not enabled: `Yes`',
      'Production data was not used: `Yes`',
      'No migrations were applied: `Yes`',
      '`/api/ai/reply` behavior was not changed: `Yes`',
      'Operational RLS was not changed: `Yes`',
      'Final approval scope | `NON_PRODUCTION_ONLY`',
      'GO_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN_TEST_HARNESS',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
      'Current outcome: `All /api/ai/summary safety-chain QA gates passed in the non-production local route/test-harness environment: flag-off legacy regression, base safety runtime, audit-write approval, safe-response exposure, safety-chain generation, cross-parish/forged-active-parish denial, unauthenticated family-style denial, monitoring review, and rollback`',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('captures exact runtime flag states for every QA gate', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      '## Flag State Matrix',
      'Gate 0 flag-off legacy regression',
      'Gate 1 base safety runtime',
      'Gate 2 audit-write approval',
      'Gate 3 safe-response exposure',
      'Gate 4 generation approval',
      'Rollback',
      '`Pass in route test harness`',
      '`Pass: legacy behavior restored`',
      AI_SUMMARY_SAFETY_RUNTIME_FLAG,
      AI_SUMMARY_SAFETY_RUNTIME_ACK,
      AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
      AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_AUDIT_WRITE_ENABLED_VALUE,
      AI_SUMMARY_AUDIT_WRITE_ACK_VALUE,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ENABLED_VALUE,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK_VALUE,
    ]) {
      expect(template).toContain(required)
    }
  })

  it('requires evidence for legacy regression, audit, safe response, generation, and denial cases', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      '## Gate 0: Flag-Off Legacy Regression Evidence',
      'Flag-off behavior is exactly legacy-compatible: `Pass`',
      '## Gate 1: Base Safety Runtime Fail-Closed Evidence',
      'HTTP `503` and `{ ok: false, error: \'ai_retrieval_unavailable\' }`',
      '## Gate 2: Audit-Write Evidence',
      'Runtime audit write gate: `Pass`',
      'Staff identity, parish scope, active parish context, target request, feature ID, input data classes, safe source references, output destination, staff disposition, provider/model family placeholder, blocked reason',
      '## Gate 3: Safe-Response Exposure Evidence',
      'Source display, if exposed after approval',
      'Staff review/status, if exposed after approval',
      'Response evidence exposes only safe source/review scaffolding after approval: `Pass`',
      '## Gate 4: Generation Evidence',
      'Runtime generation gate: `Pass in local route/test-harness environment`',
      '## Cross-Parish And Family-Portal Denial Evidence',
      'Cross-parish request ID with unauthorized active parish',
      'Forged active parish cookie',
      'Family portal page attempts to access AI summary path',
      'Family portal response inspection',
      'Denials are generic and do not reveal whether another parish request exists: `Pass for route/test-harness and adapter-level cases`',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('captures monitoring, rollback, unresolved risks, and sign-off', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      '## Monitoring Observations',
      '`/api/health` before run',
      '`/api/health` after run',
      'OpenAI provider call count',
      'Safe AI audit row count',
      'Security/privacy observations',
      '## Rollback Results',
      'Disable generation flags',
      'Disable safe-response exposure flags',
      'Disable audit-write flags',
      'Disable base safety runtime flags',
      'Re-run Gate 0 legacy regression',
      'No database rollback is required for flag rollback: `Pass`',
      '## Unresolved Risks',
      'This run used local route/test harness rather than browser-authenticated staff session',
      'OpenAI and audit writes were mocked',
      '## Sign-Off',
      'Security/data owner',
      'Product owner',
      'GO_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN_TEST_HARNESS',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('forbids secrets, raw prompts, raw outputs, provider payloads, and private content in evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const forbiddenEvidenceClass of [
      'Raw prompts were not copied into this evidence record: `Yes`',
      'Raw AI outputs were not copied into this evidence record: `Yes`',
      'Provider payloads were not copied into this evidence record: `Yes`',
      'Token material, session cookies, service role keys, family portal raw tokens, and signed document URLs were not copied into this evidence record: `Yes`',
      'Internal note bodies and private document contents were not copied into this evidence record: `Yes`',
      'Forbidden audit data absent',
      'Forbidden response data absent',
      'Evidence does not store raw prompt text, raw generated output, provider payload, token material, internal note bodies, or private document contents: `Pass`',
    ]) {
      expect(template).toContain(forbiddenEvidenceClass)
    }
  })

  it('is linked from the product-owner approval packet', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    expect(packet).toContain('docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md')
  })
})
