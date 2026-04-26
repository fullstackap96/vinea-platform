'use client'

import { useState } from 'react'

export function ScheduleDemoForm({
  submitButtonClassName,
}: {
  submitButtonClassName: string
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
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
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

      <div>
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

      <div>
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

      <div>
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

      <div>
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

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className={`${submitButtonClassName} w-full justify-center`}
        >
          {loading ? 'Requesting…' : 'Request demo'}
        </button>
        <p className="text-xs text-gray-500">
          No commitment — just a quick conversation.
        </p>
      </div>

      {statusMessage ? (
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}
    </form>
  )
}

