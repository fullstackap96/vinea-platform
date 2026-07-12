import { describe, expect, it } from 'vitest'
import { buildRequestNotificationEmail } from '@/lib/email/requestNotificationEmail'

const basePayload = {
  requestType: 'baptism' as const,
  contactName: 'Maria Santos',
  contactEmail: 'maria@example.test',
  contactPhone: '555-0100',
}

describe('buildRequestNotificationEmail', () => {
  it('uses encoded dashboard request links in text and html output', () => {
    const email = buildRequestNotificationEmail({
      payload: {
        ...basePayload,
        requestId: 'request/unsafe?next=https://example.test',
      },
      appBaseUrl: 'https://vinea.example.test/',
    })

    expect(email.dashboardPath).toBe(
      '/dashboard/requests/request%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(email.dashboardUrl).toBe(
      'https://vinea.example.test/dashboard/requests/request%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(email.text).toContain(email.dashboardUrl)
    expect(email.html).toContain(
      'https://vinea.example.test/dashboard/requests/request%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(email.html).not.toContain('href="https://example.test')
  })

  it('falls back to safe relative dashboard links when the app base URL is not http or https', () => {
    const email = buildRequestNotificationEmail({
      payload: {
        ...basePayload,
        requestId: 'request-1',
      },
      appBaseUrl: 'javascript:alert(1)',
    })

    expect(email.dashboardPath).toBe('/dashboard/requests/request-1')
    expect(email.dashboardUrl).toBeNull()
    expect(email.text).toContain('/dashboard/requests/request-1')
    expect(email.html).toContain('href="/dashboard/requests/request-1"')
  })

  it('falls back to the requests dashboard when the request id is blank', () => {
    const email = buildRequestNotificationEmail({
      payload: {
        ...basePayload,
        requestId: '   ',
      },
      appBaseUrl: 'https://vinea.example.test',
    })

    expect(email.dashboardPath).toBe('/dashboard/requests')
    expect(email.dashboardUrl).toBe('https://vinea.example.test/dashboard/requests')
  })
})
