# 06 — Business logic

All arithmetic and validation below live in application code (pure functions in
`lib/calculations` and `lib/validation`), never in prompts. Every rule here
should have unit tests.

## Budget

Let:

- `T` = total budget (planned)
- `P` = planned expenses (sum of planned amounts)
- `A` = actual expenses (sum of actual amounts)

Formulas:

```
remainingBudget   = T - A
budgetVariance    = A - P
utilisationPct    = T > 0 ? (A / T) * 100 : 0
overrun           = max(A - T, 0)
```

Rules:

- Zero budget is valid; utilisation is `0` (not `NaN`/`Infinity`).
- Negative amounts are rejected at validation.
- Round money to 2 decimals only at display; store precise decimals.
- If `T = 0` and `A > 0`, show "No budget set" plus the expense total, not an
  infinite percentage.

## Category aggregation

```
categoryTotal(cat) = sum(expenses where category = cat)
categoryShare(cat) = T > 0 ? categoryTotal(cat) / T * 100 : 0
largestCategories  = categories sorted by total desc
```

## Guest count

```
confirmedAttendees = count(guests where rsvpStatus = 'confirmed')
                     + sum(plusOnes of confirmed guests)   // if plus-ones count
pendingCount       = count(guests where rsvpStatus = 'pending')
declinedCount      = count(guests where rsvpStatus = 'declined')
```

Catering estimate:

```
estimatedQuantity = confirmedAttendees * perPersonAssumption
```

- `perPersonAssumption` is explicit, visible, editable, and stored or passed in.
- Never hide the assumption inside the AI response.

## Task progress

```
completionPct = totalTasks > 0
  ? (completedTasks / totalTasks) * 100
  : 0
```

- Completed = status `done`. Decide whether `cancelled` is excluded from the
  denominator and document it (recommended: exclude).
- Overdue = status in (`todo`, `in_progress`) and `dueAt < now`.

## Validation rules

| Field | Rule |
| --- | --- |
| Event title | Required, trimmed, 1–120 chars |
| Event type | Required from allowed set or non-empty string |
| Attendees | Integer > 0, reasonable upper bound (e.g. 100000) |
| Budget / amounts | Finite number ≥ 0, ≤ a sane max, 2 decimals |
| Dates | Valid ISO; end ≥ start; start not absurdly far in the past/future |
| Status | Must be one of allowed enum values |
| Status transitions | Only allowed transitions (see module 3) |
| Email | Valid format when provided |
| Guest/vendor ownership | Resource's event must belong to session user |
| IDs | UUID/valid format; unknown → 404 |
| AI output | Schema validation + semantic checks (sums, ranges, dates) |

## Status transitions

Allowed event transitions:

```
draft      -> planning
planning   -> confirmed | archived
confirmed  -> completed | archived
completed  -> archived
archived   -> (terminal; restore only if implemented)
```

Disallowed transitions return `400 INVALID_TRANSITION` with the current and
requested status.

## Derived vs stored values

- Store: raw amounts, statuses, dates, counts the user enters.
- Derive: totals, remaining, variance, utilisation, confirmed counts, completion
  percentage.
- Never store a derived value that can drift unless it is a deliberate snapshot,
  and if so, document why.

## Edge cases checklist

- [ ] Budget is zero.
- [ ] No expenses.
- [ ] No tasks → completion 0, no division error.
- [ ] No guests → confirmed 0, catering estimate 0.
- [ ] All tasks completed → 100%.
- [ ] Expense exactly equals budget → 100% utilisation, no overrun.
- [ ] Overrun > 0 → callout with exact amount.
- [ ] Event spanning midnight / timezone boundaries.
- [ ] Archived event cannot be edited.
- [ ] Deleted event's children behave per documented policy.
- [ ] Currency mismatch rejected (single currency per event).

## Test coverage expectation

Every formula and validation rule above gets at least one unit test, plus
boundary cases. See `08-testing.md`.
