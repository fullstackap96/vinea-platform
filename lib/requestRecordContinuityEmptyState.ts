export type RequestRecordContinuityEmptyStateCue = {
  statusLabel: string
  title: string
  detail: string
  boundary: string
}

export function buildRequestRecordContinuityEmptyStateCue(
  recordsNeedingRequestLinkReview: number
): RequestRecordContinuityEmptyStateCue | null {
  if (recordsNeedingRequestLinkReview > 0) return null

  return {
    statusLabel: 'Continuity clear',
    title: 'No records currently need request-link review',
    detail:
      'The selected parish has no sacramental records in this dashboard signal that need request-to-record continuity review right now.',
    boundary:
      'Keep certificate work staff-reviewed. This cue does not link records, generate certificates, send reminders, or make sacramental or canonical decisions.',
  }
}
