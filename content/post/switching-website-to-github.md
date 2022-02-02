---
type: post
category: 
title: "Switching Website to Github"
date: 2022-02-03T00:01:31+10:00
tags: []
summary: 
image: /img/site/category/general.jpg
image-thumbnail: /img/site/category/general.jpg
author: "Ivan Hawkes"
---

I've been self hosting this site on my own personal web server for quite a few years now. It's not convenient, but it is cheap, which is always a good motivation for me. Today I'd like to talk about moving this site from self hosting to [Github Pages](https://pages.github.com/).
<!--more-->

There are two really good things about self hosting:

* it's cheap or free
* you have absolute control over the services

There are downsides too:

* you're in charge of backups
* if there's a power outage, your site is down - that can result in days offline out here, thanks to thunderstorms.
* making a website from scratch is a lot of work
* maintaining it is also a lot of work
* you're stuck with the asymetrically bad upload bandwidth your ISP provides for you
* latency can be an issue
* you probably don't have professional level monitoring of the site
* usage stats will be harder to gather without letting some greedy corporation skim all your traffic
* it can be a bit of a pain to deploy to the site, depending on how well you set that up
* you might need to have a noisy server sucking up lots of power if you want data backed interactivity

My site has been hosted at home for perhaps 8 years now. A few years back I found out about the [Hugo](https://gohugo.io/) project and switched my site over to a static website using Hugo to generate the pages. I haven't looked back since. I write everything as simple markdown pages, and let Hugo churn through it and spit out my website.

It's been hosted on an [ODROID-HC2](https://ameridroid.com/products/odroid-hc2) from an SDCARD until tonight. That's a machine about as powerful as a mid-range mobile phone. Even so, it could serve the pages up quickly, because I used NGinx as the server, and the machine never had to do anything more complex than load a file from disk / cache and spew it to the web.

With all my ducks in a row; I finally decided to switch to using Guthub Pages. They have supported static website generators for a while, but I wanted to use Hugo instead of Jekyll, so it has only really become attractive recently.

In theory, I take my Hugo site, add a little bit of configuration, then push it to a repository, and it is published as a static site. In practice, it took quite a few hours to get all the little bits configured exactly the way Github wanted them. Some info in tutorials wasn't particularly clear. Windows and Git decided to have a conniption, setting me back hours, but thankfully Linux was the sturdy trooper it's known for being. LFS also threw it's toys out the pram. It wasn't until I disabled LFS, and went with nearly default settings and branch naming that I had success.

In theory, with all the hard work behind me, I simply write this markdown file, commit it to my repo, and push it to Github. The CI will do all the rest. Wish me luck!
