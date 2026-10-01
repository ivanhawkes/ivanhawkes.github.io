---
kind: 'kanban'
title: 'HTML Check'
description: 'Validate the generated HTML'
date: '2026-04-30'
author: Ivan Hawkes
lastmod:
params:
    sprint: null
    stage: done
    status: done
    estimatedtime: 30
    actualtime: 1
    completed: 2026-04-30
    dependencies: null
    due: null
    percent: 100
    priority: 350
    references: null
---

Feed some output pages into the W3 HTML validator and clean up any issues.

<!--more-->

## Notes

- Extra </div> found in a partial for navigation
- Removed trailing slash from void elements
- Render code block has some extra attributes it did not need
- Removed 'article' elements around content
- Fixed date format for authors
