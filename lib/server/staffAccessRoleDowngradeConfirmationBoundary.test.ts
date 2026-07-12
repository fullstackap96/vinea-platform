import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

describe('Staff Access role downgrade confirmation boundary', () => {
  it('requires confirmation only when removing administrator permissions', () => {
    expect(source).toContain("row.role === 'admin' && nextRole === 'staff'")
    expect(source).toContain('setPendingStaffRoleDowngrade(row)')
    expect(source).toContain('void updateStaffAccess(row, { role: nextRole })')
    expect(source).toContain('open={pendingStaffRoleDowngrade !== null}')
    expect(source).toContain('title="Remove administrator permissions?"')
    expect(source).toContain('confirmLabel="Change role to Staff"')
  })

  it('keeps cancellation side-effect free and downgrades only after confirmation', () => {
    const start = source.indexOf('function confirmStaffRoleDowngrade()')
    const end = source.indexOf('async function sendDailyBriefNow()', start)
    const block = source.slice(start, end)

    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    expect(block).toContain('setPendingStaffRoleDowngrade(null)')
    expect(block).toContain("void updateStaffAccess(row, { role: 'staff' })")
    expect(source).toContain('onCancel={() => setPendingStaffRoleDowngrade(null)}')
  })

  it('explains retained access and final-admin protection', () => {
    expect(source).toContain('will keep parish access')
    expect(source).toContain('will no longer be able to manage staff access or administrator settings')
    expect(source).toContain('At least one active parish administrator must remain.')
    expect(source).toContain('You can restore this role later.')
  })
})
