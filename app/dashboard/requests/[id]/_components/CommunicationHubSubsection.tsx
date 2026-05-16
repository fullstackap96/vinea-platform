import type { ReactNode } from 'react'

const subsectionShell =
  'scroll-mt-6 sm:scroll-mt-8 rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5'

export function CommunicationHubSubsection({
  id,
  title,
  description,
  children,
  className = '',
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div id={id} className={`${subsectionShell} ${className}`.trim()}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  )
}
