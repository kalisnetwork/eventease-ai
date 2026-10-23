# 03 — Design system

Clean, modern B2B SaaS. Calm, readable, trustworthy. No decorative gradients or
animation-heavy effects.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| Background | `#F7F8FC` | App canvas |
| Card | `#FFFFFF` | Surfaces |
| Primary | `#2563EB` | Primary actions, links, focus |
| Text (main) | `#0F172A` | Headings, body |
| Text (secondary) | `#64748B` | Labels, metadata |
| Border | `#E2E8F0` | Dividers, inputs |
| Success | `#16A34A` | Confirmed, completed |
| Warning | `#D97706` | Pending, near-limit |
| Error | `#DC2626` | Errors, overruns |

Define these once as CSS variables and map them into Tailwind theme tokens.
Do not scatter hex values through components.

## Typography

- One sans-serif family (system stack acceptable).
- Scale: `12 / 14 / 16 / 20 / 24 / 30 / 36` px.
- Body 16 px base; line height 1.5 for text, 1.2 for headings.
- Max line length ~70 characters for prose.

## Spacing and layout

- 4 px base scale: 4, 8, 12, 16, 24, 32, 48, 64.
- Card padding 20–24 px; page gutters 16 px mobile / 24–32 px desktop.
- Max content width ~1200 px.
- Border radius: 8 px controls, 12 px cards.
- Shadows: subtle single-level elevation only.

## Component inventory

Build once, reuse everywhere:

- `AppShell` — sidebar/nav + header, responsive.
- `Button` — primary, secondary, ghost, danger; loading and disabled states.
- `Input`, `Textarea`, `Select`, `DatePicker`, `CurrencyInput`.
- `FormField` — label, hint, error, required marker.
- `Card`, `SectionHeader`.
- `StatCard` — value, label, trend/detail.
- `Table` — sortable, responsive card fallback on mobile.
- `Badge` / `Status` — with icon **and** text, never colour alone.
- `ProgressBar` — with numeric label.
- `EmptyState` — icon, explanation, primary action.
- `ErrorState` — message, retry where meaningful.
- `Skeleton` / `Spinner`.
- `Modal` / `ConfirmDialog` — focus trap, escape to close.
- `Toast` — success/error feedback tied to real results.
- `Tabs`, `Pagination`.
- `ChatMessage`, `SuggestionCard` (assistant).

## Accessibility requirements

- WCAG AA contrast for text and interactive elements.
- Visible focus ring on every interactive element (never `outline: none`
  without a replacement).
- Full keyboard operation, logical tab order, skip link.
- Labels programmatically associated with inputs; errors linked via
  `aria-describedby` and announced.
- Status conveyed by icon + text + colour.
- Modals trap focus and restore it on close.
- Respect `prefers-reduced-motion`.
- Charts/tables have text alternatives.

## Content and tone

- Plain, direct language. No hype.
- Buttons describe the action ("Save event", not "Submit").
- Confirmations state consequences ("This will delete 3 tasks.").
- AI output is labelled as a suggestion until the user saves it.
- Empty states explain why the screen is empty and what to do next.

## Forbidden

- Fake numbers, fake avatars, fake activity, fake reviews.
- Decorative charts that imply real data.
- Colour-only status.
- Auto-playing motion.
- Unlabelled icon-only buttons.
