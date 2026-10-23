# 01 — Problem and users

## Problem statement

Planning an event involves multiple tasks:

- Defining the event requirements.
- Creating a realistic budget.
- Finding and comparing vendors.
- Scheduling activities.
- Managing guest lists.
- Tracking expenses.
- Handling unexpected changes.
- Making decisions when the original plan is no longer feasible.

People often manage these activities across spreadsheets, messaging
applications, and separate planning tools. Nothing shares context, so a change
to the guest count does not update the budget, and the budget does not inform
the task list.

## Why existing tools fall short

| Approach | Limitation |
| --- | --- |
| Spreadsheets | No guidance, no recommendations, easy to break, no AI context |
| Chatbots | Advice is not connected to the user's stored data and cannot act on it |
| Project management tools | Generic; no event-specific budget or guest logic |
| Vendor marketplaces | Focused on transactions, not on the user's overall constraints |

## Solution

EventEase AI brings these workflows together in one place and uses AI to help
users make better decisions **using their own saved data**.

## Target users

- Individuals planning personal events (birthdays, weddings, anniversaries).
- Event organisers managing several events at once.
- Small event-management businesses.
- People organising corporate meetings and conferences.

## User needs → product response

| Need | Response |
| --- | --- |
| "I don't know where to start" | AI event creation produces a structured, editable plan |
| "I don't know if my budget is realistic" | Budget planner with allocation and overrun analysis |
| "Which vendor should I pick?" | Quotation comparison with explained recommendation |
| "Who has replied?" | Guest list with RSVP status and confirmed count |
| "What should I do next?" | Tasks, due dates, overdue detection, assistant suggestions |
| "My plans changed" | Context-aware assistant that recalculates and asks before changing data |
| "I don't want AI to silently change things" | Explicit confirmation before consequential actions |

## Success looks like

A new user can, without help:

1. Sign up.
2. Describe an event in one sentence.
3. Answer a couple of clarifying questions.
4. Review and save a generated plan (event + budget + tasks).
5. Add expenses and see the remaining budget recalculate.
6. Add guests and see confirmed counts.
7. Add vendors and get an explained comparison.
8. Ask the assistant a question about the saved event and get an answer grounded
   in that data.
9. Approve one suggested change and see it actually persisted.

## Constraints

- Must be deployed publicly and usable by an evaluator.
- Must keep the repository under 10 MB and on a single Git branch.
- Must not require paid external services for the main workflow to function.
- AI outage must degrade gracefully, not break event/expense/guest/task CRUD.
