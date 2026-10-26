---
title: 'Site Wide Semantic Colour Tokens'
description: 'One semantic token layer for every theme value'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
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
- [ ] both themes hold WCAG 2.2 AA contrast, verified on the raw element fixture

## Findings: The Contrast Left To Do

The rename is value preserving, so what the pairs measured before the change is
what they measure now. Measured from the palette, the pairs AA asks of
non-decorative text (4.5:1) and of large text, icons and UI boundaries (3:1):

| pair                          | light | dark |
| ----------------------------- | :---: | :--: |
| body ink on the page          | 11.4  | 11.2 |
| body ink on a panel           | 10.0  | 6.8  |
| body ink on a stripe          | 10.9  | 6.8  |
| muted ink on a panel          |  1.8  | 4.6  |
| muted ink on a sunken surface |  2.0  | 3.4  |
| heading on a panel            |  3.5  | 3.8  |
| link on a panel               |  5.0  | 4.4  |
| brand ink on a brand fill     |  2.5  | 2.5  |
| brand ink on the lift         |  2.0  | 2.0  |
| brand as ink on a panel       |  2.2  | 2.7  |
| danger as text on a panel     |  3.7  | 3.8  |
| success as text on a panel    |  2.6  | 4.4  |
| code ink on the code field    |  8.5  | 8.5  |
| focus ring against the page   |  2.5  | 4.6  |
| focus ring against a panel    |  2.2  | 2.7  |
| hairline against the page     |  1.1  | 2.0  |

Four of these are the palette's to fix, and this is where the two layers pay for
themselves: `--palette-panel-sunken-ink` is too light for the light scheme
(muted text at 1.8:1), `--palette-brand` and `--palette-brand-lift` are too
light for the near-white ink they carry (a kanban banner and a priority chip),
`--state-success` is too light as light-scheme text, and `--palette-edge` is
under 3:1 as a boundary in both schemes. The card's remaining criterion is a
palette re-tune in `main.css` and the two aliases that follow it, then a
verification pass over `dashboard/raw/all-html-elements.html`.
