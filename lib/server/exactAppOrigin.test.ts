import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseExactAppOrigin } from '@/lib/exactAppOrigin'

describe('exact application origin', () => {
  it('returns a normalized URL only for an exact HTTP(S) origin', () => {
    expect(parseExactAppOrigin(' https://app.vineaplatform.test/ ')?.origin).toBe(
      'https://app.vineaplatform.test',
    )
    expect(parseExactAppOrigin('http://127.0.0.1:3000')?.origin).toBe(
      'http://127.0.0.1:3000',
    )
  })

  it.each([
    undefined,
    '',
    'not-a-url',
    'ftp://app.vineaplatform.test',
    'https://user:password@app.vineaplatform.test',
    'https://app.vineaplatform.test/dashboard',
    'https://app.vineaplatform.test?query=value',
    'https://app.vineaplatform.test/#fragment',
  ])('rejects an unsafe application origin: %s', (value) => {
    expect(parseExactAppOrigin(value)).toBeNull()
  })

  it('can require HTTPS for deployment contexts', () => {
    expect(
      parseExactAppOrigin('http://preview-vinea.vercel.app', { requireHttps: true }),
    ).toBeNull()
    expect(
      parseExactAppOrigin('https://preview-vinea.vercel.app', { requireHttps: true })?.origin,
    ).toBe('https://preview-vinea.vercel.app')
  })

  it('keeps root metadata on the shared non-throwing parser', () => {
    const layout = readFileSync(join(process.cwd(), 'app', 'layout.tsx'), 'utf8')

    expect(layout).toContain('parseExactAppOrigin(process.env.NEXT_PUBLIC_APP_URL')
    expect(layout).toContain('requireHttps: process.env.VERCEL === "1"')
    expect(layout).toContain('metadataBase: metadataBase ?? undefined')
    expect(layout).not.toContain('new URL(appUrl)')
  })
})
