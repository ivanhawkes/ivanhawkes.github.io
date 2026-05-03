---
type: 'kanban'
title: 'HTML Check'
description: 'Validate the generated HTML'
date: '2026-04-30T12:00:00'
lastmod:
author: ''
params:
  sprint: null
  stage: done
  status: done
  completed: 2026-04-30
  due: null
  estimatedtime: 30
  actualtime: 1
  percent: 100
  priority: 550
---

Feed some output pages into the W3 HTML validator and clean up any issues.

<!--more-->

## Notes

  - Extra </div> found in a partial for navigation
  - Removed trailing slash from void elements
  - Render code block has some extra attributes it did not need
  - Removed 'article' elements around content
  - Fixed date format for authors
