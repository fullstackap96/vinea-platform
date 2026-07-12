import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_VERSION,
  validateFutureDailyOfficeHandoffSavedViewDashboardUiSource,
} from './dailyOfficeHandoffSavedViewDashboardUiPreflight'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

const compliantComponentSource = `
  import type { DailyOfficeHandoffSavedViewPlan } from '@/lib/dailyOfficeHandoffSavedViews'
  import { buildDailyOfficeHandoffSavedViewPlan } from '@/lib/dailyOfficeHandoffSavedViews'

  export function DashboardDailyOfficeHandoffSavedViews({
    dailyOfficeHandoffDigest,
    activeParishName,
  }: {
    dailyOfficeHandoffDigest: ExistingDailyOfficeHandoffDigest
    activeParishName: string
  }) {
    const plan: DailyOfficeHandoffSavedViewPlan =
      buildDailyOfficeHandoffSavedViewPlan({ digest: dailyOfficeHandoffDigest })

    return (
      <section aria-label="Daily office handoff saved views">
        <p>Read-only saved-view guidance for the selected active parish: {activeParishName}.</p>
        <p>These cues are staff-reviewed. No automation runs from this card.</p>
        <p>The plan is derived from the existing Daily Office Handoff Digest.</p>
        {plan.presets.map((preset) => (
          <article key={preset.key}>
            <h3>{preset.label}</h3>
            <p>
              Front desk opening view. Sacramental records handoff view.
              Administrator closeout view.
            </p>
            <a href={preset.recommendedQueueHref}>Open staff-reviewed queues</a>
            <p>Handoff rhythm</p>
            <ol>
              {preset.reviewRhythm.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {preset.cues.map((cue) => (
              <a key={cue.key} href={cue.href ?? preset.recommendedQueueHref}>
                {cue.title}
              </a>
            ))}
            {preset.cues.length === 0 ? (
              <p>No handoff cue is visible right now; show the preset.emptyState empty state.</p>
            ) : null}
          </article>
        ))}
      </section>
    )
  }
`

const compliantDashboardSource = `
  <DashboardDailyWorkHubOverview />
  <DashboardDailyOfficeHandoffDigest />
  <DashboardDailyOfficeHandoffSavedViews />
  <DashboardParishHealthScore />
`

describe('Daily Office Handoff saved-view dashboard UI preflight', () => {
  it('accepts future UI source that is read-only, digest-derived, and placed near the handoff card', () => {
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource: compliantComponentSource,
      dashboardSource: compliantDashboardSource,
    })

    expect(result.ok).toBe(true)
    expect(result.version).toBe(
      DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_VERSION,
    )
    expect(result.forbiddenMarkersPresent).toEqual([])
    expect(result.gates.every((gate) => gate.ok)).toBe(true)
  })

  it('rejects future UI source that adds mutation, API, storage, export, email, AI, or certificate controls', () => {
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource: `
        ${compliantComponentSource}
        <button onClick={sendReminder}>Send reminder</button>
        <form action={savePreference}>Save view</form>
        await fetch('/api/email')
        const supabase = createClient()
        await supabase.from('requests').update({ status: 'done' })
        await storage.from('documents').createSignedUrl('private/path', 60)
        await OpenAI.responses.create({})
        await fetch('/api/exports')
        generateCertificate()
      `,
      dashboardSource: compliantDashboardSource,
    })

    expect(result.ok).toBe(false)
    expect(result.forbiddenMarkersPresent).toEqual(
      expect.arrayContaining([
        '<button',
        '<form',
        'onClick=',
        'action=',
        'fetch(',
        'createClient(',
        '.update(',
        'createSignedUrl',
        'storage.from(',
        'OpenAI',
        '/api/email',
        '/api/exports',
        'generateCertificate',
      ]),
    )
  })

  it('rejects source that skips the existing Daily Office Handoff Digest and active parish context', () => {
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource: `
        export function DashboardDailyOfficeHandoffSavedViews() {
          return <section>Front desk opening view</section>
        }
      `,
      dashboardSource: compliantDashboardSource,
    })

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('saved_view_plan_gate')
    expect(result.errors.join('\n')).toContain('digest_derived_gate')
    expect(result.errors.join('\n')).toContain('active_parish_context_gate')
    expect(result.errors.join('\n')).toContain('staff_reviewed_boundary_gate')
  })

  it('rejects source that includes only partial markers for a required gate', () => {
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource: `
        import { buildDailyOfficeHandoffSavedViewPlan } from '@/lib/dailyOfficeHandoffSavedViews'

        export function DashboardDailyOfficeHandoffSavedViews({
          dailyOfficeHandoffDigest,
          activeParishName,
        }: {
          dailyOfficeHandoffDigest: ExistingDailyOfficeHandoffDigest
          activeParishName: string
        }) {
          const plan = buildDailyOfficeHandoffSavedViewPlan({
            digest: dailyOfficeHandoffDigest,
          })

          return (
            <section>
              <p>Active parish: {activeParishName}</p>
              <p>Read-only staff-reviewed guidance.</p>
              <p>Front desk opening view</p>
              {plan.presets.map((preset) => (
                <a key={preset.key} href={preset.recommendedQueueHref}>
                  {preset.label}
                </a>
              ))}
            </section>
          )
        }
      `,
      dashboardSource: compliantDashboardSource,
    })

    expect(result.ok).toBe(false)
    expect(result.gates.find((gate) => gate.id === 'saved_view_plan_gate')).toMatchObject({
      ok: false,
      matchedMarkers: ['buildDailyOfficeHandoffSavedViewPlan', 'plan.presets'],
    })
    expect(result.gates.find((gate) => gate.id === 'preset_labels_gate')).toMatchObject({
      ok: false,
      matchedMarkers: ['Front desk opening view'],
    })
    expect(result.errors.join('\n')).toContain('saved_view_plan_gate')
    expect(result.errors.join('\n')).toContain('preset_labels_gate')
    expect(result.errors.join('\n')).toContain('handoff_rhythm_gate')
    expect(result.errors.join('\n')).toContain('Expected markers:')
  })

  it('rejects dashboard composition that places saved views away from the handoff card', () => {
    const result = validateFutureDailyOfficeHandoffSavedViewDashboardUiSource({
      componentSource: compliantComponentSource,
      dashboardSource: `
        <DashboardDailyWorkHubOverview />
        <DashboardParishHealthScore />
        <DashboardDailyOfficeHandoffSavedViews />
        <DashboardDailyOfficeHandoffDigest />
      `,
    })

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('dashboard_placement_gate')
  })

  it('documents the preflight without claiming UI wiring or runtime behavior', () => {
    const doc = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_20260706.md',
    )
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')
    const repoAudit = readRepoFile('docs/VINEA_REPO_AUDIT.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_PREFLIGHT_PREPARED_20260706',
      'PREPARED - SOURCE-LEVEL PREFLIGHT',
      'Current status remains `NO-GO FOR UI WIRING`',
      'does not implement UI',
      'does not approve production exposure',
      'buttons, forms, click handlers',
      'storage/signed URL calls',
      'complete marker set',
      'A partial marker mention is not enough',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain(
      'Daily Office Handoff Saved-View Dashboard UI Source Preflight Prepared',
    )
    expect(roadmap).toContain(
      'Daily Office Handoff saved-view dashboard UI source preflight',
    )
    expect(sourceOfTruth).toContain(
      'Daily Office Handoff saved-view dashboard UI source preflight',
    )
    expect(repoAudit).toContain(
      'Daily Office Handoff saved-view dashboard UI source preflight',
    )
  })
})
