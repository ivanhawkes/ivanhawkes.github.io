---
title: 'Posts share the section bundle'
description: 'Posts sit loose in the section bundle'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: 2026-10-26
    due: null
    dependencies: null
    references:
        - p2-us-featured-images
        - p2-is-card-image-parent-fallback
        - p2-ft-post-image-carousel
---

Posts sit loose in the section bundle, not their own.

<!--more-->

`content/post/cryengine`, `garden`, `general`, `linux` and `programming` held 47
page files as plain `.md` files next to the section's `_index.md`. Hugo resolves
the page resources of a loose page file to every file in its folder, so each of
the 47 read the section's `featured.webp` and its siblings as its own resources.
The functional specification says each post is a page bundle holding its own
media: true of the 99 posts written as bundles, false of these 47.

## Posts share the section bundle

- [x] Each of the 47 files is moved with `git mv` to
      `content/post/<section>/<name>/index.md`, so every post under
      `content/post/` is a page bundle of its own: 15 cryengine, 15 garden, 7
      general, 6 linux, 4 programming.
- [x] No file content is edited: the change is 47 renames with 0 insertions and
      0 deletions.
- [x] Kanban cards keep their flat files. The filename is the card id, which the
      documentation shortcodes match, which `kan` writes, and which
      `pnpm run test:kanban` validates: giving a card a folder of its own breaks
      all three.

## Acceptance Criteria

- `find content/post -name '*.md' ! -name '_index.md' ! -name 'index.md'` prints
  nothing: 0 loose post files, 47 before.
- Each of the five section folders holds `_index.md`, its `featured.webp`, and
  folders only.
- `pnpm run test` passes: 657 pages, 408 processed images, 407 pages with
  exactly one `h1`, 33 cards valid.
- The build writes the same 1157 files as the build before the change, so every
  URL survives, `/post/general/first-steps-with-fpga/` included.

## Notes

- Hugo's title-case cache is an LRU shared across its string transformations, so
  the number of titles computed in a build decides how the `deep-fried` term
  title renders. A control build of `HEAD` with one unrelated page added flips
  it between `Deep Fried` and `Deep-Fried` across 4 tag pages, which is what the
  4-file diff of this change shows. Nothing in the move caused it.
- Found while removing the inherited featured image, in `p2-us-featured-images`
  and `p2-is-card-image-parent-fallback`: the loose files are why a post page's
  own resources held the section's `featured.webp` at all.

## Not in scope

- A carousel over the images a post bundles: `p2-ft-post-image-carousel`, which
  now reads a bundle that is the post's own.
