---
author: Ivan Hawkes
date: '2026-10-22'
description: 'Most pages render with no top-level h1 heading'
params:
    completionDate: '2026-10-23'
    dependencies: null
    due: null
    references: null
title: 'Pages Have No Top Level Heading'
---

149 of 165 article pages have no `h1`; the board has none either.

<!--more-->

## Pages Have No Top Level Heading

The layouts present a page title as styled text, not as a top-level heading, so
most generated pages contain no `h1` element. Measured over the built site: 149
of 165 article pages have no `h1`, and the Kanban board, the dashboard listing
and the section listings have none. The article pages that do have an `h1` get
it from a `#` heading written in the body, which is why the count is not zero.

Assistive technologies use the top-level heading to announce a page, and page
summaries and social previews read it as the title. No check in the pipeline
looks for it, so the omission is silent.

- [x] Give every layout exactly one `h1`: the page title on article pages, the
      section title on listings, and the board title on the Kanban section.
- [x] Start body content at `h2` on article pages, so the heading hierarchy
      descends from the title, and leave the visual design of the title area to
      the stylesheet.
- [x] Record the count of generated pages without an `h1` as the check, and make
      it part of the CSS and content review work.

The `page/content.html` partial renders the page title as the page's single
`h1`; the extra title heading in `taxonomy.html` and `term.html` is gone, and
the `#` headings written in section indexes and in four posts were deleted or
demoted to `##`. `pnpm run test:headings` counts `h1` elements over `public/`
and fails on any page with none or more than one: 403 pages, all clean.

## Acceptance Criteria

- [x] Every generated page contains exactly one `h1` element.
- [x] No page contains more than one `h1` element.
- [x] A page's `h1` is its title, not a heading taken from its body.
- [x] The count of pages without an `h1` is reported by a documented command
      over `public/`, and it returns zero.
