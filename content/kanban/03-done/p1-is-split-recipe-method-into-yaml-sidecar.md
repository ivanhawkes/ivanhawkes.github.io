---
title: 'Split the recipe method into YAML'
description: 'Recipe steps are prose, not structured data'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: 2026-10-29
    due: null
    dependencies: null
    references: null
---

Recipe steps are prose, not structured data.

<!--more-->

A recipe bundle holds two files: `index.md`, the page, and `ingredients.yaml`,
the structured ingredients of each dish of the recipe. The method had no
sidecar: every step was written as a markdown list in `index.md`, under a
section named after the dish it belongs to (`## Crust`, `## Filling`) or under
`## Directions`. Steps were therefore prose - unqueryable, and styled by
`.prose` (the reason for `is-recipe-list-steps-render-as-paragraphs`).

Each recipe is now three files in the same bundle:

- `index.md` - the description and the background, with the method removed.
- `ingredients.yaml` - unchanged.
- `method.yaml` - new, the steps of each dish, one string per step.

`method.yaml` mirrors `ingredients.yaml`: a `method-list` root, one `dish` entry
per component, and a `method` list of steps under each dish.

```yaml
method-list:
    - dish: Steak
      method:
          - fry the steak
          - rest the steak
    - dish: Pepper Sauce
      method:
          - the first step of the recipe
          - the second step
          - third step
```

## Work

- [x] **Method sidecar** - `method.yaml` in all 58 recipe bundles, with one
      `dish` per component and its steps in the `method` list, in file order:
      442 steps.
- [x] **Dish names** - each `dish` takes the name of the same dish in the
      recipe's `ingredients.yaml`, so the two sidecars pair up. A section that
      names no component (`## Directions`, `## Main`) is named by the recipe
      title.
- [x] **Step text** - one list item is one step, its continuation lines joined
      into a single string, wording and markdown untouched. 405 list items sat
      in the original pages: 401 became steps, 7 of them with a parent label
      prefixed, and 2 stayed (below). 41 steps were written as paragraphs, not
      list items, and moved too.
- [x] **Nested labels** - a label item that only names a nested list is folded
      into the steps it labels: `Batter:` yields "Batter, option 1: ..." and
      "Batter, option 2: ..." (sweet-and-sour-pork), `Stir fry:` prefixes four
      steps (mongolian-beef), and the `Alternatively:` paragraph prefixes the
      first alternative step (char-siu-pork).
- [x] **Prose stays** - background is not a step, and stays in `index.md`:
      descriptions, `## Notes`, `## Optional`, `## Experimental`, the
      `## Why It Works` section of tonkotsu-stock, the falafel variation
      sections, yields ("Makes 4 cups."), storage paragraphs, troubleshooting
      and its two bullets in felafel, and the hygiene paragraph of
      ginger-beer-bug. A heading that empties out goes with its steps; a heading
      that keeps prose keeps its heading. Nothing is rewritten and nothing
      embellished: a step's text is the text it had.
- [x] **Specifications** - the functional, technical and requirements documents
      named `ingredients.yaml` as the only recipe sidecar; they name
      `method.yaml` and its shape now.
- [x] **Checks** - `pnpm run test` passes, and a throwaway script compared every
      `method.yaml` with the page it came from, from git: each step string is
      found in the original body, and every list item under a method heading is
      present in the sidecar.

## Acceptance Criteria

- `pnpm run test` passes: 424 pages with exactly one `h1`, 59 placeholder
  classes and 59 rules matched, cards valid, Prettier clean.
- All 58 recipe bundles carry `index.md`, `ingredients.yaml` and `method.yaml`.
- Every `method.yaml` parses as YAML: a `method-list` root, every entry carries
  a `dish` string and a `method` list of non-empty strings.
- 49 of 58 bundles name the same dishes in both sidecars. The other 9 keep the
  names of the sections they came from - `char-siu-pork`, `red-braised-pork`,
  `sweet-and-sour-pork`, `porchetta`, `ginger-beer-bug`, `lamb-rogahn-josh`,
  `murghi-korma`, `pork-vindaloo` and `hummus` - because their ingredients
  dishes are `Ingredients`, `Main`, `Caramel` and the like, or a single dish
  covering several method sections.
- The steps removed from `content/post/recipe/**/index.md` are the steps written
  to `method.yaml`: none lost, duplicated, reworded or invented. The 41 prose
  steps are kept whole - a paragraph is one step, never split.

## Notes

- Rendering is not in this card: the recipe layout reads `index.md` and
  `ingredients.yaml` only, so a page built from this card alone shows its
  ingredients, its meta, and its background, with no method.
  `is-render-the-recipe-method-yaml` covers the theme, and the two cards land
  together.
- `assets/` holds a JSON-schema style definition for card front matter; recipe
  sidecars have none. A definition for `method.yaml`, and the check that applies
  it, belong to the theme card.
- A step string may hold markdown: the link to the light batter recipe in
  sweet-and-sour-pork, and the bold labels of chile-colorado. Rendering them as
  markdown, not as text, is the theme card's job.

## Not in scope

- Front matter, ingredients, images, and any recipe text that is not a step.
- The layout, partial and CSS that present the method on the page.
- `cmd/kan`, the board, and the card schema.
