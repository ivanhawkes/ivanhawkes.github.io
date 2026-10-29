---
title: 'Structured Data And Social Meta Tags'
description: 'No JSON-LD; Open Graph and Twitter tags thin'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

No structured data, and thin social meta tags.

<!--more-->

## Current State

Measured over `public/` of the current build.
`be-best/layouts/_partials/meta/meta.html` writes a canonical link, a
description, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`,
`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` and
`twitter:site`. The gaps:

- Structured data is absent: no page carries an `application/ld+json` block, so
  the structured data audit scores 0/100 and no page is eligible for rich
  results.
- `og:image` and `twitter:image` render `content=""`: the partial reads
  `.Site.Params.socialImage`, and `config/_default/params.yaml` defines no
  `socialImage`. `twitter:site` renders empty for the same reason, reading
  `.Site.Params.twitterHandle`.
- `og:type` is hard-coded to `website` on every page, so posts and recipes carry
  no article properties (`article:published_time`, `article:author`,
  `article:section`).
- There is no `robots`, `author`, `publisher`, `creator` or `keywords` meta tag,
  which is what holds the meta tags score at 74/100.
- `sitemap.xml` and one `index.xml` feed are already generated, and the head
  links the feed: the crawl route exists, the descriptions of the pages do not.

## Work

- [ ] **Params** - define `socialImage` and `twitterHandle` in
      `config/_default/params.yaml`, and add the share image to `static/`
      through Git LFS: 1200x630 suits `twitter:card` `summary_large_image`.
- [ ] **Types** - select `og:type` by content type: `article` for `post` pages,
      `website` for the home page and section pages, and the matching properties
      (published, modified, author, section) on articles.
- [ ] **JSON-LD** - a head partial emitting, per page: `WebSite` on the home
      page, `BlogPosting` on a post (author `Person`, publisher, image,
      `datePublished` and `dateModified`), `Recipe` on `type: recipe` reading
      the `ingredients.yaml` sidecar and the `prep-time` / `cook-time` ISO
      durations, `BreadcrumbList` on every page below the home page, and
      `AboutPage` for the `about/` pages.
- [ ] **Meta tags** - add `robots`, `author`, `publisher`, `creator` and
      `keywords` (from the page `tags`), and state the indexing decision for the
      working sections: `kanban` and `specification` are working documents, so
      say whether they are indexed or `noindex`.

## Acceptance Criteria

- [ ] Every page carries a JSON-LD block of the type above, and the blocks
      validate against Google's Rich Results Test with no errors; the warnings
      are listed on this card
- [ ] `og:image`, `twitter:image` and `twitter:site` carry real values on the
      home page and on a post, and a shared link shows the image
- [ ] A post page reports `og:type` `article` with published and modified times,
      an author and a publisher
- [ ] The `robots`, `author`, `publisher`, `creator` and `keywords` tags are
      present, and the indexing decision for `kanban` and `specification` is
      visible in the built pages
- [ ] The re-run review reports the structured data and meta tags scores,
      recorded on this card
