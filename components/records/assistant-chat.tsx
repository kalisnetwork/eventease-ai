'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageSquare, Send, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type EventOption = { value: string; label: string }
type ChatMessage = { role: 'user' | 'assistant'; content: string }

const suggestions = [
  'What should I prioritise next?',
  'Are there any budget risks?',
  'How can I improve RSVP response rates?',
]

export function AssistantChat({ events }: { events: EventOption[] }) {
  const [eventId, setEventId] = useState(events[0]?.value ?? '')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      if (!eventId) return
      setLoadingHistory(true)
      setError(null)
      const supabase = createClient()
      const { data, error: historyError } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(40)

      if (cancelled) return
      if (historyError) {
        setError('Conversation history could not be loaded.')
        setMessages([])
      } else {
        setMessages((data ?? []) as ChatMessage[])
      }
      setLoadingHistory(false)
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [eventId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || loading || !eventId) return

    setInput('')
    setError(null)
    setMessages((current) => [...current, { role: 'user', content: message }])
    setLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, message }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error?.message ?? 'The assistant could not respond.')
        return
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: payload.data.reply },
      ])
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-900">Planning assistant</h2>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Event
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {events.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="h-[26rem] overflow-y-auto px-6 py-5">
        {loadingHistory ? (
          <p className="text-sm text-slate-500">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-blue-500" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              Ask about your selected event
            </p>
            <p className="mt-1 text-sm text-slate-500">
              The assistant uses your real tasks, budget, guests, and vendors as context.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((message, index) => (
              <li
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {message.content}
                </div>
              </li>
            ))}
            {loading && (
              <li className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              </li>
            )}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            send(input)
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send(input)
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Ask about priorities, budget risks, or next steps…"
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
