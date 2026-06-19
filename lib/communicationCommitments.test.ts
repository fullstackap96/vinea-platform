import { describe, expect, it } from 'vitest'
import {
  buildCommunicationCommitmentQueue,
  evaluateCommunicationCommitment,
} from '@/lib/communicationCommitments'

const now = new Date(2026, 5, 18, 12, 0, 0, 0)

describe('evaluateCommunicationCommitment', () => {
  it('flags overdue follow-up as staff owing the family', () => {
    const result = evaluateCommunicationCommitment({
      request: {
        id: 'r1',
        status: 'in_progress',
        request_type: 'funeral',
        next_follow_up_date: '2026-06-15',
        last_contacted_at: '2026-06-10T12:00:00.000Z',
        parishioner: { full_name: 'Maria Santos' },
      },
      communications: [{ contacted_at: '2026-06-10T12:00:00.000Z', notes: 'Left voicemail.' }],
      now,
    })

    expect(result?.status).toBe('staff_owes_family')
    expect(result?.tone).toBe('urgent')
    expect(result?.title).toContain('Staff owes')
    expect(result?.latestContext).toContain('Left voicemail')
  })

  it('uses waiting_on to identify family commitments', () => {
    const result = evaluateCommunicationCommitment({
      request: {
        id: 'r2',
        status: 'in_progress',
        request_type: 'baptism',
        next_follow_up_date: '2026-06-30',
        last_contacted_at: '2026-06-17T12:00:00.000Z',
        waiting_on: 'godparent_paperwork',
        child_name: 'Lucia',
      },
      now,
    })

    expect(result?.status).toBe('waiting_on_family')
    expect(result?.reason.toLowerCase()).toContain('godparent')
  })

  it('uses waiting_on to identify internal decisions', () => {
    const result = evaluateCommunicationCommitment({
      request: {
        id: 'r3',
        status: 'new',
        request_type: 'wedding',
        next_follow_up_date: '2026-06-30',
        last_contacted_at: '2026-06-17T12:00:00.000Z',
        waiting_on: 'priest_availability',
        parishioner: { full_name: 'Anna Lee' },
      },
      notes: [{ body: 'Need Fr. Paul to confirm availability.', created_at: '2026-06-17T13:00:00.000Z' }],
      now,
    })

    expect(result?.status).toBe('internal_decision')
    expect(result?.latestContext).toContain('Fr. Paul')
  })

  it('surfaces stale communication in the queue', () => {
    const queue = buildCommunicationCommitmentQueue(
      [
        {
          id: 'stale',
          status: 'in_progress',
          request_type: 'ocia',
          last_contacted_at: '2026-06-01T12:00:00.000Z',
          next_follow_up_date: '2026-06-30',
          parishioner: { full_name: 'Sam Rivera' },
        },
        {
          id: 'clear',
          status: 'in_progress',
          request_type: 'baptism',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-30',
          parishioner: { full_name: 'Clear Row' },
        },
      ],
      { now }
    )

    expect(queue.rows.map((row) => row.requestId)).toEqual(['stale'])
    expect(queue.summary.stale).toBe(1)
  })
})
