'use client'

import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { dispatchRequestDetailGoToSection } from '../_components/requestDetailTabs'
import { resolveRequestDetailSectionId } from '../_components/requestDetailSectionNav'

/** Section ids used for in-page navigation on the request detail view. */
const HASH_SECTION_IDS = new Set([
  'request-details',
  'contact-information',
  'assignment',
  'scheduling-records',
  'next-follow-up',
  'next-step',
  'next-step-reference',
  'confirmed-time',
  'checklist',
  'communication-hub',
  'email-communication',
  'send-email',
  'ai-tools',
  'communication',
  'communication-history',
  'staff-notes',
  'internal-notes',
  'ready-to-complete',
  'completion',
])

function parseHashId(): string | null {
  if (typeof window === 'undefined') return null
  const raw = window.location.hash.replace(/^#/, '').trim()
  if (!raw || !HASH_SECTION_IDS.has(raw)) return null
  return resolveRequestDetailSectionId(raw)
}

export function useHashSectionHighlight() {
  const pathname = usePathname()

  const applyForHash = useCallback(() => {
    const id = parseHashId()
    if (!id) return
    dispatchRequestDetailGoToSection(id)
  }, [])

  useEffect(() => {
    applyForHash()

    const onHashChange = () => {
      applyForHash()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [pathname, applyForHash])
}
