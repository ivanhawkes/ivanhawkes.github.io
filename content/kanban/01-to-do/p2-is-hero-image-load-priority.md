---
title: 'Hero Image Load Priority'
description: 'Hero image is lazy loaded, no fetchpriority'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: null
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

- [ ] **Priority parameter** - give the image path a priority argument so the
      hero emits `loading="eager" fetchpriority="high"` and the images in the
      prose, below the fold, keep `loading="lazy"`. Do not drop lazy loading
      from all three call sites: in-prose images are the reason the attribute is
      there.
- [ ] **Preload** - on a single post, recipe, project or profile page, put
      `<link rel="preload" as="image" fetchpriority="high">` for the featured
      image in the head, so the request starts before the CSS and the `img`
      element are parsed.
- [ ] **Third-party weight** - re-measure on the current build, list what is
      loaded, and remove what the list shows is unused.

## Acceptance Criteria

- [ ] The hero `<img>` of a post page carries `fetchpriority="high"`, and does
      not carry `loading="lazy"`
- [ ] An in-prose image below the fold still carries `loading="lazy"`
- [ ] The largest content element of a post page is measured before and after,
      on the same device and network profile, and both numbers are recorded on
      this card
- [ ] The re-run audit reports no render-blocking FontAwesome finding, and
      reports the third-party share of page weight, recorded here
