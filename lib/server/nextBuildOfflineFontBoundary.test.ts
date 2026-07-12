import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Next build offline font boundary', () => {
  it('keeps the root layout free of build-time remote font fetches', () => {
    const layout = readRepoFile('app/layout.tsx')
    const globals = readRepoFile('app/globals.css')

    expect(layout).not.toContain('next/font/google')
    expect(layout).not.toContain('Geist')
    expect(layout).toContain('className="h-full antialiased"')

    expect(globals).toContain('--font-geist-sans:')
    expect(globals).toContain('--font-geist-mono:')
    expect(globals).toContain('ui-sans-serif, system-ui')
    expect(globals).toContain('"SFMono-Regular", Consolas')
  })
})
