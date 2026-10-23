# 15 — Open decisions

Answer these before writing implementation code. Record the decision and date.

## 1. Challenge alignment

- **Question:** Does EventEase AI match the official Challenge 5 vertical?
- **Why it matters:** The brief was supplied as a proposal. Building the wrong
  vertical wastes the entire effort.
- **Status:** Unverified.
- **Decision:** _pending_

## 2. Database and ORM

- Options: PostgreSQL + Drizzle; PostgreSQL + Prisma; SQLite + Drizzle (simpler,
  but check host persistence).
- Considerations: managed hosting, migrations, connection pooling on serverless,
  test isolation.
- **Decision:** _pending_

## 3. Authentication

- Options: Auth.js with credentials/OAuth; managed provider (Clerk, Supabase
  Auth); custom with argon2.
- Considerations: evaluation access, email verification blocking evaluators,
  implementation time, security.
- **Decision:** _pending_

## 4. AI provider and model

- Options: Google Gemini (suggested), OpenAI, Anthropic.
- Considerations: available key, structured output support, free tier, latency.
- **Decision:** _pending_

## 5. Deployment target

- Options: Vercel, Cloudflare Workers/Pages, Railway, Render.
- Considerations: Next.js support, Postgres, env management, free tier.
- **Decision:** _pending_

## 6. Currency handling

- **Question:** Single currency (INR) per event, or multi-currency?
- Recommendation: single currency per event, display only; no FX conversion.
- **Decision:** _pending_

## 7. Plus-ones in headcount

- **Question:** Do plus-ones count toward confirmed attendees and catering?
- Recommendation: yes, when `plusOnes > 0` on a confirmed guest; show the split.
- **Decision:** _pending_

## 8. Cancelled-task policy

- **Question:** Exclude `cancelled` from the task denominator?
- Recommendation: exclude.
- **Decision:** _pending_

## 9. Event deletion policy

- Options: cascade delete children; soft delete; block when records exist.
- Recommendation: soft delete/archive by default, hard delete with explicit
  confirmation and cascade.
- **Decision:** _pending_

## 10. Chat history persistence

- **Question:** Persist AI conversations?
- Recommendation: persist only if it adds real value; otherwise keep in session
  state and avoid storing personal data.
- **Decision:** _pending_

## 11. Rate-limit store

- Options: in-memory (single instance only), Upstash Redis, database-backed.
- Recommendation: Upstash if deploying serverless with multiple instances.
- **Decision:** _pending_

## 12. Notifications

- **Question:** Computed on read, or stored rows?
- Recommendation: stored rows for read/unread state; derived content recomputed.
- **Decision:** _pending_

## 13. Evaluation access

- **Question:** How will an evaluator log in without real user data?
- Options: demo account seeded with clearly labelled sample data; one-click demo
  login; open signup.
- **Decision:** _pending_
