---
title: "{{ replace .Name "-" " " | title }}"
date: '{{ time.Now.Format $.Site.Params.dateFormat }}'
type: specification
description: "Decision Record"
categories: ["Documentation"]
author: "Ivan Hawkes"
---

A record of each of the important decisions that were made in the process of
designing and implementing this project.

Decisions should be listed in a table with each decision taking up one row. The
table structure is:

- brief summary: preferably three or less sentences describing the decision.
- reasoning: preferably three or less sentences providing the reason 'why' the
  decision was made. What is the driving cause behind the decision e.g. cost,
  benefits, disadvantages, speed, timing, labour, insufficient skills?

The table should be provided in markdown table format. Each new decision should
be appended to the end of the table.

## Decision Table

| Brief Summary        | Reasoning                                   |
| :------------------- | :------------------------------------------ |
| Record all decisions | Gives insights into the development process |
