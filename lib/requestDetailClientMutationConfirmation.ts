import { awaitClientMutationConfirmation } from './clientMutationConfirmation'

export const REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS = 60_000

export function awaitRequestDetailClientMutationConfirmation<T>(operation: Promise<T>) {
  return awaitClientMutationConfirmation(
    operation,
    REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS,
  )
}
