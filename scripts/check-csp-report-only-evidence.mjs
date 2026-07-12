import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const repoRoot = process.cwd()

const artifacts = [
  {
    id: 'approval-packet',
    path: 'docs/PRODUCTION_CSP_REPORT_ONLY_APPROVAL_PACKET_20260707.md',
    required: [
      'CSP REPORT-ONLY DESIGN READY FOR REVIEW; RUNTIME CSP NOT IMPLEMENTED',
      'An enforcing `Content-Security-Policy` header remains `NO-GO`',
      'lib/server/productionCspReportOnlyRuntimePreflight.ts',
      'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
      'This packet does not enable CSP',
      'access production',
    ],
  },
  {
    id: 'security-headers-baseline',
    path: 'docs/PRODUCTION_SECURITY_HEADERS_BASELINE_20260707.md',
    required: [
      'SECURITY HEADERS BASELINE IMPLEMENTED; CSP REMAINS SEPARATE QA',
      'CSP is intentionally absent',
      'a report-only CSP proposal first',
    ],
  },
  {
    id: 'runtime-preflight-source',
    path: 'lib/server/productionCspReportOnlyRuntimePreflight.ts',
    required: [
      'Content-Security-Policy-Report-Only',
      'Content-Security-Policy',
      'enforcingCspApproved: false',
      'publicTrustClaimAllowed: false',
      'assertNoForbiddenCspReportPayload(',
      'staffSignInVerified',
      'publicIntakeSmokeVerified',
      'familyPortalSmokeVerified',
      'googleOauthCallbackSmokeVerified',
      'documentUiSmokeVerified',
      'certificateViewSmokeVerified',
    ],
  },
  {
    id: 'runtime-preflight-test',
    path: 'lib/server/productionCspReportOnlyRuntimePreflight.test.ts',
    required: [
      'accepts future report-only source only when safety gates appear before report collection',
      'rejects enforcing CSP, public claims, secrets, and sensitive payload markers',
      'fails when allowlist, smoke evidence, rollback, or customer boundaries are missing',
    ],
  },
  {
    id: 'approval-packet-test',
    path: 'lib/server/productionCspReportOnlyApprovalPacket.test.ts',
    required: [
      'keeps CSP report-only behind explicit non-production approval',
      'requires owners, smoke gates, redaction, and rollback boundaries',
      'forbids secrets, production access, and sensitive runtime behavior',
    ],
  },
  {
    id: 'security-headers-test',
    path: 'lib/server/nextSecurityHeadersConfig.test.ts',
    required: [
      'includes the approved baseline without adding CSP before a separate QA pass',
      'Content-Security-Policy',
    ],
  },
  {
    id: 'evidence-package-helper',
    path: 'lib/server/productionCspReportOnlyEvidencePackageConsistency.ts',
    required: [
      'READY_FOR_RUNTIME_APPROVAL_REVIEW',
      'reportOnlyRuntimeApproved: false',
      'productionCspApproved: false',
      'enforcingCspApproved: false',
      'publicTrustClaimsApproved: false',
    ],
  },
  {
    id: 'evidence-package-doc',
    path: 'docs/PRODUCTION_CSP_REPORT_ONLY_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260707.md',
    required: [
      'Production CSP Report-Only Evidence Package Consistency Checker',
      'does not enable CSP',
      'does not access production',
      'does not make public trust-center claims',
      'RUNTIME CSP REMAINS NO-GO',
      'staffSignInVerified',
      'publicIntakeSmokeVerified',
      'familyPortalSmokeVerified',
      'googleOauthCallbackSmokeVerified',
      'documentUiSmokeVerified',
      'certificateViewSmokeVerified',
    ],
  },
]

const secretLikePatterns = [
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /postgresql:\/\/[^`\s<\[]+/i,
  /service[_-]?role[_-]?key\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /access[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /refresh[_-]?token\s*=\s*[A-Za-z0-9._-]{20,}/i,
  /signed[_-]?url\s*=\s*https?:\/\/[^`\s<\[]+/i,
]

function repoPath(relativePath) {
  return join(repoRoot, ...relativePath.split('/'))
}

function readRepoFile(relativePath) {
  return readFileSync(repoPath(relativePath), 'utf8')
}

function pathExists(relativePath) {
  return existsSync(repoPath(relativePath))
}

function findSecretLikeValues(path, contents) {
  return secretLikePatterns.flatMap((pattern) =>
    pattern.test(contents)
      ? [
          {
            code: 'UNSAFE_SECRET_LIKE_VALUE',
            path,
            message: `Found a secret-like value in ${path}; replace it with a non-secret label before CSP approval review.`,
          },
        ]
      : [],
  )
}

const findings = []

for (const artifact of artifacts) {
  if (!pathExists(artifact.path)) {
    findings.push({
      code: 'MISSING_FILE',
      artifactId: artifact.id,
      path: artifact.path,
      message: `Missing CSP evidence artifact: ${artifact.path}`,
    })
    continue
  }

  const contents = readRepoFile(artifact.path)

  for (const phrase of artifact.required) {
    if (!contents.includes(phrase)) {
      findings.push({
        code: 'MISSING_REQUIRED_PHRASE',
        artifactId: artifact.id,
        path: artifact.path,
        message: `Missing required CSP evidence phrase in ${artifact.path}: ${phrase}`,
      })
    }
  }

  findings.push(...findSecretLikeValues(artifact.path, contents))
}

const report = {
  schemaVersion: 1,
  decision:
    findings.length === 0
      ? 'CSP_REPORT_ONLY_EVIDENCE_READY_FOR_REVIEW'
      : 'NEEDS_ATTENTION',
  reportOnlyRuntimeApproved: false,
  productionCspApproved: false,
  enforcingCspApproved: false,
  publicTrustClaimsApproved: false,
  artifactCount: artifacts.length,
  existingArtifactCount: artifacts.filter((artifact) => pathExists(artifact.path))
    .length,
  findings,
}

console.log(JSON.stringify(report, null, 2))

if (findings.length > 0) {
  process.exitCode = 1
}
