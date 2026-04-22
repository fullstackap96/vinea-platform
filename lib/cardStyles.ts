/**
 * Subtle hover polish for dashboard cards (lift + shadow).
 * Pair with `shadow-sm` on the element; hover moves to `shadow-md`.
 */
export const dashboardCardHoverPolish =
  'transition-all duration-150 hover:-translate-y-[2px] hover:shadow-md'

const dashboardLinkCardFocus =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'

/** Click-through request cards (needs-attention + main list). */
export const dashboardRequestLinkCardP4 = `block rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer ${dashboardCardHoverPolish} ${dashboardLinkCardFocus}`

export const dashboardRequestLinkCardP5 = `block rounded-xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer ${dashboardCardHoverPolish} ${dashboardLinkCardFocus}`
