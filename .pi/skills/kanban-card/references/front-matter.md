# Kanban card front matter

Full front matter for a kanban card:

```yaml
---
type: 'kanban'
title: 'Short card title'
description: 'Limit to 50 characters'
date: '2026-04-29'
lastmod: null
author: Ivan Hawkes
categories: null
tags: null
params:
  sprint: sp-002
  stage: develop
  status: in-progress
  completed: 20
  due: null
  percent: 40
  estimatedtime: 100
  actualtime: 40
  priority: 350
  dependencies: null
  references: null
---

Short summary shown on the card.

<!--more-->

Full description, constraints, and assumptions.

# Title

**Goals**

- Goal one

**Acceptance Criteria**

- Criterion one
```

Field notes:

- `stage`: design (default), develop, ...
- `status`: pending (default), in-progress, ...
- `percent`: 0-100 completion percentage; render a progress bar when > 0.
- `due`: ISO date; renders a destructive banner when past and incomplete.
- `dependencies`: list of card slugs, or `null`.
- `references`: links or slugs related to the card, or `null`.
- The `kanban-list-short` shortcode lists cards whose path matches a given ID
  prefix (`<prefix>-`), sorted by path.
