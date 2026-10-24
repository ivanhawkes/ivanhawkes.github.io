---
title: 'Kanban Personal View'
description: 'Grid based view for the OS user'
date: '2026-10-23'
author: Ivan Hawkes
params:
    completionDate: 2026-10-30
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

- [ ] **Duplicate** - copy the grid view page to `content/kanban/personal/`,
      rendered at `/kanban/personal/`, sharing the board partial and its rules:
      one lane per stage folder, `00-epics` excluded, `03-done` included
- [ ] **Retrieve** - retrieve the current OS user full name
- [ ] **Filter** - keep only the cards whose `author` matches that name
- [ ] **Score** - award 300 points to a card whose `author` matches, so the
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

## Acceptance Criteria

- [ ] Only the cards for the current user are displayed within a grid view
- [ ] The reader's own cards are ordered by score inside their lane, the score
      including the 300 point match bonus
- [ ] With `HUGO_AUTHOR` unset the page builds and renders the unfiltered board
