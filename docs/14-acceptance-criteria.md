# 14 — Acceptance criteria

The project is ready for submission only when every item is true and verified.

## Product

- [ ] The application addresses the selected challenge vertical.
- [ ] A user can access the application through the deployed URL.
- [ ] The main workflow functions end to end.
- [ ] Application data is persisted.
- [ ] AI responses use relevant user context.
- [ ] AI failures do not break unrelated functionality.
- [ ] The AI service is genuinely integrated (no hardcoded responses).

## Correctness

- [ ] Important decisions and calculations are validated in code.
- [ ] Budget arithmetic is computed by the application, not the model.
- [ ] Calculated values are covered by automated tests.
- [ ] AI structured output is validated before persistence.
- [ ] Missing information is handled with clarification, not invention.

## Security

- [ ] User permissions are enforced on every backend operation.
- [ ] Cross-user access is impossible and tested.
- [ ] Secrets are not committed and not exposed to the browser.
- [ ] Expensive AI endpoints are rate limited.
- [ ] Inputs are validated server-side.

## Quality

- [ ] Automated tests have been executed (results recorded).
- [ ] The UI is responsive and accessible.
- [ ] Loading, empty, success, and error states exist for core screens.
- [ ] The README accurately describes the implementation.
- [ ] No fake data is presented as real.

## Submission

- [ ] No secrets are committed.
- [ ] The public repository is under 10 MB.
- [ ] Exactly one Git branch exists.
- [ ] The deployed application is accessible.
- [ ] The demo video is accessible.
- [ ] Every link in the submission has been opened and checked.

## Sign-off

| Item | Verified by | Date | Evidence |
| --- | --- | --- | --- |
| Deployment URL | | | |
| Test run | | | |
| Cross-user access | | | |
| Demo video | | | |
| Repository size | | | |

Do not mark complete without evidence (command output, screenshot, or URL).
