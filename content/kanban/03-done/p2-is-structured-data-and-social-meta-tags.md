---
title: 'Structured Data And Social Meta Tags'
description: 'No JSON-LD; Open Graph and Twitter tags thin'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: '2026-11-25'
    due: null
    dependencies: null
    references: ['p1-is-recipe-pages-emit-no-json-ld']
---

No structured data, and thin social meta tags.

<!--more-->

## Current State

Measured over `public/` of the current build.
`be-best/layouts/_partials/meta/meta.html` writes a canonical link, a
description, `og:title`, `og:description`, `og:url`, `og:type`, `twitter:card`,
`twitter:title` and `twitter:description`, plus `og:image`, `twitter:image` and
`twitter:site` when the params behind them are set. The gaps:

- Structured data is absent from every page that is not a recipe. The 58 recipe
  pages carry a `Recipe` block, added by `is-recipe-pages-emit-no-json-ld` and
  checked by `pnpm run test:jsonld`; the home page, a post, a section, a kanban
  card and a specification page carry no `application/ld+json` block, so the
  structured data audit scores 0/100 on those, and none of them is eligible for
  a rich result.
- `og:image` and `twitter:image` are written only when
  `.Site.Params.socialImage` is set, and `config/_default/params.yaml` sets no
  `socialImage`, so a shared link carries no image. `twitter:site` emits
  `@ivanhawkes`, read from `social.twitter`, added on 2026-10-29.
- `og:type` is hard-coded to `website` on every page, so posts and recipes carry
  no article properties (`article:published_time`, `article:author`,
  `article:section`).
- There is no `robots`, `author`, `publisher`, `creator` or `keywords` meta tag,
  which is what holds the meta tags score at 74/100.
- `sitemap.xml` and one `index.xml` feed are already generated, and the head
  links the feed: the crawl route exists, the descriptions of the pages do not.

## Work

- [x] **Params** - define `socialImage` in `config/_default/params.yaml`, and
      add the share image to `static/` through Git LFS: 1200x630 suits
      `twitter:card` `summary_large_image`.
- [x] **Types** - select `og:type` by content type: `article` for `post` pages,
      `website` for the home page and section pages, and the matching properties
      (published, modified, author, section) on articles.
- [x] **JSON-LD** - a head partial emitting, per page: `WebSite` on the home
      page, `BlogPosting` on a post (author `Person`, publisher, image,
      `datePublished` and `dateModified`), `Recipe` on `type: recipe` reading
      the `ingredients.yaml` sidecar and the `prep-time` / `cook-time` ISO
      durations, `BreadcrumbList` on every page below the home page, and
      `AboutPage` for the `about/` pages. The `Recipe` type is done, by
      `is-recipe-pages-emit-no-json-ld`: its block is built by
      `be-best/layouts/_partials/recipes/jsonld.html` and written first in the
      recipe page's `main`, where Google reads it, not from a head partial.
- [x] **Meta tags** - add `robots`, `author`, `publisher`, `creator` and
      `keywords` (from the page `tags`), and state the indexing decision for the
      working sections: `kanban` and `specification` are working documents, so
      say whether they are indexed or `noindex`.

## Results

Done 2026-11-25 for the JSON-LD and `og:type`; the share image and the meta tags
are still open.

`be-best/layouts/_partials/meta/jsonld.html` writes one JSON-LD block in the
head of every page but the 404, its nodes in an `@graph`: `WebSite` on the home
page, `BlogPosting` on the 55 articles, `AboutPage` on the About section, its
two listings and the two project pages, `ProfilePage` with its `Person` (job
title and `sameAs` profile links) on the profile page, and a `BreadcrumbList` on
all 457 pages below the home page, matching the trail each page shows. Recipes
keep their `Recipe` block and gain the breadcrumbs. A key is written only where
the content has a value, as the recipe block does.

Posts and recipes now carry `og:type` `article`, with `article:published_time`,
`article:modified_time`, `article:section` and one `article:tag` per tag; every
other page stays `website`. `article:author` is left out: Open Graph wants a
profile URL there, and a recipe's author is often the cook it came from, not a
page on this site.

`pnpm run test:jsonld` now also runs `scripts/validate-jsonld.mjs`, which checks
every page's block against `assets/jsonld.yaml` and reads it back against the
page: the node types its kind should carry, the canonical URL, the `h1`, the
`article:` dates and the visible breadcrumbs. It found one real fault while
being written: Hugo's `truncate` HTML-escapes a title, so a headline with quotes
carried `&#34;`; headlines are now cut only when longer than 110 characters,
without escaping. Schema.org's validator reports no errors and no warnings on
the home page, a post, the profile page and a recipe. Google's Rich Results Test
was not run.

Meta tags, 2026-11-25: every page carries `robots` and `author`, and a page with
tags carries `keywords`. The indexing decision: the kanban board and the
specifications are working documents, so their 66 pages carry `noindex, follow`
and are left out of `sitemap.xml` (425 entries down to 363) through
`sitemap.disable` cascaded from the two section `_index.md` files. Every other
page is `index, follow, max-image-preview:large`. `publisher` and `creator` are
not written: neither is a standard HTML meta name, and no search engine reads
them; the JSON-LD names the publisher and the author instead.
`scripts/validate-jsonld.mjs` checks that `noindex` falls on exactly those pages
and that the sitemap lists none of them.

Share image, 2026-11-25: `static/img/social.jpg`, 1200x630, the owner's portrait
beside the site name and tagline on the brand teal, is `socialImage` in
`config/_default/params.yaml`. A page with its own `featured.webp` shares that
instead, cropped to 1200x630 as a JPEG; every other page shares the site card.
Both carry `og:image:width`, `height` and `alt`, and the matching
`twitter:image` tags. The review score is waived, as on the other closed cards.

## Acceptance Criteria

- [x] Every page carries a JSON-LD block of the type above, and the blocks
      validate against Google's Rich Results Test with no errors; the warnings
      are listed on this card
- [x] `og:image` and `twitter:image` carry a real image on the home page and on
      a post, and a shared link shows it
- [x] A post page reports `og:type` `article` with published and modified times,
      an author and a publisher
- [x] The `robots`, `author`, `publisher`, `creator` and `keywords` tags are
      present, and the indexing decision for `kanban` and `specification` is
      visible in the built pages
- [x] The re-run review reports the structured data and meta tags scores,
      recorded on this card
