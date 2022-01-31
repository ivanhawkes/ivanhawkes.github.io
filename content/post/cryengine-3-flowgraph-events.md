---
type: post
title: CryEngine 3 - Flowgraph Events
date: 2013-06-27
tags: ["C#","CryEngine 3","Events","FlowGraph","Programming"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

As you begin to learn how to program for CryEngine 3 you will run into a lot of barriers. The code is dense, filled with magic numbers, brimming with pre-processor code, macros, and templates and all sorts of traps.
<!--more-->

My only advice for this is to bear down and work through it. In time they will all start to make sense.

I'm currently working on producing my first few pieces of code that will provide a few useful features for the engine. I'm attempting to add a feeling of time and change in the form of days, seasons, tides and time of day parameters that are dynamic based on the current time of year. It's a fairly small set of additions but they should help to increase the dynamic feel of the world for the players.

In order to do this I will need to make a few additions to the code base. I'm choosing to do this using a slightly modified version of the [plug-in engine](https://github.com/hendrikp/Plugin_SDK "plug-in engine") from [Hendrik](https://github.com/hendrikp "Hendrik"). The changes I made are very minor, and mainly play into my OCD need for everything to be 'just so'.

The first stop is creating a new set of flowgraph nodes that will help implement the desired changes. Helpfully, the [plug-in SDK](https://github.com/hendrikp/Plugin_SDK "plug-in SDK") provides a template of your project with the major functionality already implemented. There is also a [fork of this project](https://bitbucket.org/shatteredscreens/plug-in-sdk "plug-in SDK") which I have created which adds a few little tweaks and improvements. You can use either to follow along as all the changes are minor tweaks for now.

The first wall you are going to hit when you attempt to create your own new flowgraph nodes if the event handling. It's not very well documented and although fairly intuitive has a few little gotchas laying in wait. Let's start by listing all the known event types and a brief description of what they do (as known at time of writing).

# Event Types

**eFE_Update**

This event is called when the node is updated. Typically this is for each game frame while it is in use.  You must tell the System that you want your node to be updated by using the SetRegularlyUpdated function of the IFlowGraph object and passing in TRUE. You can also tell it not to update the node by calling SetRegularlyUpdated  and passing in FALSE.

If you have a handler for eFE_Suspend it should call this with FALSE. A handler for eFE_Resume should call this with TRUE.

**eFE_Activate**

If one or more input ports have been activated then you will receive this event. You will need to make a call on each port of interest and determine which (of possibly many) have been called. This is the heart of the processing system.

This will typically be called once per event. It may find multiple ports are open with each invocation. You should check each in turn and process accordingly.

**eFE_FinalActivate**

This will be called once after all the eFE_Activate events have been pushed out.

**eFE_PrecacheResources**

This is called after flow graph loading to allow you to precache resources inside flow nodes. I have seen it after initialisation has been completed and prior to processing beginning.

**eFE_Initialize**

Initialise can be sent at several different times. If you make changes to the node it might require a new initialise call e.g. changing the use of input / output ports.

**eFE_FinalInitialize**

Potentially called at the end of all initialise calls, but it may not always be called (observed).

**eFE_SetEntityId**

This event is sent to set the entity of the FlowNode. It might also be sent in conjunction (pre) other events (like eFE_Initialize). Generally you will use this as a chance to make a member copy of the entity ID for later usage.

**eFE_Suspend**

Indications are that nodes can be suspended and resumed, though I have not yet determined when and why.  Currently I execute

```cpp
pActInfo->pGraph->SetRegularlyUpdated (pActInfo->myID, false);
```

in response to this event.

**eFE_Resume**

Used to come back out of suspension. If you used 'SetRegularlyUpdated' to sleep the node then you might need to reverse this operation now.

Currently I execute

```cpp
pActInfo->pGraph->SetRegularlyUpdated (pActInfo->myID, true);
```

**eFE_ConnectInputPort**

This is called once an input port is connected to the node.  At the end of connecting and disconnecting all the ports an initialise is called.

**eFE_DisconnectInputPort**

This is called once an input port is disconnected from the node.  At the end of connecting and disconnecting all the ports an initialise is called.

**eFE_ConnectOutputPort**

This is called once an output port is connected to the node.  At the end of connecting and disconnecting all the ports an initialise is called.

**eFE_DisconnectOutputPort**

This is called once an output port is disconnected from the node.  At the end of connecting and disconnecting all the ports an initialise is called.

## The Event Cycle

On starting the editor, if you have any flowgraphs that are global you can expect a series of 'connect' and 'disconnect' events to fire off. Once those have completed an 'initialise' is fired followed by a 'precache'. This should repeat if you then load a level into the editor.

Once you begin testing the level the flowgraph nodes will respond to any events that you have wired to them.

Presently there seems little reason to respond to connect events.

The suspend and resume events seems mostly concerned with setting the node into a low power state. If you do this then be sure to also push it into a wakeful state on initialise.

The pre-cache event is only used once in the sample code for a colour gradient. It appears to load the appropriate colour into a texture resource, ready for use when called.

## Future Additions

This article is incomplete at present, more a place to collect my thoughts as I work through the code. Look for updates at a later time.