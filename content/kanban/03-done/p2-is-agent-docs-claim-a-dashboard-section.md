---
title: 'Agent Docs Claim A Dashboard Section'
description: 'Agent docs describe a dashboard that is gone'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: '2026-10-28'
    dependencies: null
    due: null
    references: null
---

AGENTS.md documents a dashboard section that no longer exists.

<!--more-->

## Agent Docs Claim A Dashboard Section

`AGENTS.md` is the contract an agent reads before editing, and several of its
statements no longer describe this tree:

- It lists `dashboard` among the Hugo content types and describes `dashboard/`
  as holding development scratch pages, naming `raw/all-html-elements.html` as
  the CSS test page. There is no `content/dashboard/`, the theme ships no
  `dashboard` layout, and `public/dashboard/` is not generated. The
  `be-best/archetypes/dashboard/` tree that does exist is Kanban scaffolding,
  not that section.
- `scripts/validate-headings.mjs` skips the directory `dashboard/raw` as "the
  CSS test page", a path the build no longer produces: a skip rule that can
  never fire.
- It names the `02-in-progress` topic sub-folders as `design`, `features` and
  `ui`; only `features` exists.
- `.pi/APPEND_SYSTEM.md` calls the generated `assets/css/main.css` "85 KB, past
  the read limit"; the current build writes 94.9 KB.

Decide for each claim whether the document is stale or the tree is: the CSS test
page has real value, so restoring it under a documented path is as good a fix as
deleting the claim.

## Goals

- [x] Make the content-type list in `AGENTS.md` list folders that exist under
      `content/`.
- [x] Either restore the CSS test page at the documented path, or drop the
      section and the `dashboard/raw` skip from the headings validator.
- [x] State the `02-in-progress` topic sub-folders that exist.
- [x] State the generated CSS size from a measurement, not from memory.

## Acceptance Criteria

- [x] Every content type and content path named in `AGENTS.md` resolves under
      `content/`.
- [x] No script skips a directory the build cannot produce.
- [x] The size quoted for `assets/css/main.css` is within one kilobyte of the
      file the CSS build writes.
- [x] `pnpm run test:headings` and `pnpm run test` pass with the claims and the
      tree in agreement.

## Notes

- The tree won every claim: the documents moved to it, and the dashboard section
  stayed dead. A CSS element fixture of the kind the section carried is worth
  having; the card that tracked one was withdrawn as based on outdated ideas, so
  the fixture is untracked now.
- `bb4f3ee` had already deleted `dashboard` from the `AGENTS.md` content type
  list and emptied the `skippedDirs` list in `scripts/validate-headings.mjs`, so
  the two claims the card opens with were fixed before it was worked. What it
  left was a `skippedDirs.some` branch in `skipReason` reading an array that is
  always empty: a check that can never fire. That branch is gone, so the
  script's skips are the pagination stubs and the per-page
  `<!-- h1-check: ignore -->` comment, both of which the build produces.
- `AGENTS.md` also named paths that resolve nowhere: `recipe`, `project` and
  `profile` as sections (they are front matter `type:` values living under
  `post/recipe/`, `about/project/` and `about/profile/`), `post/CRYENGINE` (the
  folder is `content/post/cryengine`, and the lookup is case sensitive), and
  `specification/personal-website/` (the documents sit in one directory per
  document). `summary.md` became `summary/index.md`. The script names `serve`
  became `server`, the name in `package.json`.
- The lane labelling sentence named `02-design`, a folder that does not exist,
  and credited `be-best/layouts/kanban/section.html` with the labelling. That
  layout writes no labels; `be-best/layouts/_partials/kanban/grid.html` builds
  the lane name from the first two characters of the parent stage folder, which
  is why `/kanban/grid/` prints `02-features` for the one topic folder.
- The CSS sizes are `stat -c %s` of the file the scripts write: 94,886 bytes
  (94.9 KB) for `css`, `server` and `test:css`, 77,908 bytes (77.9 KB) for
  `build:css`. Both sit above the 50 KB read limit.
- Stale claims of the same kind survive outside the card's scope, in files that
  document the site rather than the agent contract: the `dashboard` section row
  in `content/specification/functional/index.md`, the `dashboard` scratch pages
  in `content/specification/requirements/index.md`, the two `dashboard` rows in
  `content/specification/decisions/index.md` (the record marks superseded rows
  in place, so they need marking, not deleting), the `dashboard` section
  paragraph in `content/specification/technical/index.md`, and the
  `hugo new content dashboard/admin` walkthrough in `README.md`.
- Two other measured figures in `AGENTS.md` and `.pi/APPEND_SYSTEM.md` date from
  the Prettier experiment they describe, and no longer match the tree: "0 of 329
  tracked files" (517 tracked now) and "4 of 69 layouts" (71 layout files now).
  They are dated evidence about a past run, not a description of this tree, and
  re-measuring them means repeating the run.
