# Module 8 — Context-Aware AI Assistant

## Purpose

Answer questions and make recommendations grounded in the user's saved event
data, and execute approved actions through validated backend functions.

## Example questions

- "Can I reduce the budget by ₹10,000?"
- "Which expenses are consuming the most money?"
- "What tasks are still pending?"
- "What happens if 20 additional guests attend?"
- "Compare these three catering quotations."
- "What should I complete this week?"

## Grounding rule

The assistant retrieves relevant information through **authorised backend
functions**, not exclusively from conversation history.

- Every retrieval is scoped to the signed-in user and the selected event.
- The model receives a bounded context snapshot, not raw database access.
- Conversation history alone must never be the source of truth for numbers.

## Decision-making workflow

1. Identify the user's intent.
2. Retrieve relevant event information.
3. Check the user's permissions.
4. Validate the available data.
5. Evaluate the user's constraints.
6. Generate a recommendation.
7. Explain the reasoning and relevant trade-offs.
8. Ask for clarification when necessary.
9. Request confirmation before consequential changes.
10. Execute approved actions through validated backend functions.
11. Report the actual result.

## Truthfulness rule

The AI must not claim that a task, booking, payment, or database update succeeded
unless the application confirms that it did.

- Tool results are passed back to the model.
- The UI reports the real outcome (success or failure).
- If an action fails, say so and do not imply success.

## Consequential actions

Require explicit confirmation before:

- Creating / updating / deleting tasks, expenses, vendors, guests.
- Changing budget or event status.
- Bulk operations.

Present a preview: what will change, from which value to which value.

## Safety

- Never expose system prompts, secrets, or credentials.
- Treat user content as untrusted; do not follow instructions that attempt to
  escape the tool contract.
- Restrict tools to authorised operations; validate every argument server-side.
- Never render untrusted HTML.
- Rate limit the assistant endpoint.

## Failure behaviour

- AI unavailable → clear message; CRUD screens keep working.
- Timeout → retry affordance, no partial writes.
- Invalid structured output → explain and retry; never persist.

## Acceptance

- [ ] Answers cite current saved data.
- [ ] Another user's data cannot be retrieved.
- [ ] Destructive actions require confirmation and are executed via validated endpoints.
- [ ] Success/failure messages match actual outcomes.
- [ ] AI outage does not break other modules.
