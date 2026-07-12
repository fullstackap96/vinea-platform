import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Workflow Reminders V1 runtime approval packet', () => {
  it('keeps runtime reminders unapproved and non-runtime in this slice', () => {
    const packet = readRepoFile('docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future implementation step only.',
      'WORKFLOW REMINDERS V1 RUNTIME NOT APPROVED',
      'DASHBOARD PREVIEW REMAINS READ-ONLY',
      'NO COMMUNICATIONS OR AUTOMATION ENABLED',
      'does not implement runtime reminders',
      'enable scheduling',
      'send communications',
      'add production flags',
      'apply migrations',
      'change operational RLS',
      'mutate records',
      'make public trust claims',
      'Completion marker: `WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires owner approvals, staff review, and safe audit metadata', () => {
    const packet = readRepoFile('docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md')

    for (const expected of [
      'Product-owner approval',
      'Security/data owner approval',
      'Parish operations approval',
      'Support owner approval',
      'Rollback owner approval',
      'QA owner approval',
      'All reminder outcomes must remain staff-reviewed',
      'Preserve `staffReviewRequired: true`',
      'Preserve `outboundCommunicationAllowed: false`',
      '`feature_id`: `workflow_reminders_v1`',
      '`reminder_type`',
      '`runtime_gate_state`',
      'active parish context and membership scope result',
      'blocked reason for denied paths',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines suppression, active-parish QA, smoke tests, rollback, and production no-go gates', () => {
    const packet = readRepoFile('docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md')

    for (const expected of [
      'Staff can dismiss a reminder',
      'Staff can snooze a reminder',
      'Suppression must be scoped to the active parish and target object.',
      'Same-parish staff sees reminders for the selected active parish.',
      'Switching active parish changes reminder scope.',
      'Forged active-parish cookies fail closed.',
      'Family portal and unauthenticated contexts receive generic denial',
      'Run flag-off checks first:',
      'Run approved non-production flag-on checks only after explicit approval:',
      'Rollback must be possible by disabling the future runtime gate.',
      'Production runtime reminder delivery remains NO-GO',
      'separate production rollout approval packet',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('updates Vinea planning docs and avoids obvious secret material', () => {
    const packet = readRepoFile('docs/WORKFLOW_REMINDERS_V1_RUNTIME_APPROVAL_PACKET_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Workflow Reminders V1 Runtime Approval Packet Prepared')
    expect(roadmap).toContain('Workflow Reminders V1 Runtime Approval Packet')
    expect(sourceOfTruth).toContain('Workflow Reminders V1 Runtime Approval Packet')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
