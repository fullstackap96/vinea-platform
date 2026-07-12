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
  'AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md'
)
const approvalPacketPath = join(
  root,
  'docs',
  'AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md'
)

describe('AI summary production smoke-test evidence template', () => {
  it('is explicitly a non-executing production-readiness template', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'AI Summary Production Smoke-Test Evidence Template - 2026-06-27',
      'Status: Template prepared only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no migrations were applied',
      '`/api/ai/reply` was not changed',
      'operational RLS was not changed',
      'Current outcome: `Evidence template prepared; production rollout not executed`',
      'Current recommendation: `Do not enable production AI summary safety-chain flags until approval, smoke-test data, monitoring, rollback, and sign-off are complete`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links completed evidence and approval sources', () => {
    const template = readFileSync(templatePath, 'utf8')
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'docs/AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md',
      'docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md',
      'docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md',
      'docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md',
      'docs/AI_SUMMARY_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260627.md',
    ]) {
      expect(template).toContain(expected)
    }

    expect(packet).toContain('docs/AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md')
  })

  it('captures owner, monitoring, rollback, and production fixture fields', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Rollout Identity',
      'Product owner',
      'Technical owner',
      'Security/data owner',
      'Monitoring owner',
      'Monitoring channel',
      'Rollback owner',
      'GO_PRODUCTION_LIMITED_ROLLOUT',
      '## Production-Safe Fixture Checklist',
      'Staff account',
      'Staff parish membership',
      'Active parish',
      'Same-parish request',
      'Cross-parish denied request',
      'Family portal token plan',
      'Required document fixture',
      'Audit-log access',
      'Cleanup plan',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures exact staged AI summary flag states', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Flag State Matrix',
      'Gate 0 flag-off baseline',
      'Gate 1 base safety runtime',
      'Gate 2 audit-write approval',
      'Gate 3 safe-response exposure',
      'Gate 4 safety-chain generation',
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
      expect(template).toContain(expected)
    }
  })

  it('requires baseline, staged flag-on, denial, family portal, audit, and monitoring evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Pre-Rollout Health And Baseline',
      '`/api/health`',
      'Flag-off baseline for `/api/ai/summary`',
      '`/api/ai/reply`',
      '## Gate 0: Flag-Off Baseline Evidence',
      '## Gate 1: Base Safety Runtime Evidence',
      '## Gate 2: Audit-Write Evidence',
      '## Gate 3: Safe-Response Exposure Evidence',
      '## Gate 4: Safety-Chain Generation Evidence',
      '## Cross-Parish Denial Evidence',
      'Generic denial before audit write and before OpenAI',
      'Response does not confirm whether another parish request exists',
      '## Family Portal And Document Safety Evidence',
      'Required family document step is visible with upload controls',
      'No AI controls, source display, staff review, audit metadata, internal notes, AI notes, staff navigation, prompt/provider/token indicators, signed URLs, token hashes, or private parish data',
      '## Audit-Log Checks',
      'Only approved AI summary event names appear',
      '## Monitoring Observations',
      'OpenAI request count',
      'Audit event write count',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires rollback verification, cleanup, final sign-off, and privacy exclusions', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Evidence Privacy Rules',
      'Do not paste:',
      'Raw family portal tokens',
      'Signed document URLs',
      'Raw prompt text',
      'Raw generated summary text',
      'Provider request or response payloads',
      'Private document contents',
      '## Rollback Verification',
      'Clear generation flags',
      'Clear safe-response flags',
      'Clear audit-write flags',
      'Clear base runtime flags',
      'Re-run `/api/health`',
      'Re-run legacy same-parish smoke',
      '## Cleanup And Deactivation',
      'Family portal token',
      'Evidence redaction',
      '## Rollback Decision',
      'Rollback immediately if:',
      '## Final Sign-Off',
      'ROLLBACK_COMPLETED',
      'NO_GO_PRODUCTION_AI_SUMMARY_SAFETY_CHAIN',
      'Production rollout cancelled before flags changed',
    ]) {
      expect(template).toContain(expected)
    }
  })
})
