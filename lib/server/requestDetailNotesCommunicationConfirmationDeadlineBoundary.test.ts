import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/requests/[id]/page.tsx')
const staffNotes = read('app/dashboard/requests/[id]/_components/StaffNotesSection.tsx')
const communication = read('app/dashboard/requests/[id]/_components/CommunicationSection.tsx')

function block(startMarker: string, endMarker: string) {
  const start = page.indexOf(startMarker)
  const end = page.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return page.slice(start, end)
}

describe('Request Detail notes and communication confirmation deadline boundary', () => {
  it('bounds staff-notes and manual-communication writes at 60 seconds', () => {
    const notes = block('async function saveStaffNotes', 'async function saveSuggestedDates')
    const log = block('async function logCommunication', 'async function sendEmail')

    for (const handler of [notes, log]) {
      expect(handler).toContain(
        'signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS)',
      )
      expect(handler).toContain('res.ok && data?.ok !== true')
      expect(handler).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")
    }
  })

  it('takes synchronous locks and freezes every reviewed field', () => {
    expect(page).toContain('const staffNotesSaveInFlightRef = useRef(false)')
    expect(page).toContain('const communicationMutationInFlightRef = useRef(false)')
    expect(page).toContain(
      'if (staffNotesSaveInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(page).toContain(
      'if (communicationMutationInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(staffNotes).toContain('const mutationBusy = saving || mutationRequiresRefresh')
    expect(staffNotes.match(/disabled=\{mutationBusy\}/g)).toHaveLength(2)
    expect(communication.match(/disabled=\{saving\}/g)).toHaveLength(4)
  })

  it('requires positive acknowledgement and a confirmed refresh before success', () => {
    const notes = block('async function saveStaffNotes', 'async function saveSuggestedDates')
    const log = block('async function logCommunication', 'async function sendEmail')

    expect(notes.indexOf('data?.ok !== true')).toBeLessThan(
      notes.indexOf("setStaffNotesMessage('Staff notes saved.')"),
    )
    expect(notes.indexOf('if (!(await loadRequest()))')).toBeLessThan(
      notes.indexOf("setStaffNotesMessage('Staff notes saved.')"),
    )
    expect(log.indexOf('data?.ok !== true')).toBeLessThan(
      log.indexOf("setCommMessage('Communication logged.')"),
    )
    expect(log.indexOf('if (!(await loadRequest()))')).toBeLessThan(
      log.indexOf("setCommMessage('Communication logged.')"),
    )
  })

  it('locks the known partial-success communication path against duplicate retry', () => {
    const log = block('async function logCommunication', 'async function sendEmail')
    const partialStart = log.indexOf(
      "message === requestDetailClientFailureMessage('updateCommunicationSummary')",
    )

    expect(partialStart).toBeGreaterThanOrEqual(0)
    expect(log.indexOf('setWorkflowMutationRequiresRefresh(true)', partialStart)).toBeGreaterThan(
      partialStart,
    )
    expect(log.indexOf('await loadRequest()', partialStart)).toBeGreaterThan(partialStart)
  })

  it('never automatically replays either write', () => {
    const notes = block('async function saveStaffNotes', 'async function saveSuggestedDates')
    const log = block('async function logCommunication', 'async function sendEmail')

    expect(notes.match(/fetch\(/g)).toHaveLength(1)
    expect(log.match(/fetch\(/g)).toHaveLength(1)
    expect(notes).not.toContain('while (')
    expect(log).not.toContain('while (')
  })
})
