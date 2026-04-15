/** Intake option values stored in `ocia_request_details`; labels for UI and staff views. */

export const SACRAMENTAL_BACKGROUND_VALUES = [
  'not_baptized',
  'baptized_catholic',
  'baptized_christian_non_catholic',
  'unsure',
] as const

export type SacramentalBackgroundValue = (typeof SACRAMENTAL_BACKGROUND_VALUES)[number]

export const SACRAMENTAL_BACKGROUND_LABEL: Record<SacramentalBackgroundValue, string> = {
  not_baptized: 'Not baptized',
  baptized_catholic: 'Baptized Catholic',
  baptized_christian_non_catholic: 'Baptized Christian (non-Catholic)',
  unsure: 'Unsure',
}

export const SEEKING_VALUES = [
  'baptism',
  'confirmation',
  'first_communion',
  'full_communion',
  'learning_more',
] as const

export type SeekingValue = (typeof SEEKING_VALUES)[number]

export const SEEKING_LABEL: Record<SeekingValue, string> = {
  baptism: 'Baptism',
  confirmation: 'Confirmation',
  first_communion: 'First Communion',
  full_communion: 'Full communion with the Catholic Church',
  learning_more: 'Learning more / not sure yet',
}

export const CONTACT_METHOD_VALUES = ['email', 'phone', 'text'] as const

export type ContactMethodValue = (typeof CONTACT_METHOD_VALUES)[number]

export const CONTACT_METHOD_LABEL: Record<ContactMethodValue, string> = {
  email: 'Email',
  phone: 'Phone call',
  text: 'Text message',
}

export function labelSacramentalBackground(value: string | null | undefined): string {
  const k = String(value || '') as SacramentalBackgroundValue
  return SACRAMENTAL_BACKGROUND_LABEL[k] || value || '—'
}

export function labelSeeking(value: string | null | undefined): string {
  const k = String(value || '') as SeekingValue
  return SEEKING_LABEL[k] || value || '—'
}

export function labelContactMethod(value: string | null | undefined): string {
  const k = String(value || '') as ContactMethodValue
  return CONTACT_METHOD_LABEL[k] || value || '—'
}
