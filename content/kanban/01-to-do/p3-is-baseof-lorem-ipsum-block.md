---
title: 'Baseof Carries A Lorem Ipsum Block'
description: 'baseof.html keeps commented out Lorem Ipsum'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
    dependencies: null
    due: null
    references: null
---

Twenty-three lines of commented filler sit in the base layout.

<!--more-->

## Baseof Carries A Lorem Ipsum Block

`be-best/layouts/baseof.html` lines 10 to 32 hold a Go template comment,
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

- [ ] Delete the `{{/* ... */}}` block from `be-best/layouts/baseof.html`.
- [ ] Keep the `<main>` element's own content, the `block "main"` call,
      untouched.
- [ ] Confirm no other layout carries commented-out filler markup.

## Acceptance Criteria

- [ ] `be-best/layouts/baseof.html` contains no Lorem Ipsum text.
- [ ] No file under `be-best/layouts/` matches a case-insensitive `lorem`
      search.
- [ ] The rendered HTML of every page is byte-identical to the build before the
      deletion.
- [ ] `pnpm run test` passes with the block gone.
