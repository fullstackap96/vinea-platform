import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('Daily Brief provider reliability boundary', () => {
  const route = read('app/api/parish/daily-brief/route.ts')
  const settings = read('app/dashboard/settings/ParishSettingsPage.tsx')

  it('keeps manual authentication and bounded validation before tenant and provider work', () => {
    const postStart = route.indexOf('export async function POST(request: NextRequest)')
    const getStart = route.indexOf('export async function GET(request: NextRequest)')
    const post = route.slice(postStart, getStart)
    const auth = post.indexOf('const staff = await requireStaffFromRequest(request)')
    const body = post.indexOf(
      'const parsedBody = await readBoundedJsonBody(request, MAX_MANUAL_SEND_BODY_BYTES)',
    )
    const validation = post.indexOf(
      'if (!isValidDailyBriefDeliveryAttemptId(deliveryAttemptId))',
    )
    const admin = post.indexOf('const admin = createSupabaseServiceRoleClient()')
    const scope = post.indexOf('resolveDailyBriefManualSendParishContext(')
    const send = post.indexOf('const id = await sendBriefEmail({')

    expect(route).toContain('const MAX_MANUAL_SEND_BODY_BYTES = 4 * 1024')
    expect(auth).toBeGreaterThan(-1)
    expect(body).toBeGreaterThan(auth)
    expect(validation).toBeGreaterThan(body)
    expect(admin).toBeGreaterThan(validation)
    expect(scope).toBeGreaterThan(admin)
    expect(send).toBeGreaterThan(scope)
    expect(post).not.toContain('request.json()')
  })

  it('applies opaque idempotency and a deadline before every provider send', () => {
    const helper = read('lib/server/dailyBriefDelivery.ts')
    const options = route.indexOf('const providerOptions = createDailyBriefProviderOptions({')
    const send = route.indexOf('providerResult = await resend.emails.send(', options)
    const confirmation = route.indexOf(
      'const providerMessageId = String(data?.id ?? \'\').trim()',
      send,
    )

    expect(helper).toContain('export const DAILY_BRIEF_PROVIDER_TIMEOUT_MS = 12_000')
    expect(helper).toContain('idempotencyKey: `vinea-daily-brief-${digest}`')
    expect(helper).toContain('AbortSignal.timeout(')
    expect(options).toBeGreaterThan(-1)
    expect(send).toBeGreaterThan(options)
    expect(confirmation).toBeGreaterThan(send)
    expect(route).toContain("deliveryKind: 'manual'")
    expect(route).toContain("deliveryKind: 'scheduled'")
    expect(route).toContain("new Error('Provider confirmation timed out.')")
  })

  it('reuses one selected-parish manual attempt until confirmed success', () => {
    const start = settings.indexOf('async function sendDailyBriefNow()')
    const end = settings.indexOf('function beginPublicRoutingMutation', start)
    const handler = settings.slice(start, end)

    expect(settings).toContain('const dailyBriefDeliveryAttemptRef = useRef<{')
    expect(handler).toContain(
      'dailyBriefDeliveryAttemptRef.current?.parishId !== sendParishId',
    )
    expect(handler).toContain('id: crypto.randomUUID()')
    expect(handler).toContain("headers: { 'Content-Type': 'application/json' }")
    expect(handler).toContain('body: JSON.stringify({ deliveryAttemptId })')
    expect(handler).toContain('dailyBriefDeliveryAttemptRef.current = null')
    expect(handler.indexOf('dailyBriefDeliveryAttemptRef.current = null')).toBeGreaterThan(
      handler.indexOf('if (!data?.ok || !providerMessageId)'),
    )
  })

  it('documents the reliability gain without approving production or claiming a send', () => {
    const evidence = read('docs/DAILY_BRIEF_PROVIDER_RELIABILITY_20260712.md')

    for (const phrase of [
      'same-parish retry reuses that id',
      'opaque parish-and-date idempotency key',
      '12-second confirmation deadline',
      'Manual body parsing is bounded to 4 KiB',
      'Production deployment approved: `NO`',
      'Real email sent during verification: `NO`',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
