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
    expect(source).toContain("import { useEffect, useRef, useState } from 'react'")
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

  it('reuses one delivery attempt only for an unchanged reviewed payload', () => {
    expect(source).toContain('const deliveryAttemptRef = useRef<{')
    expect(source).toContain('const reviewedSubmission = {')
    expect(source).toContain('const fingerprint = JSON.stringify(reviewedSubmission)')
    expect(source).toContain('deliveryAttemptRef.current?.fingerprint !== fingerprint')
    expect(source).toContain('id: crypto.randomUUID()')
    expect(source).toContain('const deliveryAttemptId = deliveryAttemptRef.current.id')
    expect(source).toContain('...reviewedSubmission')
    expect(source).toContain('deliveryAttemptId,')
    expect(source).toContain('deliveryAttemptRef.current = null')
    expect(source.indexOf('const fingerprint =')).toBeLessThan(
      source.indexOf("fetch('/api/demo-request'"),
    )
  })

  it('freezes every reviewed field while submission is unresolved', () => {
    for (const id of [
      'demo-name',
      'demo-parish',
      'demo-email',
      'demo-role',
      'demo-message',
    ]) {
      expect(controlById(id)).toContain('disabled={loading}')
    }
  })
})
