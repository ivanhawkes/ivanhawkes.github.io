---
kind: 'kanban'
title: 'kan: quick kanban creation'
description: 'kan wraps hugo new to create kanban cards'
date: '2026-10-01T12:59:06'
lastmod: null
author: Ivan Hawkes
categories: Tools, Utilities
tags: null
params:
    sprint: null
    stage: done
    status: done
    completed: 2026-10-01
    due:
    percent: 100
    estimatedtime: 4
    actualtime: 0.25
    priority: 350
    dependencies: null
    references: null
---

Create a one-shot Pi skill that writes `kan`, a command that wraps `hugo new` to
create kanban cards with minimal typing.

<!--more-->

# Requirements

- The skill is one-shot: its deliverable is the committed, buildable source of
  `kan` in `cmd/kan/`.
- Implement `kan` in Go; python3, Node 24, or bash are permitted only if Go is
  unsuitable.
- `kan` takes exactly two logical parameters: the card kind (full name, prefix,
  or prefix with dash) and the title (the remainder of the command line, 40
  characters or fewer).
- `kan <kind> <title>` exits 0 and creates
  `content/kanban/<kind>/<prefix>-NNN-<slug>.md`, where NNN is the next free
  serial number and slug is the lowercased, dash-separated title.
- The skill builds the binary and installs it to `~/.local/bin/kan` with the
  execute bit set.

# Acceptance Criteria

- Running `kan rq test-title` from the repo root creates
  `content/kanban/requests/rq-NNN-test-title.md` with the kind's front matter.
- `~/.local/bin/kan` exists, is executable, and is on the PATH.

# Notes

The skill may ask the user to clarify or disambiguate requirements before
writing code.
