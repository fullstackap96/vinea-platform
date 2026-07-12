import { describe, expect, it } from 'vitest'

import {
  buildPassingReleaseReadinessLocalEvidenceExample,
  RELEASE_READINESS_LOCAL_COMMANDS,
  validateReleaseReadinessLocalEvidence,
  type ReleaseReadinessLocalEvidenceRecord,
} from './releaseReadinessLocalEvidence'

function completeEvidenceRecord(
  overrides: Partial<ReleaseReadinessLocalEvidenceRecord> = {},
): ReleaseReadinessLocalEvidenceRecord {
  return {
    ...buildPassingReleaseReadinessLocalEvidenceExample(),
    ...overrides,
  }
}

describe('release readiness local evidence validator', () => {
  it('accepts a sanitized local release-readiness evidence record for human review', () => {
    const result = validateReleaseReadinessLocalEvidence(completeEvidenceRecord())

    expect(result.decision).toBe('READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(result.readyForHumanReleaseReview).toBe(true)
    expect(result.productionApprovalGranted).toBe(false)
    expect(result.findings).toEqual([])
    expect(result.safeSummary.commandCount).toBe(
      RELEASE_READINESS_LOCAL_COMMANDS.length,
    )
    expect(result.safeSummary.passingCommandCount).toBe(
      RELEASE_READINESS_LOCAL_COMMANDS.length,
    )
    expect(result.safeSummary.failedOrMissingCommandCount).toBe(0)
    expect(result.safeSummary.releaseEnvironmentAccepted).toBe(true)
    expect(result.safeSummary.qaPrototypeRuntimeResidueClear).toBe(true)
    expect(result.safeSummary.rlsProductionEvidenceReady).toBe(true)
    expect(result.safeSummary.productionMonitoringEvidenceReady).toBe(true)
    expect(result.safeSummary.productionGateArtifactCount).toBe(14)
    expect(result.safeSummary.productionGateBoundariesReady).toBe(true)
    expect(result.safeSummary.cspReportOnlyEvidenceReady).toBe(true)
    expect(result.safeSummary.trustCenterPublicClaimsReady).toBe(true)
    expect(result.safeSummary.releaseHandoffLockedGateCount).toBe(14)
    expect(result.safeSummary.releaseHandoffReady).toBe(true)
    expect(result.safeSummary.safetyBoundaryConfirmed).toBe(true)
    expect(result.safeSummary.manualFollowUpStillRequired).toBe(true)
    expect(result.nextSafeAction).toContain('human release review')
  })

  it('builds the current passing example as label-only evidence that does not approve production', () => {
    const record = buildPassingReleaseReadinessLocalEvidenceExample()
    const result = validateReleaseReadinessLocalEvidence(record)

    expect(record.evidenceLabel).toContain('label-only')
    expect(record.environmentIdentity.environmentType).toBe(
      'LOCAL_REPOSITORY_ONLY',
    )
    expect(record.finalLocalEvidenceDecision.productionApprovalGranted).toBe(
      false,
    )
    expect(result.decision).toBe('READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(result.productionApprovalGranted).toBe(false)
  })

  it('holds when any required release-readiness command failed or is out of order', () => {
    const record = completeEvidenceRecord({
      commandResults: [
        {
          order: 1,
          command: RELEASE_READINESS_LOCAL_COMMANDS[0],
          status: 'PASS',
          sanitizedNotesLabel: 'Passed',
        },
        {
          order: 2,
          command: 'npm run typecheck',
          status: 'FAIL',
          sanitizedNotesLabel: 'Failed without raw output',
        },
      ],
    })
    const result = validateReleaseReadinessLocalEvidence(record)

    expect(result.decision).toBe('HOLD')
    expect(result.readyForHumanReleaseReview).toBe(false)
    expect(result.findings).toEqual(
      expect.arrayContaining([
        `commandResults must include exactly ${RELEASE_READINESS_LOCAL_COMMANDS.length} commands`,
        `commandResults[1].command must be ${RELEASE_READINESS_LOCAL_COMMANDS[1]}`,
        'commandResults[1].status must be PASS',
        `commandResults[2] is missing ${RELEASE_READINESS_LOCAL_COMMANDS[2]}`,
      ]),
    )
  })

  it('holds when sanitized gate outputs are not accepted or production approval appears granted', () => {
    const record = completeEvidenceRecord()
    const result = validateReleaseReadinessLocalEvidence({
      ...record,
      sanitizedOutputs: {
        ...record.sanitizedOutputs,
        releaseEnvironmentGuard: {
          decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
          productionSensitiveRuntimeFlagsEnabled: true,
          qaPrototypeRuntimeResidueConfigured: true,
          rawValuesCaptured: true,
        },
        rlsProductionEvidenceCheck: {
          decision: 'RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW',
          readyForProductionRollout: true,
          productionRlsApproved: true,
          appliesMigrations: true,
          changesOperationalRls: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
        productionMonitoringEvidenceCheck: {
          decision: 'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
          productionMonitoringEnabled: true,
          productionSmokeApproved: true,
          publicTrustClaimsApproved: true,
          externalMonitoringSendEnabled: true,
          runtimeMonitoringImplemented: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
        productionGateBoundaryCheck: {
          decision: 'BOUNDARIES_READY_FOR_REVIEW',
          artifactCount: 13,
          linkedArtifactCount: 13,
          existingArtifactCount: 13,
          productionSensitiveFeaturesApproved: true,
          publicTrustClaimsApproved: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
        cspReportOnlyEvidenceCheck: {
          decision: 'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW',
          reportOnlyRuntimeApproved: true,
          productionCspApproved: true,
          enforcingCspApproved: true,
          publicTrustClaimsApproved: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
        trustCenterPublicClaimsCheck: {
          decision: 'PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW',
          publicTrustCenterPublishingApproved: true,
          publicClaimsApproved: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
        releaseHandoffConsistencyCheck: {
          decision: 'RELEASE_HANDOFF_READY_FOR_REVIEW',
          artifactCount: 28,
          lockedGateCount: 13,
          humanReviewBoundaryCount: 17,
          productionSensitiveFeaturesApproved: true,
          publicTrustClaimsApproved: true,
          findingsCount: 2,
          rawLabelsOrSecretsCaptured: true,
        },
      },
      finalLocalEvidenceDecision: {
        ...record.finalLocalEvidenceDecision,
        productionApprovalGranted: true,
      },
    } as unknown as ReleaseReadinessLocalEvidenceRecord)

    expect(result.decision).toBe('HOLD')
    expect(result.productionApprovalGranted).toBe(false)
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'sanitizedOutputs.releaseEnvironmentGuard.productionSensitiveRuntimeFlagsEnabled must be false',
        'sanitizedOutputs.releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured must be false',
        'sanitizedOutputs.releaseEnvironmentGuard.rawValuesCaptured must be false',
        'sanitizedOutputs.rlsProductionEvidenceCheck.readyForProductionRollout must be false',
        'sanitizedOutputs.rlsProductionEvidenceCheck.productionRlsApproved must be false',
        'sanitizedOutputs.rlsProductionEvidenceCheck.appliesMigrations must be false',
        'sanitizedOutputs.rlsProductionEvidenceCheck.changesOperationalRls must be false',
        'sanitizedOutputs.rlsProductionEvidenceCheck.findingsCount must be 0',
        'sanitizedOutputs.rlsProductionEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.productionMonitoringEnabled must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.productionSmokeApproved must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.publicTrustClaimsApproved must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.externalMonitoringSendEnabled must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.runtimeMonitoringImplemented must be false',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.findingsCount must be 0',
        'sanitizedOutputs.productionMonitoringEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
        'sanitizedOutputs.productionGateBoundaryCheck.productionSensitiveFeaturesApproved must be false',
        'sanitizedOutputs.productionGateBoundaryCheck.publicTrustClaimsApproved must be false',
        'sanitizedOutputs.productionGateBoundaryCheck.artifactCount must be 14',
        'sanitizedOutputs.productionGateBoundaryCheck.linkedArtifactCount must be 14',
        'sanitizedOutputs.productionGateBoundaryCheck.existingArtifactCount must be 14',
        'sanitizedOutputs.productionGateBoundaryCheck.findingsCount must be 0',
        'sanitizedOutputs.productionGateBoundaryCheck.rawLabelsOrSecretsCaptured must be false',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.reportOnlyRuntimeApproved must be false',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.productionCspApproved must be false',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.enforcingCspApproved must be false',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.publicTrustClaimsApproved must be false',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.findingsCount must be 0',
        'sanitizedOutputs.cspReportOnlyEvidenceCheck.rawLabelsOrSecretsCaptured must be false',
        'sanitizedOutputs.trustCenterPublicClaimsCheck.publicTrustCenterPublishingApproved must be false',
        'sanitizedOutputs.trustCenterPublicClaimsCheck.publicClaimsApproved must be false',
        'sanitizedOutputs.trustCenterPublicClaimsCheck.findingsCount must be 0',
        'sanitizedOutputs.trustCenterPublicClaimsCheck.rawLabelsOrSecretsCaptured must be false',
        'sanitizedOutputs.releaseHandoffConsistencyCheck.lockedGateCount must be 14',
        'sanitizedOutputs.releaseHandoffConsistencyCheck.productionSensitiveFeaturesApproved must be false',
        'sanitizedOutputs.releaseHandoffConsistencyCheck.publicTrustClaimsApproved must be false',
        'sanitizedOutputs.releaseHandoffConsistencyCheck.findingsCount must be 0',
        'sanitizedOutputs.releaseHandoffConsistencyCheck.rawLabelsOrSecretsCaptured must be false',
        'finalLocalEvidenceDecision.productionApprovalGranted must remain false',
      ]),
    )
  })

  it('holds when safety boundaries or follow-up requirements are missing', () => {
    const record = completeEvidenceRecord()
    const result = validateReleaseReadinessLocalEvidence({
      ...record,
      safetyBoundaryConfirmation: {
        ...record.safetyBoundaryConfirmation,
        didNotAccessProduction: false,
        didNotRunExports: false,
      },
      manualFollowUpConfirmed: {
        ...record.manualFollowUpConfirmed,
        productOwnerApprovalStillRequired: false,
      },
    } as unknown as ReleaseReadinessLocalEvidenceRecord)

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'safetyBoundaryConfirmation.didNotAccessProduction must be true',
        'safetyBoundaryConfirmation.didNotRunExports must be true',
        'manualFollowUpConfirmed.productOwnerApprovalStillRequired must be true',
      ]),
    )
  })

  it('accepts optional label-only release environment cleanup guide evidence', () => {
    const record = completeEvidenceRecord()
    const result = validateReleaseReadinessLocalEvidence({
      ...record,
      sanitizedOutputs: {
        ...record.sanitizedOutputs,
        releaseEnvCleanupGuide: {
          decision: 'RELEASE_ENV_CLEANUP_GUIDE_READY',
          mutatesEnvironment: false,
          secretValuesPrinted: false,
          variablesReportedByNameOnly: true,
          rawValuesCaptured: false,
          cleanupPerformed: 'process_scope',
        },
      },
    })

    expect(result.decision).toBe('READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(result.findings).toEqual([])
  })

  it('rejects unsafe or unsupported release environment cleanup guide evidence', () => {
    const record = completeEvidenceRecord()
    const result = validateReleaseReadinessLocalEvidence({
      ...record,
      sanitizedOutputs: {
        ...record.sanitizedOutputs,
        releaseEnvCleanupGuide: {
          decision: 'CLEANED_WITH_RAW_OUTPUT',
          mutatesEnvironment: true,
          secretValuesPrinted: true,
          variablesReportedByNameOnly: false,
          rawValuesCaptured: true,
          cleanupPerformed: 'production_user_scope',
        },
      },
    } as unknown as ReleaseReadinessLocalEvidenceRecord)

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'sanitizedOutputs.releaseEnvCleanupGuide.decision must be NOT_RUN, RELEASE_ENV_ALREADY_CLEAN, or RELEASE_ENV_CLEANUP_GUIDE_READY',
        'sanitizedOutputs.releaseEnvCleanupGuide.mutatesEnvironment must be false',
        'sanitizedOutputs.releaseEnvCleanupGuide.secretValuesPrinted must be false',
        'sanitizedOutputs.releaseEnvCleanupGuide.variablesReportedByNameOnly must be true',
        'sanitizedOutputs.releaseEnvCleanupGuide.rawValuesCaptured must be false',
        'sanitizedOutputs.releaseEnvCleanupGuide.cleanupPerformed must be none, process_scope, user_scope, or process_and_user_scope',
      ]),
    )
  })

  it('rejects raw output containers, secrets, database URLs, tokens, and raw IDs', () => {
    const result = validateReleaseReadinessLocalEvidence({
      ...completeEvidenceRecord(),
      rawCommandOutput: 'postgresql://postgres:secret@db.example.supabase.co/postgres',
      sanitizedOutputs: {
        ...completeEvidenceRecord().sanitizedOutputs,
        releaseEnvironmentGuard: {
          decision: 'RELEASE_READINESS_ENVIRONMENT_ACCEPTED',
          productionSensitiveRuntimeFlagsEnabled: false,
          qaPrototypeRuntimeResidueConfigured: false,
          rawValuesCaptured: false,
          stdout: 'bearer eyJabc.def.ghi',
        },
      },
      finalLocalEvidenceDecision: {
        ...completeEvidenceRecord().finalLocalEvidenceDecision,
        remainingBlockersLabel:
          'raw id 11111111-1111-4111-8111-111111111111 should not be here',
      },
    } as unknown as ReleaseReadinessLocalEvidenceRecord)

    expect(result.decision).toBe('HOLD')
    expect(result.findings).toEqual(
      expect.arrayContaining([
        'record.rawCommandOutput must not be present in local release evidence',
        'record.sanitizedOutputs.releaseEnvironmentGuard.stdout must not be present in local release evidence',
        'record.rawCommandOutput contains possible database url',
        'record.sanitizedOutputs.releaseEnvironmentGuard.stdout contains possible bearer token',
        'record.finalLocalEvidenceDecision.remainingBlockersLabel contains possible raw uuid',
      ]),
    )
  })
})
