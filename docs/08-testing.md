# 08 — Testing

Never report tests as passing unless they were actually executed.

## Tooling

- **Vitest** — unit and API tests.
- **Playwright** — browser/E2E tests.
- Optional: Testing Library for component-level tests.
- A test database or transaction rollback per test.
- AI stubbed through the provider interface for deterministic tests; at least
  one real-provider smoke test is desirable but must not gate the suite.

## Unit tests

### Budget
- Remaining = budget − actual.
- Variance = actual − planned (positive and negative).
- Utilisation with normal, zero, and exceeded budgets.
- Category aggregation and share; largest-category ordering.
- Expense total with no expenses.
- Rounding/display behaviour.

### Guests
- Confirmed count with mixed statuses.
- Plus-one handling.
- Zero guests.
- Catering estimate uses the stated per-person assumption.

### Tasks
- Completion percentage: 0 tasks, some complete, all complete.
- Overdue detection around the current time (injected clock).
- Cancelled tasks excluded from denominator (if that policy is chosen).

### Validation
- Required fields, length limits, positive attendees.
- Invalid dates; end before start.
- Negative and non-finite money values.
- Invalid enum values and status transitions.
- Ownership guard rejects a foreign event id.

### AI response validation
- Valid payload passes and is normalised.
- Missing required field rejected.
- Wrong types rejected.
- Allocation sum mismatch flagged/recomputed.
- Truncated/invalid JSON handled.

## API tests

For each, assert status, response shape, and persisted effect:

- Create event (valid + invalid payload).
- Retrieve own event; retrieve another user's event → 404/403.
- Update event fields and status transitions (valid + invalid).
- Add expense; verify totals endpoint/response.
- Create task; update status; delete task.
- Add/edit/remove guest; verify counts.
- Add vendor; update quotation status.
- Unauthenticated request → 401.
- Malformed JSON / wrong content type → 400, no crash.
- Oversized payload → rejected.
- AI endpoint unavailable → 503 with safe message, CRUD still works.
- Rate limit hit → 429.

## Integration tests

1. Create an event.
2. Its budget and tasks are saved.
3. The dashboard reflects the saved data.
4. Expenses update the remaining budget.
5. AI recommendations use the current event data.
6. Approved changes are persisted.
7. Another user cannot access the event.

## UI / E2E tests (Playwright)

- Sign up → login → logout flow.
- Form validation messages visible and associated with fields.
- Loading skeletons appear; no broken layout.
- Empty states are useful (dashboard, guests, tasks).
- Error message visible when a request fails (route interception).
- Navigation works at mobile and desktop viewports.
- Keyboard-only: complete the create-event form and reach primary actions.
- Confirmation dialog for destructive actions; cancel does nothing.
- AI suggestion requires confirmation; confirming shows the real result.

## Test data policy

- Use factories/fixtures created per test, not production-like dumps.
- Never seed fake data into the production database.
- Clean up after tests; tests must be independent and repeatable.
- Two users at minimum for authorization tests.

## Commands (to be finalised with the implementation)

```bash
pnpm install
pnpm test            # unit + API
pnpm test:coverage
pnpm test:e2e        # Playwright
pnpm lint
pnpm typecheck
```

## Status tracking

Record actual results in [`progress.md`](progress.md). Format:

```
2026-10-23  unit        not written
2026-10-23  api         not written
2026-10-23  e2e         not written
```

Do not write "passing" until the command was run and the output inspected.

## Coverage target

Prioritise correctness of calculations, authorization, and AI validation over a
global percentage. A reasonable goal is high coverage on `lib/calculations` and
`lib/validation`, plus every API route's happy path and auth failure.
