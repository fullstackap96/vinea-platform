'use client'

import VineaErrorRecovery from '@/app/_components/VineaErrorRecovery'

type DashboardErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function DashboardError({ unstable_retry }: DashboardErrorProps) {
  return <VineaErrorRecovery scope="dashboard" unstable_retry={unstable_retry} />
}
