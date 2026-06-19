import { describe, expect, it } from 'vitest'
import { buildParishOpsBrief } from '@/lib/parishOpsBrief'

const now = new Date('2026-06-18T12:00:00.000Z')

describe('buildParishOpsBrief', () => {
  it('prioritizes urgent action and unassigned ownership', () => {
    const brief = buildParishOpsBrief(
      [
        {
          id: 'urgent',
          status: 'new',
          request_type: 'funeral',
          created_at: '2026-06-10T12:00:00.000Z',
          next_follow_up_date: '2026-06-10',
          assigned_staff_name: '',
          funeral_detail: { confirmed_service_at: '2026-06-21T15:00:00.000Z' },
        },
        {
          id: 'steady',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-15T12:00:00.000Z',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          assigned_staff_name: 'Jane',
          confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
        },
      ],
      { now }
    )

    expect(brief.headline).toContain('needs action today')
    expect(brief.items.find((item) => item.key === 'act_now')?.value).toBe(1)
    expect(brief.items.find((item) => item.key === 'unassigned')?.value).toBe(1)
    expect(brief.today.firstContactNeeded).toBe(1)
    expect(brief.today.overdueFollowUps).toBe(1)
    expect(brief.today.urgentFunerals).toBe(1)
    expect(brief.focusItems[0]).toMatchObject({
      requestId: 'urgent',
      requestTypeLabel: 'Funeral',
      nextStepTitle: 'Assign ownership',
      ownerLabel: 'Unassigned',
    })
    expect(brief.focusItems[0].href).toContain('/dashboard/requests/urgent#')
    expect(brief.firstAction).toBe('Assign ownership: Unnamed contact')
    expect(brief.huddleNote).toContain('Parish ops brief: 1 request needs action today')
    expect(brief.huddleNote).toContain('First action: Assign ownership: Unnamed contact')
    expect(brief.huddleNote).toContain('Act now: 1 | Unassigned: 1 | Blocked: 0 | Aging: 0')
    expect(brief.huddleNote).toContain('Today: first contact 1 | due today 0 | overdue 1')
  })

  it('surfaces blockers when there is no urgent work', () => {
    const brief = buildParishOpsBrief(
      [
        {
          id: 'blocked',
          status: 'in_progress',
          request_type: 'wedding',
          created_at: '2026-06-16T12:00:00.000Z',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          waiting_on: 'documents',
          assigned_staff_name: 'Jane',
          wedding_detail: { confirmed_ceremony_at: '2026-08-01T17:00:00.000Z' },
        },
      ],
      { now }
    )

    expect(brief.headline).toContain('is blocked')
    expect(brief.items.find((item) => item.key === 'blocked')?.value).toBe(1)
    expect(brief.today.blocked).toBe(1)
    expect(brief.today.missingConfirmedSchedules).toBe(0)
    expect(brief.items.find((item) => item.key === 'blocked')?.severity).toBe('warning')
    expect(brief.focusItems[0].blockerLabel).toBe('Documents')
    expect(brief.huddleNote).toContain(
      'Wedding: Unnamed contact - Waiting for documents (Log contact; owner: Jane; blocker: Documents)'
    )
  })
})
