---
title: 'Card Design Improvements'
description: 'Improvements to the design of cards'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: 2026-10-26
    due: null
    dependencies:
        - 'p2-is-card-image-parent-fallback'
    references:
        - 'be-best/assets/css/cards.css'
        - 'be-best/layouts/_partials/components/card.html'
---

Cards are used to display sections of information that should be kept separated
from each other. These need a quick design pass.

<!--more-->

Update the design elements used when displaying a card. They are used with
posts, about profiles, and recipes.

## Goals

- [x] **title font** - the title is an `h3` set at the prose `h3` size (1.25rem,
      weight 600) in the ink headings use.
- [x] **title state** - the title links, and carries the link colour and an
      underline on hover and the focus ring on keyboard focus, at rest in the
      heading ink.
- [x] **hero image** - a card shows an image only when its own page bundle
      carries `featured.webp`, never the featured image of its parent folder,
      and writes no `<img>`, no `<picture>` and no wrapper when it has none.
- [x] **layout** - a listing is a masonry of one, two and three columns at the
      768px and 1280px breakpoints, so a card with no image sits short beside a
      card with one, and the sections paginate at twelve cards.

## Acceptance Criteria

- One partial and one stylesheet own the design:
  `be-best/layouts/_partials/components/card.html` and
  `be-best/assets/css/cards.css`, and no card partial repeats the frame.
- `grep -c 'class="card"' public/post/garden/index.html` reports 12 cards and
  `grep -c '<img' public/post/garden/index.html` reports 0 images.
- On every page in `public/`, no featured image URL appears in two cards.
- `pnpm run test` passes.

## Notes

- The five card partials (`posts`, `recipes`, `projects`, `profiles`, `about`)
  are now thin wrappers over the shared card, which takes a dict: `page`,
  `title`, `url`, `meta`, `summary`. The about card has no page behind it, being
  site data, so it gets an ink title with no link and no image.
- The image lookup moved to `be-best/layouts/_partials/images/featured.html`,
  which returns the resource and takes an `inherit` flag: the page hero keeps
  its inherited image, a card passes `inherit false`.
- The heading and link ink are tokens (`--heading`, `--link`, `--link-hover`) in
  `tokens.css`, and `prose-overrides.css` paints the prose from the first two,
  so a card title and a prose heading are the same colour in every scheme,
  including paper and forced colours.
- Card media is capped at 14rem and cropped, and the placeholder box takes the
  shape of the cropped image, so one square image does not tower over a column.
- The profile listing now cards the profile pages, matched to the person data by
  `profile` id: the card links to the page (it linked to `/profiles/<id>/`,
  which is no page) and names the person (`Ivan Hawkes`, `Developer`) rather
  than the page title. The About core values render on `/about/` only, not on
  every listing the `about` type shares.
