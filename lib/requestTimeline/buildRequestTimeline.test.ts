import { describe, expect, it } from 'vitest'
import {
  buildRequestTimeline,
  communicationMethodLabel,
  isEmailSentCommunication,
} from './buildRequestTimeline'

describe('buildRequestTimeline', () => {
  const baseInput = {
    request: {
      created_at: '2026-06-01T10:00:00.000Z',
      request_type: 'baptism',
    },
    scheduleRow: {
      request_type: 'baptism',
      confirmed_baptism_date: null,
    },
    communications: [] as const,
    requestNotes: [] as const,
    sacramentalRecord: null,
  }

  it('includes request submitted event', () => {
    const events = buildRequestTimeline(baseInput)
    expect(events).toHaveLength(1)
    expect(events[0]?.label).toBe('Baptism request submitted')
    expect(events[0]?.kind).toBe('submitted')
  })

  it('sorts newest events first', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      communications: [
        {
          id: 'c1',
          contacted_at: '2026-06-02T12:00:00.000Z',
          method: 'phone',
          notes: 'Called family',
        },
        {
          id: 'c2',
          contacted_at: '2026-06-03T15:00:00.000Z',
          method: 'email',
          notes: 'Email sent: Baptism date options',
        },
      ],
      requestNotes: [
        {
          id: 'n1',
          created_at: '2026-06-02T18:00:00.000Z',
        },
      ],
    })

    expect(events.map((event) => event.kind)).toEqual([
      'email_sent',
      'internal_note',
      'communication_logged',
      'submitted',
    ])
  })

  it('labels email sends from communication notes', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      communications: [
        {
          id: 'c1',
          contacted_at: '2026-06-02T12:00:00.000Z',
          method: 'email',
          notes: 'Email sent: Welcome packet',
        },
      ],
    })

    const emailEvent = events.find((event) => event.kind === 'email_sent')
    expect(emailEvent?.label).toBe('Email sent')
    expect(emailEvent?.detail).toBe('Welcome packet')
  })

  it('labels manual communications with method detail', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      communications: [
        {
          id: 'c1',
          contacted_at: '2026-06-02T12:00:00.000Z',
          method: 'phone',
          notes: 'Left voicemail',
        },
      ],
    })

    const commEvent = events.find((event) => event.kind === 'communication_logged')
    expect(commEvent?.label).toBe('Communication logged')
    expect(commEvent?.detail).toBe('Phone call')
  })

  it('includes confirmed baptism date', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      scheduleRow: {
        request_type: 'baptism',
        confirmed_baptism_date: '2026-07-15T14:00:00.000Z',
      },
    })

    const confirmed = events.find((event) => event.kind === 'confirmed_date')
    expect(confirmed?.label).toBe('Baptism date confirmed')
    expect(confirmed?.detail).toBeTruthy()
  })

  it('includes sacramental record with person name', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      sacramentalRecord: {
        person_name: 'Lucia Smith',
        created_at: '2026-08-01T16:00:00.000Z',
      },
    })

    const record = events.find((event) => event.kind === 'sacramental_record')
    expect(record?.label).toBe('Sacramental record created')
    expect(record?.detail).toBe('For Lucia Smith')
  })

  it('uses funeral-specific confirmed label', () => {
    const events = buildRequestTimeline({
      ...baseInput,
      request: {
        created_at: '2026-06-01T10:00:00.000Z',
        request_type: 'funeral',
      },
      scheduleRow: {
        request_type: 'funeral',
        funeral_detail: { confirmed_service_at: '2026-06-10T11:00:00.000Z' },
      },
    })

    const confirmed = events.find((event) => event.kind === 'confirmed_date')
    expect(confirmed?.label).toBe('Funeral service confirmed')
  })
})

describe('isEmailSentCommunication', () => {
  it('detects automated email log rows', () => {
    expect(
      isEmailSentCommunication({
        id: '1',
        method: 'email',
        notes: 'Email sent: Subject line',
      })
    ).toBe(true)
  })

  it('treats other email logs as communication', () => {
    expect(
      isEmailSentCommunication({
        id: '1',
        method: 'email',
        notes: 'Discussed dates by email',
      })
    ).toBe(false)
  })
})

describe('communicationMethodLabel', () => {
  it('maps known methods to plain language', () => {
    expect(communicationMethodLabel('in_person')).toBe('In person')
    expect(communicationMethodLabel('text')).toBe('Text message')
  })
})
