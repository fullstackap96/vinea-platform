import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildSacramentalRecordContinuityView } from '../sacramentalRecordContinuity'
import { buildSacramentalRecordContinuityHandoff } from '../sacramentalRecordContinuityHandoff'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('sacramental record continuity safe link boundary', () => {
  it('keeps continuity card and handoff DTO links dashboard-internal and encoded', () => {
    const continuity = buildSacramentalRecordContinuityView({
      record: { request_id: 'request/with?redirect=https://example.test', record_type: 'baptism' },
      events: [],
    })
    const handoff = buildSacramentalRecordContinuityHandoff({
      request_id: null,
      person_name: 'Maria https://example.test',
    })

    for (const href of [
      continuity.linkedRequestHref,
      handoff?.searchHref,
      handoff?.reviewQueueHref,
    ]) {
      expect(href).toBeTruthy()
      expect(href).toMatch(/^\/dashboard/)
      expect(href).not.toContain('://example.test')
      expect(href).not.toContain('javascript:')
    }
  })

  it('documents and source-checks the shared dashboard href utility boundary', () => {
    const continuityHelper = readRepoFile('lib/sacramentalRecordContinuity.ts')
    const handoffHelper = readRepoFile('lib/sacramentalRecordContinuityHandoff.ts')
    const doc = readRepoFile('docs/SACRAMENTAL_CONTINUITY_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(continuityHelper).toContain('safeDashboardHrefOrFallback')
    expect(handoffHelper).toContain('safeDashboardHrefOrFallback')
    expect(doc).toContain('staff-facing continuity links')
    expect(doc).toContain('dashboard-internal')
    expect(buildStatus).toContain('Sacramental Continuity Safe Link Boundary')
    expect(roadmap).toContain('Sacramental Continuity safe link boundary')
    expect(sourceOfTruth).toContain('Sacramental Continuity safe link boundary')
  })
})
