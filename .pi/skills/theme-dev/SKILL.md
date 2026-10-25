---
name: theme-dev
description:
    Work on the be-best Hugo theme. Tailwind CSS builds, layouts, partials, and
    shortcodes. Use when changing theme styling, markup, or the CSS pipeline.
---

# Theme development

The theme lives in `be-best/`, a plain directory tracked in this repository (the
former git submodule was merged into the root). Its layout:

- `layouts/` - page and section templates; `baseof.html` is the root.
- `layouts/_partials/` - reusable partials (cards, navigation, meta, kanban,
  images, bylines, recipes).
- `layouts/_shortcodes/` - shortcodes (`img`, `kanban-list-short`).
- `layouts/_markup/` - goldmark render overrides (codeblock, image, table, link,
  blockquote).
- `archetypes/` - content scaffolds per kind. Hugo picks the archetype from the
  `--kind` flag (`hugo new content ... --kind issues` ->
  `archetypes/issues.md`), falling back to the path stem, so the target folder
  must be spelled out in the path.
- `assets/css/` - Tailwind source CSS; `assets/js/` - TypeScript assets
  (copy-codeblock, dark-mode, theme-mode and its head preloader theme-init,
  nav-menu, site-header).
- `static/` - theme static assets (favicons, robots.txt).

## CSS pipeline

Tailwind compiles the theme source into the site asset:

```bash
pnpm run css          # compile once: theme CSS -> assets/css/main.css
pnpm run css-watch    # watch mode, run alongside the Hugo server
pnpm run build:css    # minified production build
pnpm stylelint "**/*.css"
```

The source of truth is `be-best/assets/css/main.css`; edit only that.
`assets/css/main.css` in the site root is generated build output and is
**gitignored** - never edit it by hand and never stage it.

`pnpm run test` and `pnpm run build` each compile the CSS before running Hugo,
and `pnpm run serve` compiles once then starts `hugo server -D -F`. There are no
`dev:css` / `dev:hugo` scripts.

## Commit flow

1. Make theme changes in `be-best/`.
2. Validate with `pnpm run test` in the repo root.
3. Commit `be-best/` together with the rest of the change; there is no submodule
   pointer and `be-best/` has no remote of its own.

`be-best/` is not a git repository - the submodule was merged into this project
and its leftover `be-best/.git` gitfile was deleted. Never run git commands
inside it; the repository root commits the theme files.

## HUGO config touchpoints

- `config/_default/hugo.yaml`: markup (goldmark, highlight), mounts, caches,
  taxonomies.
- `config/_default/params.yaml`: theme params (dark mode, date formats, social
  links).
