/**
 * Vinea V2 — shared layout and feedback patterns (calm, legible, parish-friendly).
 * Prefer these over one-off Tailwind strings where the same shape repeats.
 */

/** Page well behind white cards (dashboard, staff areas). */
export const vineaAppCanvasClass = 'bg-slate-50'

/** Dashed “nothing here yet” panels. */
export const vineaEmptyStateClassName =
  'mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-200/90 bg-white px-5 py-12 text-center shadow-sm sm:px-8'

/** White section card (summary strips, filter panel shell). */
export const vineaSectionShellClassName =
  'rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm ring-1 ring-gray-900/[0.03] sm:p-6'

/** Accessible text inputs (login, filters). */
export const vineaInputFieldClassName =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-brand/35 focus:outline-none focus:ring-2 focus:ring-brand/20'

/** Inline loading row with spinner + label. */
export const vineaSpinnerClassName =
  'h-5 w-5 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin'
