---
title: 'Featured card images have empty alt text'
description: 'Featured card images have empty alt text'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references: null
---

Every featured image renders with an empty `alt` attribute.

<!--more-->

`be-best/layouts/_partials/images/featured-image.html:24-25` reads
`$image.Params.title` and `.Params.caption`, which come from Hugo image
metadata. No content defines any: `grep '^image:' content` returns nothing. The
values are therefore always nil, `alt=""` reaches the markup, and the caption
element in `image-variants.html:43` never renders. `public/post/index.html` and
`public/post/garden/index.html` each carry 6 empty `alt` attributes.

## Featured card images have empty alt text

- [ ] The 44 `featured.webp` files under `content/` each get Hugo image
      metadata: an `image:` front matter block naming the file, with
      `params.title` and `params.caption`.
- [ ] When metadata is missing, `featured-image.html` falls back to the page
      title, so `alt` is never empty.
- [ ] A caption renders under the featured image of a post page, and not under a
      card.

## Acceptance Criteria

- `grep -c 'alt=""' public/post/index.html` and
  `grep -c 'alt=""' public/post/garden/index.html` both report 0, against 6
  today.
- Every `<img>` written by `image-variants.html` has an `alt` equal to the
  caption in that image's metadata, and no `alt` is the empty string on any page
  in `public/`.
- `pnpm run test` passes, including html-validate.
