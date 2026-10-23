---
title: "{{ replace .Name "-" " " | title }}"
description: 'Limit to 50 characters'
date: '{{ time.Now.Format $.Site.Params.dateFormat }}'
author: Ivan Hawkes
params:
  completionDate: null
  due: null
  dependencies: null
  references: null
---

A brief description. Limit to 50 characters.

<!--more-->
