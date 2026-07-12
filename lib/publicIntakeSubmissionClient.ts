import { publicIntakeClientErrorMessage } from '@/lib/publicIntakeClientMessages'

export type PublicIntakeSubmissionResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string }

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
  } catch (error: unknown) {
    return { ok: false, error: publicIntakeClientErrorMessage(error) }
  }
}

export const publicIntakeSubmissionClientTestInternals = {
  resetPendingSubmissionAttempt() {
    pendingSubmissionAttempt = null
  },
}
