'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, DollarSign, CheckSquare } from 'lucide-react'

function EventDetail() {
  const params = useParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (params.id) {
      supabase.from('events').select('*').eq('id', params.id).single().then(({ data }) => {
        setEvent(data)
        setLoading(false)
      })
    }
  }, [params.id])

  if (loading) {
    return <div className="text-sm text-slate-600">Loading data...</div>
  }

  if (!event) {
    return <div className="text-sm text-slate-600">No records found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-600 capitalize">{event.event_type} • {event.status}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Guests</p>
              <p className="text-xl font-semibold text-slate-900">{event.attendees}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Budget</p>
              <p className="text-xl font-semibold text-slate-900">₹{Number(event.total_budget).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm text-slate-600">Tasks</p>
              <p className="text-xl font-semibold text-slate-900">0</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-slate-600">Vendors</p>
              <p className="text-xl font-semibold text-slate-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Event Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Description</p>
            <p className="mt-1 text-sm text-slate-600">{event.description || 'No description provided'}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Location</p>
              <p className="mt-1 text-sm text-slate-600">{event.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Currency</p>
              <p className="mt-1 text-sm text-slate-600">{event.currency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-600">Loading data...</div>}>
      <EventDetail />
    </Suspense>
  )
}
