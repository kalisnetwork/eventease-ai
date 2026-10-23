# 02 — Screens

Eleven screens, consistent design, real data. Every screen must implement
**loading, empty, success, and error** states where applicable.

Navigation stays simple with a clear distinction between:
- **Event management** (dashboard, events, budget, vendors, guests, tasks)
- **AI assistance** (create event with AI, assistant chat, suggestions)
- **Account** (settings)

## 1. Landing page

- Product introduction.
- Key benefits.
- How the assistant works (3–4 steps).
- Example workflow.
- Get started action.

No fake testimonials, logos, or statistics. If sample data is shown, label it
clearly as an example.

## 2. Authentication

- Sign up, login, logout.
- Form validation with clear field-level errors.
- Secure authentication provider or a correctly implemented auth system.
- Rate limiting on credential endpoints.

## 3. Dashboard

- Total active events.
- Upcoming events.
- Planned budget, actual expenses, remaining budget.
- Pending tasks.
- Important upcoming deadlines.
- Recent planning activity.
- Create Event action.
- **Empty state** for a new account with a clear first action.

Every number comes from the database for the signed-in user. No hardcoded
values, no fabricated activity rows.

## 4. Create Event

- Natural-language description field.
- Extracted requirements shown as editable fields.
- Distinguish supplied vs missing information.
- Follow-up questions when essentials are missing.
- Generated structured plan.
- Review and edit before save.
- Saving creates real records and is **not** treated as a confirmed booking.

## 5. Event details

- Event information (type, date, location, attendees, status).
- Current budget summary.
- Task progress.
- Guest summary.
- Vendor summary.
- Actions: edit, archive, delete (with confirmation).

## 6. Budget planner

- Planned budget.
- Actual expenses.
- Remaining amount.
- Category breakdown.
- Add / edit / delete expenses.
- AI recommendations for overruns and reallocation.
- Accepting a suggestion recalculates and persists only after approval.

## 7. Vendor comparison

- Vendor records (name, category, location, quote, availability, contact, notes,
  quotation status).
- Comparison table.
- AI recommendation with reasoning.
- "User-managed vendor directory" label — this is not a live marketplace.

## 8. Guest management

- Guest list with add / edit / remove.
- Invitation status and RSVP status.
- Counts: confirmed, pending, declined.
- AI catering estimate from current guest count using a visible, editable
  per-person assumption.
- No messages are sent without explicit confirmation.

## 9. Tasks and timeline

- Task list with due dates, status, priority.
- Create, edit, complete, delete.
- Overdue highlighting (not by colour alone).
- AI-suggested priorities and scheduling conflicts.
- Date validation; never invent confirmed vendor deadlines.

## 10. AI assistant

- Chat interface.
- Visible event context selector.
- Answers grounded in retrieved, authorised data.
- Recommendations with reasoning and trade-offs.
- Suggested actions requiring confirmation.
- Clear statement of what was actually executed.

## 11. Settings

- User profile.
- Account preferences.
- Data and privacy controls (e.g. delete account / export — only if implemented).
- Logout.

## Cross-screen requirements

| Requirement | Detail |
| --- | --- |
| Responsive | Desktop, tablet, mobile layouts |
| Accessible | Keyboard operable, visible focus, labelled controls, status not by colour alone |
| Honest | Real state only; no placeholder numbers presented as real |
| Resilient | Loading, empty, success, error states; AI outage does not break CRUD |
| Consistent | Shared design tokens and components |
