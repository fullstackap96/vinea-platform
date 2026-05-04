'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/** Section ids used for in-page navigation on the request detail view. */
const HASH_SECTION_IDS = new Set([
  'request-details',
  'contact-information',
  'assignment',
  'scheduling-records',
  'next-follow-up',
  'next-step',
  'confirmed-time',
  'checklist',
  'email-communication',
  'send-email',
  'ai-tools',
  'communication',
  'staff-notes',
  'internal-notes',
  'completion',
])

const HIGHLIGHT_CLASS = 'request-detail-hash-highlight'

const ANIMATION_NAMES = /request-detail-hash-glow/

/** Overrides stylesheet duration so the cue stays visible longer (globals default is shorter). */
const HIGHLIGHT_DURATION_NORMAL_MS = 3500
const HIGHLIGHT_DURATION_REDUCED_MS = 2200

/** Safety removal if `animationend` never fires (must exceed duration above). */
const FALLBACK_REMOVE_MS_NORMAL = HIGHLIGHT_DURATION_NORMAL_MS + 400
const FALLBACK_REMOVE_MS_REDUCED = HIGHLIGHT_DURATION_REDUCED_MS + 400

function parseHashId(): string | null {
  if (typeof window === 'undefined') return null
  const raw = window.location.hash.replace(/^#/, '').trim()
  if (!raw || !HASH_SECTION_IDS.has(raw)) return null
  return raw
}

export function useHashSectionHighlight() {
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastElRef = useRef<HTMLElement | null>(null)
  const animEndRef = useRef<((e: AnimationEvent) => void) | null>(null)

  const clearHighlight = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const el = lastElRef.current
    if (el && animEndRef.current) {
      el.removeEventListener('animationend', animEndRef.current)
      animEndRef.current = null
    }
    const highlighted = lastElRef.current
    if (highlighted) {
      highlighted.classList.remove(HIGHLIGHT_CLASS)
      highlighted.style.animationDuration = ''
    }
    lastElRef.current = null
  }, [])

  const applyForHash = useCallback(() => {
    clearHighlight()
    const id = parseHashId()
    if (!id) return

    const run = () => {
      const el = document.getElementById(id) as HTMLElement | null
      if (!el) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      })

      const onAnimationEnd = (e: AnimationEvent) => {
        if (e.target !== el) return
        if (typeof e.animationName === 'string' && !ANIMATION_NAMES.test(e.animationName)) {
          return
        }
        el.removeEventListener('animationend', onAnimationEnd)
        animEndRef.current = null
        el.classList.remove(HIGHLIGHT_CLASS)
        el.style.animationDuration = ''
        if (lastElRef.current === el) lastElRef.current = null
        if (timerRef.current != null) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }

      animEndRef.current = onAnimationEnd
      el.addEventListener('animationend', onAnimationEnd)
      el.classList.add(HIGHLIGHT_CLASS)
      el.style.animationDuration = reduced
        ? `${HIGHLIGHT_DURATION_REDUCED_MS}ms`
        : `${HIGHLIGHT_DURATION_NORMAL_MS}ms`
      lastElRef.current = el

      const fallbackMs = reduced ? FALLBACK_REMOVE_MS_REDUCED : FALLBACK_REMOVE_MS_NORMAL
      timerRef.current = setTimeout(() => {
        el.removeEventListener('animationend', onAnimationEnd)
        animEndRef.current = null
        el.classList.remove(HIGHLIGHT_CLASS)
        el.style.animationDuration = ''
        if (lastElRef.current === el) lastElRef.current = null
        timerRef.current = null
      }, fallbackMs)
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
  }, [clearHighlight])

  useEffect(() => {
    applyForHash()

    const onHashChange = () => {
      applyForHash()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      clearHighlight()
    }
  }, [pathname, applyForHash, clearHighlight])
}
