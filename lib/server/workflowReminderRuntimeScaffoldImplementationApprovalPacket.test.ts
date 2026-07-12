import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Workflow Reminders V1 runtime scaffold implementation approval packet', () => {
  it('is approval-only and keeps runtime scaffolding and production delivery unapproved', () => {
    const packet = readRepoFile(
      'docs/WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future non-production implementation step only.',
      'WORKFLOW REMINDERS V1 RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED',
      'PRODUCTION REMINDER DELIVERY REMAINS NO-GO',
      'does not implement runtime reminders',
      'send communications',
      'enable automation',
      'add production flags',
      'apply migrations',
      'change operational RLS',
      'mutate operational records',
      'make public trust claims',
      'Completion marker: `WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact implementation files and non-production runtime gates', () => {
    const packet = readRepoFile(
      'docs/WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      '`lib/server/workflowReminderRuntimeGate.ts`',
      '`lib/server/workflowReminderRuntimeAudit.ts`',
      '`lib/server/workflowReminderRuntimeScaffold.ts`',
      '`app/api/workflow-reminders/route.ts`',
      '`lib/server/workflowReminderRoute.test.ts`',
      '`app/dashboard/DashboardWorkflowReminderPreview.tsx`',
      '`docs/WORKFLOW_REMINDERS_V1_RUNTIME_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`',
      '`VINEA_WORKFLOW_REMINDERS_RUNTIME=ENABLED`',
      '`VINEA_WORKFLOW_REMINDERS_RUNTIME_ACK=APPROVED_WORKFLOW_REMINDERS_RUNTIME_QA`',
      '`VINEA_WORKFLOW_REMINDERS_RUNTIME_ENV=NON_PRODUCTION`',
      'The app is running in production.',
      'Production flags are not approved by this packet.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires staff review, active parish membership scope, safe audit metadata, QA fixtures, and rollback', () => {
    const packet = readRepoFile(
      'docs/WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Staff-reviewed.',
      'Dashboard-only or staff-notification-only.',
      'Active-parish scoped.',
      'Membership scoped.',
      'Preserve `staffReviewRequired: true`',
      'Preserve `outboundCommunicationAllowed: false`',
      'Preserve `mutatesOperationalRecord: false`',
      'Staff authentication.',
      'Active parish cookie or selected parish context.',
      'Staff membership in the active parish.',
      '`feature_id`: `workflow_reminders_v1`',
      'blocked reason for denied paths',
      'Suppression And Dismissal Persistence Boundaries',
      'Required QA Fixtures',
      'Required Manual Smoke Tests',
      'Rollback:',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents future no-go boundaries and updates roadmap docs without secrets', () => {
    const packet = readRepoFile(
      'docs/WORKFLOW_REMINDERS_V1_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Production reminder delivery.',
      'Background scheduling.',
      'Email/SMS reminder sending.',
      'Family-facing reminder display.',
      'Reminder persistence requiring migrations.',
      'Operational RLS changes.',
      'Sacramental or canonical decision automation.',
      'Public trust-center claims.',
      'WORKFLOW REMINDERS V1 NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION REMINDER DELIVERY DISABLED; OUTBOUND COMMUNICATION DISABLED; AUTOMATION DELIVERY NO-GO',
    ]) {
      expect(packet).toContain(expected)
    }

    expect(buildStatus).toContain('Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet Prepared')
    expect(roadmap).toContain('Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet')
    expect(sourceOfTruth).toContain('Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet')

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
