---
title: 'Recipe list steps render as paragraphs'
description: 'Recipe steps render wrapped in <p> tags'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: 2026-10-26
    due: null
    dependencies: null
    references: null
---

Recipe steps render wrapped in `<p>` tags.

<!--more-->

Every step of every recipe sits in a CommonMark _loose_ list: a blank line
separates each item from the next. Goldmark marks such a list loose and wraps
each item's body in a paragraph, so `/post/recipe/` pages emit
`<li><p>step</p></li>`. Posts write tight lists - no blank lines between items

- and emit `<li>step</li>`, which is why only recipes show the extra markup.

The markup costs vertical space: `@tailwindcss/typography` styles
`.prose > ul > li > p:first-child` at `margin-top: 1.25em` and the matching
`last-child` at `margin-bottom: 1.25em`, on top of the `0.5em` it gives every
`li`. Steps are spaced like paragraphs of prose, so a 12 step recipe page runs
to three screens of white gaps. Nested lists are worse: they are not
`.prose > ul > li`, so their items take the plain paragraph margin of `1.25em`
with no compensation.

The card is a content bug, not a theme bug: no layout, partial, shortcode or CSS
rule adds a paragraph to a list item.

## Recipe list steps render as paragraphs

- [x] Every blank line between two sibling items of a list in
      `content/post/recipe/` is deleted, in the 47 recipe `index.md` files that
      need it: 294 blank lines removed, no other line touched.
- [x] Nested lists are tightened too, so the outer list stays tight: a blank
      line between two children of a nested list also separates the items of its
      parent list.
- [x] Items with a second paragraph, blockquotes and fenced code keep their
      blank lines: only a blank line whose next non-blank line is a sibling item
      marker is removed.
- [x] The blank line that closes a list before a heading or paragraph stays, so
      the list is not glued to the block after it.

## Acceptance Criteria

- `grep -R -P -l -z '<li>\s*<p>' public/post/recipe` finds no match: 0 of the 58
  recipe pages emit a paragraph inside a list item, 47 of them did before.
- `grep -R -P -l -z '(?m)^[-*+] .*\n\n[-*+] ' content/post/recipe --include='index.md'`
  reports no recipe written as a loose list; 34 did before. The gap between 34
  and 47 is lists whose items end in a continuation line, which the source
  pattern misses and the build check catches.
- `pnpm run test` passes: 659 pages, 408 processed images, 409 pages with
  exactly one `h1`, 35 cards valid.
- Prettier reports `content/post/recipe/**/*.md` clean, so the change survives
  `lint-staged` without being reflowed.

## Notes

- The prose plugin cannot absorb the symptom by zeroing `li > p` margins: it
  would leave 294 stray `<p>` in recipes that need them for multi paragraph
  items, and the plugin's rules are written for loose lists on purpose.
- `content/post/linux/install-debian-13-trixie/index.md` is the one post with
  the same loose style. It is the only page under `/post/` outside the recipes
  still rendering `<li><p>`, and is left alone as out of scope.

## Not in scope

- Tightening the loose lists in `content/kanban/` and `content/specification/`,
  which are read as cards and documents, not as prose steps.
