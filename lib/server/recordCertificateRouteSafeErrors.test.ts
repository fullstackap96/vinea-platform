import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const routePath = join(process.cwd(), 'app', 'api', 'records', '[id]', 'certificate', 'route.ts')

describe('record certificate route safe errors', () => {
  it('logs unexpected failures server-side and returns stable staff-safe messages', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function certificateRouteErrorResponse')
    expect(source).toContain("logServerError(`[record-certificate] ${action} failed`, error)")

    expect(source).toContain('Could not load sacramental record.')
    expect(source).toContain('Could not log certificate generation.')
    expect(source).toContain('Could not generate certificate.')

    expect(source).not.toContain('error: rowErr.message')
    expect(source).not.toContain('error: eventErr.message')
    expect(source).not.toContain('const message = e instanceof Error ? e.message')
    expect(source).not.toContain('error: message }, { status: 500 }')
  })

  it('preserves the existing baptism certificate behavior and audit event boundary', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('buildBaptismCertificatePdf')
    expect(source).toContain('baptismCertificateFilename')
    expect(source).toContain("record.record_type !== 'baptism'")
    expect(source).toContain('Certificates are only available for baptism records.')
    expect(source).toContain("action: 'certificate_generated'")
    expect(source).toContain("metadata: { template: 'baptism_v1' }")
    expect(source).toContain("'Content-Type': 'application/pdf'")
    expect(source).toContain("'Cache-Control': 'no-store'")
  })

  it('requires exact selected-parish staff scope before minimal record reads or certificate work', () => {
    const source = readFileSync(routePath, 'utf8')
    const staffIndex = source.indexOf('const staff = await requireStaffFromRequest(request)')
    const contextIndex = source.indexOf('const parishContext = await resolveCertificateParishContext(')
    const recordIndex = source.indexOf(".from('sacramental_records')")
    const pdfIndex = source.indexOf('const pdfBytes = await buildBaptismCertificatePdf({')
    const eventIndex = source.indexOf(".from('sacramental_record_events')")

    expect(staffIndex).toBeGreaterThan(-1)
    expect(contextIndex).toBeGreaterThan(staffIndex)
    expect(recordIndex).toBeGreaterThan(contextIndex)
    expect(pdfIndex).toBeGreaterThan(recordIndex)
    expect(eventIndex).toBeGreaterThan(pdfIndex)

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext(')
    expect(source).toContain("context.source !== 'membership'")
    expect(source).toContain(".select(CERTIFICATE_RECORD_SELECT)")
    expect(source).toContain(".eq('parish_id', parishContext.activeParishId)")
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('createSupabaseServiceRoleClient')
  })

  it('projects only the record fields used by the existing baptism certificate', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain(
      "'id, parish_id, record_type, person_name, sacrament_date, place, minister, book, page, line' as const",
    )
    expect(source).not.toContain('request_id,')
    expect(source).not.toContain('person_id,')
    expect(source).not.toContain('notes,')
    expect(source).not.toContain('created_by,')
    expect(source).not.toContain('updated_by,')
  })
})
