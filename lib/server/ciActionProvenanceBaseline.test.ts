import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('CI action provenance baseline', () => {
  it('pins every CI action to an immutable full commit SHA', () => {
    const workflow = readRepoFile('.github/workflows/ci.yml')
    const actionReferences = [...workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)]
      .map((match) => match[1])

    expect(actionReferences).toEqual([
      'actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd',
      'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
    ])

    for (const reference of actionReferences) {
      expect(reference).toMatch(/^[a-z0-9_.-]+\/[a-z0-9_.-]+@[a-f0-9]{40}$/i)
      expect(reference).not.toMatch(/@(v\d+|main|master|latest)$/i)
    }
  })

  it('documents review requirements without widening CI permissions or rollout scope', () => {
    const doc = readRepoFile('docs/CI_ACTION_PROVENANCE_BASELINE_20260709.md')
    const workflow = readRepoFile('.github/workflows/ci.yml')

    expect(doc).toContain('Workflow permissions changed: `NO`')
    expect(doc).toContain('Deployment capability added: `NO`')
    expect(doc).toContain('Production credentials added: `NO`')
    expect(doc).toContain('Production-sensitive feature gates approved: `NO`')
    expect(doc).toContain('Public trust claims approved: `NO`')
    expect(workflow).toContain('permissions:')
    expect(workflow).toContain('contents: read')
    expect(workflow).not.toContain('contents: write')
    expect(workflow).not.toMatch(/\b(vercel|deploy|supabase\s+db\s+push)\b/i)
  })
})
