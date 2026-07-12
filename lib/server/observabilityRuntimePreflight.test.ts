import { describe, expect, it } from 'vitest'

import { validateFutureObservabilityRuntimeSource } from './observabilityRuntimePreflight'

const APPROVED_FUTURE_SOURCE = `
const observabilityRuntimeGate = getObservabilityRuntimeGate({
  runtime: process.env.VINEA_OBSERVABILITY_RUNTIME,
  ack: process.env.VINEA_OBSERVABILITY_RUNTIME_ACK,
  approval: 'APPROVED_PRODUCTION_OBSERVABILITY',
})
const scope = process.env.VINEA_OBSERVABILITY_RUNTIME_ENV
if (scope !== 'NON_PRODUCTION' && scope !== 'PRODUCTION') returnObservabilityDisabled()
const safeObservabilityEvent = buildObservabilityEvent({
  message: error.message,
  context: { rawPromptStored: false, tokenMaterialStored: false },
})
redactObservabilityText(error.message)
assertNoForbiddenObservabilityPayload(safeObservabilityEvent)
const monitoringOwnerLabel = safeObservabilityEvent.recommendedOwner
const impact = safeObservabilityEvent.customerImpact
observabilityRuntimeGate.rollbackByDisablingFlags = 'VINEA_OBSERVABILITY_RUNTIME=DISABLED'
sendObservabilityEvent(safeObservabilityEvent, { monitoringOwnerLabel, impact })
`

describe('observability runtime preflight scaffold', () => {
  it('passes only when future source redacts and gates before external reporting', () => {
    const result = validateFutureObservabilityRuntimeSource(APPROVED_FUTURE_SOURCE)

    expect(result.ok).toBe(true)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
    expect(result.version).toBe('2026-07-02-observability-runtime-preflight-v1')
  })

  it('fails when future source sends externally before redaction and approval gates', () => {
    const result = validateFutureObservabilityRuntimeSource(`
      sendObservabilityEvent(error)
      const safeObservabilityEvent = buildObservabilityEvent({ message: error.message })
      const observabilityRuntimeGate = getObservabilityRuntimeGate()
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join(' ')).toContain('disabled_by_default_gate')
    expect(result.errors.join(' ')).toContain('redaction_dto')
  })

  it('rejects future source that exposes raw errors, secrets, providers, or signed URLs', () => {
    const result = validateFutureObservabilityRuntimeSource(`
      const observabilityRuntimeGate = getObservabilityRuntimeGate()
      const env = process.env.VINEA_OBSERVABILITY_RUNTIME_ENV
      const scope = env === 'NON_PRODUCTION' || env === 'PRODUCTION'
      const safeObservabilityEvent = buildObservabilityEvent({ message: error.message })
      redactObservabilityText(error.message)
      assertNoForbiddenObservabilityPayload(safeObservabilityEvent)
      const monitoringOwnerLabel = safeObservabilityEvent.recommendedOwner
      const impact = safeObservabilityEvent.customerImpact
      observabilityRuntimeGate.rollbackByDisablingFlags = 'VINEA_OBSERVABILITY_RUNTIME=DISABLED'
      Sentry.captureException(error)
      createSignedUrl('private/file.pdf')
      const rawPrompt = 'private prompt'
      sendObservabilityEvent(safeObservabilityEvent, { monitoringOwnerLabel, impact, scope })
    `)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual(
      expect.arrayContaining([
        'Sentry.captureException(error)',
        'createSignedUrl(',
        'rawPrompt =',
      ]),
    )
  })

  it('fails when future source includes only partial markers for required observability gates', () => {
    const result = validateFutureObservabilityRuntimeSource(`
      const observabilityRuntimeGate = getObservabilityRuntimeGate()
      const scope = process.env.VINEA_OBSERVABILITY_RUNTIME_ENV
      const safeObservabilityEvent = buildObservabilityEvent({ message: error.message })
      assertNoForbiddenObservabilityPayload(safeObservabilityEvent)
      const monitoringOwnerLabel = 'Monitoring owner label'
      observabilityRuntimeGate.rollbackByDisablingFlags = true
      sendObservabilityEvent(safeObservabilityEvent, { monitoringOwnerLabel, scope })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('disabled_by_default_gate'),
        expect.stringContaining('environment_scope'),
        expect.stringContaining('redaction_dto'),
        expect.stringContaining('forbidden_payload_blocking'),
        expect.stringContaining('owner_labels'),
        expect.stringContaining('rollback_control'),
      ]),
    )
    expect(result.errors.join('\n')).toContain('Expected all of')
  })
})
