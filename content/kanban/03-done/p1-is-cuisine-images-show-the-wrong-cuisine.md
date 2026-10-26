---
title: 'Cuisine images show the wrong cuisine'
description: 'Four recipe section images depict another cuisine'
date: '2026-10-25'
author: Ivan Hawkes
params:
    completionDate: 2026-10-26
    due: null
    dependencies: null
    references:
        - p2-us-card-image-alt-text
---

Three pairs of cuisine sections shared one `featured.webp`, so four sections
displayed a label that was not theirs.

<!--more-->

## Cuisine images show the wrong cuisine

- [x] `content/post/recipe/american/featured.webp` and
      `content/post/recipe/australian/featured.webp` (digest `86757ab8`) are the
      same green "Pastries" title card; each section gets an image of its own
      food. American is now a hot dog in a bun, Australian a cut-open meat pie.
- [x] `content/post/recipe/mexican/featured.webp` and
      `content/post/recipe/middle-eastern/featured.webp` (digest `bdf27870`) are
      the same green "Middle Eastern" title card; Mexican gets chili con carne,
      Middle Eastern gets chicken kebabs over charcoal.
- [x] `content/post/recipe/japanese/featured.webp` and
      `content/post/recipe/chinese/featured.webp` (digest `c90fea9a`) are the
      same Mongolian beef plate; Japanese gets an unagi don.
- [x] French, Italian, Malaysian, Thai and Vietnamese, which shared the title
      cards, get dishes of their own: bacon-wrapped chicken and chips, pizza
      margherita, curry laksa, pad thai and beef pho.
- [x] Images are added through Git LFS.
- [x] Each of the four sections' `resources` params describe the new image:
      `params.caption` is the alt text of what is shown, `params.title` the
      caption under it, and no alt text names another cuisine.

## Acceptance Criteria

- `md5sum content/post/recipe/*/featured.webp | awk '{print $1}' | sort | uniq -d`
  prints nothing: no two cuisine sections share an image.
- A crop of each of the 13 cuisine `featured.webp` files shows food, and the
  words printed on it, if any, name its own cuisine.
- `grep -A4 '^resources:' content/post/recipe/*/_index.md` shows a
  `params.caption` naming that section's cuisine, for all 13 sections.
- `pnpm run test` passes, html-validate and heading checks included.

## Notes

- `4048418` (2026-10-25) replaced the ten non-conforming section images; every
  file is a Git LFS object. The swap left nine sections - `american`,
  `australian`, `french`, `italian`, `japanese`, `malaysian`, `mexican`,
  `middle-eastern` and `thai` - with the caption of the image they no longer
  carry, three of them naming another cuisine, and Vietnamese with a bare "A
  bowl of pho soup."
- Each section's `params.caption` now names its own cuisine and describes the
  dish in frame: hot dog, meat pie, bacon-wrapped chicken with chips, pizza
  margherita, unagi don, curry laksa, chili con carne, chicken kebabs, pad thai,
  beef pho. The alt text of a section's image reaches the cuisine card and every
  recipe page under it, through the parent-resource fallback in
  `featured-image.html`.
- Verified:
  `md5sum content/post/recipe/*/featured.webp | awk '{print $1}' | sort | uniq -d`
  prints nothing (14 unique files, 13 cuisines plus `general`); no caption in
  `content/post/recipe/*/_index.md` names a foreign cuisine; `pnpm run test`
  passes, 412 single-h1 pages, 34 cards valid.

## Not in scope

- Sizing card variants: `p2-us-featured-images`.
- Alt text for images that show the right thing: `p2-us-card-image-alt-text`,
  done.
- `content/post/recipe/featured.webp`, the Recipes root image: its caption
  mentions chopsticks on the rim that are not in frame.
