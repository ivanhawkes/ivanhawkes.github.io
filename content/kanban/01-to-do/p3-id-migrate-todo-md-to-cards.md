---
title: 'Migrate TODO.md Into Kanban Cards'
description: 'TODO.md ideas bypass the card workflow'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
    dependencies: null
    due: null
    references: null
---

TODO.md holds fifteen ideas the board never sees.

<!--more-->

## Migrate TODO.md Into Kanban Cards

The documented workflow tracks work as a card in `content/kanban/01-to-do/`, and
the specification documents render live views of those cards. `TODO.md` at the
repository root sits outside both: fifteen unchecked ideas, plus the "Issues",
"Planning" and "Decisions" prose, none of which appears on the board or in any
specification table. The ideation table in `summary.md` selects `id` cards, and
the only one it finds, `p1-id-initial-concept`, is done.

Two of the entries are already this month's work in disguise — a "hard stop"
before the scaffolder is built and copied to the home folder, and loose
time-tracking on cards — so they are cards, not ideas. The rest split by nature:
`id` for open-ended ideas such as the monthly content-tightening skill, `is` for
defects, `ft` for features, `ts` for test work.

## Goals

- [ ] Turn every actionable entry into a card of the kind that fits it, created
      with `hugo new content --kind <kind>` and named `p<priority>-<prefix>`.
- [ ] Move the open questions ("should I make it an issue tracker", "can AI
      write a good description") to `id` cards at a low priority.
- [ ] Leave the methodology prose that belongs in a document — the ADR
      decisions, the top-level document that indexes every document — in
      `content/specification/`, where it is a document and not a task.
- [ ] Point `TODO.md` at the board, or remove the file once it is empty.

## Acceptance Criteria

- [ ] No actionable entry remains in `TODO.md`.
- [ ] Every migrated entry validates against
      `assets/kanban-card-front-matter.yaml` and shows on the board.
- [ ] The `summary.md` tables list the migrated cards under their own kinds, and
      the kinds left empty stay empty on purpose.
- [ ] Nothing is dropped: each `TODO.md` line is either a card, a specification
      section, or explicitly abandoned in a note.
- [ ] `pnpm run test:kanban` passes.
