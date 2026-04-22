'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Muted icon size for label rows (matches prior DetailFieldRow). */
export const detailFieldIconClass = 'mt-0.5 h-4 w-4 shrink-0 text-brand'

export const labelValueGridClass =
  'grid grid-cols-[120px_1fr] gap-x-3 gap-y-2.5 sm:gap-y-3'

const labelCellClass = 'min-w-0 self-start text-sm text-gray-500'
const valueCellClass = 'min-w-0 text-sm font-medium text-gray-800 break-words'

export function LabelValueGrid({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`${labelValueGridClass} ${className}`.trim()}>{children}</div>
}

export function LabelValueRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="contents">
      <div className={labelCellClass}>{label}</div>
      <div className={valueCellClass}>{value}</div>
    </div>
  )
}

/** Optional leading icon + label text (label column only). */
export function FieldLabel({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon
  children: ReactNode
}) {
  if (!Icon) {
    return <span>{children}</span>
  }
  return (
    <span className="flex items-start gap-2">
      <Icon className={detailFieldIconClass} aria-hidden />
      <span>{children}</span>
    </span>
  )
}
