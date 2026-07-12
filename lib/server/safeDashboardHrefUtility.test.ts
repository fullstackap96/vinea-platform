import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('safe dashboard href utility documentation', () => {
  it('documents the shared dashboard-only sanitizer and its protected surfaces', () => {
    const doc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')

    for (const expected of [
      'SAFE_DASHBOARD_HREF_UTILITY_20260708',
      'SHARED READ-ONLY LINK SANITIZER',
      'lib/safeDashboardHref.ts',
      'Daily Office Handoff Digest',
      'Daily Office Handoff saved-view presets',
      'Today View',
      'Role Work Hub',
      'Main dashboard command center',
      'Daily Work Hub overview',
      'Daily Operating Signal Inputs',
      'Parish Health Score',
      'Operational Intelligence Brief',
      'Workflow Reminder candidates',
      'Workflow Reminder disposition DTOs',
      'Sacramental continuity cards and handoffs',
      'Person and Records request backlinks',
      'Relationship Intelligence record prefill links',
      'Parish onboarding readiness checklist',
      'Notifications Center',
      'Parish Care Calendar',
      'Parish Communication Center',
      'Parish Intake Queue',
      'Audit Log request target links',
      'Ownership Health',
      'Parish Ops Brief',
      'Communication Commitments',
      'Care Cadence',
      'Request Workflow detail links',
      'Care Timeline',
      'Global Search result links',
      'Dashboard Request Navigation',
      'Follow-Up Queue request links',
      'Email Dashboard Link Safety Boundary',
      'AI Source Path Safe Link Boundary',
      'Request relationship suggestion links',
      'Request linked-person profile links',
      'Record detail linked-person handoffs',
      'Entity directory detail and edit links',
      'Entity create/edit success and cancel navigation',
      'Mass intention detail and edit navigation',
      'preserves only links that normalize under `/dashboard`',
      'dot-segment traversal',
      'raw or encoded backslash',
      'sensitive query/hash payload markers',
      'token-bearing destinations',
      'raw AI payload references',
      'unsafe fallback values collapse to `/dashboard`',
      'safeDashboardHrefOrFallback',
      'does not mutate records',
      'does not send communications',
      'does not enable automation',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not generate certificates',
      'does not apply migrations',
      'does not change operational RLS',
      'does not access production',
      'does not make public trust claims',
      'today-view request handoffs',
      'role-prioritized work handoffs',
      'main command center request handoffs',
      'audit log request target links',
      'person and records request backlinks',
      'relationship intelligence record prefill links',
      'request relationship suggestion links',
      'request linked-person profile links',
      'record detail linked-person handoffs',
      'entity directory detail and edit links',
      'entity create/edit success and cancel navigation',
      'Mass intention detail and edit navigation',
      'communication commitment card links',
      'care cadence request handoffs',
      'follow-up queue request links',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps read-only dashboard DTOs on the shared sanitizer instead of local copies', () => {
    const expectedImports = new Map([
      ['lib/dailyOfficeHandoffDigest.ts', "import { safeDashboardHref } from './safeDashboardHref'"],
      ['lib/dailyOfficeHandoffSavedViews.ts', "import { safeDashboardHref } from './safeDashboardHref'"],
      [
        'lib/requestWorkflowV2.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/dailyWorkHubOverview.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/dailyOperatingSystemSignals.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      ['lib/parishHealthScore.ts', "import { safeDashboardHref } from '@/lib/safeDashboardHref'"],
      [
        'lib/operationalIntelligenceBrief.ts',
        "import { safeDashboardHref } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/workflowReminderDtos.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/workflowReminderDispositionDtos.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      ['lib/sacramentalRecordContinuity.ts', "import { safeDashboardHrefOrFallback } from './safeDashboardHref'"],
      [
        'lib/sacramentalRecordContinuityHandoff.ts',
        "import { safeDashboardHrefOrFallback } from './safeDashboardHref'",
      ],
      ['lib/parishOnboardingReadiness.ts', "import { safeDashboardHrefOrFallback } from './safeDashboardHref'"],
      [
        'lib/notificationsCenter/buildNotificationsCenter.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/relationshipIntelligence/suggestedActionPresentation.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/parishCareCalendar.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/parishCommunicationCenter.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/parishIntakeQueue.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      ['lib/ownershipHealth.ts', "import { safeDashboardHref } from '@/lib/safeDashboardHref'"],
      [
        'lib/parishOpsBrief.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/communicationCommitments.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      ['lib/staffCommandCenter.ts', 'requestWorkflowDetailHref(requestId, workflow.sectionAnchor)'],
      [
        'lib/careTimeline.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/globalSearch/formatGlobalSearchResults.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/dashboardRequestNavigation.ts',
        "import { safeDashboardHref, safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
      [
        'lib/dashboardEntityNavigation.ts',
        "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
      ],
    ])

    for (const [path, expectedImport] of expectedImports) {
      const source = readRepoFile(path)
      expect(source).toContain(expectedImport)
      expect(source).not.toContain('function safeDashboardHref(')
    }
  })

  it('links the utility from current state docs', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Safe Dashboard Href Utility')
    expect(sourceOfTruth).toContain('Safe Dashboard Href utility')
  })
})
