import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', '_components', 'landing', 'ScheduleDemoForm.tsx'),
  'utf8',
)

function controlById(id: string): string {
  const match = source.match(new RegExp(`<(?:input|textarea)[^>]*id="${id}"[^>]*>`))
  if (!match) throw new Error(`Missing demo form control: ${id}`)
  return match[0]
}

describe('Schedule Demo form accessibility', () => {
  it('uses native required semantics and precise autofill tokens', () => {
    for (const [id, token] of [
      ['demo-name', 'name'],
      ['demo-parish', 'organization'],
      ['demo-email', 'email'],
    ] as const) {
      const control = controlById(id)
      expect(control).toContain('required')
      expect(control).toContain(`autoComplete="${token}"`)
    }

    expect(controlById('demo-email')).toContain('type="email"')
    expect(controlById('demo-role')).toContain('autoComplete="organization-title"')
    expect(controlById('demo-message')).toContain('autoComplete="off"')
  })

  it('announces form progress and distinguishes failures from success', () => {
    expect(source).toContain('aria-label="Schedule a Vinea demo"')
    expect(source).toContain('aria-busy={loading}')
    expect(source).toContain("role={statusIsError ? 'alert' : 'status'}")
    expect(source).toContain("aria-live={statusIsError ? 'assertive' : 'polite'}")
    expect(source).toContain("statusIsError ? 'text-sm text-red-700'")
  })

  it('preserves the same API payload and no-repeat-submit boundary', () => {
    expect(source).toContain("fetch('/api/demo-request'")
    expect(source).toContain("import { useRef, useState } from 'react'")
    expect(source).toContain('const submissionInFlightRef = useRef(false)')
    expect(source).toContain('if (submissionInFlightRef.current) return')
    expect(source).toContain('submissionInFlightRef.current = true')
    expect(source).toContain('submissionInFlightRef.current = false')
    expect(source.indexOf('submissionInFlightRef.current = true')).toBeLessThan(
      source.indexOf("fetch('/api/demo-request'"),
    )
    for (const field of ['name: n', 'parishName: p', 'email: em', 'roleTitle:', 'message:']) {
      expect(source).toContain(field)
    }
  })
})
