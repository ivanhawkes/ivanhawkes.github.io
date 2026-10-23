---
title: 'HTML Check'
description: 'Validate the generated HTML'
date: '2026-04-30'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-22'
    dependencies: null
    references: null
---

Feed the built pages through an HTML validator and clean up what it reports.

<!--more-->

## Audit Checklist

- [x] Extra `</div>` in the navigation partial: the `div` that wrapped the
      recursive sub-menu output sat directly inside `<ul class="sub-menu">`,
      turning every submenu entry into an `li` under a `div`.
- [x] Trailing slashes on void elements (`<link/>`, `<source/>`, `<img/>`,
      `<br/>`) left alone. They come from Hugo's own templates and from
      long-standing content, they are valid HTML5, and the stylistic
      `void-style` rule stays off.
- [x] Render code block extra attributes (`id`, `tabindex`) kept: they drive the
      copy-to-clipboard button and keyboard scrolling.
- [x] No `article` element wraps page content.
- [x] Author dates use `dateFormat` in the `datetime` attribute and
      `dateFormatHuman` for display.

## What The Validator Caught

- Kanban summary tables sitting inside a `ul`
  (`_partials/kanban/kanban-list-short.html`).
- `li` under `div` from the recursive nav partial: 7,074 reports.
- `div` inside `tbody` from `_partials/recipes/recipe-times.html`.
- `<thclass=...>` and `<tdclass=...>` from the table render hook, which trimmed
  the space before `class`; the link render hook did the same to `title`,
  producing `<atitle=...>` (17 reports).
- The "Image unavailable." fallback emitted a `p` inside a paragraph.
- Dashboard section pages embedded whole scratch pages in their cards, nesting
  `main`, `nav` and `footer` inside the page; they link now.
- Raw markup in content: an unbalanced blockquote in a post, which closed a
  paragraph in the middle of the page.

## Acceptance Criteria

- `pnpm run test` builds the site and runs `html-validate` over
  `public/**/*.html` with the `html-validate:standard` preset, exiting non-zero
  on any report.
- The publish workflow runs `pnpm run test:html` after `hugo build` and fails
  before the Pages artifact is uploaded.
- Hugo's pagination redirect stubs (`public/**/page/*/index.html`) are ignored;
  Hugo writes them with a `head` and no `body`.
- The hand-authored CSS fixtures under `public/dashboard/raw/` are ignored: the
  odd markup is the point of those pages, so it is left as written.
- Card listings show `.Description`, not `.Summary`, so embedded card text
  cannot repeat a heading id across one page.
