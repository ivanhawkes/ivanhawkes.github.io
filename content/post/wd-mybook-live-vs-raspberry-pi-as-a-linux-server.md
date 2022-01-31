---
type: post
title: WD MyBook Live vs Raspberry Pi as a Linux Server
date: 2014-03-24
tags: ["Hardware","Linux","Low Power Devices","Raspberry Pi"]
category: general
image: /img/site/category/general.jpg
image-thumbnail: /img/site/category/general.jpg
author: "Ivan Hawkes"
---

I've spent a lot of time in the last few months playing around with low power Linux based devices. As power becomes more expensive, and computers push out more heat and noise I find myself looking for ways to enjoy the comforts of always-on-service without paying the heat and noise toll.
<!--more-->

In this article I will contrast the [Raspberry Pi](http://www.raspberrypi.org/ "Raspberry Pi") with a [Western Digital MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") hard drive.

In the past I have run servers (2U rackmount Dell machines, re-purposed ancient hardware) within my own home, pulling large amounts of electricity and creating large amounts of heat and noise. I simply accepted at the time that if I wanted a certain level of service, I would need to pay the price.

It was the [Raspberry Pi](http://www.raspberrypi.org/ "Raspberry Pi") that first drew me into the low power sphere, though; it could be argued that my time working with Linux on XBox was the first true experience. The Raspberry Pi is a small, low power, low cost and low heat computer that is capable of running GNU Linux. It draw's strength from the enormous wealth of GNU Linux, making it a strangely capable machine for single purpose applications.

Now, the [Raspberry Pi](http://www.raspberrypi.org/ "Raspberry Pi") is excellent as a low power device, wonderful as a teaching tool, but truly awful as a file server. This is where the [WD MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") enters the scene.

The major problem with the Pi in many tasks comes down to a simple trade-off they made in it's design. The Pi uses the same bus to handle USB and Network, and only comes with a 10mbs network connection. This makes it less than ideal at tasks it should be able to handle quite well. In practical tests, I generally only manage to transfer between 3-6MB/s between my main PC and the PI. That completely rules the PI out as a backup server and makes it a pain to use for a media server. Who wants to spend 30 minutes copying over a new HD torrent?

It turns out there is a really good alternative for file serving that still gets you a lot of the tasty things you get with a Pi. While looking for new hard drives to store my growing media collection on I stumbled on the [Western Digital MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") series of drives.

These drives combine a fast, 3TB hard drive with a 1gbs ethernet connection, a PowerPC CPU and Linux. All that adds up to opportunity.

Within minutes of spinning up one of these drives and connecting to it, you can have [root access](http://community.wd.com/t5/My-Book-Live/What-are-the-steps-to-enable-SSH/m-p/324423#M7544 "Root Access Over SSH") to it over SSH without using any hacks. Fire up your favourite SSH client and you can now connect to the drive as root. That's right, you have root access to a 1gbs 3TB hard drive with a decent Linux distro on it.

I really only needed to add two things for my day to day needs. Firstly, I added a copy of [Transmission](http://www.transmissionbt.com/ "Transmission") to allow me to use the hard drive to pull down torrents for me while my main machine is sleeping. Something about the idea of a hard drive that actually downloads torrents to itself makes me giggle. I access this remotely using the Transmission client on my PC to talk to the back end on this drive. I can seamlessly click a link on a site on my PC and have the back end hard drive download it for me.

Second, I placed a copy of [BTSync](http://www.bittorrent.com/sync "BTSync") onto the machine. This allows me to sync large amounts of files with other people over the net. It's great for teams who need to swap large amounts of possibly huge files. No need to pay huge sums of cash to get cloud hosting or for DropBox / etc, and best of all, it's totally private.

Installation of the software is easy enough. You pull it in using Optware commands and there is a wide range available out of the box. You could always compile yourself if needed, but I saw pretty much everything I would need in the repository already.

## Performance

I'm not going to bother with a vast array of performance tests. I'll just impart this one fact. The [Raspberry Pi](http://www.raspberrypi.org/ "Raspberry Pi") can transfer files at 3-6MBs, and the WD MyBook Live can do so at 70MBs. It's well over 10 times as fast. If you want to perform backups to this device, or move large files around, you want the [WD MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live").

## Cost

You can purchase a Raspberry Pi for $35USD, and the sundries for $20-40USD more. It's not hard to get a Raspberry Pi up and running for $50-$75USD, but...you then need to add the cost of storage. The Pi would need a USB2/3 hard drive of similar size to the equivalent WD MyBook Live. Here, in Australia, you can buy 3TB of USB drive space for $150. For $200, you can order online from JB Hi Fi a 3TB WD MyBook live hard drive .

In this case the Pi costs $50-$75USD above the cost of pure HD storage, and the [WD MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") costs $50AUS (about $42USD) above the baseline cost.

## XBMC

One of the primary uses of these hard drives is to provide [XMBC](http://xbmc.org/ "XBMC") access to my media collection. So far, I have done this entirely over SMB. Recently the [Ouya](https://www.ouya.tv/ "Ouya") I was using to provide XBMC to the upstairs part of the house decided to die...mostly due to a lightning strike taking out the wired Ethernet. I can't blame it really; the same strike took out the router too.

With it's primary ethernet dead I had to take drastic measures and factory reset the Ouya. It's now running on the wireless ethernet. I did try and connect it back up to the SMB shares, but most likely because I forgot to set up a username and password, they failed - utterly. Lucky the [WD MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") drives also provide NFS and I was able to connect up using that.

Whatever people may say about the [Ouya](https://www.ouya.tv/ "Ouya") as a game console, there is no doubting it is a terrific [XBMC](http://xbmc.org/ "XBMC") front end.

## Conclusion

If you want pure hard fast transfer speeds, decent access to standard GNU Linux software, then choose the [WD MyBook Live](http://www.wdc.com/en/products/products.aspx?id=280 "WD MyBook Live") drives. They are cheap, fast, and expandable.

If you want a general purpose, low power, useful PC...then the Pi is the best choice. Both are good in their domains.