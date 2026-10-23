# 07 — Security

Security is part of the core implementation, not a final checklist.

## Threat model (practical)

| Threat | Mitigation |
| --- | --- |
| Cross-user data access (IDOR) | Ownership check on every query/mutation |
| Secret leakage | Server-only env vars; never `NEXT_PUBLIC_` for AI/DB keys |
| Prompt injection via user text | Treat as data, constrain tools, no writes from model |
| AI-driven data corruption | Propose → confirm → validated endpoint |
| Credential stuffing | Rate limit, strong hashing via provider, generic errors |
| Cost abuse of AI endpoints | Per-user and per-IP rate limits, max tokens |
| XSS via notes/descriptions | Escape by default; never `dangerouslySetInnerHTML` on user/AI content |
| SQL injection | ORM / parameterised queries only |
| CSRF | Same-site cookies, framework protections, origin checks on mutations |
| Enumeration | 404 for both missing and unauthorised resources |
| Over-sharing in logs | No passwords, tokens, full guest contact info |

## Authentication

- Use a well-maintained provider (Auth.js or managed service) or a correct
  implementation with hashed passwords (argon2/bcrypt).
- Secure, http-only, same-site cookies; rotation on login where supported.
- Session expiry and logout invalidation.
- Protect all app routes server-side; middleware alone is not sufficient.

## Authorisation

- Resolve the session user on the server for every request.
- Scope every query by user id — preferably in a shared repository helper so it
  cannot be forgotten.
- Verify parent-child ownership: `guest.eventId → event.userId`.
- Return 404 (not 403 with existence hints) for resources the user cannot see
  where enumeration matters.
- Admin roles are out of scope unless truly needed.

## Input validation

- Zod schemas shared between client and server; server validation is mandatory.
- Reject unknown fields or strip them.
- Enforce length limits on all strings, including notes and chat messages.
- Validate enums, IDs, dates, and money.
- Reject oversized payloads.

## AI-specific security

- API key server-side only.
- Never include secrets in prompts.
- Do not expose system prompt on request.
- Tool allowlist; validate arguments; no raw SQL from the model.
- Pass only the minimum context needed (e.g. counts, not full guest contacts).
- Log AI errors without dumping user PII.
- Handle provider 429/5xx without retrying infinitely.

## Rate limiting

- `/api/ai/*`: strict (e.g. 10 requests/minute/user, burst 3).
- Auth endpoints: per-IP + per-account limits.
- General mutations: moderate.
- Implement with a small store appropriate to deployment (Upstash/Redis or an
  in-memory limiter for single-instance; document the choice and its limits).

## Headers and transport

- HTTPS only in production.
- `Content-Security-Policy` (no unsafe-inline where avoidable).
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` restricted.
- Appropriate `Cache-Control: no-store` on authenticated and AI responses.
- Strict CORS: same-origin only unless a real need exists.

## Secrets and repository hygiene

- `.env*` ignored except `.env.example`.
- `.env.example` contains names + placeholders only.
- Rotate any key that was ever committed.
- No database dumps, tokens, or screenshots containing secrets.

## Data minimisation

- Collect guest contact info only if needed for a feature.
- Provide account/data deletion if claimed; otherwise do not claim it.
- Do not log request bodies containing personal data.
- Persist chat history only if it is a real feature; bound retention.

## Error handling

- Centralised error mapper: known errors → safe messages; unknown → 500 generic.
- Log correlation id server-side; never return internals.
- UI shows actionable messages, not stack traces.

## Pre-submission security checklist

- [ ] No secrets in git history (`git log -p | grep -i key` sanity check).
- [ ] `.env` not tracked; `.env.example` has placeholders only.
- [ ] Authenticated routes verified when signed out.
- [ ] Cross-user access tested with two accounts.
- [ ] AI endpoints rate limited and server-only.
- [ ] Security headers present in production.
- [ ] No `dangerouslySetInnerHTML` with user/AI content.
- [ ] Production CORS and cookie settings verified on the deployed URL.
