---
title: 'Render the recipe method YAML'
description: 'No layout reads method.yaml: steps render nowhere'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

No layout reads `method.yaml`: steps render nowhere.

<!--more-->

`split-recipe-method-into-yaml-sidecar` moved the steps of all 58 recipes out of
`index.md` and into `method.yaml`. The recipe layout
(`be-best/layouts/recipe/page.html`) reads front matter, the content of
`index.md` and the `ingredients.yaml` partial - it reads no `method.yaml`, so
the steps of a recipe page are gone from the page until this card lands.

## Work

- [ ] **Method partial** - add `be-best/layouts/_partials/recipes/method.html`,
      the sibling of `ingredients.html`: find `method.yaml` in the page bundle,
      `transform.Unmarshal` it, and emit each `dish` with an ordered list of its
      `method` steps.
- [ ] **Step markup** - a step is a string that may hold markdown: render it
      with `.RenderString`, not as raw text, so sweet-and-sour-pork keeps its
      link to the light batter recipe and chile-colorado keeps its bold labels.
- [ ] **Placement** - put the method in the second column of the recipe page,
      under the prose, and keep the ingredients in the first.
- [ ] **Numbering** - an ordered list numbers each step, which prose steps do
      not do today.
- [ ] **Missing sidecar** - a bundle with no `method.yaml` prints nothing: no
      empty heading, no placeholder, no warning.
- [ ] **Definition and check** - put the shape of `method.yaml` in `assets/`
      beside `kanban-card-front-matter.yaml`, and validate every
      `content/post/recipe/**/method.yaml` against it, the way
      `pnpm run test:kanban` validates cards. Add the check to `test:checks`.

## Acceptance Criteria

- [ ] Every recipe page under `public/post/recipe/` renders each dish of its
      `method.yaml` with its steps, in file order, as `<ol>` items: 58 pages.
- [ ] No page renders a step twice, and no page renders a step that
      `method.yaml` does not hold.
- [ ] The link inside a step renders as
      `<a href="/recipe/chinese/light-batter/">` on
      `/post/recipe/chinese/sweet-and-sour-pork/`, and the
      `**Toast the     chiles:**` label renders inside `<strong>`.
- [ ] A page whose bundle has no `method.yaml` renders no method heading.
- [ ] The new check reports the number of `method.yaml` files validated, and
      fails when one deviates from the definition.
- [ ] `pnpm run test` passes.

## Notes

- `ingredients.html` reads its sidecar with
  `.Resources.GetMatch "ingredients.yaml"`; a `method.yaml` is a page resource
  too, and Hugo publishes sidecars next to the page, so both reach `public/`.
- `is-recipe-list-steps-render-as-paragraphs` tightened the step lists in the
  markdown. Steps in YAML have no list to tighten: the vertical space problem is
  solved by the move, and the check that card added still runs over
  `public/post/recipe/`.
- 442 steps are in the sidecars, across 77 dishes: 44 bundles hold one dish and
  14 hold more. The longest is hummus at 19 steps over 2 dishes, then
  tom-yum-soup at 18 over 2, and the two lemon-bars recipes at 13 over 2.

## Not in scope

- Splitting the content: `is-split-recipe-method-into-yaml-sidecar`.
- The notes, optional and variation prose, which stay in `index.md`.
