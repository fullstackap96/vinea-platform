'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { GLOBAL_SEARCH_MIN_LENGTH } from '@/lib/globalSearch/constants'
import type { GlobalSearchGroupedResults } from '@/lib/globalSearch/types'
import { parseGlobalSearchResponse } from '@/lib/globalSearch/parseGlobalSearchResponse'
import {
  dashboardGlobalSearchWarningMessage,
  dashboardShellClientErrorMessage,
} from '@/lib/dashboardShellClientMessages'
import { vineaInputFieldClassName } from '@/lib/vineaUi'
import { GlobalSearchResultGroups } from './GlobalSearchResultGroups'

const EMPTY_RESULTS: GlobalSearchGroupedResults = {
  requests: [],
  people: [],
  households: [],
  records: [],
}

const GLOBAL_SEARCH_READ_TIMEOUT_MS = 15_000

export function DashboardGlobalSearch() {
  const router = useRouter()
  const inputId = useId()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchGroupedResults>(EMPTY_RESULTS)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [open, setOpen] = useState(false)

  const goToFullSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (trimmed.length < GLOBAL_SEARCH_MIN_LENGTH) return
      setOpen(false)
      router.push(`/dashboard/search?q=${encodeURIComponent(trimmed)}`)
    },
    [router]
  )

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < GLOBAL_SEARCH_MIN_LENGTH) {
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        setResults(EMPTY_RESULTS)
        setTotalCount(0)
        setLoading(false)
        setErrorMessage('')
        setWarningMessage('')
      })
      return () => {
        cancelled = true
      }
    }

    let cancelled = false
    const controller = new AbortController()
    let readTimeoutId: number | undefined
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setErrorMessage('')
      setWarningMessage('')
      readTimeoutId = window.setTimeout(
        () => controller.abort(),
        GLOBAL_SEARCH_READ_TIMEOUT_MS,
      )

      try {
        const response = await fetch(`/api/dashboard/search?q=${encodeURIComponent(trimmed)}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) {
          if (!cancelled) {
            setErrorMessage(
              response.status === 401
                ? 'Please sign in again to search.'
                : 'Search is temporarily unavailable.'
            )
            setWarningMessage('')
            setResults(EMPTY_RESULTS)
            setTotalCount(0)
          }
          return
        }

        const data = parseGlobalSearchResponse(await response.json().catch(() => null))

        if (!cancelled && data && data.query.trim() === trimmed) {
          setResults(data.results)
          setTotalCount(data.totalCount)
          setErrorMessage(
            data.errorMessage
              ? dashboardShellClientErrorMessage('globalSearch', data.errorMessage)
              : '',
          )
          setWarningMessage(dashboardGlobalSearchWarningMessage(data.warningMessage))
        } else if (!cancelled) {
          setErrorMessage('Search is temporarily unavailable.')
          setWarningMessage('')
          setResults(EMPTY_RESULTS)
          setTotalCount(0)
        }
      } catch (error: unknown) {
        if (cancelled && error instanceof DOMException && error.name === 'AbortError') return
        if (!cancelled) {
          setErrorMessage('Search is temporarily unavailable.')
          setWarningMessage('')
          setResults(EMPTY_RESULTS)
          setTotalCount(0)
        }
      } finally {
        if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={rootRef} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Search Vinea
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          placeholder="Search Vinea..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              goToFullSearch(query)
            }
            if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
          className={`${vineaInputFieldClassName} pl-10`}
          autoComplete="off"
        />
      </div>

      {showDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-900/5"
        >
          <GlobalSearchResultGroups
            results={results}
            query={query}
            totalCount={totalCount}
            loading={loading}
            errorMessage={errorMessage}
            warningMessage={warningMessage}
            compact
            onNavigate={() => setOpen(false)}
          />

          {query.trim().length >= GLOBAL_SEARCH_MIN_LENGTH && !loading && !errorMessage ? (
            <div className="border-t border-gray-100 px-3 py-2.5">
              <button
                type="button"
                onClick={() => goToFullSearch(query)}
                className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-[#6B4E9B] hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                View all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!open && query.trim().length >= GLOBAL_SEARCH_MIN_LENGTH ? (
        <p className="mt-1 text-xs text-gray-500 lg:hidden">
          Press Enter for full results, or{' '}
          <Link
            href={`/dashboard/search?q=${encodeURIComponent(query.trim())}`}
            className="font-medium text-blue-800 underline underline-offset-2"
          >
            open search page
          </Link>
          .
        </p>
      ) : null}
    </div>
  )
}
