---
title: 'Baseof Carries A Lorem Ipsum Block'
description: 'baseof.html keeps commented out Lorem Ipsum'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: '2026-10-28'
    dependencies: null
    due: null
    references:
        - p2-is-agent-docs-claim-a-dashboard-section
---

Twenty-three lines of commented filler sit in the base layout.

<!--more-->

## Baseof Carries A Lorem Ipsum Block

`be-best/layouts/baseof.html` lines 11 to 33 hold a Go template comment,
`{{/*  ...  */}}`, wrapping three `<div class="container">` blocks of Lorem
Ipsum with `<h2>Hello World</h2>`, `<h2>Example Heading</h2>` and
`<h2>Lorem Ipsum</h2>`. It is a CSS sampling scaffold from the first pass at the
layout: it renders nothing, and every line of it is text no reader sees.

It is also the only filler in the theme: grepping `lorem` over
`be-best/layouts/` hits these lines and nowhere else. Layout HTML is excluded
from Prettier on purpose (`.prettierignore`, asserted by
`pnpm run test:prettier`), so nothing in the pipeline ever trims it, and it sits
in the template every page inherits. The markup it samples — a container, a
heading, a paragraph — is what the real layouts build, and the CSS test page it
imitates is the subject of `p2-is-agent-docs-claim-a-dashboard-section`.

## Goals

- [x] Delete the `{{/* ... */}}` block from `be-best/layouts/baseof.html`.
- [x] Keep the `<main>` element's own content, the `block "main"` call,
      untouched.
- [x] Confirm no other layout carries commented-out filler markup.

## Acceptance Criteria

- [x] `be-best/layouts/baseof.html` contains no Lorem Ipsum text.
- [x] No file under `be-best/layouts/` matches a case-insensitive `lorem`
      search.
- [x] The rendered HTML of every page matches the build before the deletion
      apart from one whitespace node: the newline and six spaces after `<main>`
      go, so no element, text, attribute or visible byte moves.
- [x] `pnpm run test` passes with the block gone.

## Notes

- The block is lines 11 to 33: 23 comment lines and the blank line after them,
  24 deletions in all.
- The indentation around the comment is not inert. It sits between `<main>` and
  the `{{- block "main" . }}` call, and that `{{-` trims the whitespace run in
  front of it, so the run survives only while the comment splits it. With the
  comment gone every page loses the newline and six spaces after `<main>`.
- Dropping the leading dash, `{{ block "main" . }}`, keeps those six spaces as
  literal text and made all 714 pages byte-identical in a trial build. Rejected:
  it edits the `block "main"` call the card asks to leave untouched, and buys a
  byte-identity no test can assert.
- No test can assert it because two baseline builds already differ: Hugo flips
  taxonomy display casing over 30+ `tags/` pages and their feeds from run to run
  (`Cryengine` and `CRYENGINE`, `deep-fried` and `Deep Fried`).
- No other layout carries filler. The commented markup left in the theme is
  `be-best/layouts/_markup/render-table.html:2,32`, a
  `<div class="overflow-x-auto">` held under an open `TODO:` about table layout,
  so a live design question, and the Go sample inside the doc comment at
  `be-best/layouts/_markup/render-codeblock.html:2-31`.
