---
title: 'Featured card images have empty alt text'
description: 'Featured card images have empty alt text'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: 2026-10-25
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

- [x] The 44 `featured.webp` files under `content/` each get image metadata:
      front matter naming the file, with `params.title` and `params.caption`. 41
      pages gained the block; `banana-bread`, `broccoli-bacon-salad` and
      `date-and-walnut-loaf` already had one.
- [x] When metadata is missing, `featured-image.html` falls back to the page
      title, so `alt` is never empty.
- [x] A caption renders under the featured image of a post page, and not under a
      card.

## Acceptance Criteria

- `grep -c 'alt=""' public/post/index.html` and
  `grep -c 'alt=""' public/post/garden/index.html` both report 0, against 6
  today.
- Every `<img>` written by `image-variants.html` has an `alt` equal to the
  caption in that image's metadata, and no `alt` is the empty string on any page
  in `public/`.
- `pnpm run test` passes, including html-validate.

## Notes

- The metadata is Hugo page resource config, the form the three existing recipe
  pages already used, because the partial reads `$image.Params.*` off the
  resource - a top-level `image:` metadata block would not reach it:

    ```yaml
    resources:
        - src: 'featured.webp'
          params:
              title: 'Lemon Bars' # caption under the image
              caption: 'A photograph of lemon bars.' # alt text
    ```

- Page layouts (`post`, `recipe`, `project`, `profile`, `about`) call the
  partial with `(dict "page" . "caption" true)`; the four card partials call it
  with `(dict "page" .)`, so cards get alt text and no caption. Every caller now
  passes a dict: a page context has no `page` key to read, and a page errors on
  the missing field, so a bare `.` cannot be told from a dict.
- Four section images show something other than their section, tracked as
  `p1-is-cuisine-images-show-the-wrong-cuisine`, and their alt text says what
  the file shows: `recipe/american` and `recipe/australian` carry the same
  "Pastries" title card, `recipe/mexican` carries the "Middle Eastern" one, and
  `recipe/japanese` reuses the `recipe/chinese` beef photo.
