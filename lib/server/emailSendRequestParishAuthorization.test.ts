import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request-bound staff email authorization', () => {
  it('keeps active-parish request ownership and the stored recipient before provider delivery', () => {
    const source = read('app/api/email/send/route.ts')
    const bodyIndex = source.indexOf('const parsedBody = await readBoundedJsonBody')
    const accessIndex = source.indexOf('const access = await loadStaffScopedRequestDetailAccess')
    const recipientIndex = source.indexOf('const recipient = await loadStoredRequestEmailRecipient')
    const providerIndex = source.indexOf('const resend = new Resend(apiKey)')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('const requestId = String(body?.requestId')
    expect(source).not.toContain('const to = String(body?.to')
    expect(source).toContain('staffSupabase: supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("error: 'Request not found.'")
    expect(source).toContain('to: recipient.email')
    expect(bodyIndex).toBeGreaterThan(-1)
    expect(accessIndex).toBeGreaterThan(bodyIndex)
    expect(recipientIndex).toBeGreaterThan(accessIndex)
    expect(providerIndex).toBeGreaterThan(recipientIndex)
  })

  it('binds Request Detail delivery to requestId and retains scoped communication logging', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('async function sendEmail'),
      source.indexOf('async function createGoogleCalendarEvent'),
    )

    expect(block).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(block).toContain('requestId: routeId')
    expect(block).not.toContain('JSON.stringify({ to, subject, text })')
    expect(block).toContain("fetch(`/api/requests/${routeId}/communications`")
    expect(block).not.toContain(".from('request_communications')")
    expect(block).not.toContain(".from('requests')")
  })

  it('binds Daily Work Hub delivery and post-send logging to the scoped server routes', () => {
    const source = read('app/dashboard/DashboardPageCore.tsx')
    const block = source.slice(
      source.indexOf('async function sendFollowUpEmail'),
      source.indexOf('async function markFollowUpAsContacted'),
    )

    expect(block).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(block).toContain('requestId: id')
    expect(block).not.toContain('JSON.stringify({ to, subject, text })')
    expect(block).toContain(
      'fetch(`/api/requests/${encodeURIComponent(id)}/communications`',
    )
    expect(block).toContain("credentials: 'include'")
    expect(block).toContain('contactedAt: contactedAtIso')
    expect(block).toContain("method: 'email'")
    expect(block).toContain('notes: summary')
    expect(block).not.toContain(".from('request_communications')")
    expect(block).not.toContain(".from('requests')")
    expect(block).not.toContain('.insert(')
    expect(block).not.toContain('.update({')
  })

  it('documents the request-bound recipient and production no-go boundary', () => {
    const doc = read('docs/EMAIL_SEND_REQUEST_PARISH_AUTHORIZATION_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const required of [
      'EMAIL_SEND_REQUEST_PARISH_AUTHORIZATION_IMPLEMENTED_20260710',
      'active-parish',
      'stored parishioner relationship',
      'A supplied `to` field is ignored',
      'no real email is sent',
      'Production-sensitive features approved by this boundary: `NO`',
    ]) {
      expect(doc).toContain(required)
    }

    expect(buildStatus).toContain('Request-Bound Staff Email Authorization - 2026-07-10')
    expect(roadmap).toContain('Request-Bound Staff Email Authorization boundary')
    expect(sourceOfTruth).toContain('Request-Bound Staff Email Authorization boundary')
  })
})
