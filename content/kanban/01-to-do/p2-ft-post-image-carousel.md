---
title: 'Post image carousel'
description: 'Carousel for images bundled with each post'
date: '2026-10-25'
author: Ivan Hawkes
params:
    due: null
    completionDate: null
    dependencies: null
    references: null
---

Render the images bundled with a post as a responsive carousel.

<!--more-->

Replace the stub `be-best/layouts/_partials/components/carousel.html`, which
prints a `CAROUSEL` label and a bare `<img>` per resource with an empty `alt`,
and which no layout includes. Retire the matching `TODO.md` line, "Prep work for
implementing a carousel again".

## Post image carousel

- [ ] Enumerate the images of the page in filename order, excluding
      `featured.webp`.
- [ ] Render each slide with the same `<picture>` markup as
      `be-best/layouts/_markup/render-image.html`: webp and jpeg srcsets built
      from the 320, 640, 960, 1280, 1600 and 1920 widths the resource can
      supply, a 640px jpeg fallback `src`, `width` and `height`,
      `loading="lazy"`, and the `imgB-<md5>-LQIP` background class.
- [ ] Set `alt` from the resource filename stem: `carousel-03.webp` becomes
      `carousel 03`.
- [ ] Add previous and next controls, keyboard arrow-key support, and a slide
      counter in the form `3 / 9`.
- [ ] Include the partial from `be-best/layouts/post/page.html`.
- [ ] A post with no image resource renders no carousel markup; a post with one
      renders the image with no controls and no counter.

## Acceptance Criteria

- `public/post/garden/spring-2021-try-again/index.html` holds nine `<picture>`
  elements ordered `carousel-01.webp` to `carousel-09.webp`, excludes
  `featured.webp`, and shows a counter reading `1 / 9`.
- `content/post/general/building-a-joystick/` yields four slides,
  `arcade-joystick-01.jpeg` to `arcade-joystick-04.jpeg`.
- `grep -r 'CAROUSEL' public/` prints nothing.
- Every carousel `<img>` has a non-empty `alt`, `width`, `height` and
  `loading="lazy"`.
- `pnpm run test` passes, including the single `h1` heading check and
  `pnpm run test:kanban`.
