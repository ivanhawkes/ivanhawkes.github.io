# Project Context: Ivan Hawkes Blog

This repository is a personal static blog built with Hugo and deployed to GitHub
Pages. Everything is versioned plain files - no backend, no database. It doubles
as a playground: a static Kanban board and a markdown documentation system live
in the content tree, queryable via shortcodes.

## Layout

- `content/` - all markdown content. The sections are `post`, `kanban`,
  `specification` and `about`. `recipe`, `project` and `profile` are front
  matter `type:` values with layouts of their own, not sections: recipes live
  under `post/recipe/`, projects and profiles under `about/`.
    - `post/<section>/` - blog articles (cryengine, garden, general, linux,
      programming).
    - `post/recipe/<cuisine>/` - recipes; each recipe directory has `index.md`
      plus the `ingredients.yaml` and `method.yaml` sidecars, and the optional
      `notes.md`.
    - `about/project/<slug>/` - project pages (`type: project`).
    - `about/profile/<slug>/` - profile pages (`type: profile`).
    - `kanban/<stage>/` - Kanban cards. The three stages are `01-to-do`,
      `02-in-progress` and `03-done`. `02-in-progress` splits work in progress
      into topic sub-folders, and `features` is the only one on disk: the set
      grows and shrinks with the cards, so name the folders that exist, never a
      fixed list. Epics live in `00-epics`, which is **not** a stage: an epic
      stays open until the cards it bundles clear every stage, so stage views
      skip that folder. A card's filename carries its identity:
      `p<priority>-<kind-prefix>-<slug>.md`, e.g. `p2-us-html-check.md`, with
      priority `0` (most urgent) to `9`; this project uses `0`-`3` so far. The
      two-letter kind prefix names the kind (`is` = issues, `ep` = epics, `us` =
      user-stories, ...) and must match the `--kind` archetype used to create
      the card. Stage is the card's status: there is **no** `status` front
      matter field, so moving the file between stage folders is the status
      change. The board view is the `kanban` section rendered by
      `be-best/layouts/kanban/section.html`. The grid view page
      `kanban/grid/index.md` (`layout: grid`, laid out by
      `be-best/layouts/_partials/kanban/grid.html`) puts every card in a lane of
      one stage folder, and labels a topic sub-folder lane with its parent stage
      number, e.g. `02-features`.
    - `specification/<document>/` - specification documents, one directory per
      document: `decisions`, `functional`, `ideation`, `requirements`,
      `summary`, `technical` and `tests`, each holding a single `index.md`.
      Documents can embed kanban cards with the `kanban-list-short` shortcode,
      which matches cards by the `p[0-9]-<prefix>-.*` filename pattern.
      Documents render "No documentation was found." for kinds with no cards.
      Most kinds have no cards on purpose: `summary/index.md` keeps one table
      per kind as a worked example of the shortcode, so leave those empty tables
      empty.
- `be-best/` - the site theme, a plain directory tracked in this repository.
  Hugo selects it via `theme: be-best` / `themesDir: '.'` in
  `config/_default/hugo.yaml`. Theme edits are ordinary files: commit and push
  them with the rest of the change, in the parent repo, on the current branch.
- `config/_default/` - Hugo site config (`hugo.yaml`) and params.
- `assets/` - generated CSS (`main.css`) compiled by Tailwind from the theme.
  Build output; gitignored.
- `data/` - YAML data files (`about.yaml`, `profile.yaml`).
- `static/` - static assets.
- `public/`, `resources/`, `.hugo_build.lock` - build output. Never commit.

## Commands

```bash
pnpm run test         # CSS, lint, Hugo, HTML, heading, placeholder, card, method, JSON-LD and prettier checks; validate changes here
pnpm run lint         # eslint over the repo's JS/TS: scripts, theme assets, configs
pnpm run test:headings # count h1 elements over public/; fail on pages without exactly one
pnpm run test:placeholders # pair imgB classes with their rules over public/; fail on an unmatched pair
pnpm run test:kanban  # validate card front matter against the schema in assets/
pnpm run test:methods # validate method.yaml against the schema in assets/, and its rendering over public/
pnpm run test:jsonld  # validate each recipe page's Recipe JSON-LD against assets/ and the sidecars it states
pnpm run test:prettier # assert layouts ignored, one plugin-free prettier config, editor pins set
pnpm run test:checks  # the eight checks over public/, no build: lint, html, headings, placeholders, kanban, methods, jsonld, prettier
pnpm run test:ci      # test:checks + go test ./cmd/kan; the publish gate
pnpm run build        # CSS + minified production build
pnpm run css-watch    # Tailwind watch mode (run alongside hugo)
pnpm run server        # compile CSS once, then hugo server -D -F
pnpm stylelint "**/*.css"
hugo new content kanban/01-to-do/p2-is-slug.md --kind issues
go run ./cmd/kan is my card title
```

`pnpm run test:ci` is the publish gate: `.github/workflows/hugo.yml` runs it
over the minified build the workflow has already performed, and a check that
fails stops the job before the Pages artifact is uploaded. The chain's own
`test:css` and `test:hugo` steps are dropped there because the workflow builds
the site once, in production form.

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
- Archetypes stamp `date:` with `$.Site.Params.dateFormatStandard`, the
  date-only layout. `$.Site.Params.dateFormat` carries a time of day, and
  `time.Now` in an archetype runs a moment after the build captures its clock,
  so the page is future-dated and Hugo does not write it: a scaffolded page
  stays invisible until the clock passes its timestamp. `cmd/kan` normalizes the
  date the same way.
- `be-best/archetypes/dashboard/` is the project scaffold, not a card kind.
  `hugo new content dashboard/<name>` writes a dashboard page, a Kanban section
  holding one folder per card kind, and the opening epic. Nothing under
  `content/` is built from it, so a reference search reads it as dead weight: it
  is not, and it must never be deleted.
- Recipe front matter: `type: recipe`, `cuisine`, `categories`, `tags`, `date`,
  `author`, `portions`, `prep-time`, `cook-time` (ISO 8601 duration, e.g.
  `PT5M`). The `ingredients.yaml` sidecar holds an `ingredient-list`; the
  `method.yaml` sidecar holds a `method-list`, one `dish` per component, each
  with a `method` list of step strings. A step is markdown: a link and bold
  labels survive into the page. The optional `notes.md` sidecar is markdown
  prose, rendered after the method by
  `be-best/layouts/_partials/recipes/notes.html`. Hugo reads a markdown file in
  a leaf bundle as a resource of its page, so `notes.md` builds no page of its
  own.
- Every recipe page carries Schema.org `Recipe` JSON-LD, built by
  `be-best/layouts/_partials/recipes/jsonld.html` from the front matter and the
  two sidecars, and from nothing else: a field the content has no value for is
  left out, never guessed, so `image` appears only on a page whose bundle has a
  `featured.webp` of its own. Steps are `HowToStep` objects, with the dish as
  `name` where the recipe has more than one dish. The text of a step, an
  ingredient or the summary a description falls back to comes from
  `recipes/plain-text.html`, which renders the markdown and reduces it to the
  words the page shows. That partial returns `safe.HTML`, and the block is
  written `jsonify | safe.JS`: without the first, writing a partial's output
  re-escapes the entities the reduction has decoded; without the second,
  `html/template` quotes the JSON as a JavaScript string in a script element.
  `assets/recipe-jsonld.yaml` defines the block and `pnpm run test:jsonld` reads
  it back against the bundle.
- Kanban cards carry a `params` block with: `due`, `completionDate`,
  `dependencies`, `references`. Unused entries are `null`, not empty.
- Card descriptions are short (50 characters or less) with a `<!--more-->` body
  after.
- Images (webp, jpeg, png, svg, etc.) are managed with **Git LFS**; track new
  formats with `git lfs track`.
- Prettier runs on staged files via husky/lint-staged, and on every save in
  VSCodium except CSS (`editor.formatOnSave` is off for `[css]`; the extension
  is pinned to the project copy by `prettier.prettierPath`); YAML uses 2-space
  indentation. It is the reason a file stops matching a read: re-read
  immediately before editing. At `printWidth: 80` (`100` for CSS) and
  `tabWidth: 4` it wraps a CSS declaration past 96 columns at indent 1 and
  reflows markdown prose at 80, so long hand-written lines do not survive a
  commit.
- `assets/css/main.css` is generated by the Tailwind CLI on every `css`,
  `server`, `test:css` and `build:css` run. Edit `be-best/assets/css/` instead.
- Layout HTML under `be-best/layouts/` is in `.prettierignore` on purpose, and
  must stay there. Every Go-template formatter measured on 2026-10-26 rewrites
  the templates destructively, over the tree of that date: 69 layout files and
  329 tracked files, against 71 and 518 today. `prettier-plugin-go-template`
  0.0.15, its `prettier-plugin-go-template-guard` wrapper, the `@htnabe` fork
  (published 2026-10-23), `djlint` and `gotmplfmt` each change the rendered HTML
  of nearly every page, and the Prettier plugins fail outright on 4 of those 69
  files. `.editorconfig` keeps editors from trimming the load bearing trailing
  space after `-}}` in layouts and the hard-break pair at the end of a markdown
  line. `pnpm run test:prettier` guards the whole arrangement: the root
  `.prettierignore`, the single Prettier config in `package.json` (the theme has
  no manifest, ignore file or config of its own, and the root config wires in no
  plugins - `prettier-plugin-go-template`, its `*.html` parser override and
  `prettier-plugin-tailwindcss` are measured dead: 0 of that tree's 329 files
  change without them), and the editor pins in `.vscode/settings.json`.
- ESLint rules live in `be-best/eslint.config.mjs`, covering the JS, TS, CSS,
  JSON and Markdown the theme ships. The root `eslint.config.mjs` adds only the
  ignores for generated output and Node globals for `scripts/`. `pnpm run lint`
  covers JS and TS, and runs in the test chain as `test:lint`. `.mjs` sits
  outside the lint-staged glob, so format a touched config by hand with
  `npx prettier --write`.

## Workflow

1. Track work as a kanban card in `content/kanban/01-to-do/`, named
   `p<priority>-<kind>-<slug>.md` and created with `--kind <kind>`.
2. Document requirements under `specification/`, embedding cards with
   shortcodes.
3. Implement, validate with `pnpm run test`, then move the card's file to the
   next stage folder, setting `params.completionDate` on completion.
4. Commit small, focused changes, theme files included - `be-best/` is part of
   this repository. CI deploys only from the `publish` branch.
