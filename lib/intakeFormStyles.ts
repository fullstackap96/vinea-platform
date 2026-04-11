/**
 * Shared field styles for public intake forms — align with landing/login inputs.
 */
export const intakeInputClass =
  'w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 placeholder:text-gray-500 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1'

export const intakeTextareaClass = `${intakeInputClass} min-h-[88px] resize-y leading-relaxed`

export const intakeSectionHeadingClass = 'text-base font-semibold text-gray-900'

export const intakeLabelClass = 'block text-sm font-medium text-gray-700'

/** Status / error copy after submit — green when submission succeeded. */
export function intakeStatusMessageClass(message: string): string {
  const t = message.toLowerCase()
  if (t.includes('successfully')) {
    return 'mt-6 rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-950'
  }
  return 'mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950'
}
