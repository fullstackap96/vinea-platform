'use client'

import VineaErrorRecovery from '@/app/_components/VineaErrorRecovery'

type AppErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function AppError({ unstable_retry }: AppErrorProps) {
  return <VineaErrorRecovery scope="page" unstable_retry={unstable_retry} />
}
