import { DashboardPageCore } from '../DashboardPageCore'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'

export default async function DashboardRequestsPage() {
  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishId = parishSwitcher.ok ? parishSwitcher.activeParishId : null
  const activeParishName =
    parishSwitcher.ok
      ? parishSwitcher.parishes.find((parish) => parish.id === parishSwitcher.activeParishId)?.name ?? null
      : null

  return (
    <DashboardPageCore
      view="requests"
      activeParishId={activeParishId}
      activeParishName={activeParishName}
    />
  )
}
