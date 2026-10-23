---
title: "{{ replace .Name "-" " " | title }}"
date: '{{ time.Now.Format $.Site.Params.dateFormat }}'
type: specification
description: "Project Summary"
categories: ["Documentation"]
author: "Ivan Hawkes"
---

The purpose of this document is to give a brief and precise summary of the
status of this project. The status is a "live view" derived from the various
documents that track the individual goals for the project.

## Overall Project Progress

### Ideation

{{< kanban-list-short prefix=id >}}

### Decision Record

TODO: Write a shortcode to present this information somehow.

### Specifications

{{< kanban-list-short prefix=sp >}}

## Requirements

### User Stories

{{< kanban-list-short prefix=us >}}

### Epics

{{< kanban-list-short prefix=ep >}}

### Features

{{< kanban-list-short prefix=ft >}}

## Getting Started

### Scaffold

{{< kanban-list-short prefix=sf >}}

## Testing

### Testing

{{< kanban-list-short prefix=ts >}}

### Issues

{{< kanban-list-short prefix=is >}}

### Acceptance

{{< kanban-list-short prefix=ac >}}

## Deployment and Migration

### Deliverables

{{< kanban-list-short prefix=dl >}}

### Deployment

{{< kanban-list-short prefix=dp >}}

### Releases

{{< kanban-list-short prefix=rl >}}
