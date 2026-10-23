# Project Context: Ivan Hawkes Blog

This repository is a personal static blog built with Hugo and deployed to GitHub
Pages. Everything is versioned plain files - no backend, no database. It doubles
as a playground: a static Kanban board and a markdown documentation system live
in the content tree, queryable via shortcodes.

## Layout

- `content/` - all markdown content. Hugo content types: `post`, `recipe`,
  `kanban`, `specification`, `about`, `project`, `profile`, `dashboard`, `bare`.
    - `post/<section>/` - blog articles (cryengine, garden, general, linux,
      programming).
    - `post/recipe/<cuisine>/` - recipes; each recipe directory has `index.md`
      plus an `ingredients.yaml` sidecar.
    - `kanban/<stage>/` - Kanban cards. The three stages are `01-to-do`,
      `02-in-progress` (with topic sub-folders: design, features, ui) and
      `03-done`. A card's filename carries its identity:
      `p<priority>-<kind-prefix>-<slug>.md`, e.g. `p2-us-html-check.md`. The
      two-letter kind prefix names the kind (`is` = issues, `ep` = epics, `us` =
      user-stories, ...) and must match the `--kind` archetype used to create
      the card. Stage is the card's status: there is **no** `status` front
      matter field, so moving the file between stage folders is the status
      change. The board view is the `kanban` section rendered by
      `be-best/layouts/kanban/section.html`.
    - `specification/personal-website/` - specification documents; can embed
      kanban cards with the `kanban-list-short` shortcode, which matches cards
      by the `p[0-9]-<prefix>-.*` filename pattern. Documents render "No
      documentation was found." for kinds with no cards. Most kinds have no
      cards on purpose: `summary.md` keeps one table per kind as a worked
      example of the shortcode, so leave those empty tables empty.
    - `dashboard/` - development scratch pages (`raw/all-html-elements.html` is
      the CSS test page, `layout: raw`).
- `be-best/` - the site theme. This is a **git submodule** (branch `features`).
  Commit changes inside the submodule and push to
  `git@github.com:ivanhawkes/be-best.git` _before_ committing the parent repo's
  submodule pointer.
- `config/_default/` - Hugo site config (`hugo.yaml`) and params.
- `assets/` - generated CSS (`main.css`) compiled by Tailwind from the theme.
  Build output; gitignored.
- `data/` - YAML data files (`about.yaml`, `profile.yaml`).
- `static/` - static assets.
- `public/`, `resources/`, `.hugo_build.lock` - build output. Never commit.

## Commands

```bash
pnpm run test         # CSS, Hugo, HTML and card schema checks; use to validate changes
pnpm run test:kanban  # validate card front matter against the schema in assets/
pnpm run build        # CSS + minified production build
pnpm run css-watch    # Tailwind watch mode (run alongside hugo)
pnpm run serve        # compile CSS once, then hugo server -D -F
pnpm stylelint "**/*.css"
hugo new content kanban/01-to-do/p2-is-slug.md --kind issues
go run ./cmd/kan is my card title
```

`cmd/kan` is a Go helper that scaffolds cards:
`go run ./cmd/kan [-p <0-9>] [-s <stage>] <kind> <title words...>`, where the
kind is its name (`issues`), prefix (`is`) or an alias (`user stories`). New
cards land in `01-to-do` at priority `2` unless `-stage` / `-priority` say
otherwise, giving `content/kanban/<stage>/p<priority>-<prefix>-<slug>.md`. The
prefix plus slug is the card's ID, unique across every stage, so `kan` scans all
stages and refuses collisions; card names carry no serial numbers. It also
rewrites Hugo's filename-derived `title:` into a readable title. Card kinds,
prefixes, file naming and the `kan` command line contract are specified in
`content/specification/technical/index.md`; `.pi/skills/kanban-card/SKILL.md`
covers only how the program is written.

## Conventions

- Front matter is YAML (`MetaDataFormat: yaml`).
- New content is created with Hugo archetypes. `--kind <name>` selects
  `be-best/archetypes/<name>.md`; Hugo does not derive the folder from the kind,
  so give the full target path. Omit `--kind` and you get the default draft, not
  a card. Archetypes title-case the filename into `title`, so rewrite it by
  hand.
- Recipe front matter: `type: recipe`, `cuisine`, `categories`, `tags`, `date`,
  `author`, `portions`, `prep-time`, `cook-time` (ISO 8601 duration, e.g.
  `PT5M`). The `ingredients.yaml` sidecar holds an `ingredient-list`.
- Kanban cards carry a `params` block with: `due`, `completionDate`,
  `dependencies`, `references`. Unused entries are `null`, not empty.
- Card descriptions are short (50 characters or less) with a `<!--more-->` body
  after.
- Images (webp, jpeg, png, svg, etc.) are managed with **Git LFS**; track new
  formats with `git lfs track`.
- Prettier runs on staged files via husky/lint-staged; YAML uses 2-space
  indentation.

## Workflow

1. Track work as a kanban card in `content/kanban/01-to-do/`, named
   `p<priority>-<kind>-<slug>.md` and created with `--kind <kind>`.
2. Document requirements under `specification/`, embedding cards with
   shortcodes.
3. Implement, validate with `pnpm run test`, then move the card's file to the
   next stage folder, setting `params.completionDate` on completion.
4. Commit small, focused changes. CI deploys only from the `posts` branch; the
   theme is committed on its own repo's `features` branch.

## Agent skills

### Issue tracker

Issues and specs are tracked as GitHub Issues in
`ivanhawkes/ivanhawkes.github.io`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels; each label string is identical to its role name.
See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. Neither `GLOSSARY.md` nor `docs/adr/` exists yet; the skills
create them lazily when terms or decisions actually get resolved, so proceed
without them and do not flag their absence. See `docs/agents/domain.md`.
