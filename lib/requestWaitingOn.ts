/** Stored on `requests.waiting_on` (snake_case values). */
export const REQUEST_WAITING_ON_VALUES = [
  'family_response',
  'priest_availability',
  'documents',
  'date_confirmation',
  'parish_staff_action',
  'payment_or_stipend',
  'godparent_paperwork',
  'marriage_prep_documents',
  'other',
] as const

export type RequestWaitingOnValue = (typeof REQUEST_WAITING_ON_VALUES)[number]

export const REQUEST_WAITING_ON_LABELS: Readonly<Record<RequestWaitingOnValue, string>> = {
  family_response: 'Family response',
  priest_availability: 'Priest availability',
  documents: 'Documents',
  date_confirmation: 'Date confirmation',
  parish_staff_action: 'Parish staff action',
  payment_or_stipend: 'Payment or stipend',
  godparent_paperwork: 'Godparent paperwork',
  marriage_prep_documents: 'Marriage preparation documents',
  other: 'Other',
}

export const REQUEST_WAITING_ON_OPTIONS: ReadonlyArray<{
  value: RequestWaitingOnValue
  label: string
}> = REQUEST_WAITING_ON_VALUES.map((value) => ({
  value,
  label: REQUEST_WAITING_ON_LABELS[value],
}))

export function isRequestWaitingOn(value: unknown): value is RequestWaitingOnValue {
  return (REQUEST_WAITING_ON_VALUES as readonly string[]).includes(String(value ?? '').trim())
}

/** Returns null when unset or invalid. */
export function normalizeRequestWaitingOn(value: unknown): RequestWaitingOnValue | null {
  const s = String(value ?? '').trim()
  if (!s) return null
  return isRequestWaitingOn(s) ? (s as RequestWaitingOnValue) : null
}

export function requestWaitingOnLabel(value: unknown): string | null {
  const w = normalizeRequestWaitingOn(value)
  return w ? REQUEST_WAITING_ON_LABELS[w] : null
}
