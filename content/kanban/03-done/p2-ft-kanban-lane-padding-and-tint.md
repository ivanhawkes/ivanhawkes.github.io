---
title: 'Kanban Lane Padding And Tint'
description: 'Inset cards in a tinted lane frame on the board'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: '2026-10-26'
    due: null
    dependencies: null
    references: ['p2-us-kanban-grid-view', 'p2-us-fluid-page-layout']
---

A lane frames its cards: padding inside the frame, lane on a tint.

<!--more-->

## Kanban Lane Padding And Tint

The lanes of the board at `/kanban/grid/` and `/kanban/personal/` are a framed
column of cards, and the cards sit inside the frame rather than against it:

- The lane carries the page's muted surface, `bg-muted`, one step off the page
  background and one step below the card's own `bg-card`, so a lane reads as a
  column and not as a strip of the page. The tint is the subtle one: the lane
  lifts a step in the light scheme and a step in the dark, and `print.css`
  already flattens `.bg-muted` to paper.
- The lane is padded with `p-2` and its children are gapped with `gap-2`, so
  every card is inset from the frame on all sides, and the lane heading takes
  the same inset: heading and cards start at one edge.

## Acceptance Criteria

- [x] No card edge touches a lane's border at any width: the lane is padded.
- [x] The lane heading and the cards in the lane share one left edge.
- [x] A lane is distinguishable from the page background and a card from its
      lane, in both schemes, without a saturated colour.
- [x] One lane heading per lane: no heading is duplicated in the markup.
- [x] `pnpm run test` passes, and the print sheet keeps the lanes flat.
