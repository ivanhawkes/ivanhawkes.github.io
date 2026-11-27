---
title: 'Search Console Cannot Read the Sitemap'
description: 'Search Console reports the sitemap is missing'
date: '2026-11-27'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Search Console reports it cannot find the sitemap.

<!--more-->

## Findings

Measured on 2026-11-27, the sitemap itself is sound: `robots.txt` names
`https://blog.ivanhawkes.dev/sitemap.xml`, which returns 200 as
`application/xml`, and every URL it lists returns 200. The fault is outside the
repository:

- The sitemap has to be submitted in a property that covers
  `https://blog.ivanhawkes.dev/`: a URL-prefix property for exactly that origin,
  or the `ivanhawkes.dev` Domain property. `ivanhawkes.github.io` 301s to the
  blog, so a property for it cannot read the sitemap.
- `https://ivanhawkes.dev/` and `https://www.ivanhawkes.dev/` return Cloudflare
  522: proxied records with no origin behind them.
- Cloudflare's Bot Fight Mode and AI-bot blocking may challenge Googlebot; not
  checked, as the dashboard is not visible from here.

## Done When

- A redirect rule sends the apex and `www` to `blog.ivanhawkes.dev`, or their
  records are removed, and neither answers 522.
- Security Events show no challenge served to Googlebot.
- The sitemap is submitted in the right property and Search Console reports it
  read, with its URL count.
