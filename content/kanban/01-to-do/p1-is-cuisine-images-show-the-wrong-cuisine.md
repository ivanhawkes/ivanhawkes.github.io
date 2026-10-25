---
title: 'Cuisine images show the wrong cuisine'
description: 'Four recipe section images depict another cuisine'
date: '2026-10-25'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references:
        - p2-us-card-image-alt-text
---

Three pairs of cuisine sections share one `featured.webp`, so four sections
display a label that is not theirs.

<!--more-->

## Cuisine images show the wrong cuisine

- [ ] `content/post/recipe/american/featured.webp` and
      `content/post/recipe/australian/featured.webp` (digest `86757ab8`) are the
      same green "Pastries" title card; each section gets an image of its own
      food.
- [ ] `content/post/recipe/mexican/featured.webp` and
      `content/post/recipe/middle-eastern/featured.webp` (digest `bdf27870`) are
      the same green "Middle Eastern" title card; Mexican gets a Mexican dish.
- [ ] `content/post/recipe/japanese/featured.webp` and
      `content/post/recipe/chinese/featured.webp` (digest `c90fea9a`) are the
      same Mongolian beef plate; Japanese gets a Japanese dish.
- [ ] Images are added through Git LFS.
- [ ] Each of the four sections' `resources` params describe the new image:
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

## Not in scope

- Sizing card variants: `p2-us-featured-images`.
- Alt text for images that show the right thing: `p2-us-card-image-alt-text`,
  done.
