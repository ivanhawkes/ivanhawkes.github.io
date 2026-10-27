---
title: 'Run The Full Test Suite In CI'
description: 'CI runs only the HTML check, not the full chain'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
    dependencies: null
    due: null
    references:
        - 'p2-ts-completion-date-must-match-stage'
---

The deploy gate checks generated HTML only: seven checks are local.

<!--more-->

## Run The Full Test Suite In CI

`.github/workflows/hugo.yml` deploys on a push to `publish`. Its build job runs
`pnpm run test:html` as the only validation step before `upload-pages-artifact`,
so the other seven steps of `pnpm run test` are local habits with no
enforcement: `test:lint`, `test:headings`, `test:placeholders`, `test:kanban`
and `test:prettier` never run in CI, and `go test ./cmd/kan` runs nowhere at
all.

The checks that guard card front matter, page headings, image placeholder
pairing and the Prettier boundary are the ones most likely to break on a content
edit, and a broken one publishes silently. CI also builds the site itself, so
the chain can run against the build it already performs.

## Goals

- [ ] Run the whole `pnpm run test` chain in the build job, reusing the build
      the workflow already performs rather than building twice.
- [ ] Add `go test ./cmd/kan` to the job, so the scaffolder's contract is
      covered as well.
- [ ] Fail the job before the Pages artifact is uploaded, so a failed check
      cannot publish.
- [ ] Keep the workflow readable: one validation step named after the chain, not
      seven near-identical steps.

## Acceptance Criteria

- [ ] A push to `publish` runs every step of `pnpm run test` and
      `go test     ./cmd/kan`.
- [ ] The artifact is uploaded only when all of them pass.
- [ ] The site is built once per job, not once per check.
- [ ] Introducing a heading, placeholder, card schema, lint or Prettier setup
      break on `publish` fails the run.
