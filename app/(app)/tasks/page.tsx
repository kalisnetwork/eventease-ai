import Link from 'next/link'
import { CheckSquare, CalendarDays, AlertTriangle, ListTodo } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import { getEventOptions } from '@/lib/data/events'
import { summarizeTasks, formatDate } from '@/lib/calculations/summary'
import {
  DeleteButton,
  TaskDialog,
  TaskStatus,
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
  events: { id: string; title: string } | null
}

const priorityStyles: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-800',
}

export default async function TasksPage() {
  const supabase = await createClient()

  const [lookups, eventOptions, result] = await Promise.all([
    loadLookups(supabase),
    getEventOptions(supabase),
    supabase
      .from('tasks')
      .select(
        'id, event_id, title, description, due_at, status, priority, category, events (id, title)'
      )
      .order('due_at', { ascending: true, nullsFirst: false }),
  ])

  const tasks = (result.data ?? []) as unknown as TaskRow[]
  const summary = summarizeTasks(tasks)

  const stats = [
    {
      label: 'Open tasks',
      value: String(summary.pending),
      icon: ListTodo,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed',
      value: String(summary.completed),
      icon: CheckSquare,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Overdue',
      value: String(summary.overdue),
      icon: AlertTriangle,
      tone: summary.overdue > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600',
    },
    {
      label: 'Total',
      value: String(summary.total),
      icon: CalendarDays,
      tone: 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every task across your events, with due dates and status.
          </p>
        </div>
        {eventOptions.length > 0 && (
          <TaskDialog lookups={lookups} events={eventOptions} label="Add task" />
        )}
      </div>

      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Tasks could not be loaded. Please refresh and try again.
        </div>
      ) : eventOptions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <CheckSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">Create an event first</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tasks belong to an event. Create one to start tracking work.
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
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.tone}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">All tasks</h2>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <p className="text-sm text-slate-600">No tasks yet.</p>
                  <div className="mt-3 flex justify-center">
                    <TaskDialog
                      lookups={lookups}
                      events={eventOptions}
                      label="Add the first task"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="pb-2 pr-4 font-medium">Task</th>
                        <th className="pb-2 pr-4 font-medium">Event</th>
                        <th className="pb-2 pr-4 font-medium">Due</th>
                        <th className="pb-2 pr-4 font-medium">Priority</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td className="py-3 pr-4">
                            <p
                              className={`font-medium ${
                                task.status === 'done'
                                  ? 'text-slate-400 line-through'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.category && (
                              <p className="text-xs text-slate-500">{task.category}</p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {task.events ? (
                              <Link
                                href={`/events/${task.events.id}`}
                                className="hover:text-blue-700"
                              >
                                {task.events.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {task.due_at ? formatDate(task.due_at) : '—'}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                priorityStyles[task.priority] ?? priorityStyles.medium
                              }`}
                            >
                              {labelOf(lookups, 'task_priority', task.priority)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <TaskStatus
                              id={task.id}
                              value={task.status}
                              options={lookups.task_status ?? []}
                            />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
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
