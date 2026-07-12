import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI reply audit/response non-production QA packet', () => {
  it('defines label-only non-production QA gates while keeping production AI reply blocked', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')

    for (const required of [
      'AI Reply Audit-Write And Safe-Response Non-Production QA Packet',
      'Prepared as a non-runtime QA and acceptance packet only.',
      'does not wire runtime routes',
      'does not write audit events',
      'does not expose source display to clients',
      'does not call OpenAI',
      'does not send email',
      'does not mutate records',
      'Use only an explicitly approved non-production target.',
      'Do not record raw passwords',
      'VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION',
      'VINEA_AI_REPLY_AUDIT_WRITE=ENABLED',
      'VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA',
      'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED',
      'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA',
      '`validateAiReplyAuditEventForSafeWrite(...)` runs before `writeAiReplyAuditMetadata(...)`',
      'safe-response exposure requires `safeAuditMetadataWritten = true` after the validated audit write completes',
      '`validateAiReplyResponseScaffoldForSafeExposure(...)` runs before `buildSafeAiReplyResponse(...)`',
      'Gate 0: Flag-Off Baseline',
      'Gate 1: Safety Runtime With Audit Gate Off',
      'Gate 2: Audit-Write Approval',
      'Gate 3: Safe-Response Exposure Approval',
      'Cross-parish request or forged active parish',
      'Family portal or unauthenticated request',
      'No record mutations occur except the approved safe non-production audit metadata write',
      'must fail closed if the safe audit write fails',
      'Rollback is flag-only',
      'Production AI reply remains `NO-GO`',
      'I approve non-production QA execution for the AI reply audit-write and safe-response gates only.',
    ]) {
      expect(doc).toContain(required)
    }

    for (const forbidden of [
      'VINEA_AI_REPLY_OPENAI_GENERATION=ENABLED',
      'APPROVED_AI_REPLY_GENERATION_QA',
      'production AI reply is approved',
      'production safe-response exposure is approved',
    ]) {
      expect(doc).not.toContain(forbidden)
    }

    expect(readme).toContain(
      'docs/AI_REPLY_AUDIT_RESPONSE_NONPRODUCTION_QA_PACKET_20260708.md'
    )
    expect(buildStatus).toContain(
      'AI Reply Audit-Write And Safe-Response Non-Production QA Packet'
    )
  })
})
