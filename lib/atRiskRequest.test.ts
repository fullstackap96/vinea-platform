import { describe, expect, it } from 'vitest'
import { evaluateAtRiskRequest, type AtRiskDashboardRow } from './atRiskRequest'

const now = new Date(2026, 5, 20, 12, 0, 0, 0)

function row(partial: AtRiskDashboardRow): AtRiskDashboardRow {
  return partial
}

describe('evaluateAtRiskRequest', () => {
  it('never marks complete requests at risk', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'complete',
        assigned_staff_name: '',
        next_follow_up_date: '2020-01-01',
        created_at: '2020-01-01T00:00:00.000Z',
      }),
      { now }
    )
    expect(r.isAtRisk).toBe(false)
    expect(r.riskReasons).toHaveLength(0)
    expect(r.highestRiskLevel).toBe('low')
  })

  it('flags unassigned staff as medium risk', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: '',
        created_at: new Date(2026, 5, 18, 12, 0, 0).toISOString(),
        last_contacted_at: new Date(2026, 5, 19, 12, 0, 0).toISOString(),
        next_follow_up_date: '2026-07-01',
      }),
      { now }
    )
    expect(r.isAtRisk).toBe(true)
    expect(r.riskReasons.some((x) => x.includes('staff'))).toBe(true)
    expect(r.highestRiskLevel).toBe('medium')
  })

  it('flags overdue follow-up as high risk', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        next_follow_up_date: '2026-06-10',
        created_at: new Date(2026, 5, 1).toISOString(),
        last_contacted_at: new Date(2026, 5, 15).toISOString(),
      }),
      { now }
    )
    expect(r.isAtRisk).toBe(true)
    expect(r.riskReasons.some((x) => x.includes('past'))).toBe(true)
    expect(r.highestRiskLevel).toBe('high')
  })

  it('flags no first contact after three days as high risk', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        created_at: new Date(2026, 5, 10, 12, 0, 0).toISOString(),
        last_contacted_at: null,
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(r.isAtRisk).toBe(true)
    expect(r.riskReasons.some((x) => x.toLowerCase().includes('first contact'))).toBe(
      true
    )
    expect(r.highestRiskLevel).toBe('high')
  })

  it('does not flag missing contact before three days from intake', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        created_at: new Date(2026, 5, 19, 12, 0, 0).toISOString(),
        last_contacted_at: null,
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(r.riskReasons.some((x) => x.toLowerCase().includes('first contact'))).toBe(
      false
    )
  })

  it('applies long waiting_on only when a start timestamp is present', () => {
    const withTs = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        waiting_on: 'family_response',
        waiting_on_since: new Date(2026, 5, 1, 12, 0, 0).toISOString(),
        created_at: new Date(2026, 5, 10).toISOString(),
        last_contacted_at: new Date(2026, 5, 11).toISOString(),
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(withTs.riskReasons.some((x) => x.includes('seven days'))).toBe(true)
    expect(withTs.highestRiskLevel).toBe('medium')

    const withoutTs = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        waiting_on: 'family_response',
        created_at: new Date(2026, 5, 10).toISOString(),
        last_contacted_at: new Date(2026, 5, 11).toISOString(),
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(withoutTs.riskReasons.some((x) => x.includes('seven days'))).toBe(false)
  })

  it('elevates long waiting_on to high when follow-up is overdue or staff is missing', () => {
    const overdue = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        waiting_on: 'documents',
        waiting_on_since: new Date(2026, 5, 1).toISOString(),
        created_at: new Date(2026, 5, 10).toISOString(),
        last_contacted_at: new Date(2026, 5, 11).toISOString(),
        next_follow_up_date: '2026-06-10',
      }),
      { now }
    )
    expect(overdue.highestRiskLevel).toBe('high')

    const unassigned = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: '',
        waiting_on: 'documents',
        waiting_on_since: new Date(2026, 5, 1).toISOString(),
        created_at: new Date(2026, 5, 10).toISOString(),
        last_contacted_at: new Date(2026, 5, 11).toISOString(),
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(unassigned.highestRiskLevel).toBe('high')
  })

  it('uses critical when multiple high-tier rules fire', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        created_at: new Date(2026, 5, 10, 12, 0, 0).toISOString(),
        last_contacted_at: null,
        next_follow_up_date: '2026-06-10',
      }),
      { now }
    )
    expect(r.highestRiskLevel).toBe('critical')
    expect(r.riskReasons.length).toBeGreaterThanOrEqual(2)
  })

  it('accepts waiting_on_changed_at as the wait start', () => {
    const r = evaluateAtRiskRequest(
      row({
        status: 'new',
        assigned_staff_name: 'Jane',
        waiting_on: 'other',
        waiting_on_changed_at: new Date(2026, 5, 1).toISOString(),
        created_at: new Date(2026, 5, 10).toISOString(),
        last_contacted_at: new Date(2026, 5, 11).toISOString(),
        next_follow_up_date: '2026-08-01',
      }),
      { now }
    )
    expect(r.riskReasons.some((x) => x.includes('seven days'))).toBe(true)
  })
})
