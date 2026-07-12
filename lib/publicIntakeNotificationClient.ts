export function logPublicIntakeNotificationFailure(status: number): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.warn('[public-intake] staff notification failed', {
    statusLabel: Number.isFinite(status) ? `http-${status}` : 'unknown-status',
  })
}

export function logPublicIntakeNotificationException(): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.warn('[public-intake] staff notification exception', {
    statusLabel: 'network-or-client-error',
  })
}

const PUBLIC_INTAKE_NOTIFICATION_TIMEOUT_MS = 15_000

export function queuePublicIntakeStaffNotification(
  payload: Record<string, unknown>
): void {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    PUBLIC_INTAKE_NOTIFICATION_TIMEOUT_MS
  )

  void Promise.resolve()
    .then(() =>
      fetch('/api/request-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
    )
    .then((response) => {
      if (!response.ok) {
        logPublicIntakeNotificationFailure(response.status)
      }
    })
    .catch(() => {
      logPublicIntakeNotificationException()
    })
    .finally(() => {
      clearTimeout(timeoutId)
    })
}
