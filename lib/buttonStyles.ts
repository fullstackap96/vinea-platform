/**
 * Shared button classes (UI polish — keep in sync across dashboard, login, detail).
 */
const primaryBase =
  'inline-flex items-center justify-center bg-black text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors'

const secondaryBase =
  'inline-flex items-center justify-center border border-gray-300 bg-white text-gray-900 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors'

export const primaryButtonSm = `${primaryBase} px-3 py-2 text-sm`
export const primaryButtonMd = `${primaryBase} px-4 py-2.5 text-sm`
export const primaryButtonLg = `${primaryBase} px-6 py-3 text-base w-full`

export const secondaryButtonSm = `${secondaryBase} px-3 py-2 text-sm`
export const secondaryButtonMd = `${secondaryBase} px-4 py-2.5 text-sm`
