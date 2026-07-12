import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const pagePath = 'app/dashboard/records/new/NewSacramentalRecordPage.tsx'
const actionsPath = 'app/dashboard/records/actions.ts'

function readRepoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('new sacramental record prefill safety source wiring', () => {
  it('fails closed when request prefill supporting data cannot be verified', () => {
    const pageSource = readRepoFile(pagePath)
    const actionsSource = readRepoFile(actionsPath)

    expect(pageSource).toContain('loadSacramentalRecordRequestPrefill(requestIdParam)')
    expect(pageSource).not.toContain("from '@/lib/supabase'")
    expect(pageSource).not.toContain("supabase.from('requests')")
    expect(pageSource).not.toContain("from('requests')")
    expect(pageSource).not.toContain('devDashboardConsoleError')

    expect(actionsSource).toContain("from '@/lib/recordPrefillClientMessages'")
    expect(actionsSource).toContain('loadSacramentalRecordRequestPrefill')
    expect(actionsSource).toContain('loadStaffScopedRequestDetailAccess(admin, id')
    expect(actionsSource).toContain('.select(SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT)')
    expect(actionsSource).not.toContain(".select('*')")
    expect(actionsSource).toContain('activeParishId,')
    expect(actionsSource).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(actionsSource).toContain("recordPrefillClientFailureMessage('loadSourceRequest')")
    expect(actionsSource).toContain("recordPrefillClientFailureMessage('loadSupportingDetails')")
    expect(actionsSource).toContain("recordPrefillClientFailureMessage('checkExistingRecord')")

    for (const label of [
      'source request load failed',
      'funeral detail load failed',
      'wedding detail load failed',
      'ocia detail load failed',
      'parishioner detail load failed',
      'existing record check failed',
    ]) {
      expect(actionsSource).toContain(`'${label}'`)
    }

    for (const marker of [
      'createSupabaseServiceRoleClient()',
      'createSupabaseServerClient()',
      'ACTIVE_STAFF_PARISH_COOKIE',
      'error: parishionerError',
      'error: existingRecordError',
      'const { data, error } = await admin',
    ]) {
      expect(actionsSource).toContain(marker)
    }

    for (const forbidden of [
      'setMessage(requestError.message',
      'setMessage(error.message',
      'setMessage(parishionerError.message',
      'setMessage(existingRecordError.message',
      'setMessage(String(error',
    ]) {
      expect(pageSource).not.toContain(forbidden)
      expect(actionsSource).not.toContain(forbidden)
    }
  })
})
