import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const settingsPath = join(
  process.cwd(),
  'app',
  'dashboard',
  'settings',
  'ParishSettingsPage.tsx',
)

describe('Staff Access single-flight mutation boundary', () => {
  it('guards new staff additions with the same mutation lock and releases it in finally', () => {
    const source = readFileSync(settingsPath, 'utf8')
    const addStart = source.indexOf('async function addStaffAccess')
    const addEnd = source.indexOf('async function updateStaffAccess', addStart)
    const addSource = source.slice(addStart, addEnd)

    expect(addStart).toBeGreaterThan(-1)
    expect(addSource).toContain(
      'if (staffAccessMutationInFlightRef.current || staffAccessMutationRequiresRefresh) return',
    )
    expect(addSource).toContain("staffAccessMutationInFlightRef.current = 'new-staff-access'")
    expect(addSource).toContain('setStaffAccessAdding(true)')
    expect(addSource).toContain("method: 'POST'")
    expect(addSource).toContain('finally {')
    expect(addSource).toContain('staffAccessMutationInFlightRef.current = null')
    expect(addSource).toContain('setStaffAccessAdding(false)')
  })

  it('guards role and activation updates before dispatch and always releases the lock', () => {
    const source = readFileSync(settingsPath, 'utf8')
    const updateStart = source.indexOf('async function updateStaffAccess')
    const updateEnd = source.indexOf('function confirmStaffDeactivation', updateStart)
    const updateSource = source.slice(updateStart, updateEnd)

    expect(updateStart).toBeGreaterThan(-1)
    expect(updateSource).toContain(
      'if (staffAccessMutationInFlightRef.current || staffAccessMutationRequiresRefresh) return',
    )
    expect(updateSource).toContain('staffAccessMutationInFlightRef.current = row.id')
    expect(updateSource).toContain('setStaffAccessUpdatingId(row.id)')
    expect(updateSource).toContain("method: 'PATCH'")
    expect(updateSource).toContain('finally {')
    expect(updateSource).toContain('staffAccessMutationInFlightRef.current = null')
    expect(updateSource).toContain('setStaffAccessUpdatingId(null)')
  })

  it('makes the affected row visibly busy and disables competing row controls', () => {
    const source = readFileSync(settingsPath, 'utf8')

    expect(source).toContain('staffAccessUpdatingId === row.id || staffAccessMutationRequiresRefresh')
    expect(source.match(/disabled=\{staffAccessBusy\}/g)).toHaveLength(5)
    expect(source).toContain('aria-busy={staffAccessBusy}')
    expect(source).toContain("staffAccessAdding ? 'Adding...' : 'Add access'")
    expect(source).toContain("? 'Updating...'\n")
    expect(source).toContain('const staffAccessMutationInFlightRef = useRef<string | null>(null)')
  })

  it('documents unchanged staff authorization and production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'STAFF_ACCESS_SINGLE_FLIGHT_MUTATION_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Staff Access Single-Flight Mutation Boundary',
      'one Staff Access row mutation',
      'new staff additions',
      '`Updating...`',
      'existing selected-parish Staff Access API',
      'final active administrator',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
