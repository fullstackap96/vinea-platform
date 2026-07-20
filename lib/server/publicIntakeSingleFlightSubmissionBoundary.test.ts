import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const intakeForms = [
  'app/baptism-request/page.tsx',
  'app/wedding-request/page.tsx',
  'app/funeral-request/page.tsx',
  'app/ocia-request/page.tsx',
  'app/join-parish-request/page.tsx',
] as const

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('public intake same-page single-flight submission boundary', () => {
  it.each(intakeForms)('%s locks synchronously before request creation', (path) => {
    const source = read(path)
    const handlerStart = source.indexOf('async function handleSubmit')
    const handlerEnd = source.indexOf('\n  const statusTone', handlerStart)
    const handler = source.slice(handlerStart, handlerEnd)

    expect(handlerStart).toBeGreaterThan(-1)
    expect(source).toContain("import { useRef, useState } from 'react'")
    expect(source).toContain('const submissionInFlightRef = useRef(false)')
    expect(handler).toContain('if (submissionInFlightRef.current) return')
    expect(handler).toContain('submissionInFlightRef.current = true')
    expect(handler.indexOf('submissionInFlightRef.current = true')).toBeLessThan(
      handler.indexOf('submitPublicIntake({'),
    )
    expect(handler).toContain('finishSubmission()')
  })

  it.each(intakeForms)('%s retains visible busy controls and one release helper', (path) => {
    const source = read(path)

    expect(source).toContain('aria-busy={loading}')
    expect(source).toContain('<fieldset disabled={loading}')
    expect(source).toContain('m-0 min-w-0 space-y-4 border-0 p-0')
    expect(source).toContain('disabled={loading}')
    expect(source.match(/setLoading\(false\)/g)).toHaveLength(1)
    expect(source).toContain('submissionInFlightRef.current = false')
  })

  it.each(intakeForms)('%s freezes the reviewed payload while confirmation is pending', (path) => {
    const source = read(path)
    const formStart = source.indexOf('<form')
    const formEnd = source.indexOf('</form>', formStart)
    const form = source.slice(formStart, formEnd)

    expect(formStart).toBeGreaterThanOrEqual(0)
    expect(form).toContain('<fieldset disabled={loading}')
    expect(form.indexOf('<fieldset disabled={loading}')).toBeLessThan(form.indexOf('<input'))
    expect(form.lastIndexOf('</fieldset>')).toBeGreaterThan(form.lastIndexOf('</button>'))
  })

  it('documents the exact protection and durable-idempotency boundary', () => {
    const evidence = read('docs/PUBLIC_INTAKE_SINGLE_FLIGHT_SUBMISSION_BOUNDARY_20260711.md')

    for (const phrase of [
      'Public Intake Single-Flight Submission Boundary',
      'Baptism',
      'Wedding',
      'Funeral',
      'OCIA',
      'Join Parish',
      'same-page rapid repeat',
      'not durable server idempotency',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
