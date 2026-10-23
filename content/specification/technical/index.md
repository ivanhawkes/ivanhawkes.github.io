---
author: Ivan Hawkes
date: '2026-04-25'
description: Technical Specification
title: Technical Specification
type: specification
---

# Technical Specification

The purpose of a technical specification is to define the technical approach,
architecture, technologies, infrastructure, interfaces, and implementation
constraints required to deliver the solution. It translates the requirements and
functional expectations into a technical framework that guides development,
integration, deployment, and ongoing support, while ensuring alignment with
relevant standards and technical constraints. It provides a reference for
delivery teams to ensure the solution is implemented consistently, reliably, and
in accordance with the agreed technical approach.

## Data Definitions

Exact definitions for the project data structures are listed in this section.
The definitions are provided in an open data definition language: JSON Schema
vocabularies (`type`, `required`, `properties`, `$ref`) written in YAML and
organised in the OpenAPI Specification v3.1.0 component style, with reusable
definitions under `components/schemas`.

Definition files are kept in `assets/` so that they are readable by Hugo's
resource filesystem. The `print-code` shortcode resolves its `file` parameter
relative to `assets/`, which is how each definition is reproduced in this
document.

### Kanban Card Front Matter

Kanban cards are markdown files with front matter in YAML format. The YAML
defines the metadata used by the Kanban system for tracking the progress of
tasks.

`assets/kanban-card-front-matter.yaml` is the definition that card front matter
must conform to. Every card under `content/kanban/` is validated against it by
`pnpm run test:kanban`, which reports every deviation and fails the build when
there is one. The definition was repaired by the
`is-front-matter-schema-invalid` card; the validation it now makes possible is
described under Schema Validation.

{{< print-code file="kanban-card-front-matter.yaml" >}}

### Card Identity

A card is identified by its filename, not by a field inside it. The filename is
`p<priority>-<prefix>-<slug>.md`, for example `p2-us-html-check.md`:

- `p<priority>` is a single digit from `p0` (most urgent) to `p3`.
- `<prefix>` is the two letter abbreviation of the card's kind, such as `us` for
  user stories or `is` for issues. The kinds each prefix belongs to are listed
  under Card Kinds.
- `<slug>` is a lowercased, dash separated title of at most 40 characters.

The `<prefix>-<slug>` pair is the card's id. It must be unique across every
stage folder, because the documentation shortcodes select cards by the pattern
`p[0-9]-<prefix>-.*` and present that id to the reader. Card filenames carry no
serial numbers: a serial number has to be reassigned whenever a card is
reordered, and it collides between kinds, so it carries no information that the
id does not already carry. The `kan` tool searches all stages and refuses to
write a card whose id is taken.

The kind of a card is recorded by the filename prefix and by the archetype it
was created with (`hugo new content <path> --kind <kind>`), never by a front
matter field. The same is true of priority and of status.

### Card Kinds

The kind of a card fixes three things at once: the two letter prefix in its
filename, the Hugo archetype it is scaffolded from, and the `--kind` value that
archetype is named by. The table below is the single source of truth for that
mapping; the board, the documentation shortcodes and the `kan` tool all read it
from here.

| Prefix | Kind (`--kind`)  | Type          | Example                   | Description                              |
| ------ | ---------------- | ------------- | ------------------------- | ---------------------------------------- |
| `id`   | `ideation`       | Ideation      | `p1-id-initial-concept`   | Ideas and concept capture                |
| `sp`   | `specifications` | Specification | `p1-sp-write-specs`       | Specs (requirements, tech, test, design) |
| `dl`   | `deliverables`   | Deliverables  | `p2-dl-write-the-pdf`     | Produced deliverables                    |
| `sf`   | `scaffold`       | Scaffold      | `p2-sf-repo-skeleton`     | Services, repo, skeleton, scaffolding    |
| `ep`   | `epics`          | Epics         | `p2-ep-kanban-system`     | Bundles of related features              |
| `ft`   | `features`       | Features      | `p2-ft-image-handling`    | Major and minor features                 |
| `ac`   | `acceptance`     | Acceptance    | `p2-ac-board-is-readable` | Criteria required for acceptance         |
| `dp`   | `deployment`     | Deployment    | `p2-dp-publish-to-pages`  | Steps required to deploy the app         |
| `is`   | `issues`         | Issues        | `p1-is-menu-overlap`      | Defects in the code and content          |
| `rl`   | `releases`       | Releases      | `p2-rl-v1-launch`         | Versioned releases, tied to GitHub       |
| `ts`   | `testing`        | Testing       | `p2-ts-html-validation`   | Test and QA work                         |
| `us`   | `user-stories`   | User stories  | `p2-us-read-a-post`       | Requirements expressed as user stories   |

A kind with no cards is normal: the summary document keeps one table per kind,
so kinds that are not in use render their empty table on purpose.

Adding a kind means adding the three things the kind owns, together:
`themes/be-best/archetypes/<name>.md`, a row in the table above, and the same
row in the `kinds` list in `cmd/kan/main.go`. Removing one drops all three, and
the cards of that kind are reclassified rather than deleted.

### Status And Stage

A card's status is the stage folder that holds it: `01-to-do`, `02-in-progress`,
whose work may be grouped into the topic sub-folders `design`, `features` and
`ui`, or `03-done`. There is no `status` and no `stage` front matter field, so
moving the file between stage folders with `git mv` is the status change, and
the version control history of the file is the audit trail. Completing a card
additionally sets `params.completionDate` to the date of completion.

### Front Matter Fields

Cards carry the following fields. The order listed by the archetypes is the
order new cards are written in.

| Field                   | Type                 | Notes                                                                         |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `title`                 | string               | Display title, at most 40 characters. Archetypes title-case the slug into it. |
| `description`           | string               | One line summary, kept to 50 characters, used by cards and tables.            |
| `date`                  | date                 | Creation date, in the site date format.                                       |
| `author`                | string               | `Ivan Hawkes`, quoted inconsistently across the cards.                        |
| `params`                | object               | The tracking block described below.                                           |
| `params.completionDate` | date or null         | Date of completion; `null` until the card is done.                            |
| `params.due`            | date or null         | Target date; `null` where no date is set.                                     |
| `params.dependencies`   | array of ids or null | Ids of cards that must be completed first.                                    |
| `params.references`     | array of ids or null | Ids of related cards.                                                         |

A card carries no other keys. `layout` is derived by Hugo from the content type,
`lastmod` is derived from the git history, and priority, status and kind come
from the filename and the stage folder, so none of them is front matter. The
card archetypes emit exactly the keys above, and the definition forbids the
rest, so a card that grows a `layout`, `lastmod`, `priority`, `categories` or
`tags` key fails validation.

The body of a card follows the front matter: a short description of 50
characters or less, then the `<!--more-->` anchor, then a body that lists the
work and an `Acceptance Criteria` section.

### Schema Validation

`scripts/validate-kanban-front-matter.mjs` reads every card under
`content/kanban/`, parses its YAML front matter, and validates it against
`assets/kanban-card-front-matter.yaml` with the JSON Schema keywords `type`,
`required`, `properties`, `additionalProperties`, `maxLength` and `format`. A
duplicate mapping key is reported by the YAML parser itself, so a key pasted
twice cannot hide behind the last definition. The script is run by
`pnpm run test:kanban`, and its current result is:

```text
22 cards validated against assets/kanban-card-front-matter.yaml: no deviations
```

Every card sets all four `params` keys, and no card uses `params.dependencies`
or `params.references` for anything but `null`: the keys are documented, and
unused so far.

The definition was repaired by the `is-front-matter-schema-invalid` card, which
resolved the deviations below.

| Deviation                                                                               | Resolution                                                                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The definition required a `layout` field that no card has.                              | Dropped from `required`: Hugo derives the layout from the content type.                          |
| The definition described `params.completed`; the cards use `params.completionDate`.     | Renamed to `params.completionDate`, the key the cards and the card layout use.                   |
| Three numeric blocks were pasted inside `params.due`, leaving a date field as `number`. | Deleted, so `due` is a date again.                                                               |
| The definition described `priority` and `lastmod` as card fields; no card has them.     | Both removed: priority is a filename component, and Hugo derives `lastmod` from the git history. |
| The archetypes emitted `categories` and `tags`, which the definition does not describe. | Removed from the card archetypes and from the one card that kept them; kind is the prefix.       |
| The definition allowed a description of 80 characters; the convention is 50.            | `maxLength` is 50, and the two longer descriptions were shortened.                               |
| The definition said nothing about keys a card must not carry.                           | `additionalProperties: false` on the card and on `params`, whose four keys are required.         |

## Card Names And Content Types

Content is organised as Hugo page bundles under `content/`. The content types in
use are `post`, `recipe`, `kanban`, `specification`, `project`, `profile`,
`dashboard`, `about` and `bare`, each with a layout directory in
`themes/be-best/layouts/` and an archetype in `themes/be-best/archetypes/`. A
bundle keeps the markdown of a page together with the images and other assets it
uses, which is what makes page-relative resources, featured images and
per-bundle caches possible.

Recipes add a sidecar file, `ingredients.yaml`, next to the bundle's `index.md`.
The recipe front matter carries `cuisine`, `categories`, `tags`, `portions`,
`prep-time` and `cook-time`, the last two as ISO 8601 durations such as `PT5M`.

Dashboard pages are development scratch pages. They are listed as links; the
`dashboard/section.html` layout does not embed their content in a listing,
because embedding a whole page nests `main`, `nav` and `footer` landmarks inside
the listing page.

## Presentation Layer

The theme is `themes/be-best`, a git submodule that is published on its own
repository's `features` branch. The parent repository records the theme commit
as a submodule pointer, so a theme change is committed and pushed inside the
submodule before the parent records it.

Styling is Tailwind CSS v4. The theme's source stylesheet is
`themes/be-best/assets/css/main.css`; the compiled stylesheet is
`assets/css/main.css`, which is build output and is not versioned. Hugo writes
`assets/jsconfig.json` for Tailwind v4 editor intelligence during the CSS build,
and `hugo_stats.json` records the classes in use; both are build output. The
theme's scripts are TypeScript in `themes/be-best/assets/js` (menu, sidebar,
dark mode, and the codeblock copy button), compiled by Hugo into one small
bundle.

## Interfaces

Content reaches the presentation layer through three documented contracts.

Markdown render hooks, in `themes/be-best/layouts/_markup/`:

- `render-link.html` and `render-table.html` add the classes and attributes that
  the stylesheet expects. Attributes must be separated from the tag name and
  from each other by whitespace, so a template that trims whitespace before an
  attribute produces invalid markup such as `<atitle="...">`.
- `render-image.html` resolves page bundle images and emits a fallback that is
  valid inside a paragraph.
- `render-codeblock.html` renders a highlighted codeblock with a copy button,
  and an optional `details` and `summary` wrapper.

Shortcodes, in `themes/be-best/layouts/_shortcodes/`:

- `kanban-list-short` takes a `prefix` parameter, selects the Kanban cards whose
  filenames match `p[0-9]-<prefix>-.*` across every stage, and renders a table
  of id, summary and due date. A kind with no cards renders "No documentation
  was found.", which is the expected output for the kinds kept as examples.
- `img` takes `src` and `alt` with optional treatment parameters, and renders
  responsive images in widths from 320 to 1920 pixels with generated
  placeholders.
- `print-code` takes a `file` parameter relative to `assets/`, and renders the
  file as a highlighted codeblock with a copy button. It is how the data
  definitions in this document are reproduced.

The Kanban board itself is the `kanban` section, rendered by
`themes/be-best/layouts/kanban/section.html` as a responsive grid of card
partials.

## Tooling

### Kanban Card Scaffolder

`cmd/kan` is a Go program that scaffolds cards. It takes a kind and the words of
a title, resolves the kind from its name, its prefix, or an alias, normalises
the slug, refuses an id that is already used in any stage, and writes the new
card into `01-to-do` from the matching archetype. Cards are created there by
default because that is where new work starts. The tool is used through
`go run ./cmd/kan`, and its unit tests run with `go test ./cmd/kan`.

The command line is:

```text
kan [flags] <kind> <title words...>
```

| Flag              | Default    | Meaning                                              |
| ----------------- | ---------- | ---------------------------------------------------- |
| `-stage`, `-s`    | `01-to-do` | destination stage: `1`/`2`/`3`, `to-do`, `done`, ... |
| `-priority`, `-p` | `2`        | priority digit, written into the filename            |
| `-dry-run`, `-n`  | off        | print the `hugo` command, create nothing             |

The behaviour the tool must provide:

- The kind may be given as its full name (`issues`), its prefix (`is`, `is-`),
  or a short alias (`us`, `user stories`); the match is drawn from the Card
  Kinds table.
- The title is lowercased and dash separated, and a title over 40 characters is
  rejected, because the slug is part of the card's id.
- The stage is validated against the folders that exist under `content/kanban/`,
  so an optional topic sub-folder works (`-s 2/ui`) and a typo fails loudly.
- The tool searches every stage for `<prefix>-<slug>` and refuses to write a
  card whose id is taken, since ids are unique site-wide.
- Hugo derives `title` from the filename, so the tool replaces the resulting "P2
  Us My Card" with a readable title, mirrors it in the body heading, and reduces
  the generated date to a plain ISO date.

The card is written by executing Hugo, so the archetype stays the only source of
card front matter. Each kind maps to one Hugo command, and the tool must be able
to execute every variation, with the `--kind` value taken from the Card Kinds
table:

```text
hugo new content kanban/01-to-do/p2-ac-test.md --kind acceptance
hugo new content kanban/01-to-do/p2-dl-test.md --kind deliverables
hugo new content kanban/01-to-do/p2-dp-test.md --kind deployment
hugo new content kanban/01-to-do/p2-ep-test.md --kind epics
hugo new content kanban/01-to-do/p2-ft-test.md --kind features
hugo new content kanban/01-to-do/p2-id-test.md --kind ideation
hugo new content kanban/01-to-do/p2-is-test.md --kind issues
hugo new content kanban/01-to-do/p2-rl-test.md --kind releases
hugo new content kanban/01-to-do/p2-sf-test.md --kind scaffold
hugo new content kanban/01-to-do/p2-sp-test.md --kind specifications
hugo new content kanban/01-to-do/p2-ts-test.md --kind testing
hugo new content kanban/01-to-do/p2-us-test.md --kind user-stories
```

### Front Matter Validator

`scripts/validate-kanban-front-matter.mjs` validates the front matter of every
Kanban card against `assets/kanban-card-front-matter.yaml`, using Ajv with
`ajv-formats`, and reports each deviation. `yaml` parses the front matter, so a
duplicated key is an error rather than a silent overwrite.

The `kan` tool is built and installed for interactive use with
`go build -o ~/.local/bin/kan ./cmd/kan`; the source of the program is the
repository, and the installed binary is a convenience copy of it.

## Build And Publishing

The scripts in `package.json` are the entry points: `test:css`, `test:hugo`,
`test:html` and `test:kanban` are combined by `pnpm run test`, which is also the
local equivalent of the publish pipeline. `pnpm run build` compiles the CSS and
the minified production site, `pnpm run css-watch` runs the Tailwind watcher,
and `pnpm run serve` builds the CSS once and then serves the site.

The publish workflow, `.github/workflows/hugo.yml`, builds the CSS, builds the
site with
`--environment production --gc --minify --ignoreCache --cleanDestinationDir`,
validates the generated HTML, and only then uploads the Pages artifact. Its Hugo
cache is keyed on the Hugo version, the pinned theme commit and a hash of the
site configuration, so a theme or configuration change starts a cold build.

Implementation constraints:

- Hugo 0.166.0 extended, Node 24, pnpm, and Go 1.26 for `cmd/kan`.
- Hugo's `security.exec` allowlist permits `node`, `go` and `npx`, which is what
  the CSS build and the Go tooling need; `module.mounts` exposes `assets/` and
  `data/` to the resource filesystem.
- Formatting is Prettier with `printWidth: 80`, `tabWidth: 4`,
  `proseWrap: "always"`, `singleQuote: true`, and the go-template parser for
  `*.html`. It runs on staged files through husky and lint-staged.
- Images are versioned with Git LFS, tracked per extension in `.gitattributes`.
- `public/`, `resources/`, `.hugo_build.lock`, `hugo_stats.json`,
  `assets/css/main.css` and `assets/jsconfig.json` are build output and are
  never committed.
- Template comments in Hugo must not put a space between `{{` and the comment
  opener, and Hugo's `.Description` has no summary fallback, so card partials
  that need a fallback state it as
  `{{ with .Description }}{{ . }}{{ else }}{{ .Summary | transform.Plainify }}{{ end }}`.
