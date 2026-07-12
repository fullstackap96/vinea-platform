import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createServerClientMock = vi.hoisted(() => vi.fn())
const createAdminMock = vi.hoisted(() => vi.fn())
const loadAccessMock = vi.hoisted(() => vi.fn())
const resolveAuditParishMock = vi.hoisted(() => vi.fn())
const writeAuditEventMock = vi.hoisted(() => vi.fn())
const buildPlaybookMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: vi.fn(() => undefined) })),
}))
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: createServerClientMock,
}))
vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createAdminMock,
}))
vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: loadAccessMock,
}))
vi.mock('@/lib/server/requestAuditParish', () => ({
  resolveRequestAuditParishId: resolveAuditParishMock,
}))
vi.mock('@/lib/server/auditLog', () => ({ writeAuditEvent: writeAuditEventMock }))
vi.mock('@/lib/workflowPlaybooks', () => ({
  buildWorkflowPlaybookSuggestion: buildPlaybookMock,
}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: logServerErrorMock }))

import {
  addRequestNote,
  applyWorkflowPlaybookChecklist,
} from '@/app/dashboard/requests/actions'

const safeUser = { id: 'safe-user', email: 'safe-staff@example.test' }

function authenticatedClient(from: (table: string) => unknown) {
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: safeUser }, error: null })) },
    from: vi.fn(from),
  }
}

function noteClient(insertedNote: { id: string } | null) {
  const insert = vi.fn(() => ({
    select: vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({ data: insertedNote, error: null })),
    })),
  }))
  return {
    client: authenticatedClient((table) => {
      if (table !== 'request_notes') throw new Error(`Unexpected table: ${table}`)
      return { insert }
    }),
    insert,
  }
}

function playbookClients(insertedIds: string[]) {
  const insert = vi.fn(() => ({
    select: vi.fn(async () => ({
      data: insertedIds.map((id) => ({ id })),
      error: null,
    })),
  }))
  const serverClient = authenticatedClient((table) => {
    if (table === 'requests') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { id: 'request-a', request_type: 'funeral' },
              error: null,
            })),
          })),
        })),
      }
    }
    if (table === 'checklist_items') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(async () => ({ data: [], error: null })),
        })),
      }
    }
    throw new Error(`Unexpected table: ${table}`)
  })
  const admin = {
    from: vi.fn((table: string) => {
      if (table !== 'checklist_items') throw new Error(`Unexpected table: ${table}`)
      return { insert }
    }),
  }
  return { serverClient, admin, insert }
}

describe('request action insert persistence confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadAccessMock.mockResolvedValue({ requestId: 'request-a', parishId: 'parish-a' })
    resolveAuditParishMock.mockResolvedValue({ ok: true, parishId: 'parish-a' })
    writeAuditEventMock.mockResolvedValue(true)
    buildPlaybookMock.mockReturnValue({
      missingItems: [{ itemName: 'First item' }, { itemName: 'Second item' }],
      existingCount: 0,
      playbook: { items: [{ itemName: 'First item' }, { itemName: 'Second item' }] },
    })
  })

  it('creates note history only after the inserted note row is confirmed', async () => {
    const { client, insert } = noteClient({ id: 'note-a' })
    createServerClientMock.mockResolvedValue(client)
    createAdminMock.mockReturnValue({})

    await expect(addRequestNote({ requestId: 'request-a', body: 'Staff-reviewed note.' }))
      .resolves.toEqual({ ok: true })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
  })

  it('rejects an accepted zero-row note insert without false history', async () => {
    const { client, insert } = noteClient(null)
    createServerClientMock.mockResolvedValue(client)
    createAdminMock.mockReturnValue({})

    await expect(addRequestNote({ requestId: 'request-a', body: 'Staff-reviewed note.' }))
      .resolves.toEqual({ ok: false, error: 'Could not add note.' })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('reports the exact confirmed playbook insert count', async () => {
    const { serverClient, admin, insert } = playbookClients(['item-a', 'item-b'])
    createServerClientMock.mockResolvedValue(serverClient)
    createAdminMock.mockReturnValue(admin)

    await expect(applyWorkflowPlaybookChecklist({ requestId: 'request-a' })).resolves.toEqual({
      ok: true,
      addedCount: 2,
      skippedCount: 0,
    })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).toHaveBeenCalledTimes(1)
  })

  it('rejects a partial playbook insert without false count or history', async () => {
    const { serverClient, admin, insert } = playbookClients(['item-a'])
    createServerClientMock.mockResolvedValue(serverClient)
    createAdminMock.mockReturnValue(admin)

    await expect(applyWorkflowPlaybookChecklist({ requestId: 'request-a' })).resolves.toEqual({
      ok: false,
      error: 'Could not add playbook checklist items.',
    })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('documents confirmed rows, privacy boundaries, and generic partial failure behavior', () => {
    const doc = readFileSync(
      join(
        process.cwd(),
        'docs/REQUEST_NOTE_PLAYBOOK_INSERT_PERSISTENCE_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'selects only the inserted note `id`',
      'exactly match the staff-reviewed missing-item count',
      'accepted zero-row note inserts',
      'partial playbook inserts',
      'not the note body',
      'No production or shared-QA access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
