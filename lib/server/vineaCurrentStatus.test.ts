import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const currentStatusPath = resolve(repoRoot, 'docs/VINEA_CURRENT_STATUS_20260807.md')
const currentStatus = readFileSync(currentStatusPath, 'utf8')

describe('Vinea current status register', () => {
  it('binds merged main, pull request, CI, Preview, and rollout identities', () => {
    expect(currentStatus).toContain('7c332bcae03347bf7b836adc2a697a41703484a6')
    expect(currentStatus).toContain('af631ad17fe557ace020489ad745b93e6d2af357')
    expect(currentStatus).toContain('06e1a0557297665a69b9171dfb137565597d65bf')
    expect(currentStatus).toContain('GitHub PR `#15`')
    expect(currentStatus).toContain('31885701023')
    expect(currentStatus).toContain('dpl_FdvCXMxu6iMCxjo2N3zcJnhQ9ewX')
    expect(currentStatus).toContain('dpl_95SD3gCpqr3RSDiK8YesebMQyPQu')
    expect(currentStatus).toContain('dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW')
    expect(currentStatus).toContain('public production domains remain assigned')
  })

  it('keeps the launch decision and production-sensitive boundaries explicit', () => {
    expect(currentStatus).toContain('Engineering completion estimate: `99.8%`')
    expect(currentStatus).toContain('Production rollout readiness estimate: `87.5%`')
    expect(currentStatus).toContain('Overall Vinea readiness estimate: `94%`')
    expect(currentStatus).toContain('Launch decision: `YELLOW`')
    expect(currentStatus).toContain('Production deployment')
    expect(currentStatus).toContain('production migrations')
    expect(currentStatus).toMatch(/operational\s+RLS changes/)
    expect(currentStatus).toContain('remain separately gated')
  })

  it('records the closed dependency, disposable-validation, and read-only reconciliation P0s', () => {
    expect(currentStatus).toContain('dependency P0 moved Next.js')
    expect(currentStatus).toContain('zero known vulnerabilities')
    expect(currentStatus).toContain(
      'guarded disposable function-privilege validation',
    )
    expect(currentStatus).toContain('passed for all 17 reviewed functions')
    expect(currentStatus).toContain(
      'read-only shared-QA migration/catalog reconciliation',
    )
    expect(currentStatus).toContain('Do not replay the migrations')
    expect(currentStatus).toContain('prepared hash-pinned shared-QA migration-history repair')
    expect(currentStatus).toContain('Remaining approval-gated P0s')
    expect(currentStatus).toContain('fail-closed production rollout for current')
    expect(currentStatus).toContain('do not approve alias promotion')
  })

  it.each([
    'docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md',
    'docs/VINEA_ROADMAP.md',
    'docs/VINEA_BUILD_STATUS.md',
    'docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md',
    'docs/PARISH_PRODUCTION_READINESS.md',
    'README.md',
  ])('is linked from %s', (path) => {
    const source = readFileSync(resolve(repoRoot, path), 'utf8')
    expect(source).toContain('VINEA_CURRENT_STATUS_20260807.md')
  })
})
