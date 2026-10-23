# Module 7 — Task and Timeline Management

## Purpose

Turn the plan into concrete, dated work.

## Generated checklist (examples)

- Confirm event requirements.
- Shortlist venues.
- Compare quotations.
- Finalise catering.
- Send invitations.
- Confirm guest attendance.
- Complete final preparations.

Generated tasks are real records only after the plan is saved.

## Capabilities

- Create tasks.
- Assign due dates.
- Update status.
- Edit descriptions.
- Delete tasks.
- View overdue tasks.

## Suggested fields

| Field | Notes |
| --- | --- |
| Title | Required |
| Description | Optional |
| Due date | Valid date; may include time |
| Status | `todo`, `in_progress`, `done`, `cancelled` |
| Priority | `low`, `medium`, `high` |
| Category | Optional (venue, catering, marketing, admin) |
| Order / phase | Optional for timeline grouping |

## Rules

- Dates must be validated (real dates, sensible ranges).
- The system must **not invent confirmed vendor deadlines**. AI may suggest a
  target date, labelled as a suggestion.
- Overdue = incomplete task with due date before now (user's timezone).
- Status changes are validated server-side.
- Deleting a task requires confirmation.
- Timeline groups tasks by phase or date without inventing milestones.

## AI assistance

- Suggest priorities based on event date and unfinished prerequisites.
- Identify scheduling conflicts (e.g. two tasks after the event date, or a
  catering task due after the guest-count deadline).
- Explain conflicts; never silently reschedule.

## Completion percentage

`completed / total × 100`, with zero tasks handled safely (see
`06-business-logic.md`).

## Acceptance

- [ ] Task CRUD works and persists.
- [ ] Overdue tasks are identifiable without relying on colour alone.
- [ ] Invalid dates are rejected with clear errors.
- [ ] AI priority/conflict suggestions are advisory and explained.
- [ ] Completion percentage handles events with no tasks.
