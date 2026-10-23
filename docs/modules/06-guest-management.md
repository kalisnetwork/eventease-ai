# Module 6 — Guest Management

## Purpose

Maintain the guest list and an accurate picture of who is attending.

## Capabilities

- Add guests.
- Edit guest details.
- Remove guests.
- Track invitations.
- Record RSVP status.
- View confirmed, pending, and declined responses.

## Suggested fields

| Field | Notes |
| --- | --- |
| Name | Required |
| Email / phone | Optional; minimise collection |
| Group / side | Optional (family, friends, work) |
| Invitation status | `not_sent`, `sent`, `opened` (only if actually tracked) |
| RSVP status | `pending`, `confirmed`, `declined`, `maybe` |
| Plus-ones | Non-negative integer |
| Notes | Optional |

## Counts

- Confirmed attendees = guests with `confirmed` RSVP (plus approved plus-ones if
  the product counts them — define once and document).
- Pending and declined counts computed the same way.
- No manual editing of aggregate numbers; they are derived.

## AI catering estimate

- May estimate quantities from the **current guest count** and an **explicitly
  defined per-person assumption**.
- Assumptions must be visible and editable.
- Show the formula: `guests × per-person amount = estimate`.
- Label it as an estimate, not a purchase order.

## Privacy and messaging

- Guest information is stored securely and accessible only to authorised users.
- No invitation or message is sent without **explicit user confirmation**.
- If no email/SMS integration exists, do not show "sent" as a delivered state.
  Use "marked as sent" and explain it is manual tracking.

## Actions that change data

- Delete guest → confirmation.
- Bulk status changes → confirmation and a count of affected guests.
- AI-proposed changes → require explicit approval before persisting.

## Acceptance

- [ ] Guests are isolated per event/owner.
- [ ] RSVP counts reflect stored data.
- [ ] Catering estimate shows its assumption and can be edited.
- [ ] No messaging is simulated as delivered.
- [ ] Removal and bulk changes require confirmation.
