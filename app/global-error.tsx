'use client'

import VineaErrorRecovery from '@/app/_components/VineaErrorRecovery'
import './globals.css'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function GlobalError({ unstable_retry }: GlobalErrorProps) {
  return (
    <html className="h-full antialiased" lang="en">
      <head>
        <title>Vinea Platform - Something went wrong</title>
      </head>
      <body className="flex min-h-full flex-col font-sans text-gray-900 antialiased">
        <VineaErrorRecovery scope="application" unstable_retry={unstable_retry} />
      </body>
    </html>
  )
}
