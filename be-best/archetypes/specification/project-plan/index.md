---
title: "{{ replace .Name "-" " " | title }}"
date: '{{ time.Now.Format $.Site.Params.dateFormat }}'
type: specification
description: "Project Plan"
categories: ["Documentation"]
author: "Ivan Hawkes"
---

A plan on how to implement, test and deploy this project.
