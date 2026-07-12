import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const INTAKE_PAGES = [
  'baptism-request',
  'wedding-request',
  'funeral-request',
  'ocia-request',
  'join-parish-request',
] as const

function pageSource(page: (typeof INTAKE_PAGES)[number]): string {
  return readFileSync(join(process.cwd(), 'app', page, 'page.tsx'), 'utf8')
}

function formControls(source: string): string[] {
  return [...source.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)].map(
    ([control]) => control,
  )
}

describe('public intake form accessibility and autofill', () => {
  it.each(INTAKE_PAGES)('%s gives every data control a stable name and accessible label', (page) => {
    const controls = formControls(pageSource(page))

    expect(controls.length).toBeGreaterThan(0)
    for (const control of controls) {
      expect(control).toContain('name=')
      expect(control).toContain('aria-label=')
    }
  })

  it.each(INTAKE_PAGES)('%s uses mobile-friendly contact autofill semantics', (page) => {
    const source = pageSource(page)

    expect(source).toContain('name="email"')
    expect(source).toContain('type="email"')
    expect(source).toContain('autoComplete="email"')
    expect(source).toContain('name="phone"')
    expect(source).toContain('type="tel"')
    expect(source).toContain('inputMode="tel"')
    expect(source).toContain('autoComplete="tel"')
  })

  it.each(INTAKE_PAGES)('%s announces busy, failure, and success states consistently', (page) => {
    const source = pageSource(page)

    expect(source).toContain('aria-busy={loading}')
    expect(source).toContain('aria-label=')
    expect(source).toContain("role={statusTone === 'success' ? 'status' : 'alert'}")
    expect(source).toContain(
      "aria-live={statusTone === 'success' ? 'polite' : 'assertive'}",
    )
  })

  it('uses precise person and household autofill tokens without autofilling pastoral fields', () => {
    expect(pageSource('baptism-request')).toContain('autoComplete="name"')
    expect(pageSource('wedding-request')).toContain('autoComplete="name"')
    expect(pageSource('funeral-request')).toContain('autoComplete="name"')
    expect(pageSource('ocia-request')).toContain('autoComplete="name"')

    const joinSource = pageSource('join-parish-request')
    expect(joinSource).toContain('autoComplete="given-name"')
    expect(joinSource).toContain('autoComplete="family-name"')
    expect(joinSource).toContain('autoComplete="street-address"')

    for (const page of INTAKE_PAGES) {
      const source = pageSource(page)
      for (const name of ['notes', 'preferredDates', 'ceremonyNotes', 'availability']) {
        if (!source.includes(`name="${name}"`)) continue
        const control = formControls(source).find((candidate) =>
          candidate.includes(`name="${name}"`),
        )
        expect(control).toContain('autoComplete="off"')
      }
    }
  })
})
