# Module 2 — AI Event Creation

## Purpose

Turn a free-text event description into a structured, editable plan that becomes
real application records only when the user saves it.

## Input example

> "I want to organise a birthday party for 80 people in Hyderabad with a budget
> of ₹60,000 next month."

## Extraction

Identify, without inventing:

- Event type.
- Location.
- Expected attendees.
- Budget.
- Preferred date or date range.
- Venue requirements.
- Catering requirements.
- Additional preferences.

## Supplied vs missing

The application must distinguish:

- **Supplied by the user** (quote or point to their text).
- **Inferred** (label as an assumption, editable).
- **Missing** (required before a full plan can be generated).

If essential details are missing, **ask follow-up questions** rather than
silently inventing them.

Examples of essential details: event type, attendee count, budget, date/range,
location. If the user says "next month", resolve to a concrete range and show it
back for confirmation.

## Generated plan contents

1. Event summary.
2. Requirements and constraints.
3. Suggested budget allocation.
4. Planning timeline.
5. Task checklist.
6. Vendor categories to consider.
7. Risks and recommendations.

## Review and edit

- The plan is a draft until saved.
- Every field is editable before save.
- The user can remove generated tasks or budget lines.
- Clearly state: **saving a plan creates records; it is not a confirmed booking.**

## Save behaviour

On save, in one transaction where possible:

- Create the event.
- Create budget lines / expense plan.
- Create tasks with due dates.
- Optionally create vendor categories (not vendors with invented details).

Saving must create **real application records**, visible on dashboard and event
details. Nothing is created before the user confirms.

## Validation of AI output

- Parse into the schema defined in `05-ai-integration.md`.
- Reject or repair malformed output; never persist unvalidated JSON.
- Arithmetic is recomputed by application logic, not trusted from the model.
- Currency and amounts normalised; dates validated.
- Unknown fields dropped.

## States

| State | Behaviour |
| --- | --- |
| Idle | Prompt textarea + examples |
| Extracting | Progress indicator, cancellable |
| Needs clarification | Questions with structured inputs, partial extraction retained |
| Plan ready | Structured plan, editable, Save / Discard |
| AI unavailable | Honest error, manual event creation still available |
| Invalid model output | Explain failure, offer retry, do not save |

## Acceptance

- [ ] Structured, usable output.
- [ ] Missing information handled through clarification.
- [ ] User can edit and save the plan.
- [ ] Saving creates real records.
- [ ] The plan is not treated as a confirmed booking.
- [ ] AI failure does not prevent manual event creation.
