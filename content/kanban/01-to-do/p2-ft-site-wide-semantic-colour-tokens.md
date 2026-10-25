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

The top bar work introduced `--bg`, `--surface`, `--surface-2`, `--text`,
`--text-muted`, `--accent-contrast`, `--focus-ring`, `--shadow`, `--overlay` and
the header tokens in `be-best/assets/css/tokens.css`, each defined once as an
alias of the existing palette tokens and resolved through `light-dark()` where a
value needs to differ per scheme. The rest of the theme still styles itself with
the shadcn style names (`--card`, `--popover`, `--muted`,
`--primary-foreground`) and with a few literal colours.

## Work The Whole Theme Around The Tokens

- [ ] Move every theme dependent value in `be-best/assets/css` into a semantic
      token, and reference only tokens from component styles
- [ ] Re-map the semantic layer in one place per scheme, so a palette change
      touches `tokens.css` alone
- [ ] Retire the shadcn style names, or document them as the palette layer the
      semantic layer aliases
- [ ] Replace the literal colours left in `footer.css`, `navigation.css` and the
      table styles with tokens
- [ ] Record the token names and the two layers in the technical specification

## Acceptance Criteria

- [ ] every theme dependent declaration in the theme reads a token
- [ ] switching the scheme changes nothing but token values
- [ ] both themes hold WCAG 2.2 AA contrast, verified on the raw element fixture
