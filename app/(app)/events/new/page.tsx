import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups } from '@/lib/data/lookups'
import { EventCreateForm } from '@/components/records/event-create-form'

export default async function NewEventPage() {
  const supabase = await createClient()
  const lookups = await loadLookups(supabase)

  return (
    <div>
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Create event</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add the core details. You can add tasks, budget lines, guests, and vendors next.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <EventCreateForm lookups={lookups} />
        </div>
      </div>
    </div>
  )
}
