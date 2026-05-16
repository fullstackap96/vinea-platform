import { DashboardLayoutClient } from '@/app/dashboard/DashboardLayoutClient'
import { isDemoSite } from '@/lib/isDemoSite'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayoutClient showDemoBanner={isDemoSite()}>
      {children}
    </DashboardLayoutClient>
  )
}
