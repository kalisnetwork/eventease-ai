# 16 — Free hosting and submission path

Goal: a working public URL, real database, and real AI, with **₹0 spent**.

Free-tier limits change. Treat the numbers below as a starting point and check
each provider's current pricing page before relying on it.

## Recommended free stack

| Piece | Free option | Why |
| --- | --- | --- |
| Code hosting | GitHub public repo | Required for submission anyway |
| App hosting | Vercel Hobby | Native Next.js support, free `*.vercel.app` URL, HTTPS |
| Database | Neon free Postgres (or Supabase free) | Real Postgres, no card, serverless-friendly |
| ORM | Drizzle + `@neondatabase/serverless` | Small, SQL-first, works well on serverless |
| Auth | Auth.js (credentials + bcryptjs) | Self-hosted, no paid user limits |
| AI | Google Gemini API free tier (AI Studio key) | No card, structured JSON output |
| Rate limiting | DB-backed counter table | Works across serverless instances, no Redis bill |
| Demo video | YouTube unlisted / Loom free | Link it from the README |
| Domain | `your-app.vercel.app` | Free; a custom domain costs money and is optional |

### What is genuinely free

- Public GitHub repository.
- Vercel Hobby deployment and `*.vercel.app` subdomain.
- Neon/Supabase free database (with auto-suspend and storage limits).
- Gemini free-tier requests (rate-limited).
- Auth.js, Next.js, Tailwind, Drizzle, Vitest, Playwright — all open source.

### What is not free

- Custom domain (roughly ₹800–1,200/year). **Not required** — submit the
  `vercel.app` URL.
- Any paid email/SMS/WhatsApp/push provider. Keep those out of scope.
- Heavy AI usage beyond the free quota. Keep prompts bounded and cache drafts.

## Step-by-step: from folder to public URL

### 1. Build locally

```bash
cd eventease-ai
pnpm create next-app@latest . --ts --tailwind --app --eslint
pnpm add drizzle-orm @neondatabase/serverless zod
pnpm add -D drizzle-kit vitest @playwright/test
```

Then implement in this order (vertical slices, each usable):

1. Auth (signup, login, logout, protected layout).
2. Event CRUD.
3. Tasks.
4. Expenses + budget calculations.
5. Guests.
6. Dashboard from real aggregates.
7. AI planner (`/api/ai/plan`) + save plan.
8. AI assistant (`/api/ai/chat`) + confirmation flow.
9. Vendors + comparison.
10. Notifications.

Do not build screens against mock data first — it creates fake data paths that
are hard to remove later.

### 2. Create the free database

1. Sign up at Neon (or Supabase).
2. Create a project; copy the **pooled** connection string.
3. Put it in `.env` as `DATABASE_URL`.
4. Write the Drizzle schema, then generate and run migrations locally against it.

For Neon on serverless, use the pooler host and the `@neondatabase/serverless`
driver to avoid connection exhaustion.

### 3. Get a free AI key

1. Open Google AI Studio, create an API key (no card required for the free tier).
2. Put it in `.env` as `GEMINI_API_KEY`.
3. Call it **only** from route handlers/server code.
4. Add a per-user daily cap in code; the free tier has request limits and the
   evaluator may click around.

### 4. Push to GitHub

```bash
git add -A
git commit -m "feat: initial EventEase AI implementation"
git push -u origin main
```

Keep exactly one branch: `main`. Do not commit `.env`.

### 5. Deploy on Vercel

1. Import the GitHub repo at vercel.com.
2. Framework preset: Next.js. Build command and output are auto-detected.
3. Add environment variables (Production **and** Preview):
   - `DATABASE_URL`
   - `AUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `AUTH_URL` = your `https://<project>.vercel.app` URL
   - `GEMINI_API_KEY`
4. Deploy.
5. Run migrations against the production database from your machine:

   ```bash
   DATABASE_URL="<production pooled url>" pnpm drizzle-kit migrate
   ```

6. Open the URL and test the full flow.

> Vercel Hobby is intended for personal/non-commercial projects. A hackathon
> submission fits; a paid product does not.

### 6. Seed a demo account (for evaluators)

Create a demo user (e.g. `demo@eventease.test`) with one clearly labelled sample
event so the evaluator does not land on an empty dashboard. Put the credentials
in the README under "Demo access". Never expose a real user's account.

Alternatively, allow open signup with no email verification so evaluators can
create their own account. Do both if time permits.

### 7. Verify before submitting

- Incognito window → open URL → landing loads over HTTPS.
- Sign up / log in / log out.
- Create an event with AI, answer a clarification, save.
- Add an expense → remaining budget changes.
- Add a guest → confirmed count changes.
- Ask the assistant a question → answer uses saved data.
- Approve a suggested action → it persists after reload.
- Second account cannot open the first account's event URL.
- Check the browser network tab: no `GEMINI_API_KEY`, no DB URL.
- Mobile viewport usable.

## Free-tier gotchas to design around

| Gotcha | Mitigation |
| --- | --- |
| DB auto-suspends when idle | First request is slow; show loading states, don't set a 2 s timeout |
| Serverless connection limits | Use pooled connection string + serverless driver |
| In-memory rate limits reset per instance | Store counters in Postgres, or accept best-effort for a demo |
| AI free-tier quota | Cap tokens, limit history, one repair attempt, cache the draft plan |
| AI outage | Feature-flag the AI UI; CRUD must keep working |
| Cold starts | Keep server code lean; avoid heavy imports in route handlers |
| Build minutes | Don't redeploy on every commit while debugging UI; use local dev |
| Free DB storage | No images/uploads; store only structured data |
| Repo size | No build output or video in git; link the video |

## Minimum viable submission (if time runs short)

Prioritise in this order — each item is independently valuable:

1. Auth + per-user isolation.
2. Event CRUD with real persistence.
3. Budget calculations + expenses (tested).
4. Tasks with due dates.
5. AI event plan with clarification + save.
6. Dashboard aggregates.
7. AI assistant grounded in saved data + confirmation.
8. Guests, vendors, notifications.

If something is unfinished, remove the button/screen rather than shipping a
non-functional placeholder, and list it under "Known limitations" in the README.

## Fallback if Vercel is unavailable

- **Cloudflare Pages/Workers** with the OpenNext adapter + D1 or Neon. More
  setup; only switch if needed.
- **Render / Railway free tier** + Neon. Slower cold starts, still works.
- Never fall back to a static export — the app needs server routes and a DB.

## Cost summary

| Item | Cost |
| --- | --- |
| GitHub public repo | ₹0 |
| Vercel Hobby + `vercel.app` URL | ₹0 |
| Neon/Supabase free Postgres | ₹0 |
| Gemini free tier | ₹0 |
| Auth.js / Next.js / Drizzle / tests | ₹0 |
| **Total to submit a working URL** | **₹0** |
