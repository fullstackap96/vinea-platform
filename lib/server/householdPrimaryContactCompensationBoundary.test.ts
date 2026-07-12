import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'households', 'actions.ts'),
  'utf8'
)

function functionBlock(name: string): string {
  const start = source.indexOf(`export async function ${name}`)
  if (start < 0) throw new Error(`Missing Household action ${name}`)
  const next = source.indexOf('\nexport async function ', start + 1)
  return source.slice(start, next < 0 ? source.length : next)
}

describe('Household primary-contact compensation boundary', () => {
  it('captures the exact cleared member ids and fails on a clear error', () => {
    const start = source.indexOf('async function clearOtherPrimaryContacts(')
    const end = source.indexOf('async function restorePrimaryContact(', start)
    const clear = source.slice(start, end)

    expect(clear).toContain("const { data, error } = await query.select('id')")
    expect(clear).toContain('if (error) return { ok: false as const, error }')
    expect(clear).toContain('clearedMemberIds: (data ?? [])')
  })

  it('restores only the previously cleared scoped member and confirms persistence', () => {
    const start = source.indexOf('async function restorePrimaryContact(')
    const end = source.indexOf('async function resolveHouseholdWriteContext(', start)
    const restore = source.slice(start, end)

    expect(restore).toContain(".update({ is_primary_contact: true })")
    expect(restore).toContain(".eq('id', memberId)")
    expect(restore).toContain(".eq('household_id', householdId)")
    expect(restore).toContain(".eq('parish_id', parishId)")
    expect(restore).toContain(".select('id')")
    expect(restore).toContain('.maybeSingle()')
    expect(restore).toContain('error || !data?.id')
  })

  for (const name of ['addHouseholdMember', 'updateHouseholdMember']) {
    it(`${name} restores the prior primary after an unconfirmed member write`, () => {
      const action = functionBlock(name)
      const clearIndex = action.indexOf('await clearOtherPrimaryContacts(')
      const writeConfirmationIndex = Math.max(
        action.indexOf('!insertedMember?.id'),
        action.indexOf('!data?.id')
      )
      const restoreIndex = action.indexOf('await restorePrimaryContact(', writeConfirmationIndex)
      const successIndex = action.indexOf('return { ok: true }', restoreIndex)

      expect(clearIndex).toBeGreaterThanOrEqual(0)
      expect(writeConfirmationIndex).toBeGreaterThan(clearIndex)
      expect(restoreIndex).toBeGreaterThan(writeConfirmationIndex)
      expect(successIndex).toBeGreaterThan(restoreIndex)
    })
  }
})
