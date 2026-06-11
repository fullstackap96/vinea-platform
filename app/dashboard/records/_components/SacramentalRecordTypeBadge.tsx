import type { ComponentType } from 'react'
import {
  BookOpen,
  Cross,
  Droplets,
  Flame,
  Heart,
  Sparkles,
  Wine,
} from 'lucide-react'
import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import type { SacramentalRecordType } from '@/lib/types/sacramentalRecords'

const baseClassName =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold leading-tight tracking-tight'

function getBadgeSpec(recordType: unknown): {
  label: string
  className: string
  Icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>
} {
  const key = String(recordType ?? '').trim().toLowerCase() as SacramentalRecordType
  const label = formatSacramentalRecordType(recordType) || 'Record'

  switch (key) {
    case 'baptism':
      return {
        label,
        Icon: Droplets,
        className: 'bg-sky-50 text-sky-900 border border-sky-200',
      }
    case 'marriage':
      return {
        label,
        Icon: Heart,
        className: 'bg-rose-50 text-rose-900 border border-rose-200',
      }
    case 'funeral':
      return {
        label,
        Icon: Cross,
        className: 'bg-slate-50 text-slate-900 border border-slate-200',
      }
    case 'confirmation':
      return {
        label,
        Icon: Sparkles,
        className: 'bg-violet-50 text-violet-900 border border-violet-200',
      }
    case 'first_communion':
      return {
        label,
        Icon: Wine,
        className: 'bg-amber-50 text-amber-900 border border-amber-200',
      }
    case 'ocia':
      return {
        label,
        Icon: Flame,
        className: 'bg-emerald-50 text-emerald-950 border border-emerald-200',
      }
    case 'rcic':
      return {
        label,
        Icon: BookOpen,
        className: 'bg-indigo-50 text-indigo-900 border border-indigo-200',
      }
    default:
      return {
        label,
        Icon: BookOpen,
        className: 'bg-gray-50 text-gray-900 border border-gray-200',
      }
  }
}

export function SacramentalRecordTypeBadge({ recordType }: { recordType: unknown }) {
  const spec = getBadgeSpec(recordType)
  const Icon = spec.Icon

  return (
    <span className={`${baseClassName} ${spec.className}`} title={`Record type: ${spec.label}`}>
      <Icon className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
      <span>{spec.label}</span>
    </span>
  )
}
