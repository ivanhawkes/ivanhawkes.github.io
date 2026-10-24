---
title: 'Kanban Stage Folder Spec Drift'
description: 'Stage folder rules drift between card and spec'
date: '2026-10-24'
author: Ivan Hawkes
params:
    completionDate: '2026-10-24'
    due: null
    dependencies: null
    references: ['p2-us-kanban-grid-view', 'p2-us-kanban-personal-view']
---

`content/specification/technical/index.md` no longer describes the stage folders
that exist on disk.

<!--more-->

## Kanban Stage Folder Spec Drift

The specification listed the stages as `01-to-do`, `02-in-progress` (with the
topic sub-folders `design`, `features`, `ui`) and `03-done`. The board gained a
`00-epics` folder when the epics moved out of the stage system, the grid view
depends on the folder layout, and the priority range in the specification was
narrower than the range `kan` accepts.

## Resolutions

- [x] **Document** - `00-epics` is listed, and it is recorded that epics are not
      a stage: an epic stays open until the features and user stories it bundles
      have cleared every stage, so it has no status, and views that group cards
      by stage skip the folder while the documentation shortcodes still find
      epic cards by their `ep` prefix.
- [x] **Document** - a lane is one stage folder, labelled with its folder name;
      a topic sub-folder is labelled with the stage number of its parent folder,
      a dash, then the sub-folder name, so `02-in-progress/design` is
      `02-design`. The two digit prefix is the stage number, never a priority.
- [x] **Reconcile** - the priority range is `p0` to `p9`; `p0` to `p3` are in
      use today and the rest is left free for later. The specification and
      `AGENTS.md` now say so, matching `kan -p`.

## Acceptance Criteria

- [x] The stage folders named in the specification are the folders that exist on
      disk
- [x] The priority range is stated once and honoured by `kan`, the specification
      and `AGENTS.md`
