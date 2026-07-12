import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

function functionBlock(source: string, start: string, end: string) {
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))
}

describe('sent email client partial-success boundary', () => {
  it('keeps Request Detail send and post-send logging failures distinct', () => {
    const block = functionBlock(
      read('app/dashboard/requests/[id]/page.tsx'),
      'async function sendEmail()',
      'async function createGoogleCalendarEvent()',
    )

    expect(block).toContain("requestDetailClientFailureMessage('sendEmail')")
    expect(block).toContain("requestDetailClientFailureMessage('confirmEmailSend')")
    expect(block).toContain("requestDetailClientFailureMessage('logSentEmail')")
    expect(block.indexOf("fetch('/api/email/send'")).toBeLessThan(
      block.indexOf("fetch(`/api/requests/${routeId}/communications`"),
    )
    expect(block).not.toContain("} catch {\n    setEmailMessage(requestDetailClientFailureMessage('sendEmail'))")
  })

  it('keeps Daily Work Hub send and post-send logging failures distinct', () => {
    const block = functionBlock(
      read('app/dashboard/DashboardPageCore.tsx'),
      'async function sendFollowUpEmail',
      'async function markFollowUpAsContacted',
    )

    expect(block).toContain("dashboardClientFailureMessage('sendFollowUpEmail')")
    expect(block).toContain("dashboardClientFailureMessage('confirmFollowUpEmailSend')")
    expect(block).toContain("dashboardClientFailureMessage('logFollowUpEmail')")
    expect(block.indexOf("fetch('/api/email/send'")).toBeLessThan(
      block.indexOf('fetch(`/api/requests/${encodeURIComponent(id)}/communications`'),
    )
    expect(block).not.toContain("} catch {\n      setFollowUpRowMessage(id, dashboardClientFailureMessage('sendFollowUpEmail'))\n    } finally")
  })

  it('uses explicit duplicate-send prevention guidance for uncertain confirmations', () => {
    const requestMessages = read('lib/requestDetailClientMessages.ts')
    const dashboardMessages = read('lib/dashboardClientMessages.ts')

    for (const source of [requestMessages, dashboardMessages]) {
      expect(source).toContain('incomplete send confirmation')
      expect(source).toContain('may have been sent')
      expect(source).toContain('before trying again')
    }
  })
})
