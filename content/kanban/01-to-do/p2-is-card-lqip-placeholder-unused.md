---
title: 'Card LQIP placeholder class unused'
description: 'Card LQIP classes match no CSS rule'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references: null
---

Card images carry an LQIP class that no page rule styles.

<!--more-->

`be-best/layouts/_partials/images/image-variants.html:7` builds the class from
`md5 $src`, where `$src` is the image `RelPermalink`
(`be-best/layouts/_partials/images/featured-image.html:23`), while
`be-best/layouts/_partials/images/image-process.html:18` emits rules keyed on
`md5 .Name`, the bare filename. The two keys never agree, and
`be-best/layouts/_partials/meta/head.html:54` runs the generator over the
current page's resources only, so the images of listed child pages get no rule
at all.

## Card LQIP placeholder class unused

- [ ] Both sides key the placeholder on the same string: `image-variants.html`
      uses `md5 .Name`, matching `image-process.html`.
- [ ] `meta/head.html` generates rules for every image the page renders,
      covering the images of the pages it lists, not just the resources of the
      current page.
- [ ] A card image shows the gradient and low quality placeholder background
      while the full variant loads.

## Acceptance Criteria

- In `public/post/index.html`, every
  `<div class="relative bigImgDiv imgB-<hash>-LQIP">` has a matching
  `.imgB-<hash>-LQIP {` rule in a `<style media="screen">` block on the same
  page, which currently has none.
- `public/post/garden/index.html` emits no rule whose selector matches no
  element: the `.imgB-d8352c9c275e0c7505f77468f2acb1ad-LQIP` rule it writes
  today matches nothing, and the cards use
  `imgB-5c661f599e50a2454451f58afa458d4e`.
- `pnpm run test` passes.
