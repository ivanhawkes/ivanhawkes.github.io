---
title: 'Card LQIP placeholder class unused'
description: 'Card LQIP classes match no CSS rule'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-27'
    dependencies: null
    references: null
---

Card images carry an LQIP class that no page rule styles.

<!--more-->

`be-best/layouts/_partials/images/image-variants.html:7` builds the class from
`md5 $src`, where `$src` is the image `RelPermalink`
(`be-best/layouts/_partials/images/featured-image.html:23`), while
`be-best/layouts/_partials/images/image-process.html:18` emits rules keyed on
`md5 .Name`, the bare filename. The two keys never agree, and
`be-best/layouts/_partials/meta/head.html:54` runs the generator over the
current page's resources only, so the images of listed child pages get no rule
at all.

## Fix

- Key both sides on the md5 of the image's own `RelPermalink`. The card asked
  for `md5 .Name`, the bare filename every featured image shares: one filename
  gives one rule per section, not one per card, and a listing would paint a
  recipe card with the LQIP of a Cryengine post.
- Record an image where it is drawn. A head cannot walk a body that renders
  after it, and a page's own resources reach only its hero and prose, not the
  images of the pages it lists as cards. Each drawing path
  (`images/image-variants.html`, `_shortcodes/img.html`,
  `_markup/render-image.html`) records the image into the page Scratch, keyed
  per page render by `images/placeholder-key.html`, under the `<md5>-<format>`
  string it puts in the class, so a rule and the class asking for it come from
  one string.
- Emit the rules in the second render pass: `meta/head.html` defers
  `images/image-process.html` with `templates.Defer`, which runs after the body,
  writes a rule per record and drops them. That page has no `Paginator`, so the
  head computes the key and hands it to the deferred template.
- Collect the images of a page's own prose at head time as well, in
  `images/placeholder-collect.html`. Hugo caches rendered Markdown per page, so
  the render hook of a child runs in whichever render touched it first: records
  then move between pages and the rules come and go between builds. A head-time
  scan of the page's Markdown is the part of the set that cache cannot move.
- In a render hook the `page` function names the rendering page, not the page
  the markup belongs to, so each caller passes the page a record belongs to. The
  card plainifies its summary, so a listing draws no image from it.
- `scripts/validate-placeholders.mjs` (`pnpm run test:placeholders`, in the test
  chain) pairs the classes and rules over `public/` and fails on a class with no
  rule and on a rule no element asks for.

## Notes

- A gradient rule is emitted for the `img` shortcode's `GIP` holder; no content
  uses the shortcode today, so the site emits `LQIP` rules for now.
- The generator is a pure function of the records: the same page, the same
  rules. Term pages still move between builds, on tag title casing only, with no
  placeholder text involved.

## Card LQIP placeholder class unused

- [x] Both sides key the placeholder on the same string: `image-variants.html`
      and `image-process.html` use the md5 of the image `RelPermalink`, per
      image and per page.
- [x] `meta/head.html` generates rules for every image the page renders,
      covering the images of the pages it lists, not just the resources of the
      current page.
- [x] A card image shows the gradient and low quality placeholder background
      while the full variant loads.

## Acceptance Criteria

- In `public/post/index.html`, every
  `<div class="relative bigImgDiv imgB-<hash>-LQIP">` has a matching
  `.imgB-<hash>-LQIP {` rule in a `<style media="screen">` block on the same
  page. Verified across `public/`: 45 pages carry placeholders, 59 classes and
  59 rules, each class painted and each rule asked for.
- `public/post/garden/index.html` emits no rule whose selector matches no
  element: it now emits the rules of the images its own cards draw, and none for
  a featured image it never shows.
- `pnpm run test` passes, with the placeholder pairing in the chain.
