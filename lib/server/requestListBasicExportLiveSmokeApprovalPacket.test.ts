import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md'
)

describe('request_list_basic export live non-production smoke approval packet', () => {
  it('is approval-only and preserves the production and runtime safety boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `LIVE NON-PRODUCTION EXPORT SMOKE NOT APPROVED BY THIS DOCUMENT`',
      'Completion marker: `REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact app target, flags, fixtures, denial cases, audit inspection, monitoring, and rollback', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'App target label: `NON_PRODUCTION_APP_URL`',
      'Route under smoke: `/api/exports/requests/basic`',
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'Staff fixture label: `SAFE_EXPORT_QA_STAFF`',
      'Active parish fixture label: `SAFE_EXPORT_PARISH_A`',
      'Same-parish request fixture label: `SAFE_EXPORT_SAME_PARISH_REQUEST`',
      'Cross-parish fixture label: `SAFE_EXPORT_CROSS_PARISH_DENIED_REQUEST`',
      '/api/exports/requests/basic?fields=request_reference,access_token',
      '/api/exports/requests/basic?fields=request_reference,internal_notes',
      'Preferred method: open the route from a browser context that is not authenticated as staff.',
      'Audit action: `export.request_list_basic.downloaded`',
      'Rollback owner placeholder: `ROLLBACK_OWNER_NAME`',
      '/api/health` returns `checks.schema: true`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires exact future approval language before live smoke execution', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Approve live non-production HTTP/browser smoke for the request_list_basic export route only.',
      'Run flag-off baseline first',
      'Verify same-parish CSV success, cross-parish denial, blocked-field denial, family-portal or unauthenticated denial, safe audit metadata, monitoring expectations, and rollback by disabling flags.',
      'Do not access production, enable production flags, add production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, or expose secrets.',
      'Current recommendation: `NO-GO UNTIL PRODUCT OWNER FILLS FIXTURES AND APPROVES THE EXACT FUTURE PROMPT`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious credential or connection-string material', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
