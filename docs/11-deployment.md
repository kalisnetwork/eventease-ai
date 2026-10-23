# 11 — Deployment

## Target

A publicly accessible hosting platform with Node.js support (e.g. Vercel) and a
managed PostgreSQL database.

## Pre-deployment

- [ ] Production build succeeds locally (`pnpm build`).
- [ ] Typecheck and lint pass.
- [ ] Migrations are committed and runnable in production.
- [ ] Environment variables documented in `.env.example`.
- [ ] No local-only URLs (`localhost`, `127.0.0.1`) in client code.
- [ ] No secrets in the repository.
- [ ] Repository under 10 MB.
- [ ] Single Git branch.

## Deploy steps (generic)

1. Create the production database; copy its connection string.
2. Push the repository to GitHub.
3. Import the repository into the host.
4. Add environment variables from `docs/10-environment.md`.
5. Run database migrations against production.
6. Deploy.
7. Open the production URL and complete the verification below.

## Production verification

- [ ] Landing page loads over HTTPS.
- [ ] Sign up works; login works; logout works.
- [ ] Database reads/writes persist across reloads and devices.
- [ ] AI calls are made from the server and return real responses.
- [ ] No environment variable or key appears in browser requests/bundle.
- [ ] Create event → save plan → add expense → dashboard updates.
- [ ] AI assistant answers using the saved event.
- [ ] A second account cannot access the first account's event.
- [ ] Error states are handled (simulate AI outage / bad request).
- [ ] Mobile layout usable.
- [ ] No reliance on local seed data that won't exist in production.

## Evaluator access

If login is required, provide an evaluation path that does not compromise real
users' data:

- A seeded demo account with clearly labelled demo content, **or**
- A one-click demo sign-in limited to a sandbox account, **or**
- Self-signup with a documented flow and no email verification blocker.

Do not use another real user's credentials. Do not publish admin credentials.

Document the exact path in the README.

## Demo video

Record after deployment verification:

1. Landing → sign up.
2. Describe an event in natural language.
3. Answer a clarification question.
4. Review/edit/save the plan.
5. Show dashboard updating.
6. Add an expense; show remaining budget change.
7. Add guests; show counts.
8. Compare vendors; show AI reasoning.
9. Ask the assistant a grounded question.
10. Approve one suggested change; show it persisted.

Keep it short and show real interactions, not slides.

## Rollback

- Keep the previous deployment available until verification passes.
- Migrations must be reversible or additive; avoid destructive changes during
  the demo window.

## Honesty

Never state that deployment succeeded until the production URL has been opened
and the workflow above has actually been exercised.
