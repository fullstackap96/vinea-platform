import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('App Router not-found boundary', () => {
  const source = read('app/not-found.tsx')
  const evidence = read('docs/APP_ROUTER_NOT_FOUND_BOUNDARY_20260710.md')

  it('uses a Server Component with fixed Next.js links', () => {
    expect(source).not.toContain("'use client'")
    expect(source).toContain("import Link from 'next/link'")
    expect(source).toContain('href="/"')
    expect(source).toContain('href="/login"')
    expect(source).toContain('Return to Vinea home')
    expect(source).toContain('Staff sign in')
  })

  it('does not inspect or echo request state', () => {
    for (const forbidden of [
      'usePathname',
      'useSearchParams',
      'headers()',
      'cookies()',
      'searchParams',
      'params.',
      'window.location',
      'console.',
    ]) {
      expect(source).not.toContain(forbidden)
    }

    expect(source).toContain('aria-labelledby="vinea-not-found-heading"')
  })

  it('documents the stable convention and locked production boundaries', () => {
    expect(evidence).toContain('APP_ROUTER_NOT_FOUND_IMPLEMENTED_20260710')
    expect(evidence).toContain('root `app/not-found.tsx` Server Component')
    expect(evidence).toContain('does not enable the experimental `globalNotFound` flag')
    expect(evidence).toContain('Production-sensitive features approved by this boundary: `NO`.')
    expect(evidence).toContain('Public trust claims approved by this boundary: `NO`.')
  })
})
