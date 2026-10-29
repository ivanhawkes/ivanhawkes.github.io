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

The site is published to GitHub Pages by `.github/workflows/hugo.yml` from the
`publish` branch. Pages serves the artifact with headers of its own choosing:
the repository cannot attach a `Content-Security-Policy`,
`Strict-Transport-Security`, `Cross-Origin-Opener-Policy` or `X-Frame-Options`
response header to a Pages page. Record, before writing any policy, which of the
five findings is closable where:

- HSTS: GitHub sets the header when the repository's Pages "Enforce HTTPS"
  setting is on. Check the setting, and record the `Strict-Transport-Security`
  value a live request returns.
- CSP: the policy can travel inside the document, as
  `<meta http-equiv="Content-Security-Policy">` in
  `be-best/layouts/_partials/meta/meta.html`. The CSP spec ignores
  `frame-ancestors`, `sandbox` and `report-uri` in a meta, so a meta policy does
  not close the frame control finding.
- Trusted Types: needs the `Require-Trusted-Types` response header plus a
  `trustedTypes.createPolicy` call in script. There is no meta equivalent.

A perfect security score is therefore out of reach while the site is hosted on
Pages. State the score that is reachable, and name the hosting change (a host
that serves custom headers, e.g. a `_headers` file on Cloudflare Pages) if that
is the decision taken.

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

## Acceptance Criteria

- [ ] **HSTS** - a live request returns `Strict-Transport-Security`, and the
      Pages setting that provides it is named on this card
- [ ] **CSP** - the policy covers `default-src`, `script-src`, `style-src`,
      `img-src` and `form-action` (plus `frame-ancestors` on a header route),
      and the site's own features work under it: navigation, theme toggle,
      search box, images and placeholders, code-to-clipboard, kanban board
- [ ] **COOP, frame control, Trusted Types** - each is closed by a header, or
      recorded as unreachable on GitHub Pages together with the hosting change
      that would close it
- [ ] **No regression** - `pnpm run test` is green with the policy in place, and
      the score reported by the review tool is recorded here
