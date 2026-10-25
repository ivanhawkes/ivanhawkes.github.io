---
title: 'Footer matches the header'
description: 'Style the footer to match the top bar'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-25'
    dependencies: null
    references: null
---

The footer reads as the bar's mirror, not as a coloured strip.

<!--more-->

The footer was a solid `--primary` band with `--primary-foreground` text: the
only saturated surface on the site, and the only one that ignored the surface,
the hairline border and the column the bar above it is built from.

## Footer matches the header

- [x] `be-best/assets/css/footer.css` styles the band from the bar's tokens: the
      `--header-bg` surface, `1px solid var(--header-border)` on the edge that
      faces the page, the bar's 1280 pixel column with `var(--page-gutter)`
      inside it, and 60 pixels of height, 72 from 1024 pixels up.
- [x] The copyright sits at the left of that column on the brand mark's chip:
      `--surface-2`, 0.875rem, 0.05em letter spacing.
- [x] `be-best/assets/css/layout.css` makes the shell a flex column, with `main`
      taking the height that is left, so the band closes the shell at the foot
      of the viewport on a short page and at the foot of the content on a long
      one.
- [x] The theme-change transitions and the `prefers-reduced-motion`, print and
      forced-colours blocks mirror the bar's in `be-best/assets/css/header.css`.

## Acceptance Criteria

- [x] `--primary` fills no rule in `be-best/assets/css/footer.css`.
- [x] The band's surface, border, height and left edge match the bar's in the
      light and dark schemes, at desktop and narrow widths.
- [x] `pnpm run test` passes, and `assets/css/main.css` carries the
      `#site-footer` rules, so Tailwind kept them.

## Not in scope

- The search box, the colour scheme switch and the drawer control, which belong
  to the bar alone: `p0-us-update-site-menu`.
- Site-wide semantic colour tokens: `p2-ft-site-wide-semantic-colour-tokens`.
- The overall look of the page furniture: `p2-us-overall-look`.
