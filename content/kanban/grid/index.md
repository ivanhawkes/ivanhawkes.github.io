---
title: 'Kanban Grid View'
description: 'Responsive column view of every Kanban card'
date: '2026-10-24'
author: Ivan Hawkes
layout: grid
---

Every Kanban card in the stage folders, in responsive columns: one lane per
stage folder and per topic sub-folder, ordered by ascending folder name. Within
a lane the cards are ranked by sort score, highest first, so the work that needs
attention appears at the top. Five lanes fit across a desktop screen, so the
whole board is visible at once.

The card face is compact. Its title bar starts with the priority as a numeral in
a circle, then the title, then an info control, an `i` in a circle, which opens
a tooltip holding the description and the author on hover and on keyboard focus.
The second line carries the due date. Epics are not a stage, so `00-epics` is
not a lane; completed work is shown, so `03-done` is.

The priority circle, the card border and the due date carry the indicators, in
colour and without labels:

- **late** - the card is overdue: `due` precedes the build date and
  `completionDate` is null. The card border, the due date and a warning triangle
  turn red, and the card scores 150 points. Because the board is a snapshot
  taken by the person building the site, a card changes state on the next build,
  not in the browser.
- **urgent** - priority `p0`, a filled circle, worth 300 points.
- **high-priority** - priority `p1`, a shaded circle, worth 200 points.
- **priority** - every card scores `(3 - priority) * 100`, so the `p2` cards
  that make up most of the board score 100 and anything above `p3` scores
  negative and sorts last.

Cards with the same score are ordered by due date ascending, cards with no due
date last, then by card id, which makes the order stable.
