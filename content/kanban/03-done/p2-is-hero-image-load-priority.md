---
title: 'Hero Image Load Priority'
description: 'Hero image is lazy loaded, no fetchpriority'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: '2026-11-25'
    due: null
    dependencies: null
    references: null
---

The hero image is lazy loaded, and unprioritised.

<!--more-->

## Findings

The lab test rates the page fast, and asks for three things:

- **Largest content element** - the main image of the page should carry a high
  fetch priority, and should not be lazy loaded.
- **Render-blocking FontAwesome** - about 200 ms off the first paint.
  FontAwesome has been removed from the theme, and the built pages load no
  FontAwesome file, so re-run the audit on the current build: the finding is
  expected to be gone. If it survives, name the script it points at.
- **Third-party weight** - third-party files are put at about 44% of page
  weight. The current build ships no third-party script, style, font or image: a
  page loads `/js/theme-init.js` (1 KB), `defer /js/index.js` (19 KB) and the
  site CSS, all same-origin, and the only outbound reference in a page is the
  header search form's `action="https://www.google.com/search"`. Re-measure,
  then review only what the measurement shows is unused.

## Work

The hero of a post page is the largest content element, and it is written with
`loading="lazy"`:

- `be-best/layouts/_partials/images/image-variants.html` line 81, reached from
  `be-best/layouts/_partials/images/featured-image.html`
- `be-best/layouts/_shortcodes/img.html` line 76
- `be-best/layouts/_markup/render-image.html` line 66

No page carries a `fetchpriority` attribute anywhere.

- [x] **Priority parameter** - give the image path a priority argument so the
      hero emits `loading="eager" fetchpriority="high"` and the images in the
      prose, below the fold, keep `loading="lazy"`. Do not drop lazy loading
      from all three call sites: in-prose images are the reason the attribute is
      there.
- [ ] **Preload** (tried and dropped, see Results) - on a single post, recipe,
      project or profile page, put
      `<link rel="preload" as="image" fetchpriority="high">` for the featured
      image in the head, so the request starts before the CSS and the `img`
      element are parsed.
- [x] **Third-party weight** - re-measure on the current build, list what is
      loaded, and remove what the list shows is unused.

## Results

Done 2026-11-25. `images/image-variants.html` takes a `priority` argument;
`featured-image.html` passes it for a hero, so the hero `<img>` of a post,
recipe, project or profile page is `loading="eager" fetchpriority="high"`, on 21
pages. Every other image stays `loading="lazy"`: 51 of them, in the prose, on
cards and in related posts. The two `<source>` srcsets now come from one
partial, `images/srcset.html`, and are byte-identical to before.

Largest contentful paint, headless Chrome, a 412px phone viewport, 150 ms
latency, 1.6 Mbit/s down, 4x CPU slowdown, cache off, median of five runs,
production builds served locally:

| Page                                            | LCP element | Before  | After  |
| ----------------------------------------------- | ----------- | ------- | ------ |
| `/post/cryengine/on-building-a-world/`          | hero image  | 1284 ms | 972 ms |
| `/post/cryengine/creating-interesting-terrain/` | a paragraph | 828 ms  | 920 ms |

Where the hero is the largest element, it paints about 310 ms (24%) sooner.
Where a paragraph is larger than the hero on a phone, the eager hero now shares
the connection with the stylesheet and the paragraph paints about 90 ms later.

The preload was built and measured, and dropped: a `<link rel="preload">` for
the hero gave the same numbers as the eager, high-priority `<img>` alone (976 ms
and 920 ms), because the `<img>` is near the top of the body and is found as
early as the preload would be.

Third-party weight, measured on the live site with Chrome, compressed bytes: the
only third-party file is Cloudflare's Web Analytics beacon, 10.5 KB, which is
16.7% of the home page (62.8 KB) and 8.1% of a post (130.3 KB). Nothing unused
is loaded. No page loads FontAwesome, and no file in the theme names it.

## Acceptance Criteria

- [x] The hero `<img>` of a post page carries `fetchpriority="high"`, and does
      not carry `loading="lazy"`
- [x] An in-prose image below the fold still carries `loading="lazy"`
- [x] The largest content element of a post page is measured before and after,
      on the same device and network profile, and both numbers are recorded on
      this card
- [x] The re-run audit reports no render-blocking FontAwesome finding, and
      reports the third-party share of page weight, recorded here Measured
      directly instead (see Results); the audit re-run was waived by the owner
      on 2026-11-25.
