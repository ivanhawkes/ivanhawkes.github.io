---
title: 'Card Design Improvements'
description: 'Improvements to the design of cards'
date: '2026-10-26'
author: Ivan Hawkes
params:
    completionDate: null
    due: null
    dependencies: null
    references: null
---

Cards are used to display sections of information that should be kept separated
from each other. These need a quick design pass.

<!--more-->

Update the design elements used when displaying a card. They are used with
posts, about profiles, and recipes.

## Goals

- [ ] **title font** - the title should be in large bold text similar to a
      heading 3 element
- [ ] **title state** - the title is a link to another page and should have all
      the style elements that a link has i.e. hover, colour. Colour should match
      the heading elements
- [ ] **hero image** - a card should only display a hero /featured image if it
      page it references has a unique image. It should not default to the
      featured image of it's parent folder, as it currently does.
- [ ] **layout** - currently it shows a fixed number of cards (6), but with some
      cards having no featured image available it should instead use a form of
      layout that works well with mixed card sizes
