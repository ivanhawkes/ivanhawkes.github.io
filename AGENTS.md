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
    - `kanban/<kind>/` - Kanban cards. One folder per kind: acceptance, bugs,
      deliverables, deployment, epics, features, ideation, meta, releases,
      requests, scaffold, specifications, testing, user-stories. A card's folder
      must match the kind it was created with.
    - `specification/personal-website/` - specification documents; can embed
      kanban cards with the `kanban-list-short` shortcode.
    - `dashboard/` - the kanban board view (bare layout).
- `themes/be-best/` - the site theme. This is a **git submodule** (branch
  `features`). Commit changes inside the submodule and push to
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
pnpm run test         # non-minified build; use to validate changes
pnpm run build        # minified production build
pnpm run dev:css      # Tailwind watch mode (run alongside hugo)
pnpm run dev:hugo     # hugo server
pnpm stylelint "**/*.css"
hugo new content kanban/requests/rq-XXX-slug.md --kind requests
```

## Conventions

- Front matter is YAML (`MetaDataFormat: yaml`).
- New content is created with Hugo archetypes; the archetype and `--kind`
  determine the folder.
- Recipe front matter: `type: recipe`, `cuisine`, `categories`, `tags`, `date`,
  `author`, `portions`, `prep-time`, `cook-time` (ISO 8601 duration, e.g.
  `PT5M`). The `ingredients.yaml` sidecar holds an `ingredient-list`.
- Kanban cards carry a `params` block with: `sprint`, `stage`, `status`,
  `completed`, `due`, `percent`, `estimatedtime`, `actualtime`, `priority`,
  `dependencies`, `references`. The card template renders `dependencies` - keep
  that spelling.
- Card descriptions are short (50 characters or less) with a `<!--more-->` body
  after.
- Images (webp, jpeg, png, svg, etc.) are managed with **Git LFS**; track new
  formats with `git lfs track`.
- Prettier runs on staged files via husky/lint-staged; YAML uses 2-space
  indentation.

## Workflow

1. Track work as a kanban card under `kanban/<kind>/`.
2. Document requirements under `specification/`, embedding cards with
   shortcodes.
3. Implement, validate with `pnpm run test`, then update the card's `status`,
   `percent`, and `actualtime`.
4. Commit small, focused changes. CI deploys only from the `posts` branch; the
   theme is committed on its own repo's `features` branch.
