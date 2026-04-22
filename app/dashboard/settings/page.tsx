import { createSupabaseServiceRoleClient } from '@/lib/supabase/serviceRoleClient'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import {
  SettingsGoogleCalendarSection,
  type ParishGoogleIntegrationSnapshot,
} from './SettingsGoogleCalendarSection'

async function loadParishGoogleIntegrationSnapshot(): Promise<ParishGoogleIntegrationSnapshot | null> {
  try {
    const admin = createSupabaseServiceRoleClient()
    const { data: parish, error: parishErr } = await admin
      .from('parishes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (parishErr || !parish?.id) {
      return null
    }

    const { data: row, error: rowErr } = await admin
      .from('parish_google_integrations')
      .select('status, last_error, google_account_email')
      .eq('parish_id', parish.id)
      .maybeSingle()

    if (rowErr || !row) {
      return null
    }

    return {
      status: row.status,
      last_error: row.last_error,
      google_account_email: row.google_account_email,
    }
  } catch {
    return null
  }
}

export default async function DashboardSettingsPage() {
  const integration = await loadParishGoogleIntegrationSnapshot()

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className={sectionHeadingClassName}>Settings</h1>
      <p className="text-sm text-gray-600 mt-2 mb-8">
        Parish workspace preferences and integrations.
      </p>

      <SettingsGoogleCalendarSection integration={integration} />
    </main>
  )
}
