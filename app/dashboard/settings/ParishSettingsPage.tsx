'use client'

import { useCallback, useEffect, useState } from 'react'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { primaryButtonMd } from '@/lib/buttonStyles'
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

type ParishPayload = {
  id: string
  name: string
  default_notification_email: string
  staff_names: string[]
  priest_names: string[]
}

export function ParishSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  const [parishName, setParishName] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [staffText, setStaffText] = useState('')
  const [priestText, setPriestText] = useState('')
  const [googleCalendar, setGoogleCalendar] = useState<ParishGoogleIntegrationSnapshot | null>(
    null
  )

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
      setParishName(p.name)
      setNotificationEmail(p.default_notification_email || '')
      setStaffText(directoryToMultilineText(p.staff_names || []))
      setPriestText(directoryToMultilineText(p.priest_names || []))
      setGoogleCalendar((data.googleCalendar as ParishGoogleIntegrationSnapshot | null) ?? null)
    } catch (e: any) {
      setLoadError(e?.message || 'Could not load settings.')
    } finally {
      setLoading(false)
    }
  }, [])

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
    } catch (err: any) {
      setSaveError(err?.message || 'Save failed')
    } finally {
      setSaving(false)
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

          <SettingsGoogleCalendarSection integration={googleCalendar} />
        </div>
      )}
    </main>
  )
}
