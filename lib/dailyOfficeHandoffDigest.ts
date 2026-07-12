import type { OperationalIntelligenceBrief, OperationalIntelligenceInsight } from './operationalIntelligenceBrief'
import type { ParishHealthFactor, ParishHealthScore, ParishHealthTone } from './parishHealthScore'
import { safeDashboardHref } from './safeDashboardHref'

export type DailyOfficeHandoffPhaseKey = 'opening' | 'midday' | 'before_close'

export type DailyOfficeHandoffPriority = 'urgent' | 'watch'

export type DailyOfficeHandoffSource = 'parish_health_score' | 'operational_intelligence'

export type DailyOfficeHandoffItem = {
  key: string
  phase: DailyOfficeHandoffPhaseKey
  priority: DailyOfficeHandoffPriority
  title: string
  detail: string
  staffAction: string
  source: DailyOfficeHandoffSource
  href?: string
}

export type DailyOfficeHandoffSlot = {
  key: DailyOfficeHandoffPhaseKey
  label: string
  guidance: string
  emptyState: string
  items: DailyOfficeHandoffItem[]
}

export type DailyOfficeHandoffDigest = {
  title: string
  headline: string
  subline: string
  slots: DailyOfficeHandoffSlot[]
  coverageNotes: string[]
}

export type BuildDailyOfficeHandoffDigestInput = {
  parishHealthScore: ParishHealthScore
  operationalIntelligence: OperationalIntelligenceBrief
  maxItemsPerSlot?: number
}

const PHASE_LABELS: Record<DailyOfficeHandoffPhaseKey, string> = {
  opening: 'Opening the office',
  midday: 'Midday check-in',
  before_close: 'Before closing',
}

const PHASE_GUIDANCE: Record<DailyOfficeHandoffPhaseKey, string> = {
  opening: 'Start with ownership, overdue care, and anything that could leave a family waiting.',
  midday: 'Use a quieter moment to clear documents, records, dates, and communication bottlenecks.',
  before_close: 'Leave tomorrow clean: owners assigned, follow-up protected, and review queues visible.',
}

const PHASE_EMPTY_STATES: Record<DailyOfficeHandoffPhaseKey, string> = {
  opening: 'No urgent opening handoff is visible right now. Start with new requests and first contacts.',
  midday: 'No midday records, document, date, or communication bottleneck is visible right now.',
  before_close: 'No before-close cleanup item is visible right now. Keep owners and follow-up dates current.',
}

const FACTOR_PHASES: Record<string, DailyOfficeHandoffPhaseKey> = {
  overdue_followups: 'opening',
  ownership_gaps: 'opening',
  blocked_work: 'opening',
  stalled_workflows: 'opening',
  first_contact: 'opening',
  communications: 'midday',
  documents_checklist: 'midday',
  missing_dates: 'midday',
  care_cadence: 'midday',
  records_continuity: 'midday',
  incomplete_records: 'midday',
  certificate_ready: 'midday',
  duplicate_review: 'before_close',
  response_time: 'before_close',
  workload_balance: 'before_close',
}

const INSIGHT_PHASES: Record<string, DailyOfficeHandoffPhaseKey> = {
  request_type_bottleneck: 'opening',
  follow_up_reliability: 'opening',
  workload_balance: 'opening',
  records_documents: 'midday',
}

function priorityFromTone(tone: ParishHealthTone): DailyOfficeHandoffPriority | null {
  if (tone === 'urgent') return 'urgent'
  if (tone === 'watch') return 'watch'
  return null
}

function priorityRank(priority: DailyOfficeHandoffPriority): number {
  return priority === 'urgent' ? 0 : 1
}

function factorToItem(factor: ParishHealthFactor): DailyOfficeHandoffItem | null {
  if (factor.scoreImpact <= 0) return null
  const priority = priorityFromTone(factor.tone)
  if (!priority) return null

  return {
    key: `health:${factor.key}`,
    phase: FACTOR_PHASES[factor.key] ?? 'opening',
    priority,
    title: factor.label,
    detail: factor.reason,
    staffAction: factor.recommendedAction,
    source: 'parish_health_score',
    href: safeDashboardHref(factor.href),
  }
}

function insightToItem(insight: OperationalIntelligenceInsight): DailyOfficeHandoffItem | null {
  const priority = priorityFromTone(insight.tone)
  if (!priority) return null

  return {
    key: `intelligence:${insight.key}`,
    phase: INSIGHT_PHASES[insight.key] ?? 'midday',
    priority,
    title: insight.label,
    detail: insight.reason,
    staffAction: insight.recommendedAction,
    source: 'operational_intelligence',
    href: safeDashboardHref(insight.href),
  }
}

function sortItems(items: readonly DailyOfficeHandoffItem[]): DailyOfficeHandoffItem[] {
  return [...items].sort((a, b) => {
    if (priorityRank(a.priority) !== priorityRank(b.priority)) {
      return priorityRank(a.priority) - priorityRank(b.priority)
    }
    if (a.source !== b.source) {
      return a.source === 'parish_health_score' ? -1 : 1
    }
    return a.title.localeCompare(b.title)
  })
}

export function buildDailyOfficeHandoffDigest(
  input: BuildDailyOfficeHandoffDigestInput
): DailyOfficeHandoffDigest {
  const maxItemsPerSlot = Math.max(1, input.maxItemsPerSlot ?? 3)
  const items = [
    ...input.parishHealthScore.factors.map(factorToItem),
    ...input.operationalIntelligence.insights.map(insightToItem),
  ].filter((item): item is DailyOfficeHandoffItem => item !== null)

  const slots = (['opening', 'midday', 'before_close'] as const).map<DailyOfficeHandoffSlot>(
    (phase) => ({
      key: phase,
      label: PHASE_LABELS[phase],
      guidance: PHASE_GUIDANCE[phase],
      emptyState: PHASE_EMPTY_STATES[phase],
      items: sortItems(items.filter((item) => item.phase === phase)).slice(0, maxItemsPerSlot),
    })
  )

  const visibleItemCount = slots.reduce((sum, slot) => sum + slot.items.length, 0)
  const urgentItemCount = slots.reduce(
    (sum, slot) => sum + slot.items.filter((item) => item.priority === 'urgent').length,
    0
  )

  return {
    title: 'Daily office handoff',
    headline:
      visibleItemCount > 0
        ? `${visibleItemCount} staff-reviewed handoff ${visibleItemCount === 1 ? 'item' : 'items'} need attention today.`
        : 'The daily handoff looks calm right now.',
    subline:
      urgentItemCount > 0
        ? `${urgentItemCount} urgent ${urgentItemCount === 1 ? 'item' : 'items'} should be reviewed before routine work.`
        : 'Use this rhythm to keep ownership, records, follow-up, and family care from drifting.',
    slots,
    coverageNotes: [
      'This digest is read-only guidance from Parish Health Score and Operational Intelligence DTOs.',
      'Staff decide the next step; Vinea does not send communications, mutate records, merge duplicates, generate certificates, run exports, access storage, call AI, or create signed URLs from this digest.',
      'Catholic records and certificate cues remain staff-reviewed and are not sacramental, canonical, pastoral, or eligibility decisions.',
    ],
  }
}
