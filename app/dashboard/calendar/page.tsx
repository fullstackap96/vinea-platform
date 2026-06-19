import { DashboardCalendarPageClient } from './DashboardCalendarPageClient'
import { loadParishCareCalendar } from '@/lib/server/loadParishCareCalendar'

export default async function DashboardCalendarPage() {
  const result = await loadParishCareCalendar()
  return <DashboardCalendarPageClient {...result} />
}
