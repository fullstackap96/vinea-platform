import { isNextFollowUpOverdue } from '@/lib/nextFollowUpDate'
import { isStaffUnassignedForAttention } from '@/lib/needsAttention'
import { normalizeRequestWaitingOn, requestWaitingOnLabel } from '@/lib/requestWaitingOn'

/** No logged contact after this much time since `created_at` → high risk (parish-office rule). */
export const FIRST_CONTACT_GRACE_MS = 3 * 24 * 60 * 60 * 1000

/** `waiting_on` held longer than this with a known start timestamp → medium (or high when stacked). */
export const WAITING_ON_STALE_MS = 7 * 24 * 60 * 60 * 1000

export type AtRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AtRiskDashboardRow = {
  status?: unknown
  created_at?: unknown
  last_contacted_at?: unknown
  next_follow_up_date?: unknown
  waiting_on?: unknown
  /**
   * When the current `waiting_on` value was set (ISO timestamptz).
   * Preferred for the “waiting > 7 days” rule; omit if unknown.
   */
  waiting_on_since?: unknown
  /** Alias for app/DB naming variants. */
  waiting_on_changed_at?: unknown
  assigned_staff_name?: unknown
}

export type AtRiskEvaluation = {
  isAtRisk: boolean
  riskReasons: string[]
  highestRiskLevel: AtRiskLevel
  recommendedAction: string
}

const LEVEL_RANK: Record<AtRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

function maxLevel(a: AtRiskLevel, b: AtRiskLevel): AtRiskLevel {
  return LEVEL_RANK[a] >= LEVEL_RANK[b] ? a : b
}

function parseTimeMs(value: unknown): number | null {
  if (value == null) return null
  const s = String(value).trim()
  if (!s) return null
  const t = new Date(s).getTime()
  return Number.isNaN(t) ? null : t
}

function hasLoggedContact(lastContactedAt: unknown): boolean {
  return parseTimeMs(lastContactedAt) !== null
}

function waitingOnStartMs(row: AtRiskDashboardRow): number | null {
  return (
    parseTimeMs(row.waiting_on_since) ??
    parseTimeMs(row.waiting_on_changed_at) ??
    null
  )
}

export type EvaluateAtRiskRequestOptions = {
  now?: Date
}

/**
 * Parish-office at-risk rules for a dashboard request row.
 * Complete requests are never at risk. `waiting_on` duration needs
 * `waiting_on_since` or `waiting_on_changed_at`; otherwise that rule is skipped.
 */
export function evaluateAtRiskRequest(
  row: AtRiskDashboardRow,
  options?: EvaluateAtRiskRequestOptions
): AtRiskEvaluation {
  const now = options?.now ?? new Date()
  const status = String(row.status ?? '').trim()

  if (status === 'complete') {
    return {
      isAtRisk: false,
      riskReasons: [],
      highestRiskLevel: 'low',
      recommendedAction: 'No action required for risk tracking.',
    }
  }

  const reasons: string[] = []
  let level: AtRiskLevel = 'low'

  const staffUnassigned = isStaffUnassignedForAttention(row.assigned_staff_name)
  if (staffUnassigned) {
    reasons.push('No staff member is assigned to own this request.')
    level = maxLevel(level, 'medium')
  }

  const overdueFollowUp = isNextFollowUpOverdue(row.next_follow_up_date, row.status, now)
  if (overdueFollowUp) {
    reasons.push('Next follow-up date is in the past.')
    level = maxLevel(level, 'high')
  }

  const createdMs = parseTimeMs(row.created_at)
  const contactMissing = !hasLoggedContact(row.last_contacted_at)
  const noFirstContactTooLong =
    contactMissing &&
    createdMs !== null &&
    now.getTime() - createdMs >= FIRST_CONTACT_GRACE_MS

  if (noFirstContactTooLong) {
    reasons.push('No first contact has been logged within three days of intake.')
    level = maxLevel(level, 'high')
  }

  const waitingKey = normalizeRequestWaitingOn(row.waiting_on)
  const waitingStart = waitingKey ? waitingOnStartMs(row) : null
  if (waitingKey && waitingStart !== null) {
    const heldMs = now.getTime() - waitingStart
    if (heldMs >= WAITING_ON_STALE_MS) {
      const label = requestWaitingOnLabel(waitingKey) ?? waitingKey
      reasons.push(
        `Waiting for "${label}" for more than seven days (since ${new Date(waitingStart).toISOString().slice(0, 10)}).`
      )
      const longWaitingLevel: AtRiskLevel =
        overdueFollowUp || staffUnassigned ? 'high' : 'medium'
      level = maxLevel(level, longWaitingLevel)
    }
  }

  const highTierCount = [
    overdueFollowUp,
    noFirstContactTooLong,
  ].filter(Boolean).length
  if (highTierCount >= 2) {
    level = 'critical'
  }

  const isAtRisk = reasons.length > 0

  let recommendedAction =
    'Review the request, update assignments and dates, and log your next contact.'
  if (!isAtRisk) {
    recommendedAction = 'No at-risk signals detected with current data.'
  } else if (level === 'critical') {
    recommendedAction =
      'Treat as urgent: address past-due follow-up and establish contact, or document why the case is intentionally paused.'
  } else if (overdueFollowUp) {
    recommendedAction =
      'Contact the family or internal owner, then set a realistic next follow-up date.'
  } else if (noFirstContactTooLong) {
    recommendedAction =
      'Log an initial outreach (call, email, or visit) and record it as contacted.'
  } else if (staffUnassigned) {
    recommendedAction = 'Assign a staff owner so follow-up responsibility is clear.'
  } else if (waitingKey && reasons.some((r) => r.startsWith('Waiting for'))) {
    recommendedAction =
      'Check in on what you are waiting for; nudge the party or update the wait reason if it has changed.'
  }

  return {
    isAtRisk,
    riskReasons: reasons,
    highestRiskLevel: isAtRisk ? level : 'low',
    recommendedAction,
  }
}
