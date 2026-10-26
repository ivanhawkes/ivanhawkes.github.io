---
title: 'Cards fall back to the section image'
description: 'Cards fall back to the section image'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: 2026-10-26
    dependencies: null
    references:
        - 'be-best/layouts/_partials/images/featured.html'
---

A card with no image of its own shows the section's image.

<!--more-->

`be-best/layouts/_partials/images/featured-image.html:14` falls back to
`.Parent.Page.Resources` when the page has no `featured.webp`. In a listing,
every image-less post therefore renders its section's image, and the same large
file repeats across the page. All 6 cards on `public/post/garden/index.html`
render `/post/garden/featured_hu_ecf1cdc248bd6b78.jpg`: no garden post in that
page carries its own `featured.webp`. At the 1920w variant the section image
weighs 363 KB, so the page requests 2.2 MB of one picture.

## Cards fall back to the section image

- [x] A card selects an image from its own page resources only: the
      `.Parent.Page.Resources` lookup is off the card path, behind an `inherit`
      flag a card does not set.
- [x] A card with no image renders text only, with no `<img>`, no `<picture>`
      and no `bigImgDiv` wrapper: the lookup returns nil and the card writes
      nothing, not even the empty link that used to wrap the image.
- [x] The page-level featured image keeps its inherited-image behaviour,
      documented as intended for post pages: the flag defaults to true, and
      `featured-image.html` documents both paths.

## Acceptance Criteria

- On `public/post/garden/index.html`, each image URL appears at most once, and
  the number of card images equals the number of cards whose post owns a
  `featured.webp`, 0 on that page today. 12 cards, 0 images.
- `public/post/index.html` keeps 6 cards with 6 distinct image URLs. 6 cards
  (the section holds 6), 6 distinct URLs, each a section's own image.
- No page in `public/` repeats the same featured image URL in two cards: 0 pages
  repeat one.
- `pnpm run test` passes.

## Notes

- Fixed with the card redesign of `p2-ft-card-design-improvements`, which owns
  the card path. The lookup is `partial "images/featured.html"`;
  `featured-image.html` keeps the page-hero path with `inherit` defaulting to
  true, and the card partials pass `inherit false`.
- The criteria counted 6 cards per listing. Section listings paginate at twelve
  entries, as the functional specification has always said, and the card
  redesign moved the four paginated sections from 6 to 12 to match, so the
  listings named above are measured at 12.
- **Superseded 2026-10-26** by the removal of the parent-section fallback on the
  page-hero path, recorded in the decision record. The third item below, which
  kept `inherit` defaulting to true for pages, no longer describes the theme:
  the flag and the `.Parent` lookup are gone, `featured.html` is folded into
  `featured-image.html`, and no page shows an ancestor section's image. The card
  behaviour recorded here is unchanged.
