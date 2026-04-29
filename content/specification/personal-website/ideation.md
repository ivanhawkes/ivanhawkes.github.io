---
author: Ivan Hawkes
categories:
  - Documentation
  - Concept
  - Idea
date: '2026-04-25'
description:
  A document that briefyly describes the goals and intents of this project.
title: Ideation
type: specification
---

# Ideas for the development of my blog site

## Purpose

The purpose of this document is to state quite clearly the idea that will be
further developed into a project.

## Slugline

Describe in as single sentance the purpose of this project.

> I wish to create an elegant blog that can hold all my project ideas, plans,
> specifications, and progress.

## Progress

{{< kanban-list-short prefix=id  >}}

## Expand the Idea

Take each key idea and move it into a section with a heading. Take all the small
related ideas and move them under that heading.

Break the ideas into major and minor features. State each feature clearly and
concisely.

Make a new feature Kanban for each major feature.

## Recipes

Move the ingredients into the front matter. You can use the site to help convert
them to JSON and an online converter to get that into YAML format.

Recipes with two parts can be split into two .md files. Add a 'weight' field if
one doesn't exist to allow sorting by an arbitrary value.

## Swimlanes

Priority value sorts kanban card into swimlane buckets with highest priority at
the top.

### Keep the bucket ranges in hugo configuration files:

Names can be set by the blog owner using a set of ranges in hugo.params e.g.

```YAML
swimlanes:
  broken-in-production:
    name: Broken-in Production
    minimum: 0
    maximum: 99
    weight: 1
  critical:
    name: Critical
    minimum: 100
    maximum: 199
    weight: 2
  high-priority:
    name: High Priority
    minimum: 200
    maximum: 299
    weight: 3
  medium-priority:
    name: Medium Priority
    minimum: 300
    maximum: 399
    weight: 4
  low-priority:
    name: Low Priority
    minimum: 400
    maximum: 499
    weight: 5
  very-low-priority:
    name: Very Low Priority
    minimum: 500
    maximum: 599
    weight: 6
```

Convert priority field from number in range 0 to 1000 into list e.g. very low,
low, mid, high, very high, urgent, etc

This let's have a grid view with axes of priority vs status / completion / stage
e.g. 350 high priority lane, in-progess with x offset from completion value

Grouping requirements into features and epic i.e. major and minor milestones

Review as a stage, but not shown for my usual flow Others as well e.g waiting,
halted / blocked / on-hold, code review, acceptance or rejection from completion
Intermediate stages maybe as tags e.g. started, finished, ship it (to next
stage)

Feature: limits of how many may be in each stage, flag overflow

### Continuous Integration (CI)

    - eslint on push to github / commit to repo

Prettier on push. Make it all the same...is that possible? Seems like a pre-hook
is needed on git repo for this. Same for lint. Run build command too to ensure
most up to date deliverables e,g. Make .pdf files from the docs and put them in
/static.

Hugo taxonomies exported as json for use by js components. Rss feeds. Kanban
progress in the rss if possible. Any way to call hooks on Discord and the like?

### Kanban Card Short Names / Ids

Steps to make project. Every single deliverable, action, or step should have a
kanban card and ID.

    - Meta: mt-001 - capture initial steps as well, short list
        of things to remember to get started
    - Ideation: id-001
    - Specification: sp-001
    - Deliverables: dl-001
    - Scaffold: sc-001 - online services,repo, skeleton code, scaffolding
    - Features: ft-001
    - Acceptance: ac-001 - criteria needed for acceptance of work
    - Deployment: dp-001 - steps required to deploy the app
    - Bugs: bg-001 - link to guthub issues
    - Releases: rl-001 versioned releases, tie in with
        github releases
    - Testing: ts-001
    - Requests: rq-001 - feature requests and changes to spec
    - User Stories: us-001

Figure out this list as a tree of dependencies

Base cycle on github features and bug tracking / issues needs

Kanban should be idempotent and immutable, no reusing ids.

Are user stories dependencies? One card for each? A card per requirement and
thus each requirement must have a short identification

If this is all written into the documentation with shortcodes the whole thing
should be verifiable when in progress or completed.

Sort by priority, due date, status enum if available.

Shortcode to embed kanban card link and maybe mini kanban, with a search through
the folders to locate it e.g. {{  kanban "kb-001" }},
{{  kanban-tiny "kb-001" }}

Search works with partial name globbing to make the name shorter and easier to
type and remember.

Bonus points if you make embedded svg graphic icons of the kanban.

Each document has its own card, maybe multiple e.g. tech spec

**Categories:**

    - Deliverable
    - Document
    - Specification

**Tags:**

    - example tag

Expect some overlap with the tags and categories, though in general we should
aim to make them mutally exclusive.

One card for each major milestone.

**Milestones:**

    - ideation
    - refinement
    - gather requirements
    - write specs
    - coding
    - testing / qa
    - deployment
        - staging
        - production

Board sort order selected by buttons or tabs. Link through taxonomies. Should
there be a master list of cards somewhere and is that just generated or the docs
spec it out and flag missing ones.

Identify blockers and dependencies Ensure that your kanban board enables
immediate identification of blockers and dependencies.

Hours spent vs estimated.

**Status:**

    - test
    - deploy
    - working
    - styled
    - laid out
    - broken
    - pending
    - in-progress
    - complete

Free form text status line.

## User Stories

    - User
    - Wants
    - Because
    - End result / benefit
    - User - action - benefit

Give the user a name (androgynous) to make it more prose-like e.g.

    - Robin wants / needs / must
    - keep a list of things to do
    - So they can be more productive
    - Robin is more productive

### Functional Requirements

Functional requirements use precise “The system shall” language to eliminate
ambiguity and provide clear criteria.

### Non-Functional Requirements

Non-functional requirements define how well the system performs rather than what
it does.

Is that the best definition? Search for more.

### Swimlanes

### Support and maintenance

### Dashboard

Make small static dashboard as a single page showing project health, stat's, how
many are behind, number of issues, everything at a glance.

Create a dashboard taxonomy. Like bare pages but with a little navigation
available. Not restricted to prose width screen, can use whole monitor if needed
for wide kanban board viewing.

Eat you own dog food ASAP. Start making kanban cards to plan out stages, put in
very basic requirements specs, and deliverables, features, etc.

### Scan the files to make the docs

Use file scanning code to see which kanbans exist, and pull metadata from them.
Use the metadata in the specifications to lay out a list of actions.

e.g. Summary page - scans every kanban, prints out their name, summary,
completion, lateness into a document. Use a shortcode to place in lists of them
broken down by category e.g. features, documentation deliverables.

## Quick Wins

Find or make svg collection for priority levels

## NodeJS REST Service

Write a service that tracks the serial numbers for each category so teams can
work together without grabbing the same ID.

Solo developers can run it locally or skip using it entirely.

## More Ideas

Should have its kanbans at the top, and under that a loose assortment of ideas.

If an idea is good and actionable it becomes a kanban

You should eventually have no loose ideas left, only kanban and the ideas not
worth making, those get deleted.

Same pattern for requirements, tech spec, etc

Bugs can just go straight in as cards, but nice to track them.

Can have a /Meta folder which serves json files of usefully munged Meta data.

Only add this and its parts when it is unavoidable

Card short summary and derivatives need to handle blank prefix by setting it to
(.\*) or similar. Add file extension list to the query, md / json / yaml only
accepted, but only after testing those as pages.

Cycle

Create idea, add to end of page. Turn good ideas into cards. Action the cards.
Complete the list.

## Tools

### Idea 1

JS page that can take a list of titles and provides code windows to copy the
shell commands needed to make them. Has drop down for each type, and serial
number, doesn't save context, just quick and dirty.

### Idea 2

cheap todo app copy that takes a couple of params instead of 1.

stores the fields in an array in local storage

formats a command to run in shell to make all the new files and put in their
contents

hugo new content xxx or just the raw text

saves counters for each type of kanban card so it can auto number them

ivan wants to create a big stack of cards fast with minimum typing

sensible defaults

could be hosted as part of the site under construction

## Layouts

Default view is tabbed, full screen, overdue open

Overdue, Pending, in progress, done, priority , etc Smaller cards Filename for
Tag, save typing it twice Title at top Tag might be an on hover popup icon on
title bar Icon indicators: Late Urgent High priority

Use colours for indicators

Grid layout or swimlanes? Grid is easier

## Scrumm

Try to fit in with scrumm model, though probably a lite version.

Status: renamed to stage instead

Status: position within a stage

Each step has a check to see if it's needed and can skip to next step in cycle.

Discovery Pending Assignment In progress Done

Planning

-

Development Pending In progress Done

Sidebar - 90% off to the side, in feed Bug reports New customer requirements

Review Pending In progress Done - back to dev or on to ship

Retrospective What we done book learned

Ship Pending In progress Done

### Sprint Planning

Read cards, sun up all the time estimates, 4 hours per day is likely Max you can
do. Show cards that match the Sprint. Add Sprint as a field to each card e.g.
sprint-01.

Sum up at end of Sprint, compare estimates to actual.

### Thoughts

Requirements Design / document Development Test Deployment Retrospective

Forbes uses this categorisation:

Product backlog - we know it exists Sprint backlog - it will be done this week
In progress - getting done now Review - checked for correctness, completion,
adherence to vision, etc Done - it exists and is completed

story, todo, doing, done

## Grid View

X, - horizontal - stage Ideation Requirements Etc

y - vertical - status Pending In progress Done

## More

Defaukt kanban view is 'my view'..only stuff assigned to me. Show them all, with
emphasis on late and high priority

Use score system to rank for sorting

Late, 100 points Priority, divide by 5 and add to score Assigned to me, 300
points, let's us show others too, maybe not useful for this

I can use longer filename for the cards if I use a regex to trim them for
display. E.g. ft-001-find-the-wumpus

Easier to pick out the right one in file manager.

## Bkuesky goals

Typescript utility command available from npm which munges the emitted
taxonomies and Meta from hugo.

Solving problems which are too hard for templates alone. Runs on node.js, can be
package.json dependency.

Charts that I generate using svg e.g. candlestick for progress...could be an npm
module based on some charting library. Just feed my taxonomies into it and save
the output as usable media.

Move a bunch of stuff out of my todoist list and into projects with this as a
way to manage their creation.

Does the theme have to be in the themes folder? Can it be named and served from
a default location?

Npx command to scaffold / create new empty project with this theme installed.
Another that can update it inside hugo...not in the node_modules, because there
is no way hugo can access it like that.

That said, I should make this as a theme that can be brought in as a github
submodule.

Json output files need bare base of that sets the content-type header attribute

Google analytics?

Hugo config merge code might be perfect for my single source of truth merge
code - types of merge: none, shallow, deep.

Js utility that uses real file path from hugo as a stem, and performs system
calls on it from kanban pages to add interactivity like:

Mark a card complete, move to next stage, using 'git mv src dst' To preserve git
history. Dangerous.

Simple edits e.g. priority setting via a drop down menu.

Might be able to run small node.js service with router and http server. It runs
in the background, you put the addr into config file and the js makes calls on
it for dangerous shell services like 'git mv' and file edits on the front
matter.
