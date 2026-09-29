---
description: Report the kanban board state
argument-hint: '[bucket]'
---

Report the kanban board state${1:+ for bucket `${1}`}. Read the cards under
`content/kanban/` (or just the requested bucket) and list, per card: ID, title,
status, stage, percent, due, and dependencies. Flag cards that are in-progress
with a past due date, and cards whose status/percent/actualtime values are
inconsistent. Keep the report compact.
