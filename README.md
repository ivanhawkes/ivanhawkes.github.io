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

- [project summary](/specification/personal-website/summary/)
- [ideation](/specification/personal-website/ideation/)
- [requirements specification](/specification/personal-website/requirements-specification/)

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
pnpm run serve
```

## Style

Check the CSS against stylelint's standards:

```bash
pnpm stylelint "**/*.css"
```

## Adding a new Kanban card to the stack

```bash
# Create a dashboard if you haven't done that already. This scaffolds a
# folder structure and places one initial epic card.
#
# NOTE: Hugo needs the dashboard archetype to have a named sub-folder,
# hence the extra path 'admin'. Feel free to move it afterwards.
hugo new content dashboard/admin

# WARNING: the generated _index.md contains a duplicate `kind:` key that
# breaks the build. Delete the stray `kind: ""` line before building.

# Add a fresh Kanban card, then fill out its front matter. The --kind flag
# selects the archetype from themes/be-best/archetypes/; without it Hugo
# falls back to the default template and you get a plain draft, not a card.
# For example:
hugo new content kanban/acceptance/ac-001-test.md --kind acceptance
hugo new content kanban/bugs/bg-001-test.md --kind bugs
hugo new content kanban/deliverables/dl-001-test.md --kind deliverables
hugo new content kanban/deployment/dl-001-test.md --kind deployment
hugo new content kanban/epics/ep-001-test.md --kind epics
hugo new content kanban/features/ft-001-test.md --kind features
hugo new content kanban/ideation/id-001-test.md --kind ideation
hugo new content kanban/meta/mt-001-test.md --kind meta
hugo new content kanban/releases/rl-001-test.md --kind releases
hugo new content kanban/requests/rq-001-test.md --kind requests
hugo new content kanban/scaffold/sf-001-test.md --kind scaffold
hugo new content kanban/specifications/sp-001-test.md --kind specifications
hugo new content kanban/testing/ts-001-test.md --kind testing
hugo new content kanban/user-stories/us-001-test.md --kind user-stories

# Your new dashboard is served at http://localhost:1313/dashboard/admin/.
# The archetype already adds a `menus: main:` entry, so it shows on the
# main menu without extra front matter.
```

A Go helper in `cmd/kan` wraps these commands with auto-incremented serial
numbers: `go run ./cmd/kan <kind-or-prefix> <title words…>` (e.g.
`go run ./cmd/kan rq my new card`).
