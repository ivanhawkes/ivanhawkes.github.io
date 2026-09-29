---
description: Review staged changes
argument-hint: '[focus]'
---

Review the staged changes. Focus on ${1:-correctness, front matter validity, and
LFS images}.

Checklist:

- Front matter parses as YAML; kanban cards have folder name matching kind and
  `dependencies` spelled consistently.
- Recipe front matter fields (cuisine, prep-time, cook-time, portions) are
  present and ISO where required; `ingredients.yaml` sidecars match the dish.
- No build output staged (`public/`, `resources/`, `.hugo_build.lock`).
- New or changed images are tracked by Git LFS.
- Theme changes were committed inside the submodule before the parent pointer
  moved.
- `pnpm run test` passes.
