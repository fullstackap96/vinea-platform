import { publicIntakeClientErrorMessage } from '@/lib/publicIntakeClientMessages'

export type PublicIntakeSubmissionResult =
  | { ok: true; requestId: string }
  | { ok: false; error: string }

export async function submitPublicIntake(
  payload: Record<string, unknown>,
): Promise<PublicIntakeSubmissionResult> {
  try {
    const response = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

    return { ok: true, requestId }
  } catch (error: unknown) {
    return { ok: false, error: publicIntakeClientErrorMessage(error) }
  }
}
