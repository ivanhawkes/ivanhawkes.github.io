---
title: 'Site Menu'
description: 'Update the site menu'
date: '2026-05-05'
author: 'Ivan Hawkes'
params:
    due: 2026-10-19
    completionDate: '2026-10-25'
    dependencies: null
    references:
        - p2-ft-menu-system
        - p3-us-toggle-light-dark
---

Update the menu system to be inline with modern practices.

<!--more-->

The sidebar navigation becomes a modern, accessible top bar, and the colour
scheme switch sits in it beside a site search box. The work reuses the existing
menu code: the recursive partial, the `menus` front matter and the colour scheme
module all stay, so the diff is the navigation itself.

## Top Bar

- [x] The sidebar layout is gone: one column page, a sticky top bar
      (`top-0 z-50`, 60px, 72px from 1024 pixels, content to 1280 pixels,
      centred, page gutter).
- [x] Brand at the left, primary nav next, right aligned actions: search box,
      colour scheme switch, drawer control.
- [x] Nav links: 500 weight, 0.9375rem, 0.5rem vertical padding, 44px hit areas,
      visible focus ring.
- [x] The current page is marked by `aria-current="page"`, label weight and an
      accent indicator; the cue is never colour alone.
- [x] An entry with children is a button that opens a panel, on click, on hover
      and on keyboard focus. Escape closes the panel and returns focus to its
      trigger, a click outside the bar closes it, and a link closes it on
      navigation. `aria-expanded` and `aria-haspopup` are kept in step.
- [x] ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home and End rove the level,
      enter a panel and leave one.
- [x] Surface: translucent theme aware background, `backdrop-filter: blur()`,
      bottom border token, and an elevation shadow only after 4 pixels of
      scroll, read from an IntersectionObserver on a sentinel above the bar - no
      scroll listener, no layout shift.
- [x] Entries with no room in the row move, in order, into a "More" panel: the
      row never scrolls sideways and no label is clipped.

## Responsive

- [x] From 1024 pixels, the full bar: dropdown panels under a top level entry,
      flyouts beside a nested one, a wide panel in columns for a long list.
- [x] Below 1024 pixels, brand left, switch and hamburger right, the list a
      drawer sliding in from the right in 220ms, its sub-menus accordion
      sections.
- [x] Drawer: focus trap, Escape closes, scrim click closes, focus returns to
      the hamburger, body scroll locked, closes on link click,
      `aria-expanded`/`aria-controls` on the trigger, `role="dialog"` and
      `aria-modal="true"` while open.
- [x] `scrollbar-gutter: stable` on the root, so hiding the scrollbar for the
      drawer shifts nothing. Checked at 320, 768, 1024 and 1440 pixels.

## Colour Scheme

- [x] One button cycling light, dark and system, kept from the colour scheme
      card and moved into the bar, where its `aria-label` names the scheme in
      effect and the one the next press selects.
- [x] The head preloader records the setting before the first paint: no flash of
      the wrong theme on a hard reload.
- [x] Semantic tokens in `be-best/assets/css/tokens.css` (`--bg`, `--surface`,
      `--surface-2`, `--text`, `--text-muted`, `--header-bg`, `--header-border`,
      `--nav-hover`, `--overlay`, `--shadow`, `--focus-ring`) alias the palette
      tokens, resolved through `light-dark()` where a value differs per scheme.
      The header, drawer and panels read tokens only.
- [x] Colour transitions at 180ms ease-out, none while the scheme is applied and
      none under `prefers-reduced-motion: reduce`.
- [x] `color-scheme` per scheme; forced colours and print re-map the tokens to
      the user's palette, print always light.
- [x] With scripts off, the theme follows the operating system, the bar opens
      its panels on hover and focus, the list stacks below the bar on a narrow
      page, and the controls that need a script are withdrawn.

## Acceptance Criteria

- Every entry, link, order, icon and weight of the previous menus renders in the
  bar, at the same depth, and the current page and its trail are identified.
- No sidebar CSS, script or partial remains, and nothing references them.
- Keyboard only: Tab reaches the bar, arrows walk it, panels open and close, and
  Escape unwinds them; the drawer traps focus and gives it back.
- A screen reader announces one banner, one primary navigation, the current
  page, and the expanded state of every trigger.
- Both themes hold WCAG 2.2 AA contrast: 4.5:1 body text, 3:1 for large text, UI
  boundaries and focus indicators.
- Mobile first CSS, semantic markup (`<header>`, `<nav aria-label="Primary">`,
  `<ul>/<li>`, `<button type="button">`), and no new dependency.

## Migration

Removed:

- `be-best/assets/css/sidebar.css` (the page grid, the sidebar column, its
  collapsed state, the sidebar-only media queries and the 800 pixel content
  frame, which `layout.css` now carries)
- `be-best/assets/js/sidebar.ts`, `be-best/assets/js/hamburger-menu.ts`
- `be-best/layouts/_partials/navigation/side-menu.html`
- the `--sidebar-*` tokens and their `@theme inline` aliases, and the
  `main { padding-top }` offset the floating header needed
- `html:not([data-theme]) #site-header { display: none }`, which withdrew the
  navigation with the switch; only the switch is withdrawn now

Added: `header.css`, `layout.css`, `tokens.css`, `nav-menu.ts`, `site-header.ts`
and `navigation/top-nav.html`.

Templates and parameters:

- `sidebar.menus` / `sidebar.maxDepth` become `navigation.menus` /
  `navigation.maxDepth`, and `navigation.grouped` puts a whole menu behind one
  entry, named by `name`.
- `theme.search` (default `google`) includes the search box in the bar; the
  domain scope comes from `site.BaseURL` and is prefixed to the query on submit,
  so the box works without scripts too.
- Class names: `active`/`open`/`show`/`sub-menu`/`dropdown-btn` become
  `is-current`/`is-trail`/`is-open`/`nav-panel`/`nav-trigger`; the ids `sidebar`
  and `toggle-btn` become `primary-nav` and `nav-toggle`.

Storage: no new key. The setting stays under `theme`, with the pre-three-state
`darkMode` key migrated on read, as the colour scheme card established. The
`resolved` scheme is on `<html>` as the `dark` class, the intent as
`data-theme`.

Content needs no change: the entries still come from the `menus` front matter.

## Verification

- Keyboard only: Tab from the brand along the row; ArrowRight/ArrowLeft walk the
  entries; ArrowDown enters a panel, ArrowUp/ArrowDown rove it, Home/End jump to
  its ends, ArrowLeft leaves it, Escape unwinds panel, then drawer.
- Screen reader: one banner, "Primary" navigation, the current page announced,
  "expanded"/"collapsed" on each trigger, the drawer announced as a dialog.
- Theme: cycle light, dark, system; reload and the setting persists; on system,
  change the OS scheme and the page follows at once; hard reload shows no flash.
- Widths: 320, 768, 1024 and 1440 pixels, with and without a scrollbar; no
  horizontal scroll, no clipped label, no shift when the drawer opens.
- Contrast: body text, nav labels, the search input and focus rings in both
  themes, on the home page, a post and the raw element fixture.
- `prefers-reduced-motion: reduce`: no drawer slide, no panel fade, no colour
  transition.
- Forced colours (Windows High Contrast): bar, panels and controls keep their
  boundaries and their focus ring.
- Print: the bar and the scrim are absent, the page is light.
- Scripts off (block `/js/*`): every menu entry and sub-entry reachable, the
  drawer control and the switch absent.
