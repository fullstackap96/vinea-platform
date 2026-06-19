import { describe, expect, it } from 'vitest'
import { buildRequestPlaybookProgress } from '@/lib/requestPlaybookProgress'

describe('buildRequestPlaybookProgress', () => {
  it('points a funeral request toward confirming the service when intake is underway', () => {
    const progress = buildRequestPlaybookProgress({
      request: {
        request_type: 'funeral',
        assigned_staff_name: 'Jane',
        last_contacted_at: '2026-06-19T10:00:00.000Z',
      },
      parishioner: { email: 'family@example.com' },
      communications: [{ id: 'c1' }],
      checklistItems: [{ item_name: 'Coordinate date, time, and logistics with funeral home' }],
      funeralDetail: {
        deceased_name: 'Jose Santos',
        funeral_home: 'Santos Funeral Home',
      },
      scheduleRow: {
        request_type: 'funeral',
        funeral_detail: { confirmed_service_at: null },
      },
    })

    expect(progress?.requestType).toBe('funeral')
    expect(progress?.nextStep?.key).toBe('confirmed-service')
    expect(progress?.nextStep?.anchor).toBe('confirmed-time')
    expect(progress?.completionPercent).toBeGreaterThan(40)
  })

  it('counts baptism schedule, assignment, contact, and record progress without schema changes', () => {
    const progress = buildRequestPlaybookProgress({
      request: {
        request_type: 'baptism',
        child_name: 'Lucia Cruz',
        assigned_staff_name: 'Maria',
        last_contacted_at: '2026-06-18T10:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        confirmed_baptism_date: '2026-07-04T15:00:00.000Z',
      },
      parishioner: { phone: '555-0100' },
      checklistItems: [
        { item_name: 'Confirm parent baptism preparation class completion' },
      ],
      sacramentalRecord: { person_name: 'Lucia Cruz' },
      scheduleRow: {
        request_type: 'baptism',
        confirmed_baptism_date: '2026-07-04T15:00:00.000Z',
      },
    })

    expect(progress?.completeCount).toBe(7)
    expect(progress?.totalCount).toBe(8)
    expect(progress?.nextStep?.key).toBe('baptism-documents')
  })

  it('lets completed checklist items satisfy wedding document playbook steps', () => {
    const progress = buildRequestPlaybookProgress({
      request: {
        request_type: 'wedding',
        assigned_priest_name: 'Fr. Thomas',
        last_contacted_at: '2026-06-19T10:00:00.000Z',
        next_follow_up_date: '2026-06-26',
      },
      parishioner: { email: 'couple@example.com' },
      checklistItems: [
        { item_name: 'Collect marriage preparation documents and certificates' },
        { item_name: 'Track required marriage preparation sessions', is_complete: false },
      ],
      weddingDetail: {
        partner_one_name: 'Ana',
        ceremony_notes: 'Nuptial Mass with rehearsal Friday.',
      },
      scheduleRow: {
        request_type: 'wedding',
        wedding_detail: { confirmed_ceremony_at: '2026-08-01T18:00:00.000Z' },
      },
    })

    const documents = progress?.phases
      .find((phase) => phase.name === 'Documents')
      ?.steps.find((step) => step.key === 'marriage-documents')

    expect(documents?.complete).toBe(true)
    expect(progress?.nextStep).toBeNull()
  })
})
