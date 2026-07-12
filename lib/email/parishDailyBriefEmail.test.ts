import { describe, expect, it } from 'vitest'
import {
  renderParishDailyBriefHtml,
  renderParishDailyBriefText,
} from '@/lib/email/parishDailyBriefEmail'
import type { ParishOpsBrief } from '@/lib/parishOpsBrief'

function briefWithHref(href: string): ParishOpsBrief {
  return {
    headline: 'Good morning. Two things need attention.',
    subline: 'Start with the families waiting longest.',
    firstAction: 'Open the first request and log the next touchpoint.',
    huddleNote: 'Open the first request and log the next touchpoint.',
    items: [],
    today: {
      firstContactNeeded: 1,
      followUpsDueToday: 1,
      overdueFollowUps: 1,
      urgentFunerals: 0,
      missingConfirmedSchedules: 0,
      blocked: 0,
      completed: 0,
    },
    focusItems: [
      {
        requestId: 'request-1',
        requestTypeLabel: 'Baptism',
        title: 'Lucia Santos',
        nextStepTitle: 'Follow up today',
        actionLabel: 'Open follow-up',
        ownerLabel: 'Elena',
        blockerLabel: 'None',
        href,
      },
    ],
  }
}

describe('parish daily brief email links', () => {
  it('keeps focus item links inside the configured Vinea app origin', () => {
    const text = renderParishDailyBriefText({
      parishName: 'St. Mary',
      dateLabel: 'July 8, 2026',
      brief: briefWithHref('/dashboard/requests/request-1#next-follow-up'),
      appUrl: 'https://vinea.example.test/',
    })
    const html = renderParishDailyBriefHtml({
      parishName: 'St. Mary',
      dateLabel: 'July 8, 2026',
      brief: briefWithHref('/dashboard/requests/request-1#next-follow-up'),
      appUrl: 'https://vinea.example.test/',
    })

    expect(text).toContain('https://vinea.example.test/dashboard/requests/request-1#next-follow-up')
    expect(html).toContain('https://vinea.example.test/dashboard/requests/request-1#next-follow-up')
  })

  it('falls back to the dashboard for unsafe focus item links', () => {
    const text = renderParishDailyBriefText({
      parishName: 'St. Mary',
      dateLabel: 'July 8, 2026',
      brief: briefWithHref('https://example.test/phish'),
      appUrl: 'https://vinea.example.test',
    })
    const html = renderParishDailyBriefHtml({
      parishName: 'St. Mary',
      dateLabel: 'July 8, 2026',
      brief: briefWithHref('/api/exports/requests/basic'),
      appUrl: 'https://vinea.example.test',
    })

    expect(text).toContain('Open: https://vinea.example.test/dashboard')
    expect(text).not.toContain('https://example.test/phish')
    expect(html).toContain('href="https://vinea.example.test/dashboard"')
    expect(html).not.toContain('/api/exports/requests/basic')
  })

  it('uses safe relative dashboard links when the app origin is invalid', () => {
    const text = renderParishDailyBriefText({
      parishName: 'St. Mary',
      dateLabel: 'July 8, 2026',
      brief: briefWithHref('/dashboard/requests/request-1'),
      appUrl: 'javascript:alert(1)',
    })

    expect(text).toContain('Open: /dashboard/requests/request-1')
    expect(text).toContain('Open Vinea: /dashboard')
    expect(text).not.toContain('javascript:alert')
  })
})
