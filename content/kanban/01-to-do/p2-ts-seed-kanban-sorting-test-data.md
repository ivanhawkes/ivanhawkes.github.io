---
title: 'Seed Kanban Sorting Test Data'
description: 'Data to exercise the grid view sort and indicators'
date: '2026-10-24'
author: Ivan Hawkes
params:
    completionDate: 2026-10-25
    due: 2026-10-27
    dependencies: null
    references: ['p2-us-kanban-grid-view']
---

Add card data that exercises every branch of the grid view sort score and its
colour indicators.

<!--more-->

## Seed Kanban Sorting Test Data

The grid view sorts on overdue status and on the priority digit in the card
filename, and colours cards late, urgent and high-priority. The current content
tree exercises none of those branches, so the acceptance criteria in
`p2-us-kanban-grid-view` cannot be verified.

Current state of `content/kanban/`:

- no card has priority `p0`, so the _urgent_ indicator never fires
- one card has priority `p3`; the other 25 are `p2` and score identically, so
  the tie-break rules decide the whole board
- only two cards carry a `due` date (`p1-id-initial-concept`,
  `p1-sp-write-specifications`), both in the future, so no card is ever overdue
  and the _late_ indicator and the +150 score term never fire

## Tasks

- [ ] **Seed** - give a spread of cards past and future `due` dates, covering
      the overdue and not-overdue branches
- [ ] **Seed** - add cards at priority `p0` and `p1` to exercise the _urgent_
      and _high-priority_ indicators
- [ ] **Assert** - add a check that the built `/kanban/grid/` page orders cards
      by score, then by the documented tie-break rules

## Acceptance Criteria

- [ ] Every score term (overdue, priority) and every indicator (late, urgent,
      high-priority) is triggered by at least one seeded card
- [ ] At least one lane contains a score tie, so the tie-break rules are
      exercised
