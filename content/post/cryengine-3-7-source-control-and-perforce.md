---
type: post
title: CRYENGINE 3.7 Source Control and Perforce
date: 2015-05-01
tags: ["CryEngine3","Git","Perforce","Source Control","SVN"]
category: General
image: /img/site/category/general.jpg
image-thumbnail: /img/site/category/general.jpg
author: "Ivan Hawkes"
---

In this article I will try to cover the issue of source control, particularly for a CRYENGINE 3.7 project. I will touch on what it is, why you need it, and briefly on how to implement a decent source control system.
<!--more-->

Let's start with the basics, what is source control and why do you need it?

## What is it?

Source control started as a method to control changes made to source code for software, but it's expanded since then and now can be applied to an entire project, including large binaries. In the bad old days, programmers needed to make copies of their entire work folders with potentially thousands of files and label them like so:

* MyProject-good copy
* MyProject-trying-to-add-weapons
* MyProject-wtf-why-doesn't-this-work

When they finished writing the code changes they needed they would then trawl through every file in turn, comparing it to the original or the latest, whatever that meant, and then copy lines of code in-a few at a time. It was error prone and sanity sapping. They eventually came up with the much smarter concept of source control.

**A source control system is a software package that tracks changes to a set of files on your behalf.** It stores copies of every version of a file at each point in time when you ask it to. It can show you the difference between any two versions of the same file if they are text based. Some can also handle binary formats to a limited degree.

In short, using a version control system allows you to 'tag' a set of files with a version number, find out when they changed, what exactly changed, and make good decisions when two sets of file changes conflict with one another.

If you're working on any reasonably complicated software, you want this - bad.

## Why Do I Need It?

In short, because you make mistakes. Your friends make mistakes. Your trusted co-workers make mistakes. Because creating software is hard and being able to roll back to a previous state is golden. Because keeping every different version of an asset you created is priceless.

## What Are My Options?

There's a plethora of different options out there, but for CRYENGINE (and most projects) it will really only boil down to three.

* SVN / Subversion
* Git
* Perforce

## SVN / Subversion

The open source, binary file, version control system of choice for many indie projects. It's cheap - free in fact, is open source, and generally does pretty well with binary files and source code with little need for branching and merging (those who branch a lot, look elsewhere).

A lot of teams are going to start with SVN because it's easy to get going, requires little effort to learn and comes with some very nice tools e.g. [TortoiseSVN](http://tortoisesvn.net/ "TortoiseSVN") which have Windows shell integration. It's not too hard to find outside hosting for SVN, though it is surprisingly expensive. That said, if you have a decent fast connection, you can host an SVN repository on base hardware at home.

SVN is quite good with binaries. It can do a binary diff, leading to a smaller repository, and doesn't require end users to download the entire history - like Git, only the latest file versions. On a large repository with a lot of large files and lots of amendments, like you would expect for a CRYENGINE project, this can be a massive saving in bandwidth.

A one / two man team will do very well just using SVN.

## Git

Git is the programmer's darling. Every aspect of the design of Git is focused on programmers who mainly work with text only files. While this means it is the bee's knees for any sort of code, it does expose a singular weakness. Git is designed around the concept that everyone has a complete copy of the entire repository, and is able to locally branch that, amend it, then push their work back to a central(ish) authority.

For binary files, this means that every single revision, ever, for every single binary file might need to be downloaded before you can start work on the project. This might mean a 40GB download suddenly becomes 420GB because you are downloading the entire history, ever - including all those shitty revisions that lame ass who left the project 12 months ago left behind. There are ways to avoid this, but that requires a lot of discipline and organisation, something most indie projects will be lacking.

That said, Git is by far the best way for programmers to work in a distributed team with each other. For this reason I suggest all the source code is handled with Git, and the assets are handled elsewhere.

There are two major competing online hosts for Git repositories. Github and Bitbucket. I personally favour Bitbucket because of the excellent SourceTree application that works with both Bitbucket and Github, and really any other online host. Also, because Bitbucket will give you unlimited private repositories for 5 or fewer members. That's gold for getting started on indie projects. That said, choose who you like.

Do not decide to store your repository just "on your own hard drive". For god's sake, it takes only a few seconds to push it to an online provider who can share it with your team and ensure it's backed up 24/7/365.

## Perforce

I'm just getting started with Perforce so I don't want to make too many absolute statements about it.

Similar to SVN / Subversion, it can handle binary files with ease. Those huge .PAK files, the large .TIFF assets and .DDS files, Perforce handles those very well.

Like SVN, it's less adept with the source code, though I believe the stream depots are meant to make merging a lot less difficult. I am yet to try this.

Perforce is a degree more difficult to learn than SVN. The manual is hard work to read, and the user interface is less intuitive. That said, it's not exactly hard either. Just take your time and be careful what you click.

There's another issue, Perforce is not open source, not by a long shot. It's a propriety product with a hefty fee attached.

It wouldn't seem to have a lot in it's favour, but...it is the industry standard. If you want a job in gaming then you are going to have to learn Perforce. Also, the company who sell Perforce offer permanent, free licenses for teams with 20 members or fewer. You can download and deploy any Perforce software / server for free, if you have a team of 20 members of less. That should cover most indie projects.

There's another sweetener coming, **Helix**. At this time, they are offering free cloud based hosting of projects on Helix. I don't currently know what the GB limits are, and details are scarce, but this is potentially a windfall for CRYENGINE projects - especially if it includes Git Fusion - a Git based workflow over the top of Perforce.

Finally, it's worth mentioning, there is a DLL you can download which enables CRYENGINE to be Perforce source control aware. It's not a panacea - there will still be issues, but if you download the [PerforcePlugin.DLL](http://www.cryengine.com/community/download/file.php?id=116880 "Perforce Plugin") CRYENGINE will connect to a Perforce server and start to handle source control for you (drop it into the Bin32/EditorPlugins folder).

There's a lot of reasons to like this, and only a few against.

## Which One?

There's no one right answer right now, you actually need two source control systems to do it right. Which two is very much down to you. I personally recommend you use Git for source code and Perforce for binary files e.g. the root folder (including GameSDK, but excluding Code / Source / etc).

While this might seem counter-intuitive, it's actually not. Git is the undisputed champion for source code control, and Perforce beats out SVN for binary control. Making Git try to handle binary files is an exercise in self harm.

If you work on several projects at once there are some further concerns that will complicate your life.

Thanks to Steam, projects all need to look like they are running from a folder similar to:

D:\SteamLibrary\steamapps\common\CRYENGINE

Steam has some very fixed ideas about where your project is located, and we need to work around those. If you use Perforce, and the rest of this article will focus on that objective, it also has some pretty stern ideas about how you do things. Lastly, CRYENGINE itself is a bit fussy about how it all goes together.

I'm going to present a solution that will work for any project, no matter how simple or complex.

## The Problem

I'm a programmer, so I'm involved with a couple of projects at any given time. I need to have a good build and test environment for everything I am working on, without it being too complicated - hopefully.

Each project is potentially running a different version of CRYENGINE.

Steam is a twat and only wants me to have one version of CRYENGINE at a time.

Each version might need a slightly different set of source code and wildly different assets.

I don't want to cut myself every time I switch projects.

## The Solution

I've been through most of the possibilities, and so  I hopefully leave you with the end solution.

Every single project must appear to run from the Steam folder, as CRYENGINE. This means we are going to need to use Windows junctions to fake that. In short, a Windows junction is like a Linux symlink, it simply makes a file or folder appear to the OS as though it is pointing at some other location.

The CRYENGINE Perforce Plugin insists on running from a sub-folder of the executable folder - which is reported as the steam folder, no matter what trickery you manage with Windows junctions. This seems to hold true even when passing in "-root ThisFolder" to override the supposed root folder. This means, for Perforce to work inside of the editor, you need to make it use workspaces that appear to point at D:\SteamLibrary\steamapps\common\CRYENGINE. That's a major pain in the ass if you have several projects.

I hate long path names, and so I'd prefer my projects (Chrysalis) to be located at D:\Chrysalis rather than D:\SteamLibrary\steamapps\common\Chrysalis.

There is an implicit assumption that all your assets, extra files, whatever will all branch off the root CRYENGINE folder. Things simply work a lot better if you stop resisting this assumption. Mix your asset files in with the release files, place your design files into your D:\CRYENGINE folder (or wherever it is). Use your packaging scripts to simply filter out the TIFFS, .Max, .Maya, etc and only pack the final shipping assets. If you can accept this as the status quo, things will progress a lot easier. Actually, the whole workflow seems to work better this way - CGF files default to outputting from the same folder as the live asset - go with the flow.

I can supply you with a packing script that will package all your assets, while avoiding packaging any files you wish to keep private. It's simple XML and can be customised to your needs.

So, how do we make it all work for a person who wants to work on multiple projects?

First, and really important - don't just let CRYENGINE install wherever. Make a new steam folder as a folder on your development drive (you keep development separate from boot and apps and shit, right?). Ensure there are no pesky spaces in the file path. I use D: as my development drive - all further references will assume D:\ is where you place your development work.

Install CRYENGINE to D:\SteamLibrary. There's little reason not to use the default here.

The actual installation will be to D:\SteamLibrary\steamapps\common\CRYENGINE.

I have a project called 'Chrysalis'. For now, let's assume it's pretty much exactly the same as the default 3.7 install. You can copy CRYENGINE to D:\Chrysalis, then drop to a command prompt and do the following:

```dos
MKLINK /J D:\SteamLibrary\steamapps\common\Chrysalis D:\Chrysalis
```

This is going to add a new folder to the steam apps folder that points back to the real Chrysalis folder on D:\Chrysalis. I usually need to make a few of these, they aren't used right away, but later on when I need to switch where CRYENGINE apparently points to, that's when I come back and rename one or more of these.

Fire up Perforce, connect to the server, set up your client, etc. See the Perforce website for how to do all this. I'm not offering beginner tutorials on source control.

Create a new workspace that points at D:\SteamLibrary\steamapps\common\CRYENGINE. Give it a good name, and hop into CRYENGINE Editor. Type the name into the workspace settings for Perforce. At this point, Perforce plugin in CRYENGINE should be happy to control files under that workspace.

So the bad news is that no matter what you do, CRYENGINE Perforce plugin wants a workspace that is under the CRYENGINE root install folder in Steam.

The good news is you can set this up as a Windows junction, and simply rename / move it around as needed.

To switch from one project to another you will need to reset the Windows junction, D:\SteamLibrary\steamapps\common\CRYENGINE. Move or rename this as needed to point at the repository you require. This can be as easy as renaming one junction file to another, if you set them up in advance e.g.

```dos
REN CRYENGINE CRYENGINE-REAL
REN Chrysalis CRYENGINE
```

## Summary

With just a little bit of file system voodoo, and installation of a couple of source control systems, you can protect the most important thing in the world, your work - your time / effort.