---
author: Ivan Hawkes
date: '2026-04-25'
description: Technical Specification
title: Technical Specification
kind: specification
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
tasks.

[kanban-card-front-matter.yaml](kanban-card-front-matter.yaml) is the definition
the front matter must conform to. Validate every kanban card against that
specification and inform me of any deviations.

The fields will be sorted into the following order:

- kind
- title
- description
- date
- author
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
