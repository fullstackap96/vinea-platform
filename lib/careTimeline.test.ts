import { describe, expect, it } from 'vitest'
import {
  buildCareTimeline,
  buildHouseholdCareTimeline,
  buildPersonCareTimeline,
} from '@/lib/careTimeline'

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
    expect(events[0]?.label).toBe('Phone call touchpoint')
    expect(events[0]?.detail).toBe('Called family after service.')
  })
})

describe('buildPersonCareTimeline', () => {
  it('recommends first contact before routine profile work', () => {
    const timeline = buildPersonCareTimeline({
      now: new Date('2026-06-19T12:00:00.000Z'),
      requests: [
        {
          id: 'request-1',
          request_type: 'funeral',
          status: 'new',
          created_at: '2026-06-18T12:00:00.000Z',
          last_contacted_at: null,
          next_follow_up_date: null,
        },
      ],
      households: [
        {
          householdId: 'household-1',
          householdName: 'Santos Household',
          relationship: 'member',
          isPrimaryContact: false,
        },
      ],
    })

    expect(timeline.nextAction).toMatchObject({
      title: 'Log the first pastoral touchpoint',
      label: 'Log contact',
      tone: 'urgent',
    })
    expect(timeline.nextAction.href).toContain('/dashboard/requests/request-1#communication')
    expect(timeline.counts.openRequests).toBe(1)
  })

  it('surfaces overdue follow-up when first contact is complete', () => {
    const timeline = buildPersonCareTimeline({
      now: new Date('2026-06-19T12:00:00.000Z'),
      requests: [
        {
          id: 'request-2',
          request_type: 'baptism',
          status: 'in_progress',
          child_name: 'Lucia',
          created_at: '2026-06-10T12:00:00.000Z',
          last_contacted_at: '2026-06-11T12:00:00.000Z',
          next_follow_up_date: '2026-06-12',
        },
      ],
    })

    expect(timeline.nextAction.title).toBe('Catch up on overdue follow-up')
    expect(timeline.nextAction.detail).toContain('Baptism for Lucia')
    expect(timeline.events.some((event) => event.kind === 'follow_up')).toBe(true)
  })

  it('shows a steady action when history is linked and no urgent action is needed', () => {
    const timeline = buildPersonCareTimeline({
      now: new Date('2026-06-19T12:00:00.000Z'),
      requests: [
        {
          id: 'request-3',
          request_type: 'wedding',
          status: 'complete',
          created_at: '2026-06-01T12:00:00.000Z',
        },
      ],
      records: [
        {
          id: 'record-1',
          record_type: 'marriage',
          person_name: 'Ana Cruz',
          created_at: '2026-06-02T12:00:00.000Z',
        },
      ],
      households: [
        {
          householdId: 'household-1',
          householdName: 'Cruz Household',
          relationship: 'spouse',
          isPrimaryContact: true,
        },
      ],
    })

    expect(timeline.nextAction).toMatchObject({
      title: 'Care history is organized',
      tone: 'steady',
    })
    expect(timeline.counts.records).toBe(1)
  })
})

describe('buildHouseholdCareTimeline', () => {
  it('recommends adding members before routine household care when empty', () => {
    const timeline = buildHouseholdCareTimeline({
      householdId: 'household-1',
      memberCount: 0,
      primaryContactCount: 0,
      households: [
        {
          householdId: 'household-1',
          householdName: 'Santos Household',
          relationship: 'Household',
          isPrimaryContact: false,
        },
      ],
    })

    expect(timeline.nextAction).toMatchObject({
      title: 'Add household members',
      label: 'Add members',
      tone: 'warning',
    })
    expect(timeline.nextAction.href).toBe('/dashboard/households/household-1/edit')
  })

  it('keeps urgent request care ahead of household cleanup', () => {
    const timeline = buildHouseholdCareTimeline({
      now: new Date('2026-06-19T12:00:00.000Z'),
      householdId: 'household-2',
      memberCount: 3,
      primaryContactCount: 0,
      requests: [
        {
          id: 'request-1',
          request_type: 'funeral',
          status: 'new',
          created_at: '2026-06-18T12:00:00.000Z',
          last_contacted_at: null,
        },
      ],
    })

    expect(timeline.nextAction.title).toBe('Log the first pastoral touchpoint')
    expect(timeline.nextAction.tone).toBe('urgent')
    expect(timeline.memberCount).toBe(3)
    expect(timeline.primaryContactCount).toBe(0)
  })

  it('suggests choosing a primary contact when household history is otherwise organized', () => {
    const timeline = buildHouseholdCareTimeline({
      householdId: 'household-3',
      memberCount: 2,
      primaryContactCount: 0,
      households: [
        {
          householdId: 'household-3',
          householdName: 'Cruz Household',
          relationship: 'Household',
          isPrimaryContact: false,
        },
      ],
    })

    expect(timeline.nextAction).toMatchObject({
      title: 'Choose a primary household contact',
      label: 'Set primary contact',
      tone: 'steady',
    })
  })
})
