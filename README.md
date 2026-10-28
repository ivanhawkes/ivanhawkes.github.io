# A Personal Blog

This is a static website built with Hugo that I use to blog the insignificant
details of my life.

It is a training exercise and a playground: a place to test out techniques with
no consequences if something breaks.

The site uses a custom Hugo theme, which provides the blog functionality.

Additionally, I am working on a simple Kanban board and documentation system
that exists entirely as static files, versioned and deployed together with the
website.

You can watch progress in every commit and check out any past point for a
snapshot of the work. In practice only I use it, mainly because I don't want to
task-switch to a sluggish corporate tool several times a day just to track
tasks. It lives entirely in my IDE, can be edited with any text editor, and is
static so it loads in a fraction of a second.

I am trialling a method of writing documentation in markdown that Hugo
transforms into HTML for viewing.

The documents give live views on the progress of requirements and functionality:
they query Kanban cards and display their state. This keeps me breaking every
idea down into a single chunk of information or task, which I track via Kanban
and document in specification documents that use shortcodes to query and embed
card information.

You can see some examples:

- [project summary](/specification/summary/index.html)
- [ideation](/specification/ideation/index.html)
- [requirements specification](/specification/requirements/index.html)

## Getting started

### NixOS with Devenv

If you are using NixOS or another OS with a Devenv setup, entering the Devenv
shell gives you everything needed to develop and run the project:

```bash
devenv shell
```

### All other operating systems

Install the required software on your machine:

- Git
- Node.js 24
- PNPM
- Hugo 0.166.0
- Tailwind CSS + Typography

```bash
# Make sure all the project dependencies are installed.
pnpm i
```

## Development

Build the output `public` folder with:

```bash
# Non-minified build, easier to read than the deployed version.
pnpm run test

# Minified production build.
pnpm run build
```

To develop against a live server, run a pair of terminals, one for Hugo and one
for the Tailwind watcher:

```bash
# Watch the CSS with Tailwind.
pnpm run css-watch

# Build the CSS once, then serve the site locally with Hugo.
pnpm run server
```

## Style

Check the CSS against stylelint's standards:

```bash
pnpm stylelint "**/*.css"
```

## Adding a new Kanban card to the stack

Cards live in a stage folder - `01-to-do`, `02-in-progress` (optionally under a
topic sub-folder, and `features/` is the only one on disk) or `03-done` - and
are named `p<priority>-<kind-prefix>-<slug>.md`, for example
`p2-us-html-check.md`. Moving a card's file between stage folders is how its
status changes; there is no `status` front matter field. The kind is recorded by
the two-letter prefix in the filename and by the `--kind` archetype it was
created with. That prefix plus the slug is the card's ID, and it is unique
across every stage: card names carry no serial numbers.

```bash
# Add a fresh Kanban card, then fill out its front matter. The --kind flag
# selects the archetype from be-best/archetypes/; without it Hugo
# falls back to the default template and you get a plain draft, not a card.
# For example:
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

The Go helper in `cmd/kan` wraps those commands:

```bash
# New cards always land in 01-to-do at priority 2 unless asked otherwise.
go run ./cmd/kan is my new card
# -> content/kanban/01-to-do/p2-is-my-new-card.md

go run ./cmd/kan -p 1 -s 2/features ft polish the menu
# -> content/kanban/02-in-progress/features/p1-ft-polish-the-menu.md
```

The kind may be its full name (`issues`), its prefix (`is`) or an alias (`us`,
`user stories`); the rest of the command line is the title, lowercased into a
dash-separated slug of at most 40 characters. `kan` refuses to write an ID that
any stage already uses, and rewrites Hugo's filename-derived `title:` ("P2 Is My
New Card") into a readable title. Put it on your PATH with
`go build -o ~/.local/bin/kan ./cmd/kan`.

## Scaffolding a project

`hugo new content dashboard/<name>` lays out the tracking system from the
`be-best/archetypes/dashboard/` tree: a dashboard page, a Kanban section holding
one folder per card kind, and `kanban/epics/ep-001.md` to open the work. Hugo
only scaffolds a directory archetype for a path below it, so give the command
that named sub-folder. The tree exists to start a new project: no page under
`content/` is built from it, and it stays in the theme for that reason.
