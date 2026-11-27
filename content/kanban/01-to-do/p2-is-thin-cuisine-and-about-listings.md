---
title: 'Thin Cuisine and About Listings'
description: 'Cuisine and about listings carry few words'
date: '2026-11-27'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

The cuisine and about listing pages carry almost no text of their own.

<!--more-->

## Findings

Words in `<main>` on the live site, 2026-11-27: Vietnamese 28, Malaysian 36,
Japanese 67, Australian 74, Italian 76, General 78, Middle Eastern 78, Mexican
89; `/about/profile/` 11 and `/about/project/` 57. A listing that is a list of
links and a sentence reads as thin to a search engine.

## Done When

Each cuisine `_index.md` has an introduction of 80 to 150 words in the owner's
own voice: why the cuisine matters, what is here and what to start with. The
profile and project listings either gain the same, or are made noindex and
dropped from the sitemap as the tag listings are (`meta.html`, the `cascade` in
`config/_default/hugo.yaml` and `scripts/validate-jsonld.mjs`).
