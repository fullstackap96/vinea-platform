import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('relationship intelligence record prefill safe link boundary', () => {
  it('keeps record prefill links on the shared suggested-action helper', () => {
    const presentation = readRepoFile('lib/relationshipIntelligence/suggestedActionPresentation.ts')
    const component = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestRecordSuggestion.tsx'
    )

    expect(presentation).toContain('export function recordPrefillHrefForRequest')
    expect(presentation).toContain('export function recordDetailHrefForSuggestedAction')
    expect(presentation).toContain('export function requestDetailHrefForSuggestedAction')
    expect(presentation).toContain(
      '`/dashboard/records/new?requestId=${encodeURIComponent(normalizedRequestId)}`'
    )
    expect(presentation).toContain(
      '`/dashboard/records/${encodeURIComponent(normalizedRecordId)}`'
    )
    expect(presentation).toContain(
      '`/dashboard/requests/${encodeURIComponent(normalizedRequestId)}`'
    )
    expect(presentation).toContain('safeDashboardHrefOrFallback(path, fallback)')
    expect(presentation).toContain('return recordDetailHrefForSuggestedAction(action.recordId)')
    expect(presentation).toContain('return requestDetailHrefForSuggestedAction(action.requestId)')
    expect(presentation).not.toContain('encodeURIComponent(action.recordId)')
    expect(presentation).not.toContain('encodeURIComponent(action.requestId)')

    expect(component).toContain(
      "import { recordPrefillHrefForRequest } from '@/lib/relationshipIntelligence/suggestedActionPresentation'"
    )
    expect(component).toContain('href={recordPrefillHrefForRequest(requestId)}')
    expect(component).not.toContain(
      'href={`/dashboard/records/new?requestId=${encodeURIComponent(requestId)}`'
    )
  })

  it('documents the record prefill handoff as read-only Catholic records link hardening', () => {
    const doc = readRepoFile('docs/RELATIONSHIP_INTELLIGENCE_RECORD_PREFILL_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Relationship Intelligence record prefill and suggested-action detail links')
    expect(doc).toContain('does not generate certificates')
    expect(safeHrefDoc).toContain('relationship intelligence record prefill links')
    expect(buildStatus).toContain('Relationship Intelligence Record Prefill Safe Link Boundary')
    expect(roadmap).toContain('Relationship Intelligence Record Prefill safe link boundary')
    expect(sourceOfTruth).toContain(
      'Relationship Intelligence Record Prefill safe link boundary'
    )
  })
})
