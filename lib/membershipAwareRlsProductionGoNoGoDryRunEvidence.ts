import { MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE } from './membershipAwareRlsProductionApprovalInput'
import {
  buildCurrentFilledMembershipAwareRlsProductionApprovalPacket,
  runMembershipAwareRlsProductionApprovalDryRun,
  type MembershipAwareRlsProductionApprovalDryRunJson,
} from './membershipAwareRlsProductionApprovalDryRun'

export type MembershipAwareRlsProductionGoNoGoDryRunEvidenceDecision =
  | 'READY_TO_REQUEST_FINAL_APPROVAL'
  | 'HOLD'

export type MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord = {
  evidenceLabel: string
  dryRunJson: MembershipAwareRlsProductionApprovalDryRunJson
  ownerStatusSummary: {
    requiredOwnerCount: number
    allRequiredOwnersNamed: boolean
    missingOwnerLabelCount: number
  }
  fixtureStatusSummary: {
    requiredFixtureCount: number
    allRequiredFixturesSelected: boolean
    missingFixtureLabelCount: number
  }
  evidenceStatusSummary: {
    requiredEvidenceCount: number
    allRequiredEvidenceReviewed: boolean
    missingEvidenceCount: number
  }
  noGoBoundariesConfirmed: {
    productionRlsUnapproved: boolean
    productionAccessNotStarted: boolean
    migrationsNotApplied: boolean
    operationalRlsUnchanged: boolean
    rawSecretsExcluded: boolean
    rawIdsExcluded: boolean
    publicTrustClaimsExcluded: boolean
  }
  finalApprovalPlaceholders: {
    approvalPhraseBoundaryLabel: string
    productionTargetLabel: string
    rolloutWindowLabel: string
    rollbackOwnerLabel: string
    monitoringOwnerLabel: string
    evidenceOwnerLabel: string
  }
}

export type MembershipAwareRlsProductionGoNoGoDryRunEvidenceValidation = {
  decision: MembershipAwareRlsProductionGoNoGoDryRunEvidenceDecision
  readyToRequestFinalApproval: boolean
  readyForProductionRollout: false
  findings: string[]
  safeSummary: {
    dryRunDecision: MembershipAwareRlsProductionApprovalDryRunJson['decision']
    dryRunPassed: boolean
    approvalPhraseRecorded: boolean
    requiredOwnerCount: number
    requiredFixtureCount: number
    requiredEvidenceCount: number
    missingRequiredItemCount: number
    missingLabelFieldCount: number
    unsafeLabelFindingCount: number
    missingSmokeVerificationCount: number
  }
  nextSafeAction: string
}

const REQUIRED_SAFE_SCOPE: Array<
  keyof MembershipAwareRlsProductionApprovalDryRunJson['scope']
> = [
  'repositoryOnly',
  'productionAccessed',
  'migrationsApplied',
  'operationalRlsChanged',
  'recordsMutated',
  'googleCalendarTouched',
  'exportsRun',
  'aiCalled',
  'storageAccessed',
  'signedUrlsCreated',
  'communicationsSent',
  'certificatesGenerated',
  'publicTrustClaimsMade',
]

const FORBIDDEN_RAW_KEYS = new Set([
  'ownerLabels',
  'fixtureLabels',
  'productionTargetLabels',
  'explicitProductionApprovalPhrase',
  'databaseUrl',
  'dbUrl',
  'password',
  'serviceRoleKey',
  'anonKey',
  'rawId',
  'token',
  'signedUrl',
])

const FORBIDDEN_VALUE_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\//i, 'database url'],
  [/(?:password|pwd)\s*[:=]/i, 'password material'],
  [/(?:service[_-]?role|anon)[\s_-]*key/i, 'api key wording'],
  [/bearer\s+[a-z0-9._-]+/i, 'bearer token'],
  [/sk-[a-z0-9]/i, 'api key'],
  [/x-amz-signature/i, 'signed url'],
  [/token_hash|refresh_token|access_token/i, 'token material'],
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, 'email address'],
  [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    'raw uuid',
  ],
]

export function validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(
  record: MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
): MembershipAwareRlsProductionGoNoGoDryRunEvidenceValidation {
  const findings: string[] = []
  const dryRunJson = record.dryRunJson

  requireNonEmptyLabel(record.evidenceLabel, 'evidenceLabel', findings)
  validateDryRunScope(dryRunJson, findings)
  validateDryRunReadiness(dryRunJson, findings)
  validateStatusSummaries(record, findings)
  validateNoGoBoundaries(record, findings)
  validateFinalApprovalPlaceholders(record, findings)
  collectForbiddenKeys(record, findings)
  collectForbiddenValues(record, findings)

  const readyToRequestFinalApproval = findings.length === 0

  return {
    decision: readyToRequestFinalApproval
      ? 'READY_TO_REQUEST_FINAL_APPROVAL'
      : 'HOLD',
    readyToRequestFinalApproval,
    readyForProductionRollout: false,
    findings,
    safeSummary: {
      dryRunDecision: dryRunJson.decision,
      dryRunPassed: dryRunJson.pass,
      approvalPhraseRecorded: dryRunJson.safeSummary.approvalPhraseRecorded,
      requiredOwnerCount: dryRunJson.safeSummary.requiredOwnerCount,
      requiredFixtureCount: dryRunJson.safeSummary.requiredFixtureCount,
      requiredEvidenceCount: dryRunJson.safeSummary.requiredEvidenceCount,
      missingRequiredItemCount:
        dryRunJson.safeSummary.missingRequiredItemCount,
      missingLabelFieldCount: dryRunJson.safeSummary.missingLabelFieldCount,
      unsafeLabelFindingCount:
        dryRunJson.safeSummary.unsafeLabelFindingCount,
      missingSmokeVerificationCount:
        dryRunJson.safeSummary.missingSmokeVerificationCount,
    },
    nextSafeAction: readyToRequestFinalApproval
      ? 'Request the separate product-owner production approval using the exact approval prompt; production rollout remains blocked until that human approval is recorded.'
      : 'Resolve the evidence findings before requesting production RLS approval.',
  }
}

export function buildCurrentFilledMembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord(): MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord {
  const dryRunJson = runMembershipAwareRlsProductionApprovalDryRun(
    buildCurrentFilledMembershipAwareRlsProductionApprovalPacket(),
  )

  return {
    evidenceLabel:
      'Membership-aware RLS production go/no-go dry-run evidence example - label-only',
    dryRunJson,
    ownerStatusSummary: {
      requiredOwnerCount: dryRunJson.safeSummary.requiredOwnerCount,
      allRequiredOwnersNamed: true,
      missingOwnerLabelCount: 0,
    },
    fixtureStatusSummary: {
      requiredFixtureCount: dryRunJson.safeSummary.requiredFixtureCount,
      allRequiredFixturesSelected: true,
      missingFixtureLabelCount: 0,
    },
    evidenceStatusSummary: {
      requiredEvidenceCount: dryRunJson.safeSummary.requiredEvidenceCount,
      allRequiredEvidenceReviewed: true,
      missingEvidenceCount: 0,
    },
    noGoBoundariesConfirmed: {
      productionRlsUnapproved: true,
      productionAccessNotStarted: true,
      migrationsNotApplied: true,
      operationalRlsUnchanged: true,
      rawSecretsExcluded: true,
      rawIdsExcluded: true,
      publicTrustClaimsExcluded: true,
    },
    finalApprovalPlaceholders: {
      approvalPhraseBoundaryLabel:
        'Exact approval phrase must be provided later in a separate product-owner approval prompt',
      productionTargetLabel: 'Production target label only',
      rolloutWindowLabel: 'Future low-traffic rollout window label',
      rollbackOwnerLabel: 'Rollback owner label only',
      monitoringOwnerLabel: 'Monitoring owner/channel label only',
      evidenceOwnerLabel: 'Evidence storage owner label only',
    },
  }
}

function validateDryRunScope(
  dryRunJson: MembershipAwareRlsProductionApprovalDryRunJson,
  findings: string[],
) {
  for (const key of REQUIRED_SAFE_SCOPE) {
    const expected = key === 'repositoryOnly'
    if (dryRunJson.scope[key] !== expected) {
      findings.push(`dryRunJson.scope.${key} must be ${expected}`)
    }
  }
}

function validateDryRunReadiness(
  dryRunJson: MembershipAwareRlsProductionApprovalDryRunJson,
  findings: string[],
) {
  if (dryRunJson.decision !== 'READY_TO_REQUEST_APPROVAL') {
    findings.push(
      'dryRunJson.decision must be READY_TO_REQUEST_APPROVAL before final human approval is requested',
    )
  }

  if (!dryRunJson.pass) {
    findings.push('dryRunJson.pass must be true')
  }

  if (!dryRunJson.safeSummary.readyToRequestProductOwnerApproval) {
    findings.push(
      'dryRunJson.safeSummary.readyToRequestProductOwnerApproval must be true',
    )
  }

  if (dryRunJson.safeSummary.readyForProductionRollout) {
    findings.push(
      'dryRunJson.safeSummary.readyForProductionRollout must remain false before final human approval',
    )
  }

  if (dryRunJson.safeSummary.approvalPhraseRecorded) {
    findings.push(
      'dryRunJson.safeSummary.approvalPhraseRecorded must remain false in pre-approval evidence',
    )
  }
}

function validateStatusSummaries(
  record: MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
  findings: string[],
) {
  const safeSummary = record.dryRunJson.safeSummary

  if (
    record.ownerStatusSummary.requiredOwnerCount !==
    safeSummary.requiredOwnerCount
  ) {
    findings.push('ownerStatusSummary.requiredOwnerCount must match dry run')
  }

  if (!record.ownerStatusSummary.allRequiredOwnersNamed) {
    findings.push('ownerStatusSummary.allRequiredOwnersNamed must be true')
  }

  if (record.ownerStatusSummary.missingOwnerLabelCount !== 0) {
    findings.push('ownerStatusSummary.missingOwnerLabelCount must be 0')
  }

  if (
    record.fixtureStatusSummary.requiredFixtureCount !==
    safeSummary.requiredFixtureCount
  ) {
    findings.push('fixtureStatusSummary.requiredFixtureCount must match dry run')
  }

  if (!record.fixtureStatusSummary.allRequiredFixturesSelected) {
    findings.push(
      'fixtureStatusSummary.allRequiredFixturesSelected must be true',
    )
  }

  if (record.fixtureStatusSummary.missingFixtureLabelCount !== 0) {
    findings.push('fixtureStatusSummary.missingFixtureLabelCount must be 0')
  }

  if (
    record.evidenceStatusSummary.requiredEvidenceCount !==
    safeSummary.requiredEvidenceCount
  ) {
    findings.push('evidenceStatusSummary.requiredEvidenceCount must match dry run')
  }

  if (!record.evidenceStatusSummary.allRequiredEvidenceReviewed) {
    findings.push(
      'evidenceStatusSummary.allRequiredEvidenceReviewed must be true',
    )
  }

  if (record.evidenceStatusSummary.missingEvidenceCount !== 0) {
    findings.push('evidenceStatusSummary.missingEvidenceCount must be 0')
  }
}

function validateNoGoBoundaries(
  record: MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
  findings: string[],
) {
  for (const [key, value] of Object.entries(record.noGoBoundariesConfirmed)) {
    if (value !== true) {
      findings.push(`noGoBoundariesConfirmed.${key} must be true`)
    }
  }
}

function validateFinalApprovalPlaceholders(
  record: MembershipAwareRlsProductionGoNoGoDryRunEvidenceRecord,
  findings: string[],
) {
  for (const [key, value] of Object.entries(record.finalApprovalPlaceholders)) {
    requireNonEmptyLabel(value, `finalApprovalPlaceholders.${key}`, findings)
  }

  if (
    record.finalApprovalPlaceholders.approvalPhraseBoundaryLabel.includes(
      MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_PHRASE,
    )
  ) {
    findings.push(
      'finalApprovalPlaceholders.approvalPhraseBoundaryLabel must describe where approval will be recorded, not contain the approval phrase itself',
    )
  }
}

function requireNonEmptyLabel(
  value: string,
  label: string,
  findings: string[],
) {
  if (!value.trim()) {
    findings.push(`${label} must be a non-empty label`)
  }
}

function collectForbiddenKeys(value: unknown, findings: string[], path = 'record') {
  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`
    if (FORBIDDEN_RAW_KEYS.has(key)) {
      findings.push(`${childPath} must not be present in sanitized evidence`)
    }
    collectForbiddenKeys(child, findings, childPath)
  }
}

function collectForbiddenValues(value: unknown, findings: string[], path = 'record') {
  if (path.startsWith('record.dryRunJson.productionNoGoBoundaries')) {
    return
  }

  if (typeof value === 'string') {
    for (const [pattern, description] of FORBIDDEN_VALUE_PATTERNS) {
      if (pattern.test(value)) {
        findings.push(`${path} contains possible ${description}`)
      }
    }
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, child] of Object.entries(value)) {
    collectForbiddenValues(child, findings, `${path}.${key}`)
  }
}
