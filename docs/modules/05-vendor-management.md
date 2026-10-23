# Module 5 — Vendor Management

## Purpose

Let users keep their own vendor shortlist and compare quotations with AI help.

## Honest framing

This is a **user-managed vendor directory**, not a live vendor marketplace.
The application does not discover real vendors, verify availability, or fetch
reviews. Say so in the UI.

## Vendor fields

| Field | Notes |
| --- | --- |
| Vendor name | User-entered |
| Service category | venue, catering, decoration, photography, entertainment, transport, other |
| Location | Optional |
| Quoted price | Non-negative decimal |
| Availability status | `unknown` by default; user may mark verified/available/unavailable |
| Contact information | Optional, user-entered |
| Notes | Free text |
| Quotation status | `requested`, `received`, `shortlisted`, `rejected`, `booked` |

## Comparison

- Comparison table across selected vendors for the same category.
- Show price, what is included, availability (only if the user recorded it), and
  known limitations.
- AI may compare **saved quotations only**.

## AI recommendation rules

- Base the recommendation on saved data: price, service requirements,
  availability information, user preferences, known limitations.
- **Explain the reasoning** and trade-offs.
- Never invent vendors, contact details, prices, reviews, or availability.
- Distinguish "no data recorded" from "unavailable".
- Recommendation is advisory; the user makes the booking decision.

## Explicitly not implemented (state in README/UI)

- Vendor search or discovery.
- Automatic availability checks.
- Verified reviews.
- Booking or payment.

## Acceptance

- [ ] Vendors are user-scoped and event-scoped.
- [ ] Quotations can be added, edited, and compared.
- [ ] AI recommendation cites only saved data and explains reasoning.
- [ ] Missing availability is shown as unknown, not guessed.
- [ ] UI labels the module as a user-managed directory.
