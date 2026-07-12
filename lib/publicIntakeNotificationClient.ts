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
