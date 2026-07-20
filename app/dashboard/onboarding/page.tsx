import { ParishOnboardingPage } from './ParishOnboardingPage'
import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'

export default async function Page() {
  const parishSwitcher = await loadActiveStaffParishSwitcherContext()
  const activeParishId = parishSwitcher.ok ? parishSwitcher.activeParishId : null

  return (
    <ParishOnboardingPage
      key={activeParishId ?? 'legacy-parish-context'}
      activeParishId={activeParishId}
    />
  )
}
