import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production release readiness local evidence validator doc', () => {
  const doc = readRepoFile(
    'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
  )

  it('keeps the validator framed as repository-only and production-safe', () => {
    expect(doc).toContain('repository-only validation helper')
    expect(doc).toContain('does not deploy')
    expect(doc).toContain('add production flags')
    expect(doc).toContain('does not access production')
    expect(doc).toContain('touch Google Calendar data')
    expect(doc).toContain('does not apply migrations')
    expect(doc).toContain('does not make public trust-center claims')
    expect(doc).toContain('does not grant production approval')
  })

  it('documents required sanitized input shape and passing decision', () => {
    expect(doc).toContain('lib/releaseReadinessLocalEvidence.ts')
    expect(doc).toContain('commandResults')
    expect(doc).toContain('sanitizedOutputs')
    expect(doc).toContain('safetyBoundaryConfirmation')
    expect(doc).toContain('manualFollowUpConfirmed')
    expect(doc).toContain('finalLocalEvidenceDecision')
    expect(doc).toContain('decision: READY_FOR_HUMAN_RELEASE_REVIEW')
    expect(doc).toContain('productionApprovalGranted: false')
    expect(doc).toContain('all twelve local release-readiness commands')
    expect(doc).toContain('no added production flags')
    expect(doc).toContain('no Google Calendar data touch')
    expect(doc).toContain('releaseEnvironmentGuard.qaPrototypeRuntimeResidueConfigured: false')
    expect(doc).toContain('releaseEnvCleanupGuide.decision: NOT_RUN')
    expect(doc).toContain('releaseEnvCleanupGuide.mutatesEnvironment: false')
    expect(doc).toContain('releaseEnvCleanupGuide.secretValuesPrinted: false')
    expect(doc).toContain('releaseEnvCleanupGuide.variablesReportedByNameOnly: true')
    expect(doc).toContain('releaseEnvCleanupGuide.rawValuesCaptured: false')
    expect(doc).toContain('releaseEnvCleanupGuide.cleanupPerformed: none')
    expect(doc).toContain('QA/prototype `_ACK` or `_ENV` residue is configured')
    expect(doc).toContain('optional release environment cleanup guide evidence claims mutation')
    expect(doc).toContain('check:rls-production-evidence')
    expect(doc).toContain('RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW')
    expect(doc).toContain('rlsProductionEvidenceCheck.productionRlsApproved: false')
    expect(doc).toContain('check:production-monitoring-evidence')
    expect(doc).toContain(
      'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
    )
    expect(doc).toContain(
      'productionMonitoringEvidenceCheck.productionMonitoringEnabled: false',
    )
    expect(doc).toContain('check:csp-report-only')
    expect(doc).toContain('CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW')
    expect(doc).toContain('cspReportOnlyEvidenceCheck.productionCspApproved: false')
  })

  it('documents hold conditions and forbidden raw evidence content', () => {
    for (const forbidden of [
      'rawCommandOutput',
      'databaseUrl',
      'serviceRoleKey',
      'anonKey',
      'bearerToken',
      'jwt',
      'familyPortalToken',
      'signedUrl',
      'storagePath',
      'originalFilename',
      'privateDocumentContents',
      'rawExportContents',
      'rawAuditMetadata',
      'rawProviderPayload',
      'staffPassword',
    ]) {
      expect(doc).toContain(forbidden)
    }

    expect(doc).toContain('decision: HOLD')
    expect(doc).toContain('any required command is missing')
    expect(doc).toContain('the evidence claims production approval')
  })
})
