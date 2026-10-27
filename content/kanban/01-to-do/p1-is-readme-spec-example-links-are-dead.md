---
title: 'README Spec Example Links Are Dead'
description: 'Three README links to the specs return 404'
date: '2026-10-27'
author: Ivan Hawkes
params:
    completionDate: null
    dependencies: null
    due: null
    references: null
---

The README's three specification links point at paths that 404.

<!--more-->

## README Spec Example Links Are Dead

The README invites the reader to "see some examples" with three root-relative
links. Measured against the built site, all three miss:

| Link in `README.md`                                           | Built page                                     |
| ------------------------------------------------------------- | ---------------------------------------------- |
| `/specification/personal-website/summary/`                    | `public/specification/summary/index.html`      |
| `/specification/personal-website/ideation/`                   | `public/specification/ideation/index.html`     |
| `/specification/personal-website/requirements-specification/` | `public/specification/requirements/index.html` |

The site has no `personal-website` segment: the specification documents live
directly under `content/specification/`, and the third slug is `requirements`,
not `requirements-specification`. The links are stale names for pages that
exist, so the fix is to repoint them, not to create pages.

## Goals

- [ ] Repoint the three links at the paths the build produces.
- [ ] Keep the same three documents as the examples: summary, ideation and
      requirements.
- [ ] Check every other in-site link in the README for the same drift.

## Acceptance Criteria

- [ ] Each of the three README links resolves to a file under `public/`.
- [ ] No README in-site link contains a path segment the build does not produce.
- [ ] The README renders the examples list unchanged apart from the URLs.
- [ ] `pnpm run test` passes.
