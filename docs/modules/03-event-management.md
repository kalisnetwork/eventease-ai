# Module 3 — Event Management

## Purpose

Own the lifecycle of an event and everything attached to it.

## Capabilities

- Create events (manually or from an AI plan).
- View event details.
- Edit event information.
- Update event status.
- View associated tasks, expenses, guests, and vendors.
- Archive completed events.

## Data ownership

- Every event belongs to exactly one user (owner).
- Every child record belongs to an event, and access is checked through the
  event owner.
- Users must **not** be able to access another user's private event data, even
  by guessing IDs.

## Suggested fields

| Field | Notes |
| --- | --- |
| Title | Required, 1–120 chars |
| Type | Enum or free text (e.g. birthday, wedding, corporate) |
| Description | Optional, plain text |
| Location | Optional initially, required before final plan |
| Start date/time | Required; must be valid and timezone-aware |
| End date/time | Optional; must be ≥ start |
| Expected attendees | Positive integer |
| Total budget | Non-negative decimal |
| Currency | e.g. INR |
| Status | `draft` → `planning` → `confirmed` → `completed` → `archived` |
| Created/updated | Timestamps |

## Status transitions

Allowed transitions are validated server-side. Suggested:

- `draft` → `planning`
- `planning` → `confirmed` | `archived`
- `confirmed` → `completed` | `archived`
- `completed` → `archived`
- `archived` → (read-only; restore optional if implemented)

Disallow arbitrary jumps and report a clear error.

## Archive semantics

- Archived events are read-only by default.
- Removed from active metrics and default lists.
- Data retained; no destructive delete unless the user explicitly deletes.

## Acceptance

- [ ] CRUD works through the UI and API.
- [ ] Status transitions are validated.
- [ ] Child records are visible from event details.
- [ ] Cross-user access returns 404/403, not data.
- [ ] Archiving updates dashboard counts.
