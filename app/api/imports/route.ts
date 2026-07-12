import { NextResponse, type NextRequest } from 'next/server'
import {
  buildImportPreview,
  DATA_IMPORT_KINDS,
  type DataImportKind,
  type ImportMappedRow,
} from '@/lib/parishDataImport'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

export const runtime = 'nodejs'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

type ImportRequestBody = {
  kind?: unknown
  fileName?: unknown
  rows?: unknown
  commit?: unknown
}

const MAX_BODY_BYTES = 4 * 1024 * 1024

type ImportErrorAction =
  | 'history'
  | 'preview-or-commit'
  | 'load-existing'
  | 'commit-insert'
  | 'record-failed-batch'
  | 'record-completed-batch'

function isImportKind(value: unknown): value is DataImportKind {
  return DATA_IMPORT_KINDS.includes(value as DataImportKind)
}

function text(value: unknown, max = 240): string {
  return String(value ?? '').trim().slice(0, max)
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function logImportsError(
  action: ImportErrorAction,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[imports] ${action} failed`, error, {
    route: '/api/imports',
    ...extra,
  })
}

async function resolveImportReadParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (requestedParishId && context.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read imports for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read imports for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function resolveImportWriteParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
): Promise<
  | { ok: true; parishId: string }
  | { ok: false; error: string; technicalDetail: string | null; requestedParishId: string | null }
> {
  const context = await resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason: 'Data imports API legacy compatibility path.',
  })

  if (!context.ok) {
    return {
      ok: false,
      error: context.error,
      technicalDetail: context.technicalDetail,
      requestedParishId: context.requestedParishId,
    }
  }

  return { ok: true, parishId: context.parishId }
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

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveImportReadParishId(staff.supabase, requestedParishId)
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.activeParishId

    const { data, error } = await admin
      .from('import_batches')
      .select(
        [
          'id',
          'parish_id',
          'import_kind',
          'original_filename',
          'status',
          'total_rows',
          'created_count',
          'skipped_count',
          'warning_count',
          'error_count',
          'actor_email',
          'summary',
          'created_at',
        ].join(', ')
      )
      .eq('parish_id', parishId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      logImportsError('history', error, {
        hasActiveParishCookie: Boolean(requestedParishId),
      })
      return NextResponse.json({ ok: false, error: 'Could not load imports.' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      activeParishName: parishContext.activeParish.name ?? null,
      imports: data ?? [],
    })
  } catch (error: unknown) {
    logImportsError('history', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
    })
    return NextResponse.json({ ok: false, error: 'Could not load imports.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Import request is too large. Split the spreadsheet into smaller batches.'
            : 'Invalid import request.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as ImportRequestBody | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
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

  const commit = Boolean(body.commit)
  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    let parishId: string
    if (commit) {
      const parishContext = await resolveImportWriteParishId(staff.supabase, requestedParishId)
      if (!parishContext.ok) {
        return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
      }
      parishId = parishContext.parishId
    } else {
      const parishContext = await resolveImportReadParishId(staff.supabase, requestedParishId)
      if (!parishContext.ok) {
        return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
      }
      parishId = parishContext.activeParishId
    }

    const existingRows = await loadExistingRows(admin, parishId, kind).catch((error: unknown) => {
      logImportsError('load-existing', error, {
        hasActiveParishCookie: Boolean(requestedParishId),
        kind,
        commit,
      })
      throw error
    })
    const preview = buildImportPreview(kind, rows, existingRows)
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

    let insertedRowCount = 0
    if (insertRows.length > 0) {
      const { data: insertedRows, error } = await admin
        .from(tableForKind(kind))
        .insert(insertRows)
        .select('id')
      insertedRowCount = insertedRows?.length ?? 0
      if (error || insertedRowCount !== insertRows.length) {
        const insertFailure =
          error ?? new Error('Imported row count did not match the prepared row count.')
        logImportsError('commit-insert', insertFailure, {
          hasActiveParishCookie: Boolean(requestedParishId),
          kind,
          insertRowCount: insertRows.length,
          confirmedInsertRowCount: insertedRowCount,
        })
        const { data: failureBatch, error: failureBatchError } = await admin
          .from('import_batches')
          .insert({
            parish_id: parishId,
            import_kind: kind,
            original_filename: text(body.fileName),
            status: 'failed',
            total_rows: preview.totalRows,
            created_count: insertedRowCount,
            skipped_count: preview.totalRows - insertedRowCount,
            warning_count: preview.warningCount,
            error_count: preview.errorCount + 1,
            actor_email: staff.staff.email,
            summary: { error: 'Import row insert failed.' },
          })
          .select('id')
          .maybeSingle()
        if (failureBatchError || !failureBatch?.id) {
          logImportsError(
            'record-failed-batch',
            failureBatchError ?? new Error('Failed import batch was not recorded.'),
            {
              hasActiveParishCookie: Boolean(requestedParishId),
              kind,
            }
          )
        }
        return NextResponse.json(
          {
            ok: false,
            partial: insertedRowCount > 0,
            completed: {
              rowsCreated: insertedRowCount,
              batchRecorded: Boolean(failureBatch?.id),
            },
            error: 'Could not import rows.',
            preview,
          },
          { status: 500 }
        )
      }
    }

    const skippedCount = preview.totalRows - insertedRowCount
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
        created_count: insertedRowCount,
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

    if (batchError || !batch?.id) {
      logImportsError(
        'record-completed-batch',
        batchError ?? new Error('Completed import batch was not recorded.'),
        {
          hasActiveParishCookie: Boolean(requestedParishId),
          kind,
          confirmedInsertRowCount: insertedRowCount,
        }
      )
      return NextResponse.json(
        {
          ok: false,
          partial: insertedRowCount > 0,
          completed: {
            rowsCreated: insertedRowCount,
            batchRecorded: false,
          },
          error: 'Could not record import batch.',
          preview,
        },
        { status: 500 }
      )
    }

    await writeAuditEvent({
      parishId,
      actorEmail: staff.staff.email,
      action: 'import.completed',
      targetType: 'import_batch',
      targetId: String(batch.id),
      metadata: {
        source: 'staff_import',
        kind,
        total_rows: preview.totalRows,
        created_count: insertedRowCount,
        skipped_count: skippedCount,
        warning_count: preview.warningCount,
        error_count: preview.errorCount,
      },
    })

    return NextResponse.json({
      ok: true,
      preview,
      result: {
        batchId: String(batch.id),
        createdCount: insertedRowCount,
        skippedCount,
      },
    })
  } catch (error: unknown) {
    logImportsError('preview-or-commit', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
      kind,
      commit,
      rowCount: rows.length,
    })
    return NextResponse.json({ ok: false, error: 'Could not process import.' }, { status: 500 })
  }
}

export const importsRouteTestInternals = {
  activeParishCookie,
  resolveImportReadParishId,
  resolveImportWriteParishId,
}
