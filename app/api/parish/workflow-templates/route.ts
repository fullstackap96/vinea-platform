import { NextResponse, type NextRequest } from 'next/server'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { normalizeWorkflowTemplateStepPatch } from '@/lib/workflowTemplateSettings'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

async function primaryParishId(admin: AdminClient) {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.id ? String(data.id) : null
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
    const parishId = await primaryParishId(admin)
    if (!parishId) {
      return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
    }

    const templates = await loadActiveTemplates(admin, parishId)
    return NextResponse.json({ ok: true, templates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not load workflow templates.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const body = await request.json().catch(() => null as Record<string, unknown> | null)
  if (!body || typeof body !== 'object') {
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
    const parishId = await primaryParishId(admin)
    if (!parishId) {
      return NextResponse.json({ ok: false, error: 'Parish is not configured.' }, { status: 404 })
    }

    const { data: current, error: currentError } = await admin
      .from('workflow_template_steps')
      .select(
        'id, template_id, title, phase, owner_type, required, due_offset_days, sort_order'
      )
      .eq('id', stepId)
      .maybeSingle()

    if (currentError) {
      return NextResponse.json({ ok: false, error: currentError.message }, { status: 500 })
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
      return NextResponse.json({ ok: false, error: templateError.message }, { status: 500 })
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
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
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
    const message = error instanceof Error ? error.message : 'Could not update workflow step.'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
