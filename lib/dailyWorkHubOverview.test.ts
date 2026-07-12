import { describe, expect, it } from 'vitest'
import { buildCareCadenceQueue } from '@/lib/careCadence'
import { buildCommunicationCommitmentQueue } from '@/lib/communicationCommitments'
import { buildDailyWorkHubOverview } from '@/lib/dailyWorkHubOverview'
import { buildStaffWorkloadRows } from '@/lib/dashboardStaffWorkload'
import { buildParishOpsBrief } from '@/lib/parishOpsBrief'
import { buildStaffCommandCenterRows } from '@/lib/staffCommandCenter'

const now = new Date('2026-06-18T10:00:00.000')

const requests = [
  {
    id: 'funeral-overdue',
    status: 'new',
    request_type: 'funeral',
    created_at: '2026-06-16T10:00:00.000Z',
    next_follow_up_date: '2026-06-17',
    assigned_staff_name: '',
    parishioner: { full_name: 'Ana Lopez' },
    funeral_detail: {
      deceased_name: 'Carlos Lopez',
      confirmed_service_at: '2026-06-24T15:00:00.000Z',
    },
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
    id: 'wedding-complete',
    status: 'complete',
    request_type: 'wedding',
    created_at: '2026-06-10T10:00:00.000Z',
    last_contacted_at: '2026-06-11T10:00:00.000Z',
    assigned_staff_name: 'Elena',
    checklist_incomplete: true,
    checklist_incomplete_count: 9,
    wedding_detail: { confirmed_ceremony_at: '2026-08-01T17:00:00.000Z' },
  },
]

function buildOverview() {
  return buildDailyWorkHubOverview({
    now,
    requests,
    staffCommandCenter: buildStaffCommandCenterRows(requests, { now }),
    parishOpsBrief: buildParishOpsBrief(requests, { now }),
    staffWorkloadRows: buildStaffWorkloadRows(requests, now),
    careCadence: buildCareCadenceQueue(requests, { now }),
    communicationCommitments: buildCommunicationCommitmentQueue(requests, { now }),
    operatingSignals: {
      duplicateCandidateCount: 2,
      incompleteSacramentalRecordCount: 1,
      certificateReadyCount: 3,
      linkedSacramentalRecordCount: 4,
      unlinkedSacramentalRecordCount: 1,
      certificateActivityCount: 2,
    },
  })
}

describe('buildDailyWorkHubOverview', () => {
  it('summarizes morning priorities from existing dashboard signals', () => {
    const overview = buildOverview()
    const metrics = Object.fromEntries(overview.metrics.map((metric) => [metric.key, metric]))
    const watchItems = Object.fromEntries(overview.watchItems.map((item) => [item.key, item]))

    expect(overview.greeting).toBe('Good morning')
    expect(overview.headline).toContain('Start with')
    expect(metrics.attention_today.value).toBe(1)
    expect(metrics.overdue_followups.value).toBe(1)
    expect(metrics.blocked.value).toBe(1)
    expect(metrics.unassigned.value).toBe(1)
    expect(watchItems.documents_checklist.value).toBe(2)
    expect(watchItems.communications.value).toBeGreaterThanOrEqual(1)
    expect(watchItems.missing_dates.value).toBe(1)
    expect(watchItems.workload_balance.value).toBe('Steady')
    expect(watchItems.workload_balance.detail).toContain('No staff member')
  })

  it('surfaces read-only Catholic records and duplicate review readiness in the daily hub', () => {
    const overview = buildOverview()
    const readyNextItems = Object.fromEntries(
      overview.readyNextItems.map((item) => [item.key, item])
    )

    expect(readyNextItems.duplicate_review).toMatchObject({
      label: 'Duplicate review',
      value: 2,
      href: '/dashboard/people/duplicates',
      tone: 'warning',
    })
    expect(readyNextItems.incomplete_records).toMatchObject({
      label: 'Incomplete sacramental records',
      value: 1,
      href: '/dashboard/records',
      tone: 'warning',
    })
    expect(readyNextItems.certificate_ready).toMatchObject({
      label: 'Certificate-ready review',
      value: 3,
      href: '/dashboard/records',
      tone: 'warning',
    })
    expect(readyNextItems.certificate_ready.detail).toContain('staff certificate review')
  })

  it('adds a read-only request-to-record continuity cue for staff review', () => {
    const overview = buildOverview()

    expect(overview.requestToRecordContinuity).toMatchObject({
      label: 'Request-to-record continuity',
      stateLabel: 'Manual review needed',
      href: '/dashboard/records?continuity=needs_review',
      drilldownLabel: 'Open records needing staff handoff',
      tone: 'warning',
      linkedRecordCount: 4,
      unlinkedRecordCount: 1,
      certificateActivityCount: 2,
    })
    expect(overview.requestToRecordContinuity.detail).toContain(
      'originating Vinea request link'
    )
    expect(overview.requestToRecordContinuity.detail).toContain(
      'Records continuity review queue'
    )
    expect(overview.requestToRecordContinuity.drilldownDetail).toContain(
      'read-only Records continuity review queue'
    )
    expect(overview.requestToRecordContinuity.drilldownDetail).toContain(
      'does not link records or issue certificates'
    )
  })

  it('keeps top actions actionable and tied to owners/request links', () => {
    const overview = buildOverview()

    expect(overview.topActions.length).toBeGreaterThan(0)
    expect(overview.topActions[0]).toMatchObject({
      href: expect.stringContaining('/dashboard/requests/'),
      ownerLabel: expect.any(String),
      urgency: 'urgent',
    })
    expect(overview.firstAction).toBeTruthy()
  })

  it('keeps staff action links dashboard-internal even when upstream cues provide unsafe hrefs', () => {
    const staffCommandCenter = buildStaffCommandCenterRows(requests, { now })
    const parishOpsBrief = buildParishOpsBrief(requests, { now })
    const firstFocusItem = parishOpsBrief.focusItems[0]

    const focusOverview = buildDailyWorkHubOverview({
      now,
      requests,
      staffCommandCenter,
      parishOpsBrief: {
        ...parishOpsBrief,
        focusItems: firstFocusItem
          ? [
              {
                ...firstFocusItem,
                href: 'https://outside.example/export.csv',
              },
            ]
          : [],
      },
      staffWorkloadRows: buildStaffWorkloadRows(requests, now),
      careCadence: buildCareCadenceQueue(requests, { now }),
      communicationCommitments: buildCommunicationCommitmentQueue(requests, { now }),
    })

    expect(focusOverview.topActions[0]?.href).toBe('/dashboard/requests')

    const fallbackOverview = buildDailyWorkHubOverview({
      now,
      requests,
      staffCommandCenter: {
        ...staffCommandCenter,
        rows: staffCommandCenter.rows.map((row, index) => ({
          ...row,
          detailHref: index === 0 ? 'javascript:alert(1)' : row.detailHref,
        })),
      },
      parishOpsBrief: {
        ...parishOpsBrief,
        focusItems: [],
      },
      staffWorkloadRows: buildStaffWorkloadRows(requests, now),
      careCadence: buildCareCadenceQueue(requests, { now }),
      communicationCommitments: buildCommunicationCommitmentQueue(requests, { now }),
    })

    expect(fallbackOverview.topActions[0]?.href).toBe('/dashboard/requests')
    for (const href of [
      ...focusOverview.topActions.map((item) => item.href),
      ...fallbackOverview.topActions.map((item) => item.href),
      ...focusOverview.readyNextItems.map((item) => item.href),
      focusOverview.requestToRecordContinuity.href,
    ]) {
      expect(href).toMatch(/^\/dashboard(?:$|[/?#])/)
      expect(href).not.toContain('://')
      expect(href).not.toContain('//')
      expect(href).not.toContain('javascript:')
      expect(href).not.toContain('/api')
    }
  })

  it('marks records/certificates as read-only and calendar conflicts as future work', () => {
    const overview = buildOverview()
    const futureSignals = Object.fromEntries(
      overview.futureSignals.map((signal) => [signal.key, signal])
    )

    expect(futureSignals.records_certificates.statusLabel).toBe('Live read-only signal')
    expect(futureSignals.records_certificates.detail).toContain('without changing records')
    expect(futureSignals.records_certificates.detail).toContain('request-to-record continuity')
    expect(futureSignals.calendar_conflicts.statusLabel).toBe('Needs evidence')
    expect(futureSignals.calendar_conflicts.detail).toContain('separate safe integration slice')
  })
})
