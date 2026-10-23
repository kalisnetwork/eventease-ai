# AGENTS.md — working rules for this repository

This file helps any future coding session (human or AI) resume safely.

## Read first

1. `docs/progress.md` — current status and next actions.
2. `docs/15-open-decisions.md` — unresolved choices.
3. `docs/00-overview.md` and the relevant file in `docs/modules/`.
4. `docs/17-sdui-database-driven-rules.md` — **MANDATORY** SDUI & DB-first rules for every change.

## Ground rules

1. **Inspect before changing.** Read existing files before editing; never
   overwrite unrelated work.
2. **Incremental delivery.** Build one vertical slice at a time, keep the app
   runnable.
3. **TypeScript, strict.** Maintain clear module boundaries.
4. **No fake data.** Do not hardcode business data, dashboard numbers, or AI
   responses. No seed data that looks like real user activity.
5. **No fake success.** Never claim a write, booking, payment, message, test, or
   deployment succeeded unless verified.
6. **Real AI only.** The AI integration must call a real provider server-side.
   Stubs are permitted only in tests.
7. **Arithmetic in code.** Budget and count calculations live in
   `lib/calculations`, not prompts.
8. **Validate everything.** Client hints are not security. Validate on the
   server; validate AI output before use.
9. **Ownership checks.** Every data access is scoped to the session user.
10. **Secrets stay out.** Server-only env vars, no keys in the client bundle, no
    `.env` in git.
11. **States matter.** Loading, empty, success, error for every core screen.
12. **Tests are evidence.** Run them; record actual results in
    `docs/progress.md`. Never write "passing" without a run.
13. **One branch.** Keep all work on a single Git branch.
14. **Size limit.** Repository under 10 MB; no build output, dumps, or large
    media.
15. **Document decisions.** Update `15-open-decisions.md` and `progress.md` as
    you go.
16. **Honesty in docs.** Keep "implemented" vs "planned" clearly separated.

## Conventions to establish with the implementation

- `lib/calculations/` — pure functions, no I/O, heavily tested.
- `lib/validation/` — zod schemas shared by forms and routes.
- `lib/db/` — queries that always take a `userId` or verified session.
- `lib/ai/` — provider client, prompts, schemas, tool definitions; server-only.
- Route handlers — authenticate → validate → authorize → execute → shape errors.
- Components — accessible by default; tokens from the design system, no stray
  hex values.

## Definition of done for a feature

- Works through the UI with real persistence.
- Loading, empty, error, success states.
- Server-side validation and authorization.
- Relevant tests written and actually run.
- Docs updated if behaviour or decisions changed.
- No secrets, no fake data, no unverified claims.

## Commands

Document real commands here once the project is initialised. Until then, do not
invent them.
