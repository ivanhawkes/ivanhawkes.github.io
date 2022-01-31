---
type: post
title: How to Make .PAK Files With Your Assets
date: 2013-07-25
tags: ["Asset Management","CryEngine3","Games","Software Development"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

Something that doesn't seem to receive much coverage is what to do with all your awesome assets once you've made your game. You're going to need to ship them to end users, and the best way is within a .PAK file.<!--more-->

The tricky part is how to make those .PAK files.

There is already a .NET app that can do the packing for you, but I like things old school. I like scripts and I like to run on the bare metal with as much control as possible. The documentation mentions you can use the RC (resource compiler) to pack for consoles...but it alluded that you might be able to use it for more. I spent a few hours reading up about the resource compiler to see just what it could do. It turns out it can do everything you should need if you're willing to write a few XML files.

For my project I need to be able to create a new script .PAK file and another few .PAK files for my various sorts of resources. I wanted them to have names similar to the default ones that ship with the SDK, but not the same, so they don't clash and overwrite each other. I also wanted to be able to just build them again whenever I needed them with low effort on my part.

Before we start, you will need to be familiar with the DOS Command line and have ensured the RC.EXE is somewhere in your Windows path. There is plenty of help for both of these topics available via Google.

Let's start with the SCRIPTS.PAK file. My version of this file will be called CORESCRIPTS.PAK to avoid conflicts. The first thing we will need is to create a batch file that can be called which will invoke the resource compiler.

NOTE: You can download all the example files from [MediaFire](http://www.mediafire.com/download/3zaa5e4dbdi4894/PackagingExamples.rar "Example Files").

For example:
```dos
rc /job=CoreSystemScriptPAK.xml /p=PC /threads=8 > CoreSystemScript-PAK.log
```

Whenever you call this batch file it will invoke the resource compiler and start compiling the job called **CoreSystemScriptPAK.xml** telling it to compile for the PC version. I have a quad core PC so I tell it to use 8 threads to put all the cores into full use. The output is capture to a log file named **CoreSystemScript-PAK.log** which I can view in a text editor looking for errors.

If you have your path correctly set you will be able to place this batch file into your **c:/cryengine3/game** folder (or wherever your install is) and double click it to run the packaging code.

This will of course require you to also drop a file called  **CoreSystemScriptPAK.xml** into the game folder. Here's my current one as a sample.

```xml
<RCJobs>
    <!--
DefaultProperties - these can be overriden from command line.
pak_root - defines the output folder for PAK files (required for NAnt build system)
-->
    <DefaultProperties cry_root="c:\cryengine3" game="Game" engine="Engine" target="TempRC\${p}" pak_root="OutRC\${p}" enable_cuda="true" />
    <Properties xml_types="*.animevents;*.cdf;*.chrparams;*.dlg;*.ent;*.fsq;*.fxl;*.ik;*.lmg;*.mtl;*.setup;*.xml;*.node;*.veg" non_xml_types="*.ag;*.gfx;*.png;*.usm;*.fev;*.fsb;*.fdp;*.sfk;*.ogg;*.txt;*.anm;*.cal;*.grd;*.grp;*.cfg;*.csv;*.lua;*.dat;*.ini;*.xls;*.as;*.lut;*.mp2;*.mp3;*.xma" source_game="${cry_root}\${game}" target_game="${target}\${game}" src_engine="${cry_root}\${engine}" target_engine="${target}\${engine}" pak_game="${pak_root}\${game}" pak_engine="${pak_root}\${engine}" />
    <!-- Choose an image compressor based on CUDA support availability -->
    <if enable_cuda="true">
        <Properties imagecompressor="NvTT" />
    </if>
    <ifnot enable_cuda="true">
        <Properties imagecompressor="NvDxt" />
    </ifnot>
    <CleanJob>
        <Job input="" targetroot="${target}" clean_targetroot="1" />
    </CleanJob>
    <CopyJob>
        <Job sourceroot="${source_game}\Entities" input="*" targetroot="${target_game}\Entities" copyonly="1" />
        <Job sourceroot="${source_game}\Scripts" input="*" targetroot="${target_game}\Scripts" copyonly="1" />
        <Job sourceroot="${src_engine}\Shaders" input="*.ext;*.cfx;*.cfi;*.txt" targetroot="${target_engine}\Shaders" copyonly="1" />
    </CopyJob>
    <PakJob>
        <if p="PC">
            <!-- Create a PAK file for scripts and their entities -->
            <Job sourceroot="${target_game}" input="Entities\*.*" zip="${pak_game}\CoreScripts.pak" />
            <Job sourceroot="${target_game}" input="Scripts\*.*" zip="${pak_game}\CoreScripts.pak" />
        </if>
        <!-- Create a PAK file for Shaders -->
        <Job sourceroot="${target_engine}" input="Shaders\*.ext;Shaders\*.cfi;Shaders\*.cfx" zip="${pak_engine}\CoreShaders.pak" />
    </PakJob>
    <Run Job="CleanJob"/>
    <Run Job="CopyJob"/>
    <Run Job="PakJob"/>
</RCJobs>
```

It looks a little more intimidating than it actually is. Head over to the [official documentation](http://freesdk.crydev.net/display/SDKDOC3/Compiling+Assets+for+Multiple+Platforms "Compiling Assets for Multiple Platforms") for a minute to see what all that gubbins is doing.

Let's just hit the important things to get you started, since the rest you can figure out by reading the docs. In the DefaultProperties section if your cry_root is not at "c:\cryengine3" then update this entry to point to the root folder. Now, skip over most of the boilerplate XML and take a note of the three jobs I have defined - cleanjob, copyjob and pakjob.

**Cleanjob** provides a convenient way to clean up the stray files for a job. It's pretty much stock in this implementation.

**Copyjob** is going to copy just the files I want over into the packing folders. In this case I am after the Entites, Scripts and Shaders folders.

**Pakjob** does the hard work of packing the target files into a .PAK file for you. You can see I added three jobs, one for the Entities, one for the Scripts and a final one for the shaders.

The three commands at the bottom run the three jobs I have defined in that specific order. This will clean my packaging directory for me, copy over the current set of files I am interested in, and pack them all into a shiny new .PAK file which can be shipped to testing / end users / etc.

There's a second pair of examples which are more complex, but follow the same basic principle. These example files will pack all the 'core' files for me. I am keeping all my work separate from the CryEngine sample files and placing them under sub-folders, generally named 'core' or 'user' or 'team' in these examples. You are free to place your files wherever you wish and amend the examples as needed.

If you flick through the **CoreSystemPAK.XML** file you should be able to see how it sets the base properties for my assets, converts any TIFFs I need to DDS files, and copies files into .PAK files of my choosing. The end result of running these two batch files will be a set of .PAK files with all of my present assets neatly packed into them at the correct quality settings. I will have five .PAK files :

* CoreGameData.PAK - levels
* CoreMaterials.PAK - materials
* CoreObjects.PAK - objects
* CoreScripts.PAK - scripts / entities
* CoreTextures.PAK - textures

It is quite simple to extend these for when I add music, animation, sounds and the like.

There's a little bit of reading required upfront to create these files, though hopefully not too much now you have the examples to work from. The time you spend setting this up early in your project will pay you back tenfold over numerous release iterations.

Benefits of this method over using [DRHEVEL](https://github.com/returnString/Drehevel "DRHEVEL") are:

* total control - you can do anything the RC can do using this
* you can book these files into source control
* fast and clean - once setup a new release is a double click away or the command line if you want to make it part of an automatic build procedure
* compatibility - no issues with ZIP formats
* all textures are known to be compressed to the correct format for shipping

[DRHEVEL](https://github.com/returnString/Drehevel "DRHEVEL") can get you most of the way, but if you need that little more control then give this method a try.