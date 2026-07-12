import { describe, expect, it } from 'vitest'
import {
  PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION,
  validateFutureProductionMonitoringRuntimeSource,
} from './productionMonitoringRuntimePreflight'

const compliantFutureRuntimeSource = `
  const productionMonitoringRuntimeGate = getProductionMonitoringRuntimeGate({
    VINEA_PRODUCTION_MONITORING_RUNTIME: 'ENABLED',
    VINEA_PRODUCTION_MONITORING_RUNTIME_ACK: 'APPROVED_PRODUCTION_MONITORING_RUNTIME',
    VINEA_PRODUCTION_MONITORING_RUNTIME_ENV: 'NON_PRODUCTION',
    allowedScopes: ['NON_PRODUCTION', 'PRODUCTION_SMOKE', 'PRODUCTION_ENABLED'],
  })

  if (!productionMonitoringRuntimeGate.enabled) {
    returnProductionMonitoringNoop()
  }

  productionMonitoringRuntimeGate.rollbackByDisablingFlags =
    'VINEA_PRODUCTION_MONITORING_RUNTIME=DISABLED'

  const safeObservabilityEvent = buildObservabilityEvent({
    message: redactObservabilityText(error.message),
    category: 'health_check',
    rawPromptStored: false,
    tokenMaterialStored: false,
    documentPayloadStored: false,
    customerCommunicationAllowed: false,
    requiresIncidentCommanderApproval: true,
    requiresLegalDataOwnerApproval: true,
  })

  assertNoForbiddenProductionMonitoringPayload(safeObservabilityEvent)

  const supportEscalation = mapObservabilityEventToSupportEscalation(safeObservabilityEvent)
  const monitoringOwnerLabel = supportEscalation.monitoringOwnerLabel
  const supportOwnerLabel = supportEscalation.supportOwnerLabel
  const customerImpact = supportEscalation.customerImpact

  await sendProductionMonitoringEvent({
    safeObservabilityEvent,
    monitoringOwnerLabel,
    supportOwnerLabel,
    customerImpact,
  })
`

describe('production monitoring runtime preflight', () => {
  it('accepts future runtime source only when safety gates appear before external send', () => {
    const result = validateFutureProductionMonitoringRuntimeSource(
      compliantFutureRuntimeSource,
    )

    expect(result.ok).toBe(true)
    expect(result.version).toBe(PRODUCTION_MONITORING_RUNTIME_PREFLIGHT_VERSION)
    expect(result.firstExternalSendIndex).toBeGreaterThan(0)
    expect(result.forbiddenRuntimeMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('fails if external delivery appears before disabled-by-default and scope gates', () => {
    const result = validateFutureProductionMonitoringRuntimeSource(`
      await sendProductionMonitoringEvent(safeObservabilityEvent)
      const productionMonitoringRuntimeGate = getProductionMonitoringRuntimeGate()
      const env = 'NON_PRODUCTION'
      const safeObservabilityEvent = buildObservabilityEvent({
        message: redactObservabilityText(error.message),
      })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('disabled_by_default_gate')
    expect(result.errors.join('\n')).toContain('environment_scope_gate')
    expect(result.errors.join('\n')).toContain('redaction_dto_gate')
  })

  it('fails when forbidden sensitive outbound markers are present', () => {
    const result = validateFutureProductionMonitoringRuntimeSource(`
      ${compliantFutureRuntimeSource}
      Sentry.captureException(error)
      const rawPrompt = "private prompt"
      const providerPayload = response
      const signed = createSignedUrl(storagePath)
      const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
    `)

    expect(result.ok).toBe(false)
    expect(result.forbiddenRuntimeMarkersPresent).toContain(
      'Sentry.captureException(error)',
    )
    expect(result.forbiddenRuntimeMarkersPresent).toContain('providerPayload')
    expect(result.forbiddenRuntimeMarkersPresent).toContain('createSignedUrl(')
    expect(result.forbiddenRuntimeMarkersPresent).toContain(
      'SUPABASE_SERVICE_ROLE_KEY',
    )
  })

  it('fails if owner/support routing, rollback, or customer communication boundaries are missing', () => {
    const result = validateFutureProductionMonitoringRuntimeSource(`
      const productionMonitoringRuntimeGate = getProductionMonitoringRuntimeGate()
      const ack = 'APPROVED_PRODUCTION_MONITORING_RUNTIME'
      const env = 'VINEA_PRODUCTION_MONITORING_RUNTIME_ENV NON_PRODUCTION PRODUCTION_SMOKE PRODUCTION_ENABLED'
      const safeObservabilityEvent = buildObservabilityEvent({
        message: redactObservabilityText(error.message),
      })
      assertNoForbiddenProductionMonitoringPayload(safeObservabilityEvent)
      await sendProductionMonitoringEvent({ safeObservabilityEvent })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('owner_support_labels_gate')
    expect(result.errors.join('\n')).toContain('rollback_noop_gate')
    expect(result.errors.join('\n')).toContain(
      'customer_communication_boundary_gate',
    )
  })

  it('fails when a future runtime source includes only partial markers for required gates', () => {
    const result = validateFutureProductionMonitoringRuntimeSource(`
      const productionMonitoringRuntimeGate = getProductionMonitoringRuntimeGate({
        VINEA_PRODUCTION_MONITORING_RUNTIME: 'ENABLED',
        VINEA_PRODUCTION_MONITORING_RUNTIME_ENV: 'NON_PRODUCTION',
      })

      const safeObservabilityEvent = buildObservabilityEvent({
        rawPromptStored: false,
        customerCommunicationAllowed: false,
      })

      assertNoForbiddenProductionMonitoringPayload(safeObservabilityEvent)
      const monitoringOwnerLabel = 'Monitoring owner label'
      productionMonitoringRuntimeGate.rollbackByDisablingFlags = true

      await sendProductionMonitoringEvent({ safeObservabilityEvent })
    `)

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('disabled_by_default_gate'),
        expect.stringContaining('environment_scope_gate'),
        expect.stringContaining('redaction_dto_gate'),
        expect.stringContaining('forbidden_payload_gate'),
        expect.stringContaining('owner_support_labels_gate'),
        expect.stringContaining('rollback_noop_gate'),
        expect.stringContaining('customer_communication_boundary_gate'),
      ])
    )
    expect(result.errors.join('\n')).toContain('Expected all of')
  })
})
