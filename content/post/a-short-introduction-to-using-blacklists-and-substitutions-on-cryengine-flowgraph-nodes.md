---
type: post
title: CRYENGINE Flowgraphs - Blacklists and Substitutions
date: 2015-03-20
tags: ["CryEngine3","FlowGraph","Flowgraph","Game Programming"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

On a large project, such as a game built using CRYENGINE, structure, clarity and consistency can provide decent gains in productivity by reducing the time it takes to comprehend and perform simple tasks. Blacklists and substitutions for Flowgraph Nodes are one way to improve these parts of your project.<!--more-->

Even an empty CRYENGINE project comes with a large number of supplied FlowGraph nodes, typically from CryAction, CryCommon or CryInput. Your project is likely to add dozens or even hundreds more. These can add a lot of useful functionality to your project but they are also a prime source of inconsistency.

The Flowgraphs that are shipped with the EaaS SDK were created over a period of ten years or more and often do not have a consistent naming scheme. Further, some input / output names have changed over the years, which can cause older projects to fail when loading the XML containing those Flowgraphs. Ideas about how the namespace should be arranged have also changed, quite substantially in the case of AI and audio.

CryTek have provided a means for development teams to rearrange and edit the names, input, and output ports for all the Flowgraph in their current and previous projects. You can use this to rename existing Flowgraph nodes and re-wire any old Flowgraph that depends on the old names. The way to do this is by creating two XML files, **FlownodeBlacklist.xml** and **Substitutions.xml**.

The first file we'll cover is **FlownodeBlacklist.xml** - which provides two key functions.

* the ability to remove any Flowgraph node from the engine
* the ability to rename any Flowgraph node

You'll find **FlownodeBlacklist.xml** in your **GameSDK/Libs/FlowNodes** folder. If you haven't yet extracted this from the **GameSDK/GameData.Pak** file, then you should extract a copy of it now from the PAK file.

The file is a simple XML based file that is read at runtime by CryAction. It requires a top level tag **<Blacklist>** and supports two tags below that level.

Over time some features become deprecated or undesirable to use or fall out of favour to a different method of achieving the same goal. The first tag you need to know about is <Rem> which is used to remove an unwanted Flowgraph node from the engine.

e.g.

```xml
<Rem class="AI:AIAwareness" />
```
This would remove the AI:AIAwareness node from the list of nodes available for placement in Flowgraphs. Add one tag for each Flowgraph node you wish to remove.

The second tag is <Ren> which allows you to rename an existing node

e.g.
```xml
<Ren class="AI:AIActiveCount" newClass="AI:ActiveCount"/>
```
In this case the AI:AIActiveCount node is renamed to AI:ActiveCount.

New projects may not have large amounts of existing Flowgraph to convert over to the new names, but older projects would likely see large amounts of breakage from removing and renaming nodes using the blacklist. That's where the **Substitutions.xml** file comes into play.

**Substitutions.xml** is used to convert your existing Flowgraph logic from one naming scheme to another dynamically while loading levels. By placing suitable entries into this file, you can ensure that older work will seamlessly switch to using your brilliant and insightful new naming scheme for the Flowgraph nodes in your project (including renaming CryAction, etc, nodes).

You'll find **Substitutions.xml** in your **GameSDK/Libs/FlowNodes** folder. If you haven't yet extracted this from the **GameSDK/GameData.Pak** file, then you should extract a copy of it now from the PAK file.

The file begins with a top level tag **<Substitutions>**. Under that tag will be zero or more <Node> tags, each of which declare how you want to remap older Flowgraphs to your new naming scheme

e.g.

```xml
<Node OldClass="entity:MissionObjective" NewClass="entity:MissionObjective">
	<InputPort  OldName="DisableObjective" NewName="Deactivate" />
	<InputPort  OldName="EnableObjective"  NewName="Activate" />
	<OutputPort OldName="DisableObjective" NewName="Deactivated" />
	<OutputPort OldName="EnableObjective"  NewName="Activated" />
</Node>
```

In this example we are going to rename all occurrences of entity:MissionObjective to entity:MissionObjective, which may seem a little pointless - but is required because this example also shows how to rename ports.

You'll notice the port 'DisableObjective' has been rewired to be 'Deactivate' instead, and 'EnableObjective' has been rewired to use 'Activate' instead. This is to match changes to the port names in the c++ code. If any old graphs used the old port names, they wouldn't work correctly with the updated GameSDK DLL. This applies to both input and output ports.

Let's take a look at another example which has remapped a value as well as the port names.

```xml
<Node OldClass="Physics:ActionImpulse" NewClass="Physics:ActionImpulse">
	<InputPort OldName="impulseDirection" NewName="impulse" RemapValue="1"/>
	<InputPort OldName="Momentum" NewName="angImpulse" RemapValue="1"/>
</Node>
```

Notice in this example the 'RemapValue' key which is being used to change the values found in the old 'impulseDirection' and 'Momentum' keys (to a new value of '1') while simultaneously mapping the connectors to new ports named 'impulse' and 'angImpulse'.

Finally, let's look at the simple example, where you just want to rename a node without changing any port names or forcing new values into existing values.

```xml
<Node OldClass="Start" NewClass="Game:Start" />
```
There we are simply renaming 'Start' to 'Game:Start', making it more consistent with the rest of the engine.

### Summary

These two XML files give you total control over how the Flowgraph nodes are presented to your team, including those found in CryTek code, and a means to seamlessly update any existing work to the new standards you set down.