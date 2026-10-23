---
description: Scaffold a new kanban card
argument-hint: '<kind> <slug> [priority]'
---

Create a kanban card of kind `${1}` with slug `${2}` at priority `${3:-2}` in
the to-do stage:

```bash
hugo new content kanban/01-to-do/p<priority>-<kind-prefix>-${2}.md --kind ${1}
```

`<kind-prefix>` is the kind's two-letter abbreviation from the Card Kinds table
in `content/specification/technical/index.md` (`issues` -> `is`, `epics` ->
`ep`, `user-stories` -> `us`, `specifications` -> `sp`, ...). Pass `--kind` with
the full kind name; without it Hugo scaffolds a plain draft, not a card.

Then fill in the card per that skill's `references/front-matter.md`:

- `title`: the archetype title-cases the filename ("P2 Rq My Card"), so rewrite
  it into a real title.
- `description`: 50 characters or less.
- the `params` block: `due`, `completionDate`, `dependencies`, `references`.
  Unused entries are `null`, not empty. There is no `status`, `stage`, or
  `priority` field; the stage folder and filename carry that.
- body: a short summary, then `<!--more-->`, then `## Goals` and
  `## Acceptance Criteria` as checklists.

Validate with `pnpm run test`.
