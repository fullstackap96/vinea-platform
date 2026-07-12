import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(
  process.cwd(),
  'docs',
  'PRODUCTION_MONITORING_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md'
)

describe('production monitoring evidence package consistency checker doc', () => {
  it('documents repository-only scope and production no-go boundaries', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a repository-only production-readiness check.',
      'does not implement runtime monitoring',
      'enable production monitoring',
      'add production flags',
      'wire an external observability vendor',
      'send external events',
      'page staff',
      'create incidents',
      'notify customers',
      'access production',
      'apply migrations',
      'change operational RLS',
      'mutate records',
      'touch Google Calendar data',
      'run exports',
      'call AI',
      'access storage',
      'create signed URLs',
      'send communications',
      'generate certificates',
      'make public trust claims',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines the source helper, safe result, and failure behavior', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'lib/server/productionMonitoringEvidencePackageConsistency.ts',
      'checkProductionMonitoringEvidencePackageConsistency(...)',
      'decision: READY_FOR_RUNTIME_APPROVAL_REVIEW',
      'productionMonitoringEnabled: false',
      'productionSmokeApproved: false',
      'publicTrustClaimsApproved: false',
      'artifactBoundaryCount',
      'findings: []',
      '`READY_FOR_RUNTIME_APPROVAL_REVIEW` only means the repository monitoring package is internally consistent enough for human review.',
      'If the checker returns `NEEDS_ATTENTION`, stop before preparing any runtime approval request.',
      'missing critical artifact boundary',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('documents critical artifact-boundary checks', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Critical linked artifacts preserve required boundary language',
      'runtime implementation approval',
      'non-production redaction smoke',
      'smoke evidence capture',
      'runtime source preflight',
      'docs/PRODUCTION_MONITORING_RUNTIME_IMPLEMENTATION_APPROVAL_PACKET_20260705.md',
      'docs/PRODUCTION_MONITORING_NONPRODUCTION_REDACTION_SMOKE_QA_PACKET_20260705.md',
      'docs/PRODUCTION_MONITORING_SMOKE_EVIDENCE_TEMPLATE_20260705.md',
      'lib/server/productionMonitoringRuntimePreflight.ts',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('forbids secrets and sensitive production evidence in the checker path', () => {
    const doc = readFileSync(docPath, 'utf8')

    for (const expected of [
      'Do not paste passwords',
      'database URLs',
      'service-role keys',
      'anon keys',
      'OAuth secrets',
      'access tokens',
      'refresh tokens',
      'OpenAI keys',
      'monitoring DSNs',
      'webhook URLs',
      'provider API keys',
      'incident-management keys',
      'raw exception payloads',
      'raw request payloads',
      'AI prompts',
      'AI outputs',
      'raw export data',
      'document contents',
      'storage paths',
      'signed URLs',
      'family portal token material',
      'parishioner names',
      'funeral details',
      'pastoral details',
      'canonical details',
      'real private documents',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
