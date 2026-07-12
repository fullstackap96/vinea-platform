import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Vinea CI workflow', () => {
  it('runs the production-readiness checks on pull requests and protected pushes', () => {
    const workflow = readRepoFile('.github/workflows/ci.yml')

    expect(workflow).toContain('pull_request:')
    expect(workflow).toContain('push:')
    expect(workflow).toContain(
      'uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4',
    )
    expect(workflow).toContain(
      'uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4',
    )
    expect(workflow).toContain("node-version: '24'")
    expect(workflow).toContain('run: npm run check:repository-secrets')
    expect(workflow).toContain('run: npm ci')
    expect(workflow).toContain('run: npm run check:dependency-security')
    expect(workflow).toContain('run: npm test')
    expect(workflow).toContain('run: npm run typecheck')
    expect(workflow).toContain('run: npm run typecheck:all')
    expect(workflow).toContain('run: npm run check:release-env')
    expect(workflow).toContain('run: npm run check:rls-production-evidence')
    expect(workflow).toContain('run: npm run check:production-monitoring-evidence')
    expect(workflow).toContain('run: npm run check:production-gates')
    expect(workflow).toContain('run: npm run check:csp-report-only')
    expect(workflow).toContain('run: npm run check:trust-center-claims')
    expect(workflow).toContain('run: npm run check:release-handoff')
    expect(workflow).toContain('run: npm run check:release-local-evidence')
    expect(workflow).toContain('run: npm run lint')
    expect(workflow).toContain('run: npm run build')

    expect(
      workflow.indexOf('run: npm run check:repository-secrets'),
    ).toBeLessThan(workflow.indexOf('run: npm ci'))
    expect(workflow.indexOf('run: npm ci')).toBeLessThan(
      workflow.indexOf('run: npm run check:dependency-security'),
    )
    expect(
      workflow.indexOf('run: npm run check:dependency-security'),
    ).toBeLessThan(workflow.indexOf('run: npm test'))

    expect(workflow.indexOf('run: npm run typecheck:all')).toBeLessThan(
      workflow.indexOf('run: npm run check:release-env'),
    )
    expect(workflow.indexOf('run: npm run check:release-env')).toBeLessThan(
      workflow.indexOf('run: npm run check:rls-production-evidence'),
    )
    expect(
      workflow.indexOf('run: npm run check:rls-production-evidence'),
    ).toBeLessThan(
      workflow.indexOf('run: npm run check:production-monitoring-evidence'),
    )
    expect(
      workflow.indexOf('run: npm run check:production-monitoring-evidence'),
    ).toBeLessThan(
      workflow.indexOf('run: npm run check:production-gates'),
    )
    expect(workflow.indexOf('run: npm run check:production-gates')).toBeLessThan(
      workflow.indexOf('run: npm run check:csp-report-only'),
    )
    expect(workflow.indexOf('run: npm run check:csp-report-only')).toBeLessThan(
      workflow.indexOf('run: npm run check:trust-center-claims'),
    )
    expect(
      workflow.indexOf('run: npm run check:trust-center-claims'),
    ).toBeLessThan(
      workflow.indexOf('run: npm run check:release-handoff'),
    )
    expect(workflow.indexOf('run: npm run check:release-handoff')).toBeLessThan(
      workflow.indexOf('run: npm run check:release-local-evidence'),
    )
    expect(
      workflow.indexOf('run: npm run check:release-local-evidence'),
    ).toBeLessThan(
      workflow.indexOf('run: npm run lint'),
    )

    const packageJson = readRepoFile('package.json')
    expect(packageJson).toContain(
      '"typecheck": "tsc --project tsconfig.typecheck.json --noEmit"',
    )
    expect(packageJson).toContain('"typecheck:all": "tsc --noEmit"')
    expect(packageJson).toContain(
      '"check:repository-secrets": "node scripts/check-repository-secrets.mjs"',
    )
    expect(packageJson).toContain(
      '"check:dependency-security": "npm audit --audit-level=high"',
    )
    expect(packageJson).toContain(
      '"check:release-env": "node scripts/check-release-readiness-env.mjs"',
    )
    expect(packageJson).toContain(
      '"check:rls-production-evidence": "node scripts/check-rls-production-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:production-monitoring-evidence": "node scripts/check-production-monitoring-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:production-gates": "node scripts/check-production-gates.mjs"',
    )
    expect(packageJson).toContain(
      '"check:csp-report-only": "node scripts/check-csp-report-only-evidence.mjs"',
    )
    expect(packageJson).toContain(
      '"check:trust-center-claims": "node scripts/check-trust-center-claims.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-handoff": "node scripts/check-release-readiness-handoff.mjs"',
    )
    expect(packageJson).toContain(
      '"check:release-local-evidence": "node scripts/check-release-local-evidence.mjs"',
    )

    const productionGateScript = readRepoFile('scripts/check-production-gates.mjs')
    expect(productionGateScript).toContain(
      'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md',
    )
    expect(productionGateScript).toContain(
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    )
    expect(productionGateScript).toContain(
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
    )

    const typecheckConfig = readRepoFile('tsconfig.typecheck.json')
    expect(typecheckConfig).toContain('"extends": "./tsconfig.json"')
    expect(typecheckConfig).toContain('"**/*.test.ts"')
  })

  it('keeps CI read-only and non-deploying', () => {
    const workflow = readRepoFile('.github/workflows/ci.yml')

    expect(workflow).toContain('permissions:')
    expect(workflow).toContain('contents: read')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toContain('id-token: write')
    expect(workflow).not.toContain('environment: production')
    expect(workflow).not.toMatch(/\bvercel\s+--prod\b/i)
    expect(workflow).not.toMatch(/\bsupabase\s+(db\s+push|migration\s+up)\b/i)
    expect(workflow).not.toMatch(/\bprisma\s+(migrate\s+deploy|db\s+push)\b/i)
    expect(workflow).not.toContain('SHARED_QA_SUPABASE_DB_URL')
    expect(workflow).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(workflow).not.toContain('OPENAI_API_KEY')
  })

  it('documents the workflow as a production-readiness guard, not a production release', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const ssot = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('CI Production-Readiness Workflow Added')
    expect(buildStatus).toContain('CI Release Environment Guard Added')
    expect(buildStatus).toContain('Release Readiness Handoff Consistency Guard Added')
    expect(buildStatus).toContain('CI Completed Release Evidence Guard')
    expect(roadmap).toContain('CI production-readiness workflow')
    expect(roadmap).toContain('CI release environment guard')
    expect(roadmap).toContain('release-readiness handoff consistency guard')
    expect(roadmap).toContain('CI now runs `npm run check:release-local-evidence`')
    expect(ssot).toContain('CI production-readiness workflow')
    expect(ssot).toContain('CI release environment guard')
    expect(ssot).toContain('release-readiness handoff consistency guard')
    expect(ssot).toContain('the completed local release evidence checker')
    expect(buildStatus).toContain('does not deploy')
    expect(buildStatus).toContain('enable production flags')
  })
})
