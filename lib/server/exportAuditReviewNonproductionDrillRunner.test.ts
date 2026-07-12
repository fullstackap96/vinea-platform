import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'run-export-audit-review-nonproduction-drill.mjs')

describe('export audit review non-production drill runner', () => {
  it('requires the explicit drill confirmation phrase and approved shared-QA host', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "const APPROVAL = 'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL'",
      "process.env.VINEA_EXPORT_AUDIT_DRILL_CONFIRM",
      "const APPROVED_SUPABASE_HOST = 'gnfomgsuottcuueasfvi.supabase.co'",
      'validateNonProductionTarget(supabaseUrl)',
      'Refusing to run against unapproved Supabase host',
    ]) {
      expect(source).toContain(expected)
    }
  })

  it('uses only the non-production export runtime QA flags', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      "VINEA_EXPORT_RUNTIME: 'ENABLED'",
      "VINEA_EXPORT_RUNTIME_ACK: 'APPROVED_EXPORT_RUNTIME_QA'",
      "VINEA_EXPORT_RUNTIME_ENV: 'NON_PRODUCTION'",
      "VINEA_EXPORT_RUNTIME_ACK: ''",
      "VINEA_EXPORT_RUNTIME_ENV: ''",
    ]) {
      expect(source).toContain(expected)
    }

    expect(source).not.toContain('APPROVED_EXPORT_RUNTIME_PRODUCTION')
    expect(source).not.toContain('VINEA_EXPORT_RUNTIME_ENV: \'PRODUCTION\'')
  })

  it('records only sanitized route results and excludes forbidden export material from evidence summaries', () => {
    const source = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'forbiddenMarkers',
      "'signed_url'",
      "'storage_path'",
      "'original_filename'",
      "'portal_token'",
      "'token_hash'",
      'forbiddenCsvMarkers',
      'forbiddenMetadataMarkers',
      'secretsPrinted: false',
      'productionExportsRemainNoGo',
    ]) {
      expect(source).toContain(expected)
    }
  })
})
