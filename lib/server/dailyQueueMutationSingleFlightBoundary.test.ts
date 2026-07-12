import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const communications = read(
  'app/dashboard/communications/DashboardCommunicationsPageClient.tsx',
)
const intake = read('app/dashboard/intake/DashboardIntakePageClient.tsx')

function handler(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('daily queue mutation single-flight boundary', () => {
  it('shares one immediate lock across Communication Center writes', () => {
    expect(communications).toContain('const mutationInFlightRef = useRef(false)')

    for (const [start, end, requestMarker] of [
      ['async function saveTouchpoint', 'async function saveFollowUp', 'logCommunicationTouchpoint'],
      ['async function saveFollowUp', '\n  return (', 'updateCommunicationFollowUp'],
    ] as const) {
      const block = handler(communications, start, end)
      expect(block).toContain(
        'if (mutationInFlightRef.current || mutationRequiresRefresh) return',
      )
      expect(block.indexOf('mutationInFlightRef.current = true')).toBeLessThan(
        block.indexOf(requestMarker),
      )
      expect(block.indexOf('finally {')).toBeLessThan(
        block.indexOf('mutationInFlightRef.current = false'),
      )
    }
  })

  it('shares one immediate lock across request and Mass intention intake triage', () => {
    expect(intake).toContain('const mutationInFlightRef = useRef(false)')

    for (const [start, end] of [
      ['async function saveRequestTriage', 'async function saveMassIntentionTriage'],
      ['async function saveMassIntentionTriage', '\n  return ('],
    ] as const) {
      const block = handler(intake, start, end)
      expect(block).toContain('if (mutationInFlightRef.current) return')
      expect(block.indexOf('mutationInFlightRef.current = true')).toBeLessThan(
        block.indexOf('postIntakeTriage('),
      )
      expect(block.indexOf('finally {')).toBeLessThan(
        block.indexOf('mutationInFlightRef.current = false'),
      )
    }
  })

  it('freezes each reviewed queue form while its API command settles', () => {
    for (const source of [communications, intake]) {
      expect(source).toContain('const mutationBusy = savingItemId !== null')
      expect(source).toContain('aria-busy={mutationBusy}')
      expect(
        source.match(/disabled=\{mutationBusy(?: \|\| mutationRequiresRefresh)?\}/g)?.length ?? 0,
      ).toBeGreaterThanOrEqual(6)
    }
  })

  it('preserves the existing authenticated request route callers', () => {
    expect(communications).toContain('/api/requests/${encodeURIComponent(requestId)}/communications')
    expect(communications).toContain("credentials: 'include'")
    expect(intake).toContain('/api/requests/${encodeURIComponent(item.sourceId)}/intake-triage')
    expect(intake).toContain(
      '/api/mass-intentions/${encodeURIComponent(item.sourceId)}/intake-triage',
    )
    expect(intake).toContain("credentials: 'include'")
  })

  it('documents the same-screen boundary without claiming durable idempotency', () => {
    const evidence = read('docs/DAILY_QUEUE_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md')
    for (const phrase of [
      'Daily Queue Mutation Single-Flight Boundary',
      'Communication Center',
      'Intake queue',
      'staff-reviewed',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
