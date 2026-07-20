'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, User } from 'lucide-react'
import { useParams } from 'next/navigation'
import {
  RequestContactIntakeSection,
  RequestStatusSection,
  RequestWaitingOnSection,
} from './_components/RequestHeader'
import { FieldLabel, LabelValueGrid, LabelValueRow } from './_components/LabelValueGrid'
import { ChecklistSection } from './_components/ChecklistSection'
import { RequestDocumentsSection } from './_components/RequestDocumentsSection'
import { RequestWorkflowStepsSection } from './_components/RequestWorkflowStepsSection'
import { AiToolsSection } from './_components/AiToolsSection'
import { SuggestedDatesSection } from './_components/SuggestedDatesSection'
import { ConfirmedBaptismDateSection } from './_components/ConfirmedBaptismDateSection'
import {
  CommunicationContactSummary,
  CommunicationHistoryList,
  CommunicationLogForm,
  type CommunicationMethod,
} from './_components/CommunicationSection'
import { CommunicationHubSubsection } from './_components/CommunicationHubSubsection'
import { SendEmailSection } from './_components/SendEmailSection'
import { VineaConfirmDialog } from '@/app/dashboard/_components/VineaConfirmDialog'
import { GoogleCalendarSection } from './_components/GoogleCalendarSection'
import { resolveRequestNextStep } from './_components/RequestNextStepCard'
import { RequestProgressCard } from './_components/RequestProgressCard'
import { RequestTimelineSection } from './_components/RequestTimelineSection'
import { RequestWorkflowChecklist } from './_components/RequestWorkflowChecklist'
import { WorkflowPlaybookBuilder } from './_components/WorkflowPlaybookBuilder'
import { ReadyToCompleteCard } from './_components/ReadyToCompleteCard'
import { RequestDetailSmartQuickActions } from './_components/RequestDetailSmartQuickActions'
import { RequestDetailSummaryHeader } from './_components/RequestDetailSummaryHeader'
import { RequestCommunicationCommitmentCard } from './_components/RequestCommunicationCommitmentCard'
import { RequestCareCadenceCard } from './_components/RequestCareCadenceCard'
import { RequestDetailLoadingSkeleton } from './_components/RequestDetailLoadingSkeleton'
import { RequestFirstReviewCard } from './_components/RequestFirstReviewCard'
import { RequestHandoffBriefCard } from './_components/RequestHandoffBrief'
import { RequestCommandCard } from './_components/RequestCommandCard'
import { RequestIntakeTriageCard } from './_components/RequestIntakeTriageCard'
import { RequestPlaybookProgressPanel } from './_components/RequestPlaybookProgressPanel'
import { WorkflowSectionCard } from './_components/WorkflowSectionCard'
import { RequestPersonLinkSection } from './_components/RequestPersonLinkSection'
import { RequestRelationshipSuggestions } from './_components/RequestRelationshipSuggestions'
import { RequestRecordSuggestion } from './_components/RequestRecordSuggestion'
import { RequestSectionHashNavigator } from './_components/RequestSectionHashNavigator'
import { RequestDetailTabNav } from './_components/RequestDetailTabNav'
import {
  REQUEST_DETAIL_GO_TO_SECTION_EVENT,
  tabForRequestDetailSection,
  type RequestDetailTabId,
} from './_components/requestDetailTabs'
import {
  resolveRequestDetailSectionId,
  scrollAndHighlightRequestSectionInPlace,
} from './_components/requestDetailSectionNav'
import { ConfirmedOciaSessionSection } from './_components/ConfirmedOciaSessionSection'
import { FuneralDetailsSection } from './_components/FuneralDetailsSection'
import { ConfirmedFuneralServiceSection } from './_components/ConfirmedFuneralServiceSection'
import { WeddingDetailsSection } from './_components/WeddingDetailsSection'
import { ConfirmedWeddingCeremonySection } from './_components/ConfirmedWeddingCeremonySection'
import { OciaDetailsSection } from './_components/OciaDetailsSection'
import { JoinParishDetailsSection } from './_components/JoinParishDetailsSection'
import { AssignmentSection } from './_components/AssignmentSection'
import { NextFollowUpSection } from './_components/NextFollowUpSection'
import { InternalNotesSection } from './_components/InternalNotesSection'
import { StaffNotesSection } from './_components/StaffNotesSection'
import { parseAiEmailDraft } from '@/lib/parseAiEmailDraft'
import {
  devDashboardConsoleError,
} from '@/lib/dashboardSupabaseError'
import {
  buildVineaEmailTemplateContext,
  listVineaEmailTemplateOptions,
  renderVineaEmailTemplate,
  type VineaEmailTemplateId,
} from '@/lib/vineaEmailTemplates'
import { EditRequestDetailsSection } from './_components/EditRequestDetailsSection'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  validateConfirmedDateTimeNotPast,
  validateSuggestedDateNotPast,
} from '@/lib/scheduleValidation'
import { formatNextFollowUpDateCompact, parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import {
  updateRequestStatus as updateRequestStatusAction,
  updateRequestWaitingOn,
  updateRequestWorkflowStepStatus,
} from '../actions'
import {
  googleCalendarConflictUserMessage,
  isGoogleOAuthReconnectError,
  userFacingGoogleCalendarErrorMessage,
} from '@/lib/googleCalendarUserErrors'
import { InlineFormMessage } from '@/lib/inlineFormMessage'
import { getRequestDetailSmartQuickActions } from '@/lib/requestDetailQuickActions'
import { buildReadyToCompleteItems } from '@/lib/requestReadyToComplete'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { mergeAssigneeDirectoryOptions } from '@/lib/parishAssigneeOptions'
import { buildRequestHandoffBrief } from '@/lib/requestHandoffBrief'
import { evaluateCareCadence } from '@/lib/careCadence'
import { evaluateCommunicationCommitment } from '@/lib/communicationCommitments'
import { buildRequestFirstReview } from '@/lib/requestFirstReview'
import { evaluateIntakeTriage } from '@/lib/intakeTriage'
import { buildRequestPlaybookProgress } from '@/lib/requestPlaybookProgress'
import {
  requestDetailClientApiErrorMessage,
  requestDetailClientFailureMessage,
  requestDetailClientServerActionErrorMessage,
} from '@/lib/requestDetailClientMessages'
import {
  awaitRequestDetailClientMutationConfirmation,
  REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS,
} from '@/lib/requestDetailClientMutationConfirmation'
import { auditEventDetail, auditEventTitle, type AuditEventRow } from '@/lib/auditEvents'
import {
  countIncompleteRequiredWorkflowSteps,
  normalizeRequestWorkflowStep,
  type RequestWorkflowStep,
  type RequestWorkflowStepStatus,
} from '@/lib/requestWorkflowSteps'
import {
  parseRequestChecklistItems,
  parseRequestCommunications,
  parseRequestDetailAccess,
  parseRequestTypeSupport,
  type RequestChecklistItemDto,
  type RequestCommunicationDto,
  type RequestDetailParishionerDto,
  type RequestDetailRequestDto,
  type RequestFuneralDetailDto,
  type RequestJoinParishDetailDto,
  type RequestLinkedSacramentalRecordDto,
  type RequestOciaDetailDto,
  type RequestTypeSupportDto,
  type RequestWeddingDetailDto,
} from '@/lib/requestDetailDtos'

type GoogleCalendarConflictDto = {
  summary: string | null
  start: string | null
  end: string | null
  htmlLink: string | null
}

type GoogleCalendarMutationPayload = {
  ok?: boolean
  error?: unknown
  message?: unknown
  conflicts?: GoogleCalendarConflictDto[]
}

const REQUEST_DETAIL_LOAD_TIMEOUT_MS = 15_000

function nowDatetimeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RequestDetailPage() {
  const params = useParams()
  const routeId = params?.id as string

  function isoToDatetimeLocal(value: unknown) {
    if (!value) return ''
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function datetimeLocalToIso(value: string) {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString()
  }

  const [request, setRequest] = useState<RequestDetailRequestDto | null>(null)
  const [parishioner, setParishioner] = useState<RequestDetailParishionerDto | null>(null)
  const [hasSacramentalRecord, setHasSacramentalRecord] = useState(false)
  const [linkedSacramentalRecord, setLinkedSacramentalRecord] =
    useState<RequestLinkedSacramentalRecordDto | null>(null)
  const [checklistItems, setChecklistItems] = useState<RequestChecklistItemDto[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<RequestWorkflowStep[]>([])
  const [workflowStepMessage, setWorkflowStepMessage] = useState('')
  const [workflowStepUpdatingId, setWorkflowStepUpdatingId] = useState('')
  const workflowStepMutationInFlightRef = useRef(false)
  const [checklistUpdatingId, setChecklistUpdatingId] = useState('')
  const [checklistMessage, setChecklistMessage] = useState('')
  const checklistMutationInFlightRef = useRef(false)
  const [workflowMutationRequiresRefresh, setWorkflowMutationRequiresRefresh] =
    useState(false)
  const [loading, setLoading] = useState(true)
  const requestLoadAbortRef = useRef<AbortController | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const [aiSummary, setAiSummary] = useState('')
const [replyDraft, setReplyDraft] = useState('')
const [aiLoading, setAiLoading] = useState(false)
const [copyMessage, setCopyMessage] = useState('')
const [staffNotes, setStaffNotes] = useState('')
  const [staffNotesMessage, setStaffNotesMessage] = useState('')
  const [staffNotesSaving, setStaffNotesSaving] = useState(false)
  const staffNotesSaveInFlightRef = useRef(false)
  const [requestNotes, setRequestNotes] = useState<
    Array<{ id: string; body: string; created_at: string }>
  >([])
  const [activityEvents, setActivityEvents] = useState<AuditEventRow[]>([])
  const [activityError, setActivityError] = useState('')
  const [suggested1, setSuggested1] = useState('')
  const [suggested2, setSuggested2] = useState('')
  const [suggested3, setSuggested3] = useState('')
  const [suggestedSaving, setSuggestedSaving] = useState(false)
  const [suggestedMessage, setSuggestedMessage] = useState('')

  const [confirmedBaptismDate, setConfirmedBaptismDate] = useState('')
  const [confirmedSaving, setConfirmedSaving] = useState(false)
  const [confirmedMessage, setConfirmedMessage] = useState('')

  const [communications, setCommunications] = useState<RequestCommunicationDto[]>([])
  const [commMethod, setCommMethod] = useState<CommunicationMethod>('email')
  const [commContactedAt, setCommContactedAt] = useState(() => nowDatetimeLocal())
  const [commNotes, setCommNotes] = useState('')
  const [commSaving, setCommSaving] = useState(false)
  const communicationMutationInFlightRef = useRef(false)
  const [commMessage, setCommMessage] = useState('')

  const [emailSubject, setEmailSubject] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const emailSendInFlightRef = useRef(false)
  const emailDeliveryAttemptRef = useRef<{
    id: string
    requestId: string
    subject: string
    text: string
  } | null>(null)
  const [pendingEmailTemplateId, setPendingEmailTemplateId] =
    useState<VineaEmailTemplateId | null>(null)
  const [emailTemplateApplying, setEmailTemplateApplying] = useState(false)

  const [gcalCreating, setGcalCreating] = useState(false)
  const [gcalUpdating, setGcalUpdating] = useState(false)
  const [gcalDeleting, setGcalDeleting] = useState(false)
  const googleCalendarMutationInFlightRef = useRef(false)
  const [gcalMessage, setGcalMessage] = useState('')
  const [gcalConflicts, setGcalConflicts] = useState<
    GoogleCalendarConflictDto[]
  >([])

  const [funeralDetail, setFuneralDetail] = useState<RequestFuneralDetailDto | null>(null)
  const [funeralDeceasedName, setFuneralDeceasedName] = useState('')
  const [funeralFamilyRelationship, setFuneralFamilyRelationship] = useState('')
  const [funeralDateOfDeath, setFuneralDateOfDeath] = useState('')
  const [funeralHome, setFuneralHome] = useState('')
  const [funeralDirectorContact, setFuneralDirectorContact] = useState('')
  const [funeralServiceLocation, setFuneralServiceLocation] = useState('')
  const [funeralVisitationDetails, setFuneralVisitationDetails] = useState('')
  const [funeralCemeteryOrCommittal, setFuneralCemeteryOrCommittal] = useState('')
  const [funeralReadingsMusicNotes, setFuneralReadingsMusicNotes] = useState('')
  const [funeralObituaryProgramNotes, setFuneralObituaryProgramNotes] = useState('')
  const [funeralPostFollowUpDate, setFuneralPostFollowUpDate] = useState('')
  const [funeralPreferredNotes, setFuneralPreferredNotes] = useState('')
  const [funeralSaving, setFuneralSaving] = useState(false)
  const [funeralMessage, setFuneralMessage] = useState('')
  const [confirmedFuneralService, setConfirmedFuneralService] = useState('')
  const [funeralConfirmedSaving, setFuneralConfirmedSaving] = useState(false)
  const [funeralConfirmedMessage, setFuneralConfirmedMessage] = useState('')

  const [weddingDetail, setWeddingDetail] = useState<RequestWeddingDetailDto | null>(null)
  const [weddingPartnerOne, setWeddingPartnerOne] = useState('')
  const [weddingPartnerTwo, setWeddingPartnerTwo] = useState('')
  const [weddingProposedDate, setWeddingProposedDate] = useState('')
  const [weddingCeremonyNotes, setWeddingCeremonyNotes] = useState('')
  const [weddingSaving, setWeddingSaving] = useState(false)
  const [weddingMessage, setWeddingMessage] = useState('')
  const [confirmedWeddingCeremony, setConfirmedWeddingCeremony] = useState('')
  const [weddingConfirmedSaving, setWeddingConfirmedSaving] = useState(false)
  const [weddingConfirmedMessage, setWeddingConfirmedMessage] = useState('')

  const [ociaDetail, setOciaDetail] = useState<RequestOciaDetailDto | null>(null)
  const [confirmedOciaSession, setConfirmedOciaSession] = useState('')
  const [ociaSessionSaving, setOciaSessionSaving] = useState(false)
  const [ociaSessionMessage, setOciaSessionMessage] = useState('')

  const [joinParishDetail, setJoinParishDetail] =
    useState<RequestJoinParishDetailDto | null>(null)

  const [parishStaffNames, setParishStaffNames] = useState<string[]>([])
  const [parishPriestNames, setParishPriestNames] = useState<string[]>([])

  const [editingIntake, setEditingIntake] = useState(false)
  const [confirmMarkCompleteOpen, setConfirmMarkCompleteOpen] = useState(false)
  const [confirmGoogleCalendarDeleteOpen, setConfirmGoogleCalendarDeleteOpen] =
    useState(false)
  const [confirmGoogleCalendarConflictOverrideOpen, setConfirmGoogleCalendarConflictOverrideOpen] =
    useState(false)
  const [pendingConfirmedScheduleClear, setPendingConfirmedScheduleClear] = useState<
    'baptism' | 'funeral' | 'wedding' | 'ocia' | null
  >(null)
  const [requestStatusMessage, setRequestStatusMessage] = useState('')
  const [requestStatusUpdating, setRequestStatusUpdating] = useState(false)
  const requestStatusInFlightRef = useRef(false)
  const lastAutoNextStepKeyRef = useRef<string | null>(null)
  const [activeTab, setActiveTab] = useState<RequestDetailTabId>('overview')

  const goToSection = useCallback((sectionIdOrHash: string) => {
    const id = resolveRequestDetailSectionId(sectionIdOrHash)
    setActiveTab(tabForRequestDetailSection(id))
    if (typeof window !== 'undefined') {
      window.location.hash = `#${id}`
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollAndHighlightRequestSectionInPlace(id)
      })
    })
  }, [setActiveTab])

  useEffect(() => {
    function onGoToSection(event: Event) {
      const detail = (event as CustomEvent<{ sectionId: string }>).detail
      if (detail?.sectionId) goToSection(detail.sectionId)
    }
    window.addEventListener(REQUEST_DETAIL_GO_TO_SECTION_EVENT, onGoToSection)
    return () =>
      window.removeEventListener(REQUEST_DETAIL_GO_TO_SECTION_EVENT, onGoToSection)
  }, [goToSection])

  function isRequestLoadAbort(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError'
  }

  async function loadActivityEvents(requestId: string, signal?: AbortSignal) {
    setActivityError('')
    const params = new URLSearchParams({
      targetType: 'request',
      targetId: requestId,
      limit: '50',
    })
    try {
      const res = await fetch(`/api/audit-events?${params.toString()}`, {
        credentials: 'include',
        signal,
      })
      const data = await res.json().catch(() => ({}))
      signal?.throwIfAborted()
      if (!res.ok || !data?.ok) {
        setActivityEvents([])
        setActivityError(requestDetailClientApiErrorMessage('loadActivity', data?.error))
        return
      }
      setActivityEvents(Array.isArray(data.events) ? data.events : [])
    } catch (error) {
      if (signal?.aborted || isRequestLoadAbort(error)) throw error
      setActivityEvents([])
      setActivityError(requestDetailClientFailureMessage('loadActivity'))
    }
  }

  async function loadRequest() {
    requestLoadAbortRef.current?.abort()
    const controller = new AbortController()
    requestLoadAbortRef.current = controller
    let timedOut = false
    const timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, REQUEST_DETAIL_LOAD_TIMEOUT_MS)

    try {
      return await loadRequestCore(controller.signal)
    } catch (error) {
      if (timedOut && requestLoadAbortRef.current === controller) {
        setErrorMessage(requestDetailClientFailureMessage('loadRequestTimeout'))
        return false
      }
      if (
        controller.signal.aborted ||
        requestLoadAbortRef.current !== controller ||
        isRequestLoadAbort(error)
      ) {
        return false
      }
      devDashboardConsoleError(
        'Error loading request detail',
        new Error(requestDetailClientFailureMessage('verifyAccess'), { cause: error })
      )
      setErrorMessage(requestDetailClientFailureMessage('verifyAccess'))
      return false
    } finally {
      window.clearTimeout(timeoutId)
      if (requestLoadAbortRef.current === controller) {
        requestLoadAbortRef.current = null
        setLoading(false)
      }
    }
  }

  function retryRequestLoad() {
    setErrorMessage('')
    setLoading(true)
    void loadRequest()
  }

  async function loadRequestCore(signal: AbortSignal) {
    if (!routeId) {
      setErrorMessage('Route ID not found.')
      setLoading(false)
      return false
    }

    const accessRes = await fetch(`/api/requests/${routeId}/detail-access`, {
      credentials: 'include',
      signal,
    })
    const accessPayload: unknown = await accessRes.json().catch(() => ({}))
    signal.throwIfAborted()
    const accessPayloadRecord =
      accessPayload && typeof accessPayload === 'object'
        ? (accessPayload as Record<string, unknown>)
        : null
    const accessData = parseRequestDetailAccess(accessPayload)
    if (!accessRes.ok || !accessData) {
      setErrorMessage(
        requestDetailClientApiErrorMessage('verifyAccess', accessPayloadRecord?.error),
      )
      setLoading(false)
      return false
    }

    const requestData = accessData.request
    const parishionerData = accessData.parishioner

    if (!requestData?.id) {
      setErrorMessage('Request not found.')
      setLoading(false)
      return false
    }

    setRequest(requestData)
    setAiSummary(requestData.ai_summary || '')
    {
      const draftRaw = requestData.reply_draft || ''
      const parsed = parseAiEmailDraft(draftRaw)
      setReplyDraft(parsed.hadSubjectLine ? parsed.body : draftRaw)
      if (parsed.hadSubjectLine) {
        setEmailSubject(parsed.subject)
      }
    }
    setStaffNotes(requestData.staff_notes || '')
    setSuggested1(isoToDatetimeLocal(requestData.suggested_date_1))
    setSuggested2(isoToDatetimeLocal(requestData.suggested_date_2))
    setSuggested3(isoToDatetimeLocal(requestData.suggested_date_3))
    setConfirmedBaptismDate(isoToDatetimeLocal(requestData.confirmed_baptism_date))
    if (parishionerData) {
      setParishioner(parishionerData)
    }

    const loadWorkflowSupport = async () => {
      try {
        const workflowSupportRes = await fetch(`/api/requests/${routeId}/workflow-support`, {
          credentials: 'include',
          signal,
        })
        const workflowSupportData = await workflowSupportRes.json().catch(() => ({}))
        signal.throwIfAborted()
        if (!workflowSupportRes.ok || !workflowSupportData?.ok) {
          devDashboardConsoleError(
            'Error loading request workflow support',
            new Error(
              requestDetailClientApiErrorMessage(
                'loadWorkflowSupport',
                workflowSupportData?.error
              )
            )
          )
          setChecklistItems([])
          setWorkflowSteps([])
        } else {
          setChecklistItems(parseRequestChecklistItems(workflowSupportData.checklistItems) ?? [])
          const workflowRows: unknown[] = Array.isArray(workflowSupportData.workflowSteps)
            ? workflowSupportData.workflowSteps
            : []
          setWorkflowSteps(
            workflowRows
              .map((row) => normalizeRequestWorkflowStep(row as Record<string, unknown>))
              .filter((row): row is RequestWorkflowStep => row !== null)
          )
        }
      } catch (error) {
        if (signal.aborted || isRequestLoadAbort(error)) throw error
        devDashboardConsoleError(
          'Error loading request workflow support',
          new Error(requestDetailClientFailureMessage('loadWorkflowSupport'), { cause: error })
        )
        setChecklistItems([])
        setWorkflowSteps([])
      }
    }

    const loadCommunications = async () => {
      try {
        const communicationsRes = await fetch(`/api/requests/${routeId}/communications`, {
          credentials: 'include',
          signal,
        })
        const communicationsData = await communicationsRes.json().catch(() => ({}))
        signal.throwIfAborted()
        if (!communicationsRes.ok || !communicationsData?.ok) {
          devDashboardConsoleError(
            'Error loading request communications',
            new Error(
              requestDetailClientApiErrorMessage('loadCommunications', communicationsData?.error)
            )
          )
          setCommunications([])
        } else {
          setCommunications(parseRequestCommunications(communicationsData.communications) ?? [])
        }
      } catch (error) {
        if (signal.aborted || isRequestLoadAbort(error)) throw error
        devDashboardConsoleError(
          'Error loading request communications',
          new Error(requestDetailClientFailureMessage('loadCommunications'), { cause: error })
        )
        setCommunications([])
      }
    }

    const loadNotes = async () => {
      try {
        const notesRes = await fetch(`/api/requests/${routeId}/notes`, {
          credentials: 'include',
          signal,
        })
        const notesData = await notesRes.json().catch(() => ({}))
        signal.throwIfAborted()
        if (!notesRes.ok || !notesData?.ok) {
          devDashboardConsoleError(
            'Error loading request notes',
            new Error(requestDetailClientApiErrorMessage('loadRequestNotes', notesData?.error))
          )
          setRequestNotes([])
        } else {
          setRequestNotes(Array.isArray(notesData.notes) ? notesData.notes : [])
        }
      } catch (error) {
        if (signal.aborted || isRequestLoadAbort(error)) throw error
        devDashboardConsoleError(
          'Error loading request notes',
          new Error(requestDetailClientFailureMessage('loadRequestNotes'), { cause: error })
        )
        setRequestNotes([])
      }
    }

    const loadTypeSupport = async (): Promise<RequestTypeSupportDto> => {
      let requestTypeSupport: RequestTypeSupportDto = {
        funeralDetail: null,
        weddingDetail: null,
        ociaDetail: null,
        joinParishDetail: null,
        linkedSacramentalRecord: null,
      }
      try {
        const typeSupportRes = await fetch(`/api/requests/${routeId}/type-support`, {
          credentials: 'include',
          signal,
        })
        const typeSupportData = await typeSupportRes.json().catch(() => ({}))
        signal.throwIfAborted()
        if (!typeSupportRes.ok || !typeSupportData?.ok) {
          devDashboardConsoleError(
            'Error loading request type support',
            new Error(
              requestDetailClientApiErrorMessage(
                'loadRequestTypeSupport',
                typeSupportData?.error
              )
            )
          )
        } else {
          const parsedTypeSupport = parseRequestTypeSupport(typeSupportData)
          if (parsedTypeSupport) requestTypeSupport = parsedTypeSupport
        }
      } catch (error) {
        if (signal.aborted || isRequestLoadAbort(error)) throw error
        devDashboardConsoleError(
          'Error loading request type support',
          new Error(requestDetailClientFailureMessage('loadRequestTypeSupport'), { cause: error })
        )
      }
      return requestTypeSupport
    }

    const [, , , requestTypeSupport] = await Promise.all([
      loadWorkflowSupport(),
      loadCommunications(),
      loadNotes(),
      loadTypeSupport(),
      loadActivityEvents(String(requestData.id), signal),
    ])
    signal.throwIfAborted()

    if (requestData.request_type === 'funeral') {
      const fDetail = requestTypeSupport.funeralDetail

      setFuneralDetail(fDetail)
      setFuneralDeceasedName(fDetail?.deceased_name || '')
      setFuneralFamilyRelationship(fDetail?.family_relationship || '')
      setFuneralDateOfDeath(
        fDetail?.date_of_death ? String(fDetail.date_of_death).slice(0, 10) : ''
      )
      setFuneralHome(fDetail?.funeral_home_or_location || '')
      setFuneralDirectorContact(fDetail?.funeral_director_contact || '')
      setFuneralServiceLocation(fDetail?.service_location || '')
      setFuneralVisitationDetails(fDetail?.visitation_details || '')
      setFuneralCemeteryOrCommittal(fDetail?.cemetery_or_committal || '')
      setFuneralReadingsMusicNotes(fDetail?.readings_music_notes || '')
      setFuneralObituaryProgramNotes(fDetail?.obituary_program_notes || '')
      setFuneralPostFollowUpDate(
        fDetail?.post_funeral_follow_up_date
          ? String(fDetail.post_funeral_follow_up_date).slice(0, 10)
          : ''
      )
      setFuneralPreferredNotes(fDetail?.preferred_service_notes || '')
      setConfirmedFuneralService(isoToDatetimeLocal(fDetail?.confirmed_service_at))

      setWeddingDetail(null)
      setWeddingPartnerOne('')
      setWeddingPartnerTwo('')
      setWeddingProposedDate('')
      setWeddingCeremonyNotes('')
      setConfirmedWeddingCeremony('')

      setOciaDetail(null)
      setConfirmedOciaSession('')
    } else if (requestData.request_type === 'wedding') {
      const wDetail = requestTypeSupport.weddingDetail

      setWeddingDetail(wDetail)
      setWeddingPartnerOne(wDetail?.partner_one_name || '')
      setWeddingPartnerTwo(wDetail?.partner_two_name || '')
      setWeddingProposedDate(
        wDetail?.proposed_wedding_date
          ? String(wDetail.proposed_wedding_date).slice(0, 10)
          : ''
      )
      setWeddingCeremonyNotes(wDetail?.ceremony_notes || '')
      setConfirmedWeddingCeremony(isoToDatetimeLocal(wDetail?.confirmed_ceremony_at))

      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralFamilyRelationship('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
      setFuneralDirectorContact('')
      setFuneralServiceLocation('')
      setFuneralVisitationDetails('')
      setFuneralCemeteryOrCommittal('')
      setFuneralReadingsMusicNotes('')
      setFuneralObituaryProgramNotes('')
      setFuneralPostFollowUpDate('')
      setFuneralPreferredNotes('')
      setConfirmedFuneralService('')

      setOciaDetail(null)
      setConfirmedOciaSession('')
    } else if (requestData.request_type === 'ocia') {
      const oDetail = requestTypeSupport.ociaDetail

      setOciaDetail(oDetail ?? null)
      setConfirmedOciaSession(isoToDatetimeLocal(oDetail?.confirmed_session_at))

      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralFamilyRelationship('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
      setFuneralDirectorContact('')
      setFuneralServiceLocation('')
      setFuneralVisitationDetails('')
      setFuneralCemeteryOrCommittal('')
      setFuneralReadingsMusicNotes('')
      setFuneralObituaryProgramNotes('')
      setFuneralPostFollowUpDate('')
      setFuneralPreferredNotes('')
      setConfirmedFuneralService('')

      setWeddingDetail(null)
      setWeddingPartnerOne('')
      setWeddingPartnerTwo('')
      setWeddingProposedDate('')
      setWeddingCeremonyNotes('')
      setConfirmedWeddingCeremony('')

      setJoinParishDetail(null)
    } else if (requestData.request_type === 'join_parish') {
      const jpDetail = requestTypeSupport.joinParishDetail

      setJoinParishDetail(jpDetail ?? null)

      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralFamilyRelationship('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
      setFuneralDirectorContact('')
      setFuneralServiceLocation('')
      setFuneralVisitationDetails('')
      setFuneralCemeteryOrCommittal('')
      setFuneralReadingsMusicNotes('')
      setFuneralObituaryProgramNotes('')
      setFuneralPostFollowUpDate('')
      setFuneralPreferredNotes('')
      setConfirmedFuneralService('')

      setWeddingDetail(null)
      setWeddingPartnerOne('')
      setWeddingPartnerTwo('')
      setWeddingProposedDate('')
      setWeddingCeremonyNotes('')
      setConfirmedWeddingCeremony('')

      setOciaDetail(null)
      setConfirmedOciaSession('')
    } else {
      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralFamilyRelationship('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
      setFuneralDirectorContact('')
      setFuneralServiceLocation('')
      setFuneralVisitationDetails('')
      setFuneralCemeteryOrCommittal('')
      setFuneralReadingsMusicNotes('')
      setFuneralObituaryProgramNotes('')
      setFuneralPostFollowUpDate('')
      setFuneralPreferredNotes('')
      setConfirmedFuneralService('')

      setWeddingDetail(null)
      setWeddingPartnerOne('')
      setWeddingPartnerTwo('')
      setWeddingProposedDate('')
      setWeddingCeremonyNotes('')
      setConfirmedWeddingCeremony('')

      setOciaDetail(null)
      setConfirmedOciaSession('')

      setJoinParishDetail(null)
    }

    const existingSacramentalRecord = requestTypeSupport.linkedSacramentalRecord
    setHasSacramentalRecord(Boolean(existingSacramentalRecord?.id))
    setLinkedSacramentalRecord(existingSacramentalRecord)
    return true
  }

  async function toggleChecklistItem(itemId: string, currentValue: boolean) {
    if (checklistMutationInFlightRef.current || workflowMutationRequiresRefresh) return

    checklistMutationInFlightRef.current = true
    setChecklistUpdatingId(itemId)
    setChecklistMessage('')
    try {
      const res = await fetch(`/api/requests/${routeId}/checklist-items/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete: !currentValue }),
        signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.ok !== true) {
        const message = requestDetailClientFailureMessage('confirmWorkflowMutation')
        setWorkflowMutationRequiresRefresh(true)
        setChecklistMessage(message)
        return
      }

      if (!res.ok || !data?.ok) {
        const failureMessage = requestDetailClientApiErrorMessage('updateChecklistItem', data?.error)
        setChecklistMessage(failureMessage)
        devDashboardConsoleError(
          'Error updating checklist item',
          new Error(failureMessage)
        )
        return
      }

      setChecklistMessage('Checklist item updated.')
      const refreshed = await loadRequest()
      if (!refreshed) {
        setWorkflowMutationRequiresRefresh(true)
        setChecklistMessage(
          'Checklist item updated, but the refreshed request could not load. Refresh the page before changing another item.'
        )
      }
    } catch (error) {
      const failureMessage = requestDetailClientFailureMessage('confirmWorkflowMutation')
      setWorkflowMutationRequiresRefresh(true)
      setChecklistMessage(failureMessage)
      devDashboardConsoleError(
        'Error updating checklist item',
        new Error(failureMessage, { cause: error })
      )
    } finally {
      checklistMutationInFlightRef.current = false
      setChecklistUpdatingId('')
    }
  }
async function updateRequestStatus(newStatus: string) {
  if (requestStatusInFlightRef.current || workflowMutationRequiresRefresh) return

  requestStatusInFlightRef.current = true
  setRequestStatusUpdating(true)
  setRequestStatusMessage('')
  try {
    let result: Awaited<ReturnType<typeof updateRequestStatusAction>>
    try {
      const confirmation = await awaitRequestDetailClientMutationConfirmation(
        updateRequestStatusAction({
          requestId: routeId,
          status: newStatus,
        }),
      )
      if (!confirmation.confirmed) {
        setWorkflowMutationRequiresRefresh(true)
        setRequestStatusMessage(
          requestDetailClientFailureMessage('confirmWorkflowMutation')
        )
        return
      }
      result = confirmation.value
    } catch {
      setWorkflowMutationRequiresRefresh(true)
      setRequestStatusMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      return
    }

    if (!result.ok) {
      setRequestStatusMessage(
        requestDetailClientServerActionErrorMessage('updateStatus', result.error)
      )
      return
    }

    let refreshFailed = false
    try {
      await loadActivityEvents(routeId)
    } catch {
      refreshFailed = true
    }
    if (!(await loadRequest())) refreshFailed = true
    if (refreshFailed) {
      setWorkflowMutationRequiresRefresh(true)
      setRequestStatusMessage(
        'Request status updated, but the refreshed request could not fully load. Refresh the page before changing status again.'
      )
    } else {
      setRequestStatusMessage('Request status updated.')
    }
  } finally {
    requestStatusInFlightRef.current = false
    setRequestStatusUpdating(false)
  }
}

async function updateWorkflowStepStatus(
  stepId: string,
  status: RequestWorkflowStepStatus
) {
  if (workflowStepMutationInFlightRef.current || workflowMutationRequiresRefresh) return

  workflowStepMutationInFlightRef.current = true
  setWorkflowStepUpdatingId(stepId)
  setWorkflowStepMessage('')
  try {
    let result: Awaited<ReturnType<typeof updateRequestWorkflowStepStatus>>
    try {
      const confirmation = await awaitRequestDetailClientMutationConfirmation(
        updateRequestWorkflowStepStatus({
          requestId: routeId,
          stepId,
          status,
        }),
      )
      if (!confirmation.confirmed) {
        setWorkflowMutationRequiresRefresh(true)
        setWorkflowStepMessage(
          requestDetailClientFailureMessage('confirmWorkflowMutation')
        )
        return
      }
      result = confirmation.value
    } catch {
      setWorkflowMutationRequiresRefresh(true)
      setWorkflowStepMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      return
    }

    if (!result.ok) {
      setWorkflowStepMessage(
        requestDetailClientServerActionErrorMessage('updateWorkflowStep', result.error)
      )
      return
    }

    setWorkflowStepMessage('Workflow step updated.')
    let refreshFailed = false
    try {
      await loadActivityEvents(routeId)
    } catch {
      refreshFailed = true
    }
    if (!(await loadRequest())) refreshFailed = true
    if (refreshFailed) {
      setWorkflowMutationRequiresRefresh(true)
      setWorkflowStepMessage(
        'Workflow step updated, but the refreshed request could not fully load. Refresh the page before changing another step.'
      )
    }
  } finally {
    workflowStepMutationInFlightRef.current = false
    setWorkflowStepUpdatingId('')
  }
}

async function updateWaitingOn(next: string | null) {
  const result = await updateRequestWaitingOn({
    requestId: routeId,
    waitingOn: next,
  })

  if (!result.ok) {
    return {
      ok: false as const,
      error: requestDetailClientServerActionErrorMessage('updateWaitingOn', result.error),
    }
  }
  await loadActivityEvents(routeId)
  if (!(await loadRequest())) {
    throw new Error('Request refresh failed after waiting-on update.')
  }
  return { ok: true as const }
}

function isBlank(value: unknown) {
  return String(value ?? '').trim().length === 0
}

function userIsActivelyTyping(): boolean {
  if (typeof document === 'undefined') return false
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  return el.getAttribute?.('contenteditable') === 'true'
}

function hasHashOverride(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.location.hash && window.location.hash.trim() !== '')
}

async function generateSummary() {
  if (!request || !parishioner) return

  try {
    setAiLoading(true)
    setAiSummary('')

    const requestType = String(request.request_type || 'baptism')
    let body: Record<string, unknown>
    if (requestType === 'funeral') {
      body = {
        requestType: 'funeral',
        fullName: parishioner.full_name,
        email: parishioner.email,
        phone: parishioner.phone,
        notes: request.notes,
        status: request.status,
        deceasedName: funeralDetail?.deceased_name || funeralDeceasedName,
        familyRelationship:
          funeralDetail?.family_relationship || funeralFamilyRelationship,
        dateOfDeath: funeralDetail?.date_of_death || funeralDateOfDeath,
        funeralHome: funeralDetail?.funeral_home_or_location || funeralHome,
        funeralDirectorContact:
          funeralDetail?.funeral_director_contact || funeralDirectorContact,
        serviceLocation: funeralDetail?.service_location || funeralServiceLocation,
        visitationDetails:
          funeralDetail?.visitation_details || funeralVisitationDetails,
        cemeteryOrCommittal:
          funeralDetail?.cemetery_or_committal || funeralCemeteryOrCommittal,
        readingsMusicNotes:
          funeralDetail?.readings_music_notes || funeralReadingsMusicNotes,
        obituaryProgramNotes:
          funeralDetail?.obituary_program_notes || funeralObituaryProgramNotes,
        postFuneralFollowUpDate:
          funeralDetail?.post_funeral_follow_up_date || funeralPostFollowUpDate,
        preferredServiceNotes:
          funeralDetail?.preferred_service_notes || funeralPreferredNotes,
        confirmedServiceAt: funeralDetail?.confirmed_service_at,
      }
    } else if (requestType === 'wedding') {
      body = {
        requestType: 'wedding',
        fullName: parishioner.full_name,
        email: parishioner.email,
        phone: parishioner.phone,
        notes: request.notes,
        status: request.status,
        partnerOneName: weddingDetail?.partner_one_name || weddingPartnerOne,
        partnerTwoName: weddingDetail?.partner_two_name || weddingPartnerTwo,
        proposedWeddingDate: weddingDetail?.proposed_wedding_date || weddingProposedDate,
        ceremonyNotes: weddingDetail?.ceremony_notes || weddingCeremonyNotes,
        confirmedCeremonyAt: weddingDetail?.confirmed_ceremony_at,
      }
    } else if (requestType === 'ocia') {
      body = {
        requestType: 'ocia',
        fullName: parishioner.full_name,
        email: parishioner.email,
        phone: parishioner.phone,
        notes: request.notes,
        status: request.status,
        dateOfBirth: ociaDetail?.date_of_birth,
        ageOrDobNote: ociaDetail?.age_or_dob_note,
        sacramentalBackground: ociaDetail?.sacramental_background,
        seeking: ociaDetail?.seeking,
        parishionerStatus: ociaDetail?.parishioner_status,
        preferredContactMethod: ociaDetail?.preferred_contact_method,
        availability: ociaDetail?.availability,
        confirmedSessionAt: ociaDetail?.confirmed_session_at,
      }
    } else {
      body = {
        requestType: 'baptism',
        fullName: parishioner.full_name,
        email: parishioner.email,
        phone: parishioner.phone,
        childName: request.child_name,
        preferredDates: request.preferred_dates,
        notes: request.notes,
        status: request.status,
      }
    }

    body.requestId = routeId

    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      await res.text().catch(() => '')
      setAiSummary(requestDetailClientFailureMessage('aiSummary'))
      return
    }

    const data = await res.json()
    const summaryText = data.summary || 'No summary returned.'

    setAiSummary(summaryText)

    await saveAiSummaryToRequest(summaryText)
  } catch {
    setAiSummary(requestDetailClientFailureMessage('aiSummary'))
  } finally {
    setAiLoading(false)
  }
}

async function saveAiSummaryToRequest(summaryText: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/requests/${routeId}/ai-summary`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiSummary: summaryText }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setAiSummary(requestDetailClientApiErrorMessage('saveAiSummary', data?.error))
      return false
    }

    return true
  } catch (error) {
    devDashboardConsoleError(
      'AI SUMMARY SAVE ERROR',
      new Error(requestDetailClientFailureMessage('saveAiSummary'), { cause: error })
    )
    setAiSummary(requestDetailClientFailureMessage('saveAiSummary'))
    return false
  }
}

async function saveReplyDraftToRequest(replyDraftBody: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/requests/${routeId}/reply-draft`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyDraft: replyDraftBody }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setEmailMessage(requestDetailClientApiErrorMessage('saveReplyDraft', data?.error))
      return false
    }

    return true
  } catch (error) {
    devDashboardConsoleError(
      'reply_draft save',
      new Error(requestDetailClientFailureMessage('saveReplyDraft'), { cause: error })
    )
    setEmailMessage(requestDetailClientFailureMessage('saveReplyDraft'))
    return false
  }
}

async function generateReplyDraft() {
  if (!request || !parishioner) return

  try {
    setAiLoading(true)
    setReplyDraft('')
    setEmailMessage('')

    const requestType = String(request.request_type || 'baptism')
    const replyBody: Record<string, unknown> = {
      requestType,
      fullName: parishioner.full_name,
      email: parishioner.email,
      phone: parishioner.phone,
      notes: request.notes,
    }
    if (requestType === 'funeral') {
      replyBody.deceasedName = funeralDetail?.deceased_name || funeralDeceasedName
      replyBody.familyRelationship =
        funeralDetail?.family_relationship || funeralFamilyRelationship
      replyBody.dateOfDeath = funeralDetail?.date_of_death || funeralDateOfDeath
      replyBody.funeralHome = funeralDetail?.funeral_home_or_location || funeralHome
      replyBody.funeralDirectorContact =
        funeralDetail?.funeral_director_contact || funeralDirectorContact
      replyBody.serviceLocation = funeralDetail?.service_location || funeralServiceLocation
      replyBody.visitationDetails =
        funeralDetail?.visitation_details || funeralVisitationDetails
      replyBody.cemeteryOrCommittal =
        funeralDetail?.cemetery_or_committal || funeralCemeteryOrCommittal
      replyBody.readingsMusicNotes =
        funeralDetail?.readings_music_notes || funeralReadingsMusicNotes
      replyBody.obituaryProgramNotes =
        funeralDetail?.obituary_program_notes || funeralObituaryProgramNotes
      replyBody.postFuneralFollowUpDate =
        funeralDetail?.post_funeral_follow_up_date || funeralPostFollowUpDate
      replyBody.preferredServiceNotes =
        funeralDetail?.preferred_service_notes || funeralPreferredNotes
    } else if (requestType === 'wedding') {
      replyBody.partnerOneName = weddingDetail?.partner_one_name || weddingPartnerOne
      replyBody.partnerTwoName = weddingDetail?.partner_two_name || weddingPartnerTwo
      replyBody.proposedWeddingDate =
        weddingDetail?.proposed_wedding_date || weddingProposedDate
      replyBody.ceremonyNotes = weddingDetail?.ceremony_notes || weddingCeremonyNotes
    } else if (requestType === 'ocia') {
      replyBody.dateOfBirth = ociaDetail?.date_of_birth
      replyBody.ageOrDobNote = ociaDetail?.age_or_dob_note
      replyBody.sacramentalBackground = ociaDetail?.sacramental_background
      replyBody.seeking = ociaDetail?.seeking
      replyBody.parishionerStatus = ociaDetail?.parishioner_status
      replyBody.preferredContactMethod = ociaDetail?.preferred_contact_method
      replyBody.availability = ociaDetail?.availability
      replyBody.confirmedSessionAt = ociaDetail?.confirmed_session_at
    } else {
      replyBody.childName = request.child_name
      replyBody.preferredDates = request.preferred_dates
    }

    const res = await fetch('/api/ai/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(replyBody),
    })

    if (!res.ok) {
      await res.text().catch(() => '')
      setReplyDraft(requestDetailClientFailureMessage('aiReply'))
      return
    }

    const data = await res.json()
    const replyText = data.reply || 'No reply returned.'
    const parsed = parseAiEmailDraft(replyText)
    if (parsed.hadSubjectLine) {
      setEmailSubject(parsed.subject)
      setReplyDraft(parsed.body)
      await saveReplyDraftToRequest(parsed.body)
    } else {
      setReplyDraft(replyText)
      await saveReplyDraftToRequest(replyText)
    }
  } catch {
    setReplyDraft(requestDetailClientFailureMessage('aiReply'))
  } finally {
    setAiLoading(false)
  }
}
async function copyReplyDraft() {
  if (!replyDraft) return

  try {
    await navigator.clipboard.writeText(replyDraft)
    setCopyMessage('Copied!')
    setTimeout(() => setCopyMessage(''), 2000)
  } catch {
    setCopyMessage('Copy failed.')
    setTimeout(() => setCopyMessage(''), 2000)
  }
}

async function applyVineaEmailTemplateNow(templateId: VineaEmailTemplateId) {
  const ctx = buildVineaEmailTemplateContext({
    parishioner,
    request,
    funeralDetail,
    weddingDetail,
    funeralDeceasedName,
    weddingPartnerOne,
    weddingPartnerTwo,
  })
  const { subject, body } = renderVineaEmailTemplate(templateId, ctx)
  setEmailSubject(subject)
  setReplyDraft(body)
  setEmailMessage('')

  await saveReplyDraftToRequest(body)
}

async function applyVineaEmailTemplate(templateId: VineaEmailTemplateId) {
  const hasExisting =
    String(emailSubject || '').trim() || String(replyDraft || '').trim()
  if (hasExisting) {
    setPendingEmailTemplateId(templateId)
    return
  }

  await applyVineaEmailTemplateNow(templateId)
}

async function confirmVineaEmailTemplate() {
  if (!pendingEmailTemplateId || emailTemplateApplying) return
  setEmailTemplateApplying(true)
  try {
    await applyVineaEmailTemplateNow(pendingEmailTemplateId)
    setPendingEmailTemplateId(null)
  } finally {
    setEmailTemplateApplying(false)
  }
}

async function saveStaffNotes() {
  if (staffNotesSaveInFlightRef.current || workflowMutationRequiresRefresh) return

  staffNotesSaveInFlightRef.current = true
  setStaffNotesSaving(true)
  setStaffNotesMessage('')
  try {
    const res = await fetch(`/api/requests/${routeId}/staff-notes`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffNotes }),
      signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS),
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok && data?.ok !== true) {
      setWorkflowMutationRequiresRefresh(true)
      setStaffNotesMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      return
    }
    if (!res.ok || !data?.ok) {
      setStaffNotesMessage(requestDetailClientApiErrorMessage('updateStaffNotes', data?.error))
      return
    }
    if (!(await loadRequest())) {
      setWorkflowMutationRequiresRefresh(true)
      setStaffNotesMessage(
        'Staff notes were saved, but the refreshed request could not load. Refresh the page before editing them again.',
      )
      return
    }
    setStaffNotesMessage('Staff notes saved.')
  } catch (error) {
    devDashboardConsoleError(
      'staff_notes save',
      new Error(requestDetailClientFailureMessage('confirmWorkflowMutation'), { cause: error })
    )
    setWorkflowMutationRequiresRefresh(true)
    setStaffNotesMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
    return
  } finally {
    staffNotesSaveInFlightRef.current = false
    setStaffNotesSaving(false)
  }
}

 async function saveSuggestedDates() {
  setSuggestedSaving(true)
  setSuggestedMessage('')

  const err1 = validateSuggestedDateNotPast(suggested1)
  const err2 = validateSuggestedDateNotPast(suggested2)
  const err3 = validateSuggestedDateNotPast(suggested3)
  const firstError = err1 || err2 || err3
  if (firstError) {
    setSuggestedMessage(firstError)
    setSuggestedSaving(false)
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/suggested-dates`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestedDate1: suggested1 || null,
        suggestedDate2: suggested2 || null,
        suggestedDate3: suggested3 || null,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setSuggestedMessage(requestDetailClientApiErrorMessage('saveSuggestedDates', data?.error))
      setSuggestedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'SAVE SUGGESTED DATES ERROR',
      new Error(requestDetailClientFailureMessage('saveSuggestedDates'), { cause: error })
    )
    setSuggestedMessage(requestDetailClientFailureMessage('saveSuggestedDates'))
    setSuggestedSaving(false)
    return
  }

  setSuggestedMessage('Suggested dates saved successfully.')
  setSuggestedSaving(false)
  loadRequest()
}

async function saveConfirmedBaptismDate() {
  setConfirmedSaving(true)
  setConfirmedMessage('')

  const validationError = validateConfirmedDateTimeNotPast(confirmedBaptismDate)
  if (validationError) {
    setConfirmedMessage(validationError)
    setConfirmedSaving(false)
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-baptism-date`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmedBaptismDate: datetimeLocalToIso(confirmedBaptismDate),
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setConfirmedMessage(requestDetailClientApiErrorMessage('saveConfirmedDate', data?.error))
      setConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'SAVE CONFIRMED BAPTISM DATE ERROR',
      new Error(requestDetailClientFailureMessage('saveConfirmedDate'), { cause: error })
    )
    setConfirmedMessage(requestDetailClientFailureMessage('saveConfirmedDate'))
    setConfirmedSaving(false)
    return
  }

  setConfirmedMessage('Confirmed date saved successfully.')
  setConfirmedSaving(false)
  loadRequest()
}

async function clearConfirmedBaptismDate() {
  setConfirmedSaving(true)
  setConfirmedMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-baptism-date`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedBaptismDate: null }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setConfirmedMessage(requestDetailClientApiErrorMessage('clearConfirmedDate', data?.error))
      setConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'CLEAR CONFIRMED BAPTISM DATE ERROR',
      new Error(requestDetailClientFailureMessage('clearConfirmedDate'), { cause: error })
    )
    setConfirmedMessage(requestDetailClientFailureMessage('clearConfirmedDate'))
    setConfirmedSaving(false)
    return
  }

  setConfirmedBaptismDate('')
  setConfirmedMessage('Confirmed date cleared.')
  setConfirmedSaving(false)
  loadRequest()
}

async function saveFuneralDetails() {
  if (!request || request.request_type !== 'funeral') return
  const name = funeralDeceasedName.trim()
  if (!name) {
    setFuneralMessage('Deceased name is required.')
    return
  }

  setFuneralSaving(true)
  setFuneralMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/funeral-details`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deceasedName: name,
        familyRelationship: funeralFamilyRelationship,
        dateOfDeath: funeralDateOfDeath,
        funeralHomeOrLocation: funeralHome,
        funeralDirectorContact,
        serviceLocation: funeralServiceLocation,
        visitationDetails: funeralVisitationDetails,
        cemeteryOrCommittal: funeralCemeteryOrCommittal,
        readingsMusicNotes: funeralReadingsMusicNotes,
        obituaryProgramNotes: funeralObituaryProgramNotes,
        postFuneralFollowUpDate: funeralPostFollowUpDate,
        preferredServiceNotes: funeralPreferredNotes,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setFuneralMessage(requestDetailClientApiErrorMessage('saveFuneralDetails', data?.error))
      setFuneralSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'SAVE FUNERAL DETAILS ERROR',
      new Error(requestDetailClientFailureMessage('saveFuneralDetails'), { cause: error })
    )
    setFuneralMessage(requestDetailClientFailureMessage('saveFuneralDetails'))
    setFuneralSaving(false)
    return
  }

  setFuneralMessage('Funeral details saved.')
  setFuneralSaving(false)
  loadRequest()
}

async function saveConfirmedFuneralService() {
  if (!request || request.request_type !== 'funeral') return

  setFuneralConfirmedSaving(true)
  setFuneralConfirmedMessage('')

  const validationError = validateConfirmedDateTimeNotPast(confirmedFuneralService)
  if (validationError) {
    setFuneralConfirmedMessage(validationError)
    setFuneralConfirmedSaving(false)
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-funeral-service`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmedServiceAt: datetimeLocalToIso(confirmedFuneralService),
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setFuneralConfirmedMessage(
        requestDetailClientApiErrorMessage('saveFuneralService', data?.error)
      )
      setFuneralConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'SAVE CONFIRMED FUNERAL SERVICE ERROR',
      new Error(requestDetailClientFailureMessage('saveFuneralService'), { cause: error })
    )
    setFuneralConfirmedMessage(requestDetailClientFailureMessage('saveFuneralService'))
    setFuneralConfirmedSaving(false)
    return
  }

  setFuneralConfirmedMessage('Confirmed service time saved.')
  setFuneralConfirmedSaving(false)
  loadRequest()
}

async function clearConfirmedFuneralService() {
  if (!request || request.request_type !== 'funeral') return

  setFuneralConfirmedSaving(true)
  setFuneralConfirmedMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-funeral-service`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedServiceAt: null }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setFuneralConfirmedMessage(
        requestDetailClientApiErrorMessage('clearFuneralService', data?.error)
      )
      setFuneralConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'CLEAR CONFIRMED FUNERAL SERVICE ERROR',
      new Error(requestDetailClientFailureMessage('clearFuneralService'), { cause: error })
    )
    setFuneralConfirmedMessage(requestDetailClientFailureMessage('clearFuneralService'))
    setFuneralConfirmedSaving(false)
    return
  }

  setConfirmedFuneralService('')
  setFuneralConfirmedMessage('Cleared.')
  setFuneralConfirmedSaving(false)
  loadRequest()
}

async function saveWeddingDetails() {
  if (!request || request.request_type !== 'wedding') return
  const name = weddingPartnerOne.trim()
  if (!name) {
    setWeddingMessage('Partner name is required.')
    return
  }

  setWeddingSaving(true)
  setWeddingMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/wedding-details`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerOneName: name,
        partnerTwoName: weddingPartnerTwo,
        proposedWeddingDate: weddingProposedDate,
        ceremonyNotes: weddingCeremonyNotes,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setWeddingMessage(requestDetailClientApiErrorMessage('saveWeddingDetails', data?.error))
      setWeddingSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'SAVE WEDDING DETAILS ERROR',
      new Error(requestDetailClientFailureMessage('saveWeddingDetails'), { cause: error })
    )
    setWeddingMessage(requestDetailClientFailureMessage('saveWeddingDetails'))
    setWeddingSaving(false)
    return
  }

  setWeddingMessage('Wedding details saved.')
  setWeddingSaving(false)
  loadRequest()
}

async function saveConfirmedWeddingCeremony() {
  if (!request || request.request_type !== 'wedding') return

  setWeddingConfirmedSaving(true)
  setWeddingConfirmedMessage('')

  const validationError = validateConfirmedDateTimeNotPast(confirmedWeddingCeremony)
  if (validationError) {
    setWeddingConfirmedMessage(validationError)
    setWeddingConfirmedSaving(false)
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-wedding-ceremony`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmedCeremonyAt: datetimeLocalToIso(confirmedWeddingCeremony),
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setWeddingConfirmedMessage(
        requestDetailClientApiErrorMessage('saveWeddingCeremony', data?.error)
      )
      setWeddingConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'confirmed wedding ceremony save',
      new Error(requestDetailClientFailureMessage('saveWeddingCeremony'), { cause: error })
    )
    setWeddingConfirmedMessage(requestDetailClientFailureMessage('saveWeddingCeremony'))
    setWeddingConfirmedSaving(false)
    return
  }

  setWeddingConfirmedMessage('Confirmed ceremony time saved.')
  setWeddingConfirmedSaving(false)
  loadRequest()
}

async function clearConfirmedWeddingCeremony() {
  if (!request || request.request_type !== 'wedding') return

  setWeddingConfirmedSaving(true)
  setWeddingConfirmedMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-wedding-ceremony`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedCeremonyAt: null }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setWeddingConfirmedMessage(
        requestDetailClientApiErrorMessage('clearWeddingCeremony', data?.error)
      )
      setWeddingConfirmedSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'confirmed wedding ceremony clear',
      new Error(requestDetailClientFailureMessage('clearWeddingCeremony'), { cause: error })
    )
    setWeddingConfirmedMessage(requestDetailClientFailureMessage('clearWeddingCeremony'))
    setWeddingConfirmedSaving(false)
    return
  }

  setConfirmedWeddingCeremony('')
  setWeddingConfirmedMessage('Cleared.')
  setWeddingConfirmedSaving(false)
  loadRequest()
}

async function saveConfirmedOciaSession() {
  if (!request || request.request_type !== 'ocia') return

  setOciaSessionSaving(true)
  setOciaSessionMessage('')

  const validationError = validateConfirmedDateTimeNotPast(confirmedOciaSession)
  if (validationError) {
    setOciaSessionMessage(validationError)
    setOciaSessionSaving(false)
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-ocia-session`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmedSessionAt: datetimeLocalToIso(confirmedOciaSession),
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setOciaSessionMessage(requestDetailClientApiErrorMessage('saveOciaSession', data?.error))
      setOciaSessionSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'confirmed OCIA session save',
      new Error(requestDetailClientFailureMessage('saveOciaSession'), { cause: error })
    )
    setOciaSessionMessage(requestDetailClientFailureMessage('saveOciaSession'))
    setOciaSessionSaving(false)
    return
  }

  setOciaSessionMessage('Confirmed OCIA meeting time saved.')
  setOciaSessionSaving(false)
  loadRequest()
}

async function clearConfirmedOciaSession() {
  if (!request || request.request_type !== 'ocia') return

  setOciaSessionSaving(true)
  setOciaSessionMessage('')

  try {
    const res = await fetch(`/api/requests/${routeId}/confirmed-ocia-session`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedSessionAt: null }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data?.ok) {
      setOciaSessionMessage(requestDetailClientApiErrorMessage('clearOciaSession', data?.error))
      setOciaSessionSaving(false)
      return
    }
  } catch (error) {
    devDashboardConsoleError(
      'confirmed OCIA session clear',
      new Error(requestDetailClientFailureMessage('clearOciaSession'), { cause: error })
    )
    setOciaSessionMessage(requestDetailClientFailureMessage('clearOciaSession'))
    setOciaSessionSaving(false)
    return
  }

  setConfirmedOciaSession('')
  setOciaSessionMessage('Cleared.')
  setOciaSessionSaving(false)
  loadRequest()
}

function confirmConfirmedScheduleClear() {
  const kind = pendingConfirmedScheduleClear
  if (!kind) return

  setPendingConfirmedScheduleClear(null)
  if (kind === 'baptism') {
    void clearConfirmedBaptismDate()
  } else if (kind === 'funeral') {
    void clearConfirmedFuneralService()
  } else if (kind === 'wedding') {
    void clearConfirmedWeddingCeremony()
  } else {
    void clearConfirmedOciaSession()
  }
}

async function logCommunication() {
  if (communicationMutationInFlightRef.current || workflowMutationRequiresRefresh) return

  communicationMutationInFlightRef.current = true
  setCommSaving(true)
  setCommMessage('')

  const contactedAtIso = datetimeLocalToIso(commContactedAt)
  if (!contactedAtIso) {
    setCommMessage('Please choose a valid contacted date/time.')
    setCommSaving(false)
    communicationMutationInFlightRef.current = false
    return
  }

  try {
    const res = await fetch(`/api/requests/${routeId}/communications`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactedAt: contactedAtIso,
        method: commMethod,
        notes: commNotes,
      }),
      signal: AbortSignal.timeout(REQUEST_DETAIL_MUTATION_CONFIRMATION_TIMEOUT_MS),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown }

    if (res.ok && data?.ok !== true) {
      setWorkflowMutationRequiresRefresh(true)
      setCommMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
      return
    }
    if (!res.ok || !data?.ok) {
      const message = requestDetailClientApiErrorMessage('logCommunication', data?.error)
      setCommMessage(message)
      if (message === requestDetailClientFailureMessage('updateCommunicationSummary')) {
        setWorkflowMutationRequiresRefresh(true)
        await loadRequest()
      }
      return
    }
    if (!(await loadRequest())) {
      setWorkflowMutationRequiresRefresh(true)
      setCommMessage(
        'Communication was logged, but the refreshed request could not load. Refresh the page before logging another touchpoint.',
      )
      return
    }
    setCommNotes('')
    setCommMessage('Communication logged.')
  } catch (error) {
    devDashboardConsoleError(
      'LOG COMMUNICATION ERROR',
      new Error(requestDetailClientFailureMessage('confirmWorkflowMutation'), { cause: error })
    )
    setWorkflowMutationRequiresRefresh(true)
    setCommMessage(requestDetailClientFailureMessage('confirmWorkflowMutation'))
    return
  } finally {
    communicationMutationInFlightRef.current = false
    setCommSaving(false)
  }
}

async function sendEmail() {
  if (emailSendInFlightRef.current) return

  const to = String(parishioner?.email || '').trim()
  const subject = String(emailSubject || '').trim()
  const text = String(replyDraft || '').trim()

  if (!to) {
    setEmailMessage('Recipient email is missing.')
    return
  }
  if (!subject) {
    setEmailMessage('Please enter an email subject.')
    return
  }
  if (!text) {
    setEmailMessage('Please enter an email body (template or AI draft).')
    return
  }

  emailSendInFlightRef.current = true
  const existingDeliveryAttempt = emailDeliveryAttemptRef.current
  const deliveryAttempt =
    existingDeliveryAttempt?.requestId === routeId &&
    existingDeliveryAttempt.subject === subject &&
    existingDeliveryAttempt.text === text
      ? existingDeliveryAttempt
      : { id: crypto.randomUUID(), requestId: routeId, subject, text }
  emailDeliveryAttemptRef.current = deliveryAttempt
  setEmailSending(true)
  setEmailMessage('')
  try {
    let res: Response
    try {
      res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: routeId,
          deliveryAttemptId: deliveryAttempt.id,
          subject,
          text,
        }),
      })
    } catch {
      setEmailMessage(requestDetailClientFailureMessage('confirmEmailSend'))
      return
    }

    const payload = (await res.json().catch(() => null)) as {
      ok?: boolean
      uncertain?: boolean
    } | null
    if (!res.ok) {
      if (payload?.uncertain === true) {
        setEmailMessage(requestDetailClientFailureMessage('confirmEmailSend'))
      } else {
        emailDeliveryAttemptRef.current = null
        setEmailMessage(requestDetailClientFailureMessage('sendEmail'))
      }
      return
    }
    if (payload?.ok !== true) {
      setEmailMessage(requestDetailClientFailureMessage('confirmEmailSend'))
      return
    }
    emailDeliveryAttemptRef.current = null

    const contactedAtIso = new Date().toISOString()
    const summary = `Email sent: ${subject}`

    let logRes: Response
    try {
      logRes = await fetch(`/api/requests/${routeId}/communications`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactedAt: contactedAtIso,
          method: 'email',
          notes: summary,
        }),
      })
    } catch {
      setEmailMessage(requestDetailClientFailureMessage('logSentEmail'))
      loadRequest()
      return
    }

    const logData = (await logRes.json().catch(() => ({}))) as {
      ok?: boolean
      error?: unknown
    }
    if (!logRes.ok || !logData?.ok) {
      const message =
        requestDetailClientApiErrorMessage('logCommunication', logData?.error) ===
        requestDetailClientFailureMessage('updateCommunicationSummary')
          ? requestDetailClientFailureMessage('updateSentEmailSummary')
          : requestDetailClientFailureMessage('logSentEmail')
      setEmailMessage(message)
      loadRequest()
      return
    }

    setEmailMessage('Email sent successfully.')
    loadRequest()
  } finally {
    emailSendInFlightRef.current = false
    setEmailSending(false)
  }
}

async function createGoogleCalendarEvent() {
  return createGoogleCalendarEventInternal(false)
}

async function forceCreateGoogleCalendarEvent() {
  return createGoogleCalendarEventInternal(true)
}

async function createGoogleCalendarEventInternal(forceCreate: boolean) {
  if (googleCalendarMutationInFlightRef.current) return

  const rt = String(request?.request_type || 'baptism')
  if (rt === 'funeral') {
    if (!funeralDetail?.confirmed_service_at) {
      setGcalMessage('Set a confirmed funeral service time first.')
      setGcalConflicts([])
      return
    }
  } else if (rt === 'wedding') {
    if (!weddingDetail?.confirmed_ceremony_at) {
      setGcalMessage('Set a confirmed wedding ceremony time first.')
      setGcalConflicts([])
      return
    }
  } else if (rt === 'ocia') {
    if (!ociaDetail?.confirmed_session_at) {
      setGcalMessage('Set a confirmed OCIA meeting time first.')
      setGcalConflicts([])
      return
    }
  } else if (!request?.confirmed_baptism_date) {
    setGcalMessage('Set a confirmed baptism date first.')
    setGcalConflicts([])
    return
  }
  if (request?.google_calendar_event_id) {
    setGcalMessage('A Google Calendar event already exists for this request.')
    setGcalConflicts([])
    return
  }

  googleCalendarMutationInFlightRef.current = true
  try {
    setGcalCreating(true)
    setGcalMessage('')
    if (!forceCreate) setGcalConflicts([])

    const res = await fetch('/api/google/calendar-event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId, forceCreate }),
    })

    const payload = (await res.json().catch(() => ({}))) as GoogleCalendarMutationPayload
    if (res.status === 409 && payload?.error === 'CALENDAR_CONFLICT') {
      setGcalMessage(
        userFacingGoogleCalendarErrorMessage(
          payload?.message || googleCalendarConflictUserMessage(),
        ),
      )
      setGcalConflicts(Array.isArray(payload?.conflicts) ? payload.conflicts : [])
      return
    }
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Create failed (${res.status})`
      setGcalMessage(userFacingGoogleCalendarErrorMessage(err))
      return
    }

    setGcalMessage('Calendar event saved. No conflicts found.')
    setGcalConflicts([])
    loadRequest()
  } catch (error: unknown) {
    if (isGoogleOAuthReconnectError(error)) {
      setGcalMessage(userFacingGoogleCalendarErrorMessage(error))
    } else {
      setGcalMessage(requestDetailClientFailureMessage('createGoogleCalendarEvent'))
    }
    setGcalConflicts([])
  } finally {
    googleCalendarMutationInFlightRef.current = false
    setGcalCreating(false)
  }
}

async function updateGoogleCalendarEvent() {
  if (googleCalendarMutationInFlightRef.current) return

  const rt = String(request?.request_type || 'baptism')
  if (rt === 'funeral') {
    if (!funeralDetail?.confirmed_service_at) {
      setGcalMessage('Set a confirmed funeral service time first.')
      setGcalConflicts([])
      return
    }
  } else if (rt === 'wedding') {
    if (!weddingDetail?.confirmed_ceremony_at) {
      setGcalMessage('Set a confirmed wedding ceremony time first.')
      setGcalConflicts([])
      return
    }
  } else if (rt === 'ocia') {
    if (!ociaDetail?.confirmed_session_at) {
      setGcalMessage('Set a confirmed OCIA meeting time first.')
      setGcalConflicts([])
      return
    }
  } else if (!request?.confirmed_baptism_date) {
    setGcalMessage('Set a confirmed baptism date first.')
    setGcalConflicts([])
    return
  }
  if (!request?.google_calendar_event_id) {
    setGcalMessage('No Google Calendar event is linked to this request.')
    setGcalConflicts([])
    return
  }

  googleCalendarMutationInFlightRef.current = true
  try {
    setGcalUpdating(true)
    setGcalMessage('')
    setGcalConflicts([])

    const res = await fetch('/api/google/calendar-event/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = (await res.json().catch(() => ({}))) as GoogleCalendarMutationPayload
    if (res.status === 409 && payload?.error === 'CALENDAR_CONFLICT') {
      setGcalMessage(
        userFacingGoogleCalendarErrorMessage(
          payload?.message || googleCalendarConflictUserMessage(),
        ),
      )
      setGcalConflicts(Array.isArray(payload?.conflicts) ? payload.conflicts : [])
      return
    }
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Update failed (${res.status})`
      setGcalMessage(userFacingGoogleCalendarErrorMessage(err))
      return
    }

    setGcalMessage('Calendar event saved. No conflicts found.')
    setGcalConflicts([])
    loadRequest()
  } catch (error: unknown) {
    if (isGoogleOAuthReconnectError(error)) {
      setGcalMessage(userFacingGoogleCalendarErrorMessage(error))
    } else {
      setGcalMessage(requestDetailClientFailureMessage('updateGoogleCalendarEvent'))
    }
    setGcalConflicts([])
  } finally {
    googleCalendarMutationInFlightRef.current = false
    setGcalUpdating(false)
  }
}

async function deleteGoogleCalendarEvent() {
  if (googleCalendarMutationInFlightRef.current) return

  if (!request?.google_calendar_event_id) {
    setGcalMessage('No Google Calendar event is linked to this request.')
    return
  }

  googleCalendarMutationInFlightRef.current = true
  try {
    setGcalDeleting(true)
    setGcalMessage('')

    const res = await fetch('/api/google/calendar-event/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = (await res.json().catch(() => ({}))) as GoogleCalendarMutationPayload
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Delete failed (${res.status})`
      setGcalMessage(userFacingGoogleCalendarErrorMessage(err))
      return
    }

    setGcalMessage('Google Calendar event removed and link cleared.')
    loadRequest()
  } catch (error: unknown) {
    if (isGoogleOAuthReconnectError(error)) {
      setGcalMessage(userFacingGoogleCalendarErrorMessage(error))
    } else {
      setGcalMessage(requestDetailClientFailureMessage('deleteGoogleCalendarEvent'))
    }
  } finally {
    googleCalendarMutationInFlightRef.current = false
    setGcalDeleting(false)
  }
  }

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setEmailSubject('')
      setStaffNotesMessage('')
      setEditingIntake(false)
      setWorkflowMutationRequiresRefresh(false)
      setConfirmMarkCompleteOpen(false)
    })
    return () => {
      cancelled = true
    }
  }, [routeId])

  useEffect(() => {
    function syncHashToSection() {
      const raw = typeof window !== 'undefined' ? window.location.hash : ''
      const id = raw ? raw.replace(/^#/, '') : ''
      if (!id) return
      goToSection(id)
    }

    syncHashToSection()
    window.addEventListener('hashchange', syncHashToSection)
    return () => window.removeEventListener('hashchange', syncHashToSection)
  }, [goToSection])

  // Intentionally only re-fetch when the route id changes (loadRequest closes over fresh state).
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) loadRequest()
    })
    return () => {
      cancelled = true
      requestLoadAbortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadRequest is not stable; routeId is the trigger.
  }, [routeId])

  useEffect(() => {
    let cancelled = false

    async function loadParishDirectories() {
      try {
        const res = await fetch('/api/parish/settings', { credentials: 'include' })
        if (!res.ok) return
        const data = (await res.json()) as {
          ok?: boolean
          parish?: { staff_names?: unknown; priest_names?: unknown }
        }
        if (cancelled || !data?.ok || !data.parish) return
        setParishStaffNames(
          Array.isArray(data.parish.staff_names) ? data.parish.staff_names : []
        )
        setParishPriestNames(
          Array.isArray(data.parish.priest_names) ? data.parish.priest_names : []
        )
      } catch {
        // Directories are optional; assignment still works with preserved assignees.
      }
    }

    void loadParishDirectories()
    return () => {
      cancelled = true
    }
  }, [])

  // Derived workflow state (safe even while loading).
  const scheduleRowForProgress = useMemo(
    () => ({
      request_type: request?.request_type,
      confirmed_baptism_date: request?.confirmed_baptism_date,
      funeral_detail: funeralDetail
        ? { confirmed_service_at: funeralDetail.confirmed_service_at }
        : null,
      wedding_detail: weddingDetail
        ? { confirmed_ceremony_at: weddingDetail.confirmed_ceremony_at }
        : null,
      ocia_detail: ociaDetail ? { confirmed_session_at: ociaDetail.confirmed_session_at } : null,
    }),
    [
      request?.request_type,
      request?.confirmed_baptism_date,
      funeralDetail,
      weddingDetail,
      ociaDetail,
    ]
  )

  const timelineInput = useMemo(
    () => ({
      request: request
        ? {
            created_at: request.created_at,
            request_type: request.request_type,
            status: request.status,
            updated_at: request.updated_at,
            last_contacted_at: request.last_contacted_at,
            next_follow_up_date: request.next_follow_up_date,
            waiting_on: request.waiting_on,
            waiting_on_changed_at: request.waiting_on_changed_at,
          }
        : null,
      scheduleRow: scheduleRowForProgress,
      communications,
      requestNotes,
      sacramentalRecord: linkedSacramentalRecord,
    }),
    [request, scheduleRowForProgress, communications, requestNotes, linkedSacramentalRecord]
  )

  const hasWorkflowSteps = workflowSteps.length > 0
  const incompleteRequiredWorkflowStepCount =
    countIncompleteRequiredWorkflowSteps(workflowSteps)
  const completedWorkflowStepCount = workflowSteps.filter((step) => step.status === 'complete').length
  const checklistIncomplete = hasWorkflowSteps
    ? incompleteRequiredWorkflowStepCount > 0
    : checklistItems.some((item) => item.is_complete === false)
  const nextStep = resolveRequestNextStep({
    request,
    scheduleRow: scheduleRowForProgress,
    checklistIncomplete,
  })

  const staffAssigneeOptions = useMemo(
    () =>
      mergeAssigneeDirectoryOptions(parishStaffNames, request?.assigned_staff_name),
    [parishStaffNames, request?.assigned_staff_name]
  )
  const priestAssigneeOptions = useMemo(
    () =>
      mergeAssigneeDirectoryOptions(parishPriestNames, request?.assigned_priest_name),
    [parishPriestNames, request?.assigned_priest_name]
  )

  useEffect(() => {
    // When the workflow next step changes, highlight + scroll (unless the URL hash overrides).
    if (hasHashOverride()) return

    const key = nextStep.priorityKey
    const prevKey = lastAutoNextStepKeyRef.current
    lastAutoNextStepKeyRef.current = key

    const targetId = nextStep.targetSectionId
    const stepChanged = prevKey == null || prevKey !== key

    if (!stepChanged) return
    if (!request) return
    if (userIsActivelyTyping()) return

    const frame = requestAnimationFrame(() => goToSection(targetId))
    return () => cancelAnimationFrame(frame)
  }, [request, nextStep.priorityKey, nextStep.targetSectionId, goToSection])

  if (loading) {
    return <RequestDetailLoadingSkeleton />
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/requests"
            className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
          >
            ← Back to Requests
          </Link>
        </p>
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Request</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track this request</p>
        </header>
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
        <button
          type="button"
          className={`${primaryButtonMd} mt-4`}
          onClick={retryRequestLoad}
        >
          Try again
        </button>
      </main>
    )
  }

  if (!request) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-950"
          role="alert"
        >
          Request details could not be loaded. Return to Requests and try again.
        </div>
      </main>
    )
  }

  const requestType = String(request.request_type || 'baptism')
  const isBaptism = requestType === 'baptism'
  const isFuneral = requestType === 'funeral'
  const isWedding = requestType === 'wedding'
  const isOcia = requestType === 'ocia'
  const isJoinParish = requestType === 'join_parish'

  const requestIdentityName = getRequestDetailPrimaryHeading({
    request_type: request?.request_type,
    child_name: request?.child_name,
    parishioner,
    funeralDetail,
    weddingDetail,
  })
  const requestIdentitySubtitle = String(parishioner?.email ?? '').trim() || null

  const hasAnyAssignment =
    !isBlank(request?.assigned_staff_name) ||
    !isBlank(request?.assigned_priest_name) ||
    !isBlank(request?.assigned_deacon_name)
  const hasCommunication = !isBlank(request?.last_contacted_at)

  const hasFollowUp = !isBlank(request?.next_follow_up_date)

  const requiresConfirmedSchedule = isBaptism || isFuneral || isWedding || isOcia
  const confirmedIso = isFuneral
    ? funeralDetail?.confirmed_service_at
    : isWedding
      ? weddingDetail?.confirmed_ceremony_at
      : isOcia
        ? ociaDetail?.confirmed_session_at
        : request?.confirmed_baptism_date
  const hasConfirmedSchedule = requiresConfirmedSchedule ? Boolean(confirmedIso) : true

  const remainingLegacyChecklistCount = checklistItems.filter(
    (item) => item.is_complete === false,
  ).length
  const remainingChecklistCount = hasWorkflowSteps
    ? incompleteRequiredWorkflowStepCount
    : remainingLegacyChecklistCount
  const handoffBrief = buildRequestHandoffBrief({
    request: request
      ? {
          ...request,
          parishioner,
        }
      : null,
    scheduleRow: scheduleRowForProgress,
    checklistIncomplete,
    remainingChecklistCount,
    notesCount: requestNotes.length,
    communicationsCount: communications.length,
    funeralDetail,
    weddingDetail,
  })
  const careCadence = evaluateCareCadence({
    ...(request ?? {}),
    parishioner,
    funeral_detail: funeralDetail,
    wedding_detail: weddingDetail,
    ocia_detail: ociaDetail,
  })
  const communicationCommitment = evaluateCommunicationCommitment({
    request: {
      ...(request ?? {}),
      parishioner,
      funeral_detail: funeralDetail,
      wedding_detail: weddingDetail,
    },
    communications,
    notes: requestNotes,
  })
  const firstReview = buildRequestFirstReview({
    request: request
      ? {
          ...request,
          parishioner,
        }
      : null,
    scheduleRow: scheduleRowForProgress,
    checklistItems,
    checklistIncomplete,
    hasRecipientEmail: Boolean(String(parishioner?.email ?? '').trim()),
    careCadence,
    communicationCommitment,
    funeralDetail,
    weddingDetail,
  })
  const intakeTriage = evaluateIntakeTriage({
    ...(request ?? {}),
    parishioner,
    funeral_detail: funeralDetail,
    wedding_detail: weddingDetail,
    ocia_detail: ociaDetail,
  })
  const playbookProgress = buildRequestPlaybookProgress({
    request,
    parishioner,
    communications,
    checklistItems,
    sacramentalRecord: linkedSacramentalRecord,
    funeralDetail,
    weddingDetail,
    ociaDetail,
    scheduleRow: scheduleRowForProgress,
  })

  const followUpNotNeeded = String(request?.status || '') === 'complete'
  const followUpReady = hasFollowUp || followUpNotNeeded

  const checklistReady = remainingChecklistCount === 0
  const checklistRequirementLabel = hasWorkflowSteps
    ? 'Required workflow steps complete?'
    : 'Checklist complete?'
  const checklistMissingText = hasWorkflowSteps
    ? 'Complete the remaining required workflow steps.'
    : 'Complete the remaining checklist items.'

  const confirmedScheduleReady = !requiresConfirmedSchedule || hasConfirmedSchedule

  const completionRequirements = [
    {
      key: 'assignment',
      label: 'Assignment completed?',
      ok: hasAnyAssignment,
      missingText: 'Assign a staff member, priest, or deacon.',
      jumpTo: 'assignment',
    },
    {
      key: 'first-contact',
      label: 'First contact logged?',
      ok: hasCommunication,
      missingText: 'Log the first communication with this family.',
      jumpTo: 'communication',
    },
    {
      key: 'follow-up',
      label: 'Next follow-up set or not needed?',
      ok: followUpReady,
      missingText: 'Set a next follow-up date.',
      jumpTo: 'next-follow-up',
    },
    {
      key: 'schedule',
      label: 'Confirmed schedule set?',
      ok: confirmedScheduleReady,
      missingText: 'Set the confirmed date and time.',
      jumpTo: 'confirmed-time',
    },
    {
      key: 'checklist',
      label: checklistRequirementLabel,
      ok: checklistReady,
      missingText: checklistMissingText,
      jumpTo: 'checklist',
    },
  ] as const

  const missingCompletionItems = completionRequirements.filter((r) => !r.ok)
  const canMarkComplete = Boolean(request) && missingCompletionItems.length === 0
  const canConfirmMarkComplete = canMarkComplete && !workflowMutationRequiresRefresh

  const markCompleteDisabledReason =
    workflowMutationRequiresRefresh
      ? requestDetailClientFailureMessage('confirmWorkflowMutation')
      : missingCompletionItems.length === 0
      ? ''
      : `To mark complete, review: ${missingCompletionItems
          .map((m) => m.jumpTo.replace('-', ' '))
          .join(', ')}.`

  function jumpToCompletion() {
    goToSection('completion')
  }

  const followUpSummaryDisplay = parseFollowUpCalendarDate(request?.next_follow_up_date)
    ? formatNextFollowUpDateCompact(request.next_follow_up_date)
    : 'Not set'

  const workflowInputForActions = {
    request,
    scheduleRow: scheduleRowForProgress,
    checklistIncomplete,
  }
  const headerPrimaryAction = getRequestDetailSmartQuickActions({
    workflowInput: workflowInputForActions,
    canMarkComplete,
    hasRecipientEmail: Boolean(String(parishioner?.email ?? '').trim()),
  }).primary

  const isRequestComplete = String(request?.status ?? '').trim() === 'complete'
  const readyToCompleteItems = buildReadyToCompleteItems({
    hasCommunication,
    followUpReady,
    requiresConfirmedSchedule,
    confirmedScheduleReady,
    checklistReady,
  })

  return (
    <main className="mx-auto max-w-6xl px-4 pb-6 pt-4 text-gray-900 sm:px-6 sm:pb-8 sm:pt-5">
      <RequestSectionHashNavigator />
      <p className="mb-3">
        <Link
          href="/dashboard/requests"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to Requests
        </Link>
      </p>

      <RequestDetailSummaryHeader
        primaryHeading={requestIdentityName}
        subtitle={requestIdentitySubtitle}
        requestType={requestType}
        parishStatus={{
          status: request?.status,
          next_follow_up_date: request?.next_follow_up_date,
          assigned_staff_name: request?.assigned_staff_name,
          assigned_priest_name: request?.assigned_priest_name,
          assigned_deacon_name: request?.assigned_deacon_name,
          request_type: request?.request_type,
          waiting_on: request?.waiting_on,
          scheduleRow: scheduleRowForProgress,
        }}
        assignedStaffName={request?.assigned_staff_name}
        assignedPriestName={request?.assigned_priest_name}
        assignedDeaconName={request?.assigned_deacon_name}
        nextStepTitle={nextStep.title}
        nextStepInstruction={nextStep.instruction}
        followUpDisplay={followUpSummaryDisplay}
        status={request?.status}
        primaryAction={headerPrimaryAction}
        canEditIntake={Boolean(parishioner?.id)}
        editingIntake={editingIntake}
        onEditIntake={() => {
          setActiveTab('details')
          setEditingIntake(true)
        }}
        onMarkComplete={jumpToCompletion}
      />

      <RequestDetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {workflowMutationRequiresRefresh ? (
        <div className="mt-4">
          <InlineFormMessage
            message={requestDetailClientFailureMessage('confirmWorkflowMutation')}
            className="!mt-0"
          />
        </div>
      ) : null}

      <div className="rounded-b-xl border border-gray-200 bg-white shadow-sm">
        <div
          role="tabpanel"
          id="request-tabpanel-overview"
          aria-labelledby="request-tab-overview"
          hidden={activeTab !== 'overview'}
          className="space-y-5 p-4 sm:space-y-6 sm:p-6"
        >
          <RequestCommandCard
            nextStep={nextStep}
            firstReview={firstReview}
            handoffBrief={handoffBrief}
            completionRequirements={completionRequirements}
            followUpDisplay={followUpSummaryDisplay}
            canMarkComplete={canMarkComplete}
            onNavigateToSection={goToSection}
            onMarkComplete={jumpToCompletion}
          />

          {playbookProgress ? (
            <RequestPlaybookProgressPanel
              progress={playbookProgress}
              onNavigateToSection={goToSection}
            />
          ) : null}

          <RequestIntakeTriageCard triage={intakeTriage} onNavigateToSection={goToSection} />

          <RequestFirstReviewCard review={firstReview} />

          <RequestHandoffBriefCard brief={handoffBrief} />

          <RequestCareCadenceCard
            cadence={careCadence}
            onSaved={loadRequest}
            mutationRequiresRefresh={workflowMutationRequiresRefresh}
            onMutationUnconfirmed={() => setWorkflowMutationRequiresRefresh(true)}
          />

          <RequestCommunicationCommitmentCard commitment={communicationCommitment} />

          <RequestTimelineSection timelineInput={timelineInput} loading={loading} />

          <RequestProgressCard
            assignedStaffName={request?.assigned_staff_name}
            nextFollowUpDate={request?.next_follow_up_date}
            lastContactedAt={request?.last_contacted_at}
            scheduleRow={scheduleRowForProgress}
          />

          {hasWorkflowSteps ? (
            <section
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              aria-labelledby="request-workflow-steps-summary-heading"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2
                    id="request-workflow-steps-summary-heading"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Workflow steps
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {completedWorkflowStepCount} of{' '}
                    {workflowSteps.length} steps complete; {incompleteRequiredWorkflowStepCount}{' '}
                    required step{incompleteRequiredWorkflowStepCount === 1 ? '' : 's'} still open.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToSection('checklist')}
                  className={`${secondaryButtonMd} justify-center`}
                >
                  Review workflow
                </button>
              </div>
            </section>
          ) : (
            <RequestWorkflowChecklist
              request={request}
              scheduleRow={scheduleRowForProgress}
              hasRecipientEmail={Boolean(String(parishioner?.email ?? '').trim())}
              onNavigateToSection={goToSection}
            />
          )}

          <RequestDetailSmartQuickActions
            workflowInput={workflowInputForActions}
            canMarkComplete={canMarkComplete}
            hasRecipientEmail={Boolean(String(parishioner?.email ?? '').trim())}
            hidePrimary
          />

          <WorkflowSectionCard
          id="contact-information"
          title="Contact information"
          description="Primary contact details for this family."
        >
          <LabelValueGrid>
            <LabelValueRow
              label={<FieldLabel icon={User}>Contact</FieldLabel>}
              value={String(parishioner?.full_name ?? '').trim() || '—'}
            />
            <LabelValueRow
              label={<FieldLabel icon={Mail}>Email</FieldLabel>}
              value={String(parishioner?.email ?? '').trim() || '—'}
            />
            <LabelValueRow
              label={<FieldLabel icon={Phone}>Phone</FieldLabel>}
              value={String(parishioner?.phone ?? '').trim() || '—'}
            />
          </LabelValueGrid>
        </WorkflowSectionCard>

        <RequestPersonLinkSection
          requestId={routeId}
          personId={
            request?.person_id != null ? String(request.person_id) : null
          }
          parishionerId={
            request?.parishioner_id != null ? String(request.parishioner_id) : null
          }
          requestParishId={request?.parish_id != null ? String(request.parish_id) : null}
          onLinked={() => {
            void loadRequest()
          }}
        />

        <RequestRelationshipSuggestions
          requestId={routeId}
          personId={
            request?.person_id != null ? String(request.person_id) : null
          }
          requestParishId={request?.parish_id != null ? String(request.parish_id) : null}
          parishioner={parishioner}
        />

          <RequestRecordSuggestion
            requestId={routeId}
            status={request?.status}
            request_type={request?.request_type}
            hasSacramentalRecord={hasSacramentalRecord}
          />
        </div>

        <div
          role="tabpanel"
          id="request-tabpanel-details"
          aria-labelledby="request-tab-details"
          hidden={activeTab !== 'details'}
          className="space-y-5 p-4 sm:space-y-6 sm:p-6"
        >
        <WorkflowSectionCard
          id="request-details"
          title="Request details"
          description="Intake information, sacrament-specific fields, and request status."
        >
            <RequestContactIntakeSection
              parishioner={parishioner}
              request={request}
              funeralDetail={funeralDetail}
              weddingDetail={weddingDetail}
              ociaDetail={ociaDetail}
              intakeDetailsHidden={false}
              omitContactFields
            />

            {!isJoinParish && parishioner?.id ? (
              editingIntake ? (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <EditRequestDetailsSection
                    open={editingIntake}
                    requestId={routeId}
                    requestType={
                      isBaptism ? 'baptism' : isFuneral ? 'funeral' : isWedding ? 'wedding' : 'ocia'
                    }
                    parishionerId={String(request?.parishioner_id ?? parishioner.id ?? '')}
                    parishioner={parishioner}
                    request={request}
                    funeralDetail={funeralDetail}
                    weddingDetail={weddingDetail}
                    ociaDetail={ociaDetail}
                    onClose={() => setEditingIntake(false)}
                    onSaved={async () => {
                      await loadRequest()
                      setEditingIntake(false)
                    }}
                  />
                </div>
              ) : (
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setEditingIntake(true)}
                    className={secondaryButtonMd}
                  >
                    Edit request details
                  </button>
                </div>
              )
            ) : null}

            {isFuneral && !editingIntake ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <FuneralDetailsSection
                  deceasedName={funeralDeceasedName}
                  setDeceasedName={setFuneralDeceasedName}
                  familyRelationship={funeralFamilyRelationship}
                  setFamilyRelationship={setFuneralFamilyRelationship}
                  dateOfDeath={funeralDateOfDeath}
                  setDateOfDeath={setFuneralDateOfDeath}
                  funeralHome={funeralHome}
                  setFuneralHome={setFuneralHome}
                  funeralDirectorContact={funeralDirectorContact}
                  setFuneralDirectorContact={setFuneralDirectorContact}
                  serviceLocation={funeralServiceLocation}
                  setServiceLocation={setFuneralServiceLocation}
                  visitationDetails={funeralVisitationDetails}
                  setVisitationDetails={setFuneralVisitationDetails}
                  cemeteryOrCommittal={funeralCemeteryOrCommittal}
                  setCemeteryOrCommittal={setFuneralCemeteryOrCommittal}
                  readingsMusicNotes={funeralReadingsMusicNotes}
                  setReadingsMusicNotes={setFuneralReadingsMusicNotes}
                  obituaryProgramNotes={funeralObituaryProgramNotes}
                  setObituaryProgramNotes={setFuneralObituaryProgramNotes}
                  postFuneralFollowUpDate={funeralPostFollowUpDate}
                  setPostFuneralFollowUpDate={setFuneralPostFollowUpDate}
                  preferredServiceNotes={funeralPreferredNotes}
                  setPreferredServiceNotes={setFuneralPreferredNotes}
                  onSave={saveFuneralDetails}
                  saving={funeralSaving}
                  message={funeralMessage}
                />
              </div>
            ) : null}

            {isWedding && !editingIntake ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <WeddingDetailsSection
                  partnerOneName={weddingPartnerOne}
                  setPartnerOneName={setWeddingPartnerOne}
                  partnerTwoName={weddingPartnerTwo}
                  setPartnerTwoName={setWeddingPartnerTwo}
                  proposedWeddingDate={weddingProposedDate}
                  setProposedWeddingDate={setWeddingProposedDate}
                  ceremonyNotes={weddingCeremonyNotes}
                  setCeremonyNotes={setWeddingCeremonyNotes}
                  onSave={saveWeddingDetails}
                  saving={weddingSaving}
                  message={weddingMessage}
                />
              </div>
            ) : null}

            {isOcia && !editingIntake ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <OciaDetailsSection detail={ociaDetail} />
              </div>
            ) : null}

            {isJoinParish && !editingIntake ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <JoinParishDetailsSection detail={joinParishDetail} />
              </div>
            ) : null}

            <div className="mt-6 border-t border-gray-100 pt-5">
              <RequestStatusSection
                request={request}
                scheduleRow={scheduleRowForProgress}
                onUpdateStatus={updateRequestStatus}
                updating={requestStatusUpdating || workflowMutationRequiresRefresh}
              />
              <RequestWaitingOnSection
                request={request}
                disabled={workflowMutationRequiresRefresh}
                onSave={updateWaitingOn}
                mutationRequiresRefresh={workflowMutationRequiresRefresh}
                onMutationUnconfirmed={() => setWorkflowMutationRequiresRefresh(true)}
              />
            </div>
        </WorkflowSectionCard>
        </div>

        <div
          role="tabpanel"
          id="request-tabpanel-scheduling"
          aria-labelledby="request-tab-scheduling"
          hidden={activeTab !== 'scheduling'}
          className="space-y-5 p-4 sm:space-y-6 sm:p-6"
        >
        <WorkflowSectionCard
          id="assignment"
          title="Assignment"
          description="Who on staff is responsible for this request."
        >
            <AssignmentSection
              requestId={routeId}
              assignedStaffName={request?.assigned_staff_name}
              assignedPriestName={request?.assigned_priest_name}
              assignedDeaconName={request?.assigned_deacon_name}
              staffOptions={staffAssigneeOptions}
              priestOptions={priestAssigneeOptions}
              onSaved={loadRequest}
              mutationRequiresRefresh={workflowMutationRequiresRefresh}
              onMutationUnconfirmed={() => setWorkflowMutationRequiresRefresh(true)}
            />
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="scheduling-records"
          title="Scheduling"
          description="Follow-up dates, confirmed times, Google Calendar, and parish checklist."
        >
          <div id="next-follow-up" className="scroll-mt-6 sm:scroll-mt-8">
            <h3 className="text-sm font-semibold text-gray-900">Follow-up</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Set a date so this request stays on the parish radar.
            </p>
            <div className="mt-4">
              <NextFollowUpSection
                requestId={routeId}
                nextFollowUpDate={request?.next_follow_up_date}
                onSaved={loadRequest}
                mutationRequiresRefresh={workflowMutationRequiresRefresh}
                onMutationUnconfirmed={() => setWorkflowMutationRequiresRefresh(true)}
              />
            </div>
          </div>

          <div id="confirmed-time" className="scroll-mt-6 sm:scroll-mt-8 mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900">Dates & calendar</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Suggested dates, confirmation, and calendar sync when Google is connected.
            </p>
            <div className="mt-4 space-y-6">
            {isBaptism ? (
              <div className="mb-6">
                <SuggestedDatesSection
                  suggested1={suggested1}
                  suggested2={suggested2}
                  suggested3={suggested3}
                  setSuggested1={setSuggested1}
                  setSuggested2={setSuggested2}
                  setSuggested3={setSuggested3}
                  onSaveSuggestedDates={saveSuggestedDates}
                  saving={suggestedSaving}
                  message={suggestedMessage}
                />
                <div className="mt-6 border-t border-gray-100 pt-5" />
              </div>
            ) : null}

            {(isBaptism || isFuneral || isWedding || isOcia) ? (
              <div>
                {isBaptism ? (
                  <ConfirmedBaptismDateSection
                    confirmedValue={confirmedBaptismDate}
                    setConfirmedValue={setConfirmedBaptismDate}
                    confirmedIso={request?.confirmed_baptism_date}
                    suggested1={suggested1}
                    suggested2={suggested2}
                    suggested3={suggested3}
                    onSave={saveConfirmedBaptismDate}
                    onClear={() => setPendingConfirmedScheduleClear('baptism')}
                    saving={confirmedSaving}
                    message={confirmedMessage}
                  />
                ) : isFuneral ? (
                  <ConfirmedFuneralServiceSection
                    confirmedValue={confirmedFuneralService}
                    setConfirmedValue={setConfirmedFuneralService}
                    confirmedIso={funeralDetail?.confirmed_service_at}
                    onSave={saveConfirmedFuneralService}
                    onClear={() => setPendingConfirmedScheduleClear('funeral')}
                    saving={funeralConfirmedSaving}
                    message={funeralConfirmedMessage}
                  />
                ) : isWedding ? (
                  <ConfirmedWeddingCeremonySection
                    confirmedValue={confirmedWeddingCeremony}
                    setConfirmedValue={setConfirmedWeddingCeremony}
                    confirmedIso={weddingDetail?.confirmed_ceremony_at}
                    onSave={saveConfirmedWeddingCeremony}
                    onClear={() => setPendingConfirmedScheduleClear('wedding')}
                    saving={weddingConfirmedSaving}
                    message={weddingConfirmedMessage}
                  />
                ) : (
                  <ConfirmedOciaSessionSection
                    confirmedValue={confirmedOciaSession}
                    setConfirmedValue={setConfirmedOciaSession}
                    confirmedIso={ociaDetail?.confirmed_session_at}
                    onSave={saveConfirmedOciaSession}
                    onClear={() => setPendingConfirmedScheduleClear('ocia')}
                    saving={ociaSessionSaving}
                    message={ociaSessionMessage}
                  />
                )}

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <GoogleCalendarSection
                    confirmedIso={confirmedIso}
                    unconfirmedHint={
                      isFuneral
                        ? 'Set a confirmed funeral service time first to create or update a calendar event.'
                        : isWedding
                          ? 'Set a confirmed wedding ceremony time first to create or update a calendar event.'
                          : isOcia
                            ? 'Set a confirmed OCIA meeting time first to create or update a calendar event.'
                            : undefined
                    }
                    eventId={request?.google_calendar_event_id}
                    eventLink={request?.google_calendar_event_html_link}
                    onCreate={createGoogleCalendarEvent}
                    onForceCreate={() => setConfirmGoogleCalendarConflictOverrideOpen(true)}
                    onUpdate={updateGoogleCalendarEvent}
                    onDelete={() => setConfirmGoogleCalendarDeleteOpen(true)}
                    creating={gcalCreating}
                    updating={gcalUpdating}
                    deleting={gcalDeleting}
                    message={gcalMessage}
                    conflicts={gcalConflicts}
                  />
                </div>
              </div>
            ) : null}
            </div>
          </div>

          <div id="checklist" className="scroll-mt-6 sm:scroll-mt-8 mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900">Workflow steps</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Track the parish process for this request by phase, owner, due date, and status.
            </p>
            <div className="mt-4">
              <RequestWorkflowStepsSection
                steps={workflowSteps}
                updatingStepId={workflowStepUpdatingId}
                onUpdateStatus={updateWorkflowStepStatus}
                mutationRequiresRefresh={workflowMutationRequiresRefresh}
              />
            </div>
            {workflowStepMessage ? (
              <InlineFormMessage message={workflowStepMessage} className="!mt-4" />
            ) : null}

            <RequestDocumentsSection
              key={routeId}
              requestId={routeId}
              workflowSteps={workflowSteps}
            />

            {!hasWorkflowSteps ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="text-sm font-semibold text-gray-900">Legacy parish checklist</h4>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
                  This request does not have workflow step instances yet, so Vinea is using the
                  original checklist for this record.
                </p>
                <div className="mt-4">
                  <WorkflowPlaybookBuilder
                    requestId={routeId}
                    requestType={request?.request_type}
                    checklistItems={checklistItems}
                    onApplied={() => {
                      void loadRequest()
                    }}
                  />
                </div>
                <div className="mt-4">
                  <ChecklistSection
                    checklistItems={checklistItems}
                    onToggleChecklistItem={toggleChecklistItem}
                    updatingItemId={checklistUpdatingId}
                    mutationRequiresRefresh={workflowMutationRequiresRefresh}
                  />
                </div>
                {checklistMessage ? (
                  <InlineFormMessage message={checklistMessage} className="!mt-4" />
                ) : null}
              </div>
            ) : null}
          </div>
        </WorkflowSectionCard>
        </div>

        <div
          role="tabpanel"
          id="request-tabpanel-communication"
          aria-labelledby="request-tab-communication"
          hidden={activeTab !== 'communication'}
          className="space-y-5 p-4 sm:space-y-6 sm:p-6"
        >
        <WorkflowSectionCard
          id="communication-hub"
          title="Communication"
          description="Email the family, review past messages, and draft replies from one place."
        >
          <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-900/80">
              Contact snapshot
            </p>
            <div className="mt-2">
              <CommunicationContactSummary
                lastContactedAtIso={request?.last_contacted_at}
                lastContactMethod={request?.last_contact_method}
                communicationNotes={request?.communication_notes}
              />
            </div>
          </div>

          <div className="space-y-5">
            <CommunicationHubSubsection
              id="ai-tools"
              title="Reply assistance"
              description="Generate a short summary or a draft reply, then use it in Send email below."
            >
              <AiToolsSection
                aiLoading={aiLoading}
                aiSummary={aiSummary}
                replyDraft={replyDraft}
                copyMessage={copyMessage}
                onGenerateSummary={generateSummary}
                onGenerateReplyDraft={generateReplyDraft}
                onCopyReplyDraft={copyReplyDraft}
              />
            </CommunicationHubSubsection>

            <CommunicationHubSubsection
              id="send-email"
              title="Send email"
              description="Use a parish template or your draft, edit the message, and send to the family."
            >
              <SendEmailSection
                toEmail={String(parishioner?.email || '')}
                subject={emailSubject}
                setSubject={setEmailSubject}
                body={replyDraft}
                setBody={setReplyDraft}
                templateOptions={listVineaEmailTemplateOptions(
                  String(request?.request_type || 'baptism')
                )}
                onApplyTemplate={applyVineaEmailTemplate}
                onSend={sendEmail}
                sending={emailSending}
                message={emailMessage}
              />
            </CommunicationHubSubsection>

            <CommunicationHubSubsection
              id="communication"
              title="Log communication"
              description="Record a call, visit, email, or other touchpoint with the family."
            >
              <CommunicationLogForm
                method={commMethod}
                setMethod={setCommMethod}
                contactedAtValue={commContactedAt}
                setContactedAtValue={setCommContactedAt}
                notes={commNotes}
                setNotes={setCommNotes}
                onLog={logCommunication}
                saving={commSaving || workflowMutationRequiresRefresh}
                message={commMessage}
              />
            </CommunicationHubSubsection>

            <CommunicationHubSubsection
              id="communication-history"
              title="Communication history"
              description="Chronological log of every touchpoint saved for this request."
            >
              <CommunicationHistoryList history={communications} />
            </CommunicationHubSubsection>
          </div>
        </WorkflowSectionCard>
        </div>

        <div
          role="tabpanel"
          id="request-tabpanel-notes"
          aria-labelledby="request-tab-notes"
          hidden={activeTab !== 'notes'}
          className="space-y-5 p-4 sm:space-y-6 sm:p-6"
        >
        <WorkflowSectionCard
          id="internal-notes"
          title="Internal note log"
          description="Timestamped staff-only notes — not visible to families."
        >
          <InternalNotesSection
            requestId={routeId}
            notes={requestNotes}
            onAdded={() => {
              void loadRequest()
            }}
          />
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="staff-notes"
          title="Staff notes on file"
          description="Shared notes on this request; included when you create Google Calendar events from Vinea."
        >
          <StaffNotesSection
            staffNotes={staffNotes}
            setStaffNotes={setStaffNotes}
            onSaveStaffNotes={() => void saveStaffNotes()}
            saving={staffNotesSaving}
            mutationRequiresRefresh={workflowMutationRequiresRefresh}
          />
          {staffNotesMessage ? (
            <InlineFormMessage message={staffNotesMessage} className="!mt-3" />
          ) : null}
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="activity"
          title="Activity"
          description="Recent staff and system changes for this request."
        >
          {activityError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {activityError}
            </p>
          ) : activityEvents.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
              No activity has been recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {activityEvents.map((event) => (
                <div key={event.id} className="px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {auditEventTitle(event)}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {auditEventDetail(event)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {event.actor_email || 'System'} - {event.action}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-gray-500" dateTime={event.created_at}>
                      {new Date(event.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </WorkflowSectionCard>

        <div id="ready-to-complete">
          <ReadyToCompleteCard
            items={readyToCompleteItems}
            isAlreadyComplete={isRequestComplete}
            canMarkComplete={canConfirmMarkComplete}
            markCompleteDisabledReason={markCompleteDisabledReason}
            onRequestMarkComplete={() => setConfirmMarkCompleteOpen(true)}
          />
          {requestStatusMessage ? (
            <InlineFormMessage message={requestStatusMessage} className="!mt-3" />
          ) : null}
        </div>

        <WorkflowSectionCard
          id="completion"
          title="Complete request"
          description="Review readiness, then close this intake when everything is done."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm leading-relaxed text-gray-600">
                Confirm each item below, then use Mark complete when the parish is ready to close this
                intake.
              </p>
            </div>
            <div className="w-full sm:w-auto" title={!canConfirmMarkComplete ? markCompleteDisabledReason : undefined}>
              <button
                type="button"
                disabled={!canConfirmMarkComplete}
                onClick={() => {
                  if (!canConfirmMarkComplete) return
                  setConfirmMarkCompleteOpen(true)
                }}
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
              >
                Mark Complete
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ul className="space-y-3">
              {completionRequirements.map((req) => (
                <li key={req.key} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{req.label}</p>
                    {!req.ok ? (
                      <p className="mt-0.5 text-xs text-gray-500">{req.missingText}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        req.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.ok ? 'Done' : 'Needs attention'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {missingCompletionItems.length > 0 ? (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-700">Still needed</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missingCompletionItems.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50"
                      onClick={() => goToSection(m.jumpTo)}
                    >
                      {m.jumpTo === 'confirmed-time'
                        ? 'Dates & calendar'
                        : m.jumpTo === 'next-follow-up'
                          ? 'Follow-Up'
                          : m.jumpTo === 'communication'
                            ? 'Communication history'
                            : m.jumpTo === 'assignment'
                              ? 'Assignment'
                              : 'Checklist'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500">
                Everything looks ready. You’ll be asked to confirm before marking complete.
              </p>
            )}
          </div>
        </WorkflowSectionCard>
        </div>
      </div>

      <VineaConfirmDialog
        open={confirmMarkCompleteOpen}
        title="Mark this request complete?"
        description="Vinea will move this request out of the active work queue and keep its history available to staff."
        warning="You can reopen the request later by changing its status."
        confirmLabel="Mark complete"
        onCancel={() => setConfirmMarkCompleteOpen(false)}
        onConfirm={() => {
          if (!canConfirmMarkComplete) return
          setConfirmMarkCompleteOpen(false)
          updateRequestStatus('complete')
        }}
      />

      <VineaConfirmDialog
        open={pendingConfirmedScheduleClear !== null}
        title={`Clear confirmed ${
          pendingConfirmedScheduleClear === 'baptism'
            ? 'Baptism date'
            : pendingConfirmedScheduleClear === 'funeral'
              ? 'Funeral service time'
              : pendingConfirmedScheduleClear === 'wedding'
                ? 'Wedding ceremony time'
                : 'OCIA meeting time'
        }?`}
        description="Vinea will remove this confirmed date and time from the request. Staff can enter a new confirmed time later."
        warning="This does not delete or update any existing Google Calendar event. Review the Calendar section separately."
        confirmLabel="Clear confirmed time"
        onCancel={() => setPendingConfirmedScheduleClear(null)}
        onConfirm={confirmConfirmedScheduleClear}
      />

      <VineaConfirmDialog
        open={confirmGoogleCalendarDeleteOpen}
        title="Delete this Google Calendar event?"
        description="Vinea will remove the linked event from the selected parish calendar and clear the event link from this request."
        warning="The confirmed request date or time will remain in Vinea. Change it separately if the schedule itself has changed."
        confirmLabel="Delete calendar event"
        onCancel={() => setConfirmGoogleCalendarDeleteOpen(false)}
        onConfirm={() => {
          setConfirmGoogleCalendarDeleteOpen(false)
          void deleteGoogleCalendarEvent()
        }}
      />

      <VineaConfirmDialog
        open={confirmGoogleCalendarConflictOverrideOpen}
        title="Create this event despite calendar conflicts?"
        description={`Vinea found ${gcalConflicts.length === 1 ? '1 conflicting event' : `${gcalConflicts.length} conflicting events`} at this time. Review the conflict list before continuing.`}
        warning="Creating anyway does not resolve or change the existing events. Parish staff remain responsible for confirming the schedule."
        confirmLabel="Create event anyway"
        onCancel={() => setConfirmGoogleCalendarConflictOverrideOpen(false)}
        onConfirm={() => {
          setConfirmGoogleCalendarConflictOverrideOpen(false)
          void forceCreateGoogleCalendarEvent()
        }}
      />

      <VineaConfirmDialog
        open={pendingEmailTemplateId !== null}
        title="Replace the current email draft?"
        description="Vinea will replace the subject and message currently in the editor with the selected parish template."
        warning="Your current draft will be replaced. You can review and edit the template before sending."
        confirmLabel="Replace with template"
        busy={emailTemplateApplying}
        busyLabel="Replacing..."
        onCancel={() => setPendingEmailTemplateId(null)}
        onConfirm={() => void confirmVineaEmailTemplate()}
      />
    </main>
  )
}
