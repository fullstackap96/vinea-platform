'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  vineaInputFieldClassName,
  vineaSectionShellClassName,
  vineaSpinnerClassName,
} from '@/lib/vineaUi'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import {
  SettingsGoogleCalendarSection,
} from './SettingsGoogleCalendarSection'
import { SettingsWorkflowTemplatesSection } from './SettingsWorkflowTemplatesSection'
import {
  directoryFromMultilineText,
  directoryToMultilineText,
  PARISH_DIRECTORY_MAX_NAMES,
} from '@/lib/parishDirectory'
import {
  parishSettingsClientErrorMessage,
  publicRoutingDomainVerificationResultMessage,
} from '@/lib/parishSettingsClientMessages'
import { auditEventDetail, auditEventTitle, type AuditEventRow } from '@/lib/auditEvents'
import { VineaConfirmDialog } from '@/app/dashboard/_components/VineaConfirmDialog'
import {
  parseCreatedPublicIntakeTokenResponse,
  parseParishSettingsResponse,
  parsePublicIntakeDomainVerificationResponse,
  parsePublicIntakeRoutingResponse,
  parseRecentAuditEventsResponse,
  parseStaffAccessResponse,
  type CreatedPublicIntakeTokenReadModel,
  type ParishGoogleIntegrationReadModel,
  type PublicIntakeRoutingReadModel,
  type StaffAccessReadModel,
  type WorkflowSlaRules,
} from '@/lib/parishSettingsReadModels'

type StaffAccessRow = StaffAccessReadModel
type PublicIntakeRoutingSnapshot = PublicIntakeRoutingReadModel

type CreatedPublicIntakeToken = CreatedPublicIntakeTokenReadModel

const REQUEST_TYPES = [
  { key: 'funeral', label: 'Funeral' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'baptism', label: 'Baptism' },
  { key: 'ocia', label: 'OCIA' },
]

const PUBLIC_INTAKE_REQUEST_TYPE_LABELS: Record<string, string> = {
  baptism: 'Baptism',
  funeral: 'Funeral',
  wedding: 'Wedding',
  ocia: 'OCIA',
  join_parish: 'Join Parish',
}

const DEFAULT_SLA_RULES: WorkflowSlaRules = {
  firstContactDays: { funeral: 1, wedding: 2, baptism: 3, ocia: 3 },
  ownerAssignmentDays: { funeral: 0, wedding: 1, baptism: 2, ocia: 2 },
}

function normalizeSlaRules(value: WorkflowSlaRules | null | undefined): WorkflowSlaRules {
  return {
    firstContactDays: { ...DEFAULT_SLA_RULES.firstContactDays, ...(value?.firstContactDays ?? {}) },
    ownerAssignmentDays: {
      ...DEFAULT_SLA_RULES.ownerAssignmentDays,
      ...(value?.ownerAssignmentDays ?? {}),
    },
  }
}

function clampDays(value: string): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(30, Math.round(n)))
}

function requestTypeLabel(value: string | null): string {
  if (!value) return 'Any public form'
  return PUBLIC_INTAKE_REQUEST_TYPE_LABELS[value] ?? value
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  return date.toLocaleString()
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function ParishSettingsPage({ activeParishId = null }: { activeParishId?: string | null }) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [parishName, setParishName] = useState('')
  const [loadedParishName, setLoadedParishName] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [dailyBriefEnabled, setDailyBriefEnabled] = useState(false)
  const [dailyBriefEmail, setDailyBriefEmail] = useState('')
  const [dailyBriefLastSentOn, setDailyBriefLastSentOn] = useState<string | null>(null)
  const [dailyBriefLastError, setDailyBriefLastError] = useState<string | null>(null)
  const [dailyBriefSending, setDailyBriefSending] = useState(false)
  const parishSettingsMutationInFlightRef =
    useRef<'settings-save' | 'daily-brief-send' | null>(null)
  const dailyBriefDeliveryAttemptRef = useRef<{
    parishId: string | null
    id: string
  } | null>(null)
  const [dailyBriefMessage, setDailyBriefMessage] = useState('')
  const [confirmDailyBriefSendOpen, setConfirmDailyBriefSendOpen] = useState(false)
  const [staffText, setStaffText] = useState('')
  const [priestText, setPriestText] = useState('')
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [slaRules, setSlaRules] = useState<WorkflowSlaRules>(DEFAULT_SLA_RULES)
  const [staffAccess, setStaffAccess] = useState<StaffAccessRow[]>([])
  const [canManageStaff, setCanManageStaff] = useState(false)
  const [staffAccessLoading, setStaffAccessLoading] = useState(false)
  const [staffAccessAdding, setStaffAccessAdding] = useState(false)
  const [staffAccessUpdatingId, setStaffAccessUpdatingId] = useState<string | null>(null)
  const staffAccessMutationInFlightRef = useRef<string | null>(null)
  const [staffAccessMessage, setStaffAccessMessage] = useState('')
  const [staffAccessError, setStaffAccessError] = useState('')
  const [pendingStaffDeactivation, setPendingStaffDeactivation] =
    useState<StaffAccessRow | null>(null)
  const [pendingStaffRoleDowngrade, setPendingStaffRoleDowngrade] =
    useState<StaffAccessRow | null>(null)
  const [recentAuditEvents, setRecentAuditEvents] = useState<AuditEventRow[]>([])
  const [recentAuditError, setRecentAuditError] = useState('')
  const [publicIntakeRouting, setPublicIntakeRouting] =
    useState<PublicIntakeRoutingSnapshot | null>(null)
  const [publicIntakeRoutingError, setPublicIntakeRoutingError] = useState('')
  const publicRoutingMutationInFlightRef = useRef(false)
  const [publicIntakeRoutingSaving, setPublicIntakeRoutingSaving] = useState(false)
  const [publicIntakeRoutingSaveMessage, setPublicIntakeRoutingSaveMessage] = useState('')
  const [publicIntakeRoutingSaveError, setPublicIntakeRoutingSaveError] = useState('')
  const [publicRoutingDisplayName, setPublicRoutingDisplayName] = useState('')
  const [publicRoutingSlug, setPublicRoutingSlug] = useState('')
  const [publicRoutingEnabled, setPublicRoutingEnabled] = useState(false)
  const [newPublicRoutingDomain, setNewPublicRoutingDomain] = useState('')
  const [publicRoutingDomainSaving, setPublicRoutingDomainSaving] = useState(false)
  const [publicRoutingDomainMessage, setPublicRoutingDomainMessage] = useState('')
  const [publicRoutingDomainError, setPublicRoutingDomainError] = useState('')
  const [newPublicRoutingTokenLabel, setNewPublicRoutingTokenLabel] = useState('')
  const [newPublicRoutingTokenRequestType, setNewPublicRoutingTokenRequestType] = useState('')
  const [newPublicRoutingTokenExpiresOn, setNewPublicRoutingTokenExpiresOn] = useState('')
  const [createdPublicRoutingToken, setCreatedPublicRoutingToken] =
    useState<CreatedPublicIntakeToken | null>(null)
  const [publicRoutingTokenSaving, setPublicRoutingTokenSaving] = useState(false)
  const [publicRoutingTokenMessage, setPublicRoutingTokenMessage] = useState('')
  const [publicRoutingTokenError, setPublicRoutingTokenError] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'staff'>('staff')
  const [googleCalendar, setGoogleCalendar] = useState<ParishGoogleIntegrationReadModel | null>(
    null
  )
  const settingsLoadSequenceRef = useRef(0)
  const settingsLoadAbortRef = useRef<AbortController | null>(null)
  const staffAccessLoadSequenceRef = useRef(0)
  const staffAccessLoadAbortRef = useRef<AbortController | null>(null)
  const recentAuditLoadSequenceRef = useRef(0)
  const recentAuditLoadAbortRef = useRef<AbortController | null>(null)
  const publicRoutingLoadSequenceRef = useRef(0)
  const publicRoutingLoadAbortRef = useRef<AbortController | null>(null)

  const loadStaffAccess = useCallback(async () => {
    const loadSequence = ++staffAccessLoadSequenceRef.current
    staffAccessLoadAbortRef.current?.abort()
    const controller = new AbortController()
    staffAccessLoadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === staffAccessLoadSequenceRef.current

    setStaffAccessLoading(true)
    setStaffAccessError('')
    try {
      const res = await fetch('/api/parish/staff-users', {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setStaffAccessError(parishSettingsClientErrorMessage('loadStaffAccess', data?.error))
        return
      }
      const parsed = parseStaffAccessResponse(data)
      if (!parsed) {
        setStaffAccess([])
        setCanManageStaff(false)
        setStaffAccessError(parishSettingsClientErrorMessage('loadStaffAccess', null))
        return
      }
      setStaffAccess(parsed.staff)
      setCanManageStaff(parsed.canManage)
    } catch (error: unknown) {
      if (isAbortError(error) || !isLatestLoad()) return
      setStaffAccessError(parishSettingsClientErrorMessage('loadStaffAccess', error))
    } finally {
      if (isLatestLoad()) {
        staffAccessLoadAbortRef.current = null
        setStaffAccessLoading(false)
      }
    }
  }, [])

  const loadRecentAuditEvents = useCallback(async () => {
    const loadSequence = ++recentAuditLoadSequenceRef.current
    recentAuditLoadAbortRef.current?.abort()
    const controller = new AbortController()
    recentAuditLoadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === recentAuditLoadSequenceRef.current

    setRecentAuditError('')
    try {
      const res = await fetch('/api/audit-events?limit=5', {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setRecentAuditEvents([])
        if (res.status !== 403) {
          setRecentAuditError(parishSettingsClientErrorMessage('loadRecentActivity', data?.error))
        }
        return
      }
      const parsed = parseRecentAuditEventsResponse(data)
      if (!parsed) {
        setRecentAuditEvents([])
        setRecentAuditError(parishSettingsClientErrorMessage('loadRecentActivity', null))
        return
      }
      setRecentAuditEvents(parsed)
    } catch (error: unknown) {
      if (isAbortError(error) || !isLatestLoad()) return
      setRecentAuditEvents([])
      setRecentAuditError(parishSettingsClientErrorMessage('loadRecentActivity', error))
    } finally {
      if (isLatestLoad()) recentAuditLoadAbortRef.current = null
    }
  }, [])

  const applyPublicIntakeRoutingSnapshot = useCallback((routing: PublicIntakeRoutingSnapshot | null) => {
    setPublicIntakeRouting(routing)
    setPublicRoutingDisplayName(String(routing?.parish.public_display_name ?? ''))
    setPublicRoutingSlug(String(routing?.parish.public_slug ?? ''))
    setPublicRoutingEnabled(Boolean(routing?.parish.public_intake_enabled))
  }, [])

  const loadPublicIntakeRouting = useCallback(async () => {
    const loadSequence = ++publicRoutingLoadSequenceRef.current
    publicRoutingLoadAbortRef.current?.abort()
    const controller = new AbortController()
    publicRoutingLoadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === publicRoutingLoadSequenceRef.current

    setPublicIntakeRoutingError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setPublicIntakeRouting(null)
        setPublicIntakeRoutingError(
          parishSettingsClientErrorMessage('loadPublicIntakeRouting', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicIntakeRouting(null)
        setPublicIntakeRoutingError(
          parishSettingsClientErrorMessage('loadPublicIntakeRouting', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
    } catch (error: unknown) {
      if (isAbortError(error) || !isLatestLoad()) return
      setPublicIntakeRouting(null)
      setPublicIntakeRoutingError(
        parishSettingsClientErrorMessage('loadPublicIntakeRouting', error)
      )
    } finally {
      if (isLatestLoad()) publicRoutingLoadAbortRef.current = null
    }
  }, [activeParishId, applyPublicIntakeRoutingSnapshot])

  const load = useCallback(async () => {
    const loadSequence = ++settingsLoadSequenceRef.current
    settingsLoadAbortRef.current?.abort()
    const controller = new AbortController()
    settingsLoadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === settingsLoadSequenceRef.current

    setLoading(true)
    setLoadError('')
    setLoadedParishName('')
    const supportingLoads = Promise.all([
      loadStaffAccess(),
      loadRecentAuditEvents(),
      loadPublicIntakeRouting(),
    ])
    try {
      const res = await fetch('/api/parish/settings', {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setLoadError(parishSettingsClientErrorMessage('loadSettings', data?.error))
        return
      }
      const parsed = parseParishSettingsResponse(data, activeParishId)
      if (!parsed) {
        setLoadError(parishSettingsClientErrorMessage('loadSettings', null))
        return
      }
      const p = parsed.parish
      setParishName(p.name)
      setLoadedParishName(p.name)
      setNotificationEmail(String(p.default_notification_email ?? '').trim() || '')
      setDailyBriefEnabled(Boolean(p.daily_ops_brief_enabled))
      setDailyBriefEmail(String(p.daily_ops_brief_email ?? '').trim() || '')
      setDailyBriefLastSentOn(p.daily_ops_brief_last_sent_on ?? null)
      setDailyBriefLastError(p.daily_ops_brief_last_error ?? null)
      setOnboardingComplete(Boolean(p.onboarding_completed_at))
      setSlaRules(normalizeSlaRules(p.workflow_sla_rules))
      setStaffText(directoryToMultilineText(Array.isArray(p.staff_names) ? p.staff_names : []))
      setPriestText(directoryToMultilineText(Array.isArray(p.priest_names) ? p.priest_names : []))
      setGoogleCalendar(parsed.googleCalendar)
    } catch (error: unknown) {
      if (isAbortError(error) || !isLatestLoad()) return
      setLoadError(parishSettingsClientErrorMessage('loadSettings', error))
    } finally {
      await supportingLoads
      if (isLatestLoad()) {
        settingsLoadAbortRef.current = null
        setLoading(false)
      }
    }
  }, [activeParishId, loadPublicIntakeRouting, loadRecentAuditEvents, loadStaffAccess])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void load()
    })
    return () => {
      cancelled = true
      settingsLoadSequenceRef.current += 1
      settingsLoadAbortRef.current?.abort()
      settingsLoadAbortRef.current = null
      staffAccessLoadSequenceRef.current += 1
      staffAccessLoadAbortRef.current?.abort()
      staffAccessLoadAbortRef.current = null
      recentAuditLoadSequenceRef.current += 1
      recentAuditLoadAbortRef.current?.abort()
      recentAuditLoadAbortRef.current = null
      publicRoutingLoadSequenceRef.current += 1
      publicRoutingLoadAbortRef.current?.abort()
      publicRoutingLoadAbortRef.current = null
    }
  }, [activeParishId, load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (parishSettingsMutationInFlightRef.current) return

    parishSettingsMutationInFlightRef.current = 'settings-save'
    setSaving(true)
    setSaveMessage('')
    setSaveError('')
    try {
      const staff_names = directoryFromMultilineText(staffText)
      const priest_names = directoryFromMultilineText(priestText)
      const res = await fetch('/api/parish/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parishName.trim(),
          default_notification_email: notificationEmail.trim(),
          daily_ops_brief_enabled: dailyBriefEnabled,
          daily_ops_brief_email: dailyBriefEmail.trim(),
          onboarding_complete: onboardingComplete,
          workflow_sla_rules: slaRules,
          staff_names,
          priest_names,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setSaveError(parishSettingsClientErrorMessage('saveSettings', data?.error))
        return
      }
      setSaveMessage('Settings saved.')
      await load()
    } catch (error: unknown) {
      setSaveError(parishSettingsClientErrorMessage('saveSettings', error))
    } finally {
      parishSettingsMutationInFlightRef.current = null
      setSaving(false)
    }
  }

  function updateSla(kind: keyof WorkflowSlaRules, requestType: string, value: string) {
    setSlaRules((current) => ({
      ...current,
      [kind]: {
        ...current[kind],
        [requestType]: clampDays(value),
      },
    }))
  }

  async function addStaffAccess(e: React.FormEvent) {
    e.preventDefault()
    if (staffAccessMutationInFlightRef.current) return

    staffAccessMutationInFlightRef.current = 'new-staff-access'
    setStaffAccessAdding(true)
    setStaffAccessMessage('')
    setStaffAccessError('')
    try {
      const res = await fetch('/api/parish/staff-users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newStaffEmail.trim(), role: newStaffRole }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setStaffAccessError(parishSettingsClientErrorMessage('addStaffAccess', data?.error))
        return
      }
      setNewStaffEmail('')
      setNewStaffRole('staff')
      setStaffAccessMessage('Staff access saved.')
      await loadStaffAccess()
      await loadRecentAuditEvents()
    } catch (error: unknown) {
      setStaffAccessError(parishSettingsClientErrorMessage('addStaffAccess', error))
    } finally {
      staffAccessMutationInFlightRef.current = null
      setStaffAccessAdding(false)
    }
  }

  async function updateStaffAccess(row: StaffAccessRow, patch: Partial<StaffAccessRow>) {
    if (staffAccessMutationInFlightRef.current) return

    staffAccessMutationInFlightRef.current = row.id
    setStaffAccessUpdatingId(row.id)
    setStaffAccessMessage('')
    setStaffAccessError('')
    const next = { ...row, ...patch }
    try {
      const res = await fetch('/api/parish/staff-users', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, role: next.role, active: next.active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setStaffAccessError(parishSettingsClientErrorMessage('updateStaffAccess', data?.error))
        return
      }
      setStaffAccessMessage('Staff access updated.')
      await loadStaffAccess()
      await loadRecentAuditEvents()
    } catch (error: unknown) {
      setStaffAccessError(parishSettingsClientErrorMessage('updateStaffAccess', error))
    } finally {
      staffAccessMutationInFlightRef.current = null
      setStaffAccessUpdatingId(null)
    }
  }

  function confirmStaffDeactivation() {
    const row = pendingStaffDeactivation
    if (!row) return

    setPendingStaffDeactivation(null)
    void updateStaffAccess(row, { active: false })
  }

  function confirmStaffRoleDowngrade() {
    const row = pendingStaffRoleDowngrade
    if (!row) return

    setPendingStaffRoleDowngrade(null)
    void updateStaffAccess(row, { role: 'staff' })
  }

  async function sendDailyBriefNow() {
    if (parishSettingsMutationInFlightRef.current) return

    if (dailyBriefDeliveryAttemptRef.current?.parishId !== activeParishId) {
      dailyBriefDeliveryAttemptRef.current = {
        parishId: activeParishId,
        id: crypto.randomUUID(),
      }
    }
    const deliveryAttemptId = dailyBriefDeliveryAttemptRef.current.id

    parishSettingsMutationInFlightRef.current = 'daily-brief-send'
    setDailyBriefSending(true)
    setDailyBriefMessage('')
    try {
      const res = await fetch('/api/parish/daily-brief', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryAttemptId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setDailyBriefMessage(parishSettingsClientErrorMessage('sendDailyBrief', data?.error))
        return
      }
      setDailyBriefMessage(`Daily brief sent to ${String(data.to || '').trim() || 'the parish inbox'}.`)
      dailyBriefDeliveryAttemptRef.current = null
      await load()
    } catch (error: unknown) {
      setDailyBriefMessage(parishSettingsClientErrorMessage('sendDailyBrief', error))
    } finally {
      parishSettingsMutationInFlightRef.current = null
      setDailyBriefSending(false)
      setConfirmDailyBriefSendOpen(false)
    }
  }

  function beginPublicRoutingMutation(): boolean {
    if (publicRoutingMutationInFlightRef.current) return false
    publicRoutingLoadSequenceRef.current += 1
    publicRoutingLoadAbortRef.current?.abort()
    publicRoutingLoadAbortRef.current = null
    publicRoutingMutationInFlightRef.current = true
    return true
  }

  function finishPublicRoutingMutation() {
    publicRoutingMutationInFlightRef.current = false
  }

  async function savePublicIntakeRouting(e: React.FormEvent) {
    e.preventDefault()
    if (!beginPublicRoutingMutation()) return

    setPublicIntakeRoutingSaving(true)
    setPublicIntakeRoutingSaveMessage('')
    setPublicIntakeRoutingSaveError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_display_name: publicRoutingDisplayName.trim(),
          public_slug: publicRoutingSlug.trim(),
          public_intake_enabled: publicRoutingEnabled,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicIntakeRoutingSaveError(
          parishSettingsClientErrorMessage('savePublicIntakeRouting', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicIntakeRoutingSaveError(
          parishSettingsClientErrorMessage('savePublicIntakeRouting', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setPublicIntakeRoutingSaveMessage('Public intake routing metadata saved.')
    } catch (error: unknown) {
      setPublicIntakeRoutingSaveError(
        parishSettingsClientErrorMessage('savePublicIntakeRouting', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicIntakeRoutingSaving(false)
    }
  }

  async function addPublicRoutingDomain(e: React.FormEvent) {
    e.preventDefault()
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingDomainSaving(true)
    setPublicRoutingDomainMessage('')
    setPublicRoutingDomainError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: newPublicRoutingDomain.trim(), active: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('addPublicRoutingDomain', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('addPublicRoutingDomain', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setNewPublicRoutingDomain('')
      setPublicRoutingDomainMessage('Domain added.')
    } catch (error: unknown) {
      setPublicRoutingDomainError(
        parishSettingsClientErrorMessage('addPublicRoutingDomain', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingDomainSaving(false)
    }
  }

  async function addPublicRoutingToken(e: React.FormEvent) {
    e.preventDefault()
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingTokenSaving(true)
    setPublicRoutingTokenMessage('')
    setPublicRoutingTokenError('')
    setCreatedPublicRoutingToken(null)
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'token',
          token_label: newPublicRoutingTokenLabel.trim(),
          request_type: newPublicRoutingTokenRequestType || null,
          expires_at: newPublicRoutingTokenExpiresOn || null,
          active: true,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingTokenError(
          parishSettingsClientErrorMessage('createPublicRoutingToken', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      const createdToken = parseCreatedPublicIntakeTokenResponse(data)
      if (!routing || !createdToken) {
        setPublicRoutingTokenError(
          parishSettingsClientErrorMessage('createPublicRoutingToken', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setCreatedPublicRoutingToken(createdToken)
      setNewPublicRoutingTokenLabel('')
      setNewPublicRoutingTokenRequestType('')
      setNewPublicRoutingTokenExpiresOn('')
      setPublicRoutingTokenMessage('Token created. This is the only time the full token is shown.')
    } catch (error: unknown) {
      setPublicRoutingTokenError(
        parishSettingsClientErrorMessage('createPublicRoutingToken', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingTokenSaving(false)
    }
  }

  async function updatePublicRoutingToken(tokenId: string, active: boolean) {
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingTokenSaving(true)
    setPublicRoutingTokenMessage('')
    setPublicRoutingTokenError('')
    setCreatedPublicRoutingToken(null)
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId, active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingTokenError(
          parishSettingsClientErrorMessage('updatePublicRoutingToken', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicRoutingTokenError(
          parishSettingsClientErrorMessage('updatePublicRoutingToken', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setPublicRoutingTokenMessage(active ? 'Token activated.' : 'Token deactivated.')
    } catch (error: unknown) {
      setPublicRoutingTokenError(
        parishSettingsClientErrorMessage('updatePublicRoutingToken', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingTokenSaving(false)
    }
  }

  async function updatePublicRoutingDomain(domainId: string, active: boolean) {
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingDomainSaving(true)
    setPublicRoutingDomainMessage('')
    setPublicRoutingDomainError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: domainId, active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('updatePublicRoutingDomain', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('updatePublicRoutingDomain', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setPublicRoutingDomainMessage(active ? 'Domain activated.' : 'Domain deactivated.')
    } catch (error: unknown) {
      setPublicRoutingDomainError(
        parishSettingsClientErrorMessage('updatePublicRoutingDomain', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingDomainSaving(false)
    }
  }

  async function verifyPublicRoutingDomain(domainId: string) {
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingDomainSaving(true)
    setPublicRoutingDomainMessage('')
    setPublicRoutingDomainError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: domainId, domain_action: 'verify' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('verifyPublicRoutingDomain', data?.error)
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      const verification = parsePublicIntakeDomainVerificationResponse(data)
      if (!routing || !verification) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('verifyPublicRoutingDomain', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setPublicRoutingDomainMessage(
        verification.verified
          ? 'Domain verified.'
          : publicRoutingDomainVerificationResultMessage(verification.error)
      )
    } catch (error: unknown) {
      setPublicRoutingDomainError(
        parishSettingsClientErrorMessage('verifyPublicRoutingDomain', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingDomainSaving(false)
    }
  }

  async function resetPublicRoutingDomainVerification(domainId: string) {
    if (!beginPublicRoutingMutation()) return

    setPublicRoutingDomainSaving(true)
    setPublicRoutingDomainMessage('')
    setPublicRoutingDomainError('')
    try {
      const res = await fetch('/api/parish/public-intake-routing', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: domainId, domain_action: 'reset_verification' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage(
            'resetPublicRoutingDomainVerification',
            data?.error
          )
        )
        return
      }
      const routing = parsePublicIntakeRoutingResponse(data, activeParishId)
      if (!routing) {
        setPublicRoutingDomainError(
          parishSettingsClientErrorMessage('resetPublicRoutingDomainVerification', null)
        )
        return
      }
      applyPublicIntakeRoutingSnapshot(routing)
      setPublicRoutingDomainMessage('Domain verification token reset.')
    } catch (error: unknown) {
      setPublicRoutingDomainError(
        parishSettingsClientErrorMessage('resetPublicRoutingDomainVerification', error)
      )
    } finally {
      finishPublicRoutingMutation()
      setPublicRoutingDomainSaving(false)
    }
  }

  const publicRoutingMutationBusy =
    publicIntakeRoutingSaving || publicRoutingDomainSaving || publicRoutingTokenSaving
  const parishSettingsBusy = saving || dailyBriefSending

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className={sectionHeadingClassName}>Parish settings</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm leading-relaxed text-gray-600">
        Keep your parish name, team lists, and notification inbox up to date. Only signed-in
        staff can change these values.
      </p>
      {loadedParishName ? (
        <p className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-950">
          Settings are scoped to {loadedParishName}.
        </p>
      ) : null}

      {loading ? (
        <div
          className={`flex items-center gap-4 ${vineaSectionShellClassName}`}
          aria-busy="true"
          aria-live="polite"
        >
          <span className={vineaSpinnerClassName} aria-hidden />
          <p className="text-base font-medium text-gray-900">Loading parish settings…</p>
        </div>
      ) : loadError ? (
        <div
          className="rounded-2xl border border-red-200/90 bg-red-50/90 px-5 py-6 text-base text-red-950 shadow-sm ring-1 ring-red-900/5"
          role="alert"
        >
          <p className="font-medium">Could not load parish settings</p>
          <p className="mt-2 leading-relaxed">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className={`${primaryButtonMd} mt-4 justify-center`}
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <form
            method="post"
            onSubmit={handleSave}
            className={vineaSectionShellClassName}
            aria-busy={parishSettingsBusy}
          >
            <h2 className="text-base font-semibold text-gray-900">Parish details</h2>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              This information is used across your workspace. Lists below are optional but help
              keep assignment picklists consistent.
            </p>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-blue-950">Parish onboarding</h3>
                  <p className="mt-1 text-xs leading-relaxed text-blue-900">
                    Mark setup complete after the parish name, notification inbox, staff access,
                    priests, and daily brief have been reviewed.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-blue-950">
                  <input
                    type="checkbox"
                    checked={onboardingComplete}
                    disabled={parishSettingsBusy}
                    onChange={(e) => setOnboardingComplete(e.target.checked)}
                    className="h-4 w-4 rounded border-blue-300 text-brand focus:ring-brand-ring"
                  />
                  Setup complete
                </label>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="parish-name" className="mb-1 block text-sm font-medium text-gray-800">
                  Parish name
                </label>
                <input
                  id="parish-name"
                  className={vineaInputFieldClassName}
                  value={parishName}
                  disabled={parishSettingsBusy}
                  onChange={(e) => setParishName(e.target.value)}
                  required
                  maxLength={200}
                  autoComplete="organization"
                />
              </div>

              <div>
                <label
                  htmlFor="parish-notify-email"
                  className="mb-1 block text-sm font-medium text-gray-800"
                >
                  Default notification email
                </label>
                <input
                  id="parish-notify-email"
                  type="email"
                  className={vineaInputFieldClassName}
                  value={notificationEmail}
                  disabled={parishSettingsBusy}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="e.g. office@yourparish.org"
                  autoComplete="email"
                />
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                  New intake notifications go here when your hosting environment does not set a
                  separate <span className="font-mono text-[11px]">REQUEST_NOTIFICATION_TO_EMAIL</span>{' '}
                  address. Leave blank to rely on that server setting only.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Daily parish brief email
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      Send a simple morning summary of urgent requests, due follow-ups, blockers,
                      missing dates, and the top work to start with.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={dailyBriefEnabled}
                      disabled={parishSettingsBusy}
                      onChange={(e) => setDailyBriefEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand-ring"
                    />
                    Send daily
                  </label>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="parish-daily-brief-email"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Daily brief recipient
                  </label>
                  <input
                    id="parish-daily-brief-email"
                    type="email"
                    className={vineaInputFieldClassName}
                    value={dailyBriefEmail}
                    disabled={parishSettingsBusy}
                    onChange={(e) => setDailyBriefEmail(e.target.value)}
                    placeholder={notificationEmail.trim() || 'office@yourparish.org'}
                    autoComplete="email"
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                    Leave blank to use the default notification email above.
                    {dailyBriefLastSentOn ? (
                      <> Last sent: {dailyBriefLastSentOn}.</>
                    ) : null}
                  </p>
                  {dailyBriefLastError ? (
                    <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                      Last delivery issue: {dailyBriefLastError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setConfirmDailyBriefSendOpen(true)}
                    disabled={parishSettingsBusy}
                    className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
                  >
                    {dailyBriefSending ? 'Sending brief...' : "Send today's brief now"}
                  </button>
                  {dailyBriefMessage ? (
                    <p className="text-sm font-medium text-gray-700">{dailyBriefMessage}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                <h3 className="text-sm font-semibold text-gray-900">Parish response targets</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  These targets define when Vinea starts calling attention to missing first contact
                  or missing ownership. Keep them simple enough for staff to remember.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-3 font-semibold">Workflow</th>
                        <th className="px-3 py-2 font-semibold">First contact within</th>
                        <th className="px-3 py-2 font-semibold">Owner assigned within</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {REQUEST_TYPES.map((type) => (
                        <tr key={type.key}>
                          <td className="py-2 pr-3 font-medium text-gray-900">{type.label}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={slaRules.firstContactDays[type.key] ?? 0}
                              disabled={parishSettingsBusy}
                              onChange={(e) =>
                                updateSla('firstContactDays', type.key, e.target.value)
                              }
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                              aria-label={`${type.label} first contact days`}
                            />{' '}
                            <span className="text-xs text-gray-500">days</span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={slaRules.ownerAssignmentDays[type.key] ?? 0}
                              disabled={parishSettingsBusy}
                              onChange={(e) =>
                                updateSla('ownerAssignmentDays', type.key, e.target.value)
                              }
                              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                              aria-label={`${type.label} owner assignment days`}
                            />{' '}
                            <span className="text-xs text-gray-500">days</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label htmlFor="parish-staff" className="mb-1 block text-sm font-medium text-gray-800">
                  Staff members
                </label>
                <textarea
                  id="parish-staff"
                  className={`min-h-[120px] resize-y ${vineaInputFieldClassName}`}
                  value={staffText}
                  disabled={parishSettingsBusy}
                  onChange={(e) => setStaffText(e.target.value)}
                  placeholder={'One name per line, e.g.\nJane Smith\nOffice coordinator'}
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Up to {PARISH_DIRECTORY_MAX_NAMES} names; duplicates are removed automatically.
                </p>
              </div>

              <div>
                <label htmlFor="parish-priests" className="mb-1 block text-sm font-medium text-gray-800">
                  Priests
                </label>
                <textarea
                  id="parish-priests"
                  className={`min-h-[100px] resize-y ${vineaInputFieldClassName}`}
                  value={priestText}
                  disabled={parishSettingsBusy}
                  onChange={(e) => setPriestText(e.target.value)}
                  placeholder={'One name per line, e.g.\nRev. Msgr. Thomas Lee\nFr. James Chen'}
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Same rules as staff. These are display names only (not login accounts).
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={parishSettingsBusy}
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
              >
                {saving ? 'Saving…' : 'Save parish details'}
              </button>
            </div>

            <InlineFormMessage message={saveMessage} className="!mt-4" />
            {saveError ? (
              <p
                className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                role="alert"
              >
                {saveError}
              </p>
            ) : null}
          </form>

          <section className={vineaSectionShellClassName}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Staff login access</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  These email addresses can sign in to the parish dashboard. Admins can manage
                  access; staff can use the dashboard but cannot add or remove users.
                </p>
                {loadedParishName ? (
                  <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-950">
                    Staff access is scoped to {loadedParishName}.
                  </p>
                ) : null}
              </div>
              {staffAccessLoading ? (
                <span className="text-sm font-medium text-gray-500">Loading...</span>
              ) : null}
            </div>

            {canManageStaff ? (
              <form
                method="post"
                onSubmit={addStaffAccess}
                aria-busy={staffAccessAdding}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <input
                  type="email"
                  disabled={staffAccessAdding || staffAccessUpdatingId !== null}
                  className={vineaInputFieldClassName}
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="staff@yourparish.org"
                  aria-label="Staff email"
                  required
                />
                <select
                  value={newStaffRole}
                  disabled={staffAccessAdding || staffAccessUpdatingId !== null}
                  onChange={(e) => setNewStaffRole(e.target.value === 'admin' ? 'admin' : 'staff')}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring"
                  aria-label="Staff role"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={staffAccessAdding || staffAccessUpdatingId !== null}
                  className={`${primaryButtonMd} justify-center`}
                >
                  {staffAccessAdding ? 'Adding...' : 'Add access'}
                </button>
              </form>
            ) : (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Your account can use Vinea, but only a parish admin can change staff access.
              </p>
            )}

            <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {staffAccess.length === 0 ? (
                <p className="px-4 py-4 text-sm text-gray-600">No staff access rows found.</p>
              ) : (
                staffAccess.map((row) => (
                  <div
                    key={row.id}
                    aria-busy={staffAccessUpdatingId === row.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{row.email}</p>
                      <p className="text-xs text-gray-500">
                        {row.active ? 'Active' : 'Inactive'} - {row.role === 'admin' ? 'Admin' : 'Staff'}
                      </p>
                    </div>
                    {canManageStaff ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={row.role}
                          disabled={staffAccessAdding || staffAccessUpdatingId !== null}
                          onChange={(e) => {
                            const nextRole = e.target.value === 'admin' ? 'admin' : 'staff'
                            if (row.role === 'admin' && nextRole === 'staff') {
                              setPendingStaffRoleDowngrade(row)
                            } else {
                              void updateStaffAccess(row, { role: nextRole })
                            }
                          }}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                          aria-label={`Role for ${row.email}`}
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          disabled={staffAccessAdding || staffAccessUpdatingId !== null}
                          onClick={() => {
                            if (row.active) {
                              setPendingStaffDeactivation(row)
                            } else {
                              void updateStaffAccess(row, { active: true })
                            }
                          }}
                          className={secondaryButtonMd}
                        >
                          {staffAccessUpdatingId === row.id
                            ? 'Updating...'
                            : row.active
                              ? 'Deactivate'
                              : 'Reactivate'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <InlineFormMessage message={staffAccessMessage} className="!mt-4" />
            {staffAccessError ? (
              <p
                className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                role="alert"
              >
                {staffAccessError}
              </p>
            ) : null}
          </section>

          <section
            className={vineaSectionShellClassName}
            aria-busy={publicRoutingMutationBusy}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Public intake routing
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Read-only preview of the active parish&apos;s public routing setup. Public forms
                  still use the existing intake path until a later approved phase turns routing on.
                </p>
                {loadedParishName ? (
                  <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-950">
                    Public intake routing is scoped to {loadedParishName}.
                  </p>
                ) : null}
              </div>
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950">
                Prepared, not live
              </span>
            </div>

            {publicIntakeRoutingError ? (
              <p
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                role="alert"
              >
                {publicIntakeRoutingError}
              </p>
            ) : publicIntakeRouting ? (
              <div className="mt-5 space-y-5">
                <form
                  method="post"
                  onSubmit={savePublicIntakeRouting}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="public-routing-display-name"
                        className="mb-1 block text-sm font-medium text-gray-800"
                      >
                        Public display name
                      </label>
                      <input
                        id="public-routing-display-name"
                        className={vineaInputFieldClassName}
                        value={publicRoutingDisplayName}
                        disabled={publicRoutingMutationBusy}
                        onChange={(event) => setPublicRoutingDisplayName(event.target.value)}
                        placeholder={publicIntakeRouting.parish.name || 'Parish name'}
                        maxLength={200}
                      />
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        The parish-facing name planned for future public intake pages.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="public-routing-slug"
                        className="mb-1 block text-sm font-medium text-gray-800"
                      >
                        Public slug
                      </label>
                      <input
                        id="public-routing-slug"
                        className={vineaInputFieldClassName}
                        value={publicRoutingSlug}
                        disabled={publicRoutingMutationBusy}
                        onChange={(event) => setPublicRoutingSlug(event.target.value)}
                        placeholder="st-mary-parish"
                        maxLength={80}
                        spellCheck={false}
                      />
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        Use lowercase letters, numbers, and hyphens. Leave blank if unset.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                    <label className="inline-flex items-start gap-2 text-sm font-semibold text-amber-950">
                      <input
                        type="checkbox"
                        checked={publicRoutingEnabled}
                        disabled={publicRoutingMutationBusy}
                        onChange={(event) => setPublicRoutingEnabled(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-amber-300 text-brand focus:ring-brand-ring"
                      />
                      <span>
                        Mark public intake routing metadata as enabled
                        <span className="mt-1 block text-xs font-normal leading-relaxed text-amber-900">
                          This does not turn on live public routing yet. Families still use the
                          current public intake forms until a later approved release wires routing.
                        </span>
                      </span>
                    </label>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Active parish source: {publicIntakeRouting.source.replaceAll('_', ' ')}.
                  </p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      disabled={publicRoutingMutationBusy}
                      className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
                    >
                      {publicIntakeRoutingSaving ? 'Saving...' : 'Save routing metadata'}
                    </button>
                    {publicIntakeRoutingSaveMessage ? (
                      <p className="text-sm font-medium text-green-700">
                        {publicIntakeRoutingSaveMessage}
                      </p>
                    ) : null}
                  </div>

                  {publicIntakeRoutingSaveError ? (
                    <p
                      className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                      role="alert"
                    >
                      {publicIntakeRoutingSaveError}
                    </p>
                  ) : null}
                </form>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Verified domains</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Add domains that may be used for future public intake pages. Vinea checks a
                    DNS TXT record before a domain can be treated as verified.
                  </p>
                  <form
                    method="post"
                    onSubmit={addPublicRoutingDomain}
                    className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      type="text"
                      className={vineaInputFieldClassName}
                      value={newPublicRoutingDomain}
                      disabled={publicRoutingMutationBusy}
                      onChange={(event) => setNewPublicRoutingDomain(event.target.value)}
                      placeholder="forms.yourparish.org"
                      aria-label="Public intake domain"
                      spellCheck={false}
                      required
                    />
                    <button
                      type="submit"
                      disabled={publicRoutingMutationBusy}
                      className={`${secondaryButtonMd} justify-center`}
                    >
                      {publicRoutingDomainSaving ? 'Saving...' : 'Add domain'}
                    </button>
                  </form>

                  {publicRoutingDomainMessage ? (
                    <p className="mt-2 text-sm font-medium text-green-700">
                      {publicRoutingDomainMessage}
                    </p>
                  ) : null}
                  {publicRoutingDomainError ? (
                    <p
                      className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                      role="alert"
                    >
                      {publicRoutingDomainError}
                    </p>
                  ) : null}

                  {publicIntakeRouting.domains.length === 0 ? (
                    <p className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                      No public intake domains are configured for this parish.
                    </p>
                  ) : (
                    <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                      {publicIntakeRouting.domains.map((domain) => (
                        <div
                          key={domain.id}
                          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {domain.hostname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {domain.verified_at
                                ? `Verified: ${formatDateTime(domain.verified_at)}`
                                : 'Not verified yet'}
                            </p>
                            {domain.verification_dns_name && domain.verification_dns_value ? (
                              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                                <p className="font-semibold text-gray-900">
                                  DNS TXT record
                                </p>
                                <p className="mt-1 break-all">
                                  Name: {domain.verification_dns_name}
                                </p>
                                <p className="mt-1 break-all">
                                  Value: {domain.verification_dns_value}
                                </p>
                                <p className="mt-1 text-gray-500">
                                  Last checked:{' '}
                                  {formatDateTime(domain.verification_checked_at)}
                                </p>
                                {domain.verification_error ? (
                                  <p className="mt-1 text-red-700">
                                    {domain.verification_error}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-amber-700">
                                No DNS challenge has been generated yet. Reset verification to
                                create one.
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                domain.active
                                  ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                                  : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                              }`}
                            >
                              {domain.active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void updatePublicRoutingDomain(domain.id, !domain.active)
                              }
                              disabled={publicRoutingMutationBusy}
                              className={secondaryButtonMd}
                            >
                              {domain.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void verifyPublicRoutingDomain(domain.id)}
                              disabled={publicRoutingMutationBusy}
                              className={secondaryButtonMd}
                            >
                              Verify DNS
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void resetPublicRoutingDomainVerification(domain.id)
                              }
                              disabled={publicRoutingMutationBusy}
                              className={secondaryButtonMd}
                            >
                              Reset verification token
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Public form tokens</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Create secure public form tokens for future token-based intake links. The full
                    token is shown once after creation; after that, Vinea stores only a hash.
                  </p>

                  <form
                    method="post"
                    onSubmit={addPublicRoutingToken}
                    className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="public-routing-token-label"
                          className="mb-1 block text-sm font-medium text-gray-800"
                        >
                          Token label
                        </label>
                        <input
                          id="public-routing-token-label"
                          className={vineaInputFieldClassName}
                          value={newPublicRoutingTokenLabel}
                          disabled={publicRoutingMutationBusy}
                          onChange={(event) => setNewPublicRoutingTokenLabel(event.target.value)}
                          placeholder="Bulletin baptism link"
                          maxLength={120}
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="public-routing-token-request-type"
                          className="mb-1 block text-sm font-medium text-gray-800"
                        >
                          Form type
                        </label>
                        <select
                          id="public-routing-token-request-type"
                          className={vineaInputFieldClassName}
                          value={newPublicRoutingTokenRequestType}
                          disabled={publicRoutingMutationBusy}
                          onChange={(event) =>
                            setNewPublicRoutingTokenRequestType(event.target.value)
                          }
                        >
                          <option value="">Any public form</option>
                          <option value="baptism">Baptism</option>
                          <option value="funeral">Funeral</option>
                          <option value="wedding">Wedding</option>
                          <option value="ocia">OCIA</option>
                          <option value="join_parish">Join Parish</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="public-routing-token-expires-on"
                          className="mb-1 block text-sm font-medium text-gray-800"
                        >
                          Expires on
                        </label>
                        <input
                          id="public-routing-token-expires-on"
                          type="date"
                          className={vineaInputFieldClassName}
                          value={newPublicRoutingTokenExpiresOn}
                          disabled={publicRoutingMutationBusy}
                          onChange={(event) => setNewPublicRoutingTokenExpiresOn(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={publicRoutingMutationBusy}
                        className={`${secondaryButtonMd} justify-center`}
                      >
                        {publicRoutingTokenSaving ? 'Creating...' : 'Create token'}
                      </button>
                      {publicRoutingTokenMessage ? (
                        <p className="text-sm font-medium text-green-700">
                          {publicRoutingTokenMessage}
                        </p>
                      ) : null}
                    </div>

                    {publicRoutingTokenError ? (
                      <p
                        className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                        role="alert"
                      >
                        {publicRoutingTokenError}
                      </p>
                    ) : null}

                    {createdPublicRoutingToken ? (
                      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                        <p className="text-sm font-semibold text-amber-950">
                          New token shown once
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-900">
                          Store this token securely now. Vinea will only show the label and metadata
                          after this page reloads.
                        </p>
                        <input
                          readOnly
                          value={createdPublicRoutingToken.token}
                          className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-xs text-amber-950"
                          aria-label="New public intake token"
                          onFocus={(event) => event.currentTarget.select()}
                        />
                      </div>
                    ) : null}
                  </form>

                  {publicIntakeRouting.tokens.length === 0 ? (
                    <p className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                      No public intake tokens are configured for this parish.
                    </p>
                  ) : (
                    <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                      {publicIntakeRouting.tokens.map((token) => (
                        <div
                          key={token.id}
                          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {token.label || 'Untitled token'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {requestTypeLabel(token.request_type)} - Expires:{' '}
                              {formatDateTime(token.expires_at)} - Last used:{' '}
                              {formatDateTime(token.last_used_at)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                token.active
                                  ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                                  : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                              }`}
                            >
                              {token.active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void updatePublicRoutingToken(token.id, !token.active)
                              }
                              disabled={publicRoutingMutationBusy}
                              className={secondaryButtonMd}
                            >
                              {token.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                Public intake routing metadata has not loaded yet.
              </p>
            )}
          </section>

          <section className={vineaSectionShellClassName}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent admin activity</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  A quick view of recent settings, staff access, intake, and request changes.
                </p>
              </div>
              <a
                href="/dashboard/admin/audit-log"
                className={`${secondaryButtonMd} justify-center`}
              >
                View full audit log
              </a>
            </div>

            {recentAuditError ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {recentAuditError}
              </p>
            ) : recentAuditEvents.length === 0 ? (
              <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                No recent admin activity found.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {recentAuditEvents.map((event) => (
                  <div key={event.id} className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {auditEventTitle(event)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {auditEventDetail(event)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {event.actor_email || 'System'} -{' '}
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <SettingsWorkflowTemplatesSection
            activeParishId={activeParishId}
            activeParishName={loadedParishName}
          />

          <SettingsGoogleCalendarSection integration={googleCalendar} />
        </div>
      )}

      <VineaConfirmDialog
        open={pendingStaffDeactivation !== null}
        title="Deactivate this staff account?"
        description={`${pendingStaffDeactivation?.email ?? 'This staff member'} will no longer be able to access this parish in Vinea.`}
        warning="Existing request history and audit records remain available. You can reactivate this account later."
        confirmLabel="Deactivate access"
        onCancel={() => setPendingStaffDeactivation(null)}
        onConfirm={confirmStaffDeactivation}
      />

      <VineaConfirmDialog
        open={pendingStaffRoleDowngrade !== null}
        title="Remove administrator permissions?"
        description={`${pendingStaffRoleDowngrade?.email ?? 'This staff member'} will keep parish access but will no longer be able to manage staff access or administrator settings.`}
        warning="At least one active parish administrator must remain. You can restore this role later."
        confirmLabel="Change role to Staff"
        onCancel={() => setPendingStaffRoleDowngrade(null)}
        onConfirm={confirmStaffRoleDowngrade}
      />

      <VineaConfirmDialog
        open={confirmDailyBriefSendOpen}
        title="Send today’s parish brief now?"
        description="Vinea will email the current Daily Office Brief to the configured parish recipient."
        warning="This sends immediately. Review today’s dashboard items before continuing."
        confirmLabel="Send parish brief"
        busy={dailyBriefSending}
        busyLabel="Sending brief..."
        onCancel={() => setConfirmDailyBriefSendOpen(false)}
        onConfirm={() => void sendDailyBriefNow()}
      />
    </main>
  )
}
