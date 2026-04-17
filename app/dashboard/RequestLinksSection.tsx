'use client'

import { useRef, useState } from 'react'
import { secondaryButtonSm } from '@/lib/buttonStyles'

const DOMAIN = 'https://usevinea.com'

const ROWS = [
  { key: 'baptism', label: 'Baptism', path: '/baptism-request' },
  { key: 'funeral', label: 'Funeral', path: '/funeral-request' },
  { key: 'wedding', label: 'Wedding', path: '/wedding-request' },
  { key: 'ocia', label: 'OCIA', path: '/ocia-request' },
] as const

const COPIED_MS = 2000

export function RequestLinksSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleCopy(key: string, fullUrl: string) {
    try {
      await navigator.clipboard.writeText(fullUrl)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setCopiedKey(key)
      timeoutRef.current = setTimeout(() => {
        setCopiedKey(null)
        timeoutRef.current = null
      }, COPIED_MS)
    } catch {
      // Clipboard API unavailable or denied — leave label as "Copy"
    }
  }

  return (
    <section className="mb-8" aria-labelledby="request-links-heading">
      <h2
        id="request-links-heading"
        className="text-xl font-semibold text-gray-900 mb-1.5"
      >
        Request Links
      </h2>
      <p className="text-sm text-gray-600 mb-4 max-w-2xl leading-relaxed">
        Share these links on your parish website so parishioners can submit requests.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <ul className="divide-y divide-gray-200">
          {ROWS.map(({ key, label, path }) => {
            const fullUrl = `${DOMAIN}${path}`
            return (
              <li
                key={key}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <button
                  type="button"
                  onClick={() => void handleCopy(key, fullUrl)}
                  className={`${secondaryButtonSm} w-full shrink-0 justify-center sm:w-auto`}
                >
                  {copiedKey === key ? 'Copied!' : 'Copy'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
