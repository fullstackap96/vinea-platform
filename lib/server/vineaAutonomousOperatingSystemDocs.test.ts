import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Vinea Autonomous Operating System docs', () => {
  const requiredDocs = [
    'CODEX_AUTONOMOUS_INSTRUCTIONS.md',
    'docs/VINEA_REPO_AUDIT.md',
    'docs/autonomous-os/OPERATING_PRINCIPLES.md',
    'docs/autonomous-os/TASK_SELECTION_SCORECARD.md',
    'docs/autonomous-os/RUN_LOOP.md',
    'docs/autonomous-os/SAFETY_GUARDRAILS.md',
    'docs/autonomous-os/BEGINNER_UPDATE_TEMPLATE.md',
    'docs/autonomous-os/ROADMAP_REVIEW_PROTOCOL.md',
    'docs/autonomous-os/QUALITY_CHECKLIST.md',
    'docs/autonomous-os/FIRST_RUN_REPORT.md',
  ]

  it('keeps the required VAOS operating manuals present', () => {
    for (const path of requiredDocs) {
      expect(readRepoFile(path)).toContain('Last updated')
    }
  })

  it('preserves task selection, review loop, and safety boundaries', () => {
    const instructions = readRepoFile('CODEX_AUTONOMOUS_INSTRUCTIONS.md')
    const scorecard = readRepoFile('docs/autonomous-os/TASK_SELECTION_SCORECARD.md')
    const runLoop = readRepoFile('docs/autonomous-os/RUN_LOOP.md')
    const guardrails = readRepoFile('docs/autonomous-os/SAFETY_GUARDRAILS.md')
    const quality = readRepoFile('docs/autonomous-os/QUALITY_CHECKLIST.md')

    expect(instructions).toContain('Think product-first, not feature-first')
    expect(instructions).toContain('Read `node_modules/next/dist/docs/` before editing Next.js-specific code')
    expect(scorecard).toContain('Parish staff value')
    expect(scorecard).toContain('Safety Gate')
    expect(runLoop).toContain('Review')
    expect(runLoop).toContain('Score And Select')
    expect(guardrails).toContain('Do not automatically')
    expect(guardrails).toContain('Weaken authentication')
    expect(guardrails).toContain('public trust-center')
    expect(quality).toContain('RLS')
    expect(quality).toContain('Documentation')
  })

  it('records first-run findings and updates the existing product docs', () => {
    const firstRun = readRepoFile('docs/autonomous-os/FIRST_RUN_REPORT.md')
    const audit = readRepoFile('docs/VINEA_REPO_AUDIT.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const readme = readRepoFile('README.md')

    expect(firstRun).toContain('Top Candidate Improvements')
    expect(firstRun).toContain('VAOS foundation')
    expect(audit).toContain('Protected Dashboard Routes')
    expect(audit).toContain('Production membership-aware operational RLS is not approved')
    expect(roadmap).toContain('Vinea Autonomous Operating System Foundation')
    expect(sourceOfTruth).toContain('Vinea Autonomous Operating System')
    expect(buildStatus).toContain('Vinea Autonomous Operating System Foundation')
    expect(readme).toContain('CODEX_AUTONOMOUS_INSTRUCTIONS.md')
  })
})
