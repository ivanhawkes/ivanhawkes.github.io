---
title: 'Fix Stale Submodule Refs in Specs'
description: 'Specs still call be-best a git submodule'
date: '2026-10-24'
author: Ivan Hawkes
params:
    completionDate: '2026-10-24'
    due: null
    dependencies: null
    references: null
---

Four specification passages call `be-best` a git submodule. It is not.

<!--more-->

## Fix Stale Submodule Refs in Specs

Commit `416d145` moved the theme out of a submodule and into the repository
root. The published specifications still describe the old arrangement, so they
tell a reader to commit and push inside `be-best` and to record a submodule
pointer in this repository - neither is possible.

The facts the documents should state: there is no `.gitmodules` file, the only
remote is `ivanhawkes/ivanhawkes.github.io`, the theme's 139 files are tracked
directly by this repository, and Hugo selects the theme through `theme: be-best`
with `themesDir: '.'` in `config/_default/hugo.yaml`.

- [x] `content/specification/technical/index.md`, "Presentation Layer": reword
      the theme paragraph so `be-best` is a directory of this repository, and
      drop the submodule-pointer commit rule.
- [x] `content/specification/requirements/index.md`: the Maintainability row
      says "the `be-best` submodule" and the History and recoverability row says
      "the theme is a submodule with its own history". Reword both.
- [x] `content/specification/decisions/index.md`: the decision "The theme is a
      git submodule published on its own `features` branch" is now falsified.
      Record that the theme moved to the repository root, with the reason, so
      the decision history stays honest rather than just deleting the row.
- [x] Search the rest of `content/` for further submodule mentions and fold them
      into the same pass. Two rows of the requirements and technical
      specifications said the Hugo cache is keyed on "the theme commit"; the
      workflow hashes the `be-best` tree, so both now name the tree hash.

The agent instruction files (`AGENTS.md`, `.pi/APPEND_SYSTEM.md`,
`.pi/skills/dcp`, `.pi/skills/theme-dev`, `.pi/prompts/review.md`) were already
corrected on 2026-10-24; this card covers the published content only.

## Acceptance Criteria

- [x] No published page describes `be-best` as a git submodule.
- [x] The technical specification's Presentation Layer names the theme's
      location as `be-best/` in this repository and cites the `theme` /
      `themesDir` settings that select it.
- [x] The requirements specification's Maintainability and History and
      recoverability rows contain no submodule wording.
- [x] The decision record shows the submodule decision superseded by the move to
      the repository root, dated, with the reason recorded.
- [x] `grep -rin submodule content/` returns only the superseded decision
      record, and this card, whose own path and title name the defect.
- [x] `pnpm run test` passes.

The card's own claim that "there is no `.gitmodules` file" is close but not
exact: commit `416d145` emptied the file and left it tracked, empty. The
repository declares no submodules; `git ls-files -s` lists no gitlink, and
`git submodule status` is empty. Deleting the leftover file is a repository
cleanup, outside this card's published-content scope.
