type Money = number | string | null | undefined

export type ExpenseRow = {
  planned_amount?: Money
  actual_amount?: Money
}

export type TaskRow = {
  status?: string | null
  due_at?: string | null
}

export type GuestRow = {
  rsvp_status?: string | null
  plus_ones?: number | null
}

function toNumber(value: Money): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function summarizeBudget(totalBudget: Money, expenses: ExpenseRow[]) {
  const budget = toNumber(totalBudget)
  const planned = expenses.reduce((sum, item) => sum + toNumber(item.planned_amount), 0)
  const actual = expenses.reduce((sum, item) => sum + toNumber(item.actual_amount), 0)
  const remaining = budget - actual
  const variance = actual - planned
  const utilisation = budget > 0 ? (actual / budget) * 100 : 0
  const overrun = Math.max(actual - budget, 0)

  return { budget, planned, actual, remaining, variance, utilisation, overrun }
}

export function summarizeTasks(tasks: TaskRow[], now: number = Date.now()) {
  const active = tasks.filter((task) => task.status !== 'cancelled')
  const total = active.length
  const completed = active.filter((task) => task.status === 'done').length
  const pending = total - completed
  const overdue = active.filter(
    (task) =>
      task.status !== 'done' &&
      Boolean(task.due_at) &&
      new Date(task.due_at as string).getTime() < now
  ).length
  const completion = total > 0 ? (completed / total) * 100 : 0

  return { total, completed, pending, overdue, completion }
}

export function summarizeGuests(guests: GuestRow[]) {
  const confirmed = guests.filter((guest) => guest.rsvp_status === 'confirmed')
  const declined = guests.filter((guest) => guest.rsvp_status === 'declined').length
  const pending = guests.filter((guest) => guest.rsvp_status === 'pending').length
  const maybe = guests.filter((guest) => guest.rsvp_status === 'maybe').length
  const confirmedAttendees = confirmed.reduce(
    (sum, guest) => sum + 1 + toNumber(guest.plus_ones),
    0
  )

  return {
    total: guests.length,
    confirmed: confirmed.length,
    confirmedAttendees,
    declined,
    pending,
    maybe,
  }
}

export function formatMoney(value: Money, currency = 'INR') {
  const amount = toNumber(value)
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return amount.toFixed(0)
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
