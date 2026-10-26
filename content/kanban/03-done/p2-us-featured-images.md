---
title: 'Featured images in section cards'
description: 'Featured card images need sizes for their grid'
date: '2026-05-04'
author: 'Ivan Hawkes'
params:
    due: 2026-11-15
    completionDate: 2026-10-26
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
columns to 1280px and three columns above, inside a `.container` with a 1px
border, `padding: min(2em, 10%)` and a 16px gap, set in a `main` gutter of
`min(30px, 7%)`. At a 1280px viewport that leaves 372px per card, so 744px is
needed at 2x density, yet the current hint sends the browser to the 1920w
variant. For `garden/featured.webp` that is 363 KB against 135 KB at 960w.

## Featured images in section cards

- [x] `image-variants.html` takes the `sizes` hint from its caller, and the card
      path passes one that names the 768px and 1280px breakpoints and the
      resulting card widths.
- [x] A card srcset stops at 960w: no 1280, 1600 or 1920 variant is generated
      for a card image.
- [x] The post page keeps the existing full-width hint; only the card path
      changes.
- [ ] Posts still show a featured image fallback from the parent folder even
      when their own page branch doesn't include an image specific to that page.
      These need to be removed and a decision recorded that featured images are
      only shown when they are unique to a page.

## Acceptance Criteria

- `grep -o 'sizes="[^"]*"' public/post/index.html` reports one hint only, and it
  names the 768px and 1280px breakpoints.
- The widest candidate in any card srcset on `public/post/index.html` is 960w.
- At a 1280px viewport and 2x density the featured image fetched per card is the
  960w variant: 135 KB for `garden/featured.webp`, not the 363 KB 1920w file.
- `public/post/garden/spring-2021-try-again/index.html` is byte-identical to the
  build before the change. Its ladder has always stopped at 960w: its
  `featured.webp` is 1230px wide, so the source caps the ladder below 1280.
  Page-level heroes with a wider source, as under `post/general/`, still list
  1280, 1600 and 1920 with the full-width hint.
- `pnpm run test` passes.

## Not in scope

- The placeholder class no rule styles on cards:
  `p2-is-card-lqip-placeholder-unused`.
- Alt text and captions from image metadata: `p2-us-card-image-alt-text`.
- The section-image fallback that repeats one image across a listing:
  `p2-is-card-image-parent-fallback`.
- Variant quality and weight: `p2-us-image-processing`.
