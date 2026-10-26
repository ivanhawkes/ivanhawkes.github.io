---
title: 'In-body images size to the measure'
description: 'In-body images size to the measure'
date: '2026-10-26'
author: Ivan Hawkes
params:
    due: null
    completionDate: 2026-10-26
    dependencies: null
    references:
        - 'be-best/layouts/_partials/images/boxes.html'
        - 'be-best/layouts/_markup/render-image.html'
        - 'be-best/layouts/_shortcodes/img.html'
---

A Markdown image asks for variants wider than it is drawn.

<!--more-->

`_markup/render-image.html:21` and `_shortcodes/img.html:34` wrote the hint
`(min-width: 1024px) 100vw, 50vw`, and both laddered from 320 to 1920
(`render-image.html:19`, `img.html:2`). The images they write sit inside the
`.prose` block of `page/content.html`, capped at `--prose-measure`, the 65ch a
page hero takes too (`p2-is-hero-images-use-the-prose-measure`), so the hint
named a box about three times the one the browser draws and offered widths that
measure can never select.

Measured before the change: 51 in-body `bigImgDiv` pictures, of which 7 offered
a variant wider than 1280w, 5 at 1600w and 2 at 1920w. The two 1920w webp files
weigh 136 KB and 97 KB, and are the widest a browser can pick for a picture 600
pixels wide.

## In-body images size to the measure

- [x] The Markdown render hook names the prose measure in its `sizes` hint and
      stops its ladder at 1280, as a hero does.
- [x] The `img` shortcode sizes to the same box, and keeps the parameters it
      documents: `holder`, `phn`, `rounds`, `hint`, `filter` and `simple`.
- [x] The hint and the ladder are stated once. `images/boxes.html` returns the
      boxes the theme draws an image in, `prose` and `card`, each a `sizes` hint
      and a `widths` ladder, and every path reads one: `featured-image.html` the
      hero's, `render-image.html` and `img.html` the prose's, `card.html` the
      card's. The strings that were inline in those four callers are gone.
- [x] `image-variants.html` takes a box as its caller's contract: it asks for
      `sizes` and `widths` and calls `errorf` when one is missing, so a path
      that invents its own box fails the build instead of drifting. The 320-1920
      fallback ladder it used to carry is deleted.

## Acceptance Criteria

- No `srcset` in `public/` offers a variant wider than 1280w: 0 of the 51
  in-body pictures, whose widest entries are now 320w (2), 960w (42) and 1280w
  (7), and 0 of the 20 heroes.
- Every in-body picture names a box: 2 distinct `sizes` values across the site,
  the prose box and the card box, and no `sizes` of an image inside `.prose`
  reports a full viewport width.
- A card is unchanged: `public/post/index.html` keeps its grid hint and its
  ladder to 960.
- Hugo generates fewer variants: `Processed images` falls from 384 to 366.
- `pnpm run test` passes, `html-validate` included.

## Notes

- The original third criterion asked after
  `dashboard/raw/all-html-elements.html`, the CSS test page. That page is not in
  `content/`, and there is no `dashboard` section, so the check is dropped;
  every image the site draws is in one of the three boxes `boxes.html` names,
  the prose, a card and a hero.
- No content calls the `img` shortcode, so that path is covered by the build
  only, not by a rendered page.
- The `picture` markup is still written three times, in `image-variants.html`,
  `render-image.html` and `img.html`, each with its own placeholder key:
  `image-variants.html` keys on `md5 .RelPermalink` and the other two on
  `md5 .Name`, which is why a card's LQIP is missing
  (`p2-is-card-lqip-placeholder-unused`). Folding the three into one writer
  settles that card too; this card only stopped the widths drifting.
