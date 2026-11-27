---
title: 'Taxonomy Pages Thin Out the Index'
description: 'Tag listings filled 62% of the sitemap'
date: '2026-11-27'
author: Ivan Hawkes
params:
    completionDate: '2026-11-27'
    due: null
    dependencies: null
    references: null
---

Tag and category listings were 230 of the 371 sitemap URLs.

<!--more-->

## Findings

Measured on 2026-11-27: each tag and category page is a list of titles, 138 tags
hold one post and 63 hold two or three, and the `series` taxonomy had no terms.
They outnumbered the articles in the sitemap almost two to one. The home page
was titled only by the site's name, with a one-line introduction.

## Done

- `meta.html` marks taxonomy and term pages `noindex, follow`, and a site
  `cascade` in `config/_default/hugo.yaml` drops them from the sitemap, which
  falls from 371 URLs to 140. `scripts/validate-jsonld.mjs` checks both.
- The empty `series` taxonomy is removed.
- The home page is titled "Ivan Hawkes: software, recipes and gardening", with
  `linkTitle: Home` keeping the menu and breadcrumbs, and opens with an
  introduction to the owner and the subjects of the site.
- A title that would pass 65 characters with the site's name is written without
  it, which shortens three.
