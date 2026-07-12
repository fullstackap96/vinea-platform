import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'DashboardLayoutClient.tsx'),
  'utf8',
)

describe('dashboard parish switch tenant-sensitive tool boundary', () => {
  it('separates the pending selector choice from confirmed active parish context', () => {
    expect(source).toContain('const [pendingParishId, setPendingParishId]')
    expect(source).toContain('const selectedParishId = pendingParishId ?? activeParishId')
    expect(source).toContain('const parishContextPending = pendingParishId !== null')
    expect(source).toContain('setPendingParishId(nextParishId)')
    expect(source).not.toContain('setActiveParishId(nextParishId)')
  })

  it('does not render old-parish search or notification state during confirmation', () => {
    const pendingBranch = source.slice(
      source.indexOf('{parishContextPending ? ('),
      source.indexOf('</header>'),
    )

    expect(pendingBranch).toContain('Updating parish workspace…')
    expect(pendingBranch).toContain('role="status"')
    expect(pendingBranch).toContain('aria-live="polite"')
    expect(pendingBranch).toContain('<DashboardGlobalSearch />')
    expect(pendingBranch).toContain(
      '<DashboardNotificationsCenter activeParishName={activeParishName} />',
    )
  })

  it('remounts tenant-sensitive tools for each confirmed parish id', () => {
    expect(source).toContain('key={`search-${activeParishId}`}')
    expect(source).toContain('key={`notifications-${activeParishId}`}')
    expect(source).toContain('setActiveParishId(result.activeParishId ?? \'\')')
    expect(source).toContain('setPendingParishId(null)')
  })
})
