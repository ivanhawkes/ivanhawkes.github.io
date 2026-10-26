---
title: 'Prettier Races Agent Edits'
description: 'Prettier reformats files behind a running agent'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Prettier reformats theme CSS and layout HTML after an agent has read them, so
the text the next edit quotes no longer exists on disk.

<!--more-->

## Cause

- The husky `pre-commit` hook runs `lint-staged`, which runs `prettier --write`
  over staged css, md, html, yaml, json and js.
- VSCodium keeps `editor.formatOnSave` on with the Prettier extension, so a file
  saved in the editor is reformatted as well.
- At `printWidth: 80` and `tabWidth: 4` a CSS declaration at indent 1 wraps past
  76 columns into three lines, and `proseWrap: always` reflows markdown prose at
  80, so hand written text rarely survives a formatter pass.
- Ruled out: line endings (`.gitattributes` pins LF, no tracked file carries
  CRLF), the Git LFS hooks, devenv tasks, CI, and prettier version drift, as the
  project's 3.9.9 and the extension's 3.7.4 agree byte for byte.
- A trap beside the cause: root `assets/css/main.css` is Tailwind output,
  gitignored and over the read limit, so no edit of it can ever match.

## Fix

- `printWidth: 100` for `**/*.css`, in both Prettier blocks: theme CSS files
  resolve config from `be-best/package.json`, so a root-only override is inert.
- `editor.formatOnSave` off for `[css]`, `prettier.prettierPath` pinned to the
  project copy, and `prettier.requireConfig: true`.
- `.editorconfig` keeps the load bearing trailing space after `-}}` in layouts
  and the hard-break pair at the end of a markdown line.
- Rules in `AGENTS.md` and `.pi/APPEND_SYSTEM.md`: re-read immediately before an
  edit, keep lines inside the wrap limits, never edit generated CSS, never
  format layout templates.

## Acceptance Criteria

- [x] Every tracked layout HTML reads as Prettier-ignored from both roots
- [x] The Prettier blocks in `package.json` and `be-best/package.json` agree
- [x] `pnpm run test:prettier` asserts those invariants inside `pnpm run test`
- [x] `pnpm run test` passes against the reflowed theme CSS
- [ ] A theme CSS edit lands without a follow-up edit quoting stale text
