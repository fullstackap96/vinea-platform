'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, User } from 'lucide-react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  RequestContactIntakeSection,
  RequestStatusSection,
  RequestWaitingOnSection,
} from './_components/RequestHeader'
import { FieldLabel, LabelValueGrid, LabelValueRow } from './_components/LabelValueGrid'
import { ChecklistSection } from './_components/ChecklistSection'
import { AiToolsSection } from './_components/AiToolsSection'
import { SuggestedDatesSection } from './_components/SuggestedDatesSection'
import { ConfirmedBaptismDateSection } from './_components/ConfirmedBaptismDateSection'
import { CommunicationSection, type CommunicationMethod } from './_components/CommunicationSection'
import { SendEmailSection } from './_components/SendEmailSection'
import { GoogleCalendarSection } from './_components/GoogleCalendarSection'
import { RequestNextStepCard, resolveRequestNextStep } from './_components/RequestNextStepCard'
import { RequestProgressCard } from './_components/RequestProgressCard'
import { RequestDetailSmartQuickActions } from './_components/RequestDetailSmartQuickActions'
import { RequestDetailSummaryHeader } from './_components/RequestDetailSummaryHeader'
import { WorkflowSectionCard } from './_components/WorkflowSectionCard'
import { RequestSectionHashNavigator } from './_components/RequestSectionHashNavigator'
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
  buildVineaEmailTemplateContext,
  listVineaEmailTemplateOptions,
  renderVineaEmailTemplate,
  type VineaEmailTemplateId,
} from '@/lib/vineaEmailTemplates'
import { EditRequestDetailsSection } from './_components/EditRequestDetailsSection'
import { ensureOciaRequestDetailsIfMissing } from '@/lib/ensureOciaRequestDetails'
import { primaryButtonMd, secondaryButtonMd } from '@/lib/buttonStyles'
import {
  validateConfirmedDateTimeNotPast,
  validateSuggestedDateNotPast,
} from '@/lib/scheduleValidation'
import { formatNextFollowUpDateCompact, parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import {
  isGoogleOAuthReconnectError,
  userFacingGoogleCalendarErrorMessage,
} from '@/lib/googleCalendarUserErrors'
import { InlineFormMessage } from '@/lib/inlineFormMessage'

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

  const [request, setRequest] = useState<any>(null)
  const [parishioner, setParishioner] = useState<any>(null)
  const [checklistItems, setChecklistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [aiSummary, setAiSummary] = useState('')
const [replyDraft, setReplyDraft] = useState('')
const [aiLoading, setAiLoading] = useState(false)
const [copyMessage, setCopyMessage] = useState('')
const [staffNotes, setStaffNotes] = useState('')
  const [staffNotesMessage, setStaffNotesMessage] = useState('')
  const [requestNotes, setRequestNotes] = useState<
    Array<{ id: string; body: string; created_at: string }>
  >([])
  const [suggested1, setSuggested1] = useState('')
  const [suggested2, setSuggested2] = useState('')
  const [suggested3, setSuggested3] = useState('')
  const [suggestedSaving, setSuggestedSaving] = useState(false)
  const [suggestedMessage, setSuggestedMessage] = useState('')

  const [confirmedBaptismDate, setConfirmedBaptismDate] = useState('')
  const [confirmedSaving, setConfirmedSaving] = useState(false)
  const [confirmedMessage, setConfirmedMessage] = useState('')

  const [communications, setCommunications] = useState<any[]>([])
  const [commMethod, setCommMethod] = useState<CommunicationMethod>('email')
  const [commContactedAt, setCommContactedAt] = useState('')
  const [commNotes, setCommNotes] = useState('')
  const [commSaving, setCommSaving] = useState(false)
  const [commMessage, setCommMessage] = useState('')

  const [emailSubject, setEmailSubject] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  const [gcalCreating, setGcalCreating] = useState(false)
  const [gcalUpdating, setGcalUpdating] = useState(false)
  const [gcalDeleting, setGcalDeleting] = useState(false)
  const [gcalMessage, setGcalMessage] = useState('')
  const [gcalConflicts, setGcalConflicts] = useState<
    Array<{ summary: string | null; start: string | null; end: string | null; htmlLink: string | null }>
  >([])

  const [funeralDetail, setFuneralDetail] = useState<any | null>(null)
  const [funeralDeceasedName, setFuneralDeceasedName] = useState('')
  const [funeralDateOfDeath, setFuneralDateOfDeath] = useState('')
  const [funeralHome, setFuneralHome] = useState('')
  const [funeralPreferredNotes, setFuneralPreferredNotes] = useState('')
  const [funeralSaving, setFuneralSaving] = useState(false)
  const [funeralMessage, setFuneralMessage] = useState('')
  const [confirmedFuneralService, setConfirmedFuneralService] = useState('')
  const [funeralConfirmedSaving, setFuneralConfirmedSaving] = useState(false)
  const [funeralConfirmedMessage, setFuneralConfirmedMessage] = useState('')

  const [weddingDetail, setWeddingDetail] = useState<any | null>(null)
  const [weddingPartnerOne, setWeddingPartnerOne] = useState('')
  const [weddingPartnerTwo, setWeddingPartnerTwo] = useState('')
  const [weddingProposedDate, setWeddingProposedDate] = useState('')
  const [weddingCeremonyNotes, setWeddingCeremonyNotes] = useState('')
  const [weddingSaving, setWeddingSaving] = useState(false)
  const [weddingMessage, setWeddingMessage] = useState('')
  const [confirmedWeddingCeremony, setConfirmedWeddingCeremony] = useState('')
  const [weddingConfirmedSaving, setWeddingConfirmedSaving] = useState(false)
  const [weddingConfirmedMessage, setWeddingConfirmedMessage] = useState('')

  const [ociaDetail, setOciaDetail] = useState<any | null>(null)
  const [confirmedOciaSession, setConfirmedOciaSession] = useState('')
  const [ociaSessionSaving, setOciaSessionSaving] = useState(false)
  const [ociaSessionMessage, setOciaSessionMessage] = useState('')

  const [joinParishDetail, setJoinParishDetail] = useState<any | null>(null)

  const [editingIntake, setEditingIntake] = useState(false)
  const [confirmMarkCompleteOpen, setConfirmMarkCompleteOpen] = useState(false)
  const lastAutoNextStepKeyRef = useRef<string | null>(null)

  function nowDatetimeLocal() {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  useEffect(() => {
    if (!commContactedAt) setCommContactedAt(nowDatetimeLocal())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  async function loadRequest() {
    if (!routeId) {
      setErrorMessage('Route ID not found.')
      setLoading(false)
      return
    }

    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', routeId)
      .single()

    if (requestError || !requestData) {
      setErrorMessage('Request not found.')
      setLoading(false)
      return
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
    const { data: parishionerData, error: parishionerError } = await supabase
      .from('parishioners')
      .select('*')
      .eq('id', requestData.parishioner_id)
      .single()

    if (parishionerError) {
      console.error('Error loading parishioner:', parishionerError)
    }
    if (parishionerData) {
      setParishioner(parishionerData)
    }

    const { data: checklistData } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('request_id', requestData.id)
      .order('created_at', { ascending: true })

    setChecklistItems(checklistData || [])

    const { data: communicationsData } = await supabase
      .from('request_communications')
      .select('*')
      .eq('request_id', requestData.id)
      .order('contacted_at', { ascending: false })

    setCommunications(communicationsData || [])

    const { data: notesData, error: notesError } = await supabase
      .from('request_notes')
      .select('id, body, created_at')
      .eq('request_id', requestData.id)
      .order('created_at', { ascending: false })

    if (notesError) {
      console.error('Error loading request notes:', notesError)
      setRequestNotes([])
    } else {
      setRequestNotes(notesData || [])
    }

    if (requestData.request_type === 'funeral') {
      const { data: fDetail } = await supabase
        .from('funeral_request_details')
        .select('*')
        .eq('request_id', requestData.id)
        .maybeSingle()

      setFuneralDetail(fDetail)
      setFuneralDeceasedName(fDetail?.deceased_name || '')
      setFuneralDateOfDeath(
        fDetail?.date_of_death ? String(fDetail.date_of_death).slice(0, 10) : ''
      )
      setFuneralHome(fDetail?.funeral_home_or_location || '')
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
      const { data: wDetail } = await supabase
        .from('wedding_request_details')
        .select('*')
        .eq('request_id', requestData.id)
        .maybeSingle()

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
      setFuneralDateOfDeath('')
      setFuneralHome('')
      setFuneralPreferredNotes('')
      setConfirmedFuneralService('')

      setOciaDetail(null)
      setConfirmedOciaSession('')
    } else if (requestData.request_type === 'ocia') {
      let { data: oDetail } = await supabase
        .from('ocia_request_details')
        .select('*')
        .eq('request_id', requestData.id)
        .maybeSingle()

      if (!oDetail) {
        const ensured = await ensureOciaRequestDetailsIfMissing(supabase, String(requestData.id))
        if (ensured.error) {
          console.error('ensureOciaRequestDetailsIfMissing:', ensured.error)
        }
        oDetail = ensured.data as typeof oDetail
      }

      setOciaDetail(oDetail ?? null)
      setConfirmedOciaSession(isoToDatetimeLocal(oDetail?.confirmed_session_at))

      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
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
      const { data: jpDetail } = await supabase
        .from('join_parish_request_details')
        .select('*')
        .eq('request_id', requestData.id)
        .maybeSingle()

      setJoinParishDetail(jpDetail ?? null)

      setFuneralDetail(null)
      setFuneralDeceasedName('')
      setFuneralDateOfDeath('')
      setFuneralHome('')
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
      setFuneralDateOfDeath('')
      setFuneralHome('')
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

    setLoading(false)
  }

  async function toggleChecklistItem(itemId: string, currentValue: boolean) {
    const { error } = await supabase
      .from('checklist_items')
      .update({ is_complete: !currentValue })
      .eq('id', itemId)

    if (!error) {
      loadRequest()
    }
  }
async function updateRequestStatus(newStatus: string) {
  const { error } = await supabase
    .from('requests')
    .update({ status: newStatus })
    .eq('id', routeId)

  if (!error) {
    loadRequest()
  }
}

async function updateWaitingOn(next: string | null) {
  const { error } = await supabase
    .from('requests')
    .update({ waiting_on: next })
    .eq('id', routeId)

  if (error) {
    throw new Error(error.message)
  }
  loadRequest()
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

function highlightSectionById(id: string) {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id) as HTMLElement | null
  if (!el) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cls = 'request-detail-hash-highlight'
  el.classList.add(cls)
  el.style.animationDuration = reduced ? '2200ms' : '3500ms'
  const timeout = reduced ? 2600 : 3900
  window.setTimeout(() => {
    el.classList.remove(cls)
    el.style.animationDuration = ''
  }, timeout)
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
        dateOfDeath: funeralDetail?.date_of_death || funeralDateOfDeath,
        funeralHome: funeralDetail?.funeral_home_or_location || funeralHome,
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

    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      setAiSummary(`Error: ${errorText}`)
      return
    }

    const data = await res.json()
const summaryText = data.summary || 'No summary returned.'

setAiSummary(summaryText)

await supabase
  .from('requests')
  .update({ ai_summary: summaryText })
  .eq('id', routeId)
  } catch (error: any) {
    setAiSummary(`Error: ${error.message}`)
  } finally {
    setAiLoading(false)
  }
}
async function generateReplyDraft() {
  if (!request || !parishioner) return

  try {
    setAiLoading(true)
    setReplyDraft('')

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
      replyBody.dateOfDeath = funeralDetail?.date_of_death || funeralDateOfDeath
      replyBody.funeralHome = funeralDetail?.funeral_home_or_location || funeralHome
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
      const errorText = await res.text()
      setReplyDraft(`Error: ${errorText}`)
      return
    }

    const data = await res.json()
    const replyText = data.reply || 'No reply returned.'
    const parsed = parseAiEmailDraft(replyText)
    if (parsed.hadSubjectLine) {
      setEmailSubject(parsed.subject)
      setReplyDraft(parsed.body)
      await supabase
        .from('requests')
        .update({ reply_draft: parsed.body })
        .eq('id', routeId)
    } else {
      setReplyDraft(replyText)
      await supabase
        .from('requests')
        .update({ reply_draft: replyText })
        .eq('id', routeId)
    }
  } catch (error: any) {
    setReplyDraft(`Error: ${error.message}`)
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

async function applyVineaEmailTemplate(templateId: VineaEmailTemplateId) {
  const hasExisting =
    String(emailSubject || '').trim() || String(replyDraft || '').trim()
  if (hasExisting) {
    const ok = window.confirm(
      'Replace the current subject and body with this template? You can still edit after applying.'
    )
    if (!ok) return
  }

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

  const { error } = await supabase
    .from('requests')
    .update({ reply_draft: body })
    .eq('id', routeId)

  if (error) {
    console.error('reply_draft save:', error)
    setEmailMessage(
      `Template applied, but saving the draft failed: ${error.message}`
    )
  }
}

async function saveStaffNotes() {
  setStaffNotesMessage('')
  const { error } = await supabase
    .from('requests')
    .update({ staff_notes: staffNotes })
    .eq('id', routeId)

  if (error) {
    setStaffNotesMessage(`Save failed: ${error.message}`)
    return
  }
  setStaffNotesMessage('Staff notes saved.')
  loadRequest()
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

  const { error } = await supabase
    .from('requests')
    .update({
      suggested_date_1: suggested1 || null,
      suggested_date_2: suggested2 || null,
      suggested_date_3: suggested3 || null,
    })
    .eq('id', routeId)

  if (error) {
    console.error('SAVE SUGGESTED DATES ERROR:', error)
    setSuggestedMessage(`Error saving suggested dates: ${error.message}`)
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

  const { error } = await supabase
    .from('requests')
    .update({
      confirmed_baptism_date: datetimeLocalToIso(confirmedBaptismDate),
    })
    .eq('id', routeId)

  if (error) {
    console.error('SAVE CONFIRMED BAPTISM DATE ERROR:', error)
    setConfirmedMessage(`Error saving confirmed date: ${error.message}`)
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
  setConfirmedBaptismDate('')

  const { error } = await supabase
    .from('requests')
    .update({ confirmed_baptism_date: null })
    .eq('id', routeId)

  if (error) {
    console.error('CLEAR CONFIRMED BAPTISM DATE ERROR:', error)
    setConfirmedMessage(`Error clearing confirmed date: ${error.message}`)
    setConfirmedSaving(false)
    return
  }

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

  const { error } = await supabase.from('funeral_request_details').upsert(
    {
      request_id: routeId,
      deceased_name: name,
      date_of_death: funeralDateOfDeath || null,
      funeral_home_or_location: funeralHome.trim() || null,
      preferred_service_notes: funeralPreferredNotes.trim() || null,
      confirmed_service_at: funeralDetail?.confirmed_service_at ?? null,
    },
    { onConflict: 'request_id' }
  )

  if (error) {
    setFuneralMessage(`Error saving: ${error.message}`)
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

  const { error } = await supabase
    .from('funeral_request_details')
    .update({
      confirmed_service_at: datetimeLocalToIso(confirmedFuneralService),
    })
    .eq('request_id', routeId)

  if (error) {
    setFuneralConfirmedMessage(`Error saving: ${error.message}`)
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
  setConfirmedFuneralService('')

  const { error } = await supabase
    .from('funeral_request_details')
    .update({ confirmed_service_at: null })
    .eq('request_id', routeId)

  if (error) {
    setFuneralConfirmedMessage(`Error clearing: ${error.message}`)
    setFuneralConfirmedSaving(false)
    return
  }

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

  const { error } = await supabase.from('wedding_request_details').upsert(
    {
      request_id: routeId,
      partner_one_name: name,
      partner_two_name: weddingPartnerTwo.trim() || null,
      proposed_wedding_date: weddingProposedDate || null,
      ceremony_notes: weddingCeremonyNotes.trim() || null,
      confirmed_ceremony_at: weddingDetail?.confirmed_ceremony_at ?? null,
    },
    { onConflict: 'request_id' }
  )

  if (error) {
    setWeddingMessage(`Error saving: ${error.message}`)
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

  const { error } = await supabase
    .from('wedding_request_details')
    .update({
      confirmed_ceremony_at: datetimeLocalToIso(confirmedWeddingCeremony),
    })
    .eq('request_id', routeId)

  if (error) {
    setWeddingConfirmedMessage(`Error saving: ${error.message}`)
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
  setConfirmedWeddingCeremony('')

  const { error } = await supabase
    .from('wedding_request_details')
    .update({ confirmed_ceremony_at: null })
    .eq('request_id', routeId)

  if (error) {
    setWeddingConfirmedMessage(`Error clearing: ${error.message}`)
    setWeddingConfirmedSaving(false)
    return
  }

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

  if (!ociaDetail) {
    const ensured = await ensureOciaRequestDetailsIfMissing(supabase, routeId)
    if (ensured.error || !ensured.data) {
      setOciaSessionMessage(
        `Unable to create OCIA intake record: ${ensured.error || 'Unknown error'}`
      )
      setOciaSessionSaving(false)
      return
    }
    setOciaDetail(ensured.data)
  }

  const { error } = await supabase
    .from('ocia_request_details')
    .update({
      confirmed_session_at: datetimeLocalToIso(confirmedOciaSession),
    })
    .eq('request_id', routeId)

  if (error) {
    setOciaSessionMessage(`Error saving: ${error.message}`)
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
  setConfirmedOciaSession('')

  if (!ociaDetail) {
    const ensured = await ensureOciaRequestDetailsIfMissing(supabase, routeId)
    if (ensured.error || !ensured.data) {
      setOciaSessionMessage(
        ensured.error ? `Unable to access OCIA record: ${ensured.error}` : 'Unable to access OCIA record.'
      )
      setOciaSessionSaving(false)
      return
    }
    setOciaDetail(ensured.data)
  }

  const { error } = await supabase
    .from('ocia_request_details')
    .update({ confirmed_session_at: null })
    .eq('request_id', routeId)

  if (error) {
    setOciaSessionMessage(`Error clearing: ${error.message}`)
    setOciaSessionSaving(false)
    return
  }

  setOciaSessionMessage('Cleared.')
  setOciaSessionSaving(false)
  loadRequest()
}

async function logCommunication() {
  setCommSaving(true)
  setCommMessage('')

  const contactedAtIso = datetimeLocalToIso(commContactedAt)
  if (!contactedAtIso) {
    setCommMessage('Please choose a valid contacted date/time.')
    setCommSaving(false)
    return
  }

  const insertRes = await supabase
    .from('request_communications')
    .insert({
      request_id: routeId,
      contacted_at: contactedAtIso,
      method: commMethod,
      notes: commNotes || null,
    })

  if (insertRes.error) {
    console.error('LOG COMMUNICATION INSERT ERROR:', insertRes.error)
    setCommMessage(`Error logging communication: ${insertRes.error.message}`)
    setCommSaving(false)
    return
  }

  const updateRes = await supabase
    .from('requests')
    .update({
      last_contacted_at: contactedAtIso,
      last_contact_method: commMethod,
      communication_notes: commNotes || null,
    })
    .eq('id', routeId)

  if (updateRes.error) {
    console.error('LOG COMMUNICATION SUMMARY UPDATE ERROR:', updateRes.error)
    setCommMessage(
      `Logged history, but failed updating summary fields: ${updateRes.error.message}`
    )
    setCommSaving(false)
    loadRequest()
    return
  }

  setCommNotes('')
  setCommMessage('Communication logged.')
  setCommSaving(false)
  loadRequest()
}

async function sendEmail() {
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

  try {
    setEmailSending(true)
    setEmailMessage('')

    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    })

    const payload = await res.json().catch(() => ({} as any))
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Send failed (${res.status})`
      setEmailMessage(String(err))
      return
    }

    const contactedAtIso = new Date().toISOString()
    const summary = `Email sent: ${subject}`

    const insertRes = await supabase.from('request_communications').insert({
      request_id: routeId,
      contacted_at: contactedAtIso,
      method: 'email',
      notes: summary,
    })

    if (insertRes.error) {
      console.error('EMAIL COMMUNICATION LOG INSERT ERROR:', insertRes.error)
      setEmailMessage(
        `Email sent, but failed logging communication: ${insertRes.error.message}`
      )
      loadRequest()
      return
    }

    const updateRes = await supabase
      .from('requests')
      .update({
        last_contacted_at: contactedAtIso,
        last_contact_method: 'email',
        communication_notes: summary,
      })
      .eq('id', routeId)

    if (updateRes.error) {
      console.error('EMAIL SUMMARY UPDATE ERROR:', updateRes.error)
      setEmailMessage(
        `Email sent and logged, but failed updating summary fields: ${updateRes.error.message}`
      )
      loadRequest()
      return
    }

    setEmailMessage('Email sent successfully.')
    loadRequest()
  } catch (error: any) {
    setEmailMessage(`Send failed: ${error?.message || 'Unknown error'}`)
  } finally {
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

  try {
    setGcalCreating(true)
    setGcalMessage('')
    if (!forceCreate) setGcalConflicts([])

    const res = await fetch('/api/google/calendar-event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId, forceCreate }),
    })

    const payload = await res.json().catch(() => ({} as any))
    if (res.status === 409 && payload?.error === 'CALENDAR_CONFLICT') {
      setGcalMessage(String(payload?.message || 'There is already something scheduled at this time.'))
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
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error'
      setGcalMessage(`Create failed: ${msg}`)
    }
    setGcalConflicts([])
  } finally {
    setGcalCreating(false)
  }
}

async function updateGoogleCalendarEvent() {
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

  try {
    setGcalUpdating(true)
    setGcalMessage('')
    setGcalConflicts([])

    const res = await fetch('/api/google/calendar-event/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = await res.json().catch(() => ({} as any))
    if (res.status === 409 && payload?.error === 'CALENDAR_CONFLICT') {
      setGcalMessage(String(payload?.message || 'There is already something scheduled at this time.'))
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
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error'
      setGcalMessage(`Update failed: ${msg}`)
    }
    setGcalConflicts([])
  } finally {
    setGcalUpdating(false)
  }
}

async function deleteGoogleCalendarEvent() {
  if (!request?.google_calendar_event_id) {
    setGcalMessage('No Google Calendar event is linked to this request.')
    return
  }

  try {
    setGcalDeleting(true)
    setGcalMessage('')

    const res = await fetch('/api/google/calendar-event/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = await res.json().catch(() => ({} as any))
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
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error'
      setGcalMessage(`Delete failed: ${msg}`)
    }
  } finally {
    setGcalDeleting(false)
  }
}

  useEffect(() => {
    setEmailSubject('')
  }, [routeId])

  useEffect(() => {
    setEditingIntake(false)
  }, [routeId])

  useEffect(() => {
    function syncHashToSection() {
      const raw = typeof window !== 'undefined' ? window.location.hash : ''
      const id = raw ? raw.replace(/^#/, '') : ''
      if (!id) return
      const allowed = new Set([
        'request-details',
        'contact-information',
        'assignment',
        'next-follow-up',
        'next-step',
        'confirmed-time',
        'checklist',
        'email-communication',
        'send-email',
        'ai-tools',
        'communication',
        'staff-notes',
        'internal-notes',
        'completion',
      ])
      if (!allowed.has(id)) return
      highlightSectionById(id)
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (!el) return
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      })
    }

    syncHashToSection()
    window.addEventListener('hashchange', syncHashToSection)
    return () => window.removeEventListener('hashchange', syncHashToSection)
  }, [])

  // Intentionally only re-fetch when the route id changes (loadRequest closes over fresh state).
  useEffect(() => {
    loadRequest()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadRequest is not stable; routeId is the trigger.
  }, [routeId])

  // Derived workflow state (safe even while loading).
  const scheduleRowForProgress = {
    request_type: request?.request_type,
    confirmed_baptism_date: request?.confirmed_baptism_date,
    funeral_detail: funeralDetail
      ? { confirmed_service_at: funeralDetail.confirmed_service_at }
      : null,
    wedding_detail: weddingDetail
      ? { confirmed_ceremony_at: weddingDetail.confirmed_ceremony_at }
      : null,
    ocia_detail: ociaDetail ? { confirmed_session_at: ociaDetail.confirmed_session_at } : null,
  }

  const checklistIncomplete = checklistItems.some((i: any) => i?.is_complete === false)
  const nextStep = resolveRequestNextStep({
    request,
    scheduleRow: scheduleRowForProgress,
    checklistIncomplete,
  })

  useEffect(() => {
    // When the workflow next step changes, highlight + scroll (unless the URL hash overrides).
    if (hasHashOverride()) return

    const key = nextStep.priorityKey
    const prevKey = lastAutoNextStepKeyRef.current
    lastAutoNextStepKeyRef.current = key

    const targetId = nextStep.targetSectionId
    const stepChanged = prevKey == null || prevKey !== key

    if (stepChanged) {
      highlightSectionById(targetId)
    }

    if (!stepChanged) return
    if (!request) return
    if (userIsActivelyTyping()) return

    requestAnimationFrame(() => {
      const el = document.getElementById(targetId)
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    })
  }, [request, nextStep.priorityKey, nextStep.targetSectionId])

  if (loading) {
    return (
      <div
        className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 py-16 sm:px-6"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading request"
      >
        <span className="h-9 w-9 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" aria-hidden />
        <p className="text-base font-medium text-gray-800">Loading request…</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
          >
            ← Back to Dashboard
          </Link>
        </p>
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Request details</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track this request</p>
        </header>
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
        <p className="mt-4 text-sm text-gray-800">
          <strong>Route ID:</strong> {String(routeId)}
        </p>
      </main>
    )
  }

  const requestType = String(request?.request_type || 'baptism')
  const isBaptism = requestType === 'baptism'
  const isFuneral = requestType === 'funeral'
  const isWedding = requestType === 'wedding'
  const isOcia = requestType === 'ocia'
  const isJoinParish = requestType === 'join_parish'

  const requestIdentityName =
    String(parishioner?.full_name ?? '').trim() || 'Unnamed contact'
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

  const remainingChecklistCount = checklistItems.filter((i: any) => i?.is_complete === false).length

  const followUpNotNeeded = String(request?.status || '') === 'complete'
  const followUpReady = hasFollowUp || followUpNotNeeded

  const checklistReady = remainingChecklistCount === 0

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
      label: 'Checklist complete?',
      ok: checklistReady,
      missingText: 'Complete the remaining checklist items.',
      jumpTo: 'checklist',
    },
  ] as const

  const missingCompletionItems = completionRequirements.filter((r) => !r.ok)
  const canMarkComplete = Boolean(request) && missingCompletionItems.length === 0

  const markCompleteDisabledReason =
    missingCompletionItems.length === 0
      ? ''
      : `To mark complete, review: ${missingCompletionItems
          .map((m) => m.jumpTo.replace('-', ' '))
          .join(', ')}.`

  function jumpToCompletion() {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => {
      const el = document.getElementById('completion')
      if (!el) return
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      highlightSectionById('completion')
      window.location.hash = '#completion'
    })
  }

  const followUpSummaryDisplay = parseFollowUpCalendarDate(request?.next_follow_up_date)
    ? formatNextFollowUpDateCompact(request.next_follow_up_date)
    : 'Not set'

  return (
    <main className="mx-auto max-w-6xl px-4 pb-6 pt-4 text-gray-900 sm:px-6 sm:pb-8 sm:pt-5">
      <RequestSectionHashNavigator />
      <p className="mb-3">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to Dashboard
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
        canEditIntake={Boolean(parishioner?.id)}
        editingIntake={editingIntake}
        onEditIntake={() => setEditingIntake(true)}
        onMarkComplete={jumpToCompletion}
      />

      <RequestProgressCard
        assignedStaffName={request?.assigned_staff_name}
        nextFollowUpDate={request?.next_follow_up_date}
        lastContactedAt={request?.last_contacted_at}
        scheduleRow={scheduleRowForProgress}
      />

      <div className="mt-4 sm:mt-5">
        <RequestDetailSmartQuickActions
          workflowInput={{
            request,
            scheduleRow: scheduleRowForProgress,
            checklistIncomplete,
          }}
          canMarkComplete={canMarkComplete}
          hasRecipientEmail={Boolean(String(parishioner?.email ?? '').trim())}
        />
      </div>

      <div className="mt-6 space-y-6 sm:mt-7">
        <WorkflowSectionCard id="next-step" variant="plain" className="p-1 sm:p-1">
          <div className="p-2 sm:p-3">
            <RequestNextStepCard
              request={request}
              scheduleRow={scheduleRowForProgress}
              checklistIncomplete={checklistIncomplete}
            />
          </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="contact-information"
          title="Contact Information"
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

        <WorkflowSectionCard
          id="request-details"
          title="Request Details"
          description="Intake information, sacrament-specific fields, and workflow status."
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
                  dateOfDeath={funeralDateOfDeath}
                  setDateOfDeath={setFuneralDateOfDeath}
                  funeralHome={funeralHome}
                  setFuneralHome={setFuneralHome}
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
              />
              <RequestWaitingOnSection request={request} onSave={updateWaitingOn} />
            </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="assignment"
          title="Assignment"
          description="Assign staff, priest, or deacon."
        >
            <AssignmentSection
              requestId={routeId}
              assignedStaffName={request?.assigned_staff_name}
              assignedPriestName={request?.assigned_priest_name}
              assignedDeaconName={request?.assigned_deacon_name}
              onSaved={loadRequest}
            />
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="scheduling-records"
          title="Scheduling & Records"
          description="Follow-up date, confirmed times, Google Calendar, and parish checklist."
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
                    onClear={clearConfirmedBaptismDate}
                    saving={confirmedSaving}
                    message={confirmedMessage}
                  />
                ) : isFuneral ? (
                  <ConfirmedFuneralServiceSection
                    confirmedValue={confirmedFuneralService}
                    setConfirmedValue={setConfirmedFuneralService}
                    confirmedIso={funeralDetail?.confirmed_service_at}
                    onSave={saveConfirmedFuneralService}
                    onClear={clearConfirmedFuneralService}
                    saving={funeralConfirmedSaving}
                    message={funeralConfirmedMessage}
                  />
                ) : isWedding ? (
                  <ConfirmedWeddingCeremonySection
                    confirmedValue={confirmedWeddingCeremony}
                    setConfirmedValue={setConfirmedWeddingCeremony}
                    confirmedIso={weddingDetail?.confirmed_ceremony_at}
                    onSave={saveConfirmedWeddingCeremony}
                    onClear={clearConfirmedWeddingCeremony}
                    saving={weddingConfirmedSaving}
                    message={weddingConfirmedMessage}
                  />
                ) : (
                  <ConfirmedOciaSessionSection
                    confirmedValue={confirmedOciaSession}
                    setConfirmedValue={setConfirmedOciaSession}
                    confirmedIso={ociaDetail?.confirmed_session_at}
                    onSave={saveConfirmedOciaSession}
                    onClear={clearConfirmedOciaSession}
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
                    onForceCreate={forceCreateGoogleCalendarEvent}
                    onUpdate={updateGoogleCalendarEvent}
                    onDelete={deleteGoogleCalendarEvent}
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
            <h3 className="text-sm font-semibold text-gray-900">Parish checklist</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Mark items as you complete parish process steps.
            </p>
            <div className="mt-4">
              <ChecklistSection
                checklistItems={checklistItems}
                onToggleChecklistItem={toggleChecklistItem}
              />
            </div>
          </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="email-communication"
          title="Email Communication"
          description="Vinea email templates, AI-assisted drafts, and sending mail to the family."
        >
          <div id="ai-tools" className="scroll-mt-6 sm:scroll-mt-8">
            <h3 className="text-sm font-semibold text-gray-900">Reply assistance</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Generate a summary or reply draft, then copy when ready.
            </p>
            <div className="mt-4">
              <AiToolsSection
                aiLoading={aiLoading}
                aiSummary={aiSummary}
                replyDraft={replyDraft}
                copyMessage={copyMessage}
                onGenerateSummary={generateSummary}
                onGenerateReplyDraft={generateReplyDraft}
                onCopyReplyDraft={copyReplyDraft}
              />
            </div>
          </div>
          <div id="send-email" className="scroll-mt-6 sm:scroll-mt-8 mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900">Send email</h3>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
              Prefill from a template or AI draft, edit as needed, then send.
            </p>
            <div className="mt-4">
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
            </div>
          </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="staff-notes"
          title="Staff notes on file"
          description="One shared text field on the request. Included when you create Google Calendar events from Vinea."
        >
          <StaffNotesSection
            staffNotes={staffNotes}
            setStaffNotes={setStaffNotes}
            onSaveStaffNotes={() => void saveStaffNotes()}
          />
          {staffNotesMessage ? (
            <InlineFormMessage message={staffNotesMessage} className="!mt-3" />
          ) : null}
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="internal-notes"
          title="Internal note log"
          description="Timestamped entries for staff only."
        >
            <InternalNotesSection requestId={routeId} notes={requestNotes} onAdded={loadRequest} />
        </WorkflowSectionCard>

        <WorkflowSectionCard
          id="communication"
          title="Communication History"
          description="Log touchpoints and review the full activity log for this request."
        >
            <CommunicationSection
              lastContactedAtIso={request?.last_contacted_at}
              lastContactMethod={request?.last_contact_method}
              communicationNotes={request?.communication_notes}
              method={commMethod}
              setMethod={setCommMethod}
              contactedAtValue={commContactedAt}
              setContactedAtValue={setCommContactedAt}
              notes={commNotes}
              setNotes={setCommNotes}
              onLog={logCommunication}
              saving={commSaving}
              message={commMessage}
              history={communications}
            />
        </WorkflowSectionCard>

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
            <div className="w-full sm:w-auto" title={!canMarkComplete ? markCompleteDisabledReason : undefined}>
              <button
                type="button"
                disabled={!canMarkComplete}
                onClick={() => {
                  if (!canMarkComplete) return
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
                      onClick={() => {
                        const id = m.jumpTo
                        requestAnimationFrame(() => {
                          const el = document.getElementById(id)
                          if (!el) return
                          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                          el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
                          highlightSectionById(id)
                          window.location.hash = `#${id}`
                        })
                      }}
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

      {confirmMarkCompleteOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm mark complete"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close modal"
            onClick={() => setConfirmMarkCompleteOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h2 className="text-base font-semibold text-gray-900">
              Are you sure you want to mark this request complete?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              You can still reopen it later by changing the status.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={`${secondaryButtonMd} w-full justify-center sm:w-auto`}
                onClick={() => setConfirmMarkCompleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${primaryButtonMd} w-full justify-center sm:w-auto`}
                onClick={() => {
                  setConfirmMarkCompleteOpen(false)
                  updateRequestStatus('complete')
                }}
              >
                Mark complete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}