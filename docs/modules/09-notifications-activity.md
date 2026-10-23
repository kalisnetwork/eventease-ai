# Module 9 — Notifications and Activity

## Purpose

Surface what needs attention, derived from real application data.

## In-app notifications

- Upcoming tasks.
- Overdue tasks.
- Budget overruns.
- Changes to event information.
- Pending RSVPs.

## Data rules

- Notifications are computed from or stored alongside real records.
- No fabricated notifications.
- Read/unread state must persist if implemented.
- Notifications must respect ownership and never leak another user's data.

## Delivery

- In-app only by default.
- External email, SMS, WhatsApp, and push are **optional** and must not be
  simulated as successfully delivered.
- If an external channel is added, show real provider status and document
  required credentials.

## Activity feed

Recent planning activity on the dashboard is generated from real events:

- Event created/updated.
- Expense added.
- Task completed.
- Guest RSVP updated.
- Vendor added.

Each entry needs: actor, action, subject, timestamp. Do not seed fake entries.

## UI

- Bell or panel with unread count.
- Clear empty state ("You're all caught up").
- Grouping by event.
- No colour-only urgency.

## Acceptance

- [ ] Every notification maps to real data.
- [ ] Dismissing/marking read persists (if implemented).
- [ ] Overdue and overrun notices appear when thresholds are crossed.
- [ ] No external delivery is claimed without a real integration.
