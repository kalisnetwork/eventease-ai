# Module 1 — Dashboard

## Purpose

Give the user a single, accurate snapshot of all their events and what needs
attention next.

## Requirements

Show:

- Total active events.
- Upcoming events.
- Planned budget.
- Actual expenses.
- Remaining budget.
- Pending tasks.
- Important upcoming deadlines.
- Recent planning activity.

## Data rules

- All values come from **actual application data** for the signed-in user.
- The dashboard updates when events, expenses, tasks, or bookings change.
- Do **not** hardcode dashboard numbers.
- Do **not** create fake activity records.
- Recent activity is derived from real records (created/updated events, expenses,
  tasks, guests) with timestamps and human-readable descriptions.

## Empty state

For a new account:

- Explain that no events exist yet.
- Provide a clear primary action: **Create your first event**.
- Show zeroed or hidden metrics rather than misleading sample data.

## Calculations

Reuse the shared calculation module (see `06-business-logic.md`) so the
dashboard cannot drift from the event screens:

- Remaining budget = total planned budget − actual expenses (per event, summed).
- Pending tasks = tasks not completed and not cancelled.
- Upcoming deadline = nearest due date among incomplete tasks and the event date.
- Active events = events with status not `archived` / `completed` (define once).

## States

| State | Behaviour |
| --- | --- |
| Loading | Skeleton cards, no layout shift |
| Empty | First-event call to action |
| Error | Readable message + retry |
| Partial | If one aggregate fails, show the rest and mark the missing card |
| Populated | All metrics + recent activity |

## Acceptance

- [ ] Every number traces to a database query scoped to the current user.
- [ ] Creating an event immediately changes the dashboard.
- [ ] Adding an expense changes actual/remaining budget.
- [ ] New users see a useful empty state.
- [ ] No fabricated activity rows exist in seed or production data.
