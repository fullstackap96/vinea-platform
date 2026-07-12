import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string): string {
  return readFileSync(join(root, path), 'utf8')
}

describe('Vinea documentation and operations index', () => {
  const indexPath = 'docs/VINEA_DOCUMENTATION_OPERATIONS_INDEX.md'
  const index = read(indexPath)

  it('keeps the operator entry points present and linked', () => {
    for (const path of [
      'docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md',
      'docs/VINEA_ROADMAP.md',
      'docs/VINEA_BUILD_STATUS.md',
      'docs/VINEA_REPO_AUDIT.md',
      'CODEX_AUTONOMOUS_INSTRUCTIONS.md',
      'docs/autonomous-os/RUN_LOOP.md',
      'docs/autonomous-os/TASK_SELECTION_SCORECARD.md',
      'docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md',
      'docs/PRODUCTION_SENSITIVE_GATE_BOUNDARY_INDEX_20260706.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(existsSync(join(root, path))).toBe(true)
      expect(index).toContain(path.replace(/^docs\//, ''))
    }
  })

  it('defines source authority and evidence status boundaries', () => {
    for (const marker of [
      '## Source Authority',
      '## VAOS Operator Path',
      '## Production And Security Gates',
      '## QA And Evidence Navigation',
      '## Documentation Maintenance',
      'passing local checks is not approval',
      'public claims remain `NO-GO`',
      'Documentation, local tests, lint, and builds do not authorize production access or action',
    ]) {
      expect(index).toContain(marker)
    }
  })

  it('is visible from the repository and company-manual entry points', () => {
    expect(read('README.md')).toContain(indexPath)
    expect(read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')).toContain(indexPath)
    expect(read('CODEX_AUTONOMOUS_INSTRUCTIONS.md')).toContain(indexPath)
    expect(read('docs/autonomous-os/RUN_LOOP.md')).toContain(indexPath)
  })
})
