import { PeopleDuplicatesPageClient } from './PeopleDuplicatesPageClient'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'

export const dynamic = 'force-dynamic'

export default async function PeopleDuplicatesPage() {
  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishName = parishSwitcher.ok
    ? parishSwitcher.parishes.find((parish) => parish.id === parishSwitcher.activeParishId)
        ?.name ?? null
    : null

  return <PeopleDuplicatesPageClient activeParishName={activeParishName} />
}
