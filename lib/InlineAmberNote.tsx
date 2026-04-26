import React from 'react'

export function InlineAmberNote({ message }: { message: string }) {
  const t = String(message || '').trim()
  if (!t) return null
  return (
    <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
      {t}
    </p>
  )
}

