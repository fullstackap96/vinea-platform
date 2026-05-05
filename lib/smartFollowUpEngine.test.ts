import { describe, expect, it } from 'vitest'
import {
  evaluateSmartFollowUp,
  type SmartFollowUpDashboardRow,
} from './smartFollowUpEngine'

/** Local calendar 2026-06-15 (matches `todayCalendarDateString` semantics). */
const frozenNow = new Date(2026, 5, 15, 12, 0, 0, 0)

function row(partial: SmartFollowUpDashboardRow): SmartFollowUpDashboardRow {
  return partial
}

describe('evaluateSmartFollowUp', () => {
  it('marks complete requests as ready_to_complete', () => {
    const r = evaluateSmartFollowUp(
      row({ status: 'complete', next_follow_up_date: '2020-01-01' }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('ready_to_complete')
    expect(r.urgency).toBe('low')
    expect(r.sortPriority).toBeGreaterThan(100)
  })

  it('detects overdue next_follow_up_date', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-10',
        assigned_staff_name: 'Jane',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-08-01',
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('overdue')
    expect(r.urgency).toMatch(/high|critical/)
    expect(r.sortPriority).toBeLessThan(30)
  })

  it('detects due today', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-15',
        assigned_staff_name: 'Jane',
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('due_today')
    expect(r.urgency).toMatch(/medium|high/)
    expect(r.sortPriority).toBeLessThan(60)
  })

  it('treats waiting_on before unassigned and due_soon', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-16',
        waiting_on: 'family_response',
        assigned_staff_name: '',
        request_type: 'baptism',
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('waiting')
    expect(r.description.toLowerCase()).toContain('family')
  })

  it('flags unassigned staff when not blocked on waiting or calendar', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        assigned_staff_name: '',
        next_follow_up_date: '2026-08-01',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-09-01',
        last_contacted_at: frozenNow.toISOString(),
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('unassigned')
    expect(r.recommendedAction.toLowerCase()).toContain('assign')
  })

  it('uses due_soon for follow-up within 3 calendar days (exclusive of today)', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-17',
        assigned_staff_name: 'Jane',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-09-01',
        last_contacted_at: frozenNow.toISOString(),
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('due_soon')
    expect(r.label).toMatch(/soon/i)
  })

  it('does not label due_soon when follow-up is more than 3 days out', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-20',
        assigned_staff_name: 'Jane',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-09-01',
        last_contacted_at: frozenNow.toISOString(),
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('on_track')
    expect(r.description).toContain('2026-06-20')
  })

  it('escalates overdue + missing confirmed toward critical', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        next_follow_up_date: '2026-06-01',
        assigned_staff_name: 'Jane',
        request_type: 'baptism',
        confirmed_baptism_date: null,
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('overdue')
    expect(r.urgency).toBe('critical')
    expect(r.sortPriority).toBeLessThan(15)
  })

  it('mentions priest gap for funeral when staff is unassigned', () => {
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        assigned_staff_name: '',
        assigned_priest_name: '',
        request_type: 'funeral',
        funeral_detail: { confirmed_service_at: '2026-07-01T10:00:00.000Z' },
        next_follow_up_date: '2026-09-01',
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('unassigned')
    expect(r.description.toLowerCase()).toContain('priest')
  })

  it('treats stale last_contacted_at on otherwise calm rows', () => {
    const old = new Date(2026, 0, 1, 12, 0, 0, 0).toISOString()
    const r = evaluateSmartFollowUp(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        next_follow_up_date: '2026-12-01',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-09-01',
        last_contacted_at: old,
      }),
      { now: frozenNow }
    )
    expect(r.followUpStatus).toBe('on_track')
    expect(r.urgency).toBe('medium')
    expect(r.description.toLowerCase()).toContain('contact')
  })
})
