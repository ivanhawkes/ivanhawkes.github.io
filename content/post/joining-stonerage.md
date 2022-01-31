---
type: post
title: Joining StoneRage
date: 2013-09-02
tags: ["CryEngine","CryEngine3","Games","software","StoneRage"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

A few weeks ago I decided to place my own projects on hold and join a team working on a game - specifically the [StoneRage](http://mountainwheel.com/games/stonerage/ "StoneRage") game. The developers seemed organised and were well advanced in terms of graphic and environmental production.
<!--more-->

Better still, their code requirements would be a fairly close match to many of the things I will need to do to bring [Shattered Screens](http://www.shattered-screens.com "Shattered Screens") to completion. This provides me with a great opportunity to work on something fun, meet some new people, and get some learning / code written.

Now, learning the CryEngine is no easy feat for a programmer. There's approximately 220,000 lines of c++ code to peruse, and perhaps 40,000 more lines of LUA code - and that's not taking into account all the metadata that is stored inside XML documents. To make matters worse, the documentation is sparse and lacking in important details and there are very few useful tutorials on the subject. It's a large hill to climb.

For the last few weeks I've been studying the dizzying amount of code and whatever scraps of information I could find when suddenly; Christmas came early.

CryTek have been promising for quite some time to release the 3.5.x version of the SDK, and last week they finally made good on that promise. It's a major re-write of their system, with huge changes to the LUA scripts and doubtless a similarly large amount of changes to the gamedll code and SDK. I'm now in the process of taking all of the code which has been written for StoneRage and seeing how it will fit into the newly released code bundle from CryTek.

Lucky for me, they kept the codebase changes away from the base code for the most part - and a lot of what was mixed with the CryTek code can simply be dropped. Now the challenge is on fixing all the parts that broke, working out what's needs updating and where we can improve the current work.

Along the way I hope to build a really solid understanding of the CryEngine SDK and pass along as much of this as I can.