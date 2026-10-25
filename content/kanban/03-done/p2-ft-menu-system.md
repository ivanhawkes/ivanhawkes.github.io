---
title: Menu System
description: Switch the menu entries to be hierarchial.
date: '2026-04-28'
author: Ivan Hawkes
params:
    due: null
    completionDate: '2026-10-24'
    dependencies: null
    references: null
---

The menu was hard coded, improve it.

<!--more-->

## Menu System

- [x] Make it work from front matter in the content
- [x] Set the names, parents and weights of all the menus
- [x] Update the code to use the new metadata
- [x] Make the menu render the hierarchy

## Acceptance Criteria

- Every menu entry, its name, parent, weight and icon come from the `menus`
  front matter of a content file; no entry is hard coded in the theme.
- Which menus the sidebar renders, and the nesting depth, come from
  `sidebar.menus` and `sidebar.maxDepth` in `config/_default/params.yaml`. The
  top bar work of `p0-us-update-site-menu` renamed that block to `navigation`,
  added `navigation.grouped`, and replaced the `active` class with
  `aria-current="page"` and the `is-trail` state.
- Entries nest to three levels: Home, About, Posts at level 1; the sections of
  About and Posts at level 2; the recipe cuisines at level 3.
- Entries below the configured depth are not rendered.
- The entry for the current page carries `class="active"`, as do its ancestors;
  the submenus on that path, including the current entry's own when it has
  children, render open and expanded.
