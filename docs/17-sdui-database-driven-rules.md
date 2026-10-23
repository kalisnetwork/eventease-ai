# 17 — Strict SDUI & Database-Driven Development Rules

These rules are **mandatory** for every implementation in `eventease-ai`. 

## Core Rules

| # | Rule | Enforcement |
|---|---|---|
| 1 | **Zero Hardcoding** | Never hardcode dynamic data, dropdown options, form fields, statuses, labels, permissions, or business rules. Fetch them from API responses. |
| 2 | **Database-First** | If anything needs to be added, implement it at the correct database/backend layer and expose it through APIs. Use proper database migrations and seed only legitimate required reference data. Never use mock data, fake records, or hardcoded fallbacks. |
| 3 | **Strict SDUI** | Render forms, tables, dropdowns, filters, validations, and applicable actions using server-provided metadata. The UI must not decide field order, requiredness, options, or allowed actions on its own. |
| 4 | **Safe Initial States** | Initialize dynamic values with appropriate neutral values such as `null`, `0`, `""`, or `[]`. Handle `null`, `undefined`, empty collections, and valid `zero`/`false` values correctly. |
| 5 | **Real Functionality Only** | Every feature must work end-to-end: database → backend → API → frontend → user action → database persistence. Never simulate success or leave non-functional buttons. |
| 6 | **Efficient APIs** | Avoid network waterfalls. Use appropriate bootstrap/batched endpoints, pagination, caching, and server-side filtering. |
| 7 | **Defensive Error Handling** | Validate API responses and metadata. Handle loading, empty, error, and incompatible schema states gracefully without fabricating data. |
| 8 | **Professional Language** | Use simple, clear, professional wording throughout the UI. Avoid hacker-style, cryptic, or unnecessarily technical phrases. Use natural messages such as "Loading data...", "Changes saved successfully", and "No records found." |
| 9 | **Inspect Before Implementing** | Check existing code, database schemas, APIs, and reusable components before adding anything. Reuse existing functionality and avoid duplication. |
| 10 | **Verify Before Completion** | Test real API integration, database persistence, permissions, empty states, and error handling. Report actual test results and clearly identify anything incomplete. |

**Core Rule:** If new data or functionality is needed, implement it properly through the database, backend, and APIs — not through hardcoded values or mock implementations. Keep the solution production-ready, maintainable, secure, and consistent with the existing architecture.

## Implementation Guidelines

### Database
- **Lookups over enums in code**: Put statuses, categories, event types, RSVP states etc into `lookup_*` tables. Only the DB schema should be the source of truth for allowed values.
- **Migrations only**: Every new table/column/function/policy goes through a timestamped migration in `supabase/migrations/`.
- **Legitimate reference data only**: If seeding, it must be strictly required for the system to function (e.g. a system config). Never seed demo events, guests, vendors or expenses.
- **RLS first**: Enable RLS on every new table. Use `owns_event()` or direct `user_id` checks. Never rely on frontend filters alone.
- **Minimal**: Don't create tables "just in case". Add them when a real feature requires them.

### Backend / API
- **Bootstrap endpoint**: Expose a single `GET /api/bootstrap` (or equivalent) that returns user context, permissions, and all SDUI metadata in one batched call to avoid waterfalls.
- **Metadata driven**: Return field schemas (key, label, type, required, options[], validations, visible, disabled, order), table column metadata, filters, and allowed actions from the API.
- **Validation**: Use Zod on every route. Validate against DB constraints where applicable. Never trust client-supplied enums.
- **Ownership & auth**: Authenticate every mutating and protected read. Check resource ownership server-side for every call.
- **Graceful errors**: Return safe, user-friendly errors. Never leak SQL, stack traces, or internal keys.

### Frontend / SDUI
- **Render from metadata**: Forms, selects, radios, tables, badges, and action buttons must be driven by server metadata. 
- **No option arrays in components**: Importing a constant array for dropdowns is considered hardcoding and is not allowed.
- **Neutral defaults**: Use `null`/`[]`/`""` until metadata + data arrive.
- **State coverage**: Implement `loading`, `empty`, `error`, `permission denied`, and `schema mismatch` states.
- **No placeholders as data**: Never show fake numbers, rows, or "sample" entries to fill UI.
- **Accessibility**: Labels from metadata, proper aria attributes, keyboard navigation, and status never conveyed by color alone.

### AI Specific
- **Server only**: Keys stay server-side. Never expose to client.
- **Structured + validated**: Validate every AI response against Zod before using/persisting.
- **Grounded**: Pull context via authorized backend functions only.
- **Confirm before writes**: Any consequential action requires explicit user confirmation.
- **Honest on failure**: If AI is unavailable, show "AI is temporarily unavailable." and keep CRUD fully functional.

## Pre-Implementation Checklist
- [ ] Searched for existing schema/APIs/components that can be reused
- [ ] Identified if new lookup data is required and planned a migration for it
- [ ] Designed API contract before writing UI
- [ ] No hardcoded options/labels/statuses in TS/TSX
- [ ] All dynamic values have safe neutral initial states
- [ ] RLS + ownership considered
- [ ] Loading/empty/error states accounted for

## Pre-Completion Checklist
- [ ] Hit real APIs end-to-end (network tab verified)
- [ ] DB persistence verified with actual inserts/updates
- [ ] Permissions tested (unauth + cross-user)
- [ ] Empty state shown correctly with no fabricated data
- [ ] Error state tested with real failure
- [ ] No console warnings/errors related to missing data
- [ ] Actual test results recorded (unit/integration/manual)
- [ ] Any incomplete item explicitly documented
