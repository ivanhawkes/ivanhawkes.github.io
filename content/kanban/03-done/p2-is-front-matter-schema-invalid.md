---
author: Ivan Hawkes
date: '2026-10-22'
description: 'Card front matter schema is invalid and outdated'
params:
    completionDate: '2026-10-22'
    dependencies: null
    due: null
    references: null
title: 'Kanban Front Matter Schema Invalid'
---

The front matter schema does not describe the cards, and cannot be used.

<!--more-->

## Kanban Front Matter Schema Invalid

`assets/kanban-card-front-matter.yaml` is the definition that card front matter
must conform to, and the technical specification asks for every card to be
validated against it. The definition is broken, so validation against it is
impossible, and the cards as a set disagree with it in several ways.

- [x] Remove the required `layout` field; no card has one, and Hugo derives the
      layout from the content type.
- [x] Rename `params.completed` to `params.completionDate`, which is the field
      the cards use.
- [x] Delete the three numeric blocks pasted inside `params.due`, which leave
      the effective type of a date field as `number`.
- [x] Drop `priority` and `lastmod` from the card properties, or add the fields
      to the cards; priority is a filename component today.
- [x] Decide the `categories` and `tags` question: the archetypes emit them and
      the schema does not define them, and one card still carries both.
- [x] Set the `description` maximum to the project convention of 50 characters
      and shorten the two cards that exceed it: `p2-ft-image-handling` (66) and
      `p2-us-code-to-clipboard` (54).
- [x] Validate every card under `content/kanban/` against the repaired
      definition and record the result in the technical specification.

The fields that were dropped, and why: `layout` and `lastmod` are Hugo-derived,
`priority` lives in the filename, and `categories` and `tags` carry nothing that
the kind prefix does not already carry, so the card archetypes stopped emitting
them, the one card that kept them lost them, and the definition now rejects
every key it does not describe. The archetypes also emit `author: Ivan Hawkes`,
which a required string field needs, and a 50 character limit in the summary
line.

## Acceptance Criteria

- [x] Every card in `content/kanban/` validates against
      `assets/kanban-card-front-matter.yaml` with no deviation.
- [x] The definition has no duplicated keys, and no required field is absent
      from the cards.
- [x] The deviations table in the technical specification is updated to show the
      result of the validation.
