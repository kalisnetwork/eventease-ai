# Modules

One file per functional module. Read the relevant file before implementing or
changing that area.

| # | Module | File |
| --- | --- | --- |
| 1 | Dashboard | [01-dashboard.md](01-dashboard.md) |
| 2 | AI event creation | [02-ai-event-creation.md](02-ai-event-creation.md) |
| 3 | Event management | [03-event-management.md](03-event-management.md) |
| 4 | Budget planner | [04-budget-planner.md](04-budget-planner.md) |
| 5 | Vendor management | [05-vendor-management.md](05-vendor-management.md) |
| 6 | Guest management | [06-guest-management.md](06-guest-management.md) |
| 7 | Tasks and timeline | [07-tasks-timeline.md](07-tasks-timeline.md) |
| 8 | Context-aware AI assistant | [08-ai-assistant.md](08-ai-assistant.md) |
| 9 | Notifications and activity | [09-notifications-activity.md](09-notifications-activity.md) |

## Shared rules across modules

- All data is scoped to the signed-in user; ownership is checked server-side.
- All numbers shown are computed from stored data.
- Nothing consequential happens without explicit user confirmation.
- AI output is a suggestion until the user saves or approves it.
- AI must never claim success that the backend did not confirm.
- Empty, loading, success, and error states are required.
