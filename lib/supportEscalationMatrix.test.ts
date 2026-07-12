import { describe, expect, it } from 'vitest'

import { buildObservabilityEvent } from './observabilityEvent'
import {
  buildSupportEscalationFromObservabilityEvent,
  buildSupportEscalationPlan,
  mapObservabilityEventToSupportEscalation,
} from './supportEscalationMatrix'

describe('support escalation matrix', () => {
  it('escalates critical cross-parish privacy risk to SEV-1 with required owners', () => {
    const event = buildObservabilityEvent({
      message: 'Cross-parish document access blocked for alex@example.com',
      category: 'authorization',
      severity: 'critical',
      customerImpact: 'data_privacy',
    })

    const plan = buildSupportEscalationFromObservabilityEvent(event)

    expect(plan.severity).toBe('SEV-1')
    expect(plan.responseTarget).toContain('30 minutes')
    expect(plan.requiredRoles).toEqual(
      expect.arrayContaining([
        'incident_commander',
        'technical_lead',
        'security_data_owner',
        'customer_communications_owner',
        'legal_data_owner',
        'evidence_owner',
      ]),
    )
    expect(plan.customerCommunicationRule).toContain('do not send')
    expect(plan.safeSummary).not.toContain('alex@example.com')
    expect(plan.evidenceRule).toContain('without secrets')
  })

  it('maps safe observability events to production monitoring support labels', () => {
    const event = buildObservabilityEvent({
      message: 'Cross-parish document access blocked for alex@example.com',
      category: 'authorization',
      severity: 'critical',
      customerImpact: 'data_privacy',
    })

    const routing = mapObservabilityEventToSupportEscalation(event)

    expect(routing.supportSeverity).toBe('SEV-1')
    expect(routing.monitoringOwnerLabel).toBe('security_data')
    expect(routing.supportOwnerLabel).toBe('support_owner')
    expect(routing.supportRequiredRoleLabels).toEqual(
      expect.arrayContaining([
        'incident_commander',
        'security_data_owner',
        'legal_data_owner',
        'evidence_owner',
      ]),
    )
    expect(routing.customerImpact).toBe('data_privacy')
    expect(routing.customerCommunicationAllowed).toBe(false)
    expect(routing.requiresIncidentCommanderApproval).toBe(true)
    expect(routing.requiresLegalDataOwnerApproval).toBe(true)
    expect(routing.rollbackByDisablingFlags).toBe(true)
    expect(routing.safeEscalationSummary).not.toContain('alex@example.com')
    expect(routing.productionBoundary).toContain('does not send monitoring events')
  })

  it('routes integration failures to the integration owner without over-escalating', () => {
    const plan = buildSupportEscalationPlan({
      severity: 'error',
      category: 'google_calendar',
      customerImpact: 'integration',
      recommendedOwner: 'integration_owner',
      safeMessage: 'Google Calendar reconnect failed after callback.',
    })

    expect(plan.severity).toBe('SEV-2')
    expect(plan.recommendedOwner).toBe('integration_owner')
    expect(plan.requiredRoles).toContain('integration_owner')
    expect(plan.initialActions.join(' ')).toContain('avoid mutating external systems')
  })

  it('keeps low-risk informational events in the normal support queue', () => {
    const plan = buildSupportEscalationPlan({
      severity: 'info',
      category: 'health_check',
      customerImpact: 'none_known',
      recommendedOwner: 'engineering',
      safeMessage: 'Health check passed after deploy.',
    })

    expect(plan.severity).toBe('SEV-4')
    expect(plan.responseTarget).toContain('normal support')
    expect(plan.customerCommunicationRule).toContain('No customer communication by default')
    expect(plan.productionBoundary).toContain('non-runtime guidance only')
  })

  it('keeps low-risk monitoring routing label-only and no-op', () => {
    const event = buildObservabilityEvent({
      category: 'health_check',
      severity: 'info',
      customerImpact: 'none_known',
      message: 'Health check passed.',
    })

    const routing = mapObservabilityEventToSupportEscalation(event)

    expect(routing.supportSeverity).toBe('SEV-4')
    expect(routing.monitoringOwnerLabel).toBe('engineering')
    expect(routing.supportOwnerLabel).toBe('support_owner')
    expect(routing.customerCommunicationAllowed).toBe(false)
    expect(routing.requiresIncidentCommanderApproval).toBe(false)
    expect(routing.requiresLegalDataOwnerApproval).toBe(false)
    expect(routing.responseTarget).toContain('normal support')
  })
})
