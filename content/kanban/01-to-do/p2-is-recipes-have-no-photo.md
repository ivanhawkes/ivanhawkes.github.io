---
title: 'Recipes Have No Photo'
description: '46 of 58 recipes have no photo for rich results'
date: '2026-11-27'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

46 of the 58 recipes have no `featured.webp`, so their Recipe JSON-LD has no
image.

<!--more-->

## Findings

Google requires `image` for a recipe rich result, and reports the recipes
without one as invalid items. `pnpm run test:jsonld` counts them: 12 pages state
their featured image, 46 state none. The image is left out rather than guessed,
by the rule in `recipes/jsonld.html`: a cuisine image is not a picture of the
dish.

## Done When

Each recipe cooked again gets a photo of the finished dish as `featured.webp` in
its bundle, with its `caption`, and the count of recipes stating none falls with
each one.
