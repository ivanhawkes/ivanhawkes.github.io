---
title: 'Render the recipe method YAML'
description: 'No layout reads method.yaml: steps render nowhere'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: 2026-10-29
    due: null
    dependencies: null
    references: null
---

No layout reads `method.yaml`: steps render nowhere.

<!--more-->

`split-recipe-method-into-yaml-sidecar` moved the steps of all 58 recipes out of
`index.md` and into `method.yaml`. The recipe layout
(`be-best/layouts/recipe/page.html`) read front matter, the content of
`index.md` and the `ingredients.html` partial - no `method.yaml` - so the steps
of a recipe page were gone from the page until this card landed.

## Work

- [x] **Method partial** - `be-best/layouts/_partials/recipes/method.html`, the
      sibling of `ingredients.html`: it reads the bundle's `method.yaml` with
      `transform.Unmarshal` and emits one ordered list per dish.
- [x] **Step markup** - each step string is rendered with `.RenderString`, not
      printed, so markdown survives: sweet-and-sour-pork keeps its link to the
      light batter recipe, chile-colorado keeps its six labels in bold.
- [x] **Placement** - the partial sits in the second column of the recipe page,
      under the prose, in a wrapper of the same prose classes the content column
      uses; the ingredients stay in the first column.
- [x] **Numbering** - `<ol class="recipe-method-steps">` numbers each step,
      which the prose steps did not do.
- [x] **Dish heading** - `<h3 class="recipe-method-dish">` names a dish when the
      recipe has more than one dish to name, and a dish called by the page's own
      title is not headed twice: 29 of the 77 dishes are headed, across 14
      pages. The 48 that are not are the 44 recipes with one dish, and the 4
      dishes that carry the page's title - `Banana Bread`, `Ginger Beer Bug`,
      `Hummus`, `Tom Yum Soup`.
- [x] **Missing sidecar** - a bundle with no `method.yaml`, and a file with no
      `method-list`, print nothing: no heading, no placeholder, no warning.
      `ingredients.html` keeps its "No ingredients.yaml file found" line, as
      before.
- [x] **Definition and check** - `assets/recipe-method.yaml` defines the file: a
      `method-list` of one dish entry at least, each with a non-empty `dish` and
      a non-empty `method` list of non-empty strings, and nothing else.
      `scripts/validate-recipe-method.mjs` validates every sidecar against it
      with Ajv and then reads the built page: one `recipe-method-steps` list per
      dish, items equal to the dish's steps in order, and no step standing in
      the prose beside the lists. `pnpm run test:methods` runs it, and
      `test:checks` gained it as its seventh check.

## Acceptance Criteria

- [x] Every recipe page under `public/` renders each dish of its `method.yaml`
      as an ordered list of its steps, in file order: all 58 pages, 77 lists,
      442 steps.
- [x] No page renders a step twice, and no page renders a step the sidecar does
      not hold: the check compares the list items with the file, item by item,
      and searches the rest of the page for each step. Two recipes repeat a step
      in their own data - dashi-stock stores its refrigeration step in both
      broths, hummus strips the bean skins in both cooking paths - and render
      twice because the data says so.
- [x] `/post/recipe/chinese/sweet-and-sour-pork/` renders
      `<a href="/recipe/chinese/light-batter/">Light Batter</a>` inside a step,
      through the link render hook, and chile-colorado renders
      `<strong>Toast the chiles:</strong>`.
- [x] A page with no `method.yaml` renders no method heading. No recipe is in
      that case today, and the partial is verified against a bundle with the
      sidecar removed.
- [x] The check reports what it validated and fails on a deviation:
      `58 method files validated against assets/recipe-method.yaml: no     deviations; rendered: 442 steps in 77 dish lists over 58 pages, each step     once`.
- [x] `pnpm run test` passes: 424 pages with exactly one `h1`, 45 pages carrying
      images with 59 placeholder classes against 59 rules, 49 cards valid,
      prettier setup intact.

## Notes

- Three pages name a dish twice, once as the prose heading of the notes that
  section keeps and once as the heading of its steps: `Filling` on lemon-bars
  and lemon-bars-claire-saffitz, `Ichiban Dashi` and `Niban Dashi` on
  dashi-stock. The prose heading is not the method's to remove - "Do this while
  the crust is baking!" and "Makes 4 cups." are background, and the split left
  them where they were. A dish heading is not suppressed for the collision: a
  page with two lists needs both labels, and an unlabelled pair of numbered
  lists reads worse than a name set twice. Hugo's `.Page.Fragments.Identifiers`
  would find the collision from the template.
- The check runs on the minified build the publish gate uses, and that build is
  not the dev build read from: Hugo's minifier drops the quotes around
  `class=recipe-method-steps`, and smartypants writes the ellipsis of felafel's
  fourth step as `&mldr;`. The pattern accepts a class with or without its
  quotes, the decoder reads `&mldr;` back, and any entity left over is reported
  as an entity with no rule, not as a step mismatch.
- The comparison in the check strips markup and reduces goldmark's smartypants
  substitutions - the right single quote, the en dash, the ellipsis - back to
  the characters the data writes, so a step and its rendering compare. A step
  whose text is a substring of its neighbour is not a hazard: the comparison is
  positional, item against item.
- The check was tested against damage, since a check that cannot fail is a
  comment: a step in the data with no rendering reports a step-count mismatch, a
  step whose text is put into the prose reports `is also prose`, an empty step
  string reports a schema deviation, and a bundle with its sidecar removed
  renders no method and drops out of the count.
- The classes `recipe-method`, `recipe-method-dish` and `recipe-method-steps`
  are hooks. No CSS rule uses them today: the prose already sets the list, its
  numbers and its heading, and `prose-custom` paints them.
- `.RenderString` unwraps a single-paragraph string, so a step is text in its
  `<li>` and not a paragraph in it: no rule is needed to close the gap a wrapped
  step would open.
- `is-recipe-list-steps-render-as-paragraphs` tightened the step lists in the
  markdown; steps in YAML have no list to tighten, and that check still runs
  over `public/post/recipe/`.

## Not in scope

- Splitting the content: `is-split-recipe-method-into-yaml-sidecar`.
- A definition and check for `ingredients.yaml`, which has neither, and the
  placeholder text its partial prints.
- A styling pass for the method column: the prose styles it as it stands.
