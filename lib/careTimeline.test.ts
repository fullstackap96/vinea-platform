import { describe, expect, it } from 'vitest'
import { buildCareTimeline } from '@/lib/careTimeline'

describe('buildCareTimeline', () => {
  it('combines requests, records, communications, and households newest first', () => {
    const events = buildCareTimeline({
      requests: [
        {
          id: 'request-1',
          request_type: 'funeral',
          status: 'in_progress',
          created_at: '2026-06-01T12:00:00.000Z',
        },
      ],
      records: [
        {
          id: 'record-1',
          record_type: 'baptism',
          person_name: 'Lucia Cruz',
          sacrament_date: '2026-06-05',
          created_at: '2026-06-06T12:00:00.000Z',
        },
      ],
      communications: [
        {
          id: 'comm-1',
          requestId: 'request-1',
          requestLabel: 'Funeral',
          contacted_at: '2026-06-07T12:00:00.000Z',
          method: 'phone',
          notes: 'Called family after service.',
        },
      ],
      households: [
        {
          householdId: 'household-1',
          householdName: 'Cruz Household',
          relationship: 'head',
          isPrimaryContact: true,
        },
      ],
    })

    expect(events.map((event) => event.kind)).toEqual([
      'communication',
      'record',
      'request',
      'household',
    ])
    expect(events[0]?.detail).toBe('Called family after service.')
  })
})
