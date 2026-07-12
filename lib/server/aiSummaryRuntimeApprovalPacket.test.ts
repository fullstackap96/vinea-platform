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
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ENABLED_VALUE,
  AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
} from './aiSummarySafeResponseExposureAcceptance'
import {
  AI_SUMMARY_SAFETY_RUNTIME_ACK,
  AI_SUMMARY_SAFETY_RUNTIME_ACK_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_ENABLED_VALUE,
  AI_SUMMARY_SAFETY_RUNTIME_FLAG,
} from './aiSummaryRuntimeGate'

const root = process.cwd()
const checklistPath = join(root, 'docs', 'AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md')
const packetPath = join(root, 'docs', 'AI_SUMMARY_RUNTIME_PRODUCT_OWNER_APPROVAL_PACKET_20260627.md')
const runtimePlanPath = join(root, 'docs', 'AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md')
const summaryRoutePath = join(root, 'app', 'api', 'ai', 'summary', 'route.ts')
const replyRoutePath = join(root, 'app', 'api', 'ai', 'reply', 'route.ts')
const requiredEnvPath = join(root, 'lib', 'server', 'requiredEnv.ts')

describe('AI summary non-production runtime approval packet', () => {
  it('documents the manual QA gate sequence and exact flag states', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'AI Summary Non-Production Runtime Gate QA Checklist',
      'Status: Manual QA checklist only. The live route remains fail-closed and this phase does not enable any runtime flags.',
      'Gate 0: Flag-Off Legacy Regression',
      'Gate 1: Base Safety Runtime Enabled, Still Fail-Closed',
      'Gate 2: Audit-Write Approval Enabled',
      'Gate 3: Safe-Response Exposure Approval Enabled',
      'Gate 4: Generation Approval Enabled',
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
      expect(checklist).toContain(required)
    }
  })

  it('covers denial cases, monitoring, rollback, and sign-off fields', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Cross-Parish Denial',
      'Forged Active Parish Cookie Denial',
      'Family Portal Denial',
      'Family portal pages and APIs do not call `/api/ai/summary`.',
      'Cross-parish attempt fails before audit write and before OpenAI.',
      'Monitoring',
      'OpenAI call count or provider log observation.',
      'Audit row count and metadata inspection result.',
      'Rollback',
      'Re-run Gate 0 flag-off legacy regression.',
      'Rollback pass criteria:',
      'No database rollback is required for flag rollback.',
      'Sign-Off Fields',
      'QA operator:',
      'Technical owner:',
      'Security/data owner:',
      'Product owner:',
      'Decision: APPROVE_NONPRODUCTION_AI_SUMMARY_SAFETY_CHAIN / DO_NOT_APPROVE',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('documents product-owner go/no-go gates and evidence capture', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'AI Summary Runtime Product-Owner Approval Packet',
      'Status: Product-owner approval packet only. Runtime AI summary safety-chain generation is not approved by this document.',
      'Approval is for non-production validation only.',
      'Required Approval Sequence',
      'Approve flag-off legacy regression.',
      'Approve audit-write gate validation.',
      'Approve safe-response exposure gate validation.',
      'Approve generation gate validation.',
      'Approve cross-parish denial validation.',
      'Approve family portal denial validation.',
      'Go/No-Go Criteria',
      'OpenAI is called before audit-write, safe-response exposure, and generation approvals are all satisfied.',
      'Rollback cannot restore flag-off legacy behavior.',
      'Evidence Capture',
      'Final decision: GO_NONPRODUCTION_ONLY / NO_GO',
      'Monitoring Expectations',
      'Rollback Decision Criteria',
      'Sign-Off',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('links the approval packet to the supporting AI safety docs', () => {
    const packet = readFileSync(packetPath, 'utf8')
    const runtimePlan = readFileSync(runtimePlanPath, 'utf8')

    for (const required of [
      'docs/AI_SUMMARY_RUNTIME_GATE_SCAFFOLD_PLAN_20260627.md',
      'docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md',
      'docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md',
      'docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md',
      'docs/AI_SUMMARY_NONPRODUCTION_QA_CHECKLIST_20260627.md',
      'docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_QA_EVIDENCE_20260627_COMPLETED.md',
      'docs/AI_SUMMARY_BROWSER_AUTH_NONPRODUCTION_FIXTURE_RERUN_EVIDENCE_20260627.md',
      'docs/AI_SUMMARY_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE_20260627.md',
    ]) {
      expect(packet).toContain(required)
    }

    expect(runtimePlan).toContain(
      'Safety-chain OpenAI generation has a separate approval packet: `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`.'
    )
  })

  it('records production readiness gates without approving production enablement', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const required of [
      'Production Approval Update',
      'Status: Production AI summary safety-chain enablement remains `NO_GO`.',
      'Browser-authenticated non-production QA passed',
      'Confirmed fixture rerun passed with a real safe cross-parish denied request.',
      'Confirmed fixture rerun passed with a valid safe family portal token tied to a required family document step.',
      'Remaining production-only approval gates',
      'Named product-owner approval for production enablement.',
      'Named technical owner approval for the production flag rollout.',
      'Named security/data owner approval for production parish-data exposure risk.',
      'Named monitoring owner and monitoring channel.',
      'Named rollback owner with authority to disable flags during the rollout window.',
      'Production-safe cross-parish denied request fixture approved for smoke testing.',
      'Production-safe family portal token fixture with required documents approved for smoke testing.',
      'Production-Safe Smoke-Test Data Requirements',
      'Production Flag Rollout Steps',
      'Production Rollback Steps',
      'Production Monitoring And Owner Requirements',
      'GO_PRODUCTION_LIMITED_ROLLOUT',
      'ROLLBACK',
    ]) {
      expect(packet).toContain(required)
    }
  })

  it('confirms summary safety-chain gates are wired while reply and required env stay untouched', () => {
    const summaryRoute = readFileSync(summaryRoutePath, 'utf8')
    const replyRoute = readFileSync(replyRoutePath, 'utf8')
    const requiredEnv = readFileSync(requiredEnvPath, 'utf8')

    for (const marker of [
      'AI_SUMMARY_AUDIT_WRITE_FLAG',
      'AI_SUMMARY_AUDIT_WRITE_ACK',
      'AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG',
      'AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK',
      'AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG',
      'AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK',
      'sourceDisplay: safetyChain.responseScaffold.sourceDisplay',
      'staffReview: safetyChain.responseScaffold.staffReview',
      'input: safetyChain.promptAssembly.prompt',
      'writeAuditEvent',
    ]) {
      expect(summaryRoute).toContain(marker)
    }

    expect(summaryRoute).not.toContain(".from('audit_events').insert")

    for (const marker of [
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
      'input: safetyChain.promptAssembly.prompt',
      'sourceDisplay: safetyChain.responseScaffold.sourceDisplay',
      'staffReview: safetyChain.responseScaffold.staffReview',
      'writeAuditEvent',
    ]) {
      expect(replyRoute).not.toContain(marker)
    }

    for (const marker of [
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
      'input: safetyChain.promptAssembly.prompt',
    ]) {
      expect(replyRoute).not.toContain(marker)
    }

    for (const flag of [
      AI_SUMMARY_AUDIT_WRITE_FLAG,
      AI_SUMMARY_AUDIT_WRITE_ACK,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_FLAG,
      AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_FLAG,
      AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK,
    ]) {
      expect(requiredEnv).not.toContain(flag)
    }
  })
})
