---
title: 'Render the recipe notes sidecar'
description: 'notes.md prose renders nowhere: nothing reads it'
date: '2026-10-30'
author: Ivan Hawkes
params:
    completionDate: 2026-10-30
    due: null
    dependencies: ['p1-is-render-the-recipe-method-yaml']
    references:
        - 'be-best/layouts/_partials/recipes/notes.html'
        - 'be-best/layouts/recipe/page.html'
---

notes.md prose renders nowhere: nothing reads it.

<!--more-->

The split of `3d53ff4` moved the notes of five recipes out of `index.md` and
into a `notes.md` sidecar each. No layout read the file, so that prose stood in
the bundle and rendered nowhere: a recipe page ran its content, its steps, and
straight past its notes.

## Work

- [x] **Notes partial** - `be-best/layouts/_partials/recipes/notes.html`, the
      sibling of `method.html` and `ingredients.html`: it reads the bundle's
      `notes.md` with `.Resources.GetMatch` and emits the resource's rendered
      `.Content`.
- [x] **Leaf-bundle resource** - Hugo makes a markdown file inside a leaf bundle
      a resource of its page, of type `page`, not a page in its own right: the
      five files build no URL, join no listing and add no page: the build gains
      none when they sit in the tree. The partial reads them as resources.
- [x] **Placement** - the partial is the last call in the recipe page's second
      column, after `method.html`, so a page runs the prose of `index.md`, the
      steps of `method.yaml`, then the prose of `notes.md`.
- [x] **Prose wrapper** -
      `recipe-notes prose w-full prose-neutral prose-custom     dark:prose-invert`,
      the classes the method's wrapper sets, so the notes carry the prose and
      the scheme of the steps above them. `recipe-notes` is a hook: CSS not
      written (CNW).
- [x] **Optional** - a bundle with no `notes.md` prints nothing at all: 53 of
      the 58 recipe bundles carry none, and each of those pages renders exactly
      as it did before the sidecar existed.
- [x] **Definition** - the sidecar paragraph of
      `content/specification/technical/index.md` and the two recipe bullets of
      `AGENTS.md` name the file, the partial that renders it, and the resource
      rule that keeps it from building a page.

## Acceptance Criteria

- [x] Each bundle that carries the sidecar renders it under its steps -
      lamb-rogahn-josh, murghi-korma, laksa, red-curry-paste, tom-yum-soup: one
      `recipe-notes` div on each of the five pages, after the last
      `recipe-method-steps` list.
- [x] A page with no `notes.md` renders nothing of it: the other 53 recipe pages
      carry no `recipe-notes` div, and no placeholder line.
- [x] A note stays a section, not a page: the five files open their headings at
      level two, each page keeps exactly one `h1`, and the notes heading is the
      page's only `h2` - red-curry-paste carries two, `Optional` and `Notes`.
- [x] The file is rendered, not printed: its headings reach the page with their
      anchor ids, as `id="notes"` and `id="optional-method"`.
- [x] `pnpm run test` passes: 425 pages with exactly one `h1`, 45 pages carrying
      images with 59 placeholder classes against 59 rules, 50 cards valid, 58
      method files valid and their 442 steps rendered, prettier setup intact.

## Notes

- The notes reach a feed nowhere, and no listing: they are a resource, and the
  page's `.Content` and `.Summary` are the prose of `index.md` alone. The card
  of a recipe, and the section's RSS, stay as they stood.
- `notes.md` carries no front matter. Hugo parses its absence, and `.Content` is
  the whole file.
- No content references the sidecar: `grep -rn notes.md content/post/recipe/`
  finds nothing, so the file is read by the layout alone.
- The leaf-bundle rule was measured, not remembered: a debug build of the laksa
  bundle lists `notes.md` among `.Resources` with `rt=page` and reports
  `.Pages: 0`.

## Not in scope

- A schema and a check for `notes.md`, as `assets/recipe-method.yaml` gives
  `method.yaml`: no validator reads the file, and no check reads its rendering.
- Moving the notes out of the prose of the 53 recipes that keep them in
  `index.md`.
- A styling pass for the notes column: the prose sets them as they stand.
