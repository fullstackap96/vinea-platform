import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const sourcePath = 'app/dashboard/DashboardPageCore.tsx'

function readSource(): string {
  return readFileSync(join(repoRoot, sourcePath), 'utf8')
}

describe('dashboard client safe messages', () => {
  it('routes follow-up and care-plan visible failures through curated messages', () => {
    const source = readSource()

    expect(source).toContain('dashboardClientErrorMessage,')
    expect(source).toContain('dashboardClientFailureMessage,')
    expect(source).toContain("} from '@/lib/dashboardClientMessages'")

    for (const action of [
      'draftFollowUp',
      'saveFollowUpDraft',
      'sendFollowUpEmail',
      'logFollowUpEmail',
      'updateFollowUpEmailSummary',
      'logFollowUpContacted',
      'updateFollowUpContactedSummary',
      'markFollowUpContacted',
      'confirmWorkHubMutation',
      'logCareTouchpoint',
      'updateFuneralCareDate',
      'updateCareRequest',
    ]) {
      expect(source).toContain(`dashboardClientFailureMessage('${action}')`)
    }

    expect(source).toContain(
      "dashboardClientFailureMessage('confirmWorkHubMutation')",
    )
  })

  it('does not render raw provider or database errors in dashboard row messages', () => {
    const source = readSource()

    for (const unsafePattern of [
      'Draft failed: ${result.error}',
      "Draft failed: ${error?.message || 'Unknown error'}",
      'Email sent, but failed logging communication: ${insertRes.error.message}',
      'Email sent and logged, but failed updating summary fields: ${updateRes.error.message}',
      "Send failed: ${error?.message || 'Unknown error'}",
      'Logged history, but failed updating request: ${result.error}',
      'Could not log communication: ${result.error}',
      "Error: ${error?.message || 'Unknown error'}",
      'Could not log care touchpoint: ${insertRes.error.message}',
      'Logged touchpoint, but failed updating funeral care date: ${funeralUpdate.error.message}',
      'Logged touchpoint, but failed updating request: ${updateRes.error.message}',
      'Error: ${error.message}',
    ]) {
      expect(source).not.toContain(unsafePattern)
    }

    expect(source).toContain('Follow-up email sent successfully.')
    expect(source).toContain('Marked as contacted.')
    expect(source).toContain('Care touchpoint saved and next follow-up scheduled.')
  })
})
