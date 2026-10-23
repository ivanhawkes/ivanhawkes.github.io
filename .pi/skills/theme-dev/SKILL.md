---
name: theme-dev
description:
    Work on the be-best Hugo theme. Tailwind CSS builds, layouts, partials, and
    shortcodes. Use when changing theme styling, markup, or the CSS pipeline.
---

# Theme development

The theme lives in `themes/be-best/` and is a git submodule (branch `features`).
Its layout:

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
  (copy-codeblock, dark-mode, hamburger-menu, sidebar).
- `static/` - theme static assets (favicons, robots.txt).

## CSS pipeline

Tailwind compiles the theme source into the site asset:

```bash
pnpm run css          # compile once: theme CSS -> assets/css/main.css
pnpm run css-watch    # watch mode, run alongside the Hugo server
pnpm run build:css    # minified production build
pnpm stylelint "**/*.css"
```

The source of truth is `themes/be-best/assets/css/main.css`; edit only that.
`assets/css/main.css` in the site root is generated build output and is
**gitignored** - never edit it by hand and never stage it.

`pnpm run test` and `pnpm run build` each compile the CSS before running Hugo,
and `pnpm run serve` compiles once then starts `hugo server -D -F`. There are no
`dev:css` / `dev:hugo` scripts.

## Submodule commit flow

1. Make theme changes in `themes/be-best/`.
2. `cd themes/be-best && git add -A && git commit && git push origin features`
3. In the parent repo, `git add themes/be-best && git commit` (updates the
   pointer).
4. Validate with `pnpm run test` in the parent repo.

## HUGO config touchpoints

- `config/_default/hugo.yaml`: markup (goldmark, highlight), mounts, caches,
  taxonomies.
- `config/_default/params.yaml`: theme params (dark mode, date formats, social
  links).
