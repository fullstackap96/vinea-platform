import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('request detail client safe messages', () => {
  it('routes repeated client-visible request detail failures through curated messages', () => {
    const source = readRepoFile('app/dashboard/requests/[id]/page.tsx')
    const editDetailsSource = readRepoFile(
      'app/dashboard/requests/[id]/_components/EditRequestDetailsSection.tsx',
    )
    const headerSource = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestHeader.tsx',
    )

    expect(source).toContain(
      "from '@/lib/requestDetailClientMessages'",
    )
    expect(source).toContain('requestDetailClientApiErrorMessage')
    expect(source).toContain("setActivityError(requestDetailClientApiErrorMessage('loadActivity', data?.error))")
    expect(source).toContain("requestDetailClientApiErrorMessage('verifyAccess', accessPayloadRecord?.error)")
    expect(source).toContain('const accessData = parseRequestDetailAccess(accessPayload)')

    for (const action of [
      'loadActivity',
      'aiSummary',
      'aiReply',
      'saveReplyDraft',
      'saveSuggestedDates',
      'saveConfirmedDate',
      'clearConfirmedDate',
      'saveFuneralDetails',
      'saveFuneralService',
      'clearFuneralService',
      'saveWeddingDetails',
      'saveWeddingCeremony',
      'clearWeddingCeremony',
      'saveOciaSession',
      'clearOciaSession',
      'updateCommunicationSummary',
      'sendEmail',
      'logSentEmail',
      'updateSentEmailSummary',
      'createGoogleCalendarEvent',
      'updateGoogleCalendarEvent',
      'deleteGoogleCalendarEvent',
    ]) {
      expect(source).toContain(`requestDetailClientFailureMessage('${action}')`)
    }

    expect(source).toContain("requestDetailClientApiErrorMessage('updateStaffNotes', data?.error)")
    expect(source).toContain("requestDetailClientApiErrorMessage('logCommunication', data?.error)")
    expect(source).toContain("requestDetailClientFailureMessage('confirmWorkflowMutation')")

    expect(source).not.toContain('setActivityError(error instanceof Error ? error.message')
    expect(source).not.toContain("setActivityError(String(data?.error || 'Could not load request activity.'))")
    expect(source).not.toContain("setErrorMessage(String(accessData?.error || 'Request not found.'))")
    expect(source).not.toContain('setAiSummary(`Error: ${error.message}`')
    expect(source).not.toContain('setReplyDraft(`Error: ${error.message}`')
    expect(source).not.toContain('setStaffNotesMessage(`Save failed: ${error.message}`')
    expect(source).not.toContain('setCommMessage(`Error logging communication: ${insertRes.error.message}`')
    expect(source).not.toContain('setEmailMessage(`Send failed: ${error?.message')
    expect(source).not.toContain('failed updating summary fields: ${updateRes.error.message}')

    expect(editDetailsSource).toContain("from '@/lib/requestDetailClientMessages'")
    expect(editDetailsSource).toContain("requestDetailClientFailureMessage('saveIntakeDetails')")
    expect(editDetailsSource).not.toContain('setMessage(e instanceof Error ? e.message')
    expect(editDetailsSource).not.toContain("setMessage(error instanceof Error ? error.message")

    expect(headerSource).toContain("from '@/lib/requestDetailClientMessages'")
    expect(headerSource).toContain("requestDetailClientFailureMessage('saveWaitingOn')")
    expect(headerSource).toContain("requestDetailClientFailureMessage('clearWaitingOn')")
    expect(headerSource).not.toContain('setMessage(e?.message')
    expect(headerSource).not.toContain('setMessage(error?.message')
  })

  it('preserves specialized Google OAuth reconnect guidance', () => {
    const source = readRepoFile('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain('isGoogleOAuthReconnectError(error)')
    expect(source).toContain('userFacingGoogleCalendarErrorMessage(error)')
  })
})
