import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { jsonError, jsonOk } from '@/lib/utils/api'
import { parseAmount, formatAmount, formatAmountPlain } from '@/lib/utils/amounts'
import { summarizeBudget, summarizeGuests, summarizeTasks } from '@/lib/calculations/summary'

type Body = { eventId?: string; message?: string }

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Authentication required', 401, 'UNAUTHENTICATED')
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return jsonError('Invalid request body', 400, 'INVALID_BODY')
  }

  const message = body.message?.trim() ?? ''
  const eventId = body.eventId ?? ''

  if (!eventId) {
    return jsonError('Select an event first', 422, 'EVENT_REQUIRED')
  }
  if (!message || message.length > 2000) {
    return jsonError('Message must be between 1 and 2000 characters', 422, 'INVALID_MESSAGE')
  }

  const { data: quotaOk, error: quotaError } = await supabase.rpc('consume_ai_quota', {
    max_requests: 20,
    window_seconds: 60,
  })

  if (quotaError) {
    return jsonError('Unable to verify usage limits', 500, 'QUOTA_ERROR')
  }
  if (!quotaOk) {
    return jsonError(
      'Too many assistant requests. Please wait a minute and try again.',
      429,
      'RATE_LIMITED'
    )
  }

  // Budget update detection: "update budget to 50", "set budget to 50k", "make budget 1 lakh"
  const budgetRegex = /(?:update|set|change|make)\s+(?:the\s+)?(?:total\s+)?budget\s+(?:to|as|at|of)\s+(.+)/i
  const budgetMatch = message.match(budgetRegex)

  let budgetUpdated = false
  let updatedBudgetAmount: number | null = null
  let budgetUpdatedMessage = ''

  if (budgetMatch) {
    const raw = budgetMatch[1]
      .replace(/[₹$€£]/g, '')
      .replace(/,/g, '')
      .replace(/\s+(rupees?|dollars?|INR|USD|EUR|GBP)$/i, '')
      .trim()

    const parsed = parseAmount(raw)

    if (parsed) {
      const { data: eventForCurrency } = await supabase
        .from('events')
        .select('id, title, currency')
        .eq('id', eventId)
        .maybeSingle()

      const currency = eventForCurrency?.currency ?? 'INR'
      const { error: updateErr } = await supabase
        .from('events')
        .update({ total_budget: parsed.value })
        .eq('id', eventId)

      if (!updateErr) {
        budgetUpdated = true
        updatedBudgetAmount = parsed.value
        const display = formatAmountPlain(parsed.value, currency)
        budgetUpdatedMessage = `Your budget has been updated to ${parsed.assumed ? `${formatAmountPlain(parsed.value * 1000, currency)} (you said "${raw}" — I treated this as ${parsed.value})` : display} ${currency}.`
      }
    }
  }

  const { data: event } = await supabase
    .from('events')
    .select(
      `id, title, event_type, description, location, start_at, end_at, attendees,
       total_budget, currency, status,
       tasks (title, status, priority, due_at, category),
       expenses (label, category, planned_amount, actual_amount),
       guests (rsvp_status, plus_ones),
       vendors (name, category, quoted_price, quotation_status, availability)`
    )
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    return jsonError('Event not found', 404, 'EVENT_NOT_FOUND')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return jsonError(
      'The AI assistant is not configured on this deployment.',
      503,
      'AI_NOT_CONFIGURED'
    )
  }

  const { data: history } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(12)

  const budget = summarizeBudget(event.total_budget, event.expenses ?? [])
  const tasks = summarizeTasks(event.tasks ?? [])
  const guests = summarizeGuests(event.guests ?? [])

  const currency = event.currency ?? 'INR'

  const context = {
    event: {
      title: event.title,
      type: event.event_type,
      status: event.status,
      location: event.location,
      startAt: event.start_at,
      endAt: event.end_at,
      attendees: event.attendees,
      description: event.description,
      currency: event.currency,
    },
    budget: {
      total: budget.budget,
      planned: budget.planned,
      actual: budget.actual,
      remaining: budget.remaining,
      overrun: budget.overrun,
      currency: event.currency,
      display: formatAmount(budget.budget, currency),
      remainingDisplay: formatAmount(budget.remaining, currency),
      actualDisplay: formatAmount(budget.actual, currency),
    },
    tasks: {
      total: tasks.total,
      completed: tasks.completed,
      pending: tasks.pending,
      overdue: tasks.overdue,
      items: (event.tasks ?? []).slice(0, 25),
    },
    guests: {
      total: guests.total,
      confirmed: guests.confirmed,
      confirmedAttendees: guests.confirmedAttendees,
      pending: guests.pending,
      declined: guests.declined,
    },
    vendors: (event.vendors ?? []).slice(0, 25),
    justUpdatedBudget: budgetUpdated,
    updatedBudgetAmount,
  }

  const budgetUpdateNote = budgetUpdated
    ? `
BUDGET UPDATE CONFIRMED: You just changed the total budget to ${formatAmount(updatedBudgetAmount ?? budget.budget, currency)}. Confirm this clearly at the start of your reply.`
    : ''

  const systemInstruction = `You are the EventEase AI event-planning assistant.

CORE RULES:
- Use ONLY the supplied event data for facts. Never invent budget figures, vendors, guests, or dates.
- If information is missing, say what is missing and give a concrete next step.
- Be concise, practical, and specific. Prioritise risks such as budget overruns, overdue tasks, and unanswered RSVPs.
- Format with short paragraphs and hyphen bullet points. Do NOT use tables, HTML, or markdown code blocks.
- Keep replies plain text. Do not use bold, italics, or markdown formatting.

NUMBER & CURRENCY RULES (CRITICAL):
- Currency is ${currency}. Format all amounts using Indian comma separators when currency is INR (e.g. 50,000; 1,00,000; 1,00,00,000).
- When the user says "50" for a budget in an Indian context without units, interpret it as 50,000. "50k" means 50,000. "1 lakh" means 1,00,000. "1 crore" means 1,00,00,000.
- Never say "50 INR" when they mean fifty thousand.
- If budget was just updated (justUpdatedBudget=true), explicitly confirm the new amount in correct format at the start.

BEHAVIOR:
- The current date and time is ${new Date().toISOString()}.
- If the user asks to change budget/guests/location/dates/status and it's feasible, confirm the update clearly.
- Keep responses actionable.

EVENT DATA:
${JSON.stringify(context)}

${budgetUpdateNote}`

  const contents = [...(history ?? [])]
    .reverse()
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    }))
  contents.push({ role: 'user', parts: [{ text: message }] })

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    })

    const reply = response.text?.trim()
    if (!reply) {
      return jsonError('The assistant returned an empty response', 502, 'EMPTY_REPLY')
    }

    // Strip any markdown formatting just in case the model slipped
    const cleanReply = reply
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`([^`]+)`/g, '$1')

    await supabase.from('ai_messages').insert([
      { user_id: user.id, event_id: eventId, role: 'user', content: message },
      { user_id: user.id, event_id: eventId, role: 'assistant', content: cleanReply.slice(0, 8000) },
    ])

    return jsonOk({ reply: cleanReply })
  } catch (error) {
    console.error('assistant_error', error)
    return jsonError(
      'The assistant could not respond right now. Please try again.',
      502,
      'AI_ERROR'
    )
  }
}
