import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const scriptPath = join(root, 'scripts', 'build-release-candidate-source-manifest.mjs')

type Manifest = {
  schemaVersion: number
  decision: string
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

function runManifest(): Manifest {
  const result = spawnSync(process.execPath, [scriptPath], {
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
    expect(first.aggregateSha256).toMatch(/^[A-F0-9]{64}$/)
    expect(first.baseCommit).toMatch(/^[a-f0-9]{40}$/)
    expect(first.sourceFileCount).toBeGreaterThan(100)
    expect(first.trackedFileCount + first.untrackedFileCount).toBe(
      first.sourceFileCount,
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
  })

  it('binds the current aggregate into the human-review evidence record', () => {
    const manifest = runManifest()
    const evidence = readFileSync(
      join(root, 'docs', 'RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711.md'),
      'utf8',
    )

    expect(evidence).toContain(manifest.aggregateSha256)
    expect(evidence).toContain(`Source file count: \`${manifest.sourceFileCount}\``)
    expect(evidence).toContain('Production approval granted: `NO`')
    expect(evidence).toContain('does not replace an immutable Git commit')
  })
})
