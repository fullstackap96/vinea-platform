import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { createRequestWorkflowStepsFromActiveTemplate } from './requestWorkflowTemplates'

const helperPath = join(process.cwd(), 'lib', 'server', 'requestWorkflowTemplates.ts')

describe('createRequestWorkflowStepsFromActiveTemplate', () => {
  it('returns the inserted workflow step count from the template RPC', async () => {
    const admin = {
      rpc: vi.fn().mockResolvedValue({ data: 4, error: null }),
    }

    await expect(
      createRequestWorkflowStepsFromActiveTemplate({
        admin: admin as never,
        requestId: 'request-1',
      })
    ).resolves.toBe(4)

    expect(admin.rpc).toHaveBeenCalledWith('create_request_workflow_steps_from_active_template', {
      p_request_id: 'request-1',
    })
  })

  it('allows intake to continue when the workflow template RPC is not deployed', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const admin = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST202',
          message:
            'Could not find the function public.create_request_workflow_steps_from_active_template(p_request_id) in the schema cache',
        },
      }),
    }

    await expect(
      createRequestWorkflowStepsFromActiveTemplate({
        admin: admin as never,
        requestId: 'request-1',
      })
    ).resolves.toBe(0)
    expect(warn).toHaveBeenCalledOnce()
    const warningPayload = JSON.stringify(warn.mock.calls[0])
    expect(warningPayload).toContain('[workflow-templates] rpc unavailable')
    expect(warningPayload).toContain('createRequestWorkflowStepsFromActiveTemplate')
    expect(warningPayload).toContain('create_request_workflow_steps_from_active_template')

    warn.mockRestore()
  })

  it('still throws non-missing-RPC Supabase errors', async () => {
    const admin = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23503', message: 'foreign key violation' },
      }),
    }

    await expect(
      createRequestWorkflowStepsFromActiveTemplate({
        admin: admin as never,
        requestId: 'request-1',
      })
    ).rejects.toMatchObject({ code: '23503' })
  })

  it('uses the shared safe warning helper for missing-RPC fallback logging', () => {
    const source = readFileSync(helperPath, 'utf8')

    expect(source).toContain("import { logServerWarning } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerWarning('[workflow-templates] rpc unavailable'")
    expect(source).not.toContain('console.warn(')
  })
})
