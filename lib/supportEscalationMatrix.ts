import type {
  ObservabilityCategory,
  ObservabilityCustomerImpact,
  ObservabilityOwner,
  ObservabilitySeverity,
  VineaObservabilityEvent,
} from './observabilityEvent'

export type SupportEscalationSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4'

export type SupportEscalationPlan = {
  severity: SupportEscalationSeverity
  label: string
  responseTarget: string
  recommendedOwner: ObservabilityOwner
  requiredRoles: string[]
  customerCommunicationRule: string
  evidenceRule: string
  initialActions: string[]
  safeSummary: string
  productionBoundary: string
}

export type ProductionMonitoringSupportRouting = {
  supportSeverity: SupportEscalationSeverity
  monitoringOwnerLabel: ObservabilityOwner
  supportOwnerLabel: 'support_owner'
  supportRequiredRoleLabels: string[]
  customerImpact: ObservabilityCustomerImpact
  customerCommunicationAllowed: false
  requiresIncidentCommanderApproval: boolean
  requiresLegalDataOwnerApproval: boolean
  responseTarget: string
  safeEscalationSummary: string
  rollbackByDisablingFlags: true
  productionBoundary: string
}

type BuildSupportEscalationInput = {
  severity: ObservabilitySeverity
  category: ObservabilityCategory
  customerImpact: ObservabilityCustomerImpact
  recommendedOwner: ObservabilityOwner
  safeMessage: string
}

export function buildSupportEscalationFromObservabilityEvent(
  event: VineaObservabilityEvent,
): SupportEscalationPlan {
  return buildSupportEscalationPlan({
    severity: event.severity,
    category: event.category,
    customerImpact: event.customerImpact,
    recommendedOwner: event.recommendedOwner,
    safeMessage: event.safeMessage,
  })
}

export function mapObservabilityEventToSupportEscalation(
  event: VineaObservabilityEvent,
): ProductionMonitoringSupportRouting {
  const plan = buildSupportEscalationFromObservabilityEvent(event)

  return {
    supportSeverity: plan.severity,
    monitoringOwnerLabel: plan.recommendedOwner,
    supportOwnerLabel: 'support_owner',
    supportRequiredRoleLabels: plan.requiredRoles,
    customerImpact: event.customerImpact,
    customerCommunicationAllowed: false,
    requiresIncidentCommanderApproval: plan.requiredRoles.includes(
      'incident_commander',
    ),
    requiresLegalDataOwnerApproval: plan.requiredRoles.includes('legal_data_owner'),
    responseTarget: plan.responseTarget,
    safeEscalationSummary: plan.safeSummary,
    rollbackByDisablingFlags: true,
    productionBoundary:
      'This routing map is non-runtime guidance only. It does not send monitoring events, page staff, notify customers, create incidents, mutate records, or make production trust claims.',
  }
}

export function buildSupportEscalationPlan(
  input: BuildSupportEscalationInput,
): SupportEscalationPlan {
  const severity = deriveSupportSeverity(input)
  const roles = requiredRolesFor(severity, input.category)

  return {
    severity,
    label: labelFor(severity),
    responseTarget: responseTargetFor(severity),
    recommendedOwner: input.recommendedOwner,
    requiredRoles: roles,
    customerCommunicationRule: customerCommunicationRuleFor(severity),
    evidenceRule:
      'Preserve safe event metadata, screenshots, timestamps, route labels, and audit references without secrets, raw IDs, token material, private documents, raw exports, AI prompts, or AI outputs.',
    initialActions: initialActionsFor(severity, input.category, input.customerImpact),
    safeSummary: input.safeMessage,
    productionBoundary:
      'This escalation plan is non-runtime guidance only. It does not page staff, notify customers, create incidents, access production, change data, enable monitoring, or make trust-center claims.',
  }
}

function deriveSupportSeverity(
  input: Pick<
    BuildSupportEscalationInput,
    'severity' | 'category' | 'customerImpact'
  >,
): SupportEscalationSeverity {
  if (
    input.severity === 'critical' &&
    (input.customerImpact === 'data_privacy' ||
      input.category === 'authorization' ||
      input.category === 'storage' ||
      input.category === 'document_portal' ||
      input.category === 'family_portal')
  ) {
    return 'SEV-1'
  }

  if (input.severity === 'critical' || input.customerImpact === 'data_privacy') {
    return 'SEV-2'
  }

  if (input.severity === 'error' || input.customerImpact === 'family_portal') {
    return 'SEV-2'
  }

  if (input.severity === 'warning') {
    return 'SEV-3'
  }

  return 'SEV-4'
}

function labelFor(severity: SupportEscalationSeverity): string {
  switch (severity) {
    case 'SEV-1':
      return 'Critical parish data or privacy risk'
    case 'SEV-2':
      return 'High-impact workflow, privacy, or integration issue'
    case 'SEV-3':
      return 'Medium-risk degraded behavior or near miss'
    case 'SEV-4':
      return 'Low-risk support follow-up'
  }
}

function responseTargetFor(severity: SupportEscalationSeverity): string {
  switch (severity) {
    case 'SEV-1':
      return 'Assign incident commander and technical lead within 30 minutes.'
    case 'SEV-2':
      return 'Triage within 2 hours during support coverage.'
    case 'SEV-3':
      return 'Triage same business day.'
    case 'SEV-4':
      return 'Track in normal support and product queue.'
  }
}

function requiredRolesFor(
  severity: SupportEscalationSeverity,
  category: ObservabilityCategory,
): string[] {
  const roles = new Set<string>(['support_owner'])

  if (severity === 'SEV-1' || severity === 'SEV-2') {
    roles.add('technical_lead')
    roles.add('evidence_owner')
  }

  if (
    severity === 'SEV-1' ||
    category === 'authorization' ||
    category === 'storage' ||
    category === 'document_portal' ||
    category === 'family_portal' ||
    category === 'export' ||
    category === 'ai'
  ) {
    roles.add('security_data_owner')
  }

  if (severity === 'SEV-1') {
    roles.add('incident_commander')
    roles.add('customer_communications_owner')
    roles.add('legal_data_owner')
  }

  if (category === 'google_calendar' || category === 'email') {
    roles.add('integration_owner')
  }

  return [...roles]
}

function customerCommunicationRuleFor(severity: SupportEscalationSeverity): string {
  if (severity === 'SEV-1') {
    return 'Prepare customer communication, but do not send until incident commander and legal/data owner approve facts, scope, timing, and wording.'
  }

  if (severity === 'SEV-2') {
    return 'Customer communication may be needed after triage; support owner and security/data owner must approve before sending.'
  }

  return 'No customer communication by default; reassess if triage finds parish impact.'
}

function initialActionsFor(
  severity: SupportEscalationSeverity,
  category: ObservabilityCategory,
  customerImpact: ObservabilityCustomerImpact,
): string[] {
  const actions = [
    'Record the safe event summary and timestamp.',
    'Confirm environment identity before touching any data or settings.',
    'Preserve evidence before cleanup unless containment is urgent.',
  ]

  if (severity === 'SEV-1' || severity === 'SEV-2') {
    actions.push('Assign required owner roles before customer communication.')
  }

  if (
    category === 'authorization' ||
    category === 'document_portal' ||
    category === 'family_portal' ||
    category === 'storage' ||
    customerImpact === 'data_privacy'
  ) {
    actions.push('Check whether containment is needed for access, document, token, or parish-scope boundaries.')
  }

  if (category === 'google_calendar' || category === 'email') {
    actions.push('Check integration status and avoid mutating external systems until owner review.')
  }

  if (category === 'ai') {
    actions.push('Confirm no raw prompt, output, provider payload, or staff-only source material is stored or shown.')
  }

  if (category === 'export') {
    actions.push('Confirm no raw export, forbidden field, token material, or private document material was delivered.')
  }

  return actions
}
