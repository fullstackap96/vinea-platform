/** Dashboard path to open a request detail page (no workflow anchor). */
export function requestDetailHref(requestId: string): string {
  return `/dashboard/requests/${encodeURIComponent(String(requestId).trim())}`
}

export function isRequestDetailHref(href: string): boolean {
  return /^\/dashboard\/requests\/[^/]+$/.test(href.split('#')[0] ?? '')
}

/** Standalone request name link (tab focus + keyboard Enter). */
export const dashboardRequestNameLinkClassName =
  'group/name inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-sm font-semibold text-brand underline-offset-2 transition-colors hover:text-brand-hover hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1'

/** Request name styling inside a parent card/row link (avoids nested anchors). */
export const dashboardRequestNameInCardClassName =
  'group/name inline-flex max-w-full items-center gap-1.5 font-semibold text-brand underline-offset-2 transition-colors group-hover/card:text-brand-hover group-hover/card:underline'

export const dashboardRequestNameArrowClassName =
  'h-4 w-4 shrink-0 text-brand/70 transition-transform group-hover/name:translate-x-0.5 group-hover/card:translate-x-0.5'

export function dashboardRequestNameSizeClassName(size: 'sm' | 'base' | 'lg' = 'base'): string {
  if (size === 'lg') return 'text-lg sm:text-xl'
  if (size === 'sm') return 'text-sm'
  return 'text-base'
}

export function dashboardRequestOpenLabel(name: string): string {
  const displayName = String(name ?? '').trim() || '—'
  return `Open request for ${displayName}`
}
