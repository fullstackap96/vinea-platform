import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const scriptPath = join(
  root,
  'scripts',
  'prepare-release-candidate-commit-scope.mjs',
)

function runScope() {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: 'utf8',
  })

  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout) as {
    decision: string
    rawChangedPathCount: number
    changedPathCount: number
    duplicateChangedPathEntryCount: number
    candidatePathCount: number
    deletedCandidatePathCount: number
    excludedPathCount: number
    exclusionReasonCounts: Record<string, number>
    includesSalesDocs: boolean
    includesCsv: boolean
    includesGeneratedOutput: boolean
    includesTemporaryArtifacts: boolean
    includesEnvironmentSecrets: boolean
    printsPathList: boolean
    mutatesGitIndex: boolean
    createsCommit: boolean
    productionApproved: boolean
  }
}

describe('release candidate commit scope', () => {
  it('builds a substantial review-only candidate without touching Git', () => {
    const scope = runScope()

    expect(scope.decision).toBe('RELEASE_CANDIDATE_COMMIT_SCOPE_READY_FOR_REVIEW')
    expect(scope.rawChangedPathCount).toBeGreaterThanOrEqual(scope.changedPathCount)
    expect(scope.duplicateChangedPathEntryCount).toBe(
      scope.rawChangedPathCount - scope.changedPathCount,
    )
    expect(scope.changedPathCount).toBeGreaterThan(100)
    expect(scope.candidatePathCount).toBeGreaterThan(100)
    expect(scope.candidatePathCount).toBeLessThan(scope.changedPathCount)
    expect(scope.deletedCandidatePathCount).toBeGreaterThanOrEqual(0)
    expect(scope.excludedPathCount).toBeGreaterThan(0)
    expect(scope.mutatesGitIndex).toBe(false)
    expect(scope.createsCommit).toBe(false)
  })

  it('deduplicates Git path listings before defining the candidate set', () => {
    const source = readFileSync(scriptPath, 'utf8')

    expect(source).toContain('const changedPaths = [...new Set(listedChangedPaths)]')
    expect(source).toContain("'--no-renames'")
    expect(source).toContain("'HEAD'")
    expect(source).toContain('const untrackedPaths = listedPaths')
  })

  it('excludes private, sales, generated, binary, and temporary surfaces', () => {
    const scope = runScope()

    expect(scope.includesSalesDocs).toBe(false)
    expect(scope.includesCsv).toBe(false)
    expect(scope.includesGeneratedOutput).toBe(false)
    expect(scope.includesTemporaryArtifacts).toBe(false)
    expect(scope.includesEnvironmentSecrets).toBe(false)
    expect(scope.printsPathList).toBe(false)
    expect(scope.productionApproved).toBe(false)
    expect(scope.exclusionReasonCounts['forbidden-prefix']).toBeGreaterThan(0)
  })

  it('keeps the scope policy explicit in source', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "'docs/sales/'",
      "'output/'",
      "'tmp/'",
      "'.csv'",
      "'.pdf'",
      "'.log'",
      "'.env.example'",
      "['.json', '.md', '.sql']",
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain('git add')
    expect(source).not.toContain('git commit')
  })

  it('binds the dry-run counts and exclusions into the review packet', () => {
    const scope = runScope()
    const evidence = readFileSync(
      join(root, 'docs', 'RELEASE_CANDIDATE_COMMIT_SCOPE_REVIEW_20260711.md'),
      'utf8',
    )

    expect(evidence).toContain(`Unique changed paths reviewed: \`${scope.changedPathCount}\``)
    expect(evidence).toContain(
      `Duplicate Git path entries removed: \`${scope.duplicateChangedPathEntryCount}\``,
    )
    expect(evidence).toContain(`Commit candidates: \`${scope.candidatePathCount}\``)
    expect(evidence).toContain(`Intentional deletion candidates: \`${scope.deletedCandidatePathCount}\``)
    expect(evidence).toContain(`Excluded paths: \`${scope.excludedPathCount}\``)
    expect(evidence).toContain('Sales and prospect material included: `NO`')
    expect(evidence).toContain('Git index mutated: `NO`')
  })
})
