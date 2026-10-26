---
title: 'Fluid Page Layout'
description: 'Prose at 65ch, cards across a fluid panel'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: '2026-10-26'
    due: null
    dependencies: null
    references:
        [
            'p3-us-footer-matches-the-header',
            'p2-is-hero-images-use-the-prose-measure',
        ]
---

The page follows the width of the screen: prose at 65ch, cards across the panel.

<!--more-->

## Fluid Page Layout

The page is one fluid, centred column, and the top and bottom bars keep the
presentation they have.

- `main` is the panel: it fills the viewport, keeps the bar's `--page-gutter`
  inside itself, and caps at the bar's column, the `--page-column` of
  `tokens.css` that `.header-inner` and `.footer-inner` already cap at, so its
  left edge is the brand's and the copyright's at every width.
- The prose is capped at `--prose-measure`, the `65ch` token carries, narrows
  with any screen narrower than that, and is centred in the panel.
- The furniture read with the prose shares that column and centres with it: the
  `.measure` class on the breadcrumb trail, the `byline`, `next-prev`,
  `next-prev-small` and `related`, the hero of `images.css`, and the `copyright`
  chip of the foot.
- The Kanban board is set in the panel: `.panel` takes the whole width `main`
  offers and none of the measure, and `.kanban-board` lays the lanes out as
  `repeat(auto-fit, minmax(min(15rem, 100%), 1fr))`, so every lane that fits is
  a lane, each lane is stretched to fill the row, and a board of three lanes
  reads across the middle of the panel instead of hanging to the left of it.
- The pagination set and the two columns of a recipe are centred, and the
  recipe's columns wrap when the panel is too narrow to hold them side by side.

## Acceptance Criteria

- [x] `main`, `.header-inner` and `.footer-inner` share one left edge, and one
      cap, at 375px, 700px and 1440px.
- [x] `.prose`, `.measure` and `.footer-copy` never exceed 65ch, and fill the
      panel below that.
- [x] The prose column, the hero, the byline, both next/previous bars, the
      related block and the breadcrumb trail are centred in the panel, and share
      its middle at every width.
- [x] The board at `/kanban/` and `/kanban/grid/` spans the panel and its lanes
      are spread across it: no lane's width of empty panel at the right hand.
- [x] The bars are unchanged: the same surface, hairline, height and column.
- [x] `pnpm run test` passes.

## Not in scope

- The card listings in section pages, which keep the `.container` frame.
- The drawer and the dropdown menus of the top bar: `p0-us-update-site-menu`.
