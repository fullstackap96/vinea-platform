export const DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_VERSION =
  '2026-07-06-daily-office-handoff-saved-view-dashboard-ui-preflight-v1'

export type DailyOfficeHandoffSavedViewDashboardUiPreflightGateId =
  | 'saved_view_plan_gate'
  | 'digest_derived_gate'
  | 'active_parish_context_gate'
  | 'staff_reviewed_boundary_gate'
  | 'preset_labels_gate'
  | 'handoff_rhythm_gate'
  | 'safe_queue_links_gate'
  | 'empty_state_gate'
  | 'dashboard_placement_gate'

export type DailyOfficeHandoffSavedViewDashboardUiPreflightGateResult = {
  readonly id: DailyOfficeHandoffSavedViewDashboardUiPreflightGateId
  readonly ok: boolean
  readonly matchedMarkers: readonly string[]
}

export type DailyOfficeHandoffSavedViewDashboardUiPreflightResult = {
  readonly ok: boolean
  readonly version: typeof DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_VERSION
  readonly gates: readonly DailyOfficeHandoffSavedViewDashboardUiPreflightGateResult[]
  readonly forbiddenMarkersPresent: readonly string[]
  readonly errors: readonly string[]
}

export type DailyOfficeHandoffSavedViewDashboardUiPreflightSource = {
  readonly componentSource: string
  readonly dashboardSource: string
}

type DailyOfficeHandoffSavedViewDashboardUiPreflightGate = {
  readonly id: DailyOfficeHandoffSavedViewDashboardUiPreflightGateId
  readonly description: string
  readonly markers: readonly string[]
  readonly source: keyof DailyOfficeHandoffSavedViewDashboardUiPreflightSource | 'all'
}

const REQUIRED_GATES: readonly DailyOfficeHandoffSavedViewDashboardUiPreflightGate[] =
  [
    {
      id: 'saved_view_plan_gate',
      description:
        'Future UI must render only the Daily Office Handoff saved-view plan DTO.',
      source: 'componentSource',
      markers: [
        'buildDailyOfficeHandoffSavedViewPlan',
        ': DailyOfficeHandoffSavedViewPlan',
        'plan.presets',
      ],
    },
    {
      id: 'digest_derived_gate',
      description:
        'Future UI must derive the plan from the existing Daily Office Handoff Digest instead of new reads.',
      source: 'componentSource',
      markers: [
        'dailyOfficeHandoffDigest',
        'digest',
        'existing Daily Office Handoff Digest',
      ],
    },
    {
      id: 'active_parish_context_gate',
      description:
        'Future UI must keep visible active-parish context on the saved-view surface.',
      source: 'componentSource',
      markers: ['activeParishName', 'selected active parish', 'active parish'],
    },
    {
      id: 'staff_reviewed_boundary_gate',
      description:
        'Future UI must make clear the surface is read-only, staff-reviewed, and not automation.',
      source: 'componentSource',
      markers: ['Read-only', 'staff-reviewed', 'No automation'],
    },
    {
      id: 'preset_labels_gate',
      description: 'Future UI must render all approved handoff preset labels.',
      source: 'componentSource',
      markers: [
        'Front desk opening view',
        'Sacramental records handoff view',
        'Administrator closeout view',
      ],
    },
    {
      id: 'handoff_rhythm_gate',
      description:
        'Future UI must render the plain-English handoff rhythm for each saved-view preset.',
      source: 'componentSource',
      markers: ['Handoff rhythm', 'preset.reviewRhythm', '<ol'],
    },
    {
      id: 'safe_queue_links_gate',
      description:
        'Future UI may link only to existing staff-reviewed queue hrefs from the DTO.',
      source: 'componentSource',
      markers: ['recommendedQueueHref', 'cue.href', 'staff-reviewed queues'],
    },
    {
      id: 'empty_state_gate',
      description:
        'Future UI must show calm empty states when a preset has no visible cue.',
      source: 'componentSource',
      markers: ['preset.emptyState', 'No handoff cue', 'empty state'],
    },
    {
      id: 'dashboard_placement_gate',
      description:
        'Future dashboard composition must place the saved-view surface near the existing handoff digest.',
      source: 'dashboardSource',
      markers: [
        'DashboardDailyOfficeHandoffDigest',
        'DashboardDailyOfficeHandoffSavedViews',
        'DashboardParishHealthScore',
      ],
    },
  ]

const FORBIDDEN_MARKERS = [
  '<button',
  '<form',
  'onClick=',
  'useActionState',
  'action=',
  'fetch(',
  'createClient(',
  '.insert(',
  '.update(',
  '.delete(',
  'upsert(',
  'createSignedUrl',
  'getSignedUrl',
  'storage.from(',
  'OpenAI',
  '/api/ai',
  '/api/exports',
  '/api/email',
  '/api/google',
  'resend',
  'sendEmail',
  'localStorage',
  'sessionStorage',
  'cookies()',
  'router.push',
  'useRouter',
  'generateCertificate',
  'mergePeople',
  'mergeHouseholds',
] as const

function sourceForGate(
  gate: DailyOfficeHandoffSavedViewDashboardUiPreflightGate,
  source: DailyOfficeHandoffSavedViewDashboardUiPreflightSource,
): string {
  if (gate.source === 'all') {
    return `${source.componentSource}\n${source.dashboardSource}`
  }
  return source[gate.source]
}

function matchedMarkers(source: string, markers: readonly string[]): string[] {
  return markers.filter((marker) => source.includes(marker))
}

function hasDashboardPlacement(source: string): boolean {
  const digestIndex = source.indexOf('DashboardDailyOfficeHandoffDigest')
  const savedViewsIndex = source.indexOf('DashboardDailyOfficeHandoffSavedViews')
  const parishHealthIndex = source.indexOf('DashboardParishHealthScore')

  return digestIndex >= 0 && savedViewsIndex > digestIndex && parishHealthIndex > savedViewsIndex
}

export function validateFutureDailyOfficeHandoffSavedViewDashboardUiSource(
  source: DailyOfficeHandoffSavedViewDashboardUiPreflightSource,
): DailyOfficeHandoffSavedViewDashboardUiPreflightResult {
  const errors: string[] = []

  const gates = REQUIRED_GATES.map(
    (gate): DailyOfficeHandoffSavedViewDashboardUiPreflightGateResult => {
      const candidateSource = sourceForGate(gate, source)
      const matches = matchedMarkers(candidateSource, gate.markers)
      const ok =
        gate.id === 'dashboard_placement_gate'
          ? matches.length === gate.markers.length && hasDashboardPlacement(candidateSource)
          : matches.length === gate.markers.length

      if (!ok) {
        errors.push(
          `${gate.id} failed. ${gate.description} Expected markers: ${gate.markers.join(
            ', ',
          )}.`,
        )
      }

      return {
        id: gate.id,
        ok,
        matchedMarkers: matches,
      }
    },
  )

  const combinedSource = `${source.componentSource}\n${source.dashboardSource}`
  const forbiddenMarkersPresent = FORBIDDEN_MARKERS.filter((marker) =>
    combinedSource.includes(marker),
  )

  if (forbiddenMarkersPresent.length > 0) {
    errors.push(
      `Future Daily Office Handoff saved-view dashboard UI contains forbidden markers: ${forbiddenMarkersPresent.join(
        ', ',
      )}.`,
    )
  }

  return {
    ok: errors.length === 0,
    version: DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_VERSION,
    gates,
    forbiddenMarkersPresent,
    errors,
  }
}
