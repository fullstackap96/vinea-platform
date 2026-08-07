import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
const workHub = read('app/dashboard/DashboardPageCore.tsx')
const aiTools = read('app/dashboard/requests/[id]/_components/AiToolsSection.tsx')

function sourceBlock(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('AI client confirmation deadline boundary', () => {
  it('single-flights Request Detail summary and reply generation before dispatch', () => {
    const summary = sourceBlock(
      requestDetail,
      'async function generateSummary()',
      'async function saveAiSummaryToRequest',
    )
    const reply = sourceBlock(
      requestDetail,
      'async function generateReplyDraft()',
      'async function copyReplyDraft()',
    )

    expect(requestDetail).toContain('const aiGenerationInFlightRef = useRef(false)')
    for (const handler of [summary, reply]) {
      expect(handler).toContain('aiGenerationInFlightRef.current')
      expect(handler.indexOf('aiGenerationInFlightRef.current = true')).toBeLessThan(
        handler.indexOf("fetch('/api/ai/"),
      )
      expect(handler).toContain(
        'signal: AbortSignal.timeout(AI_CLIENT_GENERATION_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(handler).toContain('aiGenerationInFlightRef.current = false')
      expect(handler.match(/fetch\(/g)).toHaveLength(1)
    }

    expect(reply).toContain('requestId: routeId')
    expect(aiTools.match(/disabled=\{aiLoading \|\| mutationDisabled\}/g)).toHaveLength(2)
    expect(aiTools).toContain('aria-busy={aiLoading}')
  })

  it('accepts only non-empty structured generation responses', () => {
    const summary = sourceBlock(
      requestDetail,
      'async function generateSummary()',
      'async function saveAiSummaryToRequest',
    )
    const reply = sourceBlock(
      requestDetail,
      'async function generateReplyDraft()',
      'async function copyReplyDraft()',
    )
    const workHubDraft = sourceBlock(
      workHub,
      'async function runDraftFollowUpCore',
      'async function runMarkFollowUpAsContactedCore',
    )

    expect(summary).toContain("typeof data?.summary !== 'string'")
    expect(summary).toContain('!data.summary.trim()')
    expect(summary).not.toContain('No summary returned.')
    for (const handler of [reply, workHubDraft]) {
      expect(handler).toContain("typeof data?.reply !== 'string'")
      expect(handler).toContain('!data.reply.trim()')
      expect(handler).not.toContain('No reply returned.')
    }
  })

  it('bounds Request Detail persistence and freezes on ambiguous success', () => {
    const summarySave = sourceBlock(
      requestDetail,
      'async function saveAiSummaryToRequest',
      'async function saveReplyDraftToRequest',
    )
    const replySave = sourceBlock(
      requestDetail,
      'async function saveReplyDraftToRequest',
      'async function generateReplyDraft()',
    )

    expect(requestDetail).toContain('const aiPersistenceInFlightRef = useRef(false)')
    for (const handler of [summarySave, replySave]) {
      expect(handler).toContain('aiPersistenceInFlightRef.current = true')
      expect(handler).toContain(
        'signal: AbortSignal.timeout(AI_CLIENT_PERSISTENCE_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(handler).toContain('res.ok && data?.ok !== true')
      expect(handler).toContain('setWorkflowMutationRequiresRefresh(true)')
      expect(handler).toContain('AI_CLIENT_PERSISTENCE_REFRESH_REQUIRED_MESSAGE')
      expect(handler).toContain('uncertain: true')
      expect(handler).toContain('aiPersistenceInFlightRef.current = false')
      expect(handler.match(/fetch\(/g)).toHaveLength(1)
    }
  })

  it('single-flights Work Hub draft generation and stops a batch after uncertainty', () => {
    const core = sourceBlock(
      workHub,
      'async function runDraftFollowUpCore',
      'async function runMarkFollowUpAsContactedCore',
    )
    const single = sourceBlock(
      workHub,
      'async function draftFollowUpEmail',
      'async function sendFollowUpEmail',
    )
    const batch = sourceBlock(
      workHub,
      'async function batchDraftFollowUpEmails()',
      'async function batchMarkFollowUpAsContacted()',
    )

    expect(workHub).toContain('const followUpDraftInFlightRef = useRef(false)')
    expect(core).toContain('requestId: id')
    expect(core).toContain(
      'signal: AbortSignal.timeout(AI_CLIENT_GENERATION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(core).toContain(
      'signal: AbortSignal.timeout(AI_CLIENT_PERSISTENCE_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(core).toContain('saveRes.ok && saveData?.ok !== true')
    expect(core).toContain('persistenceStarted')
    expect(core).toContain('uncertain: true')
    expect(core.match(/fetch\(/g)).toHaveLength(2)

    for (const handler of [single, batch]) {
      expect(handler).toContain('followUpDraftInFlightRef.current')
      expect(handler.indexOf('followUpDraftInFlightRef.current = true')).toBeLessThan(
        handler.indexOf('runDraftFollowUpCore'),
      )
      expect(handler).toContain('setWorkHubMutationRequiresRefresh(true)')
      expect(handler).toContain('followUpDraftInFlightRef.current = false')
    }
    expect(batch).toContain('for (const [index, id] of ids.entries())')
    expect(batch).toContain('failedIds.push(...ids.slice(index + 1))')
    expect(batch).toContain('break')
    expect(batch).toContain('if (!uncertain) await loadRequests(true)')
  })

  it('keeps template persistence behind the same refresh-required boundary', () => {
    const apply = sourceBlock(
      requestDetail,
      'async function applyVineaEmailTemplateNow',
      'async function saveStaffNotes()',
    )

    expect(apply).toContain('aiGenerationInFlightRef.current')
    expect(apply).toContain('aiPersistenceInFlightRef.current')
    expect(apply).toContain('workflowMutationRequiresRefresh')
    expect(apply).toContain('await saveReplyDraftToRequest(body)')
  })
})
