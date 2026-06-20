import { isSacramentalRecordType } from '@/lib/sacramentalRecordConstants'
import type { SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export const DATA_IMPORT_KINDS = ['people', 'households', 'sacramental_records'] as const

export type DataImportKind = (typeof DATA_IMPORT_KINDS)[number]

export type ImportColumn = {
  key: string
  label: string
  required?: boolean
  aliases: string[]
  help?: string
}

export type ParsedCsv = {
  headers: string[]
  rows: Record<string, string>[]
}

export type ImportMappedRow = {
  rowNumber: number
  values: Record<string, string>
}

export type ImportRowIssue = {
  rowNumber: number
  field?: string
  message: string
  severity: 'error' | 'warning'
}

export type ImportPreparedRow = {
  rowNumber: number
  displayName: string
  payload: Record<string, unknown>
  issues: ImportRowIssue[]
}

export type ImportPreviewResult = {
  ok: true
  kind: DataImportKind
  totalRows: number
  importableRows: number
  errorCount: number
  warningCount: number
  preparedRows: ImportPreparedRow[]
}

export type ImportBatchRow = {
  id: string
  parish_id: string
  import_kind: DataImportKind
  original_filename: string | null
  status: string
  total_rows: number
  created_count: number
  skipped_count: number
  warning_count: number
  error_count: number
  actor_email: string | null
  summary: Record<string, unknown>
  created_at: string
}

export const IMPORT_COLUMNS: Record<DataImportKind, ImportColumn[]> = {
  people: [
    {
      key: 'firstName',
      label: 'First name',
      required: true,
      aliases: ['first name', 'firstname', 'given name', 'given_name'],
    },
    {
      key: 'middleName',
      label: 'Middle name',
      aliases: ['middle name', 'middlename', 'middle initial', 'middle_name'],
    },
    {
      key: 'lastName',
      label: 'Last name',
      required: true,
      aliases: ['last name', 'lastname', 'surname', 'family name', 'last_name'],
    },
    {
      key: 'email',
      label: 'Email',
      aliases: ['email', 'email address', 'e-mail'],
    },
    {
      key: 'phone',
      label: 'Phone',
      aliases: ['phone', 'phone number', 'mobile', 'cell'],
    },
    {
      key: 'dateOfBirth',
      label: 'Date of birth',
      aliases: ['date of birth', 'dob', 'birthdate', 'birth date'],
      help: 'Use YYYY-MM-DD when possible.',
    },
    {
      key: 'notes',
      label: 'Notes',
      aliases: ['notes', 'note', 'comments'],
    },
  ],
  households: [
    {
      key: 'name',
      label: 'Household name',
      required: true,
      aliases: ['household name', 'name', 'family name', 'family'],
    },
    {
      key: 'address',
      label: 'Street address',
      aliases: ['address', 'street', 'street address', 'address 1'],
    },
    {
      key: 'city',
      label: 'City',
      aliases: ['city', 'town'],
    },
    {
      key: 'state',
      label: 'State',
      aliases: ['state', 'province'],
    },
    {
      key: 'postalCode',
      label: 'ZIP / postal code',
      aliases: ['zip', 'zip code', 'postal code', 'postcode'],
    },
    {
      key: 'notes',
      label: 'Notes',
      aliases: ['notes', 'note', 'comments'],
    },
  ],
  sacramental_records: [
    {
      key: 'recordType',
      label: 'Record type',
      required: true,
      aliases: ['record type', 'sacrament', 'sacrament type', 'type'],
      help: 'Baptism, marriage, funeral, confirmation, first communion, OCIA, or RCIC.',
    },
    {
      key: 'personName',
      label: 'Person name',
      required: true,
      aliases: ['person name', 'name', 'full name', 'candidate', 'deceased', 'child'],
    },
    {
      key: 'sacramentDate',
      label: 'Sacrament date',
      aliases: ['sacrament date', 'date', 'service date', 'ceremony date'],
      help: 'Use YYYY-MM-DD when possible.',
    },
    {
      key: 'place',
      label: 'Place',
      aliases: ['place', 'church', 'location', 'parish'],
    },
    {
      key: 'minister',
      label: 'Minister',
      aliases: ['minister', 'priest', 'deacon', 'celebrant'],
    },
    {
      key: 'book',
      label: 'Book',
      aliases: ['book', 'register book'],
    },
    {
      key: 'page',
      label: 'Page',
      aliases: ['page', 'register page'],
    },
    {
      key: 'line',
      label: 'Line',
      aliases: ['line', 'register line'],
    },
    {
      key: 'notes',
      label: 'Notes',
      aliases: ['notes', 'note', 'comments'],
    },
  ],
}

export const IMPORT_TEMPLATES: Record<DataImportKind, string> = {
  people:
    'First name,Middle name,Last name,Email,Phone,Date of birth,Notes\nMaria,,Santos,maria@example.com,555-0100,1980-04-12,Primary catechist\n',
  households:
    'Household name,Street address,City,State,ZIP / postal code,Notes\nSantos Household,123 Main St,Kansas City,MO,64108,Prefers mail by email\n',
  sacramental_records:
    'Record type,Person name,Sacrament date,Place,Minister,Book,Page,Line,Notes\nBaptism,Maria Santos,1980-05-10,St. Mark Parish,Fr. Joseph,12,44,3,Imported from paper register\n',
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function trim(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeDateOnly(value: unknown): string | null {
  const s = trim(value)
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function normalizeImportRecordType(value: unknown): SacramentalRecordType | null {
  const s = trim(value).toLowerCase().replace(/[-\s]+/g, '_')
  const normalized = s === 'wedding' ? 'marriage' : s
  return isSacramentalRecordType(normalized) ? normalized : null
}

function isLikelyEmail(value: string): boolean {
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell)
      if (row.some((value) => trim(value))) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => trim(value))) rows.push(row)

  const headers = (rows[0] ?? []).map((header) => trim(header))
  const dataRows = rows.slice(1).map((values) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = trim(values[index])
    })
    return record
  })

  return { headers, rows: dataRows }
}

export function guessColumnMapping(kind: DataImportKind, headers: string[]): Record<string, string> {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }))

  return IMPORT_COLUMNS[kind].reduce<Record<string, string>>((mapping, column) => {
    const aliases = [column.label, column.key, ...column.aliases].map(normalizeHeader)
    const match = normalizedHeaders.find((header) => aliases.includes(header.normalized))
    mapping[column.key] = match?.original ?? ''
    return mapping
  }, {})
}

export function applyColumnMapping(
  parsed: ParsedCsv,
  mapping: Record<string, string>
): ImportMappedRow[] {
  return parsed.rows.map((row, index) => {
    const values = Object.entries(mapping).reduce<Record<string, string>>((next, [key, header]) => {
      next[key] = header ? trim(row[header]) : ''
      return next
    }, {})
    return {
      rowNumber: index + 2,
      values,
    }
  })
}

export function buildImportPreview(
  kind: DataImportKind,
  rows: ImportMappedRow[],
  existingRows: Record<string, unknown>[] = []
): ImportPreviewResult {
  const seen = new Set<string>()
  const preparedRows = rows.map((row) => prepareImportRow(kind, row, seen, existingRows))
  const errorCount = preparedRows.reduce(
    (sum, row) => sum + row.issues.filter((issue) => issue.severity === 'error').length,
    0
  )
  const warningCount = preparedRows.reduce(
    (sum, row) => sum + row.issues.filter((issue) => issue.severity === 'warning').length,
    0
  )

  return {
    ok: true,
    kind,
    totalRows: preparedRows.length,
    importableRows: preparedRows.filter((row) =>
      row.issues.every((issue) => issue.severity !== 'error')
    ).length,
    errorCount,
    warningCount,
    preparedRows,
  }
}

function prepareImportRow(
  kind: DataImportKind,
  row: ImportMappedRow,
  seen: Set<string>,
  existingRows: Record<string, unknown>[]
): ImportPreparedRow {
  if (kind === 'people') return preparePersonRow(row, seen, existingRows)
  if (kind === 'households') return prepareHouseholdRow(row, seen, existingRows)
  return prepareSacramentalRecordRow(row, seen, existingRows)
}

function preparePersonRow(
  row: ImportMappedRow,
  seen: Set<string>,
  existingRows: Record<string, unknown>[]
): ImportPreparedRow {
  const firstName = trim(row.values.firstName)
  const middleName = trim(row.values.middleName)
  const lastName = trim(row.values.lastName)
  const email = trim(row.values.email)
  const phone = trim(row.values.phone)
  const dateOfBirthRaw = trim(row.values.dateOfBirth)
  const dateOfBirth = normalizeDateOnly(dateOfBirthRaw)
  const notes = trim(row.values.notes)
  const issues: ImportRowIssue[] = []

  if (!firstName) issues.push(error(row.rowNumber, 'firstName', 'First name is required.'))
  if (!lastName) issues.push(error(row.rowNumber, 'lastName', 'Last name is required.'))
  if (email && !isLikelyEmail(email)) {
    issues.push(error(row.rowNumber, 'email', 'Email does not look valid.'))
  }
  if (dateOfBirthRaw && !dateOfBirth) {
    issues.push(error(row.rowNumber, 'dateOfBirth', 'Date of birth could not be read.'))
  }

  const duplicateKey = ['person', firstName, lastName, email || phone || dateOfBirth || ''].join('|').toLowerCase()
  if (seen.has(duplicateKey)) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate inside this file.'))
  }
  seen.add(duplicateKey)

  const matchesExisting = existingRows.some((person) => {
    const sameName =
      trim(person.first_name).toLowerCase() === firstName.toLowerCase() &&
      trim(person.last_name).toLowerCase() === lastName.toLowerCase()
    const sameEmail = email && trim(person.email).toLowerCase() === email.toLowerCase()
    const samePhone = phone && trim(person.phone) === phone
    return sameName && (sameEmail || samePhone)
  })
  if (matchesExisting) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate of an existing person.'))
  }

  return {
    rowNumber: row.rowNumber,
    displayName: [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Unnamed person',
    payload: {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      date_of_birth: dateOfBirth,
      notes: notes || null,
      parishioner_id: null,
    },
    issues,
  }
}

function prepareHouseholdRow(
  row: ImportMappedRow,
  seen: Set<string>,
  existingRows: Record<string, unknown>[]
): ImportPreparedRow {
  const name = trim(row.values.name)
  const address = trim(row.values.address)
  const city = trim(row.values.city)
  const state = trim(row.values.state)
  const postalCode = trim(row.values.postalCode)
  const notes = trim(row.values.notes)
  const issues: ImportRowIssue[] = []

  if (!name) issues.push(error(row.rowNumber, 'name', 'Household name is required.'))

  const duplicateKey = ['household', name, address, postalCode].join('|').toLowerCase()
  if (seen.has(duplicateKey)) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate inside this file.'))
  }
  seen.add(duplicateKey)

  const matchesExisting = existingRows.some((household) => {
    const sameName = trim(household.name).toLowerCase() === name.toLowerCase()
    const sameAddress = address && trim(household.address).toLowerCase() === address.toLowerCase()
    return sameName && sameAddress
  })
  if (matchesExisting) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate of an existing household.'))
  }

  return {
    rowNumber: row.rowNumber,
    displayName: name || 'Unnamed household',
    payload: {
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      postal_code: postalCode || null,
      notes: notes || null,
    },
    issues,
  }
}

function prepareSacramentalRecordRow(
  row: ImportMappedRow,
  seen: Set<string>,
  existingRows: Record<string, unknown>[]
): ImportPreparedRow {
  const recordTypeRaw = trim(row.values.recordType)
  const recordType = normalizeImportRecordType(recordTypeRaw)
  const personName = trim(row.values.personName)
  const sacramentDateRaw = trim(row.values.sacramentDate)
  const sacramentDate = normalizeDateOnly(sacramentDateRaw)
  const place = trim(row.values.place)
  const minister = trim(row.values.minister)
  const book = trim(row.values.book)
  const page = trim(row.values.page)
  const line = trim(row.values.line)
  const notes = trim(row.values.notes)
  const issues: ImportRowIssue[] = []

  if (!recordTypeRaw) {
    issues.push(error(row.rowNumber, 'recordType', 'Record type is required.'))
  } else if (!recordType) {
    issues.push(error(row.rowNumber, 'recordType', 'Record type was not recognized.'))
  }
  if (!personName) issues.push(error(row.rowNumber, 'personName', 'Person name is required.'))
  if (sacramentDateRaw && !sacramentDate) {
    issues.push(error(row.rowNumber, 'sacramentDate', 'Sacrament date could not be read.'))
  }

  const duplicateKey = ['record', recordType, personName, sacramentDate, book, page, line]
    .join('|')
    .toLowerCase()
  if (seen.has(duplicateKey)) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate inside this file.'))
  }
  seen.add(duplicateKey)

  const matchesExisting = existingRows.some((record) => {
    return (
      trim(record.record_type).toLowerCase() === String(recordType).toLowerCase() &&
      trim(record.person_name).toLowerCase() === personName.toLowerCase() &&
      trim(record.sacrament_date).slice(0, 10) === String(sacramentDate ?? '')
    )
  })
  if (matchesExisting) {
    issues.push(warning(row.rowNumber, undefined, 'Possible duplicate of an existing record.'))
  }

  return {
    rowNumber: row.rowNumber,
    displayName: personName || 'Unnamed record',
    payload: {
      record_type: recordType,
      person_name: personName,
      sacrament_date: sacramentDate,
      place: place || null,
      minister: minister || null,
      book: book || null,
      page: page || null,
      line: line || null,
      notes: notes || null,
    },
    issues,
  }
}

function error(rowNumber: number, field: string | undefined, message: string): ImportRowIssue {
  return { rowNumber, field, message, severity: 'error' }
}

function warning(rowNumber: number, field: string | undefined, message: string): ImportRowIssue {
  return { rowNumber, field, message, severity: 'warning' }
}

export function formatImportKindLabel(kind: DataImportKind): string {
  if (kind === 'people') return 'People'
  if (kind === 'households') return 'Households'
  return 'Sacramental records'
}
