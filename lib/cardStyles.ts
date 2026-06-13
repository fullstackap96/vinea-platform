/**
 * Subtle hover polish for dashboard cards (lift + shadow).
 * Pair with `shadow-sm` on the element; hover moves to `shadow-md`.
 */
export const dashboardCardHoverPolish =
  'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-md'

const dashboardLinkCardFocus =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2'

const dashboardRequestLinkCardHover =
  'transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-px hover:border-gray-300/90 hover:bg-slate-50/80 hover:shadow-md'

/** Click-through request cards (needs-attention + main list). */
export const dashboardRequestLinkCardP4 = `group/card block cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] ${dashboardRequestLinkCardHover} ${dashboardLinkCardFocus}`

export const dashboardRequestLinkCardP5 = `group/card block cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03] ${dashboardRequestLinkCardHover} ${dashboardLinkCardFocus}`

/** Clickable request info region inside cards that also expose row actions (Follow-Up Queue). */
export const dashboardRequestContentLink = `group/card block cursor-pointer rounded-lg border border-transparent transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-gray-300/90 hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-1 -m-1 p-1 sm:-m-1.5 sm:p-1.5`
