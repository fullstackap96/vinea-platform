import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

describe('Next.js proxy convention documentation', () => {
  it('keeps the Next 16 dashboard guard on proxy.ts instead of middleware.ts', () => {
    const proxyPath = join(repoRoot, 'proxy.ts')
    const middlewarePath = join(repoRoot, 'middleware.ts')
    const proxySource = readFileSync(proxyPath, 'utf8')

    expect(existsSync(proxyPath)).toBe(true)
    expect(existsSync(middlewarePath)).toBe(false)
    expect(proxySource).toContain('export async function proxy')
    expect(proxySource).toContain("matcher: ['/dashboard/:path*']")
  })

  it('keeps the AI context pointed at proxy.ts for staff dashboard auth', () => {
    const aiContext = readFileSync(join(repoRoot, 'docs', 'VINEA_AI_CONTEXT.md'), 'utf8')

    expect(aiContext).toContain('Next.js 16 `proxy.ts` protects `/dashboard/:path*`')
    expect(aiContext).toContain('- `proxy.ts`.')
    expect(aiContext).not.toContain('- `middleware.ts`.')
    expect(aiContext).not.toContain('Middleware protects `/dashboard/:path*`')
  })
})
