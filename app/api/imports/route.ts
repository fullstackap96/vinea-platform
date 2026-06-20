import { NextResponse, type NextRequest } from 'next/server'
import {
  buildImportPreview,
  DATA_IMPORT_KINDS,
  type DataImportKind,
  type ImportMappedRow,
} from '@/lib/parishDataImport'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export const runtime = 'nodejs'

type ImportRequestBody = {
  kind?: unknown
  fileName?: unknown
  rows?: unknown
  commit?: unknown
}

function isImportKind(value: unknown): value is DataImportKind {
  return DATA_IMPORT_KINDS.includes(value as DataImportKind)
}

function text(value: unknown, max = 240): string {
  return String(value ?? '').trim().slice(0, max)
}

async function primaryParishId(admin: ReturnType<typeof createSupabaseServiceRoleClient>) {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.id ? String(data.id) : null
}

function parseMappedRows(value: unknown): ImportMappedRow[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 1000).map((row, index) => {
    const raw = row && typeof row === 'object' && !Array.isArray(row) ? row as Record<string, unknown> : {}
    const valuesRaw = raw.values && typeof raw.values === 'object' && !Array.isArray(raw.values)
      ? raw.values as Record<string, unknown>
      : {}
    const values = Object.entries(valuesRaw).reduce<Record<string, string>>((next, [key, val]) => {
      next[key] = text(val, 2000)
      return next
    }, {})
    return {
      rowNumber: Number.isFinite(Number(raw.rowNumber)) ? Number(raw.rowNumber) : index + 2,
      values,
    }
  })
}

async function loadExistingRows(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  parishId: string,
  kind: DataImportKind
) {
  if (kind === 'people') {
    const { data, error } = await admin
      .from('people')
      .select('first_name, last_name, email, phone')
      .eq('parish_id', parishId)
      .limit(5000)
    if (error) throw error
    return data ?? []
  }

  if (kind === 'households') {
    const { data, error } = await admin
      .from('households')
      .select('name, address')
      .eq('parish_id', parishId)
      .limit(5000)
    if (error) throw error
    return data ?? []
  }

  const { data, error } = await admin
    .from('sacramental_records')
    .select('record_type, person_name, sacrament_date')
    .eq('parish_id', parishId)
    .limit(5000)
  if (error) throw error
  return data ?? []
}

function tableForKind(kind: DataImportKind) {
  if (kind === 'people') return 'people'
  if (kind === 'households') return 'households'
  return 'sacramental_records'
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const { data, error } = await admin
    .from('import_batches')
    .select(
      'id, parish_id, import_kind, original_filename, status, total_rows, created_count, skipped_count, warning_count, error_count, actor_email, summary, created_at'
    )
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, imports: data ?? [] })
}

export async function POST(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const body = await request.json().catch(() => null as ImportRequestBody | null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid import request.' }, { status: 400 })
  }

  const kind = body.kind
  if (!isImportKind(kind)) {
    return NextResponse.json({ ok: false, error: 'Choose what you are importing.' }, { status: 400 })
  }

  const rows = parseMappedRows(body.rows)
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'No spreadsheet rows were found.' }, { status: 400 })
  }

  const admin = createSupabaseServiceRoleClient()
  const parishId = await primaryParishId(admin)
  if (!parishId) {
    return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
  }

  const existingRows = await loadExistingRows(admin, parishId, kind)
  const preview = buildImportPreview(kind, rows, existingRows)
  const commit = Boolean(body.commit)
  if (!commit) {
    return NextResponse.json({ ok: true, preview })
  }

  const importableRows = preview.preparedRows.filter((row) =>
    row.issues.every((issue) => issue.severity !== 'error')
  )
  const insertRows = importableRows.map((row) => ({
    parish_id: parishId,
    ...row.payload,
  }))

  if (insertRows.length > 0) {
    const { error } = await admin.from(tableForKind(kind)).insert(insertRows)
    if (error) {
      await admin.from('import_batches').insert({
        parish_id: parishId,
        import_kind: kind,
        original_filename: text(body.fileName),
        status: 'failed',
        total_rows: preview.totalRows,
        created_count: 0,
        skipped_count: preview.totalRows,
        warning_count: preview.warningCount,
        error_count: preview.errorCount + 1,
        actor_email: staff.staff.email,
        summary: { error: error.message },
      })
      return NextResponse.json({ ok: false, error: error.message, preview }, { status: 500 })
    }
  }

  const skippedCount = preview.totalRows - insertRows.length
  const status = preview.warningCount > 0 || skippedCount > 0
    ? 'completed_with_warnings'
    : 'completed'

  const { data: batch, error: batchError } = await admin
    .from('import_batches')
    .insert({
      parish_id: parishId,
      import_kind: kind,
      original_filename: text(body.fileName),
      status,
      total_rows: preview.totalRows,
      created_count: insertRows.length,
      skipped_count: skippedCount,
      warning_count: preview.warningCount,
      error_count: preview.errorCount,
      actor_email: staff.staff.email,
      summary: {
        sample_rows: importableRows.slice(0, 5).map((row) => ({
          row_number: row.rowNumber,
          display_name: row.displayName,
        })),
      },
    })
    .select('id')
    .single()

  if (batchError) {
    return NextResponse.json({ ok: false, error: batchError.message, preview }, { status: 500 })
  }

  await writeAuditEvent({
    parishId,
    actorEmail: staff.staff.email,
    action: 'import.completed',
    targetType: 'import_batch',
    targetId: batch?.id ? String(batch.id) : null,
    metadata: {
      kind,
      file_name: text(body.fileName),
      total_rows: preview.totalRows,
      created_count: insertRows.length,
      skipped_count: skippedCount,
      warning_count: preview.warningCount,
      error_count: preview.errorCount,
    },
  })

  return NextResponse.json({
    ok: true,
    preview,
    result: {
      batchId: batch?.id ? String(batch.id) : null,
      createdCount: insertRows.length,
      skippedCount,
    },
  })
}
