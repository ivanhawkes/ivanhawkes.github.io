---
title: 'Site Menu'
description: 'Update the site menu'
date: '2026-05-05'
author: 'Ivan Hawkes'
params:
    due: 2026-10-19
    completionDate: null
    dependencies: null
    references: null
---

Update the menu system to be inline with modern practices.

<!--more-->

Refactor my existing sidebar navigation into a modern, accessible top bar
(header) navigation, and add a theme toggle that cycles Light → Dark → System.

Use the website's existing code and assets for the side menu as the basis for
the new menu.

## Goal

1. Remove the sidebar layout and replace it with a sticky top bar.
2. Add a single theme-toggle button cycling three states: light, dark, system.
3. Ship the smallest, most idiomatic diff that touches only what is required.

## Top bar spec

- Sticky to the top (sticky, not fixed) with `top-0 z-50`, full width, height
  60–72px, max content width 1200–1280px, centered, with horizontal page
  padding.
- Layout: logo/brand at left → primary nav links next → right-aligned actions
    - Google search bar widget then theme toggle.
- Nav links: 400–500 weight, 0.875–0.95rem, comfortable 0.5rem vertical padding,
  visible focus ring, current page indicated by an underline/indicator pill
  using the accent token, not by colour alone (must include a non-colour cue:
  `aria-current="page"`
    - underline/weight).
- Dropdown/mega menu for any nested items: opens on hover AND click, closes on
  Escape, closes on outside click, closes on route/link navigation, keyboard
  navigable with ArrowUp/ArrowDown/Home/End, `aria-expanded` + `aria-haspopup`
  managed.
- Surface: theme-aware background with slight translucency +
  `backdrop-filter: blur()`, bottom border using the border token, and a subtle
  elevation shadow that appears only after scroll > 4px (IntersectionObserver on
  a sentinel, not a scroll listener; no scroll-jank, no layout shift).
- Overflow: if the nav overflows at a given width, switch to a compact/overflow
  ("More") menu — never horizontal scroll, never text clipping.

## Responsive

- ≥1024px: full top bar as specced.
- <1024px: brand left, theme toggle + hamburger at right; nav collapses into a
  slide-in drawer from the right (or full-screen panel), animated 200–250ms.
  Drawer requirements: focus trap, Escape closes, scrim click closes, returns
  focus to the hamburger, locks body scroll, closes on link click,
  `aria-expanded`, `aria-controls`, `role="dialog"` + `aria-modal="true"`.
- No layout shift when the scrollbar is hidden; test at 320px, 768px, 1024px,
  1440px.

## Theme Toggle

- One button that cycles: light → dark → system → light. Icons: sun (light),
  moon (dark), monitor/circle-half (system). Include a tooltip/label stating the
  current mode; `aria-label` must update with the state (e.g. "Theme: system
  (currently dark) — switch to light").
- Persist choice in localStorage under `[site:theme]`. Default = "system".
- "System" mode must track the OS live: subscribe to
  `matchMedia('(prefers-color-scheme: dark)')` and update instantly when the OS
  theme changes.
- Apply the resolved theme as `data-theme="light|dark"` on `<html>` (keep the
  user's _intent_ — light/dark/system — in localStorage/JS, and the _resolved_
  value in the DOM). Support nested/embedded contexts if my app has them.
- Prevent flash of unstyled/wrong theme: a small synchronous inline script in
  `<head>` (before first paint / before stylesheet swap) that reads localStorage
  and sets `data-theme`. For SSR, keep server HTML and client resolution
  consistent (no hydration mismatch — use a suppression flag for the first
  client render).
- Colour architecture: define semantic tokens once and re-map them per theme.
  Example tokens: `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`,
  `--border`, `--accent`, `--accent-contrast`, `--focus-ring`, `--shadow`,
  `--overlay`, `--state-danger`, `--state-success`. Define `:root` (light) +
  `[data-theme="dark"]` (dark) — use the `light-dark()` colour function where
  supported with a progressive fallback. NO hard-coded hex/rgb values in
  component styles; replace any hard-coded sidebar colours with tokens. Every
  theme-dependent value must live in a token.
- Transitions: animate colour changes (`background-color`, `color`,
  `border-color`, `fill`, ~150–200ms ease-out) and disable all transitions
  during the initial theme application and under
  `prefers-reduced-motion: reduce`.
- Ensure WCAG 2.2 AA contrast in BOTH themes (≥4.5:1 body text, ≥3:1 large text,
  UI boundaries and focus indicators ≥3:1). Keep `color-scheme: light dark` set
  so form controls, scrollbars and `::selection` follow. Respect `forced-colors`
  / Windows High Contrast (use `system-require-prefers`-safe borders,
  `forced-color-adjust` only where justified) and print styles (force light).
- No-JS fallback: theme defaults to system, nav is fully visible/usable.

## Hard Constraints

- Preserve ALL existing navigation items, links, order, active-state logic,
  analytics attributes/data-* hooks, permission/role gating and i18n keys.
- Do not redesign unrelated pages. Do not introduce a new UI library, icon set,
  or dependency unless you state why and it is unavoidable.
- Delete dead sidebar CSS/JS (including layout grid/columns, body offsets,
  sidebar-only media queries) — verify with a search that nothing still
  references it.
- Keep mobile-first CSS, semantic HTML (`<header>`,
  `<nav aria-label="Primary">`, `<ul>/<li>`, `<button type="button">`), and
  44×44px minimum hit areas.
- If my stack uses SSR/RSC, keep the header client-safe (mark only interactive
  parts as client components).

## Deliverables (in this order)

1. Brief plan: files to change, token strategy, risks, and any assumptions.
2. The code: complete, runnable, framework-idiomatic — show full contents for
   new files and precise before/after diffs for edits. No pseudo-code, no "//
   rest unchanged".
3. Migration notes: exact list of removed sidebar code, new localStorage key,
   and any markup the CMS/templating layer needs updating.
4. Verification checklist I can run: keyboard nav path, screen-reader
   announcements, theme persistence across reload, system-change while on
   "system", 320px + 1440px, contrast in both themes, no FOUC on hard reload, no
   horizontal scroll, drawer focus trap, reduced-motion, forced-colors, print.

If any placeholder above is ambiguous, ask up to 5 targeted questions BEFORE
writing code.
