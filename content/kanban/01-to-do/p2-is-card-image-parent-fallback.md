---
title: 'Cards fall back to the section image'
description: 'Cards fall back to the section image'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references: null
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

- [ ] A card selects an image from its own page resources only: drop the
      `.Parent.Page.Resources` lookup from the card path.
- [ ] A card with no image renders text only, with no `<img>`, no `<picture>`
      and no `bigImgDiv` wrapper.
- [ ] The page-level featured image keeps its inherited-image behaviour,
      documented as intended for post pages.

## Acceptance Criteria

- On `public/post/garden/index.html`, each image URL appears at most once, and
  the number of card images equals the number of cards whose post owns a
  `featured.webp`, 0 on that page today.
- `public/post/index.html` keeps 6 cards with 6 distinct image URLs.
- No page in `public/` repeats the same featured image URL in two cards.
- `pnpm run test` passes.

Split out from `p2-us-featured-images`, which covers the `sizes` hint only.
