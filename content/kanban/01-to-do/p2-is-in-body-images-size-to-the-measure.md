---
title: 'In-body images size to the measure'
description: 'In-body images size to the measure'
date: '2026-10-26'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references:
        - 'be-best/layouts/_markup/render-image.html'
        - 'be-best/layouts/_shortcodes/img.html'
---

A Markdown image asks for variants wider than it is drawn.

<!--more-->

`_markup/render-image.html:21` and `_shortcodes/img.html:34` write the hint
`(min-width: 1024px) 100vw, 50vw`, and both ladder from 320 to 1920
(`render-image.html:19`, `img.html:2`). The image they write is inside the
`.prose` block of `page/content.html`, capped at `--prose-measure`, the 65ch a
page hero now takes too (`p2-is-hero-images-use-the-prose-measure`), so the hint
names a box about three times the one the browser draws and offers widths that
measure can never pick.

Measured on the current build: 51 in-body `bigImgDiv` pictures, of which 7 offer
a variant wider than 1280w, 5 at 1600w and 2 at 1920w. The two 1920w webp files
weigh 136 KB and 97 KB.

## In-body images size to the measure

- [ ] The Markdown render hook names the prose measure in its `sizes` hint, as
      `featured-image.html` does for a hero, and stops its ladder at 1280.
- [ ] The `img` shortcode sizes to the same box, keeping the parameters it
      documents (`phn`, `simple`, `ctr`) working.
- [ ] The hint and the ladder are stated once, so a third image path cannot
      drift from the measure again.

## Acceptance Criteria

- No in-body `srcset` in `public/` offers a variant wider than 1280w: 0 of the
  51 pictures today offer 1600w or 1920w.
- Every in-body picture names the measure in `sizes`, and no page reports
  `100vw` for an image inside `.prose`.
- `dashboard/raw/all-html-elements.html` still renders its images, and
  `pnpm run test` passes.

## Notes

- The raw dashboard pages carry no `.prose` wrapper, so an image there is not
  capped at the measure; the hint is written for the article path, and that page
  is the test that a fixed hint does not break.
