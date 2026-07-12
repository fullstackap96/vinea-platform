import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request sent-email communication log active parish mutation route', () => {
  it('logs sent-email communication history through the active-parish route after email send', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const sendEmailBlock = source.slice(
      source.indexOf('async function sendEmail'),
      source.indexOf('async function createGoogleCalendarEvent')
    )

    expect(sendEmailBlock).toContain("fetch('/api/email/send'")
    expect(sendEmailBlock).toContain('JSON.stringify({ requestId: routeId, subject, text })')
    expect(sendEmailBlock).not.toContain('JSON.stringify({ to, subject, text })')
    expect(sendEmailBlock).toContain("fetch(`/api/requests/${routeId}/communications`")
    expect(sendEmailBlock).toContain("method: 'POST'")
    expect(sendEmailBlock).toContain("credentials: 'include'")
    expect(sendEmailBlock).toContain('contactedAt: contactedAtIso')
    expect(sendEmailBlock).toContain("method: 'email'")
    expect(sendEmailBlock).toContain('notes: summary')
    expect(sendEmailBlock).toContain("requestDetailClientApiErrorMessage('logCommunication'")
    expect(sendEmailBlock).toContain("requestDetailClientFailureMessage('logSentEmail')")
    expect(sendEmailBlock).toContain("requestDetailClientFailureMessage('updateSentEmailSummary')")
    expect(sendEmailBlock).not.toContain(".from('request_communications')")
    expect(sendEmailBlock).not.toContain(".from('requests')")
    expect(sendEmailBlock).not.toContain('.insert(')
    expect(sendEmailBlock).not.toContain('.update({')
  })

  it('keeps the communication POST route as the single request detail communication mutation boundary', () => {
    const route = read('app/api/requests/[id]/communications/route.ts')

    expect(route).toContain('export async function POST')
    expect(route).toContain("COMMUNICATION_METHODS = new Set(['email', 'phone', 'text', 'in_person', 'voicemail', 'other'])")
    expect(route).toContain("COMMUNICATION_METHODS.has(value)")
    expect(route).toContain('request_id: access.requestId')
    expect(route).toContain('last_contacted_at: contactedAt')
    expect(route).toContain('last_contact_method: method')
    expect(route).toContain('communication_notes: notes')
    expect(route).toContain(".eq('id', access.requestId)")
  })

  it('documents that sent-email logging reuses the same active parish route', () => {
    const doc = read(
      'docs/REQUEST_SENT_EMAIL_COMMUNICATION_LOG_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md'
    )

    expect(doc).toContain('email was sent')
    expect(doc).toContain('`app/api/requests/[id]/communications/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('does not change email delivery')
  })
})
