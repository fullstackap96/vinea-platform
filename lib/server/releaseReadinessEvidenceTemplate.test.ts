import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production release readiness local evidence template', () => {
  it('captures the release-readiness command sequence without approving production', () => {
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
    )

    expect(doc).toContain(
      'LOCAL RELEASE READINESS EVIDENCE TEMPLATE PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_VERIFICATION_20260706.md',
    )
    expect(doc).toContain(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md',
    )
    expect(doc).toContain('validateReleaseReadinessLocalEvidence')
    expect(doc).toContain('READY_FOR_HUMAN_RELEASE_REVIEW')

    const orderedCommands = [
      'npm run check:release-env',
      'npm run check:rls-production-evidence',
      'npm run check:production-monitoring-evidence',
      'npm run check:production-gates',
      'npm run check:csp-report-only',
      'npm run check:trust-center-claims',
      'npm run check:release-handoff',
      'npm run typecheck',
      'npm run typecheck:all',
      'npm run lint -- --quiet',
      'npm test',
      'npm run build',
    ]

    let previousIndex = -1
    for (const command of orderedCommands) {
      const nextIndex = doc.indexOf(command, previousIndex + 1)
      expect(nextIndex).toBeGreaterThan(previousIndex)
      previousIndex = nextIndex
    }

    expect(doc).toContain('Production approval granted by this evidence: `NO`')
    expect(doc).toContain('Local evidence validator decision:')
    expect(doc).toContain('This template is evidence hygiene only')
  })

  it('requires sanitized release and production-gate outputs', () => {
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
    )

    expect(doc).toContain('RELEASE_READINESS_ENVIRONMENT_ACCEPTED')
    expect(doc).toContain('productionSensitiveRuntimeFlagsEnabled')
    expect(doc).toContain('qaPrototypeRuntimeResidueConfigured')
    expect(doc).toContain('QA/prototype ACK or ENV residue configured: `NO`')
    expect(doc).toContain('Optional Release Environment Cleanup Guide Evidence')
    expect(doc).toContain('npm run check:release-env-cleanup-guide')
    expect(doc).toContain('RELEASE_ENV_CLEANUP_GUIDE_READY')
    expect(doc).toContain('mutatesEnvironment')
    expect(doc).toContain('secretValuesPrinted')
    expect(doc).toContain('variablesReportedByNameOnly')
    expect(doc).toContain('cleanupPerformed')
    expect(doc).toContain('RLS_PRODUCTION_EVIDENCE_READY_FOR_FINAL_HUMAN_REVIEW')
    expect(doc).toContain('productionRlsApproved')
    expect(doc).toContain('changesOperationalRls')
    expect(doc).toContain(
      'PRODUCTION_MONITORING_EVIDENCE_READY_FOR_RUNTIME_APPROVAL_REVIEW',
    )
    expect(doc).toContain('productionMonitoringEnabled')
    expect(doc).toContain('externalMonitoringSendEnabled')
    expect(doc).toContain('runtimeMonitoringImplemented')
    expect(doc).toContain('BOUNDARIES_READY_FOR_REVIEW')
    expect(doc).toContain('productionSensitiveFeaturesApproved')
    expect(doc).toContain('publicTrustClaimsApproved')
    expect(doc).toContain('CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW')
    expect(doc).toContain('reportOnlyRuntimeApproved')
    expect(doc).toContain('productionCspApproved')
    expect(doc).toContain('enforcingCspApproved')
    expect(doc).toContain('PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW')
    expect(doc).toContain('publicTrustCenterPublishingApproved')
    expect(doc).toContain('publicClaimsApproved')
    expect(doc).toContain('RELEASE_HANDOFF_READY_FOR_REVIEW')
    expect(doc).toContain('Raw values captured: `NO`')
    expect(doc).toContain('Raw labels or secrets captured: `NO`')
  })

  it('blocks secret-bearing and production-sensitive evidence content', () => {
    const doc = readRepoFile(
      'docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md',
    )

    for (const forbidden of [
      'database URLs',
      'service-role keys',
      'anon keys',
      'API keys',
      'bearer tokens',
      'JWTs',
      'OAuth tokens or refresh tokens',
      'plaintext family portal tokens',
      'signed URL values',
      'storage paths',
      'original filenames',
      'private document contents',
      'raw export contents',
      'raw audit metadata',
      'raw provider payloads',
      'raw production record IDs',
      'staff passwords',
      'parishioner private contact details',
    ]) {
      expect(doc).toContain(forbidden)
    }

    for (const boundary of [
      'This evidence did not deploy code.',
      'This evidence did not enable production flags.',
      'This evidence did not add production flags.',
      'This evidence did not access production.',
      'This evidence did not apply migrations.',
      'This evidence did not change operational RLS.',
      'This evidence did not mutate records.',
      'This evidence did not touch Google Calendar data.',
      'This evidence did not run exports.',
      'This evidence did not call AI.',
      'This evidence did not access storage.',
      'This evidence did not create signed URLs.',
      'This evidence did not send communications.',
      'This evidence did not generate certificates.',
      'This evidence did not make public trust-center claims.',
    ]) {
      expect(doc).toContain(boundary)
    }
  })
})
