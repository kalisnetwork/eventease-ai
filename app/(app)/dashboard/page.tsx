import Link from 'next/link'
import { Calendar, DollarSign, CheckSquare, Users, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  summarizeBudget,
  summarizeGuests,
  summarizeTasks,
  formatMoney,
  formatDate,
} from '@/lib/calculations/summary'

type EventRow = {
  id: string
  title: string
  event_type: string | null
  status: string
  start_at: string | null
  total_budget: number | string | null
  currency: string | null
  attendees: number | null
  tasks: { status: string | null; due_at: string | null }[]
  expenses: { planned_amount: number | string | null; actual_amount: number | string | null }[]
  guests: { rsvp_status: string | null; plus_ones: number | null }[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(
      `id, title, event_type, status, start_at, total_budget, currency, attendees,
       tasks (status, due_at),
       expenses (planned_amount, actual_amount),
       guests (rsvp_status, plus_ones)`
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Unable to load your dashboard</h1>
        <p className="mt-1 text-sm text-red-700">
          Please refresh the page. If the problem continues, try signing in again.
        </p>
      </div>
    )
  }

  const events = (data ?? []) as EventRow[]
  const activeEvents = events.filter((event) => event.status !== 'archived')

  const totals = events.reduce(
    (acc, event) => {
      const budget = summarizeBudget(event.total_budget, event.expenses ?? [])
      const tasks = summarizeTasks(event.tasks ?? [])
      const guests = summarizeGuests(event.guests ?? [])
      return {
        budget: acc.budget + budget.budget,
        actual: acc.actual + budget.actual,
        remaining: acc.remaining + budget.remaining,
        pendingTasks: acc.pendingTasks + tasks.pending,
        overdueTasks: acc.overdueTasks + tasks.overdue,
        confirmedGuests: acc.confirmedGuests + guests.confirmedAttendees,
      }
    },
    {
      budget: 0,
      actual: 0,
      remaining: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      confirmedGuests: 0,
    }
  )

  const upcoming = activeEvents
    .filter((event) => event.start_at && new Date(event.start_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.start_at as string).getTime() - new Date(b.start_at as string).getTime())
    .slice(0, 3)

  const stats = [
    {
      label: 'Active events',
      value: String(activeEvents.length),
      detail: `${events.length} total`,
      icon: Calendar,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Planned budget',
      value: formatMoney(totals.budget),
      detail: `${formatMoney(totals.actual)} spent`,
      icon: DollarSign,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Remaining budget',
      value: formatMoney(totals.remaining),
      detail: totals.remaining < 0 ? 'Over budget' : 'On track',
      icon: DollarSign,
      tone: totals.remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pending tasks',
      value: String(totals.pendingTasks),
      detail: totals.overdueTasks > 0 ? `${totals.overdueTasks} overdue` : 'Nothing overdue',
      icon: CheckSquare,
      tone: totals.overdueTasks > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            A live summary of your events, budget, and tasks.
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Create event
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p
                  className={`mt-1 text-xs ${
                    stat.detail === 'Over budget' || stat.detail.includes('overdue')
                      ? 'text-amber-700'
                      : 'text-slate-500'
                  }`}
                >
                  {stat.detail}
                </p>
              </div>
              <div className={`rounded-lg p-2 ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Your events</h2>
            <Link href="/events" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="p-6">
            {events.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-sm font-medium text-slate-900">No events yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first event to see your dashboard come to life.
                </p>
                <Link
                  href="/events/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create your first event
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {events.slice(0, 5).map((event) => {
                  const budget = summarizeBudget(event.total_budget, event.expenses ?? [])
                  const tasks = summarizeTasks(event.tasks ?? [])
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.id}`}
                        className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 group-hover:text-blue-700">
                            {event.title}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {event.start_at ? formatDate(event.start_at) : 'Date not set'} ·{' '}
                            {tasks.completed}/{tasks.total} tasks ·{' '}
                            {formatMoney(budget.actual, event.currency ?? 'INR')} spent
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={event.status} />
                          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Upcoming</h2>
          </div>
          <div className="p-6">
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming event dates recorded.</p>
            ) : (
              <ul className="space-y-4">
                {upcoming.map((event) => (
                  <li key={event.id} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100">
                      <span className="text-[10px] font-medium uppercase text-slate-500">
                        {new Date(event.start_at as string).toLocaleString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(event.start_at as string).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="block truncate text-sm font-medium text-slate-900 hover:text-blue-700"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {event.attendees ?? 0} expected guests
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <Users className="h-4 w-4 text-slate-500" />
                Confirmed guests
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totals.confirmedGuests}
              </p>
              <p className="mt-1 text-xs text-slate-500">Across all events</p>
            </div>

            {totals.overdueTasks > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {totals.overdueTasks} task{totals.overdueTasks === 1 ? '' : 's'} overdue
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    planning: 'bg-blue-50 text-blue-700',
    confirmed: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    archived: 'bg-slate-100 text-slate-500',
  }
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}
