import { describe, expect, it } from 'vitest'
import { buildWorkflowReminderCandidates } from '@/lib/workflowReminderDtos'

const now = new Date('2026-07-02T12:00:00.000Z')

describe('buildWorkflowReminderCandidates', () => {
  it('builds staff-reviewed DTOs for safe V1 reminder signals without enabling delivery', () => {
    const reminders = buildWorkflowReminderCandidates({
      now,
      requests: [
        {
          id: 'overdue-unassigned',
          status: 'new',
          request_type: 'funeral',
          created_at: '2026-06-28T12:00:00.000Z',
          next_follow_up_date: '2026-07-01',
          assigned_staff_name: '',
          parishioner: { full_name: 'Ana Lopez' },
          funeral_detail: {
            deceased_name: 'Carlos Lopez',
            confirmed_service_at: '2026-07-08T15:00:00.000Z',
          },
        },
        {
          id: 'docs-needed',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-20T12:00:00.000Z',
          last_contacted_at: '2026-06-22T12:00:00.000Z',
          next_follow_up_date: '2026-07-10',
          assigned_staff_name: 'Elena',
          waiting_on: 'godparent_paperwork',
          child_name: 'Mateo Garcia',
          checklist_incomplete: true,
          checklist_incomplete_count: 2,
          confirmed_baptism_date: '2026-07-12T10:00:00.000Z',
        },
        {
          id: 'complete-ignore',
          status: 'complete',
          request_type: 'wedding',
          created_at: '2026-06-01T12:00:00.000Z',
          assigned_staff_name: '',
          checklist_incomplete: true,
          checklist_incomplete_count: 99,
          wedding_detail: { confirmed_ceremony_at: '2026-07-03T17:00:00.000Z' },
        },
      ],
      certificateReady: [
        {
          id: 'baptism-cert-1',
          label: 'Mateo Garcia',
          href: '/dashboard/records/record-1',
          certificateType: 'Baptism',
          ownerLabel: 'Sacramental Coordinator',
        },
      ],
      duplicateReview: {
        peopleCandidateCount: 2,
        householdCandidateCount: 1,
        href: '/dashboard/people/duplicates',
      },
    })

    const byKind = new Map(reminders.map((reminder) => [reminder.kind, reminder]))

    expect(byKind.get('overdue_follow_up')).toMatchObject({
      requestId: 'overdue-unassigned',
      severity: 'urgent',
      ownerLabel: 'Unassigned',
      staffReviewRequired: true,
      outboundCommunicationAllowed: false,
      runtimeStatus: 'non_runtime_dto_only',
    })
    expect(byKind.get('missing_documents')).toMatchObject({
      requestId: 'docs-needed',
      severity: 'warning',
      ownerLabel: 'Elena',
    })
    expect(byKind.get('upcoming_sacramental_date')?.dueAt).toBeTruthy()
    expect(byKind.get('stalled_request')?.reasonSignals.join(' ')).toContain('last_contacted_at')
    expect(byKind.get('unassigned_request')).toMatchObject({
      requestId: 'overdue-unassigned',
      severity: 'urgent',
    })
    expect(byKind.get('certificate_ready')).toMatchObject({
      requestId: null,
      severity: 'info',
      ownerLabel: 'Sacramental Coordinator',
    })
    expect(byKind.get('certificate_ready')?.recommendedAction).toContain(
      'does not decide sacramental eligibility'
    )
    expect(byKind.get('duplicate_review')).toMatchObject({
      requestId: null,
      severity: 'info',
    })
    expect(byKind.get('duplicate_review')?.recommendedAction).toContain('does not merge')
    expect(reminders.some((reminder) => reminder.requestId === 'complete-ignore')).toBe(false)
    expect(reminders.every((reminder) => reminder.staffReviewRequired)).toBe(true)
    expect(reminders.every((reminder) => reminder.outboundCommunicationAllowed === false)).toBe(
      true
    )
  })

  it('keeps certificate and duplicate reminders opt-in through explicit upstream signals', () => {
    const reminders = buildWorkflowReminderCandidates({
      now,
      requests: [],
    })

    expect(reminders).toEqual([])
  })

  it('sorts urgent reminders before warning and info reminders', () => {
    const reminders = buildWorkflowReminderCandidates({
      now,
      requests: [
        {
          id: 'info-later',
          status: 'in_progress',
          request_type: 'ocia',
          created_at: '2026-07-01T12:00:00.000Z',
          last_contacted_at: '2026-07-01T12:00:00.000Z',
          assigned_staff_name: 'Elena',
          ocia_detail: { confirmed_session_at: '2026-07-10T19:00:00.000Z' },
        },
        {
          id: 'urgent-now',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-20T12:00:00.000Z',
          next_follow_up_date: '2026-07-01',
          child_name: 'Urgent Child',
        },
      ],
      duplicateReview: { peopleCandidateCount: 1 },
    })

    expect(reminders[0].severity).toBe('urgent')
    expect(reminders[reminders.length - 1].severity).toBe('info')
  })

  it('keeps reminder hrefs dashboard-only for explicit upstream certificate and duplicate signals', () => {
    const reminders = buildWorkflowReminderCandidates({
      now,
      requests: [],
      certificateReady: [
        {
          id: 'unsafe-cert-link',
          label: 'Safe Record',
          certificateType: 'Baptism',
          href: 'https://example.test/not-vinea',
        },
        {
          id: 'safe-cert-link',
          label: 'Safe Record 2',
          certificateType: 'Baptism',
          href: '/dashboard/records/safe-record-2',
        },
      ],
      duplicateReview: {
        peopleCandidateCount: 1,
        href: '/api/exports/requests/basic',
      },
    })

    expect(reminders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'certificate_ready:unsafe-cert-link',
          href: '/dashboard/records',
        }),
        expect.objectContaining({
          id: 'certificate_ready:safe-cert-link',
          href: '/dashboard/records/safe-record-2',
        }),
        expect.objectContaining({
          id: 'duplicate_review:people_households',
          href: '/dashboard/people/duplicates',
        }),
      ])
    )
    expect(reminders.every((reminder) => reminder.href.startsWith('/dashboard'))).toBe(true)
  })

  it('encodes request reminder hrefs through the shared dashboard-only boundary', () => {
    const reminders = buildWorkflowReminderCandidates({
      now,
      requests: [
        {
          id: 'request/unsafe?next=https://example.test',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-20T12:00:00.000Z',
          next_follow_up_date: '2026-07-01',
          child_name: 'Lucia Santos',
        },
      ],
    })

    expect(reminders.length).toBeGreaterThan(0)
    for (const reminder of reminders) {
      expect(reminder.href).toContain(
        '/dashboard/requests/request%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
      )
      expect(reminder.href).not.toContain('https://example.test')
    }
  })
})
