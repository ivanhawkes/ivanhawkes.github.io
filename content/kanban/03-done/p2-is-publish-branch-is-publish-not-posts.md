---
title: 'Publish Branch Is Publish Not Posts'
description: 'Specs name a posts branch that does not exist'
date: '2026-10-24'
author: Ivan Hawkes
params:
    completionDate: '2026-10-24'
    due: null
    dependencies: ['p2-is-fix-stale-submodule-refs-in-specs']
    references: null
---

The specs call the publishing branch `posts`; it is `publish`.

<!--more-->

## Publish Branch Is Publish Not Posts

`.github/workflows/hugo.yml` triggers on a push to `publish`, and
`git branch -a` lists `main`, `publish` and the feature branches: no `posts`
branch exists locally or on `origin`. Four documents, one agent instruction file
and one skill still described the publishing branch as `posts`, so an agent
following them merges into, and pushes to, a branch that publishes nothing.

The same pass removes the two remaining traces of the theme's old submodule: the
empty `.gitmodules` that `416d145` left tracked, and the comment in the publish
workflow that calls the cache-key input a "theme submodule pin" when the
workflow hashes the `be-best` tree.

- [x] `content/specification/functional/index.md`, Publishing Behaviour: a push
      to `publish` runs the workflow.
- [x] `content/specification/requirements/index.md`, Availability row, and
      `content/specification/decisions/index.md`: `publish` publishes.
- [x] `AGENTS.md` workflow step 4: CI deploys only from `publish`.
- [x] `.pi/skills/merge-squash/SKILL.md`: squash-merge into `publish`.
- [x] Delete the tracked, empty `.gitmodules`; `git submodule status` is empty
      and `git ls-files -s` lists no gitlink, so nothing declares a submodule.
- [x] `.github/workflows/hugo.yml`: name the cache-key input by what it is, the
      `be-best` tree hash.

## Acceptance Criteria

- [x] `grep -rn "posts branch" content/specification AGENTS.md .pi/ docs/`
      reports nothing; the only `posts` left in the specifications is the plural
      noun for blog articles.
- [x] `.gitmodules` is not tracked.
- [x] The publish workflow reads as a single repository: one checkout, one tree
      hash, one branch filter.
- [x] `pnpm run test` passes.
