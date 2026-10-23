# Module 4 — Intelligent Budget Planner

## Purpose

Keep the event affordable and make trade-offs explicit.

## Requirements

- Define an overall budget per event.
- Track expense categories: venue, catering, decoration, photography,
  entertainment, transportation, other.
- Track planned amounts and actual expenses.
- AI suggests allocations appropriate to the user's stated priorities.

## Overrun analysis (worked example)

A user has a ₹60,000 budget but enters estimated expenses totalling ₹72,000.

The system should:

1. Detect the ₹12,000 budget overrun.
2. Identify the largest expense categories.
3. Ask which requirements are flexible.
4. Suggest possible cost-saving changes.
5. Explain the trade-offs.
6. Recalculate the plan after the user accepts changes.

## Hard rule: arithmetic is application logic

Budget calculations must be performed by application logic, **not trusted to
AI-generated arithmetic**.

- Compute totals, variance, and utilisation in code.
- If AI proposes an allocation, validate that it sums correctly; recompute if not.
- Display only computed values.
- Never modify confirmed bookings or expenses without user approval.

## Calculations

Defined in `06-business-logic.md`:

- Remaining budget
- Budget variance
- Utilisation percentage
- Category totals and share

## UI requirements

- Category breakdown (table + visual with text values).
- Planned vs actual per category, not only a single total.
- Clear overrun callout with amount.
- AI recommendations shown as suggestions with Accept / Dismiss.
- Accepting recalculates and persists through a validated endpoint.

## Acceptance

- [ ] Budget totals are computed in code and covered by tests.
- [ ] Overrun is detected and clearly displayed.
- [ ] AI explains trade-offs without silently editing data.
- [ ] Accepting a change persists it and updates the display.
- [ ] Zero budget is handled safely (no division by zero).
