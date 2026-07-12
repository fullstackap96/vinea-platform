import { DashboardReportsPage } from './DashboardReportsPage'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'

export default async function ReportsPage() {
  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishId = parishSwitcher.ok ? parishSwitcher.activeParishId : null
  const activeParishName = parishSwitcher.ok
    ? parishSwitcher.parishes.find((parish) => parish.id === parishSwitcher.activeParishId)?.name ??
      null
    : null

  return (
    <DashboardReportsPage activeParishId={activeParishId} activeParishName={activeParishName} />
  )
}
