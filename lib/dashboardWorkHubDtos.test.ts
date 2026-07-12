import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  parseDashboardWorkHubRequest,
  parseDashboardWorkHubRequests,
} from './dashboardWorkHubDtos'

describe('Daily Work Hub DTO boundary', () => {
  it('normalizes the approved request fields and drops unexpected future fields', () => {
    const request = parseDashboardWorkHubRequest({
      id: ' request-a ',
      request_type: ' FUNERAL ',
      status: 'new',
      parishioner: {
        id: 'parishioner-a',
        full_name: 'Safe Fixture Family',
        email: 'safe@example.test',
        phone: '555-0100',
        parish_id: 'parish-a',
        token_hash: 'must-not-cross-boundary',
      },
      checklist_incomplete: true,
      checklist_incomplete_count: 2.9,
      funeral_detail: {
        request_id: 'request-a',
        deceased_name: 'Safe Fixture Name',
        private_future_field: 'must-not-cross-boundary',
      },
      storage_path: 'must-not-cross-boundary',
      service_role_key: 'must-not-cross-boundary',
    })

    expect(request).toMatchObject({
      id: 'request-a',
      request_type: 'funeral',
      status: 'new',
      checklist_incomplete: true,
      checklist_incomplete_count: 2,
      parishioner: {
        id: 'parishioner-a',
        full_name: 'Safe Fixture Family',
      },
      funeral_detail: {
        request_id: 'request-a',
        deceased_name: 'Safe Fixture Name',
      },
    })
    const serialized = JSON.stringify(request)
    expect(serialized).not.toContain('token_hash')
    expect(serialized).not.toContain('storage_path')
    expect(serialized).not.toContain('service_role_key')
    expect(serialized).not.toContain('private_future_field')
  })

  it('fails the whole response closed when a request row has no stable id', () => {
    expect(parseDashboardWorkHubRequests([{ request_type: 'baptism' }])).toBeNull()
    expect(parseDashboardWorkHubRequests({ requests: [] })).toBeNull()
  })

  it('keeps the server loader and browser state on the shared DTO instead of unknown or any arrays', () => {
    const loader = readFileSync(
      join(process.cwd(), 'lib', 'server', 'loadDashboardWorkHub.ts'),
      'utf8',
    )
    const requestLoader = readFileSync(
      join(process.cwd(), 'lib', 'dashboard', 'loadDashboardRequests.ts'),
      'utf8',
    )
    const client = readFileSync(
      join(process.cwd(), 'app', 'dashboard', 'DashboardPageCore.tsx'),
      'utf8',
    )

    expect(loader).toContain('requests: DashboardWorkHubRequest[]')
    expect(requestLoader).toContain('requests: DashboardWorkHubRequest[]')
    expect(requestLoader).toContain('parseDashboardWorkHubRequests(withDetails)')
    expect(client).toContain('useState<DashboardWorkHubRequest[]>([])')
    expect(client).toContain('parseDashboardWorkHubRequests(payload?.requests)')
    expect(client).not.toContain('useState<any[]>([])')
    expect(client).not.toContain('payload.requests as any[]')
  })

  it('documents the DTO, fail-closed behavior, and preserved gates', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'DAILY_WORK_HUB_TYPED_RESPONSE_DTO_BOUNDARY_20260710.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'DAILY_WORK_HUB_TYPED_RESPONSE_DTO_BOUNDARY_IMPLEMENTED_20260710',
      '`DashboardWorkHubRequest`',
      '`parseDashboardWorkHubRequests(...)`',
      'drops unexpected future fields',
      'fails the complete Work Hub request response closed',
      'No production access',
      'All production-sensitive gates remain locked',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
