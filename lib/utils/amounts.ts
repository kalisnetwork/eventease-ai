type CurrencyCode = string

const multipliers: Record<string, number> = {
  k: 1_000,
  thousand: 1_000,
  thousands: 1_000,
  lakh: 100_000,
  lakhs: 100_000,
  lac: 100_000,
  lacs: 100_000,
  crore: 10_000_000,
  crores: 10_000_000,
  cr: 10_000_000,
  m: 1_000_000,
  mn: 1_000_000,
  million: 1_000_000,
  b: 1_000_000_000,
  billion: 1_000_000_000,
}

export type ParsedAmount = {
  value: number
  /** True when a bare number was interpreted as thousands (e.g. "50" -> 50,000). */
  assumed: boolean
}

/**
 * Parses a user supplied amount such as "50", "50k", "1 lakh", "1.5 crore",
 * "₹50,000" or "1,20,000" into a plain number.
 */
export function parseAmount(input: string, currency: CurrencyCode = 'INR'): ParsedAmount | null {
  if (!input) return null

  const cleaned = input
    .replace(/[₹$€£]/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  const match = cleaned.match(/(-?\d+(?:\.\d+)?)\s*([a-z]*)/)
  if (!match) return null

  let value = Number(match[1])
  if (!Number.isFinite(value)) return null

  const suffix = match[2]
  const multiplier = suffix ? multipliers[suffix] : undefined

  let assumed = false

  if (multiplier !== undefined) {
    value *= multiplier
  } else if (currency === 'INR' && value > 0 && value < 1000 && !suffix) {
    // Indian shorthand: "50" in a budget context means 50,000.
    value *= 1000
    assumed = true
  }

  if (value < 0) return null
  value = Math.round(value * 100) / 100
  return { value, assumed }
}

export function formatAmount(value: number, currency: CurrencyCode = 'INR'): string {
  try {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(value)
  } catch {
    return `${Math.round(value).toLocaleString('en-IN')} ${currency}`
  }
}

export function formatAmountPlain(value: number, currency: CurrencyCode = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}
