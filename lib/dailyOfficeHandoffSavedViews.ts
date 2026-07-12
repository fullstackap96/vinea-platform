import type {
  DailyOfficeHandoffDigest,
  DailyOfficeHandoffItem,
  DailyOfficeHandoffPhaseKey,
  DailyOfficeHandoffPriority,
} from './dailyOfficeHandoffDigest'
import { safeDashboardHref } from './safeDashboardHref'

export type DailyOfficeHandoffSavedViewKey =
  | 'front_desk_opening'
  | 'sacramental_records_handoff'
  | 'administrator_closeout'

export type DailyOfficeHandoffSavedViewAudience =
  | 'front_desk'
  | 'sacramental_coordinator'
  | 'administrator'

export type DailyOfficeHandoffSavedViewCue = {
  key: string
  sourceItemKey: string
  sourcePhase: DailyOfficeHandoffPhaseKey
  priority: DailyOfficeHandoffPriority
  title: string
  detail: string
  staffAction: string
  source: DailyOfficeHandoffItem['source']
  href?: string
}

export type DailyOfficeHandoffSavedViewPreset = {
  key: DailyOfficeHandoffSavedViewKey
  label: string
  audience: DailyOfficeHandoffSavedViewAudience
  whenToUse: string
  plainEnglishPurpose: string
  recommendedQueueHref: string
  reviewRhythm: string[]
  emptyState: string
  cues: DailyOfficeHandoffSavedViewCue[]
}

export type DailyOfficeHandoffSavedViewPlan = {
  title: string
  summary: string
  persistenceStatus: 'planning_only_not_persisted'
  staffReviewed: true
  activeParishScoped: true
  presets: DailyOfficeHandoffSavedViewPreset[]
  coverageNotes: string[]
  forbiddenControls: string[]
}

export type BuildDailyOfficeHandoffSavedViewPlanInput = {
  digest: DailyOfficeHandoffDigest
  maxCuesPerPreset?: number
}

type PresetDefinition = Omit<DailyOfficeHandoffSavedViewPreset, 'cues'>

const PRESETS: PresetDefinition[] = [
  {
    key: 'front_desk_opening',
    label: 'Front desk opening view',
    audience: 'front_desk',
    whenToUse: 'First look when the parish office opens.',
    plainEnglishPurpose:
      'Start with families who may be waiting, unassigned requests, overdue follow-up, and blocked work.',
    recommendedQueueHref: '/dashboard/requests',
    reviewRhythm: [
      'Open this first when the office opens.',
      'Name the owner for any unassigned or blocked family request.',
      'Leave the queue only after urgent follow-up has a staff-reviewed next step.',
    ],
    emptyState:
      'No front-desk opening handoff is visible right now. Start with new requests and first contacts.',
  },
  {
    key: 'sacramental_records_handoff',
    label: 'Sacramental records handoff view',
    audience: 'sacramental_coordinator',
    whenToUse: 'Midday records and certificate-readiness review.',
    plainEnglishPurpose:
      'Review request-to-record continuity, missing documents, incomplete sacramental records, and certificate-ready work.',
    recommendedQueueHref: '/dashboard/records?continuity=needs_review',
    reviewRhythm: [
      'Use this before certificate or register work begins.',
      'Confirm request-to-record links and missing document cues by hand.',
      'Keep any correction, notation, or certificate decision staff-reviewed.',
    ],
    emptyState:
      'No sacramental records handoff is visible right now. Keep certificate and register review staff-controlled.',
  },
  {
    key: 'administrator_closeout',
    label: 'Administrator closeout view',
    audience: 'administrator',
    whenToUse: 'Before closing the office or handing work to tomorrow.',
    plainEnglishPurpose:
      'Clean up duplicate review, workload balance, response time, and ownership gaps before the day ends.',
    recommendedQueueHref: '/dashboard/requests#staff-command-center-heading',
    reviewRhythm: [
      'Use this before closing or handing work to tomorrow.',
      'Check ownership, duplicate review, and workload balance before new work is assigned.',
      'Record the next staff-reviewed queue to open tomorrow morning.',
    ],
    emptyState:
      'No administrator closeout handoff is visible right now. Keep tomorrow clean with clear owners and review queues.',
  },
]

const PHASE_RANK: Record<DailyOfficeHandoffPhaseKey, number> = {
  opening: 0,
  midday: 1,
  before_close: 2,
}

const PRIORITY_RANK: Record<DailyOfficeHandoffPriority, number> = {
  urgent: 0,
  watch: 1,
}

function itemText(item: DailyOfficeHandoffItem): string {
  return `${item.key} ${item.title} ${item.detail} ${item.staffAction}`.toLowerCase()
}

function matchesFrontDesk(item: DailyOfficeHandoffItem): boolean {
  const text = itemText(item)
  return (
    item.phase === 'opening' ||
    text.includes('owner') ||
    text.includes('unassigned') ||
    text.includes('follow-up') ||
    text.includes('first contact') ||
    text.includes('blocked') ||
    text.includes('stalled')
  )
}

function matchesSacramentalRecords(item: DailyOfficeHandoffItem): boolean {
  const text = itemText(item)
  const sourceKey = item.key.toLowerCase()
  return (
    sourceKey.includes('records_continuity') ||
    sourceKey.includes('incomplete_records') ||
    sourceKey.includes('certificate_ready') ||
    sourceKey.includes('documents_checklist') ||
    sourceKey.includes('missing_dates') ||
    text.includes('sacramental') ||
    text.includes('request-to-record') ||
    text.includes('certificate') ||
    text.includes('document') ||
    text.includes('checklist') ||
    text.includes('continuity')
  )
}

function matchesAdministrator(item: DailyOfficeHandoffItem): boolean {
  const text = itemText(item)
  return (
    item.phase === 'before_close' ||
    text.includes('duplicate') ||
    text.includes('response time') ||
    text.includes('workload') ||
    text.includes('owner') ||
    text.includes('unassigned')
  )
}

function matchesPreset(
  preset: DailyOfficeHandoffSavedViewKey,
  item: DailyOfficeHandoffItem
): boolean {
  if (preset === 'front_desk_opening') return matchesFrontDesk(item)
  if (preset === 'sacramental_records_handoff') return matchesSacramentalRecords(item)
  return matchesAdministrator(item)
}

function sortItems(items: DailyOfficeHandoffItem[]): DailyOfficeHandoffItem[] {
  return [...items].sort((a, b) => {
    if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    }
    if (PHASE_RANK[a.phase] !== PHASE_RANK[b.phase]) {
      return PHASE_RANK[a.phase] - PHASE_RANK[b.phase]
    }
    if (a.source !== b.source) {
      return a.source === 'parish_health_score' ? -1 : 1
    }
    return a.title.localeCompare(b.title)
  })
}

function toCue(item: DailyOfficeHandoffItem): DailyOfficeHandoffSavedViewCue {
  return {
    key: `saved-view-cue:${item.key}`,
    sourceItemKey: item.key,
    sourcePhase: item.phase,
    priority: item.priority,
    title: item.title,
    detail: item.detail,
    staffAction: item.staffAction,
    source: item.source,
    href: safeDashboardHref(item.href),
  }
}

export function buildDailyOfficeHandoffSavedViewPlan(
  input: BuildDailyOfficeHandoffSavedViewPlanInput
): DailyOfficeHandoffSavedViewPlan {
  const maxCuesPerPreset = Math.max(1, input.maxCuesPerPreset ?? 4)
  const digestItems = input.digest.slots.flatMap((slot) => slot.items)

  const presets = PRESETS.map<DailyOfficeHandoffSavedViewPreset>((preset) => ({
    ...preset,
    cues: sortItems(digestItems.filter((item) => matchesPreset(preset.key, item)))
      .slice(0, maxCuesPerPreset)
      .map(toCue),
  }))

  const visibleCueCount = presets.reduce((sum, preset) => sum + preset.cues.length, 0)

  return {
    title: 'Daily office handoff saved-view presets',
    summary:
      visibleCueCount > 0
        ? `${visibleCueCount} read-only cue ${visibleCueCount === 1 ? 'is' : 'are'} ready to shape staff handoff views.`
        : 'No saved-view cue needs attention right now; the handoff presets remain available for a calm office day.',
    persistenceStatus: 'planning_only_not_persisted',
    staffReviewed: true,
    activeParishScoped: true,
    presets,
    coverageNotes: [
      'These presets are planning-only DTOs built from the already active-parish-scoped Daily Office Handoff Digest.',
      'They only carry dashboard-internal cue links and drop external, API, or action-like hrefs before rendering.',
      'They do not persist user preferences, write saved views, call APIs, query Supabase, or change dashboard runtime behavior.',
      'Staff choose whether to use a handoff view; Vinea does not send communications, mutate records, merge duplicates, generate certificates, run exports, access storage, call AI, create signed URLs, or make public trust claims from this plan.',
      'Catholic records and certificate cues remain staff-reviewed and are not sacramental, canonical, pastoral, or eligibility decisions.',
    ],
    forbiddenControls: [
      'send communications',
      'persist saved views',
      'mutate records',
      'merge duplicates',
      'generate certificates',
      'run exports',
      'call AI',
      'access storage',
      'create signed URLs',
      'make public trust claims',
    ],
  }
}
