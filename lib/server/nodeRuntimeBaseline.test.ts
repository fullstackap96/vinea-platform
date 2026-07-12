import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Node runtime baseline', () => {
  it('aligns package engines, local version guidance, and CI on Node 24', () => {
    const packageJson = JSON.parse(readRepoFile('package.json')) as {
      engines?: { node?: string }
    }
    const workflow = readRepoFile('.github/workflows/ci.yml')

    expect(packageJson.engines?.node).toBe('>=24.0.0 <25')
    expect(readRepoFile('.nvmrc').trim()).toBe('24')
    expect(workflow).toContain("node-version: '24'")
    expect(workflow).not.toContain("node-version: '20'")
  })

  it('documents the support reason and production-safe boundary', () => {
    const doc = readRepoFile('docs/NODE_RUNTIME_BASELINE_20260709.md')

    expect(doc).toContain(
      'SUPPORTED NODE LTS BASELINE IMPLEMENTED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO',
    )
    expect(doc).toContain('Node.js 20 as end-of-life')
    expect(doc).toContain('Node.js 24 as LTS')
    expect(doc).toContain('node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md')
    expect(doc).toContain('does not deploy code')
    expect(doc).toContain('approve public trust claims')
  })
})
