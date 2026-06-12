export const REQUEST_DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'communication', label: 'Communication' },
  { id: 'notes', label: 'Notes & Completion' },
] as const

export type RequestDetailTabId = (typeof REQUEST_DETAIL_TABS)[number]['id']

/** Maps in-page section ids to the tab that contains them. */
export const REQUEST_DETAIL_SECTION_TAB: Record<string, RequestDetailTabId> = {
  'next-step-reference': 'overview',
  'contact-information': 'overview',
  'request-details': 'details',
  assignment: 'scheduling',
  'scheduling-records': 'scheduling',
  'next-follow-up': 'scheduling',
  'confirmed-time': 'scheduling',
  checklist: 'scheduling',
  'communication-hub': 'communication',
  'ai-tools': 'communication',
  'send-email': 'communication',
  communication: 'communication',
  'communication-history': 'communication',
  'email-communication': 'communication',
  'internal-notes': 'notes',
  'staff-notes': 'notes',
  'ready-to-complete': 'notes',
  completion: 'notes',
  'next-step': 'overview',
}

export function tabForRequestDetailSection(sectionId: string): RequestDetailTabId {
  return REQUEST_DETAIL_SECTION_TAB[sectionId] ?? 'overview'
}

export const REQUEST_DETAIL_GO_TO_SECTION_EVENT = 'request-detail:go-to-section'

export function dispatchRequestDetailGoToSection(sectionId: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(REQUEST_DETAIL_GO_TO_SECTION_EVENT, {
      detail: { sectionId },
    })
  )
}
