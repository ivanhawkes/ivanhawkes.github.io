# Introduction

A static website built using HUGO as a platform for me to blog the insignificant
details of my life.

## Getting started

Make sure you have the required software install on your machine.

```bash
# Use pnpm instead of npm
npm -g install pnpm

# Now make sure all the project dependancies are installed.
pnpm i
```

## Development

Check the CSS is following standards by running StyleInt.

```bash
npx stylelint "**/*.css"
```

You may wish to format the TOML. I have installed Taplo but I can't find a way
to integrate it yet. It doesn't respond to the document format key command.

You can run it by hand at the command line.

```bash
npx taplo format
```

```bash
# Running the development environment.
hugo -D -F server
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
hugo new content kanban/acceptance/ac-001.md
hugo new content kanban/bugs/bg-001.md
hugo new content kanban/deliverables/dl-001.md
hugo new content kanban/deployment/dp-001.md
hugo new content kanban/epics/ep-001.md
hugo new content kanban/features/ft-001.md
hugo new content kanban/ideation/id-001.md
hugo new content kanban/meta/mt-001.md
hugo new content kanban/releases/rl-001.md
hugo new content kanban/requests/rq-001.md
hugo new content kanban/scaffold/sf-001.md
hugo new content kanban/specifications/sp-001.md
hugo new content kanban/testing/ts-001.md
hugo new content kanban/user-stories/us-001.md

# Your new dashboard should now be available at this address:
# You will need to place a menu entry into the front matter if
# you want it to show on the main menu.
http://localhost:1313/dashboard/
```

## TODO: Add as Kanban cards

    - Fix taxonomic layouts. They are trash.
    - Specification section is also trash
    - Light border on the next / prev and taxonomic navigation
    - Cards to become far more subtle
    - Remove debug for which page we are showing
    - Hero banner as a partial
    - Carousel
    - Publication details and social media sharing icons as partial
    - Social media partials need to use <li> for the links and
        a css class to space them out horizontally.

## Random notes to remember for later

Pick colours, find images you can splash around. Switch headers to use faded out
images with text over them for space reasons.

The content is typically what you would place within an HTML document’s body or
main element.

Unrelated but I want quick cheat sheets for a range of topics. Available in bare
format or unique taxonomy and .pdf. pdf only on build, not dev runs or reloads

Check code and css is minimised.

Integrate tsx typescript e.g. files at /assets/src/tsx/utility

Get the icon fonts working.

Hugo.toml move menu to own file. Same for any other sites specific stuff, gut it
to just the essentials

Interesting style

https://frontendmasters.com/blog/building-a-blog-in-tanstack-part-1-of-2/

Field Reference: http://etc link to resources that might make the job faster and
easier
