'use client'

import type { AtRiskEvaluation, AtRiskLevel } from '@/lib/atRiskRequest'
import type { FollowUpEngineUrgency, SmartFollowUpEvaluation } from '@/lib/smartFollowUpEngine'
import type { RequestWorkflowV2Result } from '@/lib/requestWorkflowV2'
import {
  workflowUrgencyChipClassName,
  workflowUrgencyLabel,
} from '@/lib/requestWorkflowV2'

const pillShell =
  'min-w-[6.5rem] max-w-[14rem] rounded-lg border border-gray-200/90 bg-white px-3 py-2 ring-1 ring-gray-900/[0.04]'

function capitalizeWord(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function atRiskTone(level: AtRiskLevel, active: boolean): string {
  if (!active && level === 'low') {
    return 'border-emerald-200/90 bg-emerald-50 text-emerald-950'
  }
  switch (level) {
    case 'critical':
      return 'border-red-300/90 bg-red-50 text-red-950'
    case 'high':
      return 'border-orange-300/90 bg-orange-50 text-orange-950'
    case 'medium':
      return 'border-amber-200/90 bg-amber-50 text-amber-950'
    case 'low':
    default:
      return 'border-slate-200/90 bg-slate-50 text-slate-900'
  }
}

function followUpTone(urgency: FollowUpEngineUrgency): string {
  switch (urgency) {
    case 'critical':
      return 'border-red-300/90 bg-red-50 text-red-950'
    case 'high':
      return 'border-orange-300/90 bg-orange-50 text-orange-950'
    case 'medium':
      return 'border-sky-200/90 bg-sky-50 text-sky-950'
    case 'low':
    default:
      return 'border-slate-200/90 bg-slate-50 text-slate-900'
  }
}

function LabeledTile(props: {
  label: string
  value: string
  toneClass: string
  title?: string
}) {
  const { label, value, toneClass, title } = props
  return (
    <div className={`${pillShell} ${toneClass}`} title={title}>
      <span className="block text-xs font-semibold text-gray-700">{label}</span>
      <span className="mt-1 block text-sm font-semibold leading-snug text-balance">{value}</span>
    </div>
  )
}

export type DashboardRequestRowBadgesProps = {
  workflow: RequestWorkflowV2Result
  smartFollowUp: SmartFollowUpEvaluation
  atRisk: AtRiskEvaluation
  waitingOnDisplay: string
  staffDisplay: string
  priestDisplay: string
}

/**
 * Scan-friendly row for parish staff: next step plus compact labeled tiles
 * (risk, follow-up engine, waiting, assignments). Uses sentence-sized type.
 */
export function DashboardRequestRowBadges(props: DashboardRequestRowBadgesProps) {
  const { workflow, smartFollowUp, atRisk, waitingOnDisplay, staffDisplay, priestDisplay } =
    props

  const riskValue = atRisk.isAtRisk
    ? capitalizeWord(atRisk.highestRiskLevel)
    : 'Low — nothing flagged'
  const riskTitle = atRisk.isAtRisk ? atRisk.riskReasons.join(' ') : undefined

  return (
    <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-700">Next step</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold leading-none ${workflowUrgencyChipClassName(workflow.urgency)}`}
          >
            {workflowUrgencyLabel[workflow.urgency]}
          </span>
          <span className="text-base font-semibold leading-snug text-gray-900 text-balance">
            {workflow.nextStepTitle}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 text-pretty">
          {workflow.reason}
        </p>
      </div>

      <div>
        <p className="sr-only">Request status overview</p>
        <div className="flex flex-wrap gap-2">
          <LabeledTile
            label="Risk"
            value={riskValue}
            toneClass={atRiskTone(atRisk.highestRiskLevel, atRisk.isAtRisk)}
            title={riskTitle}
          />
          <LabeledTile
            label="Follow-up"
            value={smartFollowUp.label}
            toneClass={followUpTone(smartFollowUp.urgency)}
            title={smartFollowUp.description}
          />
          <LabeledTile
            label="Waiting on"
            value={waitingOnDisplay}
            toneClass="border-violet-200/90 bg-violet-50 text-violet-950"
          />
          <LabeledTile
            label="Staff"
            value={staffDisplay}
            toneClass="border-gray-200/90 bg-white text-gray-900"
          />
          <LabeledTile
            label="Priest"
            value={priestDisplay}
            toneClass="border-gray-200/90 bg-white text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}
