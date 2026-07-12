import { NextResponse, type NextRequest } from 'next/server'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { normalizeWorkflowTemplateStepPatch } from '@/lib/workflowTemplateSettings'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

const MAX_BODY_BYTES = 64 * 1024

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

function logWorkflowTemplateError(
  action: 'load' | 'read-current-step' | 'read-template' | 'update-step',
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[workflow-templates] ${action} failed`, error, {
    route: '/api/parish/workflow-templates',
    ...extra,
  })
}

async function resolveWorkflowTemplateReadParishId(
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
      error: 'You are not authorized to read workflow templates for this parish.',
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
      error: 'You are not authorized to read workflow templates for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function loadActiveTemplates(admin: AdminClient, parishId: string) {
  const { data: templates, error: templateError } = await admin
    .from('workflow_templates')
    .select('id, request_type, name, description, active')
    .eq('parish_id', parishId)
    .eq('active', true)
    .order('request_type', { ascending: true })

  if (templateError) throw templateError

  const templateIds = (templates ?? []).map((template) => String(template.id))
  if (templateIds.length === 0) return []

  const { data: steps, error: stepsError } = await admin
    .from('workflow_template_steps')
    .select(
      'id, template_id, phase, title, description, owner_type, required, due_offset_days, sort_order'
    )
    .in('template_id', templateIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (stepsError) throw stepsError

  return (templates ?? []).map((template) => ({
    ...template,
    steps: (steps ?? []).filter((step) => String(step.template_id) === String(template.id)),
  }))
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveWorkflowTemplateReadParishId(
      staff.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }

    const templates = await loadActiveTemplates(admin, parishContext.activeParishId)
    return NextResponse.json({
      ok: true,
      activeParishId: parishContext.activeParishId,
      templates,
    })
  } catch (error: unknown) {
    logWorkflowTemplateError('load', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load workflow templates.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
            ? 'Workflow step update is too large.'
            : 'Invalid JSON body.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const stepId = String(body.stepId ?? '').trim()
  if (!stepId) {
    return NextResponse.json({ ok: false, error: 'Missing workflow step id.' }, { status: 400 })
  }

  const normalized = normalizeWorkflowTemplateStepPatch(body.step)
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, error: normalized.error }, { status: 400 })
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveStaffWriteParishContext(staff.supabase, {
      requestedParishId,
      allowPrimaryParishFallback: !requestedParishId,
      fallbackReason: 'Workflow template settings API legacy compatibility path.',
    })
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.parishId

    const { data: current, error: currentError } = await admin
      .from('workflow_template_steps')
      .select(
        'id, template_id, title, phase, owner_type, required, due_offset_days, sort_order'
      )
      .eq('id', stepId)
      .maybeSingle()

    if (currentError) {
      logWorkflowTemplateError('read-current-step', currentError, {
        hasActiveParishCookie: Boolean(requestedParishId),
        hasStepId: Boolean(stepId),
      })
      return NextResponse.json(
        { ok: false, error: 'Could not update workflow step.' },
        { status: 500 }
      )
    }
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Workflow step not found.' }, { status: 404 })
    }

    const { data: template, error: templateError } = await admin
      .from('workflow_templates')
      .select('id, request_type')
      .eq('id', current.template_id)
      .eq('parish_id', parishId)
      .maybeSingle()

    if (templateError) {
      logWorkflowTemplateError('read-template', templateError, {
        hasActiveParishCookie: Boolean(requestedParishId),
        hasStepId: Boolean(stepId),
      })
      return NextResponse.json(
        { ok: false, error: 'Could not update workflow step.' },
        { status: 500 }
      )
    }
    if (!template) {
      return NextResponse.json({ ok: false, error: 'Workflow template not found.' }, { status: 404 })
    }

    const { data: updated, error: updateError } = await admin
      .from('workflow_template_steps')
      .update({
        ...normalized.patch,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .select(
        'id, template_id, phase, title, description, owner_type, required, due_offset_days, sort_order'
      )
      .single()

    if (updateError) {
      logWorkflowTemplateError('update-step', updateError, {
        hasActiveParishCookie: Boolean(requestedParishId),
        hasStepId: Boolean(stepId),
      })
      return NextResponse.json(
        { ok: false, error: 'Could not update workflow step.' },
        { status: 500 }
      )
    }

    await writeAuditEvent({
      parishId,
      actorEmail: staff.staff.email,
      action: 'workflow_template_step.updated',
      targetType: 'workflow_template_step',
      targetId: stepId,
      metadata: {
        templateId: String(current.template_id),
        requestType: template.request_type,
        previous: {
          title: current.title,
          phase: current.phase,
          owner_type: current.owner_type,
          required: current.required,
          due_offset_days: current.due_offset_days,
          sort_order: current.sort_order,
        },
        next: normalized.patch,
      },
    })

    return NextResponse.json({ ok: true, step: updated })
  } catch (error: unknown) {
    logWorkflowTemplateError('update-step', error, {
      hasActiveParishCookie: Boolean(activeParishCookie(request)),
      hasStepId: Boolean(stepId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update workflow step.' },
      { status: 500 }
    )
  }
}

export const workflowTemplateSettingsRouteTestInternals = {
  activeParishCookie,
  resolveWorkflowTemplateReadParishId,
}
