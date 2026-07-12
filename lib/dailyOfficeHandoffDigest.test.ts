import { describe, expect, it } from 'vitest'
import { buildDailyOfficeHandoffDigest } from './dailyOfficeHandoffDigest'
import type { OperationalIntelligenceBrief } from './operationalIntelligenceBrief'
import type { ParishHealthScore } from './parishHealthScore'

function healthScore(overrides: Partial<ParishHealthScore> = {}): ParishHealthScore {
  return {
    score: 62,
    tone: 'urgent',
    label: 'At risk',
    headline: 'Operational follow-up risk is high today.',
    subline: 'Use the recommendations to improve it.',
    recordsContinuityEmptyState: null,
    recommendations: [],
    coverageNotes: [],
    factors: [
      {
        key: 'ownership_gaps',
        label: 'Unassigned work',
        valueLabel: '4',
        tone: 'urgent',
        scoreImpact: 14,
        maxImpact: 14,
        reason: '4 open requests need a staff owner.',
        recommendedAction: 'Assign owners before routine request work continues.',
        href: '/dashboard/requests#staff-command-center-heading',
      },
      {
        key: 'records_continuity',
        label: 'Request-to-record continuity',
        valueLabel: '2',
        tone: 'watch',
        scoreImpact: 4,
        maxImpact: 8,
        reason: '2 sacramental records need request-to-record continuity review.',
        recommendedAction:
          'Open the Records continuity review queue before certificate work; staff should verify the originating request link manually.',
        href: '/dashboard/records?continuity=needs_review',
      },
      {
        key: 'duplicate_review',
        label: 'Duplicate review backlog',
        valueLabel: '1',
        tone: 'watch',
        scoreImpact: 2,
        maxImpact: 8,
        reason: '1 possible duplicate candidate needs staff review.',
        recommendedAction:
          'Review possible duplicate people and households before they make records harder to trust.',
        href: '/dashboard/people/duplicates',
      },
    ],
    ...overrides,
  }
}

function operationalIntelligence(
  overrides: Partial<OperationalIntelligenceBrief> = {}
): OperationalIntelligenceBrief {
  return {
    headline: 'Records and documents needs the first look.',
    subline: '1 operational signal should be reviewed before routine work.',
    primaryBottleneck: {
      key: 'records_documents',
      label: 'Records and documents',
      value: '2',
      tone: 'watch',
      reason: '2 request-to-record continuity review items are visible.',
      recommendedAction:
        'Open the Records continuity review queue before certificate work; staff should verify request links manually.',
      href: '/dashboard/records?continuity=needs_review',
    },
    insights: [
      {
        key: 'records_documents',
        label: 'Records and documents',
        value: '2',
        tone: 'watch',
        reason: '2 request-to-record continuity review items are visible.',
        recommendedAction:
          'Open the Records continuity review queue before certificate work; staff should verify request links manually.',
        href: '/dashboard/records?continuity=needs_review',
      },
      {
        key: 'follow_up_reliability',
        label: 'Follow-up reliability',
        value: 'Steady',
        tone: 'healthy',
        reason: 'No overdue follow-ups are visible.',
        recommendedAction: 'Keep reviewing this during the morning check-in.',
      },
    ],
    nextActions: [],
    coverageNotes: [],
    ...overrides,
  }
}

describe('buildDailyOfficeHandoffDigest', () => {
  it('groups existing health and intelligence signals into an office-day rhythm', () => {
    const digest = buildDailyOfficeHandoffDigest({
      parishHealthScore: healthScore(),
      operationalIntelligence: operationalIntelligence(),
    })

    expect(digest.title).toBe('Daily office handoff')
    expect(digest.headline).toContain('staff-reviewed handoff items')
    expect(digest.subline).toContain('urgent')

    const opening = digest.slots.find((slot) => slot.key === 'opening')
    const midday = digest.slots.find((slot) => slot.key === 'midday')
    const beforeClose = digest.slots.find((slot) => slot.key === 'before_close')

    expect(opening?.label).toBe('Opening the office')
    expect(opening?.items[0]).toMatchObject({
      priority: 'urgent',
      title: 'Unassigned work',
      href: '/dashboard/requests#staff-command-center-heading',
    })
    expect(midday?.items.map((item) => item.title)).toEqual([
      'Request-to-record continuity',
      'Records and documents',
    ])
    expect(beforeClose?.items[0]).toMatchObject({
      title: 'Duplicate review backlog',
      source: 'parish_health_score',
    })
  })

  it('stays calm and read-only when no handoff items are visible', () => {
    const digest = buildDailyOfficeHandoffDigest({
      parishHealthScore: healthScore({
        score: 96,
        tone: 'healthy',
        label: 'Healthy',
        headline: 'Parish operations look steady.',
        subline: 'No major operational gaps are visible.',
        factors: [
          {
            key: 'records_continuity',
            label: 'Request-to-record continuity',
            valueLabel: '0',
            tone: 'healthy',
            scoreImpact: 0,
            maxImpact: 8,
            reason:
              'No sacramental records in the selected parish currently need request-to-record continuity review.',
            recommendedAction:
              'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.',
            href: '/dashboard/records?continuity=needs_review',
          },
        ],
      }),
      operationalIntelligence: operationalIntelligence({
        headline: 'No major bottleneck is visible right now.',
        subline: 'The dashboard signals look steady.',
        primaryBottleneck: {
          key: 'records_documents',
          label: 'Records and documents',
          value: 'No continuity review',
          tone: 'healthy',
          reason:
            'No sacramental records in the selected parish currently need request-to-record continuity review.',
          recommendedAction:
            'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.',
        },
        insights: [
          {
            key: 'records_documents',
            label: 'Records and documents',
            value: 'No continuity review',
            tone: 'healthy',
            reason:
              'No sacramental records in the selected parish currently need request-to-record continuity review.',
            recommendedAction:
              'Keep certificate work staff-reviewed; no Records continuity review queue item is visible right now.',
          },
        ],
      }),
    })

    expect(digest.headline).toBe('The daily handoff looks calm right now.')
    expect(digest.slots.every((slot) => slot.items.length === 0)).toBe(true)
    expect(digest.slots.map((slot) => slot.emptyState).join(' ')).toContain(
      'No midday records, document, date, or communication bottleneck is visible right now.'
    )
    expect(digest.coverageNotes.join(' ')).toContain('read-only guidance')
    expect(digest.coverageNotes.join(' ')).toContain('does not send communications')
    expect(digest.coverageNotes.join(' ')).toContain('mutate records')
    expect(digest.coverageNotes.join(' ')).toContain('generate certificates')
    expect(digest.coverageNotes.join(' ')).toContain('not sacramental, canonical')
  })

  it('limits each slot without dropping the staff-reviewed boundary', () => {
    const digest = buildDailyOfficeHandoffDigest({
      parishHealthScore: healthScore({
        factors: [
          ...healthScore().factors,
          {
            key: 'overdue_followups',
            label: 'Overdue follow-ups',
            valueLabel: '2',
            tone: 'urgent',
            scoreImpact: 8,
            maxImpact: 16,
            reason: '2 follow-ups are past due.',
            recommendedAction: 'Start by contacting families with past-due follow-up dates.',
            href: '/dashboard/requests#follow-up-queue-heading',
          },
        ],
      }),
      operationalIntelligence: operationalIntelligence({
        insights: [
          ...operationalIntelligence().insights,
          {
            key: 'workload_balance',
            label: 'Workload balance',
            value: '2 unassigned',
            tone: 'watch',
            reason: '2 open requests need a clear staff owner before handoffs can be trusted.',
            recommendedAction: 'Assign owners before adding new follow-up work.',
            href: '/dashboard/requests#staff-command-center-heading',
          },
        ],
      }),
      maxItemsPerSlot: 1,
    })

    expect(digest.slots.every((slot) => slot.items.length <= 1)).toBe(true)
    expect(digest.coverageNotes.join(' ')).toContain('Staff decide the next step')
    expect(digest.coverageNotes.join(' ')).toContain('does not send communications')
  })

  it('drops unsafe handoff links before dashboard cards can render them', () => {
    const digest = buildDailyOfficeHandoffDigest({
      parishHealthScore: healthScore({
        factors: [
          {
            ...healthScore().factors[0],
            href: 'https://example.test/not-a-dashboard-link',
          },
          {
            ...healthScore().factors[1],
            href: '/api/exports/requests/basic',
          },
          {
            ...healthScore().factors[2],
            href: 'javascript:alert("unsafe")',
          },
        ],
      }),
      operationalIntelligence: operationalIntelligence({
        insights: [
          {
            ...operationalIntelligence().insights[0],
            href: '/dashboard/records?continuity=needs_review',
          },
          {
            ...operationalIntelligence().insights[1],
            tone: 'watch',
            href: '//example.test/protocol-relative',
          },
        ],
      }),
    })

    const items = digest.slots.flatMap((slot) => slot.items)

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Unassigned work', href: undefined }),
        expect.objectContaining({ title: 'Request-to-record continuity', href: undefined }),
        expect.objectContaining({ title: 'Duplicate review backlog', href: undefined }),
        expect.objectContaining({
          title: 'Records and documents',
          href: '/dashboard/records?continuity=needs_review',
        }),
        expect.objectContaining({ title: 'Follow-up reliability', href: undefined }),
      ]),
    )
  })
})
