import React from 'react'

/**
 * Inline form feedback: error (red), instructional (amber), or success (green).
 * Message text is rendered unchanged.
 */
function getInlineFeedbackStyle(message: string): {
  className: string
  role: 'alert' | 'status'
} {
  const lower = message.trim().toLowerCase()

  const looksError =
    lower.startsWith('error') ||
    lower.includes('failed') ||
    lower.includes('could not') ||
    lower.includes('missing.') ||
    lower.includes('is required.') ||
    lower.includes('needs to be reconnected') ||
    lower.includes('connection has expired') ||
    (lower.startsWith('please ') &&
      (lower.includes('enter') ||
        lower.includes('choose') ||
        lower.includes('generate')))

  if (looksError) {
    return {
      className:
        'mt-3 rounded-xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm leading-relaxed text-red-950',
      role: 'alert',
    }
  }

  const looksNeutral =
    lower.startsWith('set a confirmed') ||
    lower.startsWith('a google calendar event already') ||
    lower.startsWith('no google calendar event is linked') ||
    lower.startsWith('there is already something scheduled at this time')

  if (looksNeutral) {
    return {
      className:
        'mt-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950',
      role: 'status',
    }
  }

  return {
    className:
      'mt-3 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm leading-relaxed text-emerald-950',
    role: 'status',
  }
}

export function InlineFormMessage({
  message,
  className: extraClass = '',
}: {
  message: string
  className?: string
}) {
  const t = message.trim()
  if (!t) return null
  const { className, role } = getInlineFeedbackStyle(message)
  return (
    <p className={`${className} ${extraClass}`.trim()} role={role}>
      {message}
    </p>
  )
}
