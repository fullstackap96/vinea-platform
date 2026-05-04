/**
 * Subtle hover polish for dashboard cards (lift + shadow).
 * Pair with `shadow-sm` on the element; hover moves to `shadow-md`.
 */
export const dashboardCardHoverPolish =
  'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-md'

const dashboardLinkCardFocus =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'

/** Click-through request cards (needs-attention + main list). */
export const dashboardRequestLinkCardP4 = `block cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] ${dashboardCardHoverPolish} ${dashboardLinkCardFocus}`

export const dashboardRequestLinkCardP5 = `block cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03] ${dashboardCardHoverPolish} ${dashboardLinkCardFocus}`
