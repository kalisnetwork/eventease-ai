import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  CheckSquare,
  DollarSign,
  MapPin,
  Store,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import {
  summarizeBudget,
  summarizeGuests,
  summarizeTasks,
  formatMoney,
  formatDate,
} from '@/lib/calculations/summary'
import {
  DeleteButton,
  EventDialog,
  ExpenseDialog,
  GuestDialog,
  GuestRsvp,
  TaskDialog,
  TaskStatus,
  VendorDialog,
  type EventRecord,
} from '@/components/records/dialogs'

type TaskRow = {
  id: string
  event_id: string
  title: string
  description: string | null
  due_at: string | null
  status: string
  priority: string
  category: string | null
}

type ExpenseRow = {
  id: string
  event_id: string
  label: string
  category: string
  planned_amount: number | string | null
  actual_amount: number | string | null
  incurred_on: string | null
}

type GuestRow = {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  guest_group: string | null
  invitation_status: string
  rsvp_status: string
  plus_ones: number | null
  notes: string | null
}

type VendorRow = {
  id: string
  event_id: string
  name: string
  category: string
  location: string | null
  quoted_price: number | string | null
  availability: string
  contact: string | null
  notes: string | null
  quotation_status: string
}

const priorityStyles: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-800',
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select(
      `id, title, event_type, description, location, start_at, end_at, attendees,
       total_budget, currency, status`
    )
    .eq('id', id)
    .maybeSingle()

  if (!event) notFound()

  const [lookups, tasksResult, expensesResult, guestsResult, vendorsResult] =
    await Promise.all([
      loadLookups(supabase),
      supabase
        .from('tasks')
        .select('id, event_id, title, description, due_at, status, priority, category')
        .eq('event_id', id)
        .order('due_at', { ascending: true, nullsFirst: false }),
      supabase
        .from('expenses')
        .select('id, event_id, label, category, planned_amount, actual_amount, incurred_on')
        .eq('event_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('guests')
        .select(
          'id, event_id, name, email, phone, guest_group, invitation_status, rsvp_status, plus_ones, notes'
        )
        .eq('event_id', id)
        .order('name', { ascending: true }),
      supabase
        .from('vendors')
        .select(
          'id, event_id, name, category, location, quoted_price, availability, contact, notes, quotation_status'
        )
        .eq('event_id', id)
        .order('created_at', { ascending: false }),
    ])

  const tasks = (tasksResult.data ?? []) as TaskRow[]
  const expenses = (expensesResult.data ?? []) as ExpenseRow[]
  const guests = (guestsResult.data ?? []) as GuestRow[]
  const vendors = (vendorsResult.data ?? []) as VendorRow[]

  const budget = summarizeBudget(event.total_budget, expenses)
  const taskSummary = summarizeTasks(tasks)
  const guestSummary = summarizeGuests(guests)
  const currency = event.currency ?? 'INR'
  const eventOptions = [{ value: event.id, label: event.title }]
  const quotedTotal = vendors.reduce(
    (sum, vendor) => sum + Number(vendor.quoted_price ?? 0),
    0
  )

  const summaryCards = [
    {
      label: 'Budget',
      value: formatMoney(budget.budget, currency),
      detail: `${formatMoney(budget.actual, currency)} spent`,
      icon: DollarSign,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Tasks',
      value: `${taskSummary.completed}/${taskSummary.total}`,
      detail:
        taskSummary.overdue > 0
          ? `${taskSummary.overdue} overdue`
          : `${taskSummary.pending} open`,
      icon: CheckSquare,
      tone: taskSummary.overdue > 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Guests',
      value: String(guestSummary.confirmedAttendees),
      detail: `${guestSummary.pending} awaiting RSVP`,
      icon: Users,
      tone: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Vendors',
      value: String(vendors.length),
      detail: `${formatMoney(quotedTotal, currency)} quoted`,
      icon: Store,
      tone: 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div>
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {labelOf(lookups, 'event_status', event.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {labelOf(lookups, 'event_type', event.event_type, 'Event')}
            {event.start_at ? ` · ${formatDate(event.start_at)}` : ''}
            {event.location ? ` · ${event.location}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EventDialog
            lookups={lookups}
            event={event as EventRecord}
            label="Edit event"
            variant="secondary"
            icon="pencil"
          />
          <DeleteButton kind="event" id={event.id} name={event.title} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">{card.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
              </div>
              <div className={`rounded-lg p-2 ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event details */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Event details</h2>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Attendees</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
              <Users className="h-4 w-4 text-slate-400" />
              {event.attendees ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Starts</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formatDate(event.start_at) ?? 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-800">
              <MapPin className="h-4 w-4 text-slate-400" />
              {event.location ?? 'Not set'}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
              {event.description ?? 'No description added yet.'}
            </p>
          </div>
        </div>
      </section>

      {/* Tasks */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Tasks</h2>
            <p className="text-sm text-slate-500">
              {taskSummary.total} total · {taskSummary.overdue} overdue
            </p>
          </div>
          <TaskDialog
            lookups={lookups}
            events={eventOptions}
            eventId={event.id}
            label="Add task"
            variant="secondary"
          />
        </div>
        <div className="p-6">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
              <p className="text-sm text-slate-600">No tasks yet.</p>
              <div className="mt-3 flex justify-center">
                <TaskDialog
                  lookups={lookups}
                  events={eventOptions}
                  eventId={event.id}
                  label="Add the first task"
                />
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <li key={task.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          task.status === 'done'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          priorityStyles[task.priority] ?? priorityStyles.medium
                        }`}
                      >
                        {labelOf(lookups, 'task_priority', task.priority)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {task.due_at ? `Due ${formatDate(task.due_at)}` : 'No due date'}
                      {task.category ? ` · ${task.category}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskStatus
                      id={task.id}
                      value={task.status}
                      options={lookups.task_status ?? []}
                    />
                    <TaskDialog
                      lookups={lookups}
                      events={eventOptions}
                      task={task}
                      label="Edit task"
                      variant="icon"
                      icon="pencil"
                    />
                    <DeleteButton kind="task" id={task.id} name={task.title} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Budget */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Budget & expenses</h2>
            <p className="text-sm text-slate-500">
              {formatMoney(budget.actual, currency)} spent of{' '}
              {formatMoney(budget.budget, currency)}
            </p>
          </div>
          <ExpenseDialog
            lookups={lookups}
            events={eventOptions}
            eventId={event.id}
            label="Add expense"
            variant="secondary"
          />
        </div>
        <div className="p-6">
          <div className="mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                {budget.budget > 0
                  ? `${Math.round(budget.utilisation)}% of budget used`
                  : 'No budget set'}
              </span>
              <span
                className={`font-medium ${
                  budget.remaining < 0 ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {budget.remaining < 0
                  ? `${formatMoney(Math.abs(budget.remaining), currency)} over`
                  : `${formatMoney(budget.remaining, currency)} remaining`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  budget.overrun > 0 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.round(budget.utilisation))}%` }}
              />
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
              <p className="text-sm text-slate-600">No expenses recorded yet.</p>
              <div className="mt-3 flex justify-center">
                <ExpenseDialog
                  lookups={lookups}
                  events={eventOptions}
                  eventId={event.id}
                  label="Add the first expense"
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Label</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 text-right font-medium">Planned</th>
                    <th className="pb-2 pr-4 text-right font-medium">Actual</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{expense.label}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {labelOf(lookups, 'expense_category', expense.category)}
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-600">
                        {formatMoney(expense.planned_amount, currency)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-900">
                        {formatMoney(expense.actual_amount, currency)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {expense.incurred_on ? formatDate(expense.incurred_on) : '—'}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ExpenseDialog
                            lookups={lookups}
                            events={eventOptions}
                            expense={expense}
                            label="Edit expense"
                            variant="icon"
                            icon="pencil"
                          />
                          <DeleteButton kind="expense" id={expense.id} name={expense.label} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Guests */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Guests</h2>
            <p className="text-sm text-slate-500">
              {guestSummary.total} invited · {guestSummary.confirmed} confirmed ·{' '}
              {guestSummary.confirmedAttendees} attending with plus ones
            </p>
          </div>
          <GuestDialog
            lookups={lookups}
            events={eventOptions}
            eventId={event.id}
            label="Add guest"
            variant="secondary"
          />
        </div>
        <div className="p-6">
          {guests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
              <p className="text-sm text-slate-600">No guests added yet.</p>
              <div className="mt-3 flex justify-center">
                <GuestDialog
                  lookups={lookups}
                  events={eventOptions}
                  eventId={event.id}
                  label="Add the first guest"
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Contact</th>
                    <th className="pb-2 pr-4 font-medium">Group</th>
                    <th className="pb-2 pr-4 font-medium">RSVP</th>
                    <th className="pb-2 pr-4 text-right font-medium">Plus ones</th>
                    <th className="pb-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td className="py-3 pr-4 font-medium text-slate-900">{guest.name}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {guest.email ?? guest.phone ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{guest.guest_group ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <GuestRsvp
                          id={guest.id}
                          value={guest.rsvp_status}
                          options={lookups.rsvp_status ?? []}
                        />
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-600">
                        {guest.plus_ones ?? 0}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <GuestDialog
                            lookups={lookups}
                            events={eventOptions}
                            guest={guest}
                            label="Edit guest"
                            variant="icon"
                            icon="pencil"
                          />
                          <DeleteButton kind="guest" id={guest.id} name={guest.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Vendors */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Vendors</h2>
            <p className="text-sm text-slate-500">
              {vendors.length} vendor{vendors.length === 1 ? '' : 's'} ·{' '}
              {formatMoney(quotedTotal, currency)} quoted
            </p>
          </div>
          <VendorDialog
            lookups={lookups}
            events={eventOptions}
            eventId={event.id}
            label="Add vendor"
            variant="secondary"
          />
        </div>
        <div className="p-6">
          {vendors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center">
              <p className="text-sm text-slate-600">No vendors added yet.</p>
              <div className="mt-3 flex justify-center">
                <VendorDialog
                  lookups={lookups}
                  events={eventOptions}
                  eventId={event.id}
                  label="Add the first vendor"
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 text-right font-medium">Quote</th>
                    <th className="pb-2 pr-4 font-medium">Availability</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{vendor.name}</p>
                        {vendor.contact && (
                          <p className="text-xs text-slate-500">{vendor.contact}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {labelOf(lookups, 'vendor_category', vendor.category)}
                      </td>
                      <td className="py-3 pr-4 text-right text-slate-700">
                        {vendor.quoted_price === null
                          ? '—'
                          : formatMoney(vendor.quoted_price, currency)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {labelOf(lookups, 'vendor_availability', vendor.availability)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {labelOf(lookups, 'vendor_quotation_status', vendor.quotation_status)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <VendorDialog
                            lookups={lookups}
                            events={eventOptions}
                            vendor={vendor}
                            label="Edit vendor"
                            variant="icon"
                            icon="pencil"
                          />
                          <DeleteButton kind="vendor" id={vendor.id} name={vendor.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
