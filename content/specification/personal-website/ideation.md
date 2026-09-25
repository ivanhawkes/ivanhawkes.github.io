---
author: Ivan Hawkes
categories:
  - Documentation
  - Concept
  - Idea
date: '2026-04-25'
description:
  A document that briefly describes the goals and intents of this project.
title: Ideation
type: specification
---

# Ideas for the development of my blog site

## Purpose

The purpose of this document is to state clearly the idea that will be further
developed into a project. It captures the *why* and *what*; implementation
detail lives in the technical specification.

## Logline

> I wish to create an elegant blog that can hold all my project ideas, plans,
> specifications, and progress.

## Progress

{{< kanban-list-short prefix=id >}}

## Terminology

A single model is used throughout, so terms never contradict:

- **Stage** — the phase a card is in (see *Stages* below).
- **Status** — the position *within* a stage: `pending`, `in-progress`, `done`.
- **Priority** — an integer `0–599` mapped to a swimlane bucket.

Intermediate sub-steps (e.g. started, finished, ship it) are expressed as **tags**,
not as stages.

## Expand the Idea

Key ideas are grouped into **major features**, each owning a set of **minor
features**. Every major feature gets its own Kanban board. Each feature below is
stated clearly and concisely; anything implementation-heavy is pointed to the
technical specification.

### Major feature: Kanban model

The data model that every board, view, and tool consumes.

- **Card IDs** — every deliverable, action, and step has a card and a unique,
  immutable, idempotent ID. No ID is ever reused.
- **Stages** — the canonical pipeline a card moves through.
- **Priority → swimlanes** — a numeric priority maps a card into a priority
  bucket; see *Swimlanes*.
- **Milestones** — one card per major milestone, plus cards per requirement so
  each requirement has a short identifier.

#### Card ID scheme

| Prefix | Type            | Example          | Description                              |
|--------|-----------------|------------------|------------------------------------------|
| `mt-`  | Meta            | `mt-001`         | Initial steps, things to remember        |
| `id-`  | Ideation        | `id-001`         | Ideas and concept capture                |
| `sp-`  | Specification   | `sp-001`         | Specs (requirements, tech, test, design) |
| `dl-`  | Deliverables    | `dl-001`         | Produced deliverables                    |
| `sc-`  | Scaffold        | `sc-001`         | Services, repo, skeleton, scaffolding    |
| `ft-`  | Features        | `ft-001`         | Major and minor features                 |
| `ac-`  | Acceptance      | `ac-001`         | Criteria required for acceptance         |
| `dp-`  | Deployment      | `dp-001`         | Steps required to deploy the app         |
| `bg-`  | Bugs            | `bg-001`         | Linked to GitHub issues                  |
| `rl-`  | Releases        | `rl-001`         | Versioned releases, tied to GitHub       |
| `ts-`  | Testing         | `ts-001`         | Test and QA work                         |
| `rq-`  | Requests        | `rq-001`         | Feature requests and spec changes        |
| `us-`  | User stories    | `us-001`         | Requirements expressed as user stories   |

IDs form a **dependency tree** based on GitHub's feature/issue tracking model.
Each document has its own card (a tech spec may have several). Filenames may be
longer than the ID — e.g. `ft-001-find-the-wumpus` — with a regex trimming them
for display, which also makes them easier to pick out in a file manager.

#### Stages

The standard pipeline (a lightweight Scrum):

- ideation
- requirements / requirements gathering
- design
- develop
- test
- review
- deploy
- done

`review` is a stage but not always shown in the usual flow. Extra states such as
*waiting*, *halted / blocked / on-hold*, *code review*, and *accept/reject from
completion* are supported as needed. Optional **limits** can be set per stage with
overflow flagged.

### Major feature: Board views

How cards are presented and prioritized.

- **Grid view** — X axis = stage (ideation, requirements, …); Y axis = status
  (pending, in-progress, done). A card's X offset reflects its completion value,
  e.g. a high-priority, in-progress card sits in its priority lane offset by how
  far along it is. Grid is chosen over swimlanes because it is easier to build.
- **Swimlane view** — cards bucketed by priority, highest priority at the top.
- **"My view" (default)** — default to cards assigned to me, showing all with
  emphasis on late and high-priority items.
- **Sort score** — a numeric score ranks cards for sorting:
  - late: +100
  - priority: priority ÷ 5
  - assigned to me: +300 (lets others' cards show too, if useful)
- **Layout** — tabbed, full-screen, overdue tab open by default. Compact cards with
  the filename used as the tag (so it isn't typed twice), title on top, and the
  tag as a hover popup icon. Colour-coded indicators for *late*, *urgent*, and
  *high priority*.
- **Dashboard** — a single static page for project health at a glance: stats,
  how many are behind, open issue counts, etc. It gets its own taxonomy, is not
  restricted to prose width, and can use the full monitor for wide board views.

### Major feature: Automation

Turning the cards into living, verifiable documentation.

- **Kanban shortcodes** — embed a card link or a mini card, located by searching
  folders, e.g. `{{</* kanban "kb-001" */>}}`, `{{</* kanban-tiny "kb-001" */>}}`.
  Search supports partial-name globbing so IDs are short to type. Bonus: embedded
  SVG icon per card.
- **Scan-to-docs** — file-scanning code discovers which Kanbans exist, pulls their
  metadata, and lays out a list of actions from it. Example: a **Summary page**
  that scans every card and prints name, summary, completion, and lateness,
  grouped by category (features, documentation, deliverables). If written with
  shortcodes, the whole thing is verifiable in-progress or on completion.
- **Taxonomies as JSON** — Hugo taxonomies exported as JSON for use by JS
  components; RSS feeds (with Kanban progress in the feed if possible); hooks to
  Discord and similar services. See the technical specification.
- **Continuous integration** — eslint and Prettier on push/commit (via git hooks
  so formatting is uniform), plus a build step that regenerates deliverables such
  as `.pdf` docs into `/static`. See the technical specification.
- **Meta folder** — a `/Meta` folder serving usefully munged metadata as JSON.
  Add only when unavoidable.

### Major feature: Tooling

Helpers that are too hard for templates alone.

- **NodeJS REST service** — tracks serial numbers per category so teams don't
  collide on IDs. Solo developers can run it locally or skip it entirely.
- **npm utility (TypeScript)** — munges the emitted taxonomies and metadata from
  Hugo; can be a `package.json` dependency. Could also emit SVG charts (e.g. a
  candlestick for progress) from a charting library by feeding it the
  taxonomies.
- **Scaffolding CLI** — an `npx` command to create a new empty project with this
  theme installed, plus one to update it inside Hugo (not from `node_modules`,
  which Hugo can't read). Ship the theme as a GitHub submodule.
- **In-browser interactivity** — a JS utility using Hugo's real file path as a
  stem to run system calls from Kanban pages: mark a card complete, move it to
  the next stage (`git mv src dst` to preserve history — dangerous), or simple
  edits such as setting priority via a dropdown. Dangerous shell actions go
  through a small background Node service (router + HTTP server) whose address is
  in the config. See the technical specification.
- **Card-generator tools** —
  - *Idea 1*: a JS page that takes a list of titles and produces copy-paste shell
    commands to create them, with a dropdown per type and serial number. No saved
    context — quick and dirty.
  - *Idea 2*: a lightweight todo app that takes a couple of parameters, stores
    fields in an array in localStorage, auto-numbers each card type, saves
    sensible defaults, and formats the shell command (or `hugo new content`) to
    batch-create cards with minimum typing. Goal: create a big stack of cards
    fast. Could be hosted as part of the site under construction.

### Major feature: Docs lifecycle

How the project's own content is organised and managed.

- **User stories** — structured as *User / Wants / Because / End result*, using an
  androgynous name (e.g. *Robin*) so they read like prose: "Robin wants to keep a
  list of things to do so they can be more productive."
- **Requirements language** — functional requirements use precise "The system
  shall" language to remove ambiguity; non-functional requirements define how well
  the system performs rather than what it does.
- **Categories / tags / milestones** — categories such as *Deliverable*,
  *Document*, *Specification*; tags for specifics. Overlap is expected, but aim to
  keep them mutually exclusive. One card per major milestone:
  - ideation
  - refinement
  - gather requirements
  - write specs
  - coding
  - testing / QA
  - deployment
    - staging
    - production
- **Sprint planning** — cards carry a `sprint-01` field. At planning, sum time
  estimates against a ~4 hours/day max; at the end, compare estimates to actual.

## Swimlanes

Priority (an integer `0–599`) sorts a card into a swimlane bucket with the highest
priority at the top. Bucket ranges live in Hugo config so the blog owner can name
and tune them:

```yaml
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

The priority number is also converted into a readable label (very low, low, mid,
high, very high, urgent, …). A standard config ships in the themes folder and can
be overridden in the local project (see *Open Questions*).

## Quick wins

- Find or make an SVG collection for priority levels.

## Open Questions

- Grid-view axis labels and types are stored in the data folder — should a standard
  set ship in the themes folder with local override?
- Does the theme have to live in the `themes` folder, or can it be named and
  served from a default location?
- Should there be a master list of cards, generated or specified in the docs with
  missing ones flagged?
- How to call webhooks (Discord, etc.) from Hugo builds?
- Is Google Analytics worth adding?
- Confirm the best definitions for functional vs. non-functional requirements.
- Should a card have a `blockers`/`dependencies` field so the board surfaces
  them immediately?
- How to track hours spent vs. estimated per card?