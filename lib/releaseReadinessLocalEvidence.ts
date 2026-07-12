export type ReleaseReadinessLocalEvidenceDecision =
  | 'READY_FOR_HUMAN_RELEASE_REVIEW'
  | 'HOLD'

export type ReleaseReadinessCommandStatus = 'PASS' | 'FAIL' | 'NOT_RUN'

export type ReleaseReadinessCommandResult = {
  order: number
  command: string
  status: ReleaseReadinessCommandStatus
  sanitizedNotesLabel: string
}

export type ReleaseReadinessEnvCleanupGuideDecision =
  | 'NOT_RUN'
  | 'RELEASE_ENV_ALREADY_CLEAN'
  | 'RELEASE_ENV_CLEANUP_GUIDE_READY'

export type ReleaseReadinessEnvCleanupPerformed =
  | 'none'
  | 'process_scope'
  | 'user_scope'
  | 'process_and_user_scope'

export type ReleaseReadinessEnvCleanupGuideEvidence = {
  decision: ReleaseReadinessEnvCleanupGuideDecision
  mutatesEnvironment: false
  secretValuesPrinted: false
  variablesReportedByNameOnly: true
  rawValuesCaptured: false
  cleanupPerformed: ReleaseReadinessEnvCleanupPerformed
}

export type ReleaseReadinessLocalEvidenceRecord = {
  evidenceLabel: string
  capturedByLabel: string
  capturedAtLabel: string
  repositoryBranchLabel: string
  commitLabel: string
  worktreeStatusLabel: string
  reviewPurposeLabel: string
  relatedApprovalPacketLabel: string
  productionSensitiveFeatureUnderReviewLabel: string
  environmentIdentity: {
    environmentType: 'LOCAL_REPOSITORY_ONLY'
    productionAccessUsed: false
    productionFlagsEnabled: false
    migrationsApplied: false
    operationalRlsChanged: false
    recordsMutated: false
    externalServicesCalled: false
    browserManualQaIncluded: false
  }
  commandResults: ReleaseReadinessCommandResult[]
  sanitizedOutputs: {
    releaseEnvironmentGuard: {
      decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED'
      productionSensitiveRuntimeFlagsEnabled: false
      qaPrototypeRuntimeResidueConfigured: false
      rawValuesCaptured: false
    }
    releaseEnvCleanupGuide?: ReleaseReadinessEnvCleanupGuideEvidence
    rlsProductionEvidenceCheck: {
      decision: 'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW'
      readyForProductionRollout: false
      productionRlsApproved: false
      appliesMigrations: false
      changesOperationalRls: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
    productionMonitoringEvidenceCheck: {
      decision: 'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW'
      productionMonitoringEnabled: false
      productionSmokeApproved: false
      publicTrustClaimsApproved: false
      externalMonitoringSendEnabled: false
      runtimeMonitoringImplemented: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
    productionGateBoundaryCheck: {
      decision: 'BOUNDARIES_READY_FOR_REVIEW'
      artifactCount: 14
      linkedArtifactCount: 14
      existingArtifactCount: 14
      productionSensitiveFeaturesApproved: false
      publicTrustClaimsApproved: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
    cspReportOnlyEvidenceCheck: {
      decision: 'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW'
      reportOnlyRuntimeApproved: false
      productionCspApproved: false
      enforcingCspApproved: false
      publicTrustClaimsApproved: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
    trustCenterPublicClaimsCheck: {
      decision: 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
      publicTrustCenterPublishingApproved: false
      publicClaimsApproved: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
    releaseHandoffConsistencyCheck: {
      decision: 'RELEASE_HANDOFF_READY_FOR_REVIEW'
      artifactCount: 28
      lockedGateCount: 14
      humanReviewBoundaryCount: 17
      productionSensitiveFeaturesApproved: false
      publicTrustClaimsApproved: false
      findingsCount: 0
      rawLabelsOrSecretsCaptured: false
    }
  }
  safetyBoundaryConfirmation: {
    didNotDeployCode: true
    didNotEnableProductionFlags: true
    didNotAddProductionFlags: true
    didNotAccessProduction: true
    didNotApplyMigrations: true
    didNotChangeOperationalRls: true
    didNotMutateRecords: true
    didNotTouchGoogleCalendarData: true
    didNotRunExports: true
    didNotCallAi: true
    didNotAccessStorage: true
    didNotCreateSignedUrls: true
    didNotSendCommunications: true
    didNotGenerateCertificates: true
    didNotMakePublicTrustCenterClaims: true
  }
  manualFollowUpConfirmed: {
    productOwnerApprovalStillRequired: true
    securityDataOwnerApprovalStillRequired: true
    productionSafeSmokeFixturesStillRequired: true
    rollbackOwnerAssignmentStillRequired: true
    monitoringOwnerAssignmentStillRequired: true
    publicTrustCenterApprovalStillRequired: true
  }
  finalLocalEvidenceDecision: {
    localChecklistResult: 'PASS' | 'FAIL'
    readyToRequestHumanReview: boolean
    productionApprovalGranted: false
    remainingBlockersLabel: string
    nextSafeActionLabel: string
  }
}

export type ReleaseReadinessLocalEvidenceValidation = {
  decision: ReleaseReadinessLocalEvidenceDecision
  readyForHumanReleaseReview: boolean
  productionApprovalGranted: false
  findings: string[]
  safeSummary: {
    commandCount: number
    passingCommandCount: number
    failedOrMissingCommandCount: number
    releaseEnvironmentAccepted: boolean
    qaPrototypeRuntimeResidueClear: boolean
    rlsProductionEvidenceReady: boolean
    productionMonitoringEvidenceReady: boolean
    productionGateArtifactCount: number
    productionGateBoundariesReady: boolean
    cspReportOnlyEvidenceReady: boolean
    trustCenterPublicClaimsReady: boolean
    releaseHandoffLockedGateCount: number
    releaseHandoffReady: boolean
    safetyBoundaryConfirmed: boolean
    manualFollowUpStillRequired: boolean
  }
  nextSafeAction: string
}

export const RELEASE_READINESS_LOCAL_COMMANDS = [
  'npm run check:repository-secrets',
  'npm run check:dependency-security',
  'npm run check:release-env',
  'npm run check:rls-production-evidence',
  'npm run check:production-monitoring-evidence',
  'npm run check:production-gates',
  'npm run check:csp-report-only',
  'npm run check:trust-center-claims',
  'npm run check:release-handoff',
  'npm run check:release-local-evidence',
  'npm run typecheck',
  'npm run typecheck:all',
  'npm run lint',
  'npm test',
  'npm run build',
] as const

const FORBIDDEN_RAW_KEYS = new Set([
  'rawOutput',
  'rawCommandOutput',
  'stdout',
  'stderr',
  'databaseUrl',
  'dbUrl',
  'password',
  'serviceRoleKey',
  'anonKey',
  'apiKey',
  'bearerToken',
  'jwt',
  'oauthToken',
  'refreshToken',
  'familyPortalToken',
  'signedUrl',
  'storagePath',
  'originalFilename',
  'privateDocumentContents',
  'rawExportContents',
  'rawAuditMetadata',
  'rawProviderPayload',
  'rawProductionRecordId',
  'staffPassword',
])

const RELEASE_ENV_CLEANUP_GUIDE_DECISIONS = new Set([
  'NOT_RUN',
  'RELEASE_ENV_ALREADY_CLEAN',
  'RELEASE_ENV_CLEANUP_GUIDE_READY',
])

const RELEASE_ENV_CLEANUP_PERFORMED_VALUES = new Set([
  'none',
  'process_scope',
  'user_scope',
  'process_and_user_scope',
])

const FORBIDDEN_VALUE_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/postgres(?:ql)?:\/\//i, 'database url'],
  [/(?:password|pwd)\s*[:=]/i, 'password material'],
  [/(?:service[_-]?role|anon)[\s_-]*key/i, 'api key wording'],
  [/bearer\s+[a-z0-9._-]+/i, 'bearer token'],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'jwt'],
  [/sk-[a-z0-9]/i, 'api key'],
  [/x-amz-signature/i, 'signed url'],
  [/token_hash|refresh_token|access_token/i, 'token material'],
  [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    'raw uuid',
  ],
]

export function validateReleaseReadinessLocalEvidence(
  record: ReleaseReadinessLocalEvidenceRecord,
): ReleaseReadinessLocalEvidenceValidation {
  const findings: string[] = []

  validateRequiredLabels(record, findings)
  validateEnvironmentIdentity(record, findings)
  validateCommandResults(record, findings)
  validateSanitizedOutputs(record, findings)
  validateSafetyBoundaries(record, findings)
  validateManualFollowUp(record, findings)
  validateFinalDecision(record, findings)
  collectForbiddenKeys(record, findings)
  collectForbiddenValues(record, findings)

  const passingCommandCount = record.commandResults.filter(
    (result) => result.status === 'PASS',
  ).length
  const failedOrMissingCommandCount =
    RELEASE_READINESS_LOCAL_COMMANDS.length - passingCommandCount
  const safetyBoundaryConfirmed = Object.values(
    record.safetyBoundaryConfirmation,
  ).every(Boolean)
  const manualFollowUpStillRequired = Object.values(
    record.manualFollowUpConfirmed,
  ).every(Boolean)
  const readyForHumanReleaseReview = findings.length === 0

  return {
    decision: readyForHumanReleaseReview
      ? 'READY_FOR_HUMAN_RELEASE_REVIEW'
      : 'HOLD',
    readyForHumanReleaseReview,
    productionApprovalGranted: false,
    findings,
    safeSummary: {
      commandCount: record.commandResults.length,
      passingCommandCount,
      failedOrMissingCommandCount,
      releaseEnvironmentAccepted:
        record.sanitizedOutputs.releaseEnvironmentGuard.decision ===
          'RELEASE_READINESS_ENVIRONMENT_ACCEPTED' &&
        !record.sanitizedOutputs.releaseEnvironmentGuard
          .productionSensitiveRuntimeFlagsEnabled &&
        !record.sanitizedOutputs.releaseEnvironmentGuard
          .qaPrototypeRuntimeResidueConfigured,
      qaPrototypeRuntimeResidueClear:
        record.sanitizedOutputs.releaseEnvironmentGuard
          .qaPrototypeRuntimeResidueConfigured === false,
      rlsProductionEvidenceReady:
        record.sanitizedOutputs.rlsProductionEvidenceCheck.decision ===
          'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW' &&
        !record.sanitizedOutputs.rlsProductionEvidenceCheck
          .readyForProductionRollout &&
        !record.sanitizedOutputs.rlsProductionEvidenceCheck.productionRlsApproved &&
        !record.sanitizedOutputs.rlsProductionEvidenceCheck.appliesMigrations &&
        !record.sanitizedOutputs.rlsProductionEvidenceCheck.changesOperationalRls,
      productionMonitoringEvidenceReady:
        record.sanitizedOutputs.productionMonitoringEvidenceCheck.decision ===
          'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW' &&
        !record.sanitizedOutputs.productionMonitoringEvidenceCheck
          .productionMonitoringEnabled &&
        !record.sanitizedOutputs.productionMonitoringEvidenceCheck
          .productionSmokeApproved &&
        !record.sanitizedOutputs.productionMonitoringEvidenceCheck
          .publicTrustClaimsApproved &&
        !record.sanitizedOutputs.productionMonitoringEvidenceCheck
          .externalMonitoringSendEnabled &&
        !record.sanitizedOutputs.productionMonitoringEvidenceCheck
          .runtimeMonitoringImplemented,
      productionGateBoundariesReady:
        record.sanitizedOutputs.productionGateBoundaryCheck.decision ===
          'BOUNDARIES_READY_FOR_REVIEW' &&
        record.sanitizedOutputs.productionGateBoundaryCheck.artifactCount === 14 &&
        record.sanitizedOutputs.productionGateBoundaryCheck.linkedArtifactCount ===
          14 &&
        record.sanitizedOutputs.productionGateBoundaryCheck.existingArtifactCount ===
          14 &&
        !record.sanitizedOutputs.productionGateBoundaryCheck
          .productionSensitiveFeaturesApproved &&
        !record.sanitizedOutputs.productionGateBoundaryCheck
          .publicTrustClaimsApproved,
      productionGateArtifactCount:
        record.sanitizedOutputs.productionGateBoundaryCheck.artifactCount,
      cspReportOnlyEvidenceReady:
        record.sanitizedOutputs.cspReportOnlyEvidenceCheck.decision ===
          'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW' &&
        !record.sanitizedOutputs.cspReportOnlyEvidenceCheck
          .reportOnlyRuntimeApproved &&
        !record.sanitizedOutputs.cspReportOnlyEvidenceCheck
          .productionCspApproved &&
        !record.sanitizedOutputs.cspReportOnlyEvidenceCheck
          .enforcingCspApproved &&
        !record.sanitizedOutputs.cspReportOnlyEvidenceCheck
          .publicTrustClaimsApproved,
      trustCenterPublicClaimsReady:
        record.sanitizedOutputs.trustCenterPublicClaimsCheck.decision ===
          'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW' &&
        !record.sanitizedOutputs.trustCenterPublicClaimsCheck
          .publicTrustCenterPublishingApproved &&
        !record.sanitizedOutputs.trustCenterPublicClaimsCheck
          .publicClaimsApproved,
      releaseHandoffReady:
        record.sanitizedOutputs.releaseHandoffConsistencyCheck.decision ===
          'RELEASE_HANDOFF_READY_FOR_REVIEW' &&
        record.sanitizedOutputs.releaseHandoffConsistencyCheck.artifactCount ===
          28 &&
        record.sanitizedOutputs.releaseHandoffConsistencyCheck.lockedGateCount ===
          14 &&
        record.sanitizedOutputs.releaseHandoffConsistencyCheck
          .humanReviewBoundaryCount === 17 &&
        !record.sanitizedOutputs.releaseHandoffConsistencyCheck
          .productionSensitiveFeaturesApproved &&
        !record.sanitizedOutputs.releaseHandoffConsistencyCheck
          .publicTrustClaimsApproved,
      releaseHandoffLockedGateCount:
        record.sanitizedOutputs.releaseHandoffConsistencyCheck.lockedGateCount,
      safetyBoundaryConfirmed,
      manualFollowUpStillRequired,
    },
    nextSafeAction: readyForHumanReleaseReview
      ? 'Use this label-only evidence as engineering input for human release review; production-sensitive actions still require their separate approval packets and exact owner approval.'
      : 'Resolve the local release evidence findings before requesting human release review.',
  }
}

export function buildPassingReleaseReadinessLocalEvidenceExample(): ReleaseReadinessLocalEvidenceRecord {
  return {
    evidenceLabel: 'Local release-readiness evidence example - label-only',
    capturedByLabel: 'Repository reviewer label only',
    capturedAtLabel: '2026-07-06 local verification window label',
    repositoryBranchLabel: 'Current branch label only',
    commitLabel: 'Short commit label only',
    worktreeStatusLabel: 'Worktree status label only',
    reviewPurposeLabel: 'Production-readiness engineering review label',
    relatedApprovalPacketLabel:
      'No production-sensitive approval packet attached to this local evidence',
    productionSensitiveFeatureUnderReviewLabel:
      'Repository release-readiness checks only',
    environmentIdentity: {
      environmentType: 'LOCAL_REPOSITORY_ONLY',
      productionAccessUsed: false,
      productionFlagsEnabled: false,
      migrationsApplied: false,
      operationalRlsChanged: false,
      recordsMutated: false,
      externalServicesCalled: false,
      browserManualQaIncluded: false,
    },
    commandResults: RELEASE_READINESS_LOCAL_COMMANDS.map((command, index) => ({
      order: index + 1,
      command,
      status: 'PASS',
      sanitizedNotesLabel: 'Passed with sanitized output labels only',
    })),
    sanitizedOutputs: {
      releaseEnvironmentGuard: {
        decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
        productionSensitiveRuntimeFlagsEnabled: false,
        qaPrototypeRuntimeResidueConfigured: false,
        rawValuesCaptured: false,
      },
      releaseEnvCleanupGuide: {
        decision: 'NOT_RUN',
        mutatesEnvironment: false,
        secretValuesPrinted: false,
        variablesReportedByNameOnly: true,
        rawValuesCaptured: false,
        cleanupPerformed: 'none',
      },
      rlsProductionEvidenceCheck: {
        decision: 'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
        readyForProductionRollout: false,
        productionRlsApproved: false,
        appliesMigrations: false,
        changesOperationalRls: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
      productionMonitoringEvidenceCheck: {
        decision: 'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
        productionMonitoringEnabled: false,
        productionSmokeApproved: false,
        publicTrustClaimsApproved: false,
        externalMonitoringSendEnabled: false,
        runtimeMonitoringImplemented: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
      productionGateBoundaryCheck: {
        decision: 'BOUNDARIES_READY_FOR_REVIEW',
        artifactCount: 14,
        linkedArtifactCount: 14,
        existingArtifactCount: 14,
        productionSensitiveFeaturesApproved: false,
        publicTrustClaimsApproved: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
      cspReportOnlyEvidenceCheck: {
        decision: 'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW',
        reportOnlyRuntimeApproved: false,
        productionCspApproved: false,
        enforcingCspApproved: false,
        publicTrustClaimsApproved: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
      trustCenterPublicClaimsCheck: {
        decision: 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
        publicTrustCenterPublishingApproved: false,
        publicClaimsApproved: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
      releaseHandoffConsistencyCheck: {
        decision: 'RELEASE_HANDOFF_READY_FOR_REVIEW',
        artifactCount: 28,
        lockedGateCount: 14,
        humanReviewBoundaryCount: 17,
        productionSensitiveFeaturesApproved: false,
        publicTrustClaimsApproved: false,
        findingsCount: 0,
        rawLabelsOrSecretsCaptured: false,
      },
    },
    safetyBoundaryConfirmation: {
      didNotDeployCode: true,
      didNotEnableProductionFlags: true,
      didNotAddProductionFlags: true,
      didNotAccessProduction: true,
      didNotApplyMigrations: true,
      didNotChangeOperationalRls: true,
      didNotMutateRecords: true,
      didNotTouchGoogleCalendarData: true,
      didNotRunExports: true,
      didNotCallAi: true,
      didNotAccessStorage: true,
      didNotCreateSignedUrls: true,
      didNotSendCommunications: true,
      didNotGenerateCertificates: true,
      didNotMakePublicTrustCenterClaims: true,
    },
    manualFollowUpConfirmed: {
      productOwnerApprovalStillRequired: true,
      securityDataOwnerApprovalStillRequired: true,
      productionSafeSmokeFixturesStillRequired: true,
      rollbackOwnerAssignmentStillRequired: true,
      monitoringOwnerAssignmentStillRequired: true,
      publicTrustCenterApprovalStillRequired: true,
    },
    finalLocalEvidenceDecision: {
      localChecklistResult: 'PASS',
      readyToRequestHumanReview: true,
      productionApprovalGranted: false,
      remainingBlockersLabel:
        'Production-sensitive gates remain subject to separate approvals',
      nextSafeActionLabel:
        'Request human release review or continue safe non-production readiness work',
    },
  }
}

function validateRequiredLabels(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  for (const key of [
    'evidenceLabel',
    'capturedByLabel',
    'capturedAtLabel',
    'repositoryBranchLabel',
    'commitLabel',
    'worktreeStatusLabel',
    'reviewPurposeLabel',
    'relatedApprovalPacketLabel',
    'productionSensitiveFeatureUnderReviewLabel',
  ] as const) {
    requireNonEmptyLabel(record[key], key, findings)
  }
}

function validateEnvironmentIdentity(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  const identity = record.environmentIdentity

  if (identity.environmentType !== 'LOCAL_REPOSITORY_ONLY') {
    findings.push('environmentIdentity.environmentType must be LOCAL_REPOSITORY_ONLY')
  }

  for (const [key, value] of Object.entries(identity)) {
    if (key === 'environmentType') {
      continue
    }

    if (value !== false) {
      findings.push(`environmentIdentity.${key} must be false`)
    }
  }
}

function validateCommandResults(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  if (record.commandResults.length !== RELEASE_READINESS_LOCAL_COMMANDS.length) {
    findings.push(
      `commandResults must include exactly ${RELEASE_READINESS_LOCAL_COMMANDS.length} commands`,
    )
  }

  RELEASE_READINESS_LOCAL_COMMANDS.forEach((expectedCommand, index) => {
    const result = record.commandResults[index]

    if (!result) {
      findings.push(`commandResults[${index}] is missing ${expectedCommand}`)
      return
    }

    if (result.order !== index + 1) {
      findings.push(`commandResults[${index}].order must be ${index + 1}`)
    }

    if (result.command !== expectedCommand) {
      findings.push(
        `commandResults[${index}].command must be ${expectedCommand}`,
      )
    }

    if (result.status !== 'PASS') {
      findings.push(`commandResults[${index}].status must be PASS`)
    }

    requireNonEmptyLabel(
      result.sanitizedNotesLabel,
      `commandResults[${index}].sanitizedNotesLabel`,
      findings,
    )
  })
}

function validateReleaseEnvCleanupGuide(
  cleanupGuide: ReleaseReadinessEnvCleanupGuideEvidence | undefined,
  findings: string[],
) {
  if (!cleanupGuide) {
    return
  }

  if (!RELEASE_ENV_CLEANUP_GUIDE_DECISIONS.has(cleanupGuide.decision)) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.decision must be NOT_RUN, RELEASE_ENV_ALREADY_CLEAN, or RELEASE_ENV_CLEANUP_GUIDE_READY',
    )
  }

  if (cleanupGuide.mutatesEnvironment) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.mutatesEnvironment must be false',
    )
  }

  if (cleanupGuide.secretValuesPrinted) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.secretValuesPrinted must be false',
    )
  }

  if (cleanupGuide.variablesReportedByNameOnly !== true) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.variablesReportedByNameOnly must be true',
    )
  }

  if (cleanupGuide.rawValuesCaptured) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.rawValuesCaptured must be false',
    )
  }

  if (
    !RELEASE_ENV_CLEANUP_PERFORMED_VALUES.has(cleanupGuide.cleanupPerformed)
  ) {
    findings.push(
      'sanitizedOutputs.releaseEnvCleanupGuide.cleanupPerformed must be none, process_scope, user_scope, or process_and_user_scope',
    )
  }
}

function validateSanitizedOutputs(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  const {
    releaseEnvironmentGuard,
    releaseEnvCleanupGuide,
    rlsProductionEvidenceCheck,
    productionMonitoringEvidenceCheck,
    productionGateBoundaryCheck,
    cspReportOnlyEvidenceCheck,
    trustCenterPublicClaimsCheck,
    releaseHandoffConsistencyCheck,
  } =
    record.sanitizedOutputs

  if (
    releaseEnvironmentGuard.decision !==
    'RELEASE_READINESS_ENVIRONMENT_ACCEPTED'
  ) {
    findings.push(
      'sanitizedOutputs.releaseEnvironmentGuard.decision must be RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
    )
  }

  if (releaseEnvironmentGuard.productionSensitiveRuntimeFlagsEnabled) {
    findings.push(
      'sanitizedOutputs.releaseEnvironmentGuard.productionSensitiveRuntimeFlagsEnabled must be false',
    )
  }

  if (releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured) {
    findings.push(
      'sanitizedOutputs.releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured must be false',
    )
  }

  if (releaseEnvironmentGuard.rawValuesCaptured) {
    findings.push(
      'sanitizedOutputs.releaseEnvironmentGuard.rawValuesCaptured must be false',
    )
  }

  validateReleaseEnvCleanupGuide(releaseEnvCleanupGuide, findings)

  if (
    rlsProductionEvidenceCheck.decision !==
    'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW'
  ) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.decision must be RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
    )
  }

  if (rlsProductionEvidenceCheck.readyForProductionRollout) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.readyForProductionRollout must be false',
    )
  }

  if (rlsProductionEvidenceCheck.productionRlsApproved) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.productionRlsApproved must be false',
    )
  }

  if (rlsProductionEvidenceCheck.appliesMigrations) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.appliesMigrations must be false',
    )
  }

  if (rlsProductionEvidenceCheck.changesOperationalRls) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.changesOperationalRls must be false',
    )
  }

  if (rlsProductionEvidenceCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.findingsCount must be 0',
    )
  }

  if (rlsProductionEvidenceCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.rlsProductionEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }

  if (
    productionMonitoringEvidenceCheck.decision !==
    'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW'
  ) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.decision must be PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
    )
  }

  if (productionMonitoringEvidenceCheck.productionMonitoringEnabled) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.productionMonitoringEnabled must be false',
    )
  }

  if (productionMonitoringEvidenceCheck.productionSmokeApproved) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.productionSmokeApproved must be false',
    )
  }

  if (productionMonitoringEvidenceCheck.publicTrustClaimsApproved) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.publicTrustClaimsApproved must be false',
    )
  }

  if (productionMonitoringEvidenceCheck.externalMonitoringSendEnabled) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.externalMonitoringSendEnabled must be false',
    )
  }

  if (productionMonitoringEvidenceCheck.runtimeMonitoringImplemented) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.runtimeMonitoringImplemented must be false',
    )
  }

  if (productionMonitoringEvidenceCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.findingsCount must be 0',
    )
  }

  if (productionMonitoringEvidenceCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.productionMonitoringEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }

  if (productionGateBoundaryCheck.decision !== 'BOUNDARIES_READY_FOR_REVIEW') {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.decision must be BOUNDARIES_READY_FOR_REVIEW',
    )
  }

  if (productionGateBoundaryCheck.productionSensitiveFeaturesApproved) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.productionSensitiveFeaturesApproved must be false',
    )
  }

  if (productionGateBoundaryCheck.publicTrustClaimsApproved) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.publicTrustClaimsApproved must be false',
    )
  }

  if (productionGateBoundaryCheck.artifactCount !== 14) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.artifactCount must be 14',
    )
  }

  if (productionGateBoundaryCheck.linkedArtifactCount !== 14) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.linkedArtifactCount must be 14',
    )
  }

  if (productionGateBoundaryCheck.existingArtifactCount !== 14) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.existingArtifactCount must be 14',
    )
  }

  if (productionGateBoundaryCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.findingsCount must be 0',
    )
  }

  if (productionGateBoundaryCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.productionGateBoundaryCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }

  if (
    cspReportOnlyEvidenceCheck.decision !==
    'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW'
  ) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.decision must be CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW',
    )
  }

  if (cspReportOnlyEvidenceCheck.reportOnlyRuntimeApproved) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.reportOnlyRuntimeApproved must be false',
    )
  }

  if (cspReportOnlyEvidenceCheck.productionCspApproved) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.productionCspApproved must be false',
    )
  }

  if (cspReportOnlyEvidenceCheck.enforcingCspApproved) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.enforcingCspApproved must be false',
    )
  }

  if (cspReportOnlyEvidenceCheck.publicTrustClaimsApproved) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.publicTrustClaimsApproved must be false',
    )
  }

  if (cspReportOnlyEvidenceCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.findingsCount must be 0',
    )
  }

  if (cspReportOnlyEvidenceCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.cspReportOnlyEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }

  if (
    trustCenterPublicClaimsCheck.decision !==
    'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW'
  ) {
    findings.push(
      'sanitizedOutputs.trustCenterPublicClaimsCheck.decision must be PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
    )
  }

  if (trustCenterPublicClaimsCheck.publicTrustCenterPublishingApproved) {
    findings.push(
      'sanitizedOutputs.trustCenterPublicClaimsCheck.publicTrustCenterPublishingApproved must be false',
    )
  }

  if (trustCenterPublicClaimsCheck.publicClaimsApproved) {
    findings.push(
      'sanitizedOutputs.trustCenterPublicClaimsCheck.publicClaimsApproved must be false',
    )
  }

  if (trustCenterPublicClaimsCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.trustCenterPublicClaimsCheck.findingsCount must be 0',
    )
  }

  if (trustCenterPublicClaimsCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.trustCenterPublicClaimsCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }

  if (
    releaseHandoffConsistencyCheck.decision !==
    'RELEASE_HANDOFF_READY_FOR_REVIEW'
  ) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.decision must be RELEASE_HANDOFF_READY_FOR_REVIEW',
    )
  }

  if (releaseHandoffConsistencyCheck.productionSensitiveFeaturesApproved) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.productionSensitiveFeaturesApproved must be false',
    )
  }

  if (releaseHandoffConsistencyCheck.publicTrustClaimsApproved) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.publicTrustClaimsApproved must be false',
    )
  }

  if (releaseHandoffConsistencyCheck.artifactCount !== 28) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.artifactCount must be 28',
    )
  }

  if (releaseHandoffConsistencyCheck.lockedGateCount !== 14) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.lockedGateCount must be 14',
    )
  }

  if (releaseHandoffConsistencyCheck.humanReviewBoundaryCount !== 17) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.humanReviewBoundaryCount must be 17',
    )
  }

  if (releaseHandoffConsistencyCheck.findingsCount !== 0) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.findingsCount must be 0',
    )
  }

  if (releaseHandoffConsistencyCheck.rawLabelsOrSecretsCaptured) {
    findings.push(
      'sanitizedOutputs.releaseHandoffConsistencyCheck.rawLabelsOrSecretsCaptured must be false',
    )
  }
}

function validateSafetyBoundaries(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  for (const [key, value] of Object.entries(
    record.safetyBoundaryConfirmation,
  )) {
    if (value !== true) {
      findings.push(`safetyBoundaryConfirmation.${key} must be true`)
    }
  }
}

function validateManualFollowUp(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  for (const [key, value] of Object.entries(record.manualFollowUpConfirmed)) {
    if (value !== true) {
      findings.push(`manualFollowUpConfirmed.${key} must be true`)
    }
  }
}

function validateFinalDecision(
  record: ReleaseReadinessLocalEvidenceRecord,
  findings: string[],
) {
  const decision = record.finalLocalEvidenceDecision

  if (decision.localChecklistResult !== 'PASS') {
    findings.push('finalLocalEvidenceDecision.localChecklistResult must be PASS')
  }

  if (!decision.readyToRequestHumanReview) {
    findings.push(
      'finalLocalEvidenceDecision.readyToRequestHumanReview must be true',
    )
  }

  if (decision.productionApprovalGranted) {
    findings.push(
      'finalLocalEvidenceDecision.productionApprovalGranted must remain false',
    )
  }

  requireNonEmptyLabel(
    decision.remainingBlockersLabel,
    'finalLocalEvidenceDecision.remainingBlockersLabel',
    findings,
  )
  requireNonEmptyLabel(
    decision.nextSafeActionLabel,
    'finalLocalEvidenceDecision.nextSafeActionLabel',
    findings,
  )
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

function collectForbiddenKeys(
  value: unknown,
  findings: string[],
  path = 'record',
) {
  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`

    if (FORBIDDEN_RAW_KEYS.has(key)) {
      findings.push(`${childPath} must not be present in local release evidence`)
    }

    collectForbiddenKeys(child, findings, childPath)
  }
}

function collectForbiddenValues(
  value: unknown,
  findings: string[],
  path = 'record',
) {
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
