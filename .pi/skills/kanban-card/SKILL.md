---
name: kanban-card
description:
    Create, move, and update static Kanban cards in content/kanban. Use when
    adding or tracking work items on the site's kanban board.
---

# Kanban card

Cards are markdown files in `content/kanban/<kind>/`. The folder must match the
kind used at creation time.

Kinds and ID prefixes:

| Kind           | Prefix |
| -------------- | ------ |
| acceptance     | ac-    |
| bugs           | bg-    |
| deliverables   | dl-    |
| deployment     | dp-    |
| epics          | ep-    |
| features       | ft-    |
| ideation       | id-    |
| meta           | mt-    |
| releases       | rl-    |
| requests       | rq-    |
| scaffold       | sf-    |
| specifications | sp-    |
| testing        | ts-    |
| user-stories   | us-    |

## Creating a card

```bash
hugo new content kanban/<kind>/<prefix>-NNN-<slug>.md --kind <kind>
```

The archetype fills in the front matter and a body skeleton. Then fill in:

- `title` and `description` (50 characters or less).
- `params`: `sprint`, `stage`, `status`, `completed`, `due`, `percent`,
  `estimatedtime`, `actualtime`, `priority`, `dependencies`, `references`. Use
  `null` for unset values and `dependencies` (not `depends-on`).
- The body: a short summary before `<!--more-->`, then goals and acceptance
  criteria.

Read `references/front-matter.md` for the full field reference and a completed
example.

## Updating a card

- Status changes: update `status`, `percent`, `completed`, and `actualtime`
  together; keep them consistent.
- Moving a card between kinds: move the file to the matching folder and change
  nothing else unless the front matter also needs it.
- Dependencies: list other card slugs in `params.dependencies`.

## Viewing state

- Cards render at `/kanban/` and per-bucket pages; the `kanban-list-short`
  shortcode embeds a table of cards matching an ID prefix into any page.
- The card template highlights overdue, incomplete cards with a destructive
  banner.
