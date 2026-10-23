import Link from 'next/link'
import { MessageSquare, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEventOptions } from '@/lib/data/events'
import { AssistantChat } from '@/components/records/assistant-chat'

export default async function AssistantPage() {
  const supabase = await createClient()
  const events = await getEventOptions(supabase)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-slate-600">
          Context-aware planning advice based on your real event data.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">Create an event first</h2>
          <p className="mt-1 text-sm text-slate-500">
            The assistant needs an event with tasks, budget, guests, or vendors to give useful
            advice.
          </p>
          <Link
            href="/events/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            Create event
          </Link>
        </div>
      ) : (
        <AssistantChat events={events} />
      )}
    </div>
  )
}
