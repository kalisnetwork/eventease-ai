'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

const uuid = z.string().uuid()

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')
  return { supabase, user }
}

function failure(error: z.ZodError | { message?: string }): ActionResult {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
    }
  }
  return { ok: false, error: error.message || 'Something went wrong. Please try again.' }
}

function clean<T extends Record<string, unknown>>(input: T) {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === '' || value === undefined) {
      output[key] = null
    } else {
      output[key] = value
    }
  }
  return output
}

function revalidateApp() {
  revalidatePath('/', 'layout')
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const eventInput = z.object({
  id: uuid.optional(),
  title: z.string().trim().min(1, 'Enter an event title').max(120, 'Title is too long'),
  event_type: z.string().trim().min(1, 'Select an event type').max(60),
  description: z.string().trim().max(4000, 'Description is too long').nullish(),
  location: z.string().trim().max(200, 'Location is too long').nullish(),
  start_at: z.string().nullish(),
  end_at: z.string().nullish(),
  attendees: z.coerce.number().int().min(1, 'At least one attendee is required').max(100000),
  total_budget: z.coerce.number().min(0, 'Budget cannot be negative').max(999999999),
  currency: z.string().length(3),
  status: z.string().trim().min(1),
})

export async function saveEvent(values: unknown): Promise<ActionResult> {
  const parsed = eventInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase, user } = await requireUser()
  const { id, ...rest } = parsed.data
  const payload = clean(rest)
  payload.user_id = user.id
  payload.start_at = rest.start_at || null
  payload.end_at = rest.end_at || null
  payload.archived_at = rest.status === 'archived' ? new Date().toISOString() : null

  if (rest.status !== 'archived') {
    delete payload.archived_at
  }

  const query = id
    ? supabase.from('events').update(payload).eq('id', id).select('id').maybeSingle()
    : supabase.from('events').insert(payload).select('id').single()

  const { data, error } = await query
  if (error) return failure(error)

  revalidateApp()
  if (id) revalidatePath(`/events/${id}`)
  return { ok: true, id: data?.id }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  revalidatePath('/dashboard')
  revalidatePath('/events')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

const taskInput = z.object({
  id: uuid.optional(),
  event_id: uuid,
  title: z.string().trim().min(1, 'Enter a task title').max(200, 'Title is too long'),
  description: z.string().trim().max(2000, 'Description is too long').nullish(),
  due_at: z.string().nullish(),
  status: z.string().trim().min(1),
  priority: z.string().trim().min(1),
  category: z.string().trim().max(60).nullish(),
})

export async function saveTask(values: unknown): Promise<ActionResult> {
  const parsed = taskInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { id, ...rest } = parsed.data
  const payload = clean(rest)
  payload.due_at = rest.due_at || null

  const query = id
    ? supabase.from('tasks').update(payload).eq('id', id).select('id').maybeSingle()
    : supabase.from('tasks').insert(payload).select('id').single()

  const { data, error } = await query
  if (error) return failure(error)

  revalidateApp()
  revalidatePath(`/events/${rest.event_id}`)
  return { ok: true, id: data?.id }
}

export async function setTaskStatus(id: string, status: string): Promise<ActionResult> {
  const parsed = z.object({ id: uuid, status: z.string().trim().min(1) }).safeParse({ id, status })
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

const expenseInput = z.object({
  id: uuid.optional(),
  event_id: uuid,
  label: z.string().trim().min(1, 'Enter a label').max(160, 'Label is too long'),
  category: z.string().trim().min(1),
  planned_amount: z.coerce.number().min(0, 'Amount cannot be negative').max(999999999),
  actual_amount: z.coerce.number().min(0, 'Amount cannot be negative').max(999999999),
  incurred_on: z.string().nullish(),
})

export async function saveExpense(values: unknown): Promise<ActionResult> {
  const parsed = expenseInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { id, ...rest } = parsed.data
  const payload = clean(rest)
  payload.incurred_on = rest.incurred_on || null

  const query = id
    ? supabase.from('expenses').update(payload).eq('id', id).select('id').maybeSingle()
    : supabase.from('expenses').insert(payload).select('id').single()

  const { data, error } = await query
  if (error) return failure(error)

  revalidateApp()
  revalidatePath(`/events/${rest.event_id}`)
  return { ok: true, id: data?.id }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Guests
// ---------------------------------------------------------------------------

const guestInput = z.object({
  id: uuid.optional(),
  event_id: uuid,
  name: z.string().trim().min(1, 'Enter a name').max(160, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(254).nullish(),
  phone: z.string().trim().max(40).nullish(),
  guest_group: z.string().trim().max(60).nullish(),
  invitation_status: z.string().trim().min(1),
  rsvp_status: z.string().trim().min(1),
  plus_ones: z.coerce.number().int().min(0).max(20),
  notes: z.string().trim().max(1000).nullish(),
})

export async function saveGuest(values: unknown): Promise<ActionResult> {
  const parsed = guestInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { id, ...rest } = parsed.data
  const payload = clean(rest)

  const query = id
    ? supabase.from('guests').update(payload).eq('id', id).select('id').maybeSingle()
    : supabase.from('guests').insert(payload).select('id').single()

  const { data, error } = await query
  if (error) return failure(error)

  revalidateApp()
  revalidatePath(`/events/${rest.event_id}`)
  return { ok: true, id: data?.id }
}

export async function setGuestRsvp(id: string, status: string): Promise<ActionResult> {
  const parsed = z.object({ id: uuid, status: z.string().trim().min(1) }).safeParse({ id, status })
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('guests').update({ rsvp_status: status }).eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

export async function deleteGuest(id: string): Promise<ActionResult> {
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

const vendorInput = z.object({
  id: uuid.optional(),
  event_id: uuid,
  name: z.string().trim().min(1, 'Enter a vendor name').max(160, 'Name is too long'),
  category: z.string().trim().min(1),
  location: z.string().trim().max(200).nullish(),
  quoted_price: z.union([z.coerce.number().min(0, 'Price cannot be negative').max(999999999), z.null()]).nullish(),
  availability: z.string().trim().min(1),
  contact: z.string().trim().max(300).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  quotation_status: z.string().trim().min(1),
})

export async function saveVendor(values: unknown): Promise<ActionResult> {
  const parsed = vendorInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { id, ...rest } = parsed.data
  const payload = clean(rest)
  payload.quoted_price =
    rest.quoted_price === null || rest.quoted_price === undefined ? null : rest.quoted_price

  const query = id
    ? supabase.from('vendors').update(payload).eq('id', id).select('id').maybeSingle()
    : supabase.from('vendors').insert(payload).select('id').single()

  const { data, error } = await query
  if (error) return failure(error)

  revalidateApp()
  revalidatePath(`/events/${rest.event_id}`)
  return { ok: true, id: data?.id }
}

export async function deleteVendor(id: string): Promise<ActionResult> {
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return failure(parsed.error)

  const { supabase } = await requireUser()
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const profileInput = z.object({
  full_name: z.string().trim().min(1, 'Enter your name').max(120, 'Name is too long'),
})

export async function saveProfile(values: unknown): Promise<ActionResult> {
  const parsed = profileInput.safeParse(values)
  if (!parsed.success) return failure(parsed.error)

  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name: parsed.data.full_name })

  if (error) return failure(error)

  revalidateApp()
  return { ok: true }
}
