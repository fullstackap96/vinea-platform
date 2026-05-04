import type { ReactNode } from 'react'
import {
  sectionCardDescriptionClassName,
  sectionCardTitleClassName,
} from '@/lib/sectionHeader'

type Props = {
  id?: string
  /** When `plain`, only wraps children in a scroll-target section (no title band). */
  variant?: 'default' | 'plain'
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

const shell =
  'scroll-mt-6 sm:scroll-mt-8 rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-900/[0.035]'

export function WorkflowSectionCard({
  id,
  variant = 'default',
  title,
  description,
  children,
  className,
}: Props) {
  if (variant === 'plain') {
    return (
      <section id={id} className={`${shell} ${className ?? ''}`.trim()}>
        {children}
      </section>
    )
  }

  return (
    <section id={id} className={`${shell} p-5 sm:p-7 ${className ?? ''}`.trim()}>
      {title ? (
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h2 className={sectionCardTitleClassName}>{title}</h2>
          {description ? (
            <p className={sectionCardDescriptionClassName}>{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
