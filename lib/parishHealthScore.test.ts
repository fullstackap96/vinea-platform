import { describe, expect, it } from 'vitest'
import { buildCareCadenceQueue } from '@/lib/careCadence'
import { buildCommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import { buildStaffWorkloadRows } from '@/lib/dashboardStaffWorkload'
import { buildParishOpsBrief } from '@/lib/parishOpsBrief'
import { buildParishHealthScore } from '@/lib/parishHealthScore'
import { buildStaffCommandCenterRows } from '@/lib/staffCommandCenter'

const now = new Date('2026-06-18T10:00:00.000Z')

function buildScore(requests: readonly Record<string, unknown>[]) {
  return buildParishHealthScore({
    now,
    requests,
    staffCommandCenter: buildStaffCommandCenterRows(requests, { now }),
    parishOpsBrief: buildParishOpsBrief(requests, { now }),
    staffWorkloadRows: buildStaffWorkloadRows(requests, now),
    careCadence: buildCareCadenceQueue(requests, { now }),
    communicationCommitments: buildCommunicationCommitmentQueue(requests, { now }),
  })
}

describe('buildParishHealthScore', () => {
  it('lowers the score for visible parish-office risk and explains every factor', () => {
    const score = buildScore([
      {
        id: 'funeral-overdue',
        status: 'new',
        request_type: 'funeral',
        created_at: '2026-06-12T10:00:00.000Z',
        next_follow_up_date: '2026-06-17',
        assigned_staff_name: '',
        parishioner: { full_name: 'Ana Lopez' },
        funeral_detail: { confirmed_service_at: '2026-06-24T15:00:00.000Z' },
      },
      {
        id: 'baptism-docs',
        status: 'in_progress',
        request_type: 'baptism',
        created_at: '2026-06-12T10:00:00.000Z',
        last_contacted_at: '2026-06-16T10:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        waiting_on: 'godparent_paperwork',
        assigned_staff_name: 'Elena',
        child_name: 'Mateo Garcia',
        checklist_incomplete: true,
        checklist_incomplete_count: 2,
      },
      {
        id: 'ocia-slow-response',
        status: 'in_progress',
        request_type: 'ocia',
        created_at: '2026-06-10T10:00:00.000Z',
        last_contacted_at: '2026-06-15T10:00:00.000Z',
        next_follow_up_date: '2026-06-26',
        assigned_staff_name: 'Elena',
        parishioner: { full_name: 'Jordan Smith' },
        ocia_detail: { confirmed_session_at: '2026-07-01T19:00:00.000Z' },
      },
      {
        id: 'complete-with-checklist',
        status: 'complete',
        request_type: 'wedding',
        created_at: '2026-06-01T10:00:00.000Z',
        last_contacted_at: '2026-06-02T10:00:00.000Z',
        assigned_staff_name: 'Maria',
        checklist_incomplete: true,
        checklist_incomplete_count: 8,
        wedding_detail: { confirmed_ceremony_at: '2026-08-01T17:00:00.000Z' },
      },
    ])

    const factors = Object.fromEntries(score.factors.map((factor) => [factor.key, factor]))

    expect(score.score).toBeLessThan(100)
    expect(score.tone).not.toBe('healthy')
    expect(factors.overdue_followups.scoreImpact).toBeGreaterThan(0)
    expect(factors.ownership_gaps.valueLabel).toBe('1')
    expect(factors.blocked_work.scoreImpact).toBeGreaterThan(0)
    expect(factors.documents_checklist.valueLabel).toBe('2')
    expect(factors.response_time.valueLabel).toContain('days')
    expect(factors.response_time.scoreImpact).toBeGreaterThan(0)
    expect(score.recommendations.length).toBeGreaterThan(0)
    expect(score.recommendations[0].detail).toBeTruthy()
    expect(score.coverageNotes.map((note) => note.key)).toEqual(['duplicates', 'records_certificates'])
  })

  it('scores read-only duplicate, incomplete record, and certificate-ready operating signals', () => {
    const score = buildParishHealthScore({
      now,
      requests: [],
      staffCommandCenter: buildStaffCommandCenterRows([], { now }),
      parishOpsBrief: buildParishOpsBrief([], { now }),
      staffWorkloadRows: buildStaffWorkloadRows([], now),
      careCadence: buildCareCadenceQueue([], { now }),
      communicationCommitments: buildCommunicationCommitmentQueue([], { now }),
      operatingSignals: {
        duplicateCandidateCount: 3,
        incompleteSacramentalRecordCount: 2,
        certificateReadyCount: 1,
        linkedSacramentalRecordCount: 5,
        unlinkedSacramentalRecordCount: 2,
        certificateActivityCount: 1,
      },
    })

    const factors = Object.fromEntries(score.factors.map((factor) => [factor.key, factor]))

    expect(factors.duplicate_review.valueLabel).toBe('3')
    expect(factors.duplicate_review.recommendedAction).toContain('Review possible duplicate')
    expect(factors.incomplete_records.valueLabel).toBe('2')
    expect(factors.incomplete_records.reason).toContain('missing a date')
    expect(factors.records_continuity.valueLabel).toBe('2')
    expect(factors.records_continuity.reason).toContain('request-to-record continuity review')
    expect(factors.records_continuity.recommendedAction).toContain(
      'verify the originating request link manually'
    )
    expect(factors.records_continuity.href).toBe('/dashboard/records?continuity=needs_review')
    expect(score.recordsContinuityEmptyState).toBeNull()
    expect(factors.certificate_ready.valueLabel).toBe('1')
    expect(factors.certificate_ready.recommendedAction).toContain(
      'does not decide sacramental eligibility'
    )
    expect(score.score).toBeLessThan(100)
    expect(score.coverageNotes.map((note) => note.detail).join(' ')).toContain(
      'No merge or record change'
    )
    expect(score.coverageNotes.map((note) => note.detail).join(' ')).toContain(
      'does not link records'
    )
    expect(score.coverageNotes.map((note) => note.detail).join(' ')).toContain(
      'no selected-parish record rows need request-link review'
    )

    const allLinks = [
      ...score.factors.map((factor) => factor.href),
      ...score.recommendations.map((recommendation) => recommendation.href),
    ].filter((href): href is string => Boolean(href))
    expect(allLinks.length).toBeGreaterThan(0)
    expect(allLinks.every((href) => href.startsWith('/dashboard'))).toBe(true)
    expect(allLinks.some((href) => href.includes('://'))).toBe(false)
    expect(allLinks.some((href) => href.startsWith('//'))).toBe(false)
    expect(allLinks.some((href) => href.startsWith('/api'))).toBe(false)
    expect(allLinks.some((href) => href.toLowerCase().includes('javascript:'))).toBe(false)
  })

  it('returns a calm healthy score when no dashboard risk is visible', () => {
    const score = buildScore([
      {
        id: 'steady-baptism',
        status: 'in_progress',
        request_type: 'baptism',
        created_at: '2026-06-17T10:00:00.000Z',
        last_contacted_at: '2026-06-17T12:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        assigned_staff_name: 'Elena',
        child_name: 'Mateo Garcia',
        confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
      },
    ])

    expect(score.score).toBeGreaterThanOrEqual(85)
    expect(score.tone).toBe('healthy')
    expect(score.recommendations).toHaveLength(0)
    expect(score.factors.every((factor) => factor.scoreImpact === 0)).toBe(true)

    const continuity = score.factors.find((factor) => factor.key === 'records_continuity')
    expect(continuity?.reason).toBe(
      'No sacramental records in the selected parish currently need request-to-record continuity review.'
    )
    expect(continuity?.recommendedAction).toBe(
      'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.'
    )
    expect(score.recordsContinuityEmptyState).toMatchObject({
      statusLabel: 'Continuity clear',
      title: 'No records currently need request-link review',
    })
    expect(score.recordsContinuityEmptyState?.boundary).toContain('does not link records')
  })
})
