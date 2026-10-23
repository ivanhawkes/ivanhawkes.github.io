---
title: 'kan writes cards into per-kind folders'
description: 'kan scaffolds cards in the wrong layout'
date: '2026-10-22'
author: 'Ivan Hawkes'
params:
    completionDate: '2026-10-22'
    due: null
    dependencies: null
    references: null
---

`kan` built card names with a serial number and wrote them to
`content/kanban/<kind>/`, a folder this repo does not use, so every run failed.

<!--more-->

## Kan Writes into Per Kind Folders

- [x] New cards land in a stage folder, defaulting to `01-to-do`.
- [x] Card names are `p<priority>-<prefix>-<slug>.md`; the serial number is
      gone.
- [x] The ID (`<prefix>-<slug>`) is checked against every stage before writing.
- [x] Hugo's filename-derived `title:` is rewritten into a readable title.
- [x] Tests cover kind deduction, stages, slugs, ID collisions and tidy-ups.

## Acceptance Criteria

- [x] `go test ./cmd/kan` passes.
- [x] `go run ./cmd/kan is hunt the wumpus` creates
      `content/kanban/01-to-do/p2-is-hunt-the-wumpus.md`, and that card shows up
      in the issues table of the specification summary page.
- [x] A taken ID, an unknown kind, an unknown stage, a priority outside `0-9`
      and a title over 40 characters all exit non-zero.
- [x] The "not working" notices are gone from `AGENTS.md`, `README.md` and
      `.pi/skills/kanban-card/SKILL.md`, along with the serial-number wording in
      `content/specification/personal-website/ideation.md`.
