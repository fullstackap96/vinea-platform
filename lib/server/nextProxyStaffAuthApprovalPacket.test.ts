import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('Next proxy staff auth multi-parish approval packet', () => {
  it('documents the current primary parish compatibility behavior without changing runtime auth', () => {
    const packet = read('docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md')

    expect(packet).toContain('NEXT PROXY STAFF AUTH MULTI-PARISH HARDENING NOT APPROVED')
    expect(packet).toContain('Authorization Behavior Unchanged'.toUpperCase())
    expect(packet).toContain('the proxy calls `primary_parish_id()`')
    expect(packet).toContain('checks `staff_users` for one active row')
    expect(packet).toContain('Because changing proxy authorization affects who can reach the staff dashboard')
  })

  it('requires the future proxy implementation to stay Next 16 compatible and service-role-free', () => {
    const packet = read('docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md')

    expect(packet).toContain('Keep the Next.js 16 `export async function proxy(request: NextRequest)` convention')
    expect(packet).toContain("Keep `config.matcher = ['/dashboard/:path*']`")
    expect(packet).toContain('Avoid `primary_parish_id()` in `proxy.ts`')
    expect(packet).toContain('Avoid `createSupabaseServiceRoleClient()` and any service-role key in `proxy.ts`')
    expect(packet).toContain('Fail closed if the membership/staff lookup errors unexpectedly')
  })

  it('keeps approval gates, QA, rollback, and production NO-GO explicit', () => {
    const packet = read('docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md')

    expect(packet).toContain('Product owner approves the dashboard-auth behavior change.')
    expect(packet).toContain('Security/data owner approves removing the proxy `primary_parish_id()` compatibility lookup.')
    expect(packet).toContain('Engineering owner confirms the implementation follows the bundled Next.js 16 proxy guidance')
    expect(packet).toContain('non-production browser smoke passes')
    expect(packet).toContain('Rollback is code rollback only')
    expect(packet).toContain('Production remains `NO-GO`')
    expect(packet).toContain('Approve non-production implementation of the Next.js proxy staff-auth multi-parish hardening.')
  })
})
