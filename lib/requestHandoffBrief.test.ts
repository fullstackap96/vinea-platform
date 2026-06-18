import { describe, expect, it } from 'vitest'
import { buildRequestHandoffBrief } from '@/lib/requestHandoffBrief'

const now = new Date('2026-06-18T12:00:00.000Z')

describe('buildRequestHandoffBrief', () => {
  it('summarizes urgent unowned blocked work for staff handoff', () => {
    const brief = buildRequestHandoffBrief({
      request: {
        status: 'new',
        request_type: 'funeral',
        created_at: '2026-06-10T12:00:00.000Z',
        next_follow_up_date: '2026-06-12',
        waiting_on: 'documents',
        waiting_on_changed_at: '2026-06-10T12:00:00.000Z',
        parishioner: { full_name: 'Maria Santos' },
      },
      scheduleRow: {
        request_type: 'funeral',
        funeral_detail: { confirmed_service_at: null },
      },
      checklistIncomplete: true,
      remainingChecklistCount: 3,
      notesCount: 2,
      communicationsCount: 0,
      now,
      funeralDetail: { deceased_name: 'Jose Santos' },
    })

    expect(brief.title).toBe('Jose Santos')
    expect(brief.nextAction).toContain('Assign')
    expect(brief.ownerLine).toBe('No owner assigned yet.')
    expect(brief.blockerLine).toBe('Waiting on: Documents for 8 days.')
    expect(brief.followUpLine).toContain('Past due')
    expect(brief.checklistLine).toBe('3 checklist items still open.')
    expect(brief.riskLine).toContain('CRITICAL risk')
    expect(brief.careLine).toBe('No logged family contact yet.')
  })

  it('summarizes steady owned work without false blockers', () => {
    const brief = buildRequestHandoffBrief({
      request: {
        status: 'in_progress',
        request_type: 'wedding',
        created_at: '2026-06-15T12:00:00.000Z',
        last_contacted_at: '2026-06-18T09:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        assigned_staff_name: 'Jane',
        assigned_priest_name: 'Fr. Paul',
        parishioner: { full_name: 'Anna Lee' },
      },
      scheduleRow: {
        request_type: 'wedding',
        wedding_detail: { confirmed_ceremony_at: '2026-08-01T17:00:00.000Z' },
      },
      checklistIncomplete: false,
      remainingChecklistCount: 0,
      notesCount: 1,
      communicationsCount: 2,
      now,
      weddingDetail: { partner_one_name: 'Anna Lee', partner_two_name: 'Mark Cruz' },
    })

    expect(brief.title).toBe('Anna Lee & Mark Cruz')
    expect(brief.ownerLine).toBe('Staff: Jane | Priest: Fr. Paul')
    expect(brief.blockerLine).toBe('No blocker recorded.')
    expect(brief.checklistLine).toBe('Checklist is complete.')
    expect(brief.riskLine).toBe('No at-risk signals detected.')
    expect(brief.careLine).toContain('Last contact was today')
    expect(brief.nextActionHref).toMatch(/^#/)
  })
})
