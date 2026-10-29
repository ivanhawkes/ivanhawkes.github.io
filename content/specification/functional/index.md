---
author: Ivan Hawkes
date: '2026-04-25'
description: Functional Specification
title: Functional Specification
type: specification
---

The purpose of a functional specification is to translate the requirements
defined in the requirements specification into a detailed description of the
solution’s expected functionality and behaviour, while aligning with the
technical approach outlined in the technical specification.

It defines how the solution will operate, including its processes, business
rules, inputs, outputs, and interactions, providing a clear reference for
development, testing, and validation to ensure the implemented solution meets
the agreed business requirements and technical constraints.

## How The Solution Operates

The solution is a Hugo site whose entire state is plain files in a git
repository. Authoring, task tracking, documentation, and styling are all
performed by editing those files. A build converts them into a complete static
site, and publishing copies that output to a static host. There is no runtime
component: the published site serves pre-generated files, so what is served is
exactly what was built and validated.

## Inputs And Outputs

| Input                                                                                 | Output                                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Markdown pages and page bundles in `content/`                                         | One HTML page per page, in `public/`.                                                                 |
| Recipe `index.md` front matter with the `ingredients.yaml` and `method.yaml` sidecars | Recipe pages with an ingredient list, a method list, a portions value, and a times table.             |
| Kanban card files in `content/kanban/<stage>/`                                        | The Kanban board, and the card tables embedded in the specification documents.                        |
| YAML files in `data/`                                                                 | Data files exposed to the resource filesystem, reproduced in documents by the `print-code` shortcode. |
| Markdown in `content/specification/`                                                  | The specification documents, with live tables generated from the cards.                               |
| Theme layouts, partials, shortcodes, and Tailwind source CSS                          | The markup and the single compiled stylesheet.                                                        |
| Static files and LFS media in the bundles and `static/`                               | Served images, documents, and feeds unchanged.                                                        |

The build also emits a sitemap and RSS feeds. Rules that every input must
satisfy are stated in the technical specification; the checks that enforce them
are listed with the non-functional expectations in the requirements
specification.

## Content Types

Each content type is rendered by its own layout directory in `be-best/layouts/`.
Posts, recipes, specification documents and every Kanban card kind are authored
from an archetype in `be-best/archetypes/`; the project, profile and about pages
are authored by hand.

Chrome-free markup is a layout, not a content type: a page that sets
`layout: raw` is rendered by `be-best/layouts/raw.html`, which writes the page's
content with no site chrome around it. No page sets it today.

| Type            | Purpose and behaviour                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `post`          | Articles, grouped into the sections `cryengine`, `garden`, `general`, `linux` and `programming`. Each post is a page bundle holding its own media. |
| `recipe`        | Recipes, grouped by cuisine, with structured portions, timings, and an ingredient list and method held in sidecar files.                           |
| `kanban`        | The task cards that make up the Kanban board, held in a stage folder.                                                                              |
| `specification` | The project's own documents, which read the cards so that documentation is generated from the project's data.                                      |
| `project`       | Project descriptions, presented as cards with a featured image.                                                                                    |
| `profile`       | Author profile pages, presented as cards with a featured image.                                                                                    |
| `about`         | The about page and its section listing.                                                                                                            |

Cards and listing pages search a page bundle for an image named `featured.webp`
and use it as the card image and the page hero when it is present. The image is
read from the bundle of the page itself, never from an ancestor section, for a
card and for a page hero alike: an image-less card is text alone and a page with
no image of its own has no hero, so neither a listing nor an article repeats a
section's photograph. A page hero is drawn in the column the prose is read in,
not across the whole window: it is capped at the prose measure, the width its
own paragraphs reach, and its variants stop at 1280 pixels, which fills that
column at 2x density. A listing lays its cards out in one, two and three columns
at the 768px and 1280px breakpoints, each card keeping the height its own text
needs, and a card title is a heading set at the `h3` size in the ink headings
use, and links.

## Article Behaviour

An article renders its body through the Markdown render hooks, so links, tables,
images and codeblocks receive the classes the stylesheet expects. Section
listings paginate at twelve entries, and each section, term, and the home page
publish an RSS feed of at most fifty items. A page whose bundle contains
`featured.webp` shows that image in its card and as its hero.

## Recipe Behaviour

A recipe page is generated from its front matter and its sidecar files. The
front matter provides the cuisine, the categories, the tags, the portions, and
the prep and cook times as ISO 8601 durations. The recipe partials convert the
durations to minutes and present prep time, cook time, and their sum in a table,
which is emitted only when at least one duration is set. The ingredient list is
read from `ingredients.yaml`, so the ingredients of a recipe can be queried and
rendered separately from its prose. Each dish of a recipe has its steps in
`method.yaml`, a `method-list` of dishes whose `method` lists hold the steps in
order, one string per step; the steps of `## Directions` sections are named by
the recipe title, because that heading names no component. The method partial
reads the file and puts the steps in the second column, under the prose that
introduces them: one ordered list per dish, numbered, each step rendered as
markdown so a step may carry a link or a label in bold. A dish is headed by its
name when the recipe has more than one dish to name, and a name equal to the
page's title is not repeated as a heading. A bundle with no `method.yaml`, or
with a file that names no dish, prints no method at all: the sidecar is
optional, and the recipe page is whole without it. Background prose -
descriptions, notes, variations, storage - stays in `index.md`.

## Kanban Behaviour

The Kanban board is the `kanban` section: a responsive grid of cards, each
showing the card's title, its description, and its author. The card's banner is
highlighted when the card has a due date that has passed and no completion date,
so an overdue card is visible on the board. The id, priority and due date of a
card are also presented in the tables that the specification documents generate.

The behaviour of the system is defined by the files:

- Creating a card means creating a file in `01-to-do`, from the archetype of the
  card's kind, with a filename of `p<priority>-<prefix>-<slug>.md`. The
  `<prefix>-<slug>` id must not already be used by a card in any stage.
- Changing a card's status means moving the file between stage folders. There is
  no status field, so a card cannot disagree with its own location, and the file
  history is the history of the board.
- Completing a card means moving it to `03-done` and setting
  `params.completionDate`.
- Priority is a filename component, so re-prioritising a card is a rename, and
  the board orders itself by filename.
- The `kan` tool performs the creation steps, refuses a duplicate id, and leaves
  the card in `01-to-do` for the author to fill in.

## Documentation Behaviour

The specification documents live in the content tree, so they are built and
published with the site and stay under the same version control as the code they
describe.

Tables in those documents are generated: the `kanban-list-short` shortcode
selects the cards of one kind by filename pattern, across every stage, and lists
their id, summary and due date, and the `print-code` shortcode reproduces a data
definition from `assets/` as a highlighted codeblock. A document therefore
reflects the cards at the moment of the build, and updating a card needs no edit
to the document that presents it.

A kind with no cards renders "No documentation was found.". Most kinds have no
cards on purpose: the specification summary keeps one table per kind as a worked
example of the shortcode, so those empty tables are retained.

## Navigation And Page Presentation

Every page is built from one base layout, and presents a sticky top bar, the
page content in a single `main` landmark, and a footer. The bar holds the brand,
the primary navigation, a search box, the colour scheme switch and, below 1024
pixels, the control that opens the navigation as a drawer sliding in from the
right. The 404 page is generated by its own layout.

The navigation is generated from the site menu and the content tree by a
recursive partial, so submenus are nested lists of the same structure at every
depth. Each entry, with its name, parent, weight and icon, comes from the
`menus` front matter of a content file; the menus the bar renders, in order, the
deepest level it shows, and the menus that sit behind one grouped entry, come
from `navigation.menus`, `navigation.maxDepth` and `navigation.grouped` in the
site parameters. The entry of the current page is marked `aria-current="page"`,
and the entries on the path to it carry the trail state, which is the section
the drawer opens on. An entry with children opens its panel on click, on hover
and on keyboard focus, and closes it on Escape, on a click outside the bar and
on navigation; the arrow keys, Home and End move through the level, into a panel
and back out of one. Below 1024 pixels the list is a modal dialog: focus is
trapped in it, Escape, a scrim click and a link click close it, and focus
returns to the control that opened it. When the row runs out of room, the
entries that do not fit move into an overflow menu, so it never scrolls sideways
and no label is clipped. With scripts off the bar opens its panels on hover and
on keyboard focus, the list stacks below the bar on a narrow page, and the
controls that need a script are withdrawn.

The search box submits a Google search scoped to this site; `theme.search` in
the site parameters includes it or leaves it out.

Codeblocks are rendered as a card: a bar naming the file the block came from, a
chip naming its language, and a copy control, above the highlighted field, in
which a long line scrolls sideways instead of widening the page. The copy
control puts the fenced source on the clipboard, line numbers and highlighting
excluded, and answers with a check, a label, and a result announced to a screen
reader; it is a real button, so the keyboard reaches it, and it is withdrawn
from a page where scripts did not run. A block can be collapsed behind a
summary, which opens it. Images are generated in a ladder of widths from 320
pixels up, with placeholders, so a visitor receives an image sized for their
device. Each box names its own ceiling: 1280 pixels for a page hero and an image
in the prose, 960 for a card image, so no browser is offered a variant wider
than the box it draws. Colour scheme is chosen with a button in the bar, which
cycles the light, dark and system settings; the choice is remembered between
visits, the system setting follows the operating system, and the recorded `dark`
class and `data-theme` attribute drive the theme's styles.

## Publishing Behaviour

A push to the `publish` branch runs the publish workflow, which builds the CSS,
builds the site, runs the whole suite of checks against that build -
`pnpm run test:ci`, every check of `pnpm run test` and the tests of the
`cmd/kan` scaffolder - and uploads the result as the Pages artifact. A build
that fails, or a build any check reports a problem in, stops there: nothing is
published, and the previously published site stays live. Work on other branches
is never published.

## Outstanding Functionality

The functionality that the site does not yet provide is stated as requirements,
each with its own acceptance criteria, and is listed in the requirements
specification: image processing for posts, codeblock presentation, the semantic
colour token layer, and the Kanban section improvements.

## Related Documents

- [Project summary](/specification/summary/)
- [Requirements specification](/specification/requirements/)
- [Technical specification](/specification/technical/)
- [Decision record](/specification/decisions/)
- [Ideation](/specification/ideation/)
