# 10 — Environment configuration

## Rules

- All required variables are documented here and in `.env.example`.
- `.env.example` contains **names and placeholders only** — no real credentials.
- `.env*` (except `.env.example`) is git-ignored.
- Server-only secrets must never use the `NEXT_PUBLIC_` prefix.
- Include only variables the application actually uses.

## Variables (proposed — update to match the final stack)

| Name | Scope | Required | Purpose | Example placeholder |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | server | yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | server | yes | Session/JWT signing secret | `replace-with-random-32-bytes` |
| `AUTH_URL` | server | prod | Public base URL for auth callbacks | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | server | for AI | Generative AI key | `your-gemini-key` |
| `AI_MODEL` | server | no | Model id override | `gemini-2.0-flash` |
| `RATE_LIMIT_*` | server | optional | Limiter backing store / limits | see deployment |

If a managed auth provider is used, replace the auth variables with that
provider's (e.g. `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).

## Local setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Fill in real values locally. Never commit `.env`.
3. Run migrations and start the dev server (see README once implemented).

## Deployment setup

- Add every required variable to the hosting provider's environment settings.
- Use different secrets per environment (development vs production).
- Set `AUTH_URL` to the production URL so callbacks work.
- Redeploy after changing variables.
- Verify AI calls originate from the server (no key in the browser bundle).
- Rotate any key that was exposed.

## Verification

- [ ] App boots locally with only documented variables.
- [ ] Missing AI key → AI features show a clear unavailable state; CRUD works.
- [ ] Production env matches the documented list.
- [ ] `grep -r "GEMINI_API_KEY" .next/static` returns nothing after build.
