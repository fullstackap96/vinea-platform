import { DashboardCommunicationsPageClient } from './DashboardCommunicationsPageClient'
import { loadParishCommunicationCenter } from '@/lib/server/loadParishCommunicationCenter'

export default async function DashboardCommunicationsPage() {
  const result = await loadParishCommunicationCenter()
  return <DashboardCommunicationsPageClient {...result} />
}
