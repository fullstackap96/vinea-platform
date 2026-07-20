export class ClientOperationTimeoutError extends Error {
  constructor() {
    super('Client operation confirmation timed out.')
    this.name = 'ClientOperationTimeoutError'
  }
}

export async function withClientOperationDeadline<T>(
  operation: PromiseLike<T>,
  timeoutMs: number,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('Client operation timeout must be a positive finite number.')
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new ClientOperationTimeoutError()), timeoutMs)
  })

  try {
    return await Promise.race([Promise.resolve(operation), timeout])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}
