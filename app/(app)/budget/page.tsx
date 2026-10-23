import Link from 'next/link'
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import { getEventOptions } from '@/lib/data/events'
import { summarizeBudget, formatMoney, formatDate } from '@/lib/calculations/summary'
import { DeleteButton, ExpenseDialog } from '@/components/records/dialogs'

type ExpenseRow = {
  id: string
  event_id: string
  label: string
  category: string
  planned_amount: number | string | null
  actual_amount: number | string | null
  incurred_on: string | null
  events: { id: string; title: string; currency: string | null } | null
}

export default async function BudgetPage() {
  const supabase = await createClient()

  const [lookups, eventOptions, expensesResult, eventsResult] = await Promise.all([
    loadLookups(supabase),
    getEventOptions(supabase),
    supabase
      .from('expenses')
      .select(
        'id, event_id, label, category, planned_amount, actual_amount, incurred_on, events (id, title, currency)'
      )
      .order('created_at', { ascending: false }),
    supabase.from('events').select('id, title, total_budget, currency'),
  ])

  const expenses = (expensesResult.data ?? []) as unknown as ExpenseRow[]
  const events = eventsResult.data ?? []
  const currency = (expenses[0]?.events?.currency ?? events[0]?.currency ?? 'INR') as string

  const totals = events.reduce(
    (acc, event) => {
      const summary = summarizeBudget(
        event.total_budget,
        expenses.filter((expense) => expense.event_id === event.id)
      )
      return {
        budget: acc.budget + summary.budget,
        planned: acc.planned + summary.planned,
        actual: acc.actual + summary.actual,
      }
    },
    { budget: 0, planned: 0, actual: 0 }
  )

  const remaining = totals.budget - totals.actual

  const stats = [
    {
      label: 'Total budget',
      value: formatMoney(totals.budget, currency),
      icon: Wallet,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Planned spend',
      value: formatMoney(totals.planned, currency),
      icon: TrendingUp,
      tone: 'bg-slate-100 text-slate-600',
    },
    {
      label: 'Actual spend',
      value: formatMoney(totals.actual, currency),
      icon: DollarSign,
      tone: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Remaining',
      value: formatMoney(remaining, currency),
      icon: TrendingDown,
      tone: remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Budget</h1>
          <p className="mt-1 text-sm text-slate-600">
            Planned versus actual spending across every event.
          </p>
        </div>
        {eventOptions.length > 0 && (
          <ExpenseDialog lookups={lookups} events={eventOptions} label="Add expense" />
        )}
      </div>

      {expensesResult.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Budget data could not be loaded. Please refresh and try again.
        </div>
      ) : eventOptions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Wallet className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">Create an event first</h2>
          <p className="mt-1 text-sm text-slate-500">
            Expenses belong to an event. Create one to start tracking your budget.
          </p>
          <Link
            href="/events/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create event
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.tone}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {remaining < 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              You are {formatMoney(Math.abs(remaining), currency)} over your combined event
              budgets. Review your largest expenses or adjust the event budgets.
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Expenses</h2>
            </div>
            <div className="p-6">
              {expenses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <p className="text-sm text-slate-600">No expenses recorded yet.</p>
                  <div className="mt-3 flex justify-center">
                    <ExpenseDialog
                      lookups={lookups}
                      events={eventOptions}
                      label="Add the first expense"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="pb-2 pr-4 font-medium">Expense</th>
                        <th className="pb-2 pr-4 font-medium">Event</th>
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
                          <td className="py-3 pr-4 font-medium text-slate-900">
                            {expense.label}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {expense.events ? (
                              <Link
                                href={`/events/${expense.events.id}`}
                                className="hover:text-blue-700"
                              >
                                {expense.events.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
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
                              <DeleteButton
                                kind="expense"
                                id={expense.id}
                                name={expense.label}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
