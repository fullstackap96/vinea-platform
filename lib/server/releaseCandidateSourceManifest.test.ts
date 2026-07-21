import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const scriptPath = join(root, 'scripts', 'build-release-candidate-source-manifest.mjs')

type Manifest = {
  schemaVersion: number
  decision: string
  sourceMode: 'working-tree' | 'tracked-head'
  baseCommit: string
  aggregateSha256: string
  sourceFileCount: number
  trackedFileCount: number
  untrackedFileCount: number
  worktreeDirty: boolean
  scope: string
  includesEnvironmentFiles: boolean
  printsFilePaths: boolean
  printsFileContents: boolean
  printsSecretValues: boolean
  productionApproved: boolean
}

function runManifest(args: string[] = []): Manifest {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    encoding: 'utf8',
  })

  expect(result.status, result.stderr).toBe(0)
  return JSON.parse(result.stdout) as Manifest
}

describe('release candidate source manifest', () => {
  it('produces a deterministic aggregate over the current release source surface', () => {
    const first = runManifest()
    const second = runManifest()

    expect(first).toEqual(second)
    expect(first.decision).toBe('RELEASE_CANDIDATE_SOURCE_MANIFEST_READY')
    expect(first.sourceMode).toBe('working-tree')
    expect(first.aggregateSha256).toMatch(/^[A-F0-9]{64}$/)
    expect(first.baseCommit).toMatch(/^[a-f0-9]{40}$/)
    expect(first.sourceFileCount).toBeGreaterThan(100)
    expect(first.trackedFileCount + first.untrackedFileCount).toBe(
      first.sourceFileCount,
    )
  })

  it('can bind immutable committed HEAD without untracked workspace source', () => {
    const manifest = runManifest(['--tracked-head'])

    expect(manifest.decision).toBe('RELEASE_CANDIDATE_SOURCE_MANIFEST_READY')
    expect(manifest.sourceMode).toBe('tracked-head')
    expect(manifest.aggregateSha256).toMatch(/^[A-F0-9]{64}$/)
    expect(manifest.trackedFileCount).toBe(manifest.sourceFileCount)
    expect(manifest.untrackedFileCount).toBe(0)
  })

  it('rejects unknown manifest modes without producing a manifest', () => {
    const result = spawnSync(process.execPath, [scriptPath, '--unknown-mode'], {
      cwd: root,
      encoding: 'utf8',
    })

    expect(result.status).toBe(1)
    expect(result.stdout).toBe('')
    expect(result.stderr).toContain(
      'Usage: node scripts/build-release-candidate-source-manifest.mjs [--tracked-head]',
    )
  })

  it('keeps environment files, paths, contents, secrets, and production approval out', () => {
    const manifest = runManifest()

    expect(manifest.scope).toBe('release-source-only')
    expect(manifest.includesEnvironmentFiles).toBe(false)
    expect(manifest.printsFilePaths).toBe(false)
    expect(manifest.printsFileContents).toBe(false)
    expect(manifest.printsSecretValues).toBe(false)
    expect(manifest.productionApproved).toBe(false)
  })

  it('keeps the source allowlist explicit and excludes environment-file patterns', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "'.github/workflows/'",
      "'app/'",
      "'lib/'",
      "'public/'",
      "'scripts/'",
      "'supabase/'",
      "'package-lock.json'",
      "'proxy.ts'",
      "'vitest.config.ts'",
      "'.env.example'",
      "'.nvmrc'",
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain("'.env'")
    expect(source).not.toContain("'.env.local'")
    expect(source).toContain('function canonicalSourceBytes(path, bytes)')
    expect(source).toContain("replaceAll('\\r\\n', '\\n')")
    expect(source).toContain('binaryExtensions.has(extname(path).toLowerCase())')
    expect(source).toContain('const gitOutputMaxBufferBytes = 64 * 1024 * 1024')
    expect(source).toContain("manifestArgs[0] === '--tracked-head'")
    expect(source).toContain("spawnSync('git', ['cat-file', '--batch']")
    expect(source).toContain('maxBuffer: gitOutputMaxBufferBytes')
  })

  it('binds the immutable tracked-head aggregate into the human-review evidence record', () => {
    const manifest = runManifest(['--tracked-head'])
    const evidence = readFileSync(
      join(root, 'docs', 'RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711.md'),
      'utf8',
    )

    expect(manifest.sourceMode).toBe('tracked-head')
    expect(evidence).toContain(manifest.aggregateSha256)
    expect(evidence).toContain(
      `Tracked source file count: \`${manifest.sourceFileCount}\``,
    )
    expect(evidence).toContain('Production approval granted: `NO`')
    expect(evidence).toContain('does not replace an immutable Git commit')
  })
})
