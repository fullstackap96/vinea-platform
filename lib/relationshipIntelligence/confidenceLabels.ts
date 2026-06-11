import type { ConfidenceLevel } from './types'

export const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  certain: 'Certain',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const CONFIDENCE_CHIP_CLASS: Record<ConfidenceLevel, string> = {
  certain:
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-950 border-emerald-200',
  high: 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-blue-50 text-blue-950 border-blue-200',
  medium:
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-950 border-amber-200',
  low: 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-800 border-gray-200',
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  certain: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function confidenceRank(level: ConfidenceLevel): number {
  return CONFIDENCE_RANK[level]
}
