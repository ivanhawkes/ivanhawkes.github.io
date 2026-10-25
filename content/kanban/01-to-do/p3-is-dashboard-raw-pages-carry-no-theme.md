---
title: 'Dashboard Raw Pages Carry No Theme'
description: 'The raw layout ships no head, CSS or scripts'
date: '2026-10-25'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Pages built with `layout: raw` get no head, stylesheet or scripts.

<!--more-->

## Dashboard Raw Pages Carry No Theme

`be-best/layouts/raw.html` outputs `.Content` alone, so a page that uses it has
no stylesheet, no scripts and no colour scheme switch: it renders as unstyled
markup and ignores the light, dark and system setting. The only page in this
state is `content/dashboard/raw/all-html-elements.md`, the CSS test fixture, and
`.htmlvalidateignore` excludes it from validation.

- [ ] Decide whether the fixture keeps a head (stylesheet, scripts, theme) while
      staying out of the navigation, or stays a bare fragment by design
- [ ] Record the decision in the technical specification

## Acceptance Criteria

- [ ] every page of the site either follows the colour scheme, or is documented
      as deliberately outside it
