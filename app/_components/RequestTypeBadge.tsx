import React from 'react'
import {
  Church,
  Cross,
  Droplets,
  Flame,
  Heart,
  Home,
} from 'lucide-react'
import { formatRequestType } from '@/lib/formatRequestType'

type RequestTypeKey = 'baptism' | 'funeral' | 'wedding' | 'ocia' | 'join_parish'

type BadgeSpec = {
  label: string
  className: string
  Icon: React.ComponentType<{
    className?: string
    strokeWidth?: number
    'aria-hidden'?: boolean
  }>
}

function requestTypeKey(raw: unknown): RequestTypeKey | null {
  const t = String(raw ?? '').trim().toLowerCase()
  if (t === 'baptism') return 'baptism'
  if (t === 'funeral') return 'funeral'
  if (t === 'wedding') return 'wedding'
  if (t === 'ocia') return 'ocia'
  if (t === 'join_parish') return 'join_parish'
  return null
}

function getBadgeSpec(requestType: unknown): BadgeSpec {
  const key = requestTypeKey(requestType)

  const label = formatRequestType(requestType) || 'Request'

  if (key === 'baptism') {
    return {
      label,
      Icon: Droplets,
      className: 'bg-sky-50 text-sky-900 border border-sky-200',
    }
  }
  if (key === 'funeral') {
    return {
      label,
      Icon: Cross,
      className: 'bg-slate-50 text-slate-900 border border-slate-200',
    }
  }
  if (key === 'wedding') {
    return {
      label,
      Icon: Heart,
      className: 'bg-rose-50 text-rose-900 border border-rose-200',
    }
  }
  if (key === 'ocia') {
    return {
      label,
      Icon: Flame,
      className: 'bg-emerald-50 text-emerald-950 border border-emerald-200',
    }
  }
  if (key === 'join_parish') {
    return {
      label,
      Icon: Church,
      className: 'bg-amber-50 text-amber-900 border border-amber-200',
    }
  }

  return {
    label,
    Icon: Home,
    className: 'bg-gray-50 text-gray-900 border border-gray-200',
  }
}

const baseClassName =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold leading-tight tracking-tight'

export function RequestTypeBadge({ requestType }: { requestType?: unknown }) {
  const spec = getBadgeSpec(requestType)
  const Icon = spec.Icon

  return (
    <span className={`${baseClassName} ${spec.className}`} title={`Request type: ${spec.label}`}>
      <Icon className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
      <span>{spec.label}</span>
    </span>
  )
}

