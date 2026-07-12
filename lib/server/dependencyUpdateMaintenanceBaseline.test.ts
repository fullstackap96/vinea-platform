import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('dependency update maintenance baseline', () => {
  const config = readRepoFile('.github/dependabot.yml')
  const doc = readRepoFile(
    'docs/DEPENDENCY_UPDATE_MAINTENANCE_BASELINE_20260709.md',
  )

  it('checks npm and immutable GitHub Action references on a bounded weekly cadence', () => {
    expect(config).toMatch(/^version: 2$/m)
    expect(config).toContain('package-ecosystem: "npm"')
    expect(config).toContain('package-ecosystem: "github-actions"')
    expect(config.match(/directory: "\/"/g)).toHaveLength(2)
    expect(config.match(/interval: "weekly"/g)).toHaveLength(2)
    expect(config).toContain('open-pull-requests-limit: 5')
    expect(config).toContain('open-pull-requests-limit: 2')
    expect(config).toContain('production-minor-and-patch:')
    expect(config).toContain('development-minor-and-patch:')
    expect(config).toContain('versioning-strategy: "increase-if-necessary"')
  })

  it('does not configure automatic merging, private registries, credentials, or deployment behavior', () => {
    expect(config).not.toMatch(/auto-?merge/i)
    expect(config).not.toMatch(/^registries:/m)
    expect(config).not.toMatch(/password|token|secret|username/i)
    expect(config).not.toMatch(/target-branch|assignees|reviewers/i)
    expect(config).not.toMatch(/vercel|deploy|supabase|migration/i)

    for (const boundary of [
      'automatic merge configured: `NO`',
      'deployment capability added: `NO`',
      'private registry credentials configured: `NO`',
      'production flags added or enabled: `NO`',
      'migrations or operational RLS changes included: `NO`',
      'production-sensitive features approved: `NO`',
      'public trust claims approved: `NO`',
    ]) {
      expect(doc).toContain(boundary)
    }
  })

  it('keeps every proposed update behind CI and human review', () => {
    expect(doc).toContain('Dependabot may propose a pull request.')
    expect(doc).toContain('It may not merge, deploy, apply migrations')
    expect(doc).toContain('pass the existing read-only CI workflow')
    expect(doc).toContain('preserve full-commit GitHub Action pins')
    expect(doc).toContain('receive human review')
  })
})
