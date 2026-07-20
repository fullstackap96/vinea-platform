import { publicIntakeClientErrorMessage } from '@/lib/publicIntakeClientMessages'

export type PublicIntakeSubmissionResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string }

const PUBLIC_INTAKE_CONFIRMATION_TIMEOUT_MS = 60_000
const PUBLIC_INTAKE_UNCONFIRMED_MESSAGE =
  "We couldn't confirm your request. Please try once more without changing the form, or contact the parish office."

let pendingSubmissionAttempt: { fingerprint: string; id: string } | null = null

function submissionAttemptFor(payload: Record<string, unknown>) {
  const fingerprint = JSON.stringify(payload)
  if (pendingSubmissionAttempt?.fingerprint !== fingerprint) {
    pendingSubmissionAttempt = {
      fingerprint,
      id: crypto.randomUUID(),
    }
  }
  return pendingSubmissionAttempt
}

export async function submitPublicIntake(
  payload: Record<string, unknown>,
): Promise<PublicIntakeSubmissionResult> {
  const attempt = submissionAttemptFor(payload)
  try {
    const response = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, submissionAttemptId: attempt.id }),
      signal: AbortSignal.timeout(PUBLIC_INTAKE_CONFIRMATION_TIMEOUT_MS),
    })
    const data = (await response.json().catch(() => null)) as {
      ok?: unknown
      requestId?: unknown
      error?: unknown
    } | null

    if (!response.ok || data?.ok !== true) {
      return { ok: false, error: publicIntakeClientErrorMessage(data?.error) }
    }

    const requestId = typeof data.requestId === 'string' ? data.requestId.trim() : ''
    if (!requestId) {
      return { ok: false, error: publicIntakeClientErrorMessage(null) }
    }

    pendingSubmissionAttempt = null
    return { ok: true, requestId }
  } catch {
    return { ok: false, error: PUBLIC_INTAKE_UNCONFIRMED_MESSAGE }
  }
}

export const publicIntakeSubmissionClientTestInternals = {
  confirmationTimeoutMs: PUBLIC_INTAKE_CONFIRMATION_TIMEOUT_MS,
  unconfirmedMessage: PUBLIC_INTAKE_UNCONFIRMED_MESSAGE,
  resetPendingSubmissionAttempt() {
    pendingSubmissionAttempt = null
  },
}
