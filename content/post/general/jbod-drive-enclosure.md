---
author: Ivan Hawkes
categories:
- Hard Drives
- Linux
date: '2025-05-25'
title: New JBOD, Old Drives
---

I purchased a new JBOD enclosure to deal with my pile of small hard drives. Mergerfs and SnapRaid are used to provide parity and to merge the filesystems on Linux.

<!--more-->

I have what most people would call "a lot" of hard drive storage space here in my humble home. 

Adding up all the loose drives (not counting boot drives, which adds another 7TB) there is 24TB. But the thing is...it used to be more like 35TB; I had three drives die over the last couple of years. It's fine, they died of old age, in their sleep and I definitely didn't smash their platters with a hammer to prevent any form of recovery.

The dead drives were holding my games library and my backups. I've since moved the games to an SSD and been living on the edge of ruin with regards to backups.

I needed more drive space, but it's stupid expensive still...so, what about a dirty hack? Yes please!

I've added a [JBOD](https://www.terra-master.com/products/d4-320) (Just A Bunch of Disks) to my media server. It's a modest sized one with room for four drives which it supports by supplying 4 x USB 3.1 devices on the backplane. A single connection to the host PC supports all four drives. At $320 AUD it was pretty affordable, and I like how neat the solution is on my desk.

Great! But...that's not RAID, I'm still likely to lose all my data...AND...the media folders still don't fit neatly on each drive. There's a bunch of 'wasted' space on each. Time to access what I have.

There's two 3TB drives (13 years old, yikes, but still good for a little longer), and 1 x 8TB, and 1 x 10TB.  Problem is the 10TB is the backup for the 8TB and the 2 x 3TB were in old 1 gbit NAS cases (WD MyBook Live) and no longer in service. I simply wasn't making good use of them.

By slapping them all into the caddy and using the largest as a parity drive I can take that 8TB of useful space and make it into 14TB.

How hard can it be? Really easy! I run Debian 13 Trixie right now on an old Dell Optiplex with ProxMox hosting it as a VM. Typical nerd stuff.

The drives appear as USB devices on the ProxMox server. I'm passing those into the VM as USB devices. Debian sees them as normal drives which I mount.

Mergerfs takes the three small drives and using FUSE and the Linux filesystem is able to make them appear as a single mount point. You can fine tune which drive the files are stored on as they are added. I'm splitting my music, tv shows, anime and movies across the drives for now. Later they will just fill in on whichever drive has the most space.

The final and largest drive is used for parity. If a single drive dies, you can replace it and reconstruct the files using the partiy drive. SnapRaid isn't like typical RAID, it doesn't run all the time. You run it at intervals you determine as a cron job.

Many people have it set to run once a week, which is completely fine for a media server. The files are large, stationary and rarely change. Snapshotting it once a week leaves you with up to six days of exposure for data loss.

I'll set it to run every third day for now since mine will also be storing my OS backups, ISO images, software downloads that are hard to get, etc.

Over the next few months, as funds become available, I can look into replacing the knackered old 4TB drives with new 10TB ones. That gets me to 28TB with very little waste, with a ceiling of 30TB for now. At any time I could swap out the 10TB drive with 24TB and eventually cap out at 96TB of storage.

For a case that can store four drives it is perhaps a bit steep. It doesn't have an OS or operate as a NAS, but it doesn't have to do that since my 10 year old Dell Optiplex is doing that job perfectly. But what it's really doing is letting me take all my old drives and get them into use again, giving me 6TB more space for now and 20TB more in the long run. It cost less than a 4TB hard drive, so I'd say it's good value.