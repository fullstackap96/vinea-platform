export type RequestTimelineEventKind =
  | 'submitted'
  | 'email_sent'
  | 'communication_logged'
  | 'internal_note'
  | 'confirmed_date'
  | 'follow_up_set'
  | 'blocked'
  | 'completed'
  | 'sacramental_record'

export type RequestTimelineEvent = {
  /** Stable key for React lists — not shown in the UI. */
  key: string
  kind: RequestTimelineEventKind
  label: string
  detail?: string
  occurredAt: string
}
