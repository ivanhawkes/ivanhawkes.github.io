---
title: 'Kanban Personal View'
description: 'Grid based view for the Git user'
date: '2026-10-23'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

The personal view is a variation of the Kanban grid view. It only shows Kanban
cards that are assigned to the person who is working on the project.

This will be achieved by matching the Git username information against the
author field in the front matter. Due to the static nature of the site this will
need to be implemented as a separate web page.

It is currently unknown if this is possible to do using Hugo.

<!--more-->

## Kanban Board View

- [ ] **Duplicate** — duplicate the grid view and name it `personal-view`
- [ ] **Retrieve** — retrieve the current users Git username
- [ ] **Filter** — filter the cards shown by the Git username

## Acceptance Criteria

- [ ] Only the cards for the current user are displayed within a grid view
