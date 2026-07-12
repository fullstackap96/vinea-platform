import { describe, expect, it } from 'vitest'
import { buildDailyOfficeHandoffSavedViewPlan } from './dailyOfficeHandoffSavedViews'
import type { DailyOfficeHandoffDigest } from './dailyOfficeHandoffDigest'

function digest(overrides: Partial<DailyOfficeHandoffDigest> = {}): DailyOfficeHandoffDigest {
  return {
    title: 'Daily office handoff',
    headline: '5 staff-reviewed handoff items need attention today.',
    subline: '2 urgent items should be reviewed before routine work.',
    coverageNotes: ['Read-only handoff digest.'],
    slots: [
      {
        key: 'opening',
        label: 'Opening the office',
        guidance: 'Start with ownership and overdue care.',
        emptyState: 'No urgent opening handoff is visible right now.',
        items: [
          {
            key: 'health:ownership_gaps',
            phase: 'opening',
            priority: 'urgent',
            title: 'Unassigned work',
            detail: '4 open requests need a staff owner.',
            staffAction: 'Assign owners before routine request work continues.',
            source: 'parish_health_score',
            href: '/dashboard/requests#staff-command-center-heading',
          },
          {
            key: 'intelligence:follow_up_reliability',
            phase: 'opening',
            priority: 'watch',
            title: 'Follow-up reliability',
            detail: '2 follow-ups are past due.',
            staffAction: 'Review the follow-up queue before lunch.',
            source: 'operational_intelligence',
            href: '/dashboard/requests#follow-up-queue-heading',
          },
        ],
      },
      {
        key: 'midday',
        label: 'Midday check-in',
        guidance: 'Clear documents, records, dates, and communication bottlenecks.',
        emptyState: 'No midday bottleneck is visible right now.',
        items: [
          {
            key: 'health:records_continuity',
            phase: 'midday',
            priority: 'watch',
            title: 'Request-to-record continuity',
            detail: '2 sacramental records need request-to-record continuity review.',
            staffAction:
              'Open the Records continuity review queue before certificate work; staff should verify links manually.',
            source: 'parish_health_score',
            href: '/dashboard/records?continuity=needs_review',
          },
          {
            key: 'health:certificate_ready',
            phase: 'midday',
            priority: 'watch',
            title: 'Certificate-ready work',
            detail: '1 baptism certificate is ready for staff review.',
            staffAction: 'Review certificate readiness without generating anything automatically.',
            source: 'parish_health_score',
            href: '/dashboard/records?certificate=ready',
          },
        ],
      },
      {
        key: 'before_close',
        label: 'Before closing',
        guidance: 'Leave tomorrow clean.',
        emptyState: 'No before-close cleanup item is visible right now.',
        items: [
          {
            key: 'health:duplicate_review',
            phase: 'before_close',
            priority: 'watch',
            title: 'Duplicate review backlog',
            detail: '3 possible duplicate candidates need staff review.',
            staffAction: 'Review possible duplicate people and households before they pile up.',
            source: 'parish_health_score',
            href: '/dashboard/people/duplicates',
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('buildDailyOfficeHandoffSavedViewPlan', () => {
  it('turns the daily handoff digest into role-friendly read-only saved-view presets', () => {
    const plan = buildDailyOfficeHandoffSavedViewPlan({ digest: digest() })

    expect(plan.title).toBe('Daily office handoff saved-view presets')
    expect(plan.persistenceStatus).toBe('planning_only_not_persisted')
    expect(plan.staffReviewed).toBe(true)
    expect(plan.activeParishScoped).toBe(true)
    expect(plan.summary).toContain('read-only cue')

    const frontDesk = plan.presets.find((preset) => preset.key === 'front_desk_opening')
    const records = plan.presets.find((preset) => preset.key === 'sacramental_records_handoff')
    const admin = plan.presets.find((preset) => preset.key === 'administrator_closeout')

    expect(frontDesk).toMatchObject({
      label: 'Front desk opening view',
      audience: 'front_desk',
      recommendedQueueHref: '/dashboard/requests',
      reviewRhythm: [
        'Open this first when the office opens.',
        'Name the owner for any unassigned or blocked family request.',
        'Leave the queue only after urgent follow-up has a staff-reviewed next step.',
      ],
    })
    expect(frontDesk?.cues.map((cue) => cue.title)).toEqual([
      'Unassigned work',
      'Follow-up reliability',
    ])

    expect(records).toMatchObject({
      label: 'Sacramental records handoff view',
      audience: 'sacramental_coordinator',
      recommendedQueueHref: '/dashboard/records?continuity=needs_review',
      reviewRhythm: [
        'Use this before certificate or register work begins.',
        'Confirm request-to-record links and missing document cues by hand.',
        'Keep any correction, notation, or certificate decision staff-reviewed.',
      ],
    })
    expect(records?.cues.map((cue) => cue.title)).toEqual([
      'Certificate-ready work',
      'Request-to-record continuity',
    ])
    expect(records?.cues.every((cue) => cue.staffAction.length > 0)).toBe(true)

    expect(admin).toMatchObject({
      label: 'Administrator closeout view',
      audience: 'administrator',
      reviewRhythm: [
        'Use this before closing or handing work to tomorrow.',
        'Check ownership, duplicate review, and workload balance before new work is assigned.',
        'Record the next staff-reviewed queue to open tomorrow morning.',
      ],
    })
    expect(admin?.cues.map((cue) => cue.title)).toEqual([
      'Unassigned work',
      'Duplicate review backlog',
    ])
  })

  it('keeps calm empty states when no handoff cue is visible', () => {
    const plan = buildDailyOfficeHandoffSavedViewPlan({
      digest: digest({
        headline: 'The daily handoff looks calm right now.',
        subline: 'Use this rhythm to keep ownership, records, follow-up, and family care from drifting.',
        slots: digest().slots.map((slot) => ({ ...slot, items: [] })),
      }),
    })

    expect(plan.summary).toContain('No saved-view cue needs attention')
    expect(plan.presets.every((preset) => preset.cues.length === 0)).toBe(true)
    expect(plan.presets.map((preset) => preset.emptyState).join(' ')).toContain(
      'No sacramental records handoff is visible right now.'
    )
    expect(plan.presets.every((preset) => preset.reviewRhythm.length === 3)).toBe(true)
  })

  it('preserves source labels and safe queue hrefs without adding runtime behavior', () => {
    const plan = buildDailyOfficeHandoffSavedViewPlan({ digest: digest(), maxCuesPerPreset: 1 })

    expect(plan.presets.every((preset) => preset.cues.length <= 1)).toBe(true)
    expect(plan.presets[0].cues[0]).toMatchObject({
      sourceItemKey: 'health:ownership_gaps',
      sourcePhase: 'opening',
      source: 'parish_health_score',
      href: '/dashboard/requests#staff-command-center-heading',
    })

    const notes = plan.coverageNotes.join(' ')
    expect(notes).toContain('planning-only DTOs')
    expect(notes).toContain('already active-parish-scoped')
    expect(notes).toContain('only carry dashboard-internal cue links')
    expect(notes).toContain('do not persist user preferences')
    expect(notes).toContain('does not send communications')
    expect(notes).toContain('mutate records')
    expect(notes).toContain('generate certificates')
    expect(notes).toContain('not sacramental, canonical')

    expect(plan.forbiddenControls).toEqual(
      expect.arrayContaining([
        'persist saved views',
        'mutate records',
        'generate certificates',
        'run exports',
        'call AI',
        'create signed URLs',
      ])
    )
  })

  it('drops non-dashboard cue hrefs before they can render in the saved-view card', () => {
    const unsafeDigest = digest({
      slots: [
        {
          ...digest().slots[0],
          items: [
            {
              ...digest().slots[0].items[0],
              href: 'https://example.test/not-a-dashboard-link',
            },
            {
              ...digest().slots[0].items[1],
              href: '/api/exports/requests/basic',
            },
            {
              key: 'health:blocked_work',
              phase: 'opening',
              priority: 'watch',
              title: 'Blocked work',
              detail: 'One request is blocked.',
              staffAction: 'Review the request queue.',
              source: 'parish_health_score',
              href: 'javascript:alert("unsafe")',
            },
          ],
        },
        ...digest().slots.slice(1),
      ],
    })

    const plan = buildDailyOfficeHandoffSavedViewPlan({ digest: unsafeDigest })
    const frontDesk = plan.presets.find((preset) => preset.key === 'front_desk_opening')

    expect(frontDesk?.cues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Unassigned work', href: undefined }),
        expect.objectContaining({ title: 'Follow-up reliability', href: undefined }),
        expect.objectContaining({ title: 'Blocked work', href: undefined }),
      ])
    )

    const records = plan.presets.find((preset) => preset.key === 'sacramental_records_handoff')
    expect(records?.cues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Request-to-record continuity',
          href: '/dashboard/records?continuity=needs_review',
        }),
      ])
    )
  })
})
