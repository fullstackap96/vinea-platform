import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('App Router error recovery boundary', () => {
  const appError = read('app/error.tsx')
  const globalError = read('app/global-error.tsx')
  const recovery = read('app/_components/VineaErrorRecovery.tsx')
  const evidence = read('docs/APP_ROUTER_ERROR_RECOVERY_BOUNDARY_20260710.md')

  it('uses the Next.js 16 client error-boundary retry contract', () => {
    expect(appError).toContain("'use client'")
    expect(globalError).toContain("'use client'")
    expect(appError).toContain('unstable_retry={unstable_retry}')
    expect(globalError).toContain('unstable_retry={unstable_retry}')
    expect(recovery).toContain('onClick={unstable_retry}')
  })

  it('provides a complete root-layout fallback', () => {
    expect(globalError).toContain("import './globals.css'")
    expect(globalError).toContain('<html')
    expect(globalError).toContain('<head>')
    expect(globalError).toContain('<body')
    expect(globalError).toContain('<title>Vinea Platform - Something went wrong</title>')
  })

  it('offers accessible recovery without exposing exception details', () => {
    expect(recovery).toContain('role="alert"')
    expect(recovery).toContain('aria-labelledby="vinea-error-heading"')
    expect(recovery).toContain('Try again')
    expect(recovery).toContain('Return to Vinea home')
    expect(recovery).toContain("import Link from 'next/link'")
    expect(recovery).toContain('<Link')

    for (const source of [appError, globalError, recovery]) {
      expect(source).not.toContain('error.message')
      expect(source).not.toContain('error.digest')
      expect(source).not.toContain('console.error')
      expect(source).not.toContain('JSON.stringify(error)')
    }
  })

  it('documents the runtime and production-safety boundary', () => {
    expect(evidence).toContain('APP_ROUTER_ERROR_RECOVERY_IMPLEMENTED_20260710')
    expect(evidence).toContain('app/error.tsx')
    expect(evidence).toContain('app/global-error.tsx')
    expect(evidence).toContain('Next.js 16 `unstable_retry` recovery contract')
    expect(evidence).toContain('Production-sensitive features approved by this boundary: `NO`.')
    expect(evidence).toContain('Public trust claims approved by this boundary: `NO`.')
  })
})
