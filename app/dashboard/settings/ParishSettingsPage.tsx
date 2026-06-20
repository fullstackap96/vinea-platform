'use client'

import { useCallback, useEffect, useState } from 'react'
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
  type ParishGoogleIntegrationSnapshot,
} from './SettingsGoogleCalendarSection'
import {
  directoryFromMultilineText,
  directoryToMultilineText,
  PARISH_DIRECTORY_MAX_NAMES,
} from '@/lib/parishDirectory'
import { auditEventDetail, auditEventTitle, type AuditEventRow } from '@/lib/auditEvents'

type ParishPayload = {
  id: string
  name: string
  /** Absent or null when unset in DB; API normalizes to string but we tolerate null. */
  default_notification_email?: string | null
  daily_ops_brief_enabled?: boolean | null
  daily_ops_brief_email?: string | null
  daily_ops_brief_last_sent_on?: string | null
  daily_ops_brief_last_error?: string | null
  onboarding_completed_at?: string | null
  workflow_sla_rules?: WorkflowSlaRules | null
  staff_names?: string[]
  priest_names?: string[]
}

type WorkflowSlaRules = {
  firstContactDays: Record<string, number>
  ownerAssignmentDays: Record<string, number>
}

type StaffAccessRow = {
  id: string
  email: string
  role: 'admin' | 'staff'
  active: boolean
}

const REQUEST_TYPES = [
  { key: 'funeral', label: 'Funeral' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'baptism', label: 'Baptism' },
  { key: 'ocia', label: 'OCIA' },
]

const DEFAULT_SLA_RULES: WorkflowSlaRules = {
  firstContactDays: { funeral: 1, wedding: 2, baptism: 3, ocia: 3 },
  ownerAssignmentDays: { funeral: 0, wedding: 1, baptism: 2, ocia: 2 },
}

function messageFromUnknown(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
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

export function ParishSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [parishName, setParishName] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [dailyBriefEnabled, setDailyBriefEnabled] = useState(false)
  const [dailyBriefEmail, setDailyBriefEmail] = useState('')
  const [dailyBriefLastSentOn, setDailyBriefLastSentOn] = useState<string | null>(null)
  const [dailyBriefLastError, setDailyBriefLastError] = useState<string | null>(null)
  const [dailyBriefSending, setDailyBriefSending] = useState(false)
  const [dailyBriefMessage, setDailyBriefMessage] = useState('')
  const [staffText, setStaffText] = useState('')
  const [priestText, setPriestText] = useState('')
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [slaRules, setSlaRules] = useState<WorkflowSlaRules>(DEFAULT_SLA_RULES)
  const [staffAccess, setStaffAccess] = useState<StaffAccessRow[]>([])
  const [canManageStaff, setCanManageStaff] = useState(false)
  const [staffAccessLoading, setStaffAccessLoading] = useState(false)
  const [staffAccessMessage, setStaffAccessMessage] = useState('')
  const [staffAccessError, setStaffAccessError] = useState('')
  const [recentAuditEvents, setRecentAuditEvents] = useState<AuditEventRow[]>([])
  const [recentAuditError, setRecentAuditError] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'staff'>('staff')
  const [googleCalendar, setGoogleCalendar] = useState<ParishGoogleIntegrationSnapshot | null>(
    null
  )

  const loadStaffAccess = useCallback(async () => {
    setStaffAccessLoading(true)
    setStaffAccessError('')
    try {
      const res = await fetch('/api/parish/staff-users', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setStaffAccessError(String(data?.error || 'Could not load staff access.'))
        return
      }
      setStaffAccess(Array.isArray(data.staff) ? data.staff : [])
      setCanManageStaff(Boolean(data.canManage))
    } catch (error: unknown) {
      setStaffAccessError(messageFromUnknown(error, 'Could not load staff access.'))
    } finally {
      setStaffAccessLoading(false)
    }
  }, [])

  const loadRecentAuditEvents = useCallback(async () => {
    setRecentAuditError('')
    try {
      const res = await fetch('/api/audit-events?limit=5', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setRecentAuditEvents([])
        if (res.status !== 403) {
          setRecentAuditError(String(data?.error || 'Could not load recent activity.'))
        }
        return
      }
      setRecentAuditEvents(Array.isArray(data.events) ? data.events : [])
    } catch (error: unknown) {
      setRecentAuditEvents([])
      setRecentAuditError(messageFromUnknown(error, 'Could not load recent activity.'))
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/parish/settings', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setLoadError(String(data?.error || `Could not load settings (${res.status})`))
        return
      }
      const p = data.parish as ParishPayload
      if (!p || typeof p.name !== 'string') {
        setLoadError('Invalid parish data from server.')
        return
      }
      setParishName(p.name)
      setNotificationEmail(String(p.default_notification_email ?? '').trim() || '')
      setDailyBriefEnabled(Boolean(p.daily_ops_brief_enabled))
      setDailyBriefEmail(String(p.daily_ops_brief_email ?? '').trim() || '')
      setDailyBriefLastSentOn(p.daily_ops_brief_last_sent_on ?? null)
      setDailyBriefLastError(p.daily_ops_brief_last_error ?? null)
      setOnboardingComplete(Boolean(p.onboarding_completed_at))
      setSlaRules(normalizeSlaRules(p.workflow_sla_rules))
      setStaffText(directoryToMultilineText(Array.isArray(p.staff_names) ? p.staff_names : []))
      setPriestText(directoryToMultilineText(Array.isArray(p.priest_names) ? p.priest_names : []))
      setGoogleCalendar((data.googleCalendar as ParishGoogleIntegrationSnapshot | null) ?? null)
      await loadStaffAccess()
      await loadRecentAuditEvents()
    } catch (error: unknown) {
      setLoadError(messageFromUnknown(error, 'Could not load settings.'))
    } finally {
      setLoading(false)
    }
  }, [loadRecentAuditEvents, loadStaffAccess])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
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
        setSaveError(String(data?.error || 'Save failed'))
        return
      }
      setSaveMessage('Settings saved.')
      await load()
    } catch (error: unknown) {
      setSaveError(messageFromUnknown(error, 'Save failed'))
    } finally {
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
        setStaffAccessError(String(data?.error || 'Could not add staff access.'))
        return
      }
      setNewStaffEmail('')
      setNewStaffRole('staff')
      setStaffAccessMessage('Staff access saved.')
      await loadStaffAccess()
      await loadRecentAuditEvents()
    } catch (error: unknown) {
      setStaffAccessError(messageFromUnknown(error, 'Could not add staff access.'))
    }
  }

  async function updateStaffAccess(row: StaffAccessRow, patch: Partial<StaffAccessRow>) {
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
        setStaffAccessError(String(data?.error || 'Could not update staff access.'))
        return
      }
      setStaffAccessMessage('Staff access updated.')
      await loadStaffAccess()
      await loadRecentAuditEvents()
    } catch (error: unknown) {
      setStaffAccessError(messageFromUnknown(error, 'Could not update staff access.'))
    }
  }

  async function sendDailyBriefNow() {
    setDailyBriefSending(true)
    setDailyBriefMessage('')
    try {
      const res = await fetch('/api/parish/daily-brief', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setDailyBriefMessage(String(data?.error || 'Could not send the daily brief.'))
        return
      }
      setDailyBriefMessage(`Daily brief sent to ${String(data.to || '').trim() || 'the parish inbox'}.`)
      await load()
    } catch (error: unknown) {
      setDailyBriefMessage(messageFromUnknown(error, 'Could not send the daily brief.'))
    } finally {
      setDailyBriefSending(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className={sectionHeadingClassName}>Parish settings</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm leading-relaxed text-gray-600">
        Keep your parish name, team lists, and notification inbox up to date. Only signed-in
        staff can change these values.
      </p>

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
          <form onSubmit={handleSave} className={vineaSectionShellClassName}>
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
                    onClick={sendDailyBriefNow}
                    disabled={dailyBriefSending}
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
                disabled={saving}
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
              </div>
              {staffAccessLoading ? (
                <span className="text-sm font-medium text-gray-500">Loading...</span>
              ) : null}
            </div>

            {canManageStaff ? (
              <form onSubmit={addStaffAccess} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  type="email"
                  className={vineaInputFieldClassName}
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="staff@yourparish.org"
                  aria-label="Staff email"
                  required
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value === 'admin' ? 'admin' : 'staff')}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring"
                  aria-label="Staff role"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className={`${primaryButtonMd} justify-center`}>
                  Add access
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
                          onChange={(e) =>
                            void updateStaffAccess(row, {
                              role: e.target.value === 'admin' ? 'admin' : 'staff',
                            })
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                          aria-label={`Role for ${row.email}`}
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => void updateStaffAccess(row, { active: !row.active })}
                          className={secondaryButtonMd}
                        >
                          {row.active ? 'Deactivate' : 'Reactivate'}
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

          <SettingsGoogleCalendarSection integration={googleCalendar} />
        </div>
      )}
    </main>
  )
}
