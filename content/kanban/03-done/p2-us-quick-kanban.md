---
title: 'kan: quick kanban creation'
description: 'kan wraps hugo new to create kanban cards'
date: '2026-10-01'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-01'
    dependencies: null
    references: null
---

Create a one-shot Pi skill that writes `kan`, a command that wraps `hugo new` to
create kanban cards with minimal typing.

<!--more-->

## Quick Kanban Creation

- [x] The skill is one-shot: its deliverable is the committed, buildable source
      of `kan` in `cmd/kan/`.
- [x] Implement `kan` in Go; python3, Node 24, or bash are permitted only if Go
      is unsuitable.
- [x] `kan` takes exactly two logical parameters: the card kind (full name,
      prefix, or prefix with dash) and the title (the remainder of the command
      line, 40 characters or fewer).
- [x] `kan <kind> <title>` exits 0 and creates
      `content/kanban/01-to-do/p<priority>-<prefix>-<slug>.md`, where the slug
      is the lowercased, dash-separated title and `01-to-do` is the default
      stage.
- [x] The skill builds the binary and installs it to `~/.local/bin/kan` with the
      execute bit set.

## Acceptance Criteria

- [x] Running `kan is test-title` from the repo root creates
      `content/kanban/01-to-do/p2-is-test-title.md` with the kind's front
      matter.
- [x] `~/.local/bin/kan` exists, is executable, and is on the PATH.

## Notes

The skill may ask the user to clarify or disambiguate requirements before
writing code.

Card names no longer carry serial numbers. The card's ID is its kind prefix plus
slug, unique across every stage, so the naming above is now
`p<priority>-<prefix>-<slug>.md` in a stage folder (2026-10-22).
