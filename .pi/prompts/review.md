---
description: Review staged changes
argument-hint: '[focus]'
---

Review the staged changes. Focus on ${1:-correctness, front matter validity, and
LFS images}.

Checklist:

- Front matter parses as YAML. Kanban cards sit in a stage folder (`01-to-do`,
  `02-in-progress`, `03-done`), are named `p<priority>-<kind>-<slug>.md` with a
  prefix that matches their `--kind` archetype, use `null` (not empty) for
  unused `params` entries, and set `params.completionDate` when they are in
  `03-done`.
- Recipe front matter fields (cuisine, prep-time, cook-time, portions) are
  present and ISO where required; `ingredients.yaml` sidecars match the dish.
- No build output staged (`public/`, `resources/`, `.hugo_build.lock`).
- New or changed images are tracked by Git LFS.
- Theme changes in `be-best/` are plain files of this repository, so they belong
  in the same commit as the change that needs them.
- `pnpm run test` passes.
