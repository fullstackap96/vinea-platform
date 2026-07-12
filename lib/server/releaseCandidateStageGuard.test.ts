import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const scriptPath = join(root, 'scripts', 'stage-release-candidate-scope.mjs')

function stagedPaths() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '-z'], {
    cwd: root,
    encoding: 'utf8',
  })
  expect(result.status, result.stderr).toBe(0)
  return result.stdout
}

describe('release candidate staging guard', () => {
  it('is a no-op dry run without the execute switch', () => {
    const before = stagedPaths()
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        VINEA_RELEASE_CANDIDATE_STAGE_CONFIRM: '',
      },
    })
    const after = stagedPaths()

    expect(result.status, result.stderr).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({
      decision: 'RELEASE_CANDIDATE_STAGE_DRY_RUN_ONLY',
      confirmationAccepted: false,
      gitIndexMutated: false,
      commitCreated: false,
      productionApproved: false,
    })
    expect(after).toBe(before)
  })

  it('refuses execute mode without the exact confirmation', () => {
    const before = stagedPaths()
    const result = spawnSync(process.execPath, [scriptPath, '--execute'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        VINEA_RELEASE_CANDIDATE_STAGE_CONFIRM: 'NOT_APPROVED',
      },
    })
    const after = stagedPaths()

    expect(result.status).toBe(1)
    expect(JSON.parse(result.stderr)).toMatchObject({
      decision: 'RELEASE_CANDIDATE_STAGE_REFUSED_CONFIRMATION',
      gitIndexMutated: false,
      commitCreated: false,
      productionApproved: false,
    })
    expect(after).toBe(before)
  })

  it('imports the reviewed scope and keeps commit creation absent', () => {
    const source = readFileSync(scriptPath, 'utf8')

    expect(source).toContain("from './prepare-release-candidate-commit-scope.mjs'")
    expect(source).toContain('STAGE_REVIEWED_VINEA_RELEASE_CANDIDATE_20260711')
    expect(source).toContain("'update-index', '--add', '--remove', '-z', '--stdin'")
    expect(source).toContain('const uniqueCandidates = [...new Set(candidates)]')
    expect(source).toContain("'--no-renames'")
    expect(source).toContain('RELEASE_CANDIDATE_STAGE_REFUSED_NONEMPTY_INDEX')
    expect(source).not.toContain("['commit'")
    expect(source).not.toContain('git commit')
  })
})
