'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import { vineaInputFieldClassName, vineaSectionShellClassName } from '@/lib/vineaUi'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import {
  workflowTemplateLoadErrorMessage,
  workflowTemplateSaveErrorMessage,
} from '@/lib/workflowTemplateSettingsClientMessages'
import {
  parseWorkflowTemplateStepResponse,
  parseWorkflowTemplatesResponse,
  type WorkflowTemplateReadModel,
  type WorkflowTemplateStepReadModel,
} from '@/lib/workflowTemplateSettings'

type WorkflowStep = WorkflowTemplateStepReadModel
type WorkflowTemplate = WorkflowTemplateReadModel

type SettingsWorkflowTemplatesSectionProps = {
  activeParishId?: string | null
  activeParishName?: string | null
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  baptism: 'Baptism',
  funeral: 'Funeral',
  wedding: 'Wedding',
  ocia: 'OCIA',
}

function requestTypeLabel(value: string): string {
  return REQUEST_TYPE_LABELS[value] ?? value
}

export function SettingsWorkflowTemplatesSection({
  activeParishId = null,
  activeParishName = null,
}: SettingsWorkflowTemplatesSectionProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [selectedType, setSelectedType] = useState('baptism')
  const [loading, setLoading] = useState(true)
  const [savingStepId, setSavingStepId] = useState('')
  const saveInFlightRef = useRef<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const loadSequenceRef = useRef(0)
  const loadAbortRef = useRef<AbortController | null>(null)
  const activeParishIdRef = useRef(activeParishId)
  activeParishIdRef.current = activeParishId

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.request_type === selectedType) ?? templates[0],
    [selectedType, templates]
  )

  const loadTemplates = useCallback(async () => {
    const loadSequence = ++loadSequenceRef.current
    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller
    const isLatestLoad = () => loadSequence === loadSequenceRef.current

    setLoading(true)
    setLoadError('')
    setMessage('')
    setError('')
    setTemplates([])
    try {
      const res = await fetch('/api/parish/workflow-templates', {
        credentials: 'include',
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!isLatestLoad()) return
      if (!res.ok || !data?.ok) {
        setLoadError(workflowTemplateLoadErrorMessage(data?.error))
        return
      }
      const parsed = parseWorkflowTemplatesResponse(data, activeParishId)
      if (!parsed) {
        setTemplates([])
        setLoadError(workflowTemplateLoadErrorMessage(null))
        return
      }
      const nextTemplates = parsed.templates
      setTemplates(nextTemplates)
      setSelectedType((current) =>
        nextTemplates.length > 0 && !nextTemplates.some((t) => t.request_type === current)
          ? String(nextTemplates[0].request_type)
          : current
      )
    } catch (loadError: unknown) {
      if (loadError instanceof DOMException && loadError.name === 'AbortError') return
      if (!isLatestLoad()) return
      setLoadError(workflowTemplateLoadErrorMessage(loadError))
    } finally {
      if (isLatestLoad()) {
        loadAbortRef.current = null
        setLoading(false)
      }
    }
  }, [activeParishId])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) void loadTemplates()
    })
    return () => {
      cancelled = true
      loadSequenceRef.current += 1
      loadAbortRef.current?.abort()
      loadAbortRef.current = null
    }
  }, [loadTemplates])

  function updateStep(stepId: string, patch: Partial<WorkflowStep>) {
    setTemplates((current) =>
      current.map((template) => ({
        ...template,
        steps: template.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)),
      }))
    )
  }

  async function saveStep(step: WorkflowStep) {
    if (saveInFlightRef.current) return

    const saveParishId = activeParishIdRef.current
    saveInFlightRef.current = step.id
    setSavingStepId(step.id)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/parish/workflow-templates', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: step.id,
          step: {
            title: step.title,
            description: step.description,
            phase: step.phase,
            owner_type: step.owner_type,
            required: step.required,
            due_offset_days: step.due_offset_days,
            sort_order: step.sort_order,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (activeParishIdRef.current !== saveParishId) return
      if (!res.ok || !data?.ok) {
        setError(workflowTemplateSaveErrorMessage(data?.error))
        return
      }
      const savedStep = parseWorkflowTemplateStepResponse(data, step.id)
      if (!savedStep) {
        setError(workflowTemplateSaveErrorMessage(null))
        return
      }
      updateStep(savedStep.id, savedStep)
      setMessage('Workflow step saved.')
    } catch (saveError: unknown) {
      if (activeParishIdRef.current !== saveParishId) return
      setError(workflowTemplateSaveErrorMessage(saveError))
    } finally {
      saveInFlightRef.current = null
      setSavingStepId('')
    }
  }

  const saving = savingStepId !== ''

  return (
    <section className={vineaSectionShellClassName} aria-busy={loading || saving}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Workflow templates</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Adjust the parish process families and staff follow for each Catholic workflow. These
            edits apply to new requests created after the change.
          </p>
          {activeParishName ? (
            <p className="mt-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-950">
              Workflow templates are scoped to {activeParishName}.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void loadTemplates()}
          className={`${secondaryButtonMd} justify-center`}
          disabled={loading || saving}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
          Loading workflow templates...
        </p>
      ) : loadError ? (
        <p
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-900"
          role="alert"
        >
          {loadError}
        </p>
      ) : templates.length === 0 ? (
        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          No workflow templates found. Apply the Phase 1 migration to seed default templates.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid gap-2 sm:grid-cols-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                disabled={saving}
                onClick={() => setSelectedType(template.request_type)}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  template.request_type === selectedTemplate?.request_type
                    ? 'border-brand bg-brand-muted text-brand'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-slate-50'
                }`}
              >
                {requestTypeLabel(template.request_type)}
              </button>
            ))}
          </div>

          {selectedTemplate ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{selectedTemplate.name}</h3>
              {selectedTemplate.description ? (
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {selectedTemplate.description}
                </p>
              ) : null}

              <div className="mt-4 space-y-4">
                {selectedTemplate.steps.map((step) => {
                  return (
                    <div key={step.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="grid gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-800">
                            Step title
                          </label>
                          <input
                            className={vineaInputFieldClassName}
                            value={step.title}
                            disabled={saving}
                            maxLength={160}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-800">
                            Description
                          </label>
                          <textarea
                            className={`min-h-[72px] resize-y ${vineaInputFieldClassName}`}
                            value={step.description ?? ''}
                            disabled={saving}
                            maxLength={1000}
                            onChange={(e) =>
                              updateStep(step.id, { description: e.target.value || null })
                            }
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px_120px]">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                              Phase
                            </label>
                            <input
                              className={vineaInputFieldClassName}
                              value={step.phase}
                              disabled={saving}
                              maxLength={120}
                              onChange={(e) => updateStep(step.id, { phase: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                              Owner
                            </label>
                            <select
                              className={vineaInputFieldClassName}
                              value={step.owner_type}
                              disabled={saving}
                              onChange={(e) =>
                                updateStep(step.id, {
                                  owner_type: e.target.value as WorkflowStep['owner_type'],
                                })
                              }
                            >
                              <option value="staff">Staff</option>
                              <option value="priest">Priest</option>
                              <option value="deacon">Deacon</option>
                              <option value="family">Family</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                              Due after
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={365}
                              className={vineaInputFieldClassName}
                              value={step.due_offset_days ?? ''}
                              disabled={saving}
                              placeholder="None"
                              onChange={(e) =>
                                updateStep(step.id, {
                                  due_offset_days:
                                    e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-800">
                              Order
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={1000}
                              className={vineaInputFieldClassName}
                              value={step.sort_order}
                              disabled={saving}
                              onChange={(e) =>
                                updateStep(step.id, { sort_order: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <input
                              type="checkbox"
                              checked={step.required}
                              disabled={saving}
                              onChange={(e) =>
                                updateStep(step.id, { required: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand-ring"
                            />
                            Required step
                          </label>

                          <button
                            type="button"
                            onClick={() => void saveStep(step)}
                            disabled={saving || !step.title.trim() || !step.phase.trim()}
                            className={`${primaryButtonMd} justify-center`}
                          >
                            {savingStepId === step.id ? 'Saving...' : 'Save step'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      <InlineFormMessage message={message} className="!mt-4" />
      {error ? (
        <p
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </section>
  )
}
