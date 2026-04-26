'use client'

import { useState } from 'react'

export function ScheduleDemoForm({
  secondaryButtonClassName,
}: {
  secondaryButtonClassName: string
}) {
  const [name, setName] = useState('')
  const [parishName, setParishName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatusMessage('')
    if (loading) return

    const n = name.trim()
    const p = parishName.trim()
    const em = email.trim()
    if (!n || !p || !em) {
      setStatusMessage('Please fill in your name, parish name, and email.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          parishName: p,
          email: em,
          roleTitle: role.trim() || undefined,
          message: message.trim() || undefined,
        }),
      })

      const payload = await res.json().catch(() => ({} as any))
      if (!res.ok || !payload?.ok) {
        const err = String(payload?.error || 'Unable to submit demo request.')
        setStatusMessage(err)
        return
      }

      setStatusMessage("Thank you — we’ll reach out shortly to schedule your demo.")
      setName('')
      setParishName('')
      setEmail('')
      setRole('')
      setMessage('')
    } catch (err: any) {
      setStatusMessage(
        err?.message || 'Unable to submit demo request. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="demo-name">
          Name
        </label>
        <input
          id="demo-name"
          name="name"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="demo-parish">
          Parish name
        </label>
        <input
          id="demo-parish"
          name="parishName"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          autoComplete="organization"
          value={parishName}
          onChange={(e) => setParishName(e.target.value)}
        />
      </div>

      <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="demo-email">
          Email
        </label>
        <input
          id="demo-email"
          name="email"
          type="email"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="demo-role">
          Role / title
        </label>
        <input
          id="demo-role"
          name="role"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          placeholder="e.g. Parish secretary, Pastor, OCIA coordinator"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="demo-message">
          Message
        </label>
        <textarea
          id="demo-message"
          name="message"
          className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          placeholder="Anything you'd like us to know (timeline, parish size, current process, etc.)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          We&apos;ll reply by email within 1 business day.
        </p>
        <button
          type="submit"
          disabled={loading}
          className={secondaryButtonClassName}
        >
          {loading ? 'Requesting…' : 'Request demo'}
        </button>
      </div>

      {statusMessage ? (
        <p className="sm:col-span-2 text-sm text-gray-600" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}
    </form>
  )
}

