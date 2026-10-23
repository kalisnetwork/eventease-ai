import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import { summarizeBudget, formatMoney, formatDate } from '@/lib/calculations/summary'
import {
  DeleteButton,
  EventDialog,
  type EventRecord,
} from '@/components/records/dialogs'

type EventRow = EventRecord & {
  expenses: { planned_amount: number | string | null; actual_amount: number | string | null }[]
  tasks: { status: string | null }[]
}

export default async function EventsPage() {
  const supabase = await createClient()

  const [{ data, error }, lookups] = await Promise.all([
    supabase
      .from('events')
      .select(
        `id, title, event_type, description, location, start_at, end_at, attendees,
         total_budget, currency, status,
         expenses (planned_amount, actual_amount),
         tasks (status)`
      )
      .order('created_at', { ascending: false }),
    loadLookups(supabase),
  ])

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Unable to load events</h1>
        <p className="mt-1 text-sm text-red-700">Please refresh the page and try again.</p>
      </div>
    )
  }

  const events = (data ?? []) as EventRow[]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and manage all of your events.
          </p>
        </div>
        <EventDialog lookups={lookups} label="New event" />
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">No events yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create your first event to start planning tasks, budget, guests, and vendors.
          </p>
          <div className="mt-4 flex justify-center">
            <EventDialog lookups={lookups} label="Create your first event" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const budget = summarizeBudget(event.total_budget, event.expenses ?? [])
            const completedTasks = (event.tasks ?? []).filter(
              (task) => task.status === 'done'
            ).length
            return (
              <article
                key={event.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/events/${event.id}`}
                      className="block truncate font-semibold text-slate-900 hover:text-blue-700"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {labelOf(lookups, 'event_type', event.event_type, 'Event')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {labelOf(lookups, 'event_status', event.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {event.start_at && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {formatDate(event.start_at)}
                    </p>
                  )}
                  {event.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{event.location}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    {event.attendees ?? 0} expected guests
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(budget.budget, event.currency ?? 'INR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Spent</p>
                    <p
                      className={`text-sm font-semibold ${
                        budget.overrun > 0 ? 'text-red-600' : 'text-slate-900'
                      }`}
                    >
                      {formatMoney(budget.actual, event.currency ?? 'INR')}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {completedTasks} of {(event.tasks ?? []).length} tasks complete
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1">
                    <EventDialog
                      lookups={lookups}
                      event={event}
                      label="Edit"
                      variant="icon"
                      icon="pencil"
                    />
                    <DeleteButton kind="event" id={event.id} name={event.title} />
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Open
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
