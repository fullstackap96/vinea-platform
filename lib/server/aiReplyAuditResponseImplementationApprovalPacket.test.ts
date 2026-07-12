import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('AI reply audit/response implementation approval packet', () => {
  it('keeps future implementation approval non-production, scoped, and production-blocked', () => {
    const root = process.cwd()
    const doc = readFileSync(
      join(root, 'docs', 'AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md'),
      'utf8'
    )
    const readme = readFileSync(join(root, 'README.md'), 'utf8')
    const buildStatus = readFileSync(join(root, 'docs', 'VINEA_BUILD_STATUS.md'), 'utf8')

    for (const required of [
      'AI Reply Audit-Write And Safe-Response Implementation Approval Packet',
      'product-owner approval packet only',
      'does not approve implementation',
      'does not enable production flags',
      'does not write audit events',
      'does not expose source display',
      'does not call OpenAI',
      'does not send email',
      'I approve non-production implementation of the AI reply audit-write and safe-response exposure gates only.',
      'VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION',
      'VINEA_AI_REPLY_AUDIT_WRITE=ENABLED',
      'VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA',
      'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED',
      'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA',
      'Build `buildAiReplySafetyChainAdapter(...)`',
      'existing `lib/aiReplyAuditEventSafety.ts` safe-event validator',
      'Validate `safetyChain.auditPreparation.futureAuditEvent` with `validateAiReplyAuditEventForSafeWrite(...)`.',
      'Write only the validated safe event through a safe writer.',
      'Record `safeAuditMetadataWritten = true` only after the safe audit metadata write completes.',
      'The future writer must call `validateAiReplyAuditEventForSafeWrite(...)` before insert',
      'must record `safeAuditMetadataWritten = true` only after the safe write succeeds',
      'must also require `safeAuditMetadataWritten = true` before response exposure is considered',
      'The source-level preflight must require complete marker sets for each gate.',
      'Future audit-write and safe-response code must not pass by including only one partial marker',
      'safe-response gate enabled still blocks if the safe audit write fails',
      'Keep OpenAI generation disabled.',
      'raw prompt text',
      'generated output',
      'provider payloads',
      'token material',
      'signed URLs',
      'storage paths',
      'document contents',
      'send controls',
      'Production AI reply remains `NO-GO`',
      'lib/server/aiReplyAuditResponseGatePreflight.test.ts',
    ]) {
      expect(doc).toContain(required)
    }

    expect(readme).toContain(
      'docs/AI_REPLY_AUDIT_RESPONSE_IMPLEMENTATION_APPROVAL_PACKET_20260707.md'
    )
    expect(buildStatus).toContain('AI Reply Audit-Write And Safe-Response Implementation Approval Packet')
  })
})
