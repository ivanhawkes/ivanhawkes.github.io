---
title: 'Heroes are drawn at the prose measure'
description: 'Heroes are drawn at the prose measure'
date: '2026-10-26'
author: Ivan Hawkes
params:
    due: null
    completionDate: 2026-10-26
    dependencies: null
    references:
        - 'be-best/layouts/_partials/images/featured-image.html'
        - 'be-best/assets/css/images.css'
---

A page hero is capped at the width the prose is read in.

<!--more-->

The hero of a page is written by
`be-best/layouts/_partials/images/featured-image.html` into `main`, above the
`.prose` block, so it filled `main`: on a maximised window a post showed a
picture 1860 pixels wide over paragraphs 65ch wide, and the full-width `sizes`
hint of `image-variants.html` told the browser to take the widest variant it
offers. `public/post/cryengine/on-building-a-world/index.html` asks for the
1920w webp of its hero, 99 KB, for a box about 600 pixels wide.

Cards were already sized to their grid by `card.html`, which passes its own
`sizes` and `widths`; only the page hero had no hint.

## Heroes are drawn at the prose measure

- [x] The measure is one token, `--prose-measure: 65ch` in `tokens.css`, read by
      `.prose` (in `prose-overrides.css`, the value the typography plugin
      already gave it) and by `.featured-image` in `images.css`.
- [x] A page hero carries `featured-image` on the box `image-variants.html`
      writes, so it is capped at that measure and its `w-full h-auto` image
      scales inside it. The five page layouts (`post`, `about`, `project`,
      `profile`, `recipe`) ask for the hero with `hero=true`; a card does not.
- [x] A hero is offered the variants its box selects: the hint is
      `(min-width: 1024px) 65ch, calc(100vw - 60px)` and the ladder is 320, 640,
      960, 1280, which fills the measure at 2x density. 1600 and 1920 are off
      the hero path.
- [x] A card's media is untouched: it takes no `featured-image` class, keeps the
      three-breakpoint grid hint and the ladder to 960, and `cards.css` still
      sizes it through `.card-media`.

## Acceptance Criteria

- Every `<img>` in a `featured-image` box is served from a `srcset` whose
  largest entry is at most 1280w: 20 hero pages, 0 pages offer 1600w or 1920w
  for a hero.
- Every hero page carries the one hero `sizes` hint: 20 pages, 1 distinct value.
- Card media carries no `featured-image` class and keeps the grid hint: 12 cards
  on `public/post/index.html`, all with the grid hint, 0 with the hero class.
- The prose and the hero read one measure: `.prose` and `.featured-image`
  declare `max-width: var(--prose-measure)` and nothing else caps a hero.
- `pnpm run test` passes.

## Notes

- The hero payload on the measured page falls from the 99 KB 1920w variant to
  the 48 KB 1280w one, which is the widest a 2x window selects; at 1x the 960w
  variant, 34 KB, fills the measure.
- Images inside the prose are already in that column, and the `img` shortcode
  and Markdown render hook keep the 320-1920 ladder, so an in-body image
  declares a full-width hint while it is drawn at the measure. Widening that
  hint is a separate card.
