import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('Data Imports reviewed snapshot integrity boundary', () => {
  const client = read('app/dashboard/imports/DashboardImportsPageClient.tsx')
  const route = read('app/api/imports/route.ts')

  it('uses one immediate operation lock across file read, preview, and commit', () => {
    expect(client).toContain('const operationInFlightRef = useRef(false)')
    expect(client).toContain("beginOperation('reading_file')")
    expect(client).toContain("beginOperation('previewing')")
    expect(client).toContain("beginOperation('committing')")
    expect(client).toContain('if (operationInFlightRef.current) return false')
    expect(client).toContain('operationInFlightRef.current = true')
    expect(client).toContain('operationInFlightRef.current = false')
    expect(client.match(/finally \{/g)?.length).toBeGreaterThanOrEqual(3)
  })

  it('commits the copied reviewed snapshot rather than recomputed live inputs', () => {
    const previewBlock = client.slice(
      client.indexOf('async function requestPreview()'),
      client.indexOf('async function commitImport()'),
    )
    const commitBlock = client.slice(
      client.indexOf('async function commitImport()'),
      client.indexOf('const columns = IMPORT_COLUMNS'),
    )

    expect(previewBlock).toContain('const snapshot: ReviewedImportSnapshot')
    expect(previewBlock).toContain('rows: copyMappedRows(mappedRows)')
    expect(previewBlock).toContain('body: JSON.stringify({ ...snapshot, commit: false })')
    expect(previewBlock).toContain('setReviewedSnapshot(snapshot)')
    expect(commitBlock).toContain('!reviewedSnapshot')
    expect(commitBlock).toContain('body: JSON.stringify({ ...reviewedSnapshot, commit: true })')
    expect(commitBlock).not.toContain('rows: mappedRows')
    expect(commitBlock).not.toContain('kind, fileName')
  })

  it('invalidates the preview on every reviewed-input change and freezes controls while busy', () => {
    expect(client).toContain('function clearReviewedImport()')
    expect(client).toContain('setReviewedSnapshot(null)')
    expect(client).toContain('function handleKindChange')
    expect(client).toContain('function handleMappingChange')
    expect(client).toContain('disabled={operationBusy}')
    expect(client).toContain('disabled={!canImport}')
    expect(client).toContain("activeOperation === 'committing'")
    expect(client).toContain('Importing reviewed records...')
  })

  it('blocks blind retries after partial or unconfirmed commit outcomes', () => {
    expect(client).toContain('const [commitRetryBlocked, setCommitRetryBlocked] = useState(false)')
    expect(client).toContain('data?.partial === true')
    expect(client).toContain('setCommitRetryBlocked(true)')
    expect(client).toContain('UNCERTAIN_IMPORT_MESSAGE')
    expect(client).toContain('Review Recent imports and the records list before trying again.')
    expect(client).toContain('await loadHistory()')

    expect(route).toContain('partial: insertedRowCount > 0')
    expect(route).toContain('rowsCreated: insertedRowCount')
    expect(route).toContain('batchRecorded: false')
  })

  it('validates preview and commit confirmation shapes before rendering or reporting success', () => {
    expect(client).toContain('function isImportPreviewResult')
    expect(client).toContain('!isImportPreviewResult(data.preview)')
    expect(client).toContain('data.preview.kind !== snapshot.kind')
    expect(client).toContain('data.preview.totalRows !== snapshot.rows.length')
    expect(client).toContain('data.preview.kind !== reviewedSnapshot.kind')
    expect(client).toContain('data.preview.totalRows !== reviewedSnapshot.rows.length')
    expect(client).toContain('createdCount > data.preview.importableRows')
  })

  it('documents scope, staff guidance, and unchanged production boundaries', () => {
    const evidence = read('docs/DATA_IMPORT_REVIEWED_SNAPSHOT_INTEGRITY_BOUNDARY_20260711.md')

    for (const phrase of [
      'DATA_IMPORT_REVIEWED_SNAPSHOT_INTEGRITY_IMPLEMENTED_20260711',
      'exact copied snapshot',
      'blind retry',
      'Recent imports',
      'No production or shared-QA access',
      'No migration or operational RLS change',
      'No provider, communication, Calendar, AI, export, or storage call',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
