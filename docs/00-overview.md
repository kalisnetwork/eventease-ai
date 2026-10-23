# 00 — Overview

## Project

**EventEase AI** — an intelligent event-planning assistant.

| Field | Value |
| --- | --- |
| Category | AI-powered planning and decision support |
| Application type | Responsive web application |
| Primary objective | Help users plan events, manage budgets, compare vendors, organise guests, and make context-aware decisions using generative AI |
| Status | Specification complete; implementation not started |

## Primary objective

Build an intelligent event-planning assistant that helps users:

1. Plan events from a natural-language description.
2. Manage budgets and detect overruns.
3. Compare vendor quotations.
4. Organise guest lists and RSVPs.
5. Track tasks and deadlines.
6. Make context-aware decisions with AI.

## What makes it different

The application must be **functional, responsive, secure, and deployable**.

It must **not** be:

- a static website,
- a simple chatbot,
- a clickable mockup with hardcoded numbers,
- a demo where AI arithmetic is trusted.

AI must interact with actual application data, perform useful planning tasks,
and provide recommendations based on the user's event details, budget,
preferences, and constraints.

## Core value proposition

> Describe your event, define your constraints, and let AI help you create,
> manage, and adapt your plan.

## Scope

### In scope

- Authentication with per-user data isolation.
- Event CRUD with archived state.
- AI-assisted event plan generation with clarification questions.
- Budget planner with application-side arithmetic.
- Vendor directory and quotation comparison.
- Guest list and RSVP tracking.
- Tasks, due dates, and overdue detection.
- Context-aware AI assistant with confirmation before side effects.
- In-app notifications derived from real data.

### Out of scope (unless explicitly added later)

- Real vendor marketplace or vendor discovery API.
- Payments.
- Sending email / SMS / WhatsApp / push messages.
- Real-time collaboration.
- Native mobile apps.
- Background workers, queues, or microservices.

## Honesty rules (non-negotiable)

These apply to code, UI copy, the README, and the demo video.

1. Never display invented business data as if it were real.
2. Never claim a booking, payment, message, or database write succeeded unless
   the application confirmed it.
3. Clearly label the vendor module as a **user-managed vendor directory**.
4. Never report tests as passing unless they were actually executed.
5. Never claim deployment succeeded without opening the production URL.
6. Distinguish implemented features from planned features everywhere.

## Warning: verify the challenge brief

This concept is **proposed**. Confirm it matches the official Challenge 5
vertical before implementing. If the official brief requires a different
solution, update the docs in `docs/` first, then the code.
