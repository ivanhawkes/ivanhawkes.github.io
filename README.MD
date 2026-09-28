# A Personal Blog

This is a static website built using HUGO as a platform for me to blog the
insignificant details of my life.

It's pretty much a training exercise and a playground for me. It's a place for
me to test out techniques with no consequences if something breaks.

The site is created using a custom HUGO theme, which provides blog
functionality.

Additionally, I am working on an implementation of a simple Kanban board and
documentation system that exists entirely as static files that are versioned and
deployed simultaneously with the website.

In theory you can watch the milestones and progress with every single commit and
step back to any point in time for a snapshot of the work. In practice, it's
only me that will use it and it's mainly because I don't want to spend the time
to task switch to some sluggish corporate nightmare several times a day to track
tasks. It lives entirely in my IDE, can be updated with any text editor, and is
static so it loads in a fraction of a second.

I am trialling a method of creating documentation which is written in markdown
and transformed by HUGO into HTML for viewing.

The documents can give live views on the progress of requirements and
functionality. They can query the Kanban cards and display their state. This
should encourage me to break every idea down into a single chunk of information
or task. I can track it via Kanban, and have it documented by specification
documents that make use of shortcodes to query and embed information.

You can see some examples:

- [project summary](/specification/personal-website/summary/)
- [ideation](/specification/personal-website/ideation/)
- [requirements specification](/specification/personal-website/requirements-specification/)

## Getting started

### Nixos with Devenv

If you are using Nixos or an OS / environment with Devenv you can get everything
you need to develop and run the project by entering a Devenv shell.

```bash
devenv shell
```

### All Other OS's

You have to install the required software on your machine. You will need the
following packages:

- Git
- Node.js 24
- PNPM
- HUGO 0.145.0
- Tailwind CSS + Typography

```bash
# Make sure all the project dependancies are installed.
pnpm i
```

## Development

For quickly building the output public folder you can run the build script:

```bash
# Makes a developer version of the site which is easier to read than the deployed version.
pnpm run test

# Makes a minified version of the site.
pnpm run build
```

You will need to run a pair of terminals, one for HUGO and the other for a
tailwind watcher.

```bash
# Watch the CSS with Tailwind.
pnpm run dev:css

# Serve up the site locally using HUGO.
pnpm run dev:hugo
```

## Style

Check the CSS is following standards by running stylelint, the CSS style
checking package.

```bash
pnpm stylelint "**/*.css"
```

# Adding a new Kanban card to the stack

```bash
# Create a dashboard if you haven't done that already. This will
# quickly scaffold up a folder structure and place a couple of
# initial tasks for you.
#
# NOTE: Hugo needs the dashboard archetype to have a named sub-folder,
# thus the extra path 'admin'. Feel free to move this about after
# it has been created.
hugo new content dashboard/admin

# Add a fresh Kanban card to the pile. You will want to move it
# into the right folder afterwards, but fill out the card first.
# For example:
#
# NOTE: Hugo figures out which archetype to use based on the stem
# of the file path, so that needs to be /kanban. You will need
# to move that folder down from the /dashboard/admin folder if
# you have just generated that.
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

# Your new dashboard should now be available at this address:
# You will need to place a menu entry into the front matter if
# you want it to show on the main menu.
http://localhost:1313/dashboard/
```
