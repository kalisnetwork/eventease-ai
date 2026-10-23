'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Sparkles } from 'lucide-react'

export default function NewEventPage() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        title: description.slice(0, 100) || 'New Event',
        event_type: 'other',
        description,
        attendees: 1,
        total_budget: 0,
        currency: 'INR',
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/events/${data.id}`)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Create Event</h1>
        <p className="mt-1 text-sm text-slate-600">Describe your event and let AI help you plan it</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">AI Event Creation</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Describe your event
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., I want to organise a birthday party for 50 people in Mumbai with a budget of ₹30,000 next month."
              />
              <p className="mt-1 text-xs text-slate-500">
                Include event type, number of guests, location, budget, and date if possible.
              </p>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Generate plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
