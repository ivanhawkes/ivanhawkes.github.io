---
title: 'Completion Date Must Match Stage'
description: 'Cards set completionDate before they are done'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
    dependencies: null
    due: null
    references:
        - 'p1-ts-run-the-full-test-suite-in-ci'
---

An open card carries a completion date, and the schema cannot see it.

<!--more-->

## Completion Date Must Match Stage

`content/kanban/01-to-do/p2-us-kanban-personal-view.md` sits in `01-to-do` with
`params.completionDate: 2026-10-30`, a date that has not happened yet. The
technical specification says a card's status is its stage folder and that
completing a card sets `completionDate`, so a non-null completion date outside
`03-done` is a contradiction the board renders as an open card.

The schema at `assets/kanban-card-front-matter.yaml` types the field as
`string | null` with `format: date`, so AJV accepts any date string, and JSON
Schema cannot express "non-null only in the done stage" because the stage is a
file path, not front matter. The validator
`scripts/validate-kanban-front-matter.mjs` already walks the tree, so it knows
each card's stage from the path it is checking: the rule belongs there.

## Goals

- [ ] Reject a non-null `completionDate` on a card in `00-epics`, `01-to-do` or
      `02-in-progress`, including topic sub-folders.
- [ ] Require a non-null `completionDate` on a card in `03-done`.
- [ ] Reject a `completionDate` dated in the future.
- [ ] Report each violation with the file and the reason, in the script's
      existing summary format, and refresh the count the technical specification
      quotes (it says "33 cards validated"; the tree now holds 46).
- [ ] Clear the stale date from `p2-us-kanban-personal-view`.

## Acceptance Criteria

- [ ] `pnpm run test:kanban` fails when a card outside `03-done` carries a
      `completionDate`, and passes when it is `null`.
- [ ] `pnpm run test:kanban` fails when a card in `03-done` has no
      `completionDate`.
- [ ] `pnpm run test:kanban` fails when `completionDate` is later than the day
      the check runs.
- [ ] A card moved to `03-done` without a completion date fails the check.
- [ ] `p2-us-kanban-personal-view` validates clean in `01-to-do`.
- [ ] The rules and the card count are written into _Schema Validation_ in
      `content/specification/technical/index.md`.
