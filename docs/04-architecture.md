# 04 — Architecture

## Guiding principle

Use a **small, maintainable architecture**. One frontend, one backend approach,
one database. No unnecessary services.

## Recommended stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) | Server components for data, route handlers for API |
| Language | TypeScript (strict) | Shared types between server and client |
| UI | React + Tailwind CSS | Accessible primitives, design tokens |
| Validation | Zod | Shared schemas for forms, API input, AI output |
| Database | PostgreSQL | Hosted (e.g. Neon / Supabase / Vercel Postgres) |
| ORM | Drizzle **or** Prisma — pick one | Parameterised queries, migrations |
| Auth | Auth.js (NextAuth) **or** a managed provider | Secure sessions, CSRF-safe |
| AI | Google Gemini API (or equivalent) | Server-side only, structured JSON output |
| Tests | Vitest + Playwright | Unit/API + UI |
| Deploy | Vercel (or similar Node host) | Public URL, env vars in dashboard |

> These are recommendations. Final choices are tracked in
> `15-open-decisions.md` and must be recorded before implementation.

## Request flow

```
Browser (React)
   │  fetch / server action
   ▼
Next.js route handler / server action
   │  1. authenticate session
   │  2. validate input (zod)
   │  3. authorise resource ownership
   │  4. run business logic (pure functions)
   │  5. persist via ORM
   ▼
PostgreSQL

AI path:
route handler → rate limit → build context (authorised query)
             → Gemini API (server-only key) → validate structured output
             → (optional) propose action → user confirms → validated mutation
```

## Security boundaries

- The browser never sees the AI key or database credentials.
- All reads/writes go through server code; no direct DB from the client.
- Ownership checks happen in the data layer for every resource.
- AI tools map to a small allowlist of server functions.

## Folder structure (target)

```
eventease-ai/
├── app/
│   ├── (marketing)/page.tsx          landing
│   ├── (auth)/login, signup
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── events/[id]/
│   │   │   ├── budget/
│   │   │   ├── vendors/
│   │   │   ├── guests/
│   │   │   └── tasks/
│   │   ├── events/new/               AI creation
│   │   ├── assistant/
│   │   └── settings/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── events/
│       ├── expenses/
│       ├── tasks/
│       ├── vendors/
│       ├── guests/
│       ├── notifications/
│       └── ai/
│           ├── plan/
│           └── chat/
├── components/          UI + feature components
├── lib/
│   ├── ai/              client, prompts, schemas, tools
│   ├── auth/            session helpers, guards
│   ├── calculations/    pure functions (budget, guests, tasks)
│   ├── validation/      zod schemas
│   ├── db/              ORM client, queries, migrations helpers
│   └── rate-limit/
├── database/            schema + migrations + seed (no dumps)
├── tests/
│   ├── unit/
│   ├── api/
│   ├── integration/
│   └── e2e/
├── public/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

## Data model

Minimum entities. Add tables only when a real feature needs them.

### User
- `id`, `name`, `email` (unique), `passwordHash` (if not delegated), `createdAt`.

### Event
- `id`, `userId` → User, `title`, `type`, `description`, `location`,
  `startAt`, `endAt`, `attendees`, `totalBudget`, `currency`, `status`,
  `createdAt`, `updatedAt`.

### EventTask
- `id`, `eventId` → Event, `title`, `description`, `dueAt`, `status`,
  `priority`, `category`, `createdAt`, `updatedAt`.

### Expense
- `id`, `eventId` → Event, `category`, `label`, `plannedAmount`,
  `actualAmount`, `isActual`, `incurredAt`, `createdAt`.
- Keep planned vs actual explicit; do not overload one column ambiguously.

### Vendor
- `id`, `eventId` → Event, `name`, `category`, `location`, `quotedPrice`,
  `availability`, `contact`, `notes`, `quotationStatus`, `createdAt`.

### Guest
- `id`, `eventId` → Event, `name`, `email`, `phone`, `group`, `invitationStatus`,
  `rsvpStatus`, `plusOnes`, `notes`, `createdAt`.

### Notification
- `id`, `userId` → User, `eventId` optional, `type`, `title`, `body`,
  `readAt`, `createdAt`.

### AiConversation / AiMessage (only if history is persisted)
- `id`, `userId`, `eventId`, `createdAt`; messages with `role`, `content`,
  `createdAt`.
- Store only what is needed; avoid unnecessary personal data.

### Relationships and ownership

- Event is the ownership root for tasks, expenses, vendors, guests.
- Every query filters by `event.userId = session.user.id`.
- Deleting an event cascades or blocks depending on chosen policy — document it.

## API surface (draft)

All routes authenticated unless noted, all inputs validated, all responses
shaped consistently.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/events` | Create event |
| GET | `/api/events` | List current user's events (paginated) |
| GET | `/api/events/:id` | Event + summary |
| PATCH | `/api/events/:id` | Update fields/status |
| DELETE | `/api/events/:id` | Delete (confirm) |
| POST | `/api/events/:id/expenses` | Add expense |
| PATCH/DELETE | `/api/expenses/:id` | Update/delete expense |
| POST | `/api/events/:id/tasks` | Create task |
| PATCH/DELETE | `/api/tasks/:id` | Update/delete task |
| POST | `/api/events/:id/vendors` | Add vendor |
| PATCH/DELETE | `/api/vendors/:id` | Update/delete vendor |
| POST | `/api/events/:id/guests` | Add guest |
| PATCH/DELETE | `/api/guests/:id` | Update/delete guest |
| GET | `/api/notifications` | Current user's notifications |
| POST | `/api/ai/plan` | Generate/refine plan (rate limited) |
| POST | `/api/ai/chat` | Assistant turn with tools (rate limited) |

## Error contract

```json
{ "error": { "code": "FORBIDDEN", "message": "You do not have access to this event." } }
```

- 400 validation, 401 unauthenticated, 403 forbidden, 404 not found (also used to
  avoid leaking existence), 429 rate limited, 500 unexpected, 503 AI unavailable.
- Never return stack traces, SQL, or secrets.
- Log server-side with correlation IDs, never passwords or tokens.

## Testing seams

- Pure functions in `lib/calculations` for arithmetic.
- Repository/query functions accepting a user id for authorization tests.
- AI client behind an interface so tests can inject fixtures/failures.
