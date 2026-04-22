/**
 * Shared button classes (UI polish — keep in sync across dashboard, login, detail).
 *
 * Primary = main action (solid). Secondary = outline / low emphasis.
 */
const primaryInteractive =
  'bg-brand text-white rounded-lg font-medium shadow-sm hover:bg-brand-hover active:bg-brand-active active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2'

const secondaryInteractive =
  'border border-gray-300 bg-white text-gray-900 rounded-lg font-medium shadow-sm hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring/35 focus-visible:ring-offset-2'

/** Stronger border for marketing / hero secondary CTAs. */
const secondaryLandingInteractive =
  'border border-gray-800 bg-white text-gray-900 rounded-lg font-medium shadow-sm hover:border-gray-900 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring/35 focus-visible:ring-offset-2'

const dangerSecondaryInteractive =
  'border border-red-700 bg-white text-red-800 rounded-lg font-medium shadow-sm hover:bg-red-50 active:bg-red-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150'

const primaryBase = `inline-flex items-center justify-center ${primaryInteractive}`
const secondaryBase = `inline-flex items-center justify-center ${secondaryInteractive}`
const secondaryLandingBase = `inline-flex items-center justify-center ${secondaryLandingInteractive}`
const dangerSecondaryBase = `inline-flex items-center justify-center ${dangerSecondaryInteractive}`

export const primaryButtonSm = `${primaryBase} px-3 py-2 text-sm`
export const primaryButtonMd = `${primaryBase} px-4 py-2.5 text-sm`
export const primaryButtonLg = `${primaryBase} px-6 py-3 text-base w-full`

export const secondaryButtonSm = `${secondaryBase} px-3 py-2 text-sm`
export const secondaryButtonMd = `${secondaryBase} px-4 py-2.5 text-sm`

/** Destructive outline (e.g. delete calendar event). */
export const dangerButtonMd = `${dangerSecondaryBase} px-4 py-2.5 text-sm`

/** Hero / landing: primary width full on mobile, auto from `sm`. */
export const primaryButtonLanding = `${primaryBase} px-6 py-3 text-base w-full sm:w-auto`

/** Hero / landing: secondary with stronger border for contrast on light sections. */
export const secondaryButtonLanding = `${secondaryLandingBase} px-6 py-3 text-base w-full sm:w-auto`
