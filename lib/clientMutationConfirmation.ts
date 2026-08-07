export type ClientMutationConfirmation<T> =
  | { confirmed: true; value: T }
  | { confirmed: false }

export async function awaitClientMutationConfirmation<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<ClientMutationConfirmation<T>> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Mutation confirmation timeout must be a positive finite number.')
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation.then((value) => ({ confirmed: true as const, value })),
      new Promise<{ confirmed: false }>((resolve) => {
        timeoutId = setTimeout(() => resolve({ confirmed: false }), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}
