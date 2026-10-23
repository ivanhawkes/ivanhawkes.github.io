---
title: 'Kanban Grid View'
description: 'Grid based view of the project'
date: '2026-10-23'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Create a web page that provides an overview of the entire Kanban system at a
glance. It should show every Kanban, it's title, description, due date, and
indicate if it's overdue.

<!--more-->

## Kanban Grid View

Sort score: a numeric score ranks each card for sorting. Rating is done using a
formula that applies weighting to each criteria i.e. - late: when the due date
is in the past and the kanban is not yet completed it receives +150 points to
it's score - priority: (3 - priority) * 100 - assigned to me: +300

Layout: card view, full-screen. Cards are compact, displaying just the filename
used, description, and due date. Colour-coded indicators for _late_, _urgent_,
and _high priority_.

- [ ] **Grid view** — X axis = stage; Y axis = sort score (see below). A card's
      X offset reflects its stage of completion, e.g. a high-priority,
      in-progress card sits in its priority lane offset by how far along it is.

## Acceptance Criteria

- [ ] **Sorting** - the cards are correctly sorted using the sort criteria
- [ ] **Layout** — the cards are laid out according to the directions provided
