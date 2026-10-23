# 13 — Development plan

Tracks the phased build. Update `progress.md` as work lands.

## Phase 0 — Decisions (current)

- [ ] Confirm this matches the official Challenge 5 vertical.
- [ ] Choose database + ORM.
- [ ] Choose auth approach.
- [ ] Choose AI provider and model.
- [ ] Choose deployment target.
- [ ] Record all answers in `15-open-decisions.md`.

## Phase 1 — Foundation

- [ ] Initialise Next.js + TypeScript (strict) + Tailwind.
- [ ] Configure linting, formatting, typecheck scripts.
- [ ] Implement design tokens and base UI components.
- [ ] Set up the database schema and migrations.
- [ ] Implement authentication (signup, login, logout, session).
- [ ] Protect routes and add ownership helpers.
- [ ] Add `.env.example`, `.gitignore`, README skeleton.
- [ ] Single Git branch established.

## Phase 2 — Core functionality

- [ ] Event CRUD + status transitions + archive.
- [ ] Tasks CRUD, due dates, overdue.
- [ ] Expenses and budget calculations.
- [ ] Vendors CRUD and comparison table.
- [ ] Guests CRUD, RSVP counts.
- [ ] Dashboard aggregates from real data.
- [ ] Notifications/activity from real data.
- [ ] Empty, loading, error states.
- [ ] Responsive layout pass.
- [ ] Unit tests for calculations and validation.

## Phase 3 — AI features

- [ ] Server-side AI client with timeout and error mapping.
- [ ] Structured plan schema + validation.
- [ ] Natural-language extraction and clarification flow.
- [ ] Plan review/edit/save creating real records.
- [ ] Budget analysis and trade-off suggestions.
- [ ] Vendor comparison reasoning from saved data.
- [ ] Context-aware assistant with tool allowlist.
- [ ] Confirmation flow for consequential actions.
- [ ] Rate limiting on AI endpoints.
- [ ] AI outage fallback verified.

## Phase 4 — Testing and security

- [ ] API tests including unauthorized and malformed requests.
- [ ] Integration tests for the end-to-end flow.
- [ ] Playwright tests for main workflows and accessibility basics.
- [ ] Cross-user access tests with two accounts.
- [ ] Security headers and production config.
- [ ] Fix all discovered issues.
- [ ] Record actual test results.

## Phase 5 — Deployment and submission

- [ ] Production database provisioned and migrated.
- [ ] Deploy publicly; verify URL and env vars.
- [ ] Run the full workflow on production.
- [ ] Write the final README per `12-readme-requirements.md`.
- [ ] Screenshots + demo video.
- [ ] Repository cleanup, size check (<10 MB), single branch.
- [ ] Final acceptance pass (`14-acceptance-criteria.md`).

## Sequencing advice

Build vertical slices: auth → event → task → expense → dashboard → AI planner →
assistant. Each slice should be usable and tested before moving on. Do not build
all screens against mock data first; that tends to create fake data paths that
are hard to remove.
