import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  isServerOwnedRequestAuditAction,
  SERVER_OWNED_REQUEST_AUDIT_ACTIONS,
} from '@/lib/server/requestAuditActionOwnership'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

function between(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start)
  return source.slice(startIndex, source.indexOf(end, startIndex))
}

describe('request mutation audit ownership', () => {
  it('reserves protected request activity actions for their owning server routes', () => {
    expect(SERVER_OWNED_REQUEST_AUDIT_ACTIONS).toEqual([
      'request.ai_summary.updated',
      'request.reply_draft.updated',
      'request.email.sent',
      'request.checklist.updated',
      'request.staff_notes.updated',
      'request.suggested_dates.updated',
      'request.intake.updated',
      'request.schedule.updated',
    ])

    for (const action of SERVER_OWNED_REQUEST_AUDIT_ACTIONS) {
      expect(isServerOwnedRequestAuditAction(action)).toBe(true)
    }
    expect(isServerOwnedRequestAuditAction('request.status.updated')).toBe(false)
  })

  it('blocks client-forged copies at the generic audit endpoint before scope lookup or writing', () => {
    const source = read('app/api/audit-events/route.ts')
    const blockIndex = source.indexOf("if (targetType === 'request')")
    const scopeIndex = source.indexOf('const parishContext = await resolveAuditEventsWriteParishId({')
    const writeIndex = source.indexOf('await writeAuditEvent({', scopeIndex)

    expect(source).toContain("error: 'Invalid audit event.'")
    expect(blockIndex).toBeGreaterThan(-1)
    expect(scopeIndex).toBeGreaterThan(blockIndex)
    expect(writeIndex).toBeGreaterThan(scopeIndex)
  })

  it('writes AI summary and reply draft events only after their scoped request updates', () => {
    const cases = [
      {
        path: 'app/api/requests/[id]/ai-summary/route.ts',
        update: ".update({ ai_summary: aiSummary })",
        action: "action: 'request.ai_summary.updated'",
        length: 'outputLength: aiSummary.length',
      },
      {
        path: 'app/api/requests/[id]/reply-draft/route.ts',
        update: ".update({ reply_draft: replyDraft })",
        action: "action: 'request.reply_draft.updated'",
        length: 'draftLength: replyDraft.length',
      },
    ]

    for (const auditCase of cases) {
      const source = read(auditCase.path)
      const updateIndex = source.indexOf(auditCase.update)
      const auditIndex = source.indexOf(auditCase.action)
      const metadata = between(source, 'metadata: {', '},\n    })')

      expect(updateIndex).toBeGreaterThan(-1)
      expect(auditIndex).toBeGreaterThan(updateIndex)
      expect(source).toContain('parishId: access.parishId')
      expect(source).toContain('actorEmail: staff.staff.email')
      expect(source).toContain('targetId: access.requestId')
      expect(source).toContain(auditCase.length)
      expect(source).toContain('staffReviewRequired: true')
      expect(metadata).not.toMatch(/summary:\s*aiSummary|replyDraft:|subject:|recipient:|prompt:|output:/)
    }
  })

  it('writes the sent-email event after provider success without content or recipient values', () => {
    const source = read('app/api/email/send/route.ts')
    const providerIndex = source.indexOf('providerResult = await resend.emails.send(')
    const auditIndex = source.indexOf("action: 'request.email.sent'")
    const metadata = source.slice(
      source.indexOf('metadata: {', auditIndex),
      source.indexOf('},\n    })', auditIndex),
    )

    expect(auditIndex).toBeGreaterThan(providerIndex)
    expect(metadata).toContain("source: 'staff_email_send'")
    expect(metadata).toContain("recipientSource: 'stored_request_parishioner'")
    expect(metadata).toContain('subjectLength: subject.length')
    expect(metadata).toContain('bodyLength: text.length')
    expect(metadata).not.toMatch(/recipient\.email|subject,|text,|to:/)
  })

  it('writes checklist, staff-note, suggested-date, and intake events after scoped mutations', () => {
    const cases = [
      {
        path: 'app/api/requests/[id]/checklist-items/[itemId]/route.ts',
        mutation: '.update({ is_complete: isComplete })',
        action: "action: 'request.checklist.updated'",
        requiredMetadata: ['itemId: String(itemRow.id)', 'complete: isComplete'],
      },
      {
        path: 'app/api/requests/[id]/staff-notes/route.ts',
        mutation: '.update({ staff_notes: staffNotes })',
        action: "action: 'request.staff_notes.updated'",
        requiredMetadata: ['notesLength: staffNotes.length', 'staffReviewRequired: true'],
      },
      {
        path: 'app/api/requests/[id]/suggested-dates/route.ts',
        mutation: 'suggested_date_1: suggestedDate1',
        action: "action: 'request.suggested_dates.updated'",
        requiredMetadata: ['populatedDateCount,', 'staffReviewRequired: true'],
      },
      {
        path: 'app/api/requests/[id]/funeral-details/route.ts',
        mutation: ".from('funeral_request_details').upsert(",
        action: "action: 'request.intake.updated'",
        requiredMetadata: ["requestType: 'funeral'", 'staffReviewRequired: true'],
      },
      {
        path: 'app/api/requests/[id]/wedding-details/route.ts',
        mutation: ".from('wedding_request_details').upsert(",
        action: "action: 'request.intake.updated'",
        requiredMetadata: ["requestType: 'wedding'", 'staffReviewRequired: true'],
      },
    ]

    for (const auditCase of cases) {
      const source = read(auditCase.path)
      const mutationIndex = source.indexOf(auditCase.mutation)
      const auditIndex = source.indexOf(auditCase.action)
      const metadata = source.slice(
        source.indexOf('metadata: {', auditIndex),
        source.indexOf('},\n    })', auditIndex),
      )

      expect(mutationIndex).toBeGreaterThan(-1)
      expect(auditIndex).toBeGreaterThan(mutationIndex)
      expect(source).toContain('parishId: access.parishId')
      expect(source).toContain('actorEmail: staff.staff.email')
      expect(source).toContain('targetId: access.requestId')
      expect(metadata).toContain("source: 'staff_request_detail'")
      for (const marker of auditCase.requiredMetadata) {
        expect(metadata).toContain(marker)
      }
      expect(metadata).not.toMatch(
        /staffNotes[,}]|deceasedName|familyRelationship|partnerOneName|ceremonyNotes|suggestedDate[123][,}]/,
      )
    }
  })

  it('writes confirmed-date and Google Calendar schedule events after owning operations', () => {
    const cases = [
      {
        path: 'app/api/requests/[id]/confirmed-baptism-date/route.ts',
        operation: '.update({ confirmed_baptism_date: confirmedBaptismDate })',
        kind: "scheduleKind: 'confirmed_baptism_date'",
      },
      {
        path: 'app/api/requests/[id]/confirmed-funeral-service/route.ts',
        operation: '.update({ confirmed_service_at: confirmedServiceAt })',
        kind: "scheduleKind: 'confirmed_funeral_service'",
      },
      {
        path: 'app/api/requests/[id]/confirmed-wedding-ceremony/route.ts',
        operation: '.update({ confirmed_ceremony_at: confirmedCeremonyAt })',
        kind: "scheduleKind: 'confirmed_wedding_ceremony'",
      },
      {
        path: 'app/api/requests/[id]/confirmed-ocia-session/route.ts',
        operation: '.update({ confirmed_session_at: confirmedSessionAt })',
        kind: "scheduleKind: 'confirmed_ocia_session'",
      },
      {
        path: 'app/api/google/calendar-event/create/route.ts',
        operation: 'google_calendar_event_id: eventId',
        kind: "operation: 'created'",
      },
      {
        path: 'app/api/google/calendar-event/update/route.ts',
        operation: 'google_calendar_id: calendarId',
        kind: "operation: 'updated'",
      },
      {
        path: 'app/api/google/calendar-event/delete/route.ts',
        operation: 'google_calendar_event_id: null',
        kind: "operation: 'removed'",
      },
    ]

    for (const auditCase of cases) {
      const source = read(auditCase.path)
      const operationIndex = source.indexOf(auditCase.operation)
      const auditIndex = source.indexOf("action: 'request.schedule.updated'")
      const metadata = source.slice(
        source.indexOf('metadata: {', auditIndex),
        source.indexOf('},\n    })', auditIndex),
      )

      expect(operationIndex).toBeGreaterThan(-1)
      expect(auditIndex).toBeGreaterThan(operationIndex)
      expect(metadata).toContain("source: 'staff_request_detail'")
      expect(metadata).toContain(auditCase.kind)
      expect(metadata).not.toMatch(
        /confirmedBaptismDate|confirmedServiceAt|confirmedCeremonyAt|confirmedSessionAt|eventId|calendarId|htmlLink/,
      )
    }
  })

  it('removes browser-owned copies and raw content or contact metadata', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    for (const action of SERVER_OWNED_REQUEST_AUDIT_ACTIONS) {
      expect(source).not.toContain(`recordRequestActivity('${action}'`)
    }

    expect(source).not.toContain('summary: summaryText.slice')
    expect(source).not.toContain("summary: parsed.subject || 'AI reply draft saved'")
    expect(source).not.toContain('summary: `Template applied: ${templateId}`')
    expect(source).not.toContain('to,\n    })')
    expect(source).not.toContain("method: 'POST',\n        credentials: 'include',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          action,")
  })
})
