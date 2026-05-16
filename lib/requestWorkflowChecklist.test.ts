import { describe, expect, it } from 'vitest'
import { buildRequestWorkflowChecklist } from './requestWorkflowChecklist'

describe('buildRequestWorkflowChecklist', () => {
  it('marks schedule as not applicable for join parish', () => {
    const items = buildRequestWorkflowChecklist({
      request: {
        status: 'new',
        request_type: 'join_parish',
        assigned_staff_name: null,
        assigned_priest_name: null,
        assigned_deacon_name: null,
        next_follow_up_date: null,
        last_contacted_at: null,
      },
      scheduleRow: { request_type: 'join_parish' },
      hasRecipientEmail: true,
    })
    const scheduled = items.find((i) => i.key === 'scheduled')
    expect(scheduled?.state).toBe('not_applicable')
  })

  it('links incomplete assignment to assignment section', () => {
    const items = buildRequestWorkflowChecklist({
      request: {
        status: 'in_progress',
        request_type: 'baptism',
        assigned_staff_name: null,
        assigned_priest_name: null,
        assigned_deacon_name: null,
        next_follow_up_date: '2026-06-01',
        last_contacted_at: '2026-05-01T12:00:00Z',
      },
      scheduleRow: { request_type: 'baptism', confirmed_baptism_date: null },
      hasRecipientEmail: true,
    })
    const assigned = items.find((i) => i.key === 'assigned')
    expect(assigned?.state).toBe('incomplete')
    expect(assigned?.sectionId).toBe('assignment')
  })
})
