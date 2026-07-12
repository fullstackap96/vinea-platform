import { describe, expect, it } from 'vitest'
import { buildWorkflowReminderDispositionDto } from '@/lib/workflowReminderDispositionDtos'
import type { WorkflowReminderCandidate } from '@/lib/workflowReminderDtos'

const baseReminder: WorkflowReminderCandidate = {
  id: 'overdue_follow_up:request-safe-label',
  kind: 'overdue_follow_up',
  severity: 'urgent',
  title: 'Overdue follow-up: Safe Family',
  detail: 'Baptism request has a past-due follow-up date.',
  recommendedAction: 'Staff should contact the family or update the follow-up date after review.',
  ownerLabel: 'Parish Secretary',
  href: '/dashboard/requests/request-safe-label#send-email',
  requestId: 'request-safe-label',
  dueAt: '2026-07-01T15:00:00.000Z',
  reasonSignals: ['next_follow_up_date is past due'],
  staffReviewRequired: true,
  outboundCommunicationAllowed: false,
  runtimeStatus: 'non_runtime_dto_only',
}

describe('buildWorkflowReminderDispositionDto', () => {
  it('creates safe dismissal metadata without sending communication or mutating records', () => {
    const result = buildWorkflowReminderDispositionDto({
      reminder: baseReminder,
      action: 'dismiss',
      reason: 'completed_elsewhere',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
      staffNote: 'Called family this morning.',
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.disposition.featureId).toBe('workflow_reminders_v1')
    expect(result.disposition.staffReviewRequired).toBe(true)
    expect(result.disposition.outboundCommunicationAllowed).toBe(false)
    expect(result.disposition.mutatesOperationalRecord).toBe(false)
    expect(result.disposition.runtimeStatus).toBe('non_runtime_disposition_dto_only')
    expect(result.disposition.auditMetadata).toMatchObject({
      feature_id: 'workflow_reminders_v1',
      action: 'dismiss',
      reminder_kind: 'overdue_follow_up',
      active_parish_label: 'Safe Parish A',
      actor_label: 'Safe QA staff',
      target_type: 'request',
      staff_review_required: true,
      outbound_communication_allowed: false,
      mutates_operational_record: false,
      blocked_from_family_portal: true,
    })
  })

  it('requires snooze dispositions to use a future snooze timestamp', () => {
    const missing = buildWorkflowReminderDispositionDto({
      reminder: baseReminder,
      action: 'snooze',
      reason: 'review_later',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
    })

    const past = buildWorkflowReminderDispositionDto({
      reminder: baseReminder,
      action: 'snooze',
      reason: 'review_later',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
      snoozedUntil: '2026-07-02T11:00:00.000Z',
    })

    const future = buildWorkflowReminderDispositionDto({
      reminder: baseReminder,
      action: 'snooze',
      reason: 'review_later',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
      snoozedUntil: '2026-07-03T12:00:00.000Z',
    })

    expect(missing).toMatchObject({ ok: false })
    expect(past).toMatchObject({ ok: false })
    expect(future).toMatchObject({ ok: true })
  })

  it('classifies duplicate and certificate disposition targets without deciding outcomes', () => {
    const duplicate = buildWorkflowReminderDispositionDto({
      reminder: { ...baseReminder, id: 'duplicate_review:people_households', kind: 'duplicate_review' },
      action: 'suppress',
      reason: 'duplicate_signal',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
    })
    const certificate = buildWorkflowReminderDispositionDto({
      reminder: { ...baseReminder, id: 'certificate_ready:record-safe-label', kind: 'certificate_ready' },
      action: 'dismiss',
      reason: 'completed_elsewhere',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
    })

    expect(duplicate.ok && duplicate.disposition.targetType).toBe('duplicate_review')
    expect(certificate.ok && certificate.disposition.targetType).toBe('certificate_review')
    expect(duplicate.ok && duplicate.disposition.mutatesOperationalRecord).toBe(false)
    expect(certificate.ok && certificate.disposition.mutatesOperationalRecord).toBe(false)
  })

  it('blocks obvious secret material from staff-entered disposition metadata', () => {
    const result = buildWorkflowReminderDispositionDto({
      reminder: baseReminder,
      action: 'dismiss',
      reason: 'other',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
      staffNote: 'do not store OPENAI_API_KEY=unsafe',
    })

    expect(result).toMatchObject({ ok: false })
  })

  it('falls back to a dashboard href when disposition reminder links are unsafe', () => {
    const result = buildWorkflowReminderDispositionDto({
      reminder: {
        ...baseReminder,
        href: 'javascript:alert("unsafe")',
      },
      action: 'dismiss',
      reason: 'not_relevant',
      actorLabel: 'Safe QA staff',
      activeParishLabel: 'Safe Parish A',
      now: new Date('2026-07-02T12:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.disposition.href).toBe('/dashboard')
    expect(result.disposition.auditMetadata.safe_source_reference).toBe(baseReminder.id)
  })
})
