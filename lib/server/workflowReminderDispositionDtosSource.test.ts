import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Workflow reminder disposition DTO source and docs', () => {
  it('keeps disposition DTOs non-runtime, staff-reviewed, and mutation-free', () => {
    const source = readRepoFile('lib/workflowReminderDispositionDtos.ts')

    for (const expected of [
      'dismiss',
      'snooze',
      'suppress',
      'staffReviewRequired: true',
      'outboundCommunicationAllowed: false',
      'mutatesOperationalRecord: false',
      "runtimeStatus: 'non_runtime_disposition_dto_only'",
      'blocked_from_family_portal: true',
      'safe_source_reference',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      '.from(',
      '.insert(',
      '.update(',
      '.delete(',
      'fetch(',
      'createSignedUrl',
      'sendEmail',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('documents no-send, no-runtime, no-migration, and no-RLS boundaries', () => {
    const plan = readRepoFile('docs/WORKFLOW_REMINDERS_V1_DISPOSITION_DTO_PLAN_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'non-runtime DTO foundation only',
      'Does not schedule delivery in this slice.',
      'Every disposition DTO preserves `staffReviewRequired: true`.',
      'Every disposition DTO preserves `outboundCommunicationAllowed: false`.',
      'Every disposition DTO preserves `mutatesOperationalRecord: false`.',
      'Runtime status remains `non_runtime_disposition_dto_only`.',
      'This slice does not:',
      'Send communications.',
      'Enable automation.',
      'Apply migrations.',
      'Change operational RLS.',
      'Mutate records.',
      'Make public trust claims.',
      'Completion marker: `WORKFLOW_REMINDERS_V1_DISPOSITION_DTO_PLAN_20260702`',
    ]) {
      expect(plan).toContain(expected)
    }

    expect(buildStatus).toContain('Workflow Reminders V1 Disposition DTO Foundation Implemented')
    expect(roadmap).toContain('Workflow Reminders V1 Disposition DTO Foundation')
    expect(sourceOfTruth).toContain('Workflow Reminders V1 Disposition DTO Foundation')
  })
})
