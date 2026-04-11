'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RequestHeader } from './_components/RequestHeader'
import { ChecklistSection } from './_components/ChecklistSection'
import { StaffNotesSection } from './_components/StaffNotesSection'
import { AiToolsSection } from './_components/AiToolsSection'
import { SuggestedDatesSection } from './_components/SuggestedDatesSection'
import { ConfirmedBaptismDateSection } from './_components/ConfirmedBaptismDateSection'
import { CommunicationSection, type CommunicationMethod } from './_components/CommunicationSection'
import { SendEmailSection } from './_components/SendEmailSection'
import { GoogleCalendarSection } from './_components/GoogleCalendarSection'
import { FuneralDetailsSection } from './_components/FuneralDetailsSection'
import { ConfirmedFuneralServiceSection } from './_components/ConfirmedFuneralServiceSection'
import { WeddingDetailsSection } from './_components/WeddingDetailsSection'
import { ConfirmedWeddingCeremonySection } from './_components/ConfirmedWeddingCeremonySection'

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
setReplyDraft(requestData.reply_draft || '')
setStaffNotes(requestData.staff_notes || '')
    setSuggested1(isoToDatetimeLocal(requestData.suggested_date_1))
    setSuggested2(isoToDatetimeLocal(requestData.suggested_date_2))
    setSuggested3(isoToDatetimeLocal(requestData.suggested_date_3))
    setConfirmedBaptismDate(isoToDatetimeLocal(requestData.confirmed_baptism_date))
    const { data: parishionerData } = await supabase
      .from('parishioners')
      .select('*')
      .eq('id', requestData.parishioner_id)
      .single()

    setParishioner(parishionerData)

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

setReplyDraft(replyText)

await supabase
  .from('requests')
  .update({ reply_draft: replyText })
  .eq('id', routeId)
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
  } catch (error) {
    setCopyMessage('Copy failed.')
    setTimeout(() => setCopyMessage(''), 2000)
  }
}
async function saveStaffNotes() {
  const { error } = await supabase
    .from('requests')
    .update({ staff_notes: staffNotes })
    .eq('id', routeId)

  if (!error) {
    loadRequest()
  }
}

 async function saveSuggestedDates() {
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
    setEmailMessage('Generate a reply draft first.')
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
  const rt = String(request?.request_type || 'baptism')
  if (rt === 'funeral') {
    if (!funeralDetail?.confirmed_service_at) {
      setGcalMessage('Set a confirmed funeral service time first.')
      return
    }
  } else if (rt === 'wedding') {
    if (!weddingDetail?.confirmed_ceremony_at) {
      setGcalMessage('Set a confirmed wedding ceremony time first.')
      return
    }
  } else if (!request?.confirmed_baptism_date) {
    setGcalMessage('Set a confirmed baptism date first.')
    return
  }
  if (request?.google_calendar_event_id) {
    setGcalMessage('A Google Calendar event already exists for this request.')
    return
  }

  try {
    setGcalCreating(true)
    setGcalMessage('')

    const res = await fetch('/api/google/calendar-event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = await res.json().catch(() => ({} as any))
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Create failed (${res.status})`
      setGcalMessage(String(err))
      return
    }

    setGcalMessage('Google Calendar event created.')
    loadRequest()
  } catch (error: any) {
    setGcalMessage(`Create failed: ${error?.message || 'Unknown error'}`)
  } finally {
    setGcalCreating(false)
  }
}

async function updateGoogleCalendarEvent() {
  const rt = String(request?.request_type || 'baptism')
  if (rt === 'funeral') {
    if (!funeralDetail?.confirmed_service_at) {
      setGcalMessage('Set a confirmed funeral service time first.')
      return
    }
  } else if (rt === 'wedding') {
    if (!weddingDetail?.confirmed_ceremony_at) {
      setGcalMessage('Set a confirmed wedding ceremony time first.')
      return
    }
  } else if (!request?.confirmed_baptism_date) {
    setGcalMessage('Set a confirmed baptism date first.')
    return
  }
  if (!request?.google_calendar_event_id) {
    setGcalMessage('No Google Calendar event is linked to this request.')
    return
  }

  try {
    setGcalUpdating(true)
    setGcalMessage('')

    const res = await fetch('/api/google/calendar-event/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: routeId }),
    })

    const payload = await res.json().catch(() => ({} as any))
    if (!res.ok || !payload?.ok) {
      const err = payload?.error || `Update failed (${res.status})`
      setGcalMessage(String(err))
      return
    }

    setGcalMessage('Google Calendar event updated.')
    loadRequest()
  } catch (error: any) {
    setGcalMessage(`Update failed: ${error?.message || 'Unknown error'}`)
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
      setGcalMessage(String(err))
      return
    }

    setGcalMessage('Google Calendar event removed and link cleared.')
    loadRequest()
  } catch (error: any) {
    setGcalMessage(`Delete failed: ${error?.message || 'Unknown error'}`)
  } finally {
    setGcalDeleting(false)
  }
}

  useEffect(() => {
    loadRequest()
  }, [routeId])

  if (loading) {
    return (
      <div
        className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 sm:px-6 py-16"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading request"
      >
        <span
          className="h-9 w-9 shrink-0 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"
          aria-hidden
        />
        <p className="text-sm font-medium text-gray-900">Loading request…</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Request details</h1>
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

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
        Request details
      </h1>
      <div className="space-y-8 sm:space-y-10">
      <RequestHeader
        parishioner={parishioner}
        request={request}
        funeralDetail={funeralDetail}
        weddingDetail={weddingDetail}
        onUpdateStatus={updateRequestStatus}
      />

      <ChecklistSection
        checklistItems={checklistItems}
        onToggleChecklistItem={toggleChecklistItem}
      />

      {isBaptism && (
        <>
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
        </>
      )}

      {isFuneral && (
        <>
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

          <ConfirmedFuneralServiceSection
            confirmedValue={confirmedFuneralService}
            setConfirmedValue={setConfirmedFuneralService}
            confirmedIso={funeralDetail?.confirmed_service_at}
            onSave={saveConfirmedFuneralService}
            onClear={clearConfirmedFuneralService}
            saving={funeralConfirmedSaving}
            message={funeralConfirmedMessage}
          />
        </>
      )}

      {isWedding && (
        <>
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

          <ConfirmedWeddingCeremonySection
            confirmedValue={confirmedWeddingCeremony}
            setConfirmedValue={setConfirmedWeddingCeremony}
            confirmedIso={weddingDetail?.confirmed_ceremony_at}
            onSave={saveConfirmedWeddingCeremony}
            onClear={clearConfirmedWeddingCeremony}
            saving={weddingConfirmedSaving}
            message={weddingConfirmedMessage}
          />
        </>
      )}

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

      <StaffNotesSection
        staffNotes={staffNotes}
        setStaffNotes={setStaffNotes}
        onSaveStaffNotes={saveStaffNotes}
      />

      <AiToolsSection
        aiLoading={aiLoading}
        aiSummary={aiSummary}
        replyDraft={replyDraft}
        copyMessage={copyMessage}
        onGenerateSummary={generateSummary}
        onGenerateReplyDraft={generateReplyDraft}
        onCopyReplyDraft={copyReplyDraft}
      />

      <SendEmailSection
        toEmail={String(parishioner?.email || '')}
        subject={emailSubject}
        setSubject={setEmailSubject}
        body={replyDraft}
        onSend={sendEmail}
        sending={emailSending}
        message={emailMessage}
      />

      <GoogleCalendarSection
        confirmedIso={
          isFuneral
            ? funeralDetail?.confirmed_service_at
            : isWedding
              ? weddingDetail?.confirmed_ceremony_at
              : request?.confirmed_baptism_date
        }
        unconfirmedHint={
          isFuneral
            ? 'Set a confirmed funeral service time first to create or update a calendar event.'
            : isWedding
              ? 'Set a confirmed wedding ceremony time first to create or update a calendar event.'
              : undefined
        }
        eventId={request?.google_calendar_event_id}
        eventLink={request?.google_calendar_event_html_link}
        onCreate={createGoogleCalendarEvent}
        onUpdate={updateGoogleCalendarEvent}
        onDelete={deleteGoogleCalendarEvent}
        creating={gcalCreating}
        updating={gcalUpdating}
        deleting={gcalDeleting}
        message={gcalMessage}
      />
      </div>
    </main>
  )
}