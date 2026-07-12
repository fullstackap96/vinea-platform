import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('production CSP report-only evidence package consistency checker doc', () => {
  const doc = readRepoFile(
    'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
  )

  it('keeps the checker framed as repository-only and production-safe', () => {
    expect(doc).toContain(
      'CSP REPORT-ONLY EVIDENCE PACKAGE CHECKER PREPARED; RUNTIME CSP REMAINS NO-GO',
    )
    expect(doc).toContain('repository-only checker')
    expect(doc).toContain('does not enable CSP')
    expect(doc).toContain('does not access production')
    expect(doc).toContain('does not apply migrations')
    expect(doc).toContain('does not make public trust-center claims')
  })

  it('links the source helper and checked artifacts', () => {
    for (const expected of [
      'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
      'lib/server/productionCspReportOnlyEvidencePackageConsistency.test.ts',
      'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
      'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
      'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
      'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
      'lib/server/nextSecurityHeadersConfig.test.ts',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps report-only runtime and public trust claims unapproved', () => {
    for (const expected of [
      'reportOnlyRuntimeApproved: false',
      'productionCspApproved: false',
      'enforcingCspApproved: false',
      'publicTrustClaimsApproved: false',
      'Passing this checker does not approve',
      'report-only CSP runtime',
      'production CSP',
      'enforcing CSP',
      'public trust-center publication',
    ]) {
      expect(doc).toContain(expected)
    }
  })
})
