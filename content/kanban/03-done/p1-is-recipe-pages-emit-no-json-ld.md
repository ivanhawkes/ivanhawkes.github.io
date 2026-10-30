---
title: 'Recipe pages emit no JSON-LD'
description: 'No Recipe JSON-LD: no rich results for recipes'
date: '2026-10-30'
author: Ivan Hawkes
params:
    completionDate: 2026-10-30
    due: null
    dependencies: null
    references: ['p2-is-structured-data-and-social-meta-tags']
---

Recipe pages carry no JSON-LD: no rich result.

<!--more-->

## Current State

Measured over `public/` of the current build, and over the 58 bundles under
`content/post/recipe/`, every one of them `type: recipe`.

- No page carries an `application/ld+json` block at all, so a recipe is indexed
  as a plain page: no recipe rich result, and no ingredient list, step list,
  time or yield read by a crawler. The whole site sits at 0 of 100 in a
  structured-data audit.
- Everything a Recipe needs is already on the page: the title, the cuisine, the
  categories and tags, the portions, the `prep-time` and `cook-time` ISO 8601
  durations, the author, and the `ingredients.yaml` and `method.yaml` sidecars
  that the two columns render.
- 12 of the 58 bundles carry a `featured.webp` of their own; the other 46 carry
  none, and the 15 section photographs of the cuisine pages are not a recipe's
  image: `images/featured-image.html` stopped borrowing a section's photograph
  for a page for that reason.
- The card `is-structured-data-and-social-meta-tags` covers structured data for
  the whole site, and asked for a Recipe block among the types it lists. This
  card is that one type, taken to the end, with a check.

## Work

- [x] **Recipe partial** - `be-best/layouts/_partials/recipes/jsonld.html`, the
      sibling of `ingredients.html` and `method.html`: it builds one Schema.org
      `Recipe` and writes it as `<script type="application/ld+json">`. The
      layout calls it, so the page's structured data and its markup are built
      from the same values.
- [x] **What it states** - `name`, `url`, `@id` as `url#recipe`,
      `mainEntityOfPage`, `image`, `description`, `datePublished`,
      `dateModified`, `author`, `publisher`, `recipeYield`, `recipeCuisine`,
      `recipeCategory`, `keywords`, `inLanguage`, `prepTime`, `cookTime`,
      `totalTime`, `recipeIngredient` and `recipeInstructions`. The three fields
      Google's rich result requires are always there, and an optional key is
      merged in only where the content carries a value, so no key reads `null`
      or `""` to a crawler.
- [x] **Nothing invented** - a field with no value in the content is left out.
      `image` is the bundle's own `featured.webp`, and the 46 pages whose bundle
      has none state no image; `author` falls back to the site's author, which
      one recipe of the 58 needs; `description` falls back to the page's
      summary, Hugo having no summary in `.Description`.
- [x] **Steps as HowToStep** - Google asks for structured steps in place of an
      array of raw strings: each step is a `HowToStep` with `position` in the
      one sequence of the recipe, `text`, and `name` for its dish, under the
      rule `recipes/method.html` sets for the dish heading - a name where a
      recipe has more than one dish, and never the page's own title twice.
- [x] **Times** - `prepTime` and `cookTime` pass the front matter's ISO 8601
      durations through; `totalTime` is their sum, written from the minutes the
      two add to, the way `recipes/recipe-times.html` adds them for the table
      the page shows. `PT1H15M` stays `PT1H15M`, and `PT0M` adds nothing.
- [x] **Plain text** - `be-best/layouts/_partials/recipes/plain-text.html`
      reduces a sidecar's markdown to the words the page shows, so the link a
      step carries arrives as the text it shows and its markup does not. The
      substitutions of goldmark's smartypants are written back as the characters
      the source carries, as the entity a build marks them with and as the
      literal character another build writes.
- [x] **`safe.JS` and `safe.HTML`** - two marks the build needs, and neither is
      decoration. In a `script` element `html/template` writes a value it does
      not trust as a quoted JavaScript literal, so `jsonify` alone emits the
      JSON as a string: `safe.JS` is what makes it data. Writing a partial's
      output escapes HTML, so a reduction that has just decoded every entity is
      re-encoded on the way out: `safe.HTML` is what keeps it reduced.
- [x] **Placement** - the block is the first call in `recipe/page.html`, in
      `main`, beside the recipe it describes: Google reads JSON-LD from the body
      of a page, and the page renders as it did, its markup untouched.
- [x] **Definition** - `assets/recipe-jsonld.yaml` defines the block in the JSON
      Schema style of the other definitions: the required keys, the `const` of
      `@context`, `@type` and the types inside the block, a `pattern` for an ISO
      8601 duration and a language tag, `minLength: 1` on every text field, and
      `additionalProperties: false` throughout, so a key the definition does not
      describe is a deviation.
- [x] **Check** - `pnpm run test:jsonld`, `scripts/validate-recipe-jsonld.mjs`,
      in `test:checks` and so in the publish gate: it validates every block
      against the definition, then reads the block back against the bundle -
      ingredients and steps in file order, the times and their sum, the yield,
      the cuisine, the categories, the tags, the dates, the author, the image,
      and a description that stands in the page's own prose. It scans the other
      663 built pages for a Recipe block that no page shows, and reports any
      entity the reduction has no rule for.
- [x] **Method check, prose** - `validate-recipe-method.mjs` asks that no step
      stands in the prose beside its lists. A block states every step as text,
      so it cut the page's script elements out with the lists, as the prose a
      reader sees is what the check means.
- [x] **Definition of the contract** -
      `content/specification/technical/index.md` gains Recipe Structured Data
      under Data Definitions and Recipe JSON-LD Validator under Tooling, and
      names the eight checks of `test:checks`; `AGENTS.md` names the partial,
      the definition, the check and the marks.

## Acceptance Criteria

- [x] Every recipe page carries exactly one `application/ld+json` block, of
      `@type` `Recipe`, validated against `assets/recipe-jsonld.yaml`: 58 pages,
      no deviation.
- [x] The block states the sidecars: 698 ingredient lines and 442 steps over 77
      dishes, in the order the files write them, each step a `HowToStep` at its
      position, none missing and none invented.
- [x] The times are the page's: `prepTime` and `cookTime` equal the front
      matter's durations on all 58 pages, and `totalTime` is their sum.
- [x] The block states no fact the page does not show: every description is
      prose of its own page, and every image is that bundle's `featured.webp`,
      on the 12 pages that have one; the 46 pages with no photograph state no
      image.
- [x] No page outside the recipe tree carries a Recipe block: the other 663 of
      the 721 built html files scanned, none found.
- [x] The page is undisturbed: the same 426 pages with exactly one `h1`, the
      same 45 pages with images against the same 59 placeholder classes and 59
      rules, and `html-validate` clean over the 721 html files, the blocks and
      the script elements included.
- [x] `pnpm run test` passes, and `pnpm run test:checks` passes over the
      minified production build the publish gate runs.
- [x] Google's own warnings, listed: a page with no image warns `Missing image`,
      so 46 pages warn; the publisher is a `Person`, so `Missing publisher logo`
      warns on every recipe page; `video`, `cost`, `calories` and the rest of
      Google's recommendations are fields the content does not carry, and the
      block does not state them. The Rich Results Test is a web tool and was not
      run; the check enforces the fields it reads.

## Notes

- `@id` is `url#recipe` and `mainEntityOfPage` names the page, so the recipe is
  the entity of the page, not a copy of it, and a crawler that merges the two
  finds one recipe.
- `dateModified` equals `datePublished` on every page: the site builds with no
  `enableGitInfo`, so Hugo's `.Lastmod` falls back to the page date. A build
  that turns git info on makes the field mean what it says, and needs no change
  here.
- `inLanguage` is read from the site's `locale: en-us` and written as `en-US`,
  the case BCP 47 asks of a region subtag.
- Hugo's `jsonify` escapes `<`, `>` and `&` as unicode escapes, so no ingredient
  or step text can close the script element, and it orders a map's keys, so a
  rebuild writes the same bytes.
- `html/template` drops HTML comments from a layout at parse time: the comments
  `recipe/page.html` writes, `Left Column` among them, are in the template and
  never in the page. Debug output from a layout has to be markup, not a comment.
- The check compares text with markup stripped, entities decoded and whitespace
  dropped for the description: the minified build leaves no space at a paragraph
  break, where a summary spans one, and both builds then pass the same check.

## Not in scope

- The rest of `is-structured-data-and-social-meta-tags`: `WebSite`,
  `BlogPosting`, `BreadcrumbList` and `AboutPage`, the `og:type` of an article,
  `socialImage`, and the `robots`, `author`, `publisher`, `creator` and
  `keywords` meta tags.
- A featured image for the 46 recipe bundles that carry none, which is what
  clears their `Missing image` warning.
- Fields the content has no value for: nutrition and calories, cost, video, a
  yield or a time for one component dish, and a per-dish image.
- A block for a cuisine page: a section lists recipes, and a Recipe names none
  of them.
