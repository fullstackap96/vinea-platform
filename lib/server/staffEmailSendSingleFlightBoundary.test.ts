import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
const sendSection = read(
  'app/dashboard/requests/[id]/_components/SendEmailSection.tsx',
)
const workHub = read('app/dashboard/DashboardPageCore.tsx')

describe('staff email send single-flight boundary', () => {
  it('locks Request Detail before the request-bound provider route', () => {
    const start = requestDetail.indexOf('async function sendEmail()')
    const end = requestDetail.indexOf('\nasync function createGoogleCalendarEvent()', start)
    const handler = requestDetail.slice(start, end)

    expect(requestDetail).toContain('const emailSendInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (emailSendInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('emailSendInFlightRef.current = true')).toBeLessThan(
      handler.indexOf("fetch('/api/email/send'"),
    )
    expect(handler).toContain('emailSendInFlightRef.current = false')
    expect(handler).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(handler).toContain('requestId: routeId')
    expect(handler).toContain("fetch(`/api/requests/${routeId}/communications`")
  })

  it('freezes the visible Request Detail composer during delivery', () => {
    expect(sendSection).toContain('aria-busy={sending || applying}')
    expect(sendSection).toContain(
      'const controlsDisabled = sending || applying || mutationDisabled',
    )
    expect(sendSection).toContain('disabled={controlsDisabled}')
    expect(sendSection).toContain('disabled={!selectedTemplateId || controlsDisabled}')
    expect(sendSection.match(/disabled=\{sending \|\| mutationDisabled\}/g)).toHaveLength(2)
    expect(sendSection).toContain('onClick={() => void onSend()}')
  })

  it('locks Daily Work Hub before the same request-bound provider route', () => {
    const start = workHub.indexOf('async function sendFollowUpEmail')
    const end = workHub.indexOf('\n  async function markFollowUpAsContacted', start)
    const handler = workHub.slice(start, end)

    expect(workHub).toContain('const followUpEmailInFlightRef = useRef(false)')
    expect(handler).toContain(
      'if (followUpEmailInFlightRef.current || workHubMutationRequiresRefresh) return',
    )
    expect(handler.indexOf('followUpEmailInFlightRef.current = true')).toBeLessThan(
      handler.indexOf("fetch('/api/email/send'"),
    )
    expect(handler).toContain('followUpEmailInFlightRef.current = false')
    expect(handler).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(handler).toContain('requestId: id')
    expect(handler).toContain(
      'fetch(`/api/requests/${encodeURIComponent(id)}/communications`',
    )
    expect(workHub).toContain('onClick={() => void sendFollowUpEmail(request)}')
  })

  it('preserves send confirmation before communication logging', () => {
    for (const [source, sendName, communicationsMarker] of [
      [requestDetail, 'async function sendEmail()', 'fetch(`/api/requests/${routeId}/communications`'],
      [
        workHub,
        'async function sendFollowUpEmail',
        'fetch(`/api/requests/${encodeURIComponent(id)}/communications`',
      ],
    ] as const) {
      const start = source.indexOf(sendName)
      const send = source.slice(start)
      expect(send.indexOf("fetch('/api/email/send'")).toBeLessThan(
        send.indexOf(communicationsMarker),
      )
      expect(send.indexOf('payload?.ok !== true')).toBeLessThan(
        send.indexOf(communicationsMarker),
      )
    }
  })

  it('documents immediate exclusion without claiming provider idempotency', () => {
    const evidence = read('docs/STAFF_EMAIL_SEND_SINGLE_FLIGHT_BOUNDARY_20260711.md')

    for (const phrase of [
      'Staff Email Send Single-Flight Boundary',
      'Request Detail',
      'Daily Work Hub',
      'staff-reviewed',
      'not provider-level idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
