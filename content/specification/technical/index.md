---
author: Ivan Hawkes
date: '2026-04-25'
description: Technical Specification
title: Technical Specification
type: specification
---

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

- `p<priority>` is a single digit from `p0` (most urgent) to `p9`. The project
  uses `p0` to `p3` today; the rest of the range is left free for later use.
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
`be-best/archetypes/<name>.md`, a row in the table above, and the same row in
the `kinds` list in `cmd/kan/main.go`. Removing one drops all three, and the
cards of that kind are reclassified rather than deleted.

### Status And Stage

A card's status is the stage folder that holds it: `01-to-do`, `02-in-progress`,
whose work may be grouped into the topic sub-folders `design`, `features` and
`ui`, or `03-done`. There is no `status` and no `stage` front matter field, so
moving the file between stage folders with `git mv` is the status change, and
the version control history of the file is the audit trail. Completing a card
additionally sets `params.completionDate` to the date of completion.

Epics are not a stage. The `00-epics` folder holds the `ep` cards, and an epic
stays open until the features and user stories it bundles have cleared every
stage, so a card in `00-epics` has no status and is never read as one. Views
that group cards by stage skip the folder; the documentation shortcodes still
find epic cards by their `ep` prefix, and epic progress is reported by the
overarching management views rather than by the board.

Epics are created with the folder named in full, `kan -s 00-epics ep <title>`:
the `1`, `2` and `3` shorthands name the three stages only.

A board lane is one stage folder, labelled with its folder name. A topic
sub-folder is labelled with the stage number of its parent folder, a dash, then
the sub-folder name, so `02-in-progress/design` is the `02-design` lane: the two
digit prefix is the stage number, never a priority. Lanes are ordered by
ascending folder name.

The board that renders those lanes is `/kanban/grid/`, the page
`content/kanban/grid/index.md` rendered by `be-best/layouts/kanban/grid.html`
through the shared partial `be-best/layouts/_partials/kanban/grid.html`, which
the personal view `/kanban/personal/` reuses with an author filter. The partial
lists the cards with `.RegularPagesRecursive`, so a stage `_index.md` is never
rendered as a card, and it derives the lanes from the folder names read with
`os.ReadDir`: a folder is a stage when its name starts with two digits and a
dash, which keeps the board page folders out, and the `00` folder is skipped
because epics are not a stage.

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
twice cannot hide behind the last definition. The script counts a markdown file
as a card by its filename, the `p<priority>-<prefix>-<slug>.md` pattern of Card
Identity: section indexes and the board pages that live inside the Kanban tree,
such as `grid/index.md`, are not cards, so they are not validated and may carry
a `layout` key that the card definition forbids. The script is run by
`pnpm run test:kanban`, and its current result is:

```text
33 cards validated against assets/kanban-card-front-matter.yaml: no deviations
```

Every card sets all four `params` keys. `params.dependencies` and
`params.references` are used by a minority of cards, which list the ids of the
cards that gate them or relate to them; the rest keep both keys as `null`.

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
use are `post`, `recipe`, `kanban`, `specification`, `project`, `profile` and
`about`, each with a layout directory in `be-best/layouts/`. An archetype in
`be-best/archetypes/` authors every Kanban card kind, every post, every recipe
and every specification document; the project, profile and about pages are
authored by hand. The `dashboard/` tree in that directory is no card kind: it is
the scaffold of a new project, writing a dashboard page, a Kanban section with
one folder per card kind, and the opening epic. Nothing under `content/` is
built from it, and it is kept for that reason. A bundle keeps the markdown of a
page together with the images and other assets it uses, which is what makes
page-relative resources, featured images and per-bundle caches possible.

Recipes add a sidecar file, `ingredients.yaml`, next to the bundle's `index.md`.
The recipe front matter carries `cuisine`, `categories`, `tags`, `portions`,
`prep-time` and `cook-time`, the last two as ISO 8601 durations such as `PT5M`.

A page with no site chrome is the `raw` layout, `be-best/layouts/raw.html`,
selected page by page with `layout: raw` in the front matter. Nothing gets
embedded in a listing: a whole page placed inside one nests `main`, `nav` and
`footer` landmarks in the listing page, which is invalid markup. No page sets
`layout: raw` today: the development scratch pages that had it are gone, and
`p3-is-css-element-fixture-page` asks for a CSS element fixture in their place.

## Presentation Layer

The theme is `be-best/`, an ordinary directory of this repository. Hugo selects
it with `theme: be-best` and `themesDir: '.'` in `config/_default/hugo.yaml`.
Its 151 files are versioned by this repository, whose only remote is
`ivanhawkes/ivanhawkes.github.io`, so a theme change is committed and pushed
here, in the same commit as the content that needs it.

Styling is Tailwind CSS v4. The theme's source stylesheet is
`be-best/assets/css/main.css`; the compiled stylesheet is `assets/css/main.css`,
which is build output and is not versioned. Hugo writes `assets/jsconfig.json`
for Tailwind v4 editor intelligence during the CSS build, and `hugo_stats.json`
records the classes in use; both are build output. The theme's scripts are
TypeScript in `be-best/assets/js` (the top bar and its navigation in
`site-header.ts` and `nav-menu.ts`, the colour scheme in `dark-mode.ts`, and the
codeblock copy control in `copy-codeblock.ts`), compiled by Hugo into two small
bundles: the deferred bundle, and a colour scheme preloader in the head that
records the visitor's setting on the root element before the first paint. That
preloader is also the signal that scripts ran at all: styles that need a script,
such as the drawer control, are withdrawn from a page whose root element carries
no `data-theme` attribute; the print control and the codeblock copy control are
withdrawn with them, since a page with no script cannot ask the driver for paper
and cannot put code on a clipboard.

### Colour Tokens

Colour is declared in two layers, and a component reads only the upper one.

The palette layer is a pair of blocks in `be-best/assets/css/main.css`: every
colour the site is painted from, written once per scheme, each named for what
the colour is for and nothing else. The `:root` block is the light scheme and
the `.dark` block the dark one, which is the only mechanism a palette value
needs. The names are `--palette-canvas`, `--palette-ink`, `--palette-brand`,
`--palette-brand-lift`, `--palette-fill-ink`, `--palette-panel`,
`--palette-panel-sunken`, `--palette-panel-sunken-ink`, `--palette-edge`,
`--palette-edge-field`, `--palette-danger`, `--palette-success`,
`--palette-stripe` and `--palette-stripe-alt`. Nothing outside the token layer
reads a palette name, so re-colouring the site is a change to those two blocks
alone.

Every pair the roles form is measured for WCAG 2.2 AA: 4.5:1 for text, and 3:1
for an icon, a control's boundary, a focus ring or an indicator, against every
surface that role can sit on. Two of the names exist because of how that works.
`--palette-fill-ink` is the ink a saturated fill carries, so it flips with the
brand: near-white on the deep brand of the light scheme, ink on the bright brand
of the dark one. `--palette-edge-field` is the boundary of a control a visitor
has to find, and clears 3:1; `--palette-edge` is the decorative hairline that
frames a card, and is exempt, because the content inside the frame carries the
meaning.

The semantic layer is `be-best/assets/css/tokens.css`: each token names a role,
and is an alias of the palette. The roles are `--bg`, `--surface`,
`--surface-2`, `--surface-brand`, `--surface-brand-ink`, `--text`,
`--text-muted`, `--brand`, `--brand-ink`, `--accent`, `--accent-contrast`,
`--accent-deep`, `--accent-soft`, `--edge`, `--edge-field`, `--focus-ring`,
`--state-danger`, `--state-success`, `--heading`, `--link`, `--link-hover`,
`--tooltip`, `--stripe-odd`, `--stripe-even`, `--header-bg`, `--header-border`,
`--nav-hover`, `--overlay`, `--shadow-sm`, `--shadow`, and the `--code-*` group.
An alias needs one value, because the palette entry it names already flips per
scheme. Where a role genuinely differs per scheme - a translucent header, a
hover, a scrim, a tooltip, a step of the brand ramp

- the light value is declared first, the `.dark` rule carries the dark one, and
  a `light-dark()` declaration in an `@supports` block takes over in browsers
  that resolve it against the root `color-scheme`; all three paths give the same
  value.

`brand.css` derives an eleven step ramp, `--color-brand-50` to
`--color-brand-950`, from the palette's brand colour with `oklch(from …)`, so
the ramp stays one value in the palette. A step moves the brand's lightness
toward white, then toward black, by a share of the room left: a multiple of the
lightness runs past 1 in the dark scheme, where the brand starts light, and
washes the pale steps to white. The token layer picks the steps the theme uses
and gives them role names: `--heading`, `--link`, `--surface-brand` (a panel
tinted with the brand, which names the ink it carries, `--surface-brand-ink`),
`--accent-deep` (the brand as ink and as a dark fill) and `--accent-soft` (the
brand as a hairline). Because the light brand of the dark scheme starts high, it
reads the 400 and 300 steps where the light scheme reads the 700 and 800. The
ramp's own utilities are for the page that displays the ramp, which has no role
to name.

The bridge to templates is the `@theme inline` block in `main.css`, which gives
every colour utility a role behind it: `bg-canvas`, `text-ink`,
`text-ink-muted`, `bg-surface`, `bg-surface-2`, `bg-surface-brand`,
`text-surface-brand-ink`, `border-edge`, `border-field`, `bg-brand`,
`text-brand-ink`, `bg-accent`, `bg-danger`, `bg-tooltip`, `text-heading`,
`text-link` and `outline-focus-ring`. A class in a template therefore names what
a thing is, never a colour, and `inline` puts the role's own `var()` into the
utility, so a scheme change recolours the whole site with no utility compiled
twice.

Two media leave the layers on purpose, and both do it in the token layer. Paper:
`tokens.css` resets the palette for `@media print`, so every role follows, and
`print.css` writes the ink of the sheet literally, toner being outside the
theme's palette. Forced colours: the same file answers every role with a system
colour - `Canvas`, `CanvasText`, `Highlight` - because in that mode the palette
is the visitor's. The syntax palette is a third case: the `--code-*` roles are a
dark field in every scheme, and `syntax-highlight.css` carries its own measured
colours.

A scheme change therefore touches palette values and role aliases, and no
component rule: `grep -n '\.dark' be-best/assets/css/*.css` answers with the
palette block in `main.css`, the overrides, print reset and forced-colours block
in `tokens.css`, and the `color-scheme` declaration in `dark-mode.css`.

### The Print Medium

The site is styled for two media: the screen, which has a viewport, a pointer
and a colour scheme, and paper, which has none of them.
`be-best/assets/css/print.css` owns the second and is imported last by
`main.css`, so its unlayered rules win over the component styles it overrides;
`tokens.css` resets the palette tokens for the medium, which makes paper always
light. The `--code-*` tokens are reset with the palette, so the code card, whose
field is dark on every screen, flattens to ink on paper. It is the only source
of `@media print` in the compiled stylesheet beyond that token reset, which
`grep -c '@media print' assets/css/main.css` reports as two blocks.

The sheet is defined by `@page` margins only: the paper size is left to the
driver, so A4 and Letter both work. The `@media print` block removes the chrome
(the bar, the sentinel, the scrim, the menu, the search box, the colour scheme
switch, the foot, the breadcrumbs, the pagers, the taxonomy list, the related
list, the copy buttons, forms, form controls and embeds), flattens the layout to
one full width column with no grid, card surface, shadow, blur, transition,
animation or viewport height, measures type in points on a 12pt root (the same
size as the 16px root the rem scale is built on), and sets `orphans` and
`widows` to 3 with page break control on headings, lists, figures, tables, rows
and codeblocks. Code and tables print black on white: long lines wrap to the
paper, table headers repeat on every page a table spans, and the stripe fills
and the dark syntax theme are replaced. A prose link is followed by its target
in parentheses; an in-page anchor, a mail or telephone link, an image link and a
card listing link print no target.

The top bar carries the control for the medium: a button in `.header-actions`,
labelled "Print this page", driven by `be-best/assets/js/site-header.ts`. It
opens every closed `details` element, so collapsed codeblocks reach the paper,
puts `html.print-mode` on the root element, and calls `window.print()`. The
`html.print-mode` rules at the foot of `print.css` are the shared core of the
medium applied to the screen, so the browser's own preview, which renders the
page as it stands, shows the sheet that will be printed; the bar keeps only this
control on screen, so the preview can be left, and it is never printed. The
browser's keyboard flow (`Ctrl+P`, `Cmd+P`) is handled through the print media
query and the `beforeprint` and `afterprint` events, which open the same sheet.
When the dialog closes, and on `Escape`, the preview is put away and the
`details` elements the control opened are shut again.

## Interfaces

Content reaches the presentation layer through three documented contracts.

Markdown render hooks, in `be-best/layouts/_markup/`:

- `render-link.html` and `render-table.html` add the classes and attributes that
  the stylesheet expects. Attributes must be separated from the tag name and
  from each other by whitespace, so a template that trims whitespace before an
  attribute produces invalid markup such as `<atitle="...">`.
- `render-image.html` resolves page bundle images and emits a fallback that is
  valid inside a paragraph. Its `sizes` hint and width ladder are the `prose`
  box of `_partials/images/boxes.html`, which names every box the theme draws an
  image in, `prose` and `card`, and is the only place a hint and a ladder are
  written: a page hero and an image in the prose take `prose`, a card takes
  `card`, and `image-variants.html` fails the build when passed one without the
  other.
- `render-codeblock.html` parses the fence's attributes and hands them to
  `_partials/codeblock.html`, which renders the card: a bar holding the file
  name, the language chip and the copy control, above the highlighted field. Its
  attributes are `file`, `copy`, `details`, `open`, `summary` and `trim` beside
  the options of `transform.Highlight`. A fence with no language is highlighted
  as the extension of the file it names, and as plain text when it names none;
  `md` is highlighted as Markdown, and a fence naming a template dialect is
  highlighted as `go-html-template`. The bar is left out when a block names no
  file and asks for no copy control, and `details=true` wraps the card in a
  `details` element whose `summary` opens it.

Shortcodes, in `be-best/layouts/_shortcodes/`:

- `kanban-list-short` takes a `prefix` parameter, selects the Kanban cards whose
  filenames match `p[0-9]-<prefix>-.*` under every folder in `content/kanban/`,
  and renders a table of id, summary and due date. A kind with no cards renders
  "No documentation was found.", which is the expected output for the kinds kept
  as examples.
- `img` takes `src` and `alt` with optional treatment parameters, and renders
  responsive images in the ladder of the `prose` box, 320 to 1280 pixels, with
  generated placeholders.
- `print-code` takes a `file` parameter relative to `assets/`, and renders the
  file through the same `_partials/codeblock.html`, so the card it produces is
  identical to a fenced block's, copy control included. Its other parameters are
  `lang` (defaulting to the file's extension, and to `yaml`), `copy`, `details`,
  `open`, `summary` and `trim`. It is how the data definitions in this document
  are reproduced.

The Kanban board itself is the `kanban` section, rendered by
`be-best/layouts/kanban/section.html` as a responsive grid of card partials.

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
hugo new content kanban/00-epics/p2-ep-test.md --kind epics
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

The scripts in `package.json` are the entry points. `test:css` and `test:hugo`
build; the six checks that read the build - `test:lint`, `test:html`,
`test:headings`, `test:placeholders`, `test:kanban` and `test:prettier` - are
combined by `test:checks`. `pnpm run test` is the CSS build, the site build and
`test:checks`. `pnpm run test:ci` is `test:checks` and `go test ./cmd/kan`, the
set a build already made can be judged by, and is what CI runs. `pnpm run build`
compiles the CSS and the minified production site, `pnpm run css-watch` runs the
Tailwind watcher, and `pnpm run server` builds the CSS once and then serves the
site.

The publish workflow, `.github/workflows/hugo.yml`, builds the CSS and builds
the site with
`--environment production --gc --minify --ignoreCache --cleanDestinationDir`,
then runs `pnpm run test:ci`: every check of `pnpm run test` less its two build
steps, which the workflow has already performed in minified form, and
`go test ./cmd/kan`. A check that fails stops the job before the Pages artifact
is uploaded, so the site is built once per job and nothing publishes that the
checks did not clear. Its Hugo cache is keyed on the Hugo version, the `be-best`
tree hash and a hash of the site configuration, so a theme or configuration
change starts a cold build.

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
