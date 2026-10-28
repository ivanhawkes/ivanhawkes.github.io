---
title: 'Run The Full Test Suite In CI'
description: 'CI runs only the HTML check, not the full chain'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: '2026-10-28'
    dependencies: null
    due: null
    references: null
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

- [x] Run the whole `pnpm run test` chain in the build job, reusing the build
      the workflow already performs rather than building twice.
- [x] Add `go test ./cmd/kan` to the job, so the scaffolder's contract is
      covered as well.
- [x] Fail the job before the Pages artifact is uploaded, so a failed check
      cannot publish.
- [x] Keep the workflow readable: one validation step named after the chain, not
      seven near-identical steps.

## Acceptance Criteria

- [x] A push to `publish` runs every step of `pnpm run test` and
      `go test     ./cmd/kan`.
- [x] The artifact is uploaded only when all of them pass.
- [x] The site is built once per job, not once per check.
- [x] Introducing a heading, placeholder, card schema, lint or Prettier setup
      break on `publish` fails the run.

## Notes

- One step in the build job, `pnpm run test:ci`, in the slot `test:html` held:
  after the Tailwind and Hugo builds, before `upload-pages-artifact`. A step
  that exits non-zero fails the job, so the artifact carries only a build every
  check cleared, and the job builds the site once.
- The chain's two build steps are not part of the CI set. `test:css` writes an
  un-minified stylesheet and `test:hugo` rewrites `public/` un-minified, without
  `--environment production` and the Pages `--baseURL`: run there, they replace
  the production output the artifact uploads. `test:checks` is the six checks of
  the chain - `test:lint`, `test:html`, `test:headings`, `test:placeholders`,
  `test:kanban`, `test:prettier` - and `pnpm run test` is now `test:css`,
  `test:hugo`, `test:checks`, so the local chain and the CI gate judge the same
  things.
- `go test ./cmd/kan` failed the moment it was run, and it had never been run:
  `TestEveryKindHasArchetype` looked for the archetypes under
  `themes/be-best/archetypes/`, the submodule layout the theme move to the
  repository root abandoned, so all 12 kinds reported a missing archetype. The
  path is `be-best/archetypes/` now, and the suite passes.
- The gate was run in CI order over a minified production build:
  `pnpm run build && pnpm run test:ci` exits 0 - `html-validate` silent, 418
  pages with one `h1` each, 44 pages with images and 58 placeholder pairs, 44
  cards against the schema, prettier setup green, `go test` ok.
- Acceptance criterion 4 was proven by injection, one break at a time, each
  undone before the next: strip an `<h1>` from a generated page, add a card
  carrying a field the schema forbids, delete `layouts/` from `.prettierignore`,
  add a script with an undefined call, add an image placeholder class with no
  rule behind it. Each made `pnpm run test:ci` exit 1, and the clean tree went
  back to 0.
- The workflow's CSS step is untouched (`pnpm dlx @tailwindcss/cli` with
  `--minify`), and the checks need nothing past the `pnpm i` the job already
  runs: the six checks, `prettier` and `eslint` are dependencies, and
  `git ls-files` works on a checkout made with `fetch-depth: 0`.
- Not verified: GitHub's runner. The sequence ran on one machine in this
  checkout, and the local build did not carry `--environment production` or the
  Pages `--baseURL`, so absolute links in the built pages are the config's, not
  the deployment's.
- The documents that described the old gate moved with the change: the
  publishing behaviour in the functional specification, the publishing
  integrity, quality gate and verification rows of the requirements, the build
  and publishing section of the technical specification - where `pnpm run serve`
  also became the script's real name, `server` - and the decision record, whose
  row on HTML validation is marked superseded in part and is joined by the row
  that records the gate.
