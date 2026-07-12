import { describe, expect, it } from 'vitest'
import { buildOperationalIntelligenceBrief } from './operationalIntelligenceBrief'
import { STAFF_WORKLOAD_UNASSIGNED_LABEL } from './dashboardStaffWorkload'
import type { CommunicationCommitmentQueue } from './communicationCommitments'
import type { StaffCommandCenterResult } from './staffCommandCenter'

const now = new Date('2026-07-02T15:00:00.000Z')

function commandCenter(summary?: Partial<StaffCommandCenterResult['summary']>): StaffCommandCenterResult {
  return {
    rows: [],
    summary: {
      actNow: 0,
      blocked: 0,
      aging: 0,
      upcoming: 0,
      ...summary,
    },
  }
}

function communications(
  summary?: Partial<CommunicationCommitmentQueue['summary']>
): CommunicationCommitmentQueue {
  return {
    rows: [],
    summary: {
      repliesOwed: 0,
      internalDecisions: 0,
      waitingOnFamily: 0,
      stale: 0,
      ...summary,
    },
  }
}

describe('buildOperationalIntelligenceBrief', () => {
  it('surfaces the request type where work is slowing down', () => {
    const brief = buildOperationalIntelligenceBrief({
      now,
      requests: [
        {
          id: 'baptism-1',
          request_type: 'baptism',
          status: 'intake',
          created_at: '2026-06-12T15:00:00.000Z',
          next_follow_up_date: '2026-06-30',
          checklist_incomplete_count: 3,
          assigned_staff_name: 'Maria',
        },
        {
          id: 'baptism-2',
          request_type: 'baptism',
          status: 'in_progress',
          created_at: '2026-06-20T15:00:00.000Z',
          checklist_incomplete: true,
          assigned_staff_name: 'Maria',
        },
        {
          id: 'ocia-1',
          request_type: 'ocia',
          status: 'intake',
          created_at: '2026-07-01T15:00:00.000Z',
          assigned_staff_name: 'Thomas',
        },
      ],
      staffCommandCenter: commandCenter({ actNow: 1, aging: 1 }),
      staffWorkloadRows: [
        {
          staffDisplay: 'Maria',
          openRequests: 4,
          overdueFollowUps: 1,
          actionRequired: 3,
          blockedRequests: 1,
          agingRequests: 2,
          upcomingScheduled: 0,
        },
      ],
      communicationCommitments: communications({ repliesOwed: 1, internalDecisions: 1 }),
      operatingSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 2,
        certificateReadyCount: 1,
      },
    })

    expect(brief.headline).toBe('Request type bottleneck needs the first look.')
    expect(brief.primaryBottleneck.value).toBe('Baptism')
    expect(brief.primaryBottleneck.reason).toContain('2 open requests')
    expect(brief.primaryBottleneck.reason).toContain('1 overdue follow-up')
    expect(brief.nextActions[0].detail).toContain('oldest baptism requests')
  })

  it('calls out ownership before routine work when unassigned requests exist', () => {
    const brief = buildOperationalIntelligenceBrief({
      now,
      requests: [
        {
          id: 'wedding-1',
          request_type: 'wedding',
          status: 'intake',
          created_at: '2026-07-02T14:00:00.000Z',
          assigned_staff_name: '',
        },
      ],
      staffCommandCenter: commandCenter(),
      staffWorkloadRows: [
        {
          staffDisplay: STAFF_WORKLOAD_UNASSIGNED_LABEL,
          openRequests: 3,
          overdueFollowUps: 0,
          actionRequired: 0,
          blockedRequests: 0,
          agingRequests: 0,
          upcomingScheduled: 0,
        },
      ],
      communicationCommitments: communications(),
      operatingSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 0,
        certificateReadyCount: 0,
      },
    })

    const workload = brief.insights.find((insight) => insight.key === 'workload_balance')
    expect(workload?.tone).toBe('urgent')
    expect(workload?.value).toBe('3 unassigned')
    expect(workload?.recommendedAction).toContain('Assign owners')
  })

  it('surfaces request-to-record continuity as a records bottleneck without linking records', () => {
    const brief = buildOperationalIntelligenceBrief({
      now,
      requests: [],
      staffCommandCenter: commandCenter(),
      staffWorkloadRows: [],
      communicationCommitments: communications(),
      operatingSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 0,
        certificateReadyCount: 0,
        linkedSacramentalRecordCount: 4,
        unlinkedSacramentalRecordCount: 2,
        certificateActivityCount: 1,
      },
    })

    const records = brief.insights.find((insight) => insight.key === 'records_documents')

    expect(brief.primaryBottleneck.key).toBe('records_documents')
    expect(records?.reason).toContain('2 request-to-record continuity review items')
    expect(records?.recommendedAction).toContain('verify request links manually')
    expect(records?.href).toBe('/dashboard/records?continuity=needs_review')
    expect(brief.nextActions[0]).toMatchObject({
      key: 'records_documents',
      href: '/dashboard/records?continuity=needs_review',
    })
    expect(brief.coverageNotes.join(' ')).toContain('change records')
  })

  it('keeps records and documents actionable when continuity is clear but other review work exists', () => {
    const brief = buildOperationalIntelligenceBrief({
      now,
      requests: [],
      staffCommandCenter: commandCenter(),
      staffWorkloadRows: [],
      communicationCommitments: communications(),
      operatingSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 1,
        certificateReadyCount: 1,
        linkedSacramentalRecordCount: 3,
        unlinkedSacramentalRecordCount: 0,
        certificateActivityCount: 1,
      },
    })

    const records = brief.insights.find((insight) => insight.key === 'records_documents')

    expect(records?.reason).toContain('no request-to-record continuity review items')
    expect(records?.recommendedAction).toContain('No continuity review items are visible')
    expect(records?.href).toBe('/dashboard/records')
  })

  it('keeps the brief read-only and non-decisional when signals are steady', () => {
    const brief = buildOperationalIntelligenceBrief({
      now,
      requests: [],
      staffCommandCenter: commandCenter(),
      staffWorkloadRows: [],
      communicationCommitments: communications(),
      operatingSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 0,
        certificateReadyCount: 0,
      },
    })

    expect(brief.headline).toBe('No major bottleneck is visible right now.')
    expect(brief.nextActions[0].title).toBe('Keep the morning review short')
    const records = brief.insights.find((insight) => insight.key === 'records_documents')
    expect(records?.value).toBe('No continuity review')
    expect(records?.reason).toContain(
      'No sacramental records in the selected parish currently need request-to-record continuity review'
    )
    expect(records?.recommendedAction).toContain('no Records continuity review queue item is visible')
    expect(brief.coverageNotes.join(' ')).toContain('read-only guidance')
    expect(brief.coverageNotes.join(' ')).toContain(
      'no selected-parish sacramental record rows currently need request-link review'
    )
    expect(brief.coverageNotes.join(' ')).toContain('does not send reminders')
    expect(brief.coverageNotes.join(' ')).toContain('make sacramental/canonical decisions')

    const allLinks = [
      brief.primaryBottleneck.href,
      ...brief.insights.map((insight) => insight.href),
      ...brief.nextActions.map((action) => action.href),
    ].filter((href): href is string => Boolean(href))
    expect(allLinks.length).toBeGreaterThan(0)
    expect(allLinks.every((href) => href.startsWith('/dashboard'))).toBe(true)
    expect(allLinks.some((href) => href.includes('://'))).toBe(false)
    expect(allLinks.some((href) => href.startsWith('//'))).toBe(false)
    expect(allLinks.some((href) => href.startsWith('/api'))).toBe(false)
    expect(allLinks.some((href) => href.toLowerCase().includes('javascript:'))).toBe(false)
  })
})
