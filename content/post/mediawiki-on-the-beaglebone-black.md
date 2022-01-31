---
type: post
title: MediaWiki on the Beaglebone Black
date: 2014-08-08
tags: ["Beaglebone Black","LAMP","MediaWiki","Raspberry Pi"]
category: general
image: /img/site/category/general.jpg
image-thumbnail: /img/site/category/general.jpg
author: "Ivan Hawkes"
---

There's been a lot of excitement over the past 2 years regarding the Raspberry Pi. The Pi is a wonderful piece of hardware / software with a great community behind it. I'm definitely a fan and would happily recommend one to a friend, but there's another player that is possibly even more exciting for the hardcore nerds - the BeagleBone Black (BB).
<!--more-->

While the Pi is a great teaching tool, and capable in it's own right, it is eclipsed by the BB. On paper they don't seem too different but there are a couple of small things that make the BB better suited to slightly heavier work loads like running a (very) small PHP web site.

First up, the Pi (original) shares resources between the network and USB leading to truly awful network USB drive access. Network and USB have to duke it out to provide services - not good!

Hooking up a decent sized USB2 hard drive to a Pi and accessing that over the network seems like a great idea, until you try it. I could never seem to push it past 50-60 mbit transfer speeds, and often it was closer to 30 mbit. That's appalling for backups, file servers, well...basically anything more demanding than a single / dual user media server. Trust me, you don't want to push your 150GB backup or 25 x 0.5 GB episodes of some high def anime you just downloaded.

The second thing is that the Pi has an Arm6 CPU while the BB has an Arm Cortex A8 (Arm7) which can run twice as fast at the same clock speeds.

Surprise twist, the BB also gives you 2GB of flash RAM on the board, so you don't even need to add a USB drive or Micro-SD card - unless you want to. These little things all add up to an improved experience when trying to get your little SoC to do something useful for your home / small business. Don't dismiss the 2GB onboard, you can do an awful lot with 2GB of storage on a Linux machine.

I've been running a personal copy of MediaWiki for a while now to help me design a game system I am working on. It's basically an idea scratch pad so I need it to be up and running 24 / 7 and reasonably responsive so I don't forget my ideas before I have a chance to jot them down. I had it running on Nginx, PHP, MySql on the Pi and while it was usable it was just a little too sluggish feeling. Typical page times were between 1.2 and 1.8 seconds, which is just above my threshold of tolerance. It was time to try it out on one of the shiny new BB I bought (three! :D)

I set about installing MediaWiki as per the usual source code instructions, same as I did for the Pi with one small change. On the Pi I had switched to using Nginx due to it's rep as a fast, low overhead, server. This time, I went with Apache2 simply because it was already setup and I figured I had a little headroom. Turns out I was right.

Once MediaWiki was setup I imported my site - a fairly small one with about 60 documents. Immediately, I noticed it was just that little bit more responsive feeling. Not fast, but...better.

With the software loaded I tried editing, viewing, searching for pages. According to Chrome's testing tools it now serves most pages up within 900ms, a decent improvement. Static content comes back so fast I would miss it if I blinked. The default Apache page serves up in 25 ms average.

Hitting the 'Random Page' link several times in a row generally returns a page in about 800 ms, but sometimes much faster if it's in the cache (APC for PHP is setup).

All in all, it's faster, and...fast enough for this simple purpose.

I've got PHPMyAdmin running on it, and a few other things. To be honest, it all runs faster than it would hosted in the Cloud somewhere on high end servers.

I can highly recommend using these BB as single purpose LAMP servers. They are cheap enough to buy one for every LAMP service you think you might need. I have one for a download server which pulls down my weekly anime fix and stores it on my network attached drives. I have another one for experimental work - like running Go applications, it also has a current build of MongoDB. My final one, runs MediaWiki for me.

Each runs well and performs it's selected task far better than you might imagine a tiny PC could do. Check them out, the future is small.