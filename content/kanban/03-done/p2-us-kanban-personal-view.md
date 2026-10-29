---
title: 'Kanban Personal View'
description: 'Grid based view for the OS user'
date: '2026-10-23'
author: Ivan Hawkes
params:
    completionDate: '2026-10-29'
    due: null
    dependencies: null
    references: ['p2-us-kanban-grid-view']
---

The personal view is a variation of the Kanban grid view. It only shows Kanban
cards that are assigned to the person who is working on the project.

Due to the static nature of the site this is implemented as a separate web page.

<!--more-->

## Kanban Personal View

Duplicate the grid view page. See `p2-us-kanban-grid-view` for the page layout,
the lane rules, the sort score and the shared partial: this page renders the
same board with one extra filter.

- [x] **Duplicate** - copy the grid view page to `content/kanban/personal/`,
      rendered at `/kanban/personal/`, sharing the board partial and its rules:
      one lane per stage folder, `00-epics` excluded, `03-done` included
- [x] **Retrieve** - retrieve the current OS user full name
- [x] **Filter** - keep only the cards whose `author` matches that name
- [x] **Score** - award 300 points to a card whose `author` matches, so the
      reader's own cards rise within their lane

## Matching The OS User

The grid view dropped the OS user bonus because a static build bakes in the
identity of the build host, not of the reader. This page owns that rule, and the
matching rule still has to be decided:

- The name is available to Hugo templates as `os.Getenv "HUGO_AUTHOR"`. The
  environment variable is not a Hugo parameter: only `HUGO_PARAMS_<name>` maps
  onto `.Site.Params`, so `os.Getenv` is the form to use.
- `devenv.nix` exports `HUGO_AUTHOR` from the `getent passwd` GECOS full name,
  which on the development machine gives `Ivan Hawkes` and matches the card
  `author` value exactly.
- `getent` is Linux only, and the GitHub Pages workflow sets no `HUGO_AUTHOR`,
  so the variable is empty on macOS and in CI. State what the page does when the
  variable is empty: show every card, no filter, and no score bonus.
- Decide the comparison: exact string, or trimmed and case-insensitive. Card
  `author` values are `Ivan Hawkes`, quoted both with and without quotes, which
  parse to the same string, so quoting is not an issue.

The comparison is trimmed and case-insensitive, taken in the shared partial, so
the layout passes the raw environment value and the partial owns the rule. When
the variable is empty the page applies no filter and no bonus, so it renders the
whole board.

## Acceptance Criteria

- [x] Only the cards for the current user are displayed within a grid view
- [x] The reader's own cards are ordered by score inside their lane, the score
      including the 300 point match bonus
- [x] With `HUGO_AUTHOR` unset the page builds and renders the unfiltered board

## Open Work

- The filter and the bonus were checked with a temporary card authored
  `Zoe Tester`: `/kanban/personal/` dropped it while `/kanban/grid/` kept it,
  and with `HUGO_AUTHOR` unset the personal page rendered every card. No
  foreign-authored card is kept in the tree, so the board is untested on the
  published site, where the variable is empty.
- Every card the filter keeps is a match, so all of them take the same 300 point
  bonus and the order within a lane is the grid order. The bonus only separates
  cards in a view that scores an author match without filtering on it; the rule
  is kept because this page's acceptance criteria state it.
