---
author: Ivan Hawkes
date: '2026-04-25'
description: Requirements Specification
title: Requirements Specification
type: specification
---

The purpose of a requirements specification is to define what the solution must
achieve by documenting the business needs, objectives, stakeholder expectations,
and required capabilities. It establishes the scope and boundaries of the
solution, providing a baseline against which the functional, technical, system,
design, and test specifications can be developed and validated. It serves as a
common reference for stakeholders and delivery teams, ensuring the solution
addresses the intended needs and provides a basis for verifying that the agreed
requirements have been met.

## Scope

The solution is a personal website published as static files. It presents
articles, recipes, and the project's own documentation, and it tracks the work
on the site inside the same repository as the site.

In scope:

- Authoring and presentation of content in a single Hugo content tree: posts in
  sections, recipes with structured ingredient data, dashboard scratch pages,
  and specification documents.
- A file based Kanban system that records requirements, epics, defects and other
  work as markdown cards, and renders them as tables inside the documentation.
- The `be-best` theme, its Tailwind CSS pipeline, and the Markdown render hooks
  and shortcodes that the content relies upon.
- Building, validating and publishing the site with GitHub Actions.

Out of scope:

- Server-side code, databases and hosted services of any kind. The site is
  static.
- Commercial hosting, advertising, and third party analytics. Usage monitoring
  is an open idea recorded in the `website-redesign` epic, not a requirement.
- Multi-user authoring, authentication, and comment systems.

## Stakeholders

The site has one stakeholder, the author, who is also the requirements owner,
developer and reviewer. Every requirement is raised, prioritised and accepted by
that single stakeholder, so requirement cards are written for him as the reader
as much as for any future contributor. Priority is recorded in the card filename
as `p0` to `p3`, where `p0` is the most urgent.

## Functional Requirements

Each functional requirement is held as one Kanban card of kind `user-stories`,
whose filename prefix is `us-`. The card holds the requirement statement, its
acceptance criteria, and its status, so a requirement and the evidence that it
has been met are never separated. Cards sit in a stage folder (`01-to-do`,
`02-in-progress`, `03-done`); moving a card between stage folders is the status
change.

The tables below are generated from the cards. The `kanban-list-short` shortcode
selects every card whose filename matches `p[0-9]-<prefix>-.*` across all
stages, and lists its id, summary and due date, so the tables stay current
whenever a card is added, renamed, or moved.

### Requirements

{{< kanban-list-short prefix=us >}}

### Epics

The requirements belong to the epics below, which describe the bodies of work
they were raised from.

{{< kanban-list-short prefix=ep >}}

### Issues

Reported defects against the published site are recorded as cards of kind
`issues`, prefix `is-`.

{{< kanban-list-short prefix=is >}}

## Non-Functional Requirements

Defines quality expectations such as performance, availability, scalability,
usability, accessibility, and maintainability. Each expectation below is stated
with the check that demonstrates it.

| Attribute                  | Expectation                                                                                                                                                                             | Verification                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Markup validity            | Every generated page conforms to the HTML standard, including required attributes and the absence of nested landmarks.                                                                  | `pnpm run test:html` runs `html-validate` with the `html-validate:standard` preset over `public/**/*.html` and reports no problems.                  |
| Publishing integrity       | Markup that fails validation is never published.                                                                                                                                        | The publish workflow runs `pnpm run test:html` after the build and stops before the Pages artifact is uploaded.                                      |
| Performance                | A first visit transfers about 82 KB of uncompressed markup and style: the home page is 29 KB plus the 53 KB shared stylesheet, which is under 15 KB gzipped. The only script is 2.1 KB. | Measurements taken from the minified production build in October 2026.                                                                               |
| Build time                 | The complete site builds in under one second on a development machine: about 0.3 s for the content the site holds today.                                                                | Hugo prints the page count and the build total at the end of every build.                                                                            |
| Portability                | The site is static output only, with no server code, database, or runtime service, so any static host can serve `public/`.                                                              | `baseURL` is set in `config/_default/hugo.yaml`; the current deployment target is GitHub Pages.                                                      |
| Reproducibility            | A clean checkout builds with a pinned toolchain: Hugo 0.166.0 extended, Node 24, Go 1.26, and pnpm.                                                                                     | `.github/workflows/hugo.yml` pins the toolchain and keys its Hugo cache on the Hugo version, the theme commit, and a hash of the site configuration. |
| Data integrity             | Recipe portions and timings, ingredient lists, and Kanban card metadata are structured data, never prose, so every rendered value is derived from a file that can be checked.           | Recipe front matter and the `ingredients.yaml` sidecar in each recipe bundle; card front matter described in the technical specification.            |
| Responsive imagery         | Images are processed at build time into widths from 320 to 1920 pixels, with generated placeholders, and are held in Git LFS.                                                           | The `img` shortcode in `be-best/layouts/_shortcodes/img.html`; the LFS rules in `.gitattributes`.                                                    |
| Discoverability            | A sitemap and RSS feeds are published for the home page, sections, taxonomies and terms; feeds carry at most 50 items and listings paginate at 12 entries.                              | `sitemap`, `outputs`, `services.rss.limit` and `pagination.pagerSize` in `config/_default/hugo.yaml`.                                                |
| Maintainability            | Presentation is isolated in one theme, every content type is scaffolded from an archetype, and the documentation and task tracking of the site live in the repository.                  | The `be-best` submodule, `be-best/archetypes/`, `content/specification/`, and `content/kanban/`.                                                     |
| Quality gates              | Checks run before work is committed and before the site is published.                                                                                                                   | `pnpm run test` (CSS, build, HTML validation), `pnpm stylelint`, `go test ./cmd/kan`, and Prettier on staged files through husky and lint-staged.    |
| Accessibility              | Each page exposes one `main` landmark with a `header`, a `nav` and a `footer`, and elements that need an accessible name are checked by the validator.                                  | The layout tree in `be-best/layouts/` and the `element-required-attributes` rule of the validator preset.                                            |
| History and recoverability | All text is under version control, and binary media is stored in Git LFS so the repository stays small.                                                                                 | `.gitattributes` and the LFS history; the theme is a submodule with its own history.                                                                 |
| Availability               | Only the `posts` branch publishes, so work in progress cannot take the site down.                                                                                                       | The branch filter and deployment job in `.github/workflows/hugo.yml`.                                                                                |

Outstanding work against these expectations is tracked as cards, not recorded
here: the menu controls and the light, dark and system colour scheme toggle are
the `hamburger-menu` and `toggle-light-dark` requirements, and codeblock
presentation is the `polish-codeblock-copy` requirement.

## Verification

The site is accepted against this specification as follows:

- Each functional requirement is verified by the acceptance criteria in its own
  card; a requirement is met when its card reaches the `03-done` stage with a
  `completionDate`.
- Each non-functional expectation above is verified by the command or
  configuration listed with it. `pnpm run test` runs the CSS build, the site
  build and the HTML validation locally, in the order the publish workflow uses.
- Deviations found during a check are raised as a card of kind `issues` rather
  than being resolved silently.
