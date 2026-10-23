---
description: Report the kanban board state
argument-hint: '[stage]'
---

Report the kanban board state${1:+ for the `${1}` stage}.

Cards are markdown files under `content/kanban/`, in the stage folders
`01-to-do`, `02-in-progress` (which nests topic sub-folders such as `design/`,
`features/`, `ui/`) and `03-done`. Read them from the folders; cards in
sub-folders count as part of their stage.

For each card derive, then list:

- **ID**: the filename without `.md` (e.g. `p2-us-html-check`).
- **priority**: the leading `p<N>` token.
- **kind**: the two-letter middle token (`us` user story, `ep` epic, `ft`
  feature, `id` ideation, `sp` specification, ...).
- **stage**: the folder the file sits in. There is no `status` front matter
  field, so do not go looking for one.
- **title**, `params.due`, `params.completionDate`, `params.dependencies`.

Flag: cards in `02-in-progress` whose `params.due` has passed; cards in
`03-done` with no `params.completionDate`; cards in `01-to-do` that already have
one; cards whose `dependencies`/`references` are empty rather than `null`; cards
whose filename is not `p<N>-<xx>-<slug>`.

Keep the report compact: one line per card, grouped by stage.
