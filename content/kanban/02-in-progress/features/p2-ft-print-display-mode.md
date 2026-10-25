---
title: 'Print Display Mode'
description: 'Strip the site chrome so the page prints cleanly'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references:
        - p0-us-update-site-menu
        - p3-us-footer-matches-the-header
---

A top bar control prints the page with no navigation, header, footer or menu.

<!--more-->

An office printer gets paper, not a viewport: there is no scroll, no pointer, no
hover, no colour scheme, and toner costs money. Every control on the page is a
way of moving through the site, and paper has no use for any of them.
`be-best/assets/css/print.css` carries the presentation, imported last by
`be-best/assets/css/main.css` so it wins over the component styles it overrides.
The palette reset for the medium already exists in `tokens.css`, so paper is
always light.

## Print CSS

- [x] `@page` margins, with the paper size left to the driver
- [x] Remove the chrome: top bar, drawer, menus, search, colour scheme switch,
      foot, breadcrumbs, pagers, taxonomy list, copy button, forms, buttons,
      embeds
- [x] One full width column: no card frames, shadows, blur, transitions,
      animations, multi column grids or viewport height
- [x] Black on white, points for type, `orphans`/`widows` of 3, and page break
      control on headings, lists, figures, tables, rows and codeblocks
- [x] Write link targets onto the paper
- [x] Toner friendly code and tables: black on white, wrapped long lines,
      repeated table headers, no stripe fills
- [x] Give `next-prev.html`, `next-prev-small.html`, `taxonomy.html` and
      `related.html` a class each, so print styles have a hook to match

## Top Bar Control

- [ ] Add a print button to `.header-actions` in
      `be-best/layouts/_partials/page/header.html`, labelled "Print this page"
- [ ] Drive it from `be-best/assets/js/site-header.ts`: open `window.print()`,
      and toggle `html.print-mode`, the on screen preview of the paper
      presentation, which the shared rules in `print.css` already style
- [ ] Open every `details` element before printing, so collapsed codeblocks
      reach the paper
- [ ] Keep the button out of the printed page, and give it the same focus,
      keyboard and `prefers-reduced-motion` treatment as the other bar controls
- [ ] Record the print medium in the technical specification

## Acceptance Criteria

- `grep -c '@media print' assets/css/main.css` reports the compiled print block,
  and `be-best/assets/css/print.css` is the only source of it beyond the token
  reset in `tokens.css`.
- A print preview of `public/post/index.html`, of a post page, of a recipe page
  and of `/kanban/grid/` shows no top bar, no drawer, no menu, no search box, no
  colour scheme switch, no foot, no breadcrumb, no pager, no copy button and no
  form control.
- No page is blank, no text is clipped at the right edge, no heading is the last
  thing on a page, no table row, figure, blockquote, list item, card or
  codeblock is split across a page, and a table that runs over shows its header
  row on every page.
- Code blocks print black on white with their long lines wrapped, and no element
  paints a dark background.
- A prose link is followed by its target in parentheses; an in-page anchor, an
  image link and a card listing link print no target.
- The top bar control starts the browser print flow, and the page it prints
  matches the preview the control shows on screen.
- `pnpm run test` passes, and the paper presentation is checked in a browser
  print preview of a built post page, a post listing, a recipe and
  `/kanban/grid/`: `pnpm run build` then `file://` the pages under `public/`.

## Not in scope

- A print stylesheet for the Kanban board's own controls, which the board view
  work owns: `p1-ft-kanban-board-view`.
- Header and footer markup, which stay as the top bar and foot cards left them:
  `p0-us-update-site-menu`, `p3-us-footer-matches-the-header`.
