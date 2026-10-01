---
author: Ivan Hawkes
date: '2026-04-25'
description: Technical Specification
title: Technical Specification
type: specification
---

# Technical Specification

## Data Definitions

Exact definitions for the project data structures are listed in the section. The
definitions should be provided in an open data definition language (DDL) format.
OpenAPI Specification v3.1.0 format will be used with YAML selected for
formatting the data definitions.

### Kanban Card Front Matter

Kanban cards are markdown files with front matter in YAML format. The YAML
defines the metadata used by the kanban system for tracking the progress of
tasks. It follows the spec provided below:

```YAML
components:
  schemas:
    kind:
      type: string
      maximum: 40
    title:
      type: string
      maximum: 40
    description:
      type: string
      maximum: 80
    date:
      type: string
      format: date-time
    author:
      description: string
      maximum: 40
    lastmod:
      type: string
      format: date-time
    params:
      sprint:
        type: string
        maximum: 30
      stage:
        type: string
        enum:
          - ideation
          - requirements
          - design
          - develop
          - test
          - review
          - deploy
          - done
      status:
        type: string
        enum:
          - pending
          - in-progress
          - done
      completed:
        type: string
        enum:
          - null
          - true
      due:
        type: string
        format: date-time
      estimatedtime:
        type: number
        format: double
        multipleOf: 0.01
        minimum: 0
        exclusiveMinimum: true
        maximum: 2000
        exclusiveMaximum: true
      actualtime:
        type: number
        format: double
        multipleOf: 0.01
        minimum: 0
        exclusiveMinimum: true
        maximum: 2000
        exclusiveMaximum: true
      percent:
        type: number
        format: double
        multipleOf: 0.01
        minimum: 0
        exclusiveMinimum: true
        maximum: 2000
        exclusiveMaximum: true
      priority:
        type: integer
        format: int32
      references:
        type: array
        items:
          type: string
      dependencies:
        type: array
        items:
          type: string
```

The fields will be sorted into the following order:

- type
- title
- description
- date
- lastmod
- params

Fields that are subordinate to 'params' will be sorted into the following order:

- stage
- status
- estimatedtime
- actualtime
- completed
- dependencies
- due
- percent
- priority
- references

The schema is in a state of change right now. The component schema 'type' is too
generic a field name and is being changed to 'kind'.

Kanban cards that have 'type' as a field should update the field name to 'kind'.
Specifications that refer to the 'type' field should also be changed to 'kind'.
