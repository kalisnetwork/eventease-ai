# 09 — Performance and efficiency

## Principles

- Ship only what a screen needs.
- Do not call AI for unchanged information.
- Prefer server rendering for data-heavy screens; avoid client waterfalls.
- Keep bundles reasonable; avoid large dependencies for small features.

## Data loading

- Query per screen with explicit `select` fields.
- Aggregate on the server (budget sums, counts) rather than fetching all rows to
  the client.
- Paginate lists beyond ~50 rows (guests, vendors, tasks, activity).
- Use indexes on `eventId`, `userId`, and status/date columns used in filters.

## Caching

- Cache only non-sensitive, non-user-specific data publicly.
- Authenticated responses: `Cache-Control: no-store`.
- Memoise repeated pure calculations within a request.
- Do not cache AI responses containing personal data across users.

## AI efficiency

- Build context snapshots with targeted queries, not full dumps.
- Cap chat history (e.g. 10 turns) and context tokens.
- Set request timeouts (~20 s) and max output tokens.
- Avoid automatic re-planning on every keystroke; trigger explicitly.
- Debounce and deduplicate in-flight requests on the client.
- Show partial/progressive UI where the provider supports streaming; otherwise a
  clear spinner with cancel.

## Failure and rate limits

- Timeouts on all external calls.
- Retry only idempotent reads, with capped exponential backoff.
- Handle 429 with a clear message and a retry affordance.
- Circuit-break AI after repeated failures to protect the rest of the app.
- AI outage must leave CRUD fully usable.

## Frontend

- Avoid unnecessary client components; keep providers small.
- Lazy-load heavy widgets (charts) and below-the-fold sections.
- Use system fonts or one subset webfont.
- Target Lighthouse performance ≥ 90 on the landing page and dashboard where
  feasible, and verify rather than assume.

## Repository size

- No build output, `node_modules`, DB dumps, or large media in git.
- Optimise screenshots; host the demo video externally and link it.
- Total repository < 10 MB.

## What not to add

Do not introduce complex caching layers, queues, microservices, background
workers, or websockets unless an implemented feature genuinely requires them.
