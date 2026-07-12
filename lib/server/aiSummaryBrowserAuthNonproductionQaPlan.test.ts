import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
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

vi.mock('server-only', () => ({}))

const root = process.cwd()
const planPath = join(
  root,
  'docs',
  'AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_PLAN_20260627.md'
)
const buildStatusPath = join(root, 'docs', 'VINEA_BUILD_STATUS.md')

describe('AI summary browser-authenticated non-production QA plan', () => {
  it('keeps the plan scoped to non-production without runtime, migration, reply, or RLS changes', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'AI Summary Browser-Authenticated Non-Production QA Plan And Evidence Template - 2026-06-27',
      'Status: Prepared as a production-readiness planning and evidence template only.',
      'Use only an explicitly approved non-production environment.',
      'Do not use production parishioner data.',
      'Do not enable production flags.',
      'Do not apply migrations.',
      'Do not change `/api/ai/reply`.',
      'Do not change operational RLS.',
      'Passing this browser-authenticated non-production QA does not approve production enablement.',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('requires safe browser-authenticated environment, staff, request, OpenAI, audit, and family portal evidence', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      '## Environment Approval',
      'QA operator',
      'Technical owner',
      'Security/data owner',
      'Product owner',
      'Rollback owner',
      'Monitoring owner/channel',
      '## Safe Test Data Requirements',
      'Safe staff account',
      'Same-parish request',
      'Cross-parish denied request',
      'Family portal token plan',
      'OpenAI provider setting',
      'Audit log inspection access',
      'Cleanup plan',
      '## Browser Setup',
      'Sign in with the safe staff account.',
      'Open the same-parish safe request detail page.',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('documents exact safety-chain flag gates and rollback state', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      '## Flag State Matrix',
      'Gate 0 flag-off legacy regression',
      'Gate 1 base safety runtime',
      'Gate 2 audit-write approval',
      'Gate 3 safe-response exposure',
      'Gate 4 generation approval',
      'Rollback',
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
      expect(plan).toContain(required)
    }
  })

  it('requires browser QA evidence for each runtime gate, denial case, monitoring, rollback, and sign-off', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      '## Gate 0 Evidence: Flag-Off Legacy Regression',
      '## Gate 1 Evidence: Base Safety Runtime Fail-Closed',
      '## Gate 2 Evidence: Audit-Write Approval',
      '## Gate 3 Evidence: Safe-Response Exposure',
      '## Gate 4 Evidence: Safety-Chain Generation',
      '## Denial Evidence',
      'Cross-parish request',
      'Forged active parish cookie',
      'Unauthenticated browser request',
      'Family portal page',
      'Family portal API',
      '## Monitoring Evidence',
      'Pre-run `/api/health`',
      'Post-run `/api/health`',
      'OpenAI provider calls',
      'Audit row count',
      '## Rollback Evidence',
      'Legacy behavior restored',
      'Audit/provider quiet',
      '## Final Sign-Off',
      'GO_BROWSER_AUTH_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('forbids recording secrets, raw prompts, provider payloads, and private content in evidence', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const required of [
      'Do not record raw prompts, generated outputs, provider payloads, service role keys, session cookies, family portal raw tokens, signed URLs, internal note bodies, communication bodies, private document contents, token hashes, or secrets in this evidence.',
      'No raw prompt, generated output, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret',
      'No prompt assembly, audit preparation envelope, future audit event envelope, raw prompt, generated output, provider payload, token material, private material policy details, note body, communication body, document content, signed URL, hash, or secret',
      'No raw prompt, raw provider response, provider payload, token material, audit preparation envelope, private material policy details, note body, communication body, document content, signed URL, hash, or secret',
      'No real parishioner data appears in screenshots, logs, audit evidence, or copied text.',
    ]) {
      expect(plan).toContain(required)
    }
  })

  it('is recorded in build status as the next production-readiness phase', () => {
    const buildStatus = readFileSync(buildStatusPath, 'utf8')

    expect(buildStatus).toContain('AI Summary Browser-Authenticated Non-Production QA Plan Prepared')
    expect(buildStatus).toContain('AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_PLAN_20260627.md')
  })
})
