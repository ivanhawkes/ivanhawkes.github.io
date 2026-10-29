---
title: 'Kanban Grid View'
description: 'Grid based view of the project'
date: '2026-10-23'
author: Ivan Hawkes
params:
    completionDate: '2026-10-24'
    due: null
    dependencies: null
    references: ['p2-ft-kanban-board-view', 'p2-us-kanban-personal-view']
---

Create a web page that provides an overview of the entire Kanban system at a
glance.

<!--more-->

## Kanban Grid View

Display a card for every Kanban card in the project. The information shown on
the card face is:

- title
- due date
- a visual indicator when the card is overdue

The `description` and the `author` are secondary information. They are not
displayed on the card face; they appear in a tooltip opened by an info control,
an `i` in a circle, on hover and on keyboard focus.

A card is overdue when its `completionDate` is null and its `due` date is prior
to today's date. Today's date is read when the site is built: the board is a
snapshot taken by the person building it, so a card changes state on the next
build, not in the browser.

The layout need not be a grid; responsive columns of kanban cards are
acceptable.

## Page

The board is a new page. It does not restyle the existing `/kanban/` section
page:

- Content at `content/kanban/grid/index.md`, rendered at `/kanban/grid/`.
- Rendered by a dedicated layout in `be-best`, e.g.
  `be-best/layouts/kanban/grid.html`, selected with `layout: grid`.
- Cards are collected from the stage folders with `.RegularPagesRecursive`, so
  the stage `_index.md` sections are never rendered as cards.
- The `00-epics` folder is excluded; `03-done` is included. Epics are not a
  stage: an epic stays open until the cards it bundles have cleared every stage,
  so it has no status to place in a lane. Epic cards belong to the overarching
  management views, not to this board.
- `p2-us-kanban-personal-view` duplicates this page at `/kanban/personal/`.
  Share the markup, e.g. `be-best/layouts/_partials/kanban/grid.html`, and let
  the personal view pass in its author filter.

## Sorting

Sort score: a numeric score ranks each card for sorting. Each card starts at
zero points, then:

- **Overdue** - award 150 points when the card is overdue.
- **Priority** - award `(3 - priority) * 100` points. The priority is the digit
  in the card filename, `p0` to `p9`, as documented in the technical
  specification; the project uses `p0` to `p3` today, and anything above `p3`
  scores negative and so sorts last.

Order the cards by score, highest first. Break ties in this order:

1. `due` date ascending; cards with no `due` date sort last.
2. Card id (`<prefix>-<slug>`) ascending, which makes the order stable.

Ties are the normal case, not the exception: most cards are `p2` and not
overdue, so they score 100.

The "+300 when the card belongs to the current OS user" rule does not belong to
this page. A static build bakes in the identity of the build host, the
deployment never sets that identity, so the rule cannot mean the reader of the
published page. It lives in `p2-us-kanban-personal-view`.

## Grid View

Lanes are derived from the folder names under `content/kanban/` and from nothing
else:

- X axis = completion stage: one lane per immediate subfolder of
  `content/kanban/`, ordered left to right by ascending folder name.
- Y axis = sort score: within a lane the cards are ordered by score, highest
  first, using the tie-break rules above.
- A lane is labelled with its folder name (`01-to-do`, `03-done`). A topic
  sub-folder of `02-in-progress` is labelled with the stage number of its parent
  folder, a dash, then the sub-folder name, e.g. `02-in-progress/design` is
  `02-design`. The two digit prefix is the stage number, never a priority.

An example of how this would look is shown below.

| 01-to-do  | 02-design    | 02-features | 02-ui  | 03-done  |
| --------- | ------------ | ----------- | ------ | -------- |
| p1-import | p2-something | p2-more     | p3-low | p1-first |
| p3-also   | p2-other     | p3-last     |        | p1-ano   |

## Kanban Cards

Colour-coded indicators for _late_, _urgent_, and _high-priority_:

- [x] **late** - set when the card is overdue by the criteria above
- [x] **urgent** - set when the priority level is `p0`
- [x] **high-priority** - set when the priority level is `p1`
- [x] **Grid view** - display all of the kanban cards in a responsive column
      layout: one lane per stage folder, cards within a lane ordered by score

The card face is compact, so that five lanes fit across a desktop browser
window. Its title bar leads with the priority as a numeral inside a circle,
followed by the title, then the info control; the due date fills the second
line. The indicators are colour and shape only, with no printed indicator name:
_late_ turns the card border, the due date and a warning triangle red, _urgent_
fills the priority circle, _high-priority_ shades it. Screen readers get the
words, as the numeral alone says only the priority.

## Acceptance Criteria

- [x] **Page** - `/kanban/grid/` lists every card in the stage folders;
      `00-epics` is excluded, `03-done` is included, and no stage `_index.md`
      section is rendered as a card
- [x] **Lanes** - there is one lane per stage and topic sub-folder, ordered by
      ascending folder name, labelled with the folder name or, for a topic
      sub-folder, the stage number of its parent
- [x] **Sorting** - the cards are correctly sorted by score, then by the
      documented tie-breaks
- [x] **Overdue** - a card whose `due` date precedes the build date and whose
      `completionDate` is null shows the overdue indicator
- [x] **Secondary information** - the description and author appear only in the
      info tooltip, which opens on hover and on keyboard focus
- [x] **Indicators** - _late_, _urgent_ (`p0`) and _high-priority_ (`p1`) are
      visually distinguishable
- [x] **Compact face** - the priority numeral in a circle leads the title bar,
      the indicators carry no printed name, and five lanes fit across a desktop
      browser window

## Open Work

- Sorting, the overdue rule and the three indicators were checked with temporary
  `p0`, `p1` and `p9` fixtures, then removed: the tree itself has no `p0` card
  and no past `due` date, so the board renders no _late_ or _urgent_ card until
  `p2-ts-seed-kanban-sorting-test-data` lands permanent ones.
- A lane is drawn for every stage and topic sub-folder, and for a stage folder
  that holds cards of its own. Hugo 0.166 does not surface a folder without an
  `_index.md` as a section page, so the folders are read with `os.ReadDir` at
  build time and a stage folder whose cards have all been grouped into topic
  sub-folders draws no lane of its own.
- The stage folder layout, the topic sub-folder lane label and the priority
  range are now described in `content/specification/technical/index.md`,
  resolved by `p2-is-kanban-stage-folder-spec-drift`.
