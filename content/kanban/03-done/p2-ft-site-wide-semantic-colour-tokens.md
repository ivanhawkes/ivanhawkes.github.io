---
title: 'Site Wide Semantic Colour Tokens'
description: 'One semantic token layer for every theme value'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-26'
    dependencies: null
    references:
        - p0-us-update-site-menu
---

One semantic token layer drives every theme dependent value.

<!--more-->

Colour is declared in two layers, and a component reads only the upper one. The
palette in `be-best/assets/css/main.css` carries every colour value, once per
scheme, under `--palette-*` names. `be-best/assets/css/tokens.css` names the
roles components read and aliases the palette. The `@theme inline` block in
`main.css` puts a role behind every colour utility, so a class in a template
names a role and never a colour. The names and the layers are recorded in the
technical specification.

## Work The Whole Theme Around The Tokens

- [x] Move every theme dependent value in `be-best/assets/css` into a semantic
      token, and reference only tokens from component styles
- [x] Re-map the semantic layer in one place per scheme, so a palette change
      touches `tokens.css` alone
- [x] Retire the colour names components used to read (`--card`, `--popover`,
      `--muted`, `--primary-foreground` and their kind): every palette entry is
      renamed to `--palette-*`, no entry keeps a component's name, and a
      component reads a role
- [x] Replace the literal colours left in `footer.css`, `navigation.css` and the
      table styles with tokens
- [x] Record the token names and the two layers in the technical specification

## Acceptance Criteria

- [x] every theme dependent declaration in the theme reads a token
- [x] switching the scheme changes nothing but token values
- [x] both themes hold WCAG 2.2 AA contrast, verified on the raw element fixture

## Findings: The Contrast Re-tune

The first pass at this table took the sRGB channels of a colour, gamma encoded
them, and summed that into a relative luminance, which understates every ratio:
the muted ink on a panel measured 1.8 and is 3.4. Recomputed from the linear
channels WCAG defines, the pairs it asks about (4.5:1 for text, 3:1 for an icon,
a control boundary, a focus ring or an indicator) looked like this before the
re-tune, and this after:

| pair                              |       light |       dark |
| --------------------------------- | ----------: | ---------: |
| muted ink on a panel              |   3.4 → 6.8 |  7.1 → 9.3 |
| muted ink on a sunken surface     |   4.2 → 8.2 |  6.1 → 8.0 |
| brand as ink on a panel           |   4.0 → 4.9 |  3.3 → 7.9 |
| fill ink on a brand fill          |   5.2 → 6.4 |  5.2 → 8.8 |
| fill ink on a danger fill         |   4.6 → 6.4 |  2.8 → 6.5 |
| danger as text on a panel         |   3.5 → 4.9 |  6.0 → 5.8 |
| success as text on a panel        |   5.2 → 5.7 |  7.5 → 8.6 |
| a heading on a panel              |  8.1 → 10.8 | 6.3 → 10.2 |
| a link on a panel                 | 11.1 → 13.7 | 8.5 → 12.8 |
| a link on a pointer               |   2.7 → 6.6 | 4.8 → 10.4 |
| a control boundary on a panel     |   1.1 → 3.6 |  3.4 → 3.6 |
| the focus ring against a panel    |   4.0 → 4.9 |  3.3 → 7.9 |
| ink on the brand tint (next/prev) |    — → 12.9 |   — → 18.1 |
| the language chip ink on the bar  |     — → 4.8 |    — → 4.8 |

What the re-tune touched, all of it in the palette layer and the roles that
alias it:

- `--palette-panel-sunken-ink` darkened in the light scheme and lightened in the
  dark one, which is what muted text on a panel and a field needed.
- `--palette-brand` deepened in the light scheme, brightened in the dark one, so
  the brand works as ink on a panel and as a fill at the same time.
- `--palette-fill-ink` is new: the ink a saturated fill carries, near-white on
  the deep brand of the light scheme and ink on the bright brand of the dark
  one. `--brand-ink` and `--accent-contrast` alias it, so a banner, a priority
  chip and an icon disc each carry an ink that flips with the fill under it.
- `--palette-brand-lift` moves with the scheme: deeper than the brand in the
  light one, brighter in the dark, because a hover moves toward the ink it
  carries. It is the link on a pointer and the active tab's underline.
- `--palette-danger` darkened in the light scheme, lightened in the dark;
  `--palette-success` joined the palette, where `--state-success` was a literal
  in the semantic layer.
- `--palette-edge-field` is the boundary of a control a visitor has to find, and
  clears 3:1: the search field and the theme switch read it. `--palette-edge`
  stays a decorative hairline, exempt because the content of the card it frames
  carries the meaning.
- The brand ramp moves lightness toward white and toward black rather than
  multiplying it: a multiple runs past 1 in the dark scheme, where the brand
  starts light, and washes the pale steps to white — which is why the dark
  scheme's headings and links now sit on the 400 and 300 steps.
- `--surface-brand` is a panel tinted with the brand, and names the ink it
  carries: the pale mint step in the light scheme, the deep one in the dark, so
  the next/previous navigation reads in both.
- The language chip's ink lifted to clear 4.5:1 on the bar it sits on.

Three fixes came out of reading the roles rather than the colours:

- the kanban banner carried `bg-brand` and `bg-accent` at once, and the accent
  won, so an overdue card never showed the danger band it named;
- prose code blocks took the brand's ink on the deep brand, which is a dark
  field in the light scheme and a dark-on-dark one in the dark: they take the
  code field's ink and ground now, the one dark field the theme has;
- the icon disc took the deepest brand step with the fill ink on it, which is
  2.9:1 in the dark scheme: the disc is a brand fill, so it reads `--brand`.

The pairs are measured from the built token values behind
`dashboard/raw/all-html-elements.html`, the raw element fixture: 34 pairs, both
schemes, all pass at 4.5:1 for text and 3:1 for a graphic.
