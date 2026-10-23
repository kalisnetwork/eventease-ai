# EventEase AI

**Intelligent event planning assistant** — describe your event, define your constraints, and let AI help you create, manage, and adapt the plan.

> **Status: Planning / scaffolding.** No application code has been implemented yet.
> This repository currently contains the organised specification and decision log.
> Nothing here should be described as working, tested, or deployed until it is.

---

## Start here

The full specification is split into topic files so it stays readable and maintainable.

| If you want to… | Read |
| --- | --- |
| Understand the product in one page | [`docs/00-overview.md`](docs/00-overview.md) |
| Know the problem and target users | [`docs/01-problem-and-users.md`](docs/01-problem-and-users.md) |
| See every feature requirement | [`docs/modules/`](docs/modules/) |
| Build the UI | [`docs/02-screens.md`](docs/02-screens.md), [`docs/03-design-system.md`](docs/03-design-system.md) |
| Build the backend | [`docs/04-architecture.md`](docs/04-architecture.md), [`docs/05-ai-integration.md`](docs/05-ai-integration.md) |
| Implement calculations and validation | [`docs/06-business-logic.md`](docs/06-business-logic.md) |
| Harden the app | [`docs/07-security.md`](docs/07-security.md) |
| Write and run tests | [`docs/08-testing.md`](docs/08-testing.md) |
| Configure env vars | [`docs/10-environment.md`](docs/10-environment.md) |
| Deploy | [`docs/11-deployment.md`](docs/11-deployment.md) |
| Ship it for free (₹0) | [`docs/16-free-hosting.md`](docs/16-free-hosting.md) |
| Track what is left | [`docs/13-development-plan.md`](docs/13-development-plan.md), [`docs/14-acceptance-criteria.md`](docs/14-acceptance-criteria.md) |
| See unresolved choices | [`docs/15-open-decisions.md`](docs/15-open-decisions.md) |
| Resume work in a new session | [`docs/progress.md`](docs/progress.md), [`AGENTS.md`](AGENTS.md) |

## Project at a glance

- **Category:** AI-powered planning and decision support
- **Type:** Responsive web application (Next.js + TypeScript + Tailwind)
- **Core idea:** AI creates and adapts a real plan backed by persisted application data
- **AI:** Real generative AI API, called server-side only, with validated structured output
- **Non-goal:** a static marketing site or a chatbot that only talks

## Important caveat

This concept was supplied as a **proposed** project for a hackathon Challenge 5.
Before implementing, confirm it matches the official Challenge 5 vertical. If the
official brief differs, update these docs first, then the code.

## Documentation map

```
README.md                  ← you are here
AGENTS.md                  ← working rules for AI coding sessions
docs/
  00-overview.md           ← vision, scope, non-goals
  01-problem-and-users.md  ← problem statement, personas, value proposition
  modules/                 ← one file per functional module
  02-screens.md            ← all 11 screens and their states
  03-design-system.md      ← tokens, components, accessibility rules
  04-architecture.md       ← stack, folder layout, data model, API surface
  05-ai-integration.md     ← prompts, structured output, tools, confirmation flow
  06-business-logic.md     ← formulas, validation, status transitions
  07-security.md           ← threat model and security checklist
  08-testing.md            ← unit / API / integration / UI test matrix
  09-performance.md        ← budgets, caching, failure handling
  10-environment.md        ← environment variables
  11-deployment.md         ← deployment requirements and verification
  12-readme-requirements.md← what the final public README must contain
  13-development-plan.md   ← phased delivery plan with checkboxes
  14-acceptance-criteria.md← submission gate
  15-open-decisions.md     ← unresolved questions (answer before building)
  16-free-hosting.md       ← free-tier stack and public URL path
  progress.md              ← current status and session log
```

## License

MIT — see [`LICENSE`](LICENSE).
