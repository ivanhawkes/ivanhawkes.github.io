---
title: 'Prettier Races Agent Edits'
description: 'Prettier reformats files behind a running agent'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: '2026-10-26'
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

- `printWidth: 100` for `**/*.css`. The theme carried its own Prettier block,
  which resolved ahead of the root one for every file under `be-best/`, so a
  root-only override was inert; the block and `be-best/.prettierignore` are gone
  and the root config is the only one.
- Dead weight is gone with it: `prettier-plugin-go-template` and its `*.html`
  parser override, `prettier-plugin-tailwindcss` with `tailwindStylesheet`, a
  `.prettierrc` override for a file that does not exist, `cross-var`, and the
  theme manifest whose devDependencies were never installed (`be-best/` is not a
  workspace member). Formatting 329 tracked files without the plugins changed 0
  of them.
- `editor.formatOnSave` off for `[css]`, `prettier.prettierPath` pinned to the
  project copy, and `prettier.requireConfig: true`.
- `.editorconfig` keeps the load bearing trailing space after `-}}` in layouts
  and the hard-break pair at the end of a markdown line.
- Rules in `AGENTS.md` and `.pi/APPEND_SYSTEM.md`: re-read immediately before an
  edit, keep lines inside the wrap limits, never edit generated CSS, never
  format layout templates.

## Acceptance Criteria

- [x] Every tracked layout HTML reads as Prettier-ignored by the root file
- [x] Exactly one Prettier config, the root manifest, covers the theme too
- [x] The config wires in no plugin, and no override routes to a Go-template one
- [x] `pnpm run test:prettier` asserts those invariants inside `pnpm run test`
- [x] `pnpm run test` passes against the reflowed theme CSS
- [x] A theme CSS edit lands without a follow-up edit quoting stale text

      Since the config landed, edits to theme CSS, TypeScript, JSON and markdown all
      matched on the first attempt. The one failure in the session was an edit
      that followed a `prettier --write` I ran myself, which is the documented
      re-read case, not the editor and commit race this card is about.
