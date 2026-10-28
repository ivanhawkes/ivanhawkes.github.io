---
# The scaffold of a new project, kept on purpose. `hugo new content
# dashboard/<name>` copies this tree: this page, the kanban/ section with one
# folder per card kind, and kanban/epics/ep-001.md. No page under content/ is
# built from it, so a reference search reads the tree as dead weight - it is
# not, so never delete it. A YAML comment like this one reaches the scaffold as
# a comment line.
layout: post
title: Dashboard
date: '{{ time.Now.Format $.Site.Params.dateFormatStandard }}'
description: A dashboard for managing development of this blog.
menus:
    main:
        params:
            icon:
                <svg xmlns="http://www.w3.org/2000/svg"   viewBox="0 -960 960
                960"><path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0
                50-35 85t-85 35H240Zm480-80q17 0
                28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5
                28.5T720-160ZM360-600v-80h360v80H360Zm0
                120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5
                28.5T240-160Zm0 0h-40 400-360Z"/></svg>
        weight: 30
---
