import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Workflow reminder DTO source and docs', () => {
  it('keeps the reminder foundation non-runtime and staff-reviewed', () => {
    const source = readRepoFile('lib/workflowReminderDtos.ts')

    expect(source).toContain('overdue_follow_up')
    expect(source).toContain('missing_documents')
    expect(source).toContain('upcoming_sacramental_date')
    expect(source).toContain('stalled_request')
    expect(source).toContain('unassigned_request')
    expect(source).toContain('certificate_ready')
    expect(source).toContain('duplicate_review')
    expect(source).toContain('staffReviewRequired: true')
    expect(source).toContain('outboundCommunicationAllowed: false')
    expect(source).toContain("runtimeStatus: 'non_runtime_dto_only'")
  })

  it('documents no-send, no-migration, no-RLS safety boundaries', () => {
    const plan = readRepoFile('docs/WORKFLOW_REMINDERS_V1_NON_RUNTIME_PLAN_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')

    expect(plan).toContain('No outbound communication is sent')
    expect(plan).toContain('No production flags are added or enabled')
    expect(plan).toContain('No migrations are added')
    expect(plan).toContain('No operational RLS changes are made')
    expect(buildStatus).toContain('Workflow Reminders V1 DTO Foundation Implemented')
    expect(roadmap).toContain('Workflow Reminders V1 DTO Foundation')
  })
})
