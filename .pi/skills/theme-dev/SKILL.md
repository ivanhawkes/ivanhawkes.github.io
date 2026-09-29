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
- `archetypes/` - content scaffolds per kind; Hugo picks the archetype from the
  path stem and `--kind`.
- `assets/css/` - Tailwind source CSS; `assets/js/` - TypeScript assets
  (copy-codeblock, dark-mode, hamburger-menu, sidebar).
- `static/` - theme static assets (favicons, robots.txt).

## CSS pipeline

Tailwind compiles the theme source into the site asset:

```bash
pnpm run dev:css    # watch mode: main.css -> assets/css/main.css
pnpm run build:css  # minified production build
pnpm stylelint "**/*.css"
```

The generated `assets/css/main.css` is the file committed for the site; never
edit it by hand.

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
