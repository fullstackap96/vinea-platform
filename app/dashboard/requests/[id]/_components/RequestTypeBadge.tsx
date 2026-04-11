import React from 'react'
import { chipBase } from '@/lib/chipStyles'

const STYLES: Record<string, string> = {
  baptism: 'bg-blue-50 text-blue-900 border border-blue-200',
  funeral: 'bg-slate-100 text-slate-900 border border-slate-300',
  wedding: 'bg-rose-50 text-rose-900 border border-rose-200',
}

export function RequestTypeBadge({ requestType }: { requestType?: string | null }) {
  const t = String(requestType || 'baptism').toLowerCase()
  const label =
    t === 'funeral' ? 'Funeral' : t === 'wedding' ? 'Wedding' : t === 'baptism' ? 'Baptism' : t
  const palette = STYLES[t] || 'bg-gray-100 text-gray-900 border border-gray-300'

  return (
    <span className={`${chipBase} ${palette}`} title={`Request type: ${label}`}>
      {label}
    </span>
  )
}
