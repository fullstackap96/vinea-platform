import { ParishSettingsPage } from './ParishSettingsPage'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'

export default async function DashboardSettingsPage() {
  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishId = parishSwitcher.ok ? parishSwitcher.activeParishId : null

  return (
    <ParishSettingsPage
      key={activeParishId ?? 'legacy-parish-context'}
      activeParishId={activeParishId}
    />
  )
}
