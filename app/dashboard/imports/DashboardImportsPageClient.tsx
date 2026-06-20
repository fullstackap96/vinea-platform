'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react'
import {
  applyColumnMapping,
  formatImportKindLabel,
  guessColumnMapping,
  IMPORT_COLUMNS,
  IMPORT_TEMPLATES,
  parseCsv,
  type DataImportKind,
  type ImportBatchRow,
  type ImportMappedRow,
  type ImportPreviewResult,
  type ParsedCsv,
} from '@/lib/parishDataImport'
import { primaryButtonMd, secondaryButtonSm } from '@/lib/buttonStyles'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

type ApiState =
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string }

const IMPORT_KIND_OPTIONS: { kind: DataImportKind; description: string }[] = [
  {
    kind: 'people',
    description: 'Names, contact information, birthdays, and notes.',
  },
  {
    kind: 'households',
    description: 'Household names, mailing addresses, and notes.',
  },
  {
    kind: 'sacramental_records',
    description: 'Register entries for baptisms, funerals, weddings, OCIA, and more.',
  },
]

function csvEscape(value: string) {
  if (!/[",\n\r]/.test(value)) return value
  return `"${value.replace(/"/g, '""')}"`
}

function downloadTemplate(kind: DataImportKind) {
  const blob = new Blob([IMPORT_TEMPLATES[kind]], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${kind.replace(/_/g, '-')}-template.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function exportIssueCsv(preview: ImportPreviewResult) {
  const lines = [
    ['Row', 'Severity', 'Field', 'Message'].map(csvEscape).join(','),
    ...preview.preparedRows.flatMap((row) =>
      row.issues.map((issue) =>
        [
          String(issue.rowNumber),
          issue.severity,
          issue.field ?? '',
          issue.message,
        ].map(csvEscape).join(',')
      )
    ),
  ]
  const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'vinea-import-review.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function DashboardImportsPageClient() {
  const [kind, setKind] = useState<DataImportKind>('people')
  const [fileName, setFileName] = useState('')
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [history, setHistory] = useState<ImportBatchRow[]>([])
  const [apiState, setApiState] = useState<ApiState>({ status: 'idle' })

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/imports', { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok) {
      setHistory(Array.isArray(data.imports) ? data.imports : [])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/imports', { credentials: 'include' })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!cancelled && ok && data?.ok) {
          setHistory(Array.isArray(data.imports) ? data.imports : [])
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const mappedRows = useMemo<ImportMappedRow[]>(() => {
    if (!parsedCsv) return []
    return applyColumnMapping(parsedCsv, mapping)
  }, [mapping, parsedCsv])

  async function handleFile(file: File | null) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setApiState({ status: 'error', message: 'Please choose a CSV file.' })
      return
    }

    const text = await file.text()
    const nextParsed = parseCsv(text)
    if (nextParsed.headers.length === 0 || nextParsed.rows.length === 0) {
      setApiState({
        status: 'error',
        message: 'The CSV needs a header row and at least one data row.',
      })
      return
    }

    setFileName(file.name)
    setParsedCsv(nextParsed)
    setMapping(guessColumnMapping(kind, nextParsed.headers))
    setPreview(null)
    setApiState({
      status: 'success',
      message: `${nextParsed.rows.length} row${nextParsed.rows.length === 1 ? '' : 's'} ready to map.`,
    })
  }

  function handleKindChange(nextKind: DataImportKind) {
    setKind(nextKind)
    setPreview(null)
    if (parsedCsv) {
      setMapping(guessColumnMapping(nextKind, parsedCsv.headers))
    } else {
      setMapping({})
    }
  }

  async function requestPreview() {
    if (!parsedCsv || mappedRows.length === 0) {
      setApiState({ status: 'error', message: 'Upload a CSV file first.' })
      return
    }
    setApiState({ status: 'loading', message: 'Checking the spreadsheet...' })
    const res = await fetch('/api/imports', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, fileName, rows: mappedRows, commit: false }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      setApiState({ status: 'error', message: data?.error ?? 'Could not preview import.' })
      return
    }
    setPreview(data.preview)
    setApiState({
      status: 'success',
      message: 'Review complete. Fix errors before importing.',
    })
  }

  async function commitImport() {
    if (!preview || !parsedCsv) return
    if (preview.errorCount > 0) {
      setApiState({ status: 'error', message: 'Fix rows with errors before importing.' })
      return
    }
    setApiState({ status: 'loading', message: 'Importing records...' })
    const res = await fetch('/api/imports', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, fileName, rows: mappedRows, commit: true }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.ok) {
      setApiState({ status: 'error', message: data?.error ?? 'Could not import rows.' })
      return
    }
    setPreview(data.preview)
    setApiState({
      status: 'success',
      message: `Imported ${data.result?.createdCount ?? 0} record${
        data.result?.createdCount === 1 ? '' : 's'
      }.`,
    })
    await loadHistory()
  }

  const columns = IMPORT_COLUMNS[kind]
  const canPreview = Boolean(parsedCsv && mappedRows.length > 0 && apiState.status !== 'loading')
  const canImport = Boolean(preview && preview.errorCount === 0 && preview.importableRows > 0)

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Data import
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Bring parish spreadsheets into Vinea with a clear review step before anything is saved.
          </p>
        </div>
      </header>

      <section className={`mb-5 ${vineaSectionShellClassName}`}>
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-base font-semibold text-gray-900">Start with a clean template</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Download a template or upload a CSV from another system. Vinea will help match columns,
              flag missing information, and warn about likely duplicates.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {IMPORT_KIND_OPTIONS.map((option) => (
            <button
              key={option.kind}
              type="button"
              onClick={() => handleKindChange(option.kind)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                kind === option.kind
                  ? 'border-brand bg-brand/5 text-gray-950 ring-1 ring-brand/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="block font-semibold">{formatImportKindLabel(option.kind)}</span>
              <span className="mt-1 block max-w-xs text-xs leading-relaxed text-gray-600">
                {option.description}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadTemplate(kind)}
            className={`${secondaryButtonSm} gap-2`}
          >
            <Download className="h-4 w-4" aria-hidden />
            Download {formatImportKindLabel(kind).toLowerCase()} template
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <section className="space-y-5">
          <div className={vineaSectionShellClassName}>
            <h2 className="text-lg font-semibold text-gray-900">1. Upload spreadsheet</h2>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center hover:border-brand/60 hover:bg-brand/5">
              <Upload className="h-7 w-7 text-brand" aria-hidden />
              <span className="mt-2 text-sm font-semibold text-gray-900">
                Choose a CSV file
              </span>
              <span className="mt-1 text-xs text-gray-600">
                {fileName || 'Nothing will be imported until you approve the preview.'}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {parsedCsv ? (
            <div className={vineaSectionShellClassName}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">2. Match columns</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Check that each Vinea field is matched to the right spreadsheet column.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {parsedCsv.rows.length} row{parsedCsv.rows.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {columns.map((column) => (
                  <label key={column.key} className="block">
                    <span className="text-sm font-medium text-gray-800">
                      {column.label}
                      {column.required ? <span className="text-red-700"> *</span> : null}
                    </span>
                    <select
                      value={mapping[column.key] ?? ''}
                      onChange={(event) =>
                        setMapping((current) => ({
                          ...current,
                          [column.key]: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="">Do not import</option>
                      {parsedCsv.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    {column.help ? (
                      <span className="mt-1 block text-xs text-gray-500">{column.help}</span>
                    ) : null}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={requestPreview}
                  disabled={!canPreview}
                  className={primaryButtonMd}
                >
                  Preview import
                </button>
              </div>
            </div>
          ) : null}

          {preview ? (
            <div className={vineaSectionShellClassName}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">3. Review and import</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Errors must be fixed. Warnings are usually duplicates to review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportIssueCsv(preview)}
                  disabled={preview.errorCount + preview.warningCount === 0}
                  className={secondaryButtonSm}
                >
                  Export review notes
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <Metric label="Rows" value={preview.totalRows} />
                <Metric label="Ready" value={preview.importableRows} tone="good" />
                <Metric label="Warnings" value={preview.warningCount} tone="warn" />
                <Metric label="Errors" value={preview.errorCount} tone="bad" />
              </div>

              <ul className="mt-4 max-h-[26rem] space-y-2 overflow-auto pr-1">
                {preview.preparedRows.slice(0, 80).map((row) => {
                  const hasError = row.issues.some((issue) => issue.severity === 'error')
                  return (
                    <li
                      key={row.rowNumber}
                      className="rounded-xl border border-gray-200 bg-white p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900">
                          Row {row.rowNumber}: {row.displayName}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            hasError
                              ? 'bg-red-50 text-red-800'
                              : row.issues.length > 0
                                ? 'bg-amber-50 text-amber-900'
                                : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {hasError ? 'Needs fix' : row.issues.length > 0 ? 'Review' : 'Ready'}
                        </span>
                      </div>
                      {row.issues.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-gray-700">
                          {row.issues.map((issue, index) => (
                            <li key={`${issue.message}-${index}`} className="flex gap-2">
                              <span
                                className={
                                  issue.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                                }
                              >
                                {issue.severity === 'error' ? 'Error:' : 'Warning:'}
                              </span>
                              <span>{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  )
                })}
              </ul>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={commitImport}
                  disabled={!canImport || apiState.status === 'loading'}
                  className={primaryButtonMd}
                >
                  Import {preview.importableRows} ready row
                  {preview.importableRows === 1 ? '' : 's'}
                </button>
                <p className="text-sm leading-relaxed text-gray-600 sm:max-w-md">
                  Rows with warnings will import. Rows with errors will be skipped until fixed.
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <StatusPanel state={apiState} />
          <section className={vineaSectionShellClassName}>
            <h2 className="text-lg font-semibold text-gray-900">Recent imports</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                No imports yet. Once staff imports a spreadsheet, the summary will appear here.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {history.map((item) => (
                  <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatImportKindLabel(item.import_kind)}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {new Date(item.created_at).toLocaleString()} by {item.actor_email ?? 'staff'}
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      {item.created_count} created, {item.skipped_count} skipped
                    </p>
                    {item.original_filename ? (
                      <p className="mt-1 break-words text-xs text-gray-500">
                        {item.original_filename}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-800'
      : tone === 'warn'
        ? 'text-amber-800'
        : tone === 'bad'
          ? 'text-red-800'
          : 'text-gray-900'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}

function StatusPanel({ state }: { state: ApiState }) {
  if (state.status === 'idle') {
    return (
      <section className={vineaSectionShellClassName}>
        <h2 className="text-lg font-semibold text-gray-900">Safe by design</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Vinea previews the import first. Staff can fix the spreadsheet before any data is saved.
        </p>
      </section>
    )
  }

  const icon =
    state.status === 'error' ? (
      <AlertCircle className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
    ) : state.status === 'success' ? (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
    ) : (
      <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand" aria-hidden />
    )

  const className =
    state.status === 'error'
      ? 'border-red-200 bg-red-50 text-red-950'
      : state.status === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
        : 'border-blue-200 bg-blue-50 text-blue-950'

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${className}`}>
      <div className="flex gap-3">
        {icon}
        <p className="text-sm font-medium">{state.message}</p>
      </div>
    </section>
  )
}
