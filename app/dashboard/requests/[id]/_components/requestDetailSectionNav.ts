import { dispatchRequestDetailGoToSection } from './requestDetailTabs'

/** Legacy hash targets that now live inside the Communication tab. */
const REQUEST_DETAIL_HASH_ALIASES: Record<string, string> = {
  'email-communication': 'communication-hub',
}

export function resolveRequestDetailSectionId(sectionIdOrHash: string): string {
  const id = sectionIdOrHash.startsWith('#')
    ? sectionIdOrHash.slice(1)
    : sectionIdOrHash
  return REQUEST_DETAIL_HASH_ALIASES[id] ?? id
}

/** Highlight a section element in place (call after the correct tab is visible). */
export function highlightRequestDetailSectionElement(el: HTMLElement): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cls = 'request-detail-hash-highlight'
  el.classList.remove(cls)
  el.style.animationDuration = ''
  void el.offsetWidth
  el.classList.add(cls)
  el.style.animationDuration = reduced ? '2200ms' : '3500ms'
  window.setTimeout(() => {
    el.classList.remove(cls)
    el.style.animationDuration = ''
  }, reduced ? 2600 : 3900)
}

/** Switch to the correct tab, scroll, and highlight a section (hash without `#` or with). */
export function scrollAndHighlightRequestSection(sectionIdOrHash: string): void {
  if (typeof window === 'undefined') return
  const id = resolveRequestDetailSectionId(sectionIdOrHash)
  dispatchRequestDetailGoToSection(id)
}

/** Scroll and highlight when the target section is already visible in the active tab. */
export function scrollAndHighlightRequestSectionInPlace(sectionIdOrHash: string): void {
  if (typeof window === 'undefined') return
  const id = resolveRequestDetailSectionId(sectionIdOrHash)
  const el = document.getElementById(id) as HTMLElement | null
  if (!el) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  highlightRequestDetailSectionElement(el)
}
