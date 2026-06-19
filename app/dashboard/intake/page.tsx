import { DashboardIntakePageClient } from './DashboardIntakePageClient'
import { loadParishIntakeQueue } from '@/lib/server/loadParishIntakeQueue'

export default async function DashboardIntakePage() {
  const result = await loadParishIntakeQueue()
  return <DashboardIntakePageClient {...result} />
}
