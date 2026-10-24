---
title: 'Featured images in section cards'
description: 'Featured card images need sizes for their grid'
date: '2026-05-04'
author: 'Ivan Hawkes'
params:
    due: 2026-11-15
    completionDate: null
    dependencies: null
    references: null
---

A card's featured image declares the width its layout box can occupy, so the
browser fetches a variant sized for a card rather than for a full-width image.

<!--more-->

Cards render `featured.webp` through
`be-best/layouts/_partials/images/image-variants.html`, which already emits webp
and jpeg srcsets at 320, 640, 960, 1280, 1600 and 1920. The hint that drives the
choice is wrong for a card: all 12 srcsets on `public/post/index.html` read
`sizes="(min-width: 1024px) 100vw, 50vw"`, while
`be-best/layouts/_partials/posts/card.html` sits in
`be-best/layouts/post/section.html:6`, a grid of one column below 768px, two
columns to 1280px and three columns above, inside a `.container` with
`padding: min(2em, 10%)` and a 16px gap. At a 1280px viewport that leaves about
330px per card, so 660px is needed at 2x density, yet the current hint sends the
browser to the 1920w variant. For `garden/featured.webp` that is 363 KB against
135 KB at 960w.

## Featured images in section cards

- [ ] `image-variants.html` takes the `sizes` hint from its caller, and the card
      path passes one that names the 768px and 1280px breakpoints and the
      resulting card widths.
- [ ] A card srcset stops at 960w: no 1280, 1600 or 1920 variant is generated
      for a card image.
- [ ] The post page keeps the existing full-width hint; only the card path
      changes.

## Acceptance Criteria

- `grep -o 'sizes="[^"]*"' public/post/index.html` reports one hint only, and it
  names the 768px and 1280px breakpoints.
- The widest candidate in any card srcset on `public/post/index.html` is 960w.
- At a 1280px viewport and 2x density the featured image fetched per card is the
  960w variant: 135 KB for `garden/featured.webp`, not the 363 KB 1920w file.
- `public/post/garden/spring-2021-try-again/index.html` still lists all six
  widths, showing the page-level path is untouched.
- `pnpm run test` passes.

## Not in scope

- The placeholder class no rule styles on cards:
  `p2-is-card-lqip-placeholder-unused`.
- Alt text and captions from image metadata: `p2-us-card-image-alt-text`.
- The section-image fallback that repeats one image across a listing:
  `p2-is-card-image-parent-fallback`.
- Variant quality and weight: `p2-us-image-processing`.
