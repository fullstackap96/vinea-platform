import { describe, expect, it } from 'vitest'
import {
  buildNotificationsCenter,
  formatNotificationsBadgeCount,
} from './buildNotificationsCenter'

const now = new Date('2026-06-10T12:00:00.000Z')

describe('buildNotificationsCenter', () => {
  it('groups overdue before due today and new for the same request', () => {
    const result = buildNotificationsCenter({
      now,
      requests: [
        {
          id: 'req-1',
          status: 'new',
          request_type: 'baptism',
          child_name: 'Lucia',
          next_follow_up_date: '2026-06-05',
          created_at: '2026-06-01T10:00:00.000Z',
          parishioner: { full_name: 'Maria Smith', email: 'maria@example.com' },
        },
      ],
      suggestedActions: [],
    })

    expect(result.groups.overdue).toHaveLength(1)
    expect(result.groups.due_today).toHaveLength(0)
    expect(result.groups.new_requests).toHaveLength(0)
    expect(result.totalCount).toBe(1)
    expect(result.groups.overdue[0]?.label).toBe('Follow up with Maria Smith')
  })

  it('includes due today and new requests separately', () => {
    const result = buildNotificationsCenter({
      now,
      requests: [
        {
          id: 'req-today',
          status: 'in_progress',
          request_type: 'wedding',
          created_at: '2026-06-09T10:00:00.000Z',
          next_follow_up_date: '2026-06-10',
          parishioner: { full_name: 'Ann Lee' },
        },
        {
          id: 'req-new',
          status: 'new',
          request_type: 'baptism',
          created_at: '2026-06-09T11:00:00.000Z',
          parishioner: { full_name: 'John Doe' },
        },
      ],
      suggestedActions: [],
    })

    expect(result.groups.due_today).toHaveLength(1)
    expect(result.groups.new_requests).toHaveLength(1)
    expect(result.totalCount).toBe(2)
    expect(result.groups.due_today[0]?.label).toContain('Follow up today')
    expect(result.groups.new_requests[0]?.label).toBe('New Baptism request needs review')
  })

  it('caps visible items at 10 and reports more links', () => {
    const requests = Array.from({ length: 12 }, (_, index) => ({
      id: `req-${index}`,
      status: 'new',
      request_type: 'baptism',
      created_at: `2026-06-0${(index % 9) + 1}T10:00:00.000Z`,
      parishioner: { full_name: `Family ${index}` },
    }))

    const result = buildNotificationsCenter({
      now,
      requests,
      suggestedActions: [
        {
          kind: 'record_creation',
          requestId: 'done-1',
          requestType: 'baptism',
          recordType: 'baptism',
          label: 'Baptism request — create sacramental record',
        },
      ],
    })

    expect(result.totalCount).toBe(13)
    expect(result.visible).toHaveLength(10)
    expect(result.hasMoreRequestItems).toBe(true)
    expect(result.hasMoreRecommended).toBe(true)
  })

  it('includes recommended actions', () => {
    const result = buildNotificationsCenter({
      now,
      requests: [],
      suggestedActions: [
        {
          kind: 'person_match',
          personId: 'person-1',
          personDisplayName: 'Maria Smith',
          confidence: 'high',
          reason: 'Baptism request — same email on file',
          requestId: 'req-1',
          householdNames: [],
        },
      ],
    })

    expect(result.groups.recommended).toHaveLength(1)
    expect(result.groups.recommended[0]?.label).toBe('Possible person match found')
  })
})

describe('formatNotificationsBadgeCount', () => {
  it('returns null for zero and caps at 9+', () => {
    expect(formatNotificationsBadgeCount(0)).toBeNull()
    expect(formatNotificationsBadgeCount(3)).toBe('3')
    expect(formatNotificationsBadgeCount(9)).toBe('9')
    expect(formatNotificationsBadgeCount(10)).toBe('9+')
  })
})
