import type { WorkflowReminderCandidate, WorkflowReminderKind } from '@/lib/workflowReminderDtos'
import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'

export type WorkflowReminderDispositionAction = 'dismiss' | 'snooze' | 'suppress'

export type WorkflowReminderDispositionReason =
  | 'completed_elsewhere'
  | 'not_relevant'
  | 'duplicate_signal'
  | 'waiting_on_staff'
  | 'review_later'
  | 'other'

export type WorkflowReminderDispositionTargetType =
  | 'request'
  | 'sacramental_record'
  | 'duplicate_review'
  | 'certificate_review'

export type WorkflowReminderDispositionInput = {
  reminder: WorkflowReminderCandidate
  action: WorkflowReminderDispositionAction
  reason: WorkflowReminderDispositionReason
  actorLabel: string
  activeParishLabel: string
  targetType?: WorkflowReminderDispositionTargetType
  now: Date
  snoozedUntil?: string | null
  staffNote?: string | null
}

export type WorkflowReminderDispositionDto = {
  id: string
  featureId: 'workflow_reminders_v1'
  action: WorkflowReminderDispositionAction
  reason: WorkflowReminderDispositionReason
  reminderKind: WorkflowReminderKind
  reminderTitle: string
  targetType: WorkflowReminderDispositionTargetType
  targetLabel: string
  href: string
  actorLabel: string
  activeParishLabel: string
  createdAt: string
  snoozedUntil: string | null
  staffNote: string | null
  staffReviewRequired: true
  outboundCommunicationAllowed: false
  mutatesOperationalRecord: false
  runtimeStatus: 'non_runtime_disposition_dto_only'
  auditMetadata: {
    feature_id: 'workflow_reminders_v1'
    action: WorkflowReminderDispositionAction
    reminder_kind: WorkflowReminderKind
    active_parish_label: string
    actor_label: string
    target_type: WorkflowReminderDispositionTargetType
    target_label: string
    staff_review_required: true
    outbound_communication_allowed: false
    mutates_operational_record: false
    safe_source_reference: string
    blocked_from_family_portal: true
  }
}

export type WorkflowReminderDispositionResult =
  | { ok: true; disposition: WorkflowReminderDispositionDto }
  | { ok: false; error: string }

const SECRET_PATTERNS = [
  'postgresql://',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'access_token',
  'refresh_token',
  'eyJ',
]

function cleanLabel(value: string, fallback: string): string {
  const label = value.replace(/\s+/g, ' ').trim()
  if (!label) return fallback
  return label.slice(0, 140)
}

function containsSecretMaterial(value: string | null | undefined): boolean {
  if (!value) return false
  return SECRET_PATTERNS.some((pattern) => value.includes(pattern))
}

function cleanStaffNote(value: string | null | undefined): string | null {
  const note = value?.replace(/\s+/g, ' ').trim() ?? ''
  if (!note) return null
  return note.slice(0, 240)
}

function targetTypeForReminder(
  reminder: WorkflowReminderCandidate,
  explicit?: WorkflowReminderDispositionTargetType
): WorkflowReminderDispositionTargetType {
  if (explicit) return explicit
  if (reminder.kind === 'duplicate_review') return 'duplicate_review'
  if (reminder.kind === 'certificate_ready') return 'certificate_review'
  return 'request'
}

function safeSnoozeDate(value: string | null | undefined, now: Date): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  if (date.getTime() <= now.getTime()) return null
  return date.toISOString()
}

export function buildWorkflowReminderDispositionDto(
  input: WorkflowReminderDispositionInput
): WorkflowReminderDispositionResult {
  const note = cleanStaffNote(input.staffNote)
  if (containsSecretMaterial(note)) {
    return { ok: false, error: 'Staff note contains unsafe material.' }
  }

  const actorLabel = cleanLabel(input.actorLabel, 'Staff')
  const activeParishLabel = cleanLabel(input.activeParishLabel, 'Selected parish')
  if (containsSecretMaterial(actorLabel) || containsSecretMaterial(activeParishLabel)) {
    return { ok: false, error: 'Disposition labels contain unsafe material.' }
  }

  const snoozedUntil = safeSnoozeDate(input.snoozedUntil, input.now)
  if (input.action === 'snooze' && !snoozedUntil) {
    return { ok: false, error: 'Snooze requires a future snoozedUntil timestamp.' }
  }

  if (input.action !== 'snooze' && input.snoozedUntil) {
    return { ok: false, error: 'Only snooze dispositions may include snoozedUntil.' }
  }

  const targetType = targetTypeForReminder(input.reminder, input.targetType)
  const targetLabel = cleanLabel(input.reminder.title, 'Workflow reminder')
  const href = safeDashboardHrefOrFallback(cleanLabel(input.reminder.href, '/dashboard'), '/dashboard')
  const createdAt = input.now.toISOString()
  const id = `workflow_reminder_disposition:${input.action}:${input.reminder.id}`

  return {
    ok: true,
    disposition: {
      id,
      featureId: 'workflow_reminders_v1',
      action: input.action,
      reason: input.reason,
      reminderKind: input.reminder.kind,
      reminderTitle: targetLabel,
      targetType,
      targetLabel,
      href,
      actorLabel,
      activeParishLabel,
      createdAt,
      snoozedUntil,
      staffNote: note,
      staffReviewRequired: true,
      outboundCommunicationAllowed: false,
      mutatesOperationalRecord: false,
      runtimeStatus: 'non_runtime_disposition_dto_only',
      auditMetadata: {
        feature_id: 'workflow_reminders_v1',
        action: input.action,
        reminder_kind: input.reminder.kind,
        active_parish_label: activeParishLabel,
        actor_label: actorLabel,
        target_type: targetType,
        target_label: targetLabel,
        staff_review_required: true,
        outbound_communication_allowed: false,
        mutates_operational_record: false,
        safe_source_reference: input.reminder.id,
        blocked_from_family_portal: true,
      },
    },
  }
}
