---
name: kanban-card
description:
    Create a program that will allow efficient management of kanban cards stored
    in the project.
---

# Scope

This skill is about writing the code of `kan`, the card scaffolding command line
tool in `cmd/kan`. Its goal is to execute a hugo command on the user's behalf,
saving typing effort and producing consistently named markdown files with kanban
data as their contents.

The program's expected behaviour is not defined here. **Read
`content/specification/technical/index.md` before writing or changing the
program**, and treat it as the source of truth. It defines:

- _Card Identity_ and _Card Kinds_: the `p<priority>-<prefix>-<slug>` filename,
  site-wide id uniqueness, and the authoritative prefix / kind / archetype
  table.
- _Status And Stage_: the stage folders, the topic sub-folders, and the fact
  that the stage folder is the status.
- _Front Matter Fields_ and _Schema Validation_: what a card contains, and how
  `pnpm run test:kanban` checks it.
- _Tooling → Kanban Card Scaffolder_: the usage line, the flags, kind and stage
  resolution, the hugo command to execute, and the post-write fixes.

Do not restate those details in this skill; link to the section that owns them.
When a change alters behaviour, update the technical specification in the same
commit. The card-authoring quick reference in `references/front-matter.md` is
for filling in a card by hand, not for the tool; the spec's _Front Matter
Fields_ section outranks it.

# Writing The Program

- Language: choose one of python3, node js, go lang, bash. The current
  implementation is Go, at `cmd/kan/main.go`, with tests in
  `cmd/kan/main_test.go`.
- Run the tests with `go test ./cmd/kan`, and exercise a real card with
  `-dry-run` first, then `pnpm run test:kanban`.
- Build and install the binary so it is on the PATH:

    ```
    go build -o ~/.local/bin/kan ./cmd/kan
    ```

# Implementation Notes

- Parse flags with the standard flag package; the flag names and defaults are in
  the spec's flags table.
- Resolve the kind by matching the first word against the name, the prefix (the
  `-` is optional) and the aliases of every kind in the table, so that the
  caller can type `issues`, `is`, `is-` or `user stories`.
- Normalise the title into a slug, then compose the filename from the priority,
  the prefix and the slug.
- Resolve the stage by listing the folders that exist under `content/kanban/`
  rather than by hardcoding the three stages, so that topic sub-folders such as
  `02-in-progress/ui` resolve and a typo fails loudly.
- Search all stages for the id before writing, and refuse a collision; the id is
  unique site-wide.
- Write the card by executing hugo, so the archetype stays the only source of
  card front matter. Every kind must produce its own command, e.g.

    ```
    hugo new content kanban/01-to-do/p2-us-hunt-the-wumpus.md --kind user-stories
    ```

- Hugo derives the title from the filename, so rewrite it after hugo writes the
  file ("P2 Us My Card" becomes "My Card"), mirror it in the body heading, and
  reduce the generated timestamp to a plain ISO date.
- Keep the per-kind table in `cmd/kan/main.go` in sync with the table in the
  technical specification, and with the archetypes in
  `themes/be-best/archetypes/`.
