import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_VERSION,
  validateFutureAiReplyAuditResponseGateSource,
} from './aiReplyAuditResponseGatePreflight'

const root = process.cwd()
const docPath = join(root, 'docs', 'AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_20260707.md')

const approvedFutureGateSketch = `
const runtimeEnv = process.env.VINEA_AI_REPLY_RUNTIME_ENV
if (process.env.VERCEL_ENV === 'production') return failClosedAiReply('ai_reply_unavailable')
if (runtimeEnv !== 'NON_PRODUCTION') return failClosedAiReply('ai_reply_unavailable')

const safetyChain = await buildAiReplySafetyChainAdapter({
  request,
  body,
  staff,
  staffSupabase,
})
if (!safetyChain.ok) return failClosedAiReply(safetyChain.genericBlockedReason)

const auditPreparation = safetyChain.auditPreparation
if (auditPreparation.writeStatus !== 'not_written') return failClosedAiReply('ai_reply_unavailable')

const auditWriteGate = getAiReplyAuditWriteRuntimeGate({
  flag: process.env.VINEA_AI_REPLY_AUDIT_WRITE,
  ack: process.env.VINEA_AI_REPLY_AUDIT_WRITE_ACK,
  requiredAck: 'APPROVED_AI_REPLY_AUDIT_WRITE_QA',
  environment: runtimeEnv,
})
if (!auditWriteGate.enabled) return failClosedAiReply(safetyChain.genericBlockedReason)

const safeAuditEvent = validateAiReplyAuditEventForSafeWrite(auditPreparation.futureAuditEvent)
if (!safeAuditEvent.ok) return failClosedAiReply(safetyChain.genericBlockedReason)

let safeAuditMetadataWritten = false
await writeAiReplyAuditMetadata({
  futureAuditEvent: safeAuditEvent.dto.event,
  safeMetadataOnly: true,
})
safeAuditMetadataWritten = true

const safeResponseGate = getAiReplySafeResponseRuntimeGate({
  flag: process.env.VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE,
  ack: process.env.VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK,
  requiredAck: 'APPROVED_AI_REPLY_SAFE_RESPONSE_QA',
  environment: runtimeEnv,
})
// rollback by disabling flags
if (!safeAuditMetadataWritten || !safeResponseGate.enabled) {
  return failClosedAiReply(safetyChain.genericBlockedReason)
}

const safeResponse = validateAiReplyResponseScaffoldForSafeExposure(safetyChain.responseScaffold)
if (!safeResponse.ok) return failClosedAiReply(safetyChain.genericBlockedReason)

return buildSafeAiReplyResponse({
  responseScaffold: safeResponse.dto.scaffold,
  genericBlockedReason: safetyChain.genericBlockedReason,
})
`

describe('AI reply audit/write and safe-response gate preflight', () => {
  it('accepts future gate source only when non-production, approval, audit, and response checks are ordered safely', () => {
    const result = validateFutureAiReplyAuditResponseGateSource(approvedFutureGateSketch)

    expect(result).toMatchObject({
      ok: true,
      version: AI_REPLY_AUDIT_RESPONSE_GATE_PREFLIGHT_VERSION,
      matchedMarkers: expect.objectContaining({
        non_production_environment_gate: 'VINEA_AI_REPLY_RUNTIME_ENV',
        audit_write_approval_gate: expect.any(String),
        safe_response_exposure_gate: expect.any(String),
        safety_chain_adapter: 'buildAiReplySafetyChainAdapter(',
        audit_metadata_preparation: 'safetyChain.auditPreparation',
        safe_audit_event_validator: 'validateAiReplyAuditEventForSafeWrite(',
        safe_audit_write: 'writeAiReplyAuditMetadata(',
        safe_audit_write_success: 'safeAuditMetadataWritten = true',
        safe_response_validator: 'validateAiReplyResponseScaffoldForSafeExposure(',
        safe_response_builder: 'buildSafeAiReplyResponse(',
        generic_blocked_errors: 'ai_reply_unavailable',
        rollback_noop: 'return failClosedAiReply(',
      }),
      markerIndexes: expect.any(Object),
      forbiddenMarkersPresent: [],
      errors: [],
    })

    expect(result.markerIndexes.safety_chain_adapter).toBeLessThan(
      result.markerIndexes.audit_write_approval_gate
    )
    expect(result.markerIndexes.audit_metadata_preparation).toBeLessThan(
      result.markerIndexes.safe_audit_event_validator
    )
    expect(result.markerIndexes.safe_audit_event_validator).toBeLessThan(
      result.markerIndexes.safe_audit_write
    )
    expect(result.markerIndexes.safe_audit_write).toBeLessThan(
      result.markerIndexes.safe_audit_write_success
    )
    expect(result.markerIndexes.safe_audit_write_success).toBeLessThan(
      result.markerIndexes.safe_response_exposure_gate
    )
    expect(result.markerIndexes.safe_response_validator).toBeLessThan(
      result.markerIndexes.safe_response_builder
    )
    expect(result.markerIndexes.safe_audit_write_success).toBeLessThan(
      result.markerIndexes.safe_response_builder
    )
  })

  it('rejects audit writes before safe audit metadata preparation', () => {
    const unsafe = approvedFutureGateSketch.replace(
      'const auditPreparation = safetyChain.auditPreparation',
      `await writeAiReplyAuditMetadata({ futureAuditEvent: unsafeMetadata })
const auditPreparation = safetyChain.auditPreparation`
    )

    const result = validateFutureAiReplyAuditResponseGateSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Safe audit-event validation must pass before any audit write.',
      ])
    )
  })

  it('rejects response exposure before the safe-response approval gate', () => {
    const unsafe = approvedFutureGateSketch.replace(
      'const safeResponseGate = getAiReplySafeResponseRuntimeGate',
      `return buildSafeAiReplyResponse({ responseScaffold: safetyChain.responseScaffold })
const safeResponseGate = getAiReplySafeResponseRuntimeGate`
    )

    const result = validateFutureAiReplyAuditResponseGateSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'Safe-response validation must pass before response exposure.',
      ])
    )
  })

  it('rejects future code that exposes safe response without recording successful audit write completion', () => {
    const unsafe = approvedFutureGateSketch
      .replace('\nlet safeAuditMetadataWritten = false', '')
      .replace('\nsafeAuditMetadataWritten = true', '')
      .replace(
        'if (!safeAuditMetadataWritten || !safeResponseGate.enabled) {',
        'if (!safeResponseGate.enabled) {'
      )

    const result = validateFutureAiReplyAuditResponseGateSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('safe_audit_write_success is missing'),
        'Safe audit metadata write success must be recorded only after the safe audit write.',
        'Safe response exposure gate must depend on a completed safe audit metadata write.',
      ])
    )
  })

  it('rejects future gate source that includes only partial markers for required reply gates', () => {
    const partialGateMarkers = `
const runtimeEnv = process.env.VINEA_AI_REPLY_RUNTIME_ENV
const safetyChain = await buildAiReplySafetyChainAdapter({})
const auditPreparation = safetyChain.auditPreparation
const auditWriteGate = getAiReplyAuditWriteRuntimeGate({})
const safeAuditEvent = validateAiReplyAuditEventForSafeWrite({})
await writeAiReplyAuditMetadata({})
safeAuditMetadataWritten = true
const safeResponseGate = getAiReplySafeResponseRuntimeGate({})
const safeResponse = validateAiReplyResponseScaffoldForSafeExposure({})
return buildSafeAiReplyResponse({
  genericBlockedReason: safetyChain.genericBlockedReason,
})
`

    const result = validateFutureAiReplyAuditResponseGateSource(partialGateMarkers)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('non_production_environment_gate is missing'),
        expect.stringContaining('audit_write_approval_gate is missing'),
        expect.stringContaining('safe_response_exposure_gate is missing'),
        expect.stringContaining('audit_metadata_preparation is missing'),
        expect.stringContaining('generic_blocked_errors is missing'),
        expect.stringContaining('rollback_noop is missing'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all markers from one set')
  })

  it('rejects raw prompt, provider payload, OpenAI, storage, and send markers in the future gate source', () => {
    const unsafe = `${approvedFutureGateSketch}
const rawPrompt = safetyChain.promptAssembly.prompt
const providerPayload = await openai.responses.create({ input: rawPrompt })
await sendEmail(providerPayload)
await supabase.storage.from('documents').createSignedUrl('path', 60)
`

    const result = validateFutureAiReplyAuditResponseGateSource(unsafe)

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(
      expect.arrayContaining([
        'rawPrompt',
        'providerPayload',
        'promptAssembly.prompt',
        'openai.responses.create',
        'sendEmail(',
        'createSignedUrl',
        '.storage',
      ])
    )
  })

  it('documents the non-runtime preflight boundary and production NO-GO state', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const required of [
      'AI Reply Audit-Write And Safe-Response Gate Preflight',
      'source-level preflight scaffold',
      'does not implement audit writes',
      'does not expose source display',
      'does not call OpenAI',
      'VINEA_AI_REPLY_RUNTIME_ENV',
      'VINEA_AI_REPLY_AUDIT_WRITE',
      'APPROVED_AI_REPLY_AUDIT_WRITE_QA',
      'VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE',
      'APPROVED_AI_REPLY_SAFE_RESPONSE_QA',
      'buildAiReplySafetyChainAdapter',
      'validateAiReplyAuditEventForSafeWrite',
      'writeAiReplyAuditMetadata',
      'safeAuditMetadataWritten = true',
      'validateAiReplyResponseScaffoldForSafeExposure',
      'buildSafeAiReplyResponse',
      'production AI reply remains `NO-GO`',
      'complete marker set',
      'A single partial marker is not enough',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
