'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { DynamicForm, type Field, type FieldOption } from '@/components/ui/dynamic-form'
import {
  deleteEvent,
  deleteExpense,
  deleteGuest,
  deleteTask,
  deleteVendor,
  saveEvent,
  saveExpense,
  saveGuest,
  saveTask,
  saveVendor,
  setGuestRsvp,
  setTaskStatus,
  type ActionResult,
} from '@/lib/actions'

export type LookupMap = Record<string, FieldOption[]>
type EventOption = { value: string; label: string }

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
const iconButton =
  'rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700'

function toLocalDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function toDateOnly(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export type EventRecord = {
  id: string
  title: string
  event_type: string | null
  description: string | null
  location: string | null
  start_at: string | null
  end_at: string | null
  attendees: number | null
  total_budget: number | string | null
  currency: string | null
  status: string
}

export function EventDialog({
  lookups,
  event,
  label = 'New event',
  variant = 'primary',
  icon = 'plus',
}: {
  lookups: LookupMap
  event?: EventRecord
  label?: string
  variant?: 'primary' | 'secondary' | 'icon'
  icon?: 'plus' | 'pencil'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fields: Field[] = [
    { name: 'title', label: 'Event title', required: true, placeholder: 'e.g. Riya and Arjun wedding', full: true },
    {
      name: 'event_type',
      label: 'Event type',
      type: 'select',
      required: true,
      options: lookups.event_type ?? [],
      defaultValue: event?.event_type ?? '',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: lookups.event_status ?? [],
      defaultValue: event?.status ?? 'draft',
    },
    {
      name: 'attendees',
      label: 'Expected attendees',
      type: 'number',
      required: true,
      min: 1,
      max: 100000,
      defaultValue: event?.attendees ?? 1,
    },
    {
      name: 'total_budget',
      label: 'Total budget',
      type: 'number',
      required: true,
      min: 0,
      step: '0.01',
      defaultValue: Number(event?.total_budget ?? 0),
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      options: lookups.currency ?? [],
      defaultValue: event?.currency ?? 'INR',
    },
    {
      name: 'location',
      label: 'Location',
      placeholder: 'Venue or city',
      defaultValue: event?.location ?? '',
    },
    {
      name: 'start_at',
      label: 'Starts',
      type: 'datetime-local',
      defaultValue: toLocalDateTime(event?.start_at),
    },
    {
      name: 'end_at',
      label: 'Ends',
      type: 'datetime-local',
      defaultValue: toLocalDateTime(event?.end_at),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Goals, theme, constraints, must-haves…',
      defaultValue: event?.description ?? '',
      full: true,
    },
  ]

  const trigger =
    variant === 'icon' ? (
      <button type="button" aria-label={label} title={label} className={iconButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    ) : (
      <button type="button" className={variant === 'primary' ? primaryButton : secondaryButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label}
      </button>
    )

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={event ? 'Edit event' : 'Create event'}
          description={
            event ? 'Update the event details below.' : 'Add the core details for your event.'
          }
          wide
        >
          <DynamicForm
            fields={fields}
            action={saveEvent}
            submitLabel={event ? 'Save changes' : 'Create event'}
            onCancel={() => setOpen(false)}
            onSuccess={(result) => {
              setOpen(false)
              if (!event && result.id) {
                router.push(`/events/${result.id}`)
              } else {
                router.refresh()
              }
            }}
          />
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Delete button
// ---------------------------------------------------------------------------

type EntityKind = 'event' | 'task' | 'expense' | 'guest' | 'vendor'

const deleteActions: Record<
  EntityKind,
  (id: string) => Promise<ActionResult>
> = {
  event: deleteEvent,
  task: deleteTask,
  expense: deleteExpense,
  guest: deleteGuest,
  vendor: deleteVendor,
}

export function DeleteButton({
  kind,
  id,
  name,
}: {
  kind: EntityKind
  id: string
  name: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete “${name}”? This cannot be undone.`
    )
    if (!confirmed) return

    setBusy(true)
    setError(null)
    const result = await deleteActions[kind](id)
    setBusy(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    if (kind === 'event') {
      router.push('/events')
    }
    router.refresh()
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        title={`Delete ${name}`}
        aria-label={`Delete ${name}`}
        className={`${iconButton} hover:text-red-600 disabled:opacity-50`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

export type TaskRecord = {
  id: string
  event_id: string
  title: string
  description: string | null
  due_at: string | null
  status: string
  priority: string
  category: string | null
}

export function TaskDialog({
  lookups,
  events,
  task,
  eventId,
  label = 'Add task',
  variant = 'primary',
  icon = 'plus',
}: {
  lookups: LookupMap
  events: EventOption[]
  task?: TaskRecord
  eventId?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'icon'
  icon?: 'plus' | 'pencil'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'event_id',
      label: 'Event',
      type: 'select',
      required: true,
      options: events,
      defaultValue: task?.event_id ?? eventId ?? '',
      full: true,
    },
    { name: 'title', label: 'Task title', required: true, placeholder: 'Book the venue', full: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: lookups.task_status ?? [],
      defaultValue: task?.status ?? 'todo',
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: lookups.task_priority ?? [],
      defaultValue: task?.priority ?? 'medium',
    },
    {
      name: 'due_at',
      label: 'Due',
      type: 'datetime-local',
      defaultValue: toLocalDateTime(task?.due_at),
    },
    {
      name: 'category',
      label: 'Category',
      placeholder: 'e.g. Logistics',
      defaultValue: task?.category ?? '',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      defaultValue: task?.description ?? '',
      full: true,
    },
  ]

  const trigger =
    variant === 'icon' ? (
      <button type="button" aria-label={label} title={label} className={iconButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    ) : (
      <button type="button" className={variant === 'primary' ? primaryButton : secondaryButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label}
      </button>
    )

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={task ? 'Edit task' : 'Add task'}
          description="Track what needs to happen and when."
          wide
        >
          <DynamicForm
            fields={fields}
            action={saveTask}
            submitLabel={task ? 'Save changes' : 'Add task'}
            onCancel={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </Modal>
      )}
    </>
  )
}

export function TaskStatus({
  id,
  value,
  options,
}: {
  id: string
  value: string
  options: FieldOption[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [next, setNext] = useState(value)

  const handleChange = async (status: string) => {
    const previous = next
    setNext(status)
    setBusy(true)
    const result = await setTaskStatus(id, status)
    setBusy(false)
    if (!result.ok) {
      setNext(previous)
      window.alert(result.error)
      return
    }
    router.refresh()
  }

  return (
    <select
      value={next}
      disabled={busy}
      onChange={(event) => handleChange(event.target.value)}
      aria-label="Task status"
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Expense
// ---------------------------------------------------------------------------

export type ExpenseRecord = {
  id: string
  event_id: string
  label: string
  category: string
  planned_amount: number | string | null
  actual_amount: number | string | null
  incurred_on: string | null
}

export function ExpenseDialog({
  lookups,
  events,
  expense,
  eventId,
  label = 'Add expense',
  variant = 'primary',
  icon = 'plus',
}: {
  lookups: LookupMap
  events: EventOption[]
  expense?: ExpenseRecord
  eventId?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'icon'
  icon?: 'plus' | 'pencil'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'event_id',
      label: 'Event',
      type: 'select',
      required: true,
      options: events,
      defaultValue: expense?.event_id ?? eventId ?? '',
      full: true,
    },
    { name: 'label', label: 'Expense label', required: true, placeholder: 'Venue deposit' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: lookups.expense_category ?? [],
      defaultValue: expense?.category ?? '',
    },
    {
      name: 'planned_amount',
      label: 'Planned amount',
      type: 'number',
      min: 0,
      step: '0.01',
      required: true,
      defaultValue: Number(expense?.planned_amount ?? 0),
    },
    {
      name: 'actual_amount',
      label: 'Actual amount',
      type: 'number',
      min: 0,
      step: '0.01',
      required: true,
      defaultValue: Number(expense?.actual_amount ?? 0),
    },
    {
      name: 'incurred_on',
      label: 'Incurred on',
      type: 'date',
      defaultValue: toDateOnly(expense?.incurred_on),
    },
  ]

  const trigger =
    variant === 'icon' ? (
      <button type="button" aria-label={label} title={label} className={iconButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    ) : (
      <button type="button" className={variant === 'primary' ? primaryButton : secondaryButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label}
      </button>
    )

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={expense ? 'Edit expense' : 'Add expense'}
          description="Planned and actual amounts are tracked separately."
          wide
        >
          <DynamicForm
            fields={fields}
            action={saveExpense}
            submitLabel={expense ? 'Save changes' : 'Add expense'}
            onCancel={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Guest
// ---------------------------------------------------------------------------

export type GuestRecord = {
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

export function GuestDialog({
  lookups,
  events,
  guest,
  eventId,
  label = 'Add guest',
  variant = 'primary',
  icon = 'plus',
}: {
  lookups: LookupMap
  events: EventOption[]
  guest?: GuestRecord
  eventId?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'icon'
  icon?: 'plus' | 'pencil'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'event_id',
      label: 'Event',
      type: 'select',
      required: true,
      options: events,
      defaultValue: guest?.event_id ?? eventId ?? '',
      full: true,
    },
    { name: 'name', label: 'Guest name', required: true, defaultValue: guest?.name ?? '' },
    { name: 'email', label: 'Email', type: 'email', defaultValue: guest?.email ?? '' },
    { name: 'phone', label: 'Phone', type: 'tel', defaultValue: guest?.phone ?? '' },
    {
      name: 'guest_group',
      label: 'Group',
      placeholder: 'e.g. Family, colleagues',
      defaultValue: guest?.guest_group ?? '',
    },
    {
      name: 'rsvp_status',
      label: 'RSVP status',
      type: 'select',
      required: true,
      options: lookups.rsvp_status ?? [],
      defaultValue: guest?.rsvp_status ?? 'pending',
    },
    {
      name: 'invitation_status',
      label: 'Invitation',
      type: 'select',
      required: true,
      options: lookups.invitation_status ?? [],
      defaultValue: guest?.invitation_status ?? 'not_sent',
    },
    {
      name: 'plus_ones',
      label: 'Plus ones',
      type: 'number',
      min: 0,
      max: 20,
      required: true,
      defaultValue: guest?.plus_ones ?? 0,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      defaultValue: guest?.notes ?? '',
      full: true,
    },
  ]

  const trigger =
    variant === 'icon' ? (
      <button type="button" aria-label={label} title={label} className={iconButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    ) : (
      <button type="button" className={variant === 'primary' ? primaryButton : secondaryButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label}
      </button>
    )

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={guest ? 'Edit guest' : 'Add guest'}
          description="Keep RSVP information accurate for accurate headcounts."
          wide
        >
          <DynamicForm
            fields={fields}
            action={saveGuest}
            submitLabel={guest ? 'Save changes' : 'Add guest'}
            onCancel={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </Modal>
      )}
    </>
  )
}

export function GuestRsvp({
  id,
  value,
  options,
}: {
  id: string
  value: string
  options: FieldOption[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [next, setNext] = useState(value)

  const handleChange = async (status: string) => {
    const previous = next
    setNext(status)
    setBusy(true)
    const result = await setGuestRsvp(id, status)
    setBusy(false)
    if (!result.ok) {
      setNext(previous)
      window.alert(result.error)
      return
    }
    router.refresh()
  }

  return (
    <select
      value={next}
      disabled={busy}
      onChange={(event) => handleChange(event.target.value)}
      aria-label="RSVP status"
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Vendor
// ---------------------------------------------------------------------------

export type VendorRecord = {
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

export function VendorDialog({
  lookups,
  events,
  vendor,
  eventId,
  label = 'Add vendor',
  variant = 'primary',
  icon = 'plus',
}: {
  lookups: LookupMap
  events: EventOption[]
  vendor?: VendorRecord
  eventId?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'icon'
  icon?: 'plus' | 'pencil'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'event_id',
      label: 'Event',
      type: 'select',
      required: true,
      options: events,
      defaultValue: vendor?.event_id ?? eventId ?? '',
      full: true,
    },
    { name: 'name', label: 'Vendor name', required: true, defaultValue: vendor?.name ?? '' },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: lookups.vendor_category ?? [],
      defaultValue: vendor?.category ?? '',
    },
    {
      name: 'quotation_status',
      label: 'Quotation status',
      type: 'select',
      required: true,
      options: lookups.vendor_quotation_status ?? [],
      defaultValue: vendor?.quotation_status ?? 'requested',
    },
    {
      name: 'availability',
      label: 'Availability',
      type: 'select',
      required: true,
      options: lookups.vendor_availability ?? [],
      defaultValue: vendor?.availability ?? 'unknown',
    },
    {
      name: 'quoted_price',
      label: 'Quoted price',
      type: 'number',
      min: 0,
      step: '0.01',
      defaultValue: vendor?.quoted_price ?? '',
      help: 'Leave blank if no quote has been received.',
    },
    {
      name: 'location',
      label: 'Location',
      placeholder: 'City or service area',
      defaultValue: vendor?.location ?? '',
    },
    {
      name: 'contact',
      label: 'Contact',
      placeholder: 'Phone, email, or contact person',
      defaultValue: vendor?.contact ?? '',
      full: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      defaultValue: vendor?.notes ?? '',
      full: true,
    },
  ]

  const trigger =
    variant === 'icon' ? (
      <button type="button" aria-label={label} title={label} className={iconButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    ) : (
      <button type="button" className={variant === 'primary' ? primaryButton : secondaryButton}>
        {icon === 'pencil' ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label}
      </button>
    )

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>
      {open && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={vendor ? 'Edit vendor' : 'Add vendor'}
          description="This is your own vendor directory, not a marketplace."
          wide
        >
          <DynamicForm
            fields={fields}
            action={saveVendor}
            submitLabel={vendor ? 'Save changes' : 'Add vendor'}
            onCancel={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </Modal>
      )}
    </>
  )
}
