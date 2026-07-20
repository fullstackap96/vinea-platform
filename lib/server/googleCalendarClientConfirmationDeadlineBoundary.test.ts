import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  GOOGLE_CALENDAR_CLIENT_CONFIRMATION_TIMEOUT_MS,
  GOOGLE_CALENDAR_REFRESH_REQUIRED_MESSAGE,
} from '@/lib/googleCalendarClientConfirmation'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

describe('Google Calendar client confirmation deadline boundary', () => {
  it('defines a finite browser confirmation deadline and refresh-first guidance', () => {
    expect(GOOGLE_CALENDAR_CLIENT_CONFIRMATION_TIMEOUT_MS).toBeGreaterThan(15_000)
    expect(GOOGLE_CALENDAR_CLIENT_CONFIRMATION_TIMEOUT_MS).toBeLessThanOrEqual(30_000)
    expect(GOOGLE_CALENDAR_REFRESH_REQUIRED_MESSAGE).toContain('could not confirm')
    expect(GOOGLE_CALENDAR_REFRESH_REQUIRED_MESSAGE).toContain('Refresh this request')
    expect(GOOGLE_CALENDAR_REFRESH_REQUIRED_MESSAGE).not.toContain('try again')
  })

  it('bounds all request-detail calendar mutations and freezes them after ambiguity', () => {
    const page = read('app/dashboard/requests/[id]/page.tsx')

    for (const action of ['create', 'update', 'delete']) {
      const marker = `fetch('/api/google/calendar-event/${action}'`
      const start = page.indexOf(marker)
      expect(start).toBeGreaterThan(-1)
      const block = page.slice(start, start + 1_400)
      expect(block).toContain(
        'signal: AbortSignal.timeout(GOOGLE_CALENDAR_CLIENT_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(block).toContain('payload?.requiresRefresh')
      expect(block).toContain('setGoogleCalendarMutationRequiresRefresh(true)')
    }

    expect(page).toContain('if (!(await loadRequest()))')
    expect(page).toContain('mutationDisabled={googleCalendarMutationRequiresRefresh}')
    expect(page).toContain('setGoogleCalendarMutationRequiresRefresh(false)')
  })

  it('disables every calendar mutation control while refresh is required', () => {
    const component = read(
      'app/dashboard/requests/[id]/_components/GoogleCalendarSection.tsx',
    )

    expect(component).toContain('mutationDisabled = false')
    expect(component).toContain('busy || mutationDisabled || !hasConfirmed || synced')
    expect(component).toContain('busy || mutationDisabled || !hasConfirmed || !synced')
    expect(component).toContain('busy || mutationDisabled || !synced')
  })

  it('marks only post-provider failures as requiring a refresh', () => {
    for (const action of ['create', 'update', 'delete']) {
      const route = read(`app/api/google/calendar-event/${action}/route.ts`)
      const providerMarker =
        action === 'create'
          ? 'calendar.events.insert('
          : action === 'update'
            ? 'calendar.events.patch('
            : 'calendar.events.delete('
      const providerIndex = route.indexOf(providerMarker)
      const startedIndex = route.lastIndexOf('providerMutationStarted = true', providerIndex)

      expect(startedIndex).toBeGreaterThan(-1)
      expect(startedIndex).toBeLessThan(providerIndex)
      expect(route).toContain('requiresRefresh: providerMutationStarted')
      expect(route).toContain('requiresRefresh: true')
    }
  })
})
