---
title: 'Security Headers'
description: 'No security headers: CSP, HSTS, COOP, frames'
date: '2026-10-29'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

No security headers are sent with the pages.

<!--more-->

## Findings

A review of the published site scores security 0/100, with five high-priority
findings:

- no Content Security Policy
- no HTTP Strict Transport Security (HSTS)
- no Cross-Origin Opener Policy (COOP)
- no frame control policy, so other sites can embed the page (`X-Frame-Options`
  / CSP `frame-ancestors`)
- no Trusted Types policy

## Deployment Constraint

Since 2026-10-30 the site is built and served by Cloudflare Pages from the
`publish` branch. Pages applies the response headers named in a `_headers` file
at the root of the output, and Hugo copies `static/_headers` into `public/`, so
all five findings can be closed by headers:

- HSTS: a `Strict-Transport-Security` rule in `_headers`, or the HSTS setting of
  the Cloudflare zone. Record which one provides it, and the value a live
  request returns.
- CSP: a `Content-Security-Policy` header, which, unlike a `<meta>` policy,
  honours `frame-ancestors`.
- COOP and frame control: `Cross-Origin-Opener-Policy`, and `frame-ancestors` in
  the CSP (or `X-Frame-Options`).
- Trusted Types: the CSP directive `require-trusted-types-for 'script'`, plus a
  `trustedTypes.createPolicy` call wherever a script writes markup.

## Policy Content

Measured on the current build, the policy has to allow exactly this:

- No third-party script and no inline `<script>` element: a page loads
  `/js/theme-init.js` and `defer /js/index.js`, both same-origin.
- One inline `<style media="screen">` block per page, written by
  `be-best/layouts/_partials/images/image-process.html`, holding the LQIP
  placeholder rules with `url(data:image/webp;base64,...)`. `style-src` needs
  `'unsafe-inline'`, and `img-src` needs `data:`; a per-page hash is fragile
  under `--minify` and the cache-busting churn.
- The header search box posts to `https://www.google.com/search`
  (`be-best/layouts/_partials/page/header.html`). A `form-action` of `'self'`
  breaks it: allow that origin in `form-action`, set `search: false` in
  `config/_default/params.yaml` to drop the box, or turn the box into a link.
- `hugo server` injects `/livereload.js`, so record how live reload survives the
  policy: allow it only when `hugo.IsServer`, or accept that development runs
  with the policy off.

## Policy

`static/_headers` sets five headers on every response (2026-11-25):

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy`: `default-src 'none'`, then `script-src 'self'` plus
  the Cloudflare Web Analytics beacon, `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'` plus
  `cloudflareinsights.com`, `form-action https://www.google.com`,
  `frame-ancestors 'none'`, `base-uri 'self'` and
  `require-trusted-types-for 'script'`
- `Cross-Origin-Opener-Policy: same-origin`
- `X-Frame-Options: DENY`

`style-src` keeps `'unsafe-inline'`: each page carries its own `<style>` block
of image placeholders, so no hash in a site-wide header can name it. Moving
those rules into a stylesheet would allow dropping it. No inline script needs
allowing: the only inline `<script>` elements are JSON-LD data blocks, which the
browser does not run. Cloudflare injects its analytics beacon into each page, so
the beacon's origins are allowed, per Cloudflare's documentation.

Checked in headless Chrome against a production build served with these headers:
no policy violation on the home page, a post, a recipe, the kanban board and
grid, or the phone-width drawer; the theme switch, the menus, the drawer,
images, placeholders, JSON-LD, code copy and the search form all work; and a
page that frames the site is refused, where the same page loads without the
headers. `hugo server` sends none of these headers, so development is
unaffected.

## Acceptance Criteria

- [x] **HSTS** - a live request returns `Strict-Transport-Security`, and the
      `_headers` rule or Cloudflare setting that provides it is named on this
      card
- [x] **CSP** - the policy covers `default-src`, `script-src`, `style-src`,
      `img-src` and `form-action` plus `frame-ancestors`, and the site's own
      features work under it: navigation, theme toggle, search box, images and
      placeholders, code-to-clipboard, kanban board
- [x] **COOP, frame control, Trusted Types** - each is closed by a header in
      `static/_headers`
- [ ] **No regression** - `pnpm run test` is green with the policy in place (met
      2026-11-25), and the score reported by the review tool is recorded here
