---
title: 'Agent Docs Claim A Dashboard Section'
description: 'Agent docs describe a dashboard that is gone'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
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

- [ ] Make the content-type list in `AGENTS.md` list folders that exist under
      `content/`.
- [ ] Either restore the CSS test page at the documented path, or drop the
      section and the `dashboard/raw` skip from the headings validator.
- [ ] State the `02-in-progress` topic sub-folders that exist.
- [ ] State the generated CSS size from a measurement, not from memory.

## Acceptance Criteria

- [ ] Every content type and content path named in `AGENTS.md` resolves under
      `content/`.
- [ ] No script skips a directory the build cannot produce.
- [ ] The size quoted for `assets/css/main.css` is within one kilobyte of the
      file the CSS build writes.
- [ ] `pnpm run test:headings` and `pnpm run test` pass with the claims and the
      tree in agreement.
