import { DashboardLayoutClient } from '@/app/dashboard/DashboardLayoutClient'
import { isDemoSite } from '@/lib/isDemoSite'
import { loadDashboardShellContext } from '@/lib/server/loadDashboardShellContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { parishSwitcher, staffEmail, canViewAuditLog } =
    await loadDashboardShellContext()
  const parishSwitcherKey = parishSwitcher.ok ? parishSwitcher.activeParishId : 'no-parish-context'

  return (
    <DashboardLayoutClient
      key={parishSwitcherKey}
      showDemoBanner={isDemoSite()}
      parishSwitcher={parishSwitcher}
      staffEmail={staffEmail}
      canViewAuditLog={canViewAuditLog}
    >
      {children}
    </DashboardLayoutClient>
  )
}
