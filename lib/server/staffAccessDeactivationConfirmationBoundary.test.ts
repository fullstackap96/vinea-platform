import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

describe('Staff Access deactivation confirmation boundary', () => {
  it('requires the shared accessible dialog before deactivation', () => {
    expect(source).toContain("import { VineaConfirmDialog }")
    expect(source).toContain('setPendingStaffDeactivation(row)')
    expect(source).toContain('open={pendingStaffDeactivation !== null}')
    expect(source).toContain('title="Deactivate this staff account?"')
    expect(source).toContain('confirmLabel="Deactivate access"')
    expect(source).not.toContain(
      'onClick={() => void updateStaffAccess(row, { active: !row.active })}',
    )
  })

  it('keeps cancellation side-effect free and deactivates only after confirmation', () => {
    const start = source.indexOf('function confirmStaffDeactivation()')
    const end = source.indexOf('async function sendDailyBriefNow()', start)
    const block = source.slice(start, end)

    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    expect(block).toContain('setPendingStaffDeactivation(null)')
    expect(block).toContain("void updateStaffAccess(row, { active: false })")
    expect(source).toContain('onCancel={() => setPendingStaffDeactivation(null)}')
  })

  it('keeps reactivation immediate and explains retained history', () => {
    expect(source).toContain("void updateStaffAccess(row, { active: true })")
    expect(source).toContain('Existing request history and audit records remain available.')
    expect(source).toContain('You can reactivate this account later.')
  })
})
