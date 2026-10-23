# Kanban card front matter

Quick reference for filling in a card by hand. The authoritative field list and
validation rules are _Front Matter Fields_ and _Schema Validation_ in
`content/specification/technical/index.md`; `pnpm run test:kanban` fails the
build on any deviation.

Full front matter for a kanban card:

```yaml
---
title: 'Short Card Title'
description: 'Limit to 50 characters'
date: '2026-04-29'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Short summary shown on the card.

<!--more-->

Full description, constraints, and assumptions.

# Short Card Title

## Goals

- [ ] a goal

## Acceptance Criteria

- [ ] all tasks are completed
```

Field notes:

- `title`: at most 40 characters; Hugo title-cases the filename into it, so
  rewrite it.
- `description`: one line, 50 characters or less.
- `date`: the creation date, as a plain ISO date.
- `due`: when the task is due for completion. ISO date or `null`.
- `completionDate`: the date on which the task is completed. ISO date or `null`.
- `dependencies`: list of kanban card ids, or `null`.
- `references`: kanban card ids related to this card, or `null`.

All four `params` keys are always present, `null` when unused. A card carries no
other keys: priority, status and kind come from the filename and the stage
folder, and `layout`, `lastmod`, `categories` and `tags` are forbidden.
