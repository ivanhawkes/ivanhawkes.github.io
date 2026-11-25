# Roadmap

Improvements found in the review of 2026-11-25, in the order to do them. When an
item is done, tick it and add the date: `- [x] ... (done 2026-12-01)`. A large
item can become a kanban card (`go run ./cmd/kan ...`); name the card here once
it exists. Items already on a card name that card.

## 1. Fixes: broken on the live site

- [x] **Kanban board is empty.** `be-best/layouts/kanban/section.html:14` uses
      `where ... "findRE"`, which `where` has no such operator for, so no stage
      lists a card. Once it lists cards, fix
      `_partials/kanban/section-card.html` too: its `replaceRE` arguments are in
      the wrong order (lines 17, 21), so the ID is always empty and the priority
      is always 0. (done 2026-11-25: the filter is now
      `where .Pages "File.ContentBaseName" "like" ...`, and the unused `$id` is
      removed. The board shows all 51 cards in one grid, not in lanes by stage.)
- [x] **About page core values missing.**
      `be-best/layouts/about/section.html:30` compares `.File.Dir` with
      `"content/about/"`, but the value is `about/`. (done 2026-11-25: compares
      `.Path`.)
- [x] **Every page has the same `<title>`.** `_partials/meta/head.html` writes
      `.Site.Title` on every page (471 pages). Use the page title, then the
      site. (done 2026-11-25: `<title>` moved into `meta.html`, which shares it
      with og and twitter.)
- [x] **og/twitter titles read "Ivan Hawkes| Title".** There is no space before
      the pipe, and the home page repeats the site name (`meta.html:12,25`).
      (done 2026-11-25)
- [x] **Section lists sort alphabetically, not by date.** (wrong finding: posts
      were already newest first; see section 5) `post/section.html:7-8`,
      `recipe/section.html` and `specification/section.html` re-sort by title.
      (done 2026-11-25: posts and specifications list newest first; recipes
      deliberately stay alphabetical.)
- [x] **Broken links.** (done 2026-11-25)
    - [x] `post/recipe/chinese/sweet-and-sour-pork/method.yaml:13`: should be
          `/post/recipe/chinese/light-batter/`
    - [x] `post/recipe/indian/curry/lamb-rogahn-josh/ingredients.yaml:17`:
          should be `/post/recipe/indian/garama-masala/bin-bhuna-hua/`
    - [x] the `../install-ubuntu-24.04` links in
          `install-raspbian-bookworm-on-my-rpi-2b` and
          `install-armbian-26-on-my-odroid-hc2` (now point to
          `install-debian-13-trixie`)
    - [x] the empty `<>` link in `post/general/windows-10-moving-in/index.md:78`
          (now plain text; add a URL if you have one)
    - [x] the `featured.webp` named by the profile pages, and the `avatar.webp`
          named in `data/profile.yaml`: neither file exists (done 2026-11-25:
          restored the two `featured.webp` files deleted by mistake in 1c6180d;
          the `avatar` key had no reader and is removed)
- [x] **Captions never render.** `image-variants.html` ignores the `title` that
      `featured-image.html:71` passes, so the site has no `<figcaption>`. (done
      2026-11-25: `<figure>` and `<figcaption>` when a title is given)

## 2. Fixes: these break the build on content the site doesn't have yet

- [x] `_markup/render-blockquote.html:18` calls the missing
      `/layouts/blocks/alert.html`, so a `> [!NOTE]` alert fails the build; line
      30 writes `<blockquoteclass=...>`.
- [x] `recipes/recipe-times.html:10-22` fails the build on a recipe with no
      `prep-time` or `cook-time`.
- [x] `render-link.html:112,251-321`: remove the Hugo-docs glossary branch it
      still carries.
- [x] `profile/page.html:21`: the merge order lets the site's social accounts
      override the person's, the opposite of what its comment says.
- [x] `image-variants.html:68` and its two copies write an empty `srcset` for
      images narrower than 320px.

Done 2026-11-25. Alerts render as `<blockquote class="alert alert-<type>">` with
a title line; they have no styling of their own yet. Checked with temporary
pages (alerts, a classed quote, a 100px image, a recipe with no times): each
builds and passes html-validate.

## 3. Deployment and the publish gate

- [x] **Nothing gates a publish.** `.github/workflows/hugo.yml` was removed on
      2026-10-30 in the move off GitHub Pages, so `pnpm run test:ci` no longer
      runs before a deploy. Make the new host's build command run it, e.g. on
      Cloudflare Pages `pnpm run build && pnpm run test:ci`, and record that
      setting in the repo.
- [x] **Docs still describe GitHub Pages.** Bring these up to date: `AGENTS.md`
      (lines 3-4, 72, 81-85, 189), `README.md:74-76`, `specification/functional`
      (194-202), `specification/requirements` (33, 92, 95, 96, 104, 120-122) and
      `specification/technical` (135, 586, 612, 627-641). In
      `specification/decisions`, add a superseding entry dated 2026-10-30 rather
      than editing the old ones. Card `p1-is-security-headers` assumes Pages
      too.
- [x] Fix the check count: the docs say "six checks" in places and "eight" in
      others; there are eight.

Done 2026-11-25. `pnpm run build:ci` (build, then `test:ci`) is the Cloudflare
Pages build command; the dashboard settings are listed in `README.md`. Set them
there: the repository cannot.

## 4. Tooling polish

- [x] Add a `.stylelintignore` for `public/`, `resources/` and
      `assets/css/main.css`. `pnpm stylelint "**/*.css"` reports 2268 errors,
      all of them in generated CSS; the theme's own CSS is clean.
- [x] `go test` needs a writable `GOCACHE` inside the sandbox; note this in the
      docs, or set it in `devenv.nix`. (No change: only the agent sandbox hits
      it; a normal shell has a writable cache.)
- [x] Untrack `assets/jsconfig.json`: it is gitignored and generated, but
      tracked anyway.
- [x] Remove the BOM and the stale esm `NOTES` comment from
      `_partials/meta/head.html`, and the TODO in `render-table.html:1`. (The
      TODO is left for you: it asks whether tables need the `overflow-x-auto`
      wrapper that is commented out.)
- [x] `config/_default/hugo.yaml`: the `themes/.*` cachebuster never matches
      (the theme is at `be-best/`); drop `go` and `npx` from
      `security.exec.allow` if nothing uses them; move
      `pagination.preserveTaxonomyNames` out of the `pagination` block.
- [x] Type the TypeScript: `theme-mode.ts` and `dark-mode.ts` have untyped
      parameters, `THEME_ORDER` should be `Theme[]`, and `nav-menu.ts` has null
      element refs. Add a `tsc --noEmit` check to `test:checks`.
- [x] `static/img/*.png` are byte-for-byte copies of `be-best/static/img/*.png`;
      delete the root copies. The apple-touch icon is 100x100; it should be
      180x180. (Duplicates deleted. 2026-11-25: the typewriter traced to a
      vector; the 180x180 apple-touch icon is white on the brand teal, the
      favicon is an SVG that turns white in dark mode, with a 96px PNG
      fallback.)
- [x] Add a `Sitemap:` line to `be-best/static/robots.txt`.

Done 2026-11-25 apart from the icon size. `robots.txt` is now a template, so its
`Sitemap:` line follows `baseURL`. `pnpm run test:types` runs `tsc` in
`test:checks`, so it gates deployment too.

## 5. Dead code

- [x] Delete the 13 templates Hugo reports unused
      (`hugo --printUnusedTemplates`): `all.html` (a debug page),
      `components/carousel.html`, `components/colour-swatch.html`,
      `navigation/all.html`, `about/card.html`, `about/page.html`,
      `recipes/card.html` and the unused `section.html` variants. Keep
      `kanban/section-card.html` (item 1.1) and `_shortcodes/img.html` (content
      may call it).
- [x] Merge `posts/`, `projects/` and `recipes/card.html`, which are identical,
      and remove their "Please add a summary..." placeholder.
- [x] Merge the three copies of the `<picture>`/`srcset` code
      (`image-variants.html`, `render-image.html`, `img.html`).
- [x] Remove the unused CSS: `.brand-name` (`header.css`),
      `@utility     table-odd/even` (`table.css`) and the empty comment in
      `custom.css`.
- [x] Remove the repeated comment in `kanban/section.html:5-7`, and the
      re-exports in `index.ts` that do nothing in an iife bundle.

Done 2026-11-25. Kept: `_shortcodes/img.html` (no page uses it yet) and the
default `section.html` (the fallback for a new section). The Markdown image hook
now draws through `images/image-variants.html`; `img.html` keeps its own copy
for its extra options. Found on the way: `images/placeholder-key.html` built
each listing's paginator in the head with Hugo's default order, so the order the
section layouts asked for was ignored (the section 1 "sort by date" fix changed
nothing; posts were already newest first). Both now paginate
`_partials/listing-pages.html`, and recipe and About lists are alphabetical for
the first time. The same call had also made 14 home-page pagers, `/page/2/` to
`/page/15/`, each a copy of the home page; they are gone.

## 6. Accessibility

- [x] Drawer: the close control `#nav-toggle` sits outside the Tab trap, and
      `closeDrawer` leaves a stale `is-open` behind (`nav-menu.ts:175,252-273`).
- [x] Drop `aria-haspopup="true"` from the plain-list panels
      (`recursive-nav.html:53`, `top-nav.html:75,112`).
- [x] Breadcrumbs: take the `»` out of the link, and add the current page with
      `aria-current`.
- [x] Heading levels: fix the `h1` → `h3` jumps in `taxonomy.html` and
      `term.html`, and the `h3` in `recipes/method.html`.
- [x] `recipes/ingredients.html`: make the dish names real headings, remove the
      `&nbsp;` spacer, and stop the authoring error from reaching the public
      page.
- [x] `taxonomy.html`: remove the redundant `role="link"`, the invalid
      `itemProp` and `data-pagefind-tags`.

Done 2026-11-25. Checked in headless Chrome at phone width: Tab and Shift+Tab
cycle the close control and every drawer entry, and closing leaves no panel
open. Recipe dish names in the ingredients column stay styled text, not
headings: that column comes before the page's `h1` in the markup, so headings
there would break the outline; the method column gets a hidden "Method" `h2`.
Ingredient file problems are now build warnings, not text on the page.

- [ ] Follow-up: when the drawer opens from a click, focus may stay on the page
      instead of moving to the first entry. Seen in headless Chrome, before and
      after this change; check on a real phone.

## 7. Features (open cards and epics)

- [x] Security headers: card `p1-is-security-headers`. The new host can serve a
      `_headers` file, so the card's "unreachable on Pages" notes no longer
      apply. (headers added 2026-11-25 in `static/_headers`; live checks pending
      on the card)
- [x] Hero image priority: card `p2-is-hero-image-load-priority`. (done
      2026-11-25; the audit re-run is left for you)
- [x] Structured data and social meta, plus a `socialImage`: card
      `p2-is-structured-data-and-social-meta-tags`. (done 2026-11-25)
- [ ] Epic `p2-ep-kanban-system`: burn-down chart, epic progress taken from its
      cards.
- [ ] Epic `p2-ep-documentation-system`: the remaining specification documents.
- [ ] Epic `p2-ep-website-redesign`: SEO refresh, usage monitoring.
- [ ] Later: move the per-page image placeholder `<style>` block into a
      stylesheet, so the Content Security Policy can drop
      `style-src 'unsafe-inline'` (see `p1-is-security-headers`).

## 8. Content and documentation

- [x] Spelling: Independance, dependance and neighboors (`data/about.yaml`),
      firey and existance, Brocoli, "the the", "and and", five "it's own", and
      "dependant" used for "dependent". (done 2026-11-25 with codespell over
      content/ and data/; code blocks left alone except two comments you
      approved)
- [x] Descriptions: 104 of 147 pages have none, all 58 recipes included, and
      many of the rest repeat the title. (done 2026-11-25: a page without a
      description is described by its summary, the text before `<!--more-->`; 72
      of the 105 already had a usable one. The 16 recipes whose summary was a
      single short line have a fuller summary, written from their ingredients
      and method. The 17 section pages, which have no text of their own, have a
      front matter description. Tag and category pages get a generated one.)
- [x] Tags and categories missing on 12 posts; `author` missing on
      `chocolate-chip-cookie`; the front matter of the cryengine blacklists post
      is indented. (done 2026-11-25; also merged `Admin` into `Administration`
      and `general` into `General`. "First Results", an unfinished placeholder,
      is deleted)
- [x] Featured images: only 18 of 147 pages have one. (closed 2026-11-25:
      intentional; no AI or stock images. How image-less posts display is a
      separate design choice.)
- [x] Unused images: `building-a-joystick/arcade-joystick-0*.jpeg` and
      `spring-2021-try-again/carousel-0*.webp`. Use them or remove them. (done
      2026-11-25: both posts show them in a `gallery` shortcode with a lightbox;
      `carousel-01.webp` was a copy of the featured image and is deleted)
- [x] Add a dated note to `switching-website-to-github` that the site has moved
      since. (done 2026-11-25)
