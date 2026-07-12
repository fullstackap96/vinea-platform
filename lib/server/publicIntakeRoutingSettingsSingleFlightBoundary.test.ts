import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const settings = read('app/dashboard/settings/ParishSettingsPage.tsx')

function handler(startMarker: string, endMarker: string) {
  const start = settings.indexOf(startMarker)
  const end = settings.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return settings.slice(start, end)
}

describe('public intake routing Settings single-flight boundary', () => {
  it('defines one shared synchronous lock for the whole management surface', () => {
    expect(settings).toContain('const publicRoutingMutationInFlightRef = useRef(false)')
    expect(settings).toContain('function beginPublicRoutingMutation(): boolean')
    expect(settings).toContain('if (publicRoutingMutationInFlightRef.current) return false')
    expect(settings).toContain('publicRoutingMutationInFlightRef.current = true')
    expect(settings).toContain('function finishPublicRoutingMutation()')
    expect(settings).toContain('publicRoutingMutationInFlightRef.current = false')
  })

  it('acquires before every metadata, domain, verification, and token request', () => {
    const handlers = [
      ['async function savePublicIntakeRouting', 'async function addPublicRoutingDomain'],
      ['async function addPublicRoutingDomain', 'async function addPublicRoutingToken'],
      ['async function addPublicRoutingToken', 'async function updatePublicRoutingToken'],
      ['async function updatePublicRoutingToken', 'async function updatePublicRoutingDomain'],
      ['async function updatePublicRoutingDomain', 'async function verifyPublicRoutingDomain'],
      ['async function verifyPublicRoutingDomain', 'async function resetPublicRoutingDomainVerification'],
      ['async function resetPublicRoutingDomainVerification', 'const publicRoutingMutationBusy'],
    ] as const

    for (const [start, end] of handlers) {
      const block = handler(start, end)
      expect(block).toContain('if (!beginPublicRoutingMutation()) return')
      expect(block.indexOf('if (!beginPublicRoutingMutation()) return')).toBeLessThan(
        block.indexOf("fetch('/api/parish/public-intake-routing'"),
      )
      expect(block.indexOf('finally {')).toBeLessThan(
        block.indexOf('finishPublicRoutingMutation()'),
      )
    }
  })

  it('freezes competing controls while preserving the one-time token display', () => {
    expect(settings).toContain(
      'publicIntakeRoutingSaving || publicRoutingDomainSaving || publicRoutingTokenSaving',
    )
    expect(settings).toContain('aria-busy={publicRoutingMutationBusy}')
    expect(
      settings.match(/disabled=\{publicRoutingMutationBusy\}/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(13)

    const tokenDisplayStart = settings.indexOf('aria-label="New public intake token"')
    const tokenDisplay = settings.slice(tokenDisplayStart - 250, tokenDisplayStart + 120)
    expect(tokenDisplay).toContain('readOnly')
    expect(tokenDisplay).not.toContain('disabled={publicRoutingMutationBusy}')
  })

  it('retains the prepared-not-live runtime boundary', () => {
    expect(settings).toContain('Prepared, not live')
    expect(settings).toContain('This does not turn on live public routing yet.')
    expect(settings).toContain("credentials: 'include'")
  })

  it('documents immediate exclusion without enabling runtime routing', () => {
    const evidence = read(
      'docs/PUBLIC_INTAKE_ROUTING_SETTINGS_SINGLE_FLIGHT_BOUNDARY_20260711.md',
    )
    for (const phrase of [
      'Public Intake Routing Settings Single-Flight Boundary',
      'one-time token',
      'selected-parish',
      'Runtime public intake routing remains disabled',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
