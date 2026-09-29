---
description: Scaffold a new kanban card
argument-hint: '<kind> <prefix>-NNN-slug'
---

Create a new kanban card for kind `${1}` with slug `${2}` using
`hugo new content kanban/${1}/${2}.md --kind ${1}`, then fill in the front
matter and body per the kanban-card skill: title, description (50 characters or
less), params (sprint, stage, status, due, percent, estimatedtime, actualtime,
priority, dependencies, references), and a body with a short summary before
`<!--more-->` followed by goals and acceptance criteria. Validate with
`pnpm run test`.
