---
type: project
title: Chrysalis - An Action RPG SDK
date: 2018-12-17
tags: ["Chrysalis"]
image: /img/project/chrysalis/chrysalis.jpg
image-thumbnail: /img/project/chrysalis/chrysalis.jpg
author: "Ivan Hawkes"
---

Chrysalis is a plugin for CRYENGINE 5.x, written in C++11, that provides a foundation of features required to create action RPG style games.<!--more-->

It is under constant development, moving towards a set of final goals.

Currently, most of the work needed for a walking simulator is complete or underway.

### Goals

The primary goal is to provide the base functionality required by several types of games. The main focus is on making an action RPG toolkit, but there are several goals and steps along the way.

*   walking simulator
    *   first and third person cameras
    *   player input handling
    *   actors / characters
    *   locomotion
    *   interactive entities (doors, switches, etc)
    *   item and equipment systems
*   action RPG
    *   weapons
    *   combat
    *   vehicles
*   stretch goals
    *   ladders
    *   swimming
    *   climbing
    *   networked gameplay

At present, I am not expecting to create a UI for any of the game features. Any teams looking to use this code will need to make their own UI, since game features tend to vary widely.

UI is a [CRYENGINE](https://www.cryengine.com/) feature in flux. The Scaleform implementation is getting too old to be useful, while the new UI elements aren't quite ready yet.

In time I will ensure the base code has all the features needed to support a rich client UI, and will probably provide a simple example implementation for the most useful features.

Check our [Github Repository](https://github.com/ivanhawkes) for the latest version of [Chrysalis](https://github.com/ivanhawkes/Chrysalis).