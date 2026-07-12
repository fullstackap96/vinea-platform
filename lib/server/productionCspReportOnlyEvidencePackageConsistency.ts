import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type ProductionCspReportOnlyEvidencePackageConsistencyDecision =
  | 'READY_FOR_RUNTIME_APPROVAL_REVIEW'
  | 'NEEDS_ATTENTION'

export type ProductionCspReportOnlyEvidencePackageArtifactKind =
  | 'doc'
  | 'source'

export type ProductionCspReportOnlyEvidencePackageArtifact = {
  path: string
  kind: ProductionCspReportOnlyEvidencePackageArtifactKind
  requiredBeforeRuntimeApproval: boolean
}

export type ProductionCspReportOnlyEvidencePackageConsistencyFinding = {
  code:
    | 'MISSING_FILE'
    | 'MISSING_PACKET_BOUNDARY'
    | 'MISSING_BASELINE_BOUNDARY'
    | 'MISSING_PREFLIGHT_BOUNDARY'
    | 'MISSING_TEST_BOUNDARY'
    | 'UNSAFE_SECRET_LIKE_VALUE'
  path?: string
  message: string
}

export type ProductionCspReportOnlyEvidencePackageConsistencyReport = {
  schemaVersion: 1
  decision: ProductionCspReportOnlyEvidencePackageConsistencyDecision
  reportOnlyRuntimeApproved: false
  productionCspApproved: false
  enforcingCspApproved: false
  publicTrustClaimsApproved: false
  approvalPacketPath: string
  requiredArtifactCount: number
  existingArtifactCount: number
  packetBoundaryCount: number
  baselineBoundaryCount: number
  preflightBoundaryCount: number
  testBoundaryCount: number
  findings: ProductionCspReportOnlyEvidencePackageConsistencyFinding[]
}

const APPROVAL_PACKET_PATH =
  'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md'

export const PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS = [
  {
    path: APPROVAL_PACKET_PATH,
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
    kind: 'doc',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionCspReportOnlyRuntimePreflight.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/nextSecurityHeadersConfig.test.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
  {
    path: 'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
    kind: 'source',
    requiredBeforeRuntimeApproval: true,
  },
] satisfies ProductionCspReportOnlyEvidencePackageArtifact[]

const APPROVAL_PACKET_BOUNDARIES = [
  'CSP REPORT-ONLY DESIGN READY FOR REVIEW; RUNTIME CSP NOT IMPLEMENTED',
  'This packet does not enable CSP',
  'Required Approvals',
  'Product owner',
  'Security/data owner',
  'Engineering owner',
  'QA owner',
  'Support owner',
  'The first runtime implementation should be non-production only and report-only only.',
  'Content-Security-Policy-Report-Only',
  'Required Non-Production Smoke Gates',
  '/api/health',
  'Staff sign-in succeeds.',
  'Dashboard loads and selected-parish switching works.',
  'Public intake forms',
  'Family portal',
  'Google OAuth reconnect callback',
  'Document UI paths render without storage path, original filename, signed URL value, or private content exposure.',
  'Forbidden Payloads',
  'Future report-only CSP runtime code must satisfy the source-level preflight before merge',
  'lib/server/productionCspReportOnlyRuntimePreflight.ts',
  'Report-only CSP rollback must be a no-op style change',
  'No database rollback, migration rollback, storage cleanup, export cleanup, AI cleanup, Google Calendar cleanup, or record mutation is allowed for this CSP slice.',
  'An enforcing `Content-Security-Policy` header remains `NO-GO`',
  'Approve non-production CSP report-only runtime implementation for Vinea.',
  'Do not add an enforcing Content-Security-Policy header',
  'production CSP',
  'enforcing CSP',
  'public trust-center publication',
]

const BASELINE_BOUNDARIES = [
  'SECURITY HEADERS BASELINE IMPLEMENTED; CSP REMAINS SEPARATE QA',
  'This document records the conservative browser security headers now configured in `next.config.ts`.',
  '`Content-Security-Policy` is not added in this slice.',
  'CSP should be designed and tested separately',
  'a report-only CSP proposal first',
  'provider allowlist review',
  'rollback instructions',
  'The test also confirms CSP is intentionally absent until a separate QA pass is approved.',
]

const PREFLIGHT_BOUNDARIES = [
  'PRODUCTION_CSP_REPORT_ONLY_RUNTIME_PREFLIGHT_VERSION',
  'validateFutureProductionCspReportOnlyRuntimeSource',
  'disabled_by_default_gate',
  'non_production_scope_gate',
  'report_only_header_gate',
  'provider_allowlist_gate',
  'report_redaction_gate',
  'smoke_evidence_gate',
  'staffSignInVerified',
  'publicIntakeSmokeVerified',
  'familyPortalSmokeVerified',
  'googleOauthCallbackSmokeVerified',
  'documentUiSmokeVerified',
  'certificateViewSmokeVerified',
  'rollback_noop_gate',
  'customer_trust_boundary_gate',
  'Content-Security-Policy-Report-Only',
  'enforcingCspAllowed: false',
  'publicTrustClaimAllowed: false',
  'enforcingCspApproved: false',
  'FORBIDDEN_RUNTIME_MARKERS',
  'headers.set("Content-Security-Policy"',
  'createSignedUrl(',
  'rawPrompt',
  'fullViolationReport',
]

const TEST_BOUNDARIES = [
  {
    path: 'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
    expected: [
      'keeps CSP report-only behind explicit non-production approval',
      'requires owners, smoke gates, redaction, and rollback boundaries',
      'forbids secrets, production access, and sensitive runtime behavior',
    ],
  },
  {
    path: 'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
    expected: [
      'accepts future report-only source only when safety gates appear before report collection',
      'rejects enforcing CSP, public claims, secrets, and sensitive payload markers',
      'fails when allowlist, smoke evidence, rollback, or customer boundaries are missing',
    ],
  },
  {
    path: 'lib/server/nextSecurityHeadersConfig.test.ts',
    expected: [
      'includes the approved baseline without adding CSP before a separate QA pass',
    ],
  },
] as const

const SECRET_LIKE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
]

function readRepoFile(repoRoot: string, relativePath: string) {
  return readFileSync(join(repoRoot, ...relativePath.split('/')), 'utf8')
}

function repoPathExists(repoRoot: string, relativePath: string) {
  return existsSync(join(repoRoot, ...relativePath.split('/')))
}

function includesAll(
  source: string,
  expected: readonly string[],
  code: ProductionCspReportOnlyEvidencePackageConsistencyFinding['code'],
  findings: ProductionCspReportOnlyEvidencePackageConsistencyFinding[],
  path: string,
) {
  let count = 0

  for (const item of expected) {
    if (source.includes(item)) {
      count += 1
    } else {
      findings.push({
        code,
        path,
        message: `Missing required CSP report-only evidence package text in ${path}: ${item}`,
      })
    }
  }

  return count
}

function findSecretLikeValues(path: string, contents: string) {
  return SECRET_LIKE_PATTERNS.flatMap((pattern) => {
    if (!pattern.test(contents)) {
      return []
    }

    return [
      {
        code: 'UNSAFE_SECRET_LIKE_VALUE' as const,
        path,
        message: `Found a secret-like value in ${path}; replace it with a non-secret label before CSP approval review.`,
      },
    ]
  })
}

export function checkProductionCspReportOnlyEvidencePackageConsistency(
  repoRoot = process.cwd(),
): ProductionCspReportOnlyEvidencePackageConsistencyReport {
  const findings: ProductionCspReportOnlyEvidencePackageConsistencyFinding[] = []
  let existingArtifactCount = 0

  for (const artifact of PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS) {
    if (repoPathExists(repoRoot, artifact.path)) {
      existingArtifactCount += 1
      findings.push(
        ...findSecretLikeValues(
          artifact.path,
          readRepoFile(repoRoot, artifact.path),
        ),
      )
    } else {
      findings.push({
        code: 'MISSING_FILE',
        path: artifact.path,
        message: `CSP report-only evidence package artifact does not exist: ${artifact.path}.`,
      })
    }
  }

  const packetBoundaryCount = repoPathExists(repoRoot, APPROVAL_PACKET_PATH)
    ? includesAll(
        readRepoFile(repoRoot, APPROVAL_PACKET_PATH),
        APPROVAL_PACKET_BOUNDARIES,
        'MISSING_PACKET_BOUNDARY',
        findings,
        APPROVAL_PACKET_PATH,
      )
    : 0

  const baselinePath = 'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md'
  const baselineBoundaryCount = repoPathExists(repoRoot, baselinePath)
    ? includesAll(
        readRepoFile(repoRoot, baselinePath),
        BASELINE_BOUNDARIES,
        'MISSING_BASELINE_BOUNDARY',
        findings,
        baselinePath,
      )
    : 0

  const preflightPath = 'lib/server/productionCspReportOnlyRuntimePreflight.ts'
  const preflightBoundaryCount = repoPathExists(repoRoot, preflightPath)
    ? includesAll(
        readRepoFile(repoRoot, preflightPath),
        PREFLIGHT_BOUNDARIES,
        'MISSING_PREFLIGHT_BOUNDARY',
        findings,
        preflightPath,
      )
    : 0

  const testBoundaryCount = TEST_BOUNDARIES.reduce((count, boundary) => {
    if (!repoPathExists(repoRoot, boundary.path)) {
      return count
    }

    return (
      count +
      includesAll(
        readRepoFile(repoRoot, boundary.path),
        boundary.expected,
        'MISSING_TEST_BOUNDARY',
        findings,
        boundary.path,
      )
    )
  }, 0)

  return {
    schemaVersion: 1,
    decision:
      findings.length === 0
        ? 'READY_FOR_RUNTIME_APPROVAL_REVIEW'
        : 'NEEDS_ATTENTION',
    reportOnlyRuntimeApproved: false,
    productionCspApproved: false,
    enforcingCspApproved: false,
    publicTrustClaimsApproved: false,
    approvalPacketPath: APPROVAL_PACKET_PATH,
    requiredArtifactCount:
      PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_ARTIFACTS.filter(
        (artifact) => artifact.requiredBeforeRuntimeApproval,
      ).length,
    existingArtifactCount,
    packetBoundaryCount,
    baselineBoundaryCount,
    preflightBoundaryCount,
    testBoundaryCount,
    findings,
  }
}
