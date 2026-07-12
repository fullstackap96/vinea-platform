const PUBLIC_INTAKE_SUBMISSION_ATTEMPT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type ExistingPublicIntakeAttempt = {
  requestId: string
  requestType: string
  parishionerId: string
  parishId: string
  fullName: string
  email: string
  phone: string
  completionAuditConfirmed: boolean
}

export type ExpectedPublicIntakeAttempt = {
  submissionAttemptId: string
  requestType: string
  parishId: string
  fullName: string
  email: string
  phone: string
}

export function isValidPublicIntakeSubmissionAttemptId(value: string): boolean {
  return PUBLIC_INTAKE_SUBMISSION_ATTEMPT_PATTERN.test(value.trim())
}

export function existingPublicIntakeAttemptMatches(
  existing: ExistingPublicIntakeAttempt,
  expected: ExpectedPublicIntakeAttempt
): boolean {
  return (
    existing.requestId === expected.submissionAttemptId &&
    existing.requestType === expected.requestType &&
    existing.parishId === expected.parishId &&
    existing.fullName.trim() === expected.fullName.trim() &&
    existing.email.trim().toLowerCase() === expected.email.trim().toLowerCase() &&
    existing.phone.trim() === expected.phone.trim() &&
    existing.completionAuditConfirmed
  )
}
