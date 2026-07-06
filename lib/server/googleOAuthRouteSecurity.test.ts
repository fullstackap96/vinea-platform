import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const startRoutePath = join(process.cwd(), 'app', 'api', 'google', 'oauth', 'start', 'route.ts')
const callbackRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'google',
  'oauth',
  'callback',
  'route.ts'
)

describe('Google OAuth route security', () => {
  it('requires staff authorization before starting Google OAuth', () => {
    const source = readFileSync(startRoutePath, 'utf8')

    expect(source).toContain("import { authorizeStaffUser } from '@/lib/server/requireStaff'")
    expect(source).toContain('const staff = await authorizeStaffUser(user)')
    expect(source).toContain("login.searchParams.set('staff', 'unauthorized')")
  })

  it('requires staff authorization before storing Google refresh tokens', () => {
    const source = readFileSync(callbackRoutePath, 'utf8')
    const staffCheckIndex = source.indexOf('const staff = await authorizeStaffUser(user)')
    const serviceRoleIndex = source.indexOf('createSupabaseServiceRoleClient()')

    expect(source).toContain("import { authorizeStaffUser } from '@/lib/server/requireStaff'")
    expect(staffCheckIndex).toBeGreaterThan(-1)
    expect(serviceRoleIndex).toBeGreaterThan(-1)
    expect(staffCheckIndex).toBeLessThan(serviceRoleIndex)
  })
})
