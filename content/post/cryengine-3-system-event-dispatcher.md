---
type: post
title: CryEngine 3 System Event Dispatcher
date: 2014-03-15
tags: ["CryEngine 3","CryEngine3","Dispatcher","event","listener","Software Development"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

Earlier this week I wrote about CryEngine listener classes in a brief overview. I intimated that they are an excellent way to write code against the CryEngine SDK and today I want to go into more depth.
<!--more-->

I briefly covered the 40 odd listeners that I was able to locate in my article [Introducing CryEngine 3 Event Listeners](http://ivan.hawkes.info/2014/03/07/introducing-cryengine-3-event-listeners/ "Introducing CryEngine 3 Event Listeners"). Today I would like to revisit just one of those listeners, **ISystemEventListener**.

## The Plugin SDK

But first, a little background. I'm a big fan of the [Plugin SDK](https://github.com/hendrikp/Plugin_SDK "Plugin SDK"). Being able to write code that just slips into place without requiring changes to the existing codebase is...well, awesome. CryEngine SDK is a moving target, and the less changes I need to make to the existing codebase, the easier my job will be in the future. Plugin SDK does an excellent job at making that happen, though it's up to you as to how well it happens.

My first attempts to make a camera work with the Plugin SDK were...let's say not good. I felt constricted by it's initialisation routines and much of my code ended up entangled inside the template Plugin SDK code. It took a little re-factoring, and a little more knowledge of the internals of CryEngine SDK, but I finally made my peace with Plugin SDK.

Before we get started, let me just mention the motivation that pushed me this way. Just recently CryTek announced that they will for the first time support a fully functional version of the CryEngine on Linux. Unfortunately, Linux does not support Windows DLLs and so nothing I write using the Plugin SDK will be available for a Linux version of my client. That's clearly unacceptable, so I went about finding a way to have my cake and eat it too.

My initial code written using the Plugin SDK had a few needs:

* an initialisation routine
* a shutdown routine
* and due to my own stupidity, some globals were defined here

The Plugin SDK kindly provides a callback to start any initialisation you require, but for my needs it was being called a little too soon in the start-up process. I had added some calls to filter the input maps, but those were not available at the time my init routine was being called. Initially I moved the Plugin SDK initialisation routines further down inside the CryEngine Game SDK code,  but as I dug a little deeper I found a way to do it without resorting to such means.

## ISystemEventListener

```cpp
struct ISystemEventListener
{
	// 
	virtual ~ISystemEventListener(){}
	virtual void OnSystemEventAnyThread( ESystemEvent event,UINT_PTR wparam,UINT_PTR lparam ) {}
	virtual void OnSystemEvent( ESystemEvent event,UINT_PTR wparam,UINT_PTR lparam ) = 0;
	// 
};
```

It doesn't appear to be very much from the definition, but don't be fooled, this is truly an intrinsic part of the CryEngine.

You can disregard pretty much everything except for the **OnSystemEvent** function which will be called within a listener at key points in program execution.

The **OnSystemEvent**  works a little bit like the Windows event handler; it even has similar parameters. What's most important about this observer however is the messages it passes down to it's listeners. Each call on this function passes an **ESystemEvent** to the receiving function. If you hook onto this observer, you can receive a large number of incredibly useful events. This includes things like level loading, game-play start / init and finish,  pausing, and system shutdown. I'm just going to cover **ESYSTEM_EVENT_GAME_POST_INIT** and **ESYSTEM_EVENT_SHUTDOWN** since for me these are the most important.

Now, as I mentioned, the Plugin SDK calls my init too soon and worse still will not be available on Linux. Both of these are solved by **ESYSTEM_EVENT_GAME_POST_INIT**. In order to use it I need to register a listener on the ISystem interface. It's not too hard, all you need to do is the following inside an init routine:

```cpp
void CThirdPersonView::Init()
{
	CRY_ASSERT (gEnv);
	CRY_ASSERT (gEnv->pGame);
	CRY_ASSERT (gEnv->pGame->GetIGameFramework());
	CRY_ASSERT (gEnv->pGame->GetIGameFramework()->GetISystem());
	
	// Register Game Objects
	if (gEnv && gEnv->pGame && gEnv->pGame->GetIGameFramework())
	{
		// Listen for system events.
		gEnv->pGame->GetIGameFramework()->GetISystem()->GetISystemEventDispatcher()->RegisterListener (this);

		// Listen for game events.
		gEnv->pGame->GetIGameFramework()->RegisterListener (this, "ThirdPersonCamera", FRAMEWORKLISTENERPRIORITY_DEFAULT);
	}
}
```

That's a lot of code for basically two lines. The one we're interested in is:

```cpp
gEnv->pGame->GetIGameFramework()->GetISystem()->GetISystemEventDispatcher()->RegisterListener (this);
```

which attaches the **this** pointer as a listener for **ISystemEventListener**. From here we just need to implement the **OnSystemEvent** function and we can eavesdrop on all the cool things happening inside CryEngine.

For this example I'll use the third person camera code I am working on.

```cpp
void CThirdPersonView::OnSystemEvent(ESystemEvent event, UINT_PTR wparam, UINT_PTR lparam)
{
    switch (event)
    {
    case ESYSTEM_EVENT_GAME_POST_INIT:
    {
        RegisterCvars();
        RegisterActionMaps();
    }
    break;

    case ESYSTEM_EVENT_SHUTDOWN:
    {
        Shutdown();
    }

    break;
    }
}
```

Here you can see we're receiving game events and responding to a pair of them. In this case, an init event and a shut-down event. It is this pair of events that frees us from the Plugin SDK. They replace the equivalent structures provided within the Plugin SDK, but do so in a platform independent manner. Better yet, the init is called at a time when all of the SDK features are ready.

As long as I am able to call the init routine provided above I can ensure both initialisation and destruction for any code I wish to add to the game SDK. I can't stress how important it will be to decouple your code from the base code that ships with the CryEngine SDK.

This example registers a few CVARS, sets up some action maps and filters for those maps, and provides for clean-up when shutting down. Nothing too exciting, but it is the backbone of any extension. You can easily grab other events from there or register further listeners as needed. I haven't shown any of that code because it is trivial.

Have a look at the new re-factored [Third Person Camera](https://github.com/ivanhawkes/Plugin_Camera "Third Person Camera") code to see the how this can help your projects. The main body of the code is now (almost) completely decoupled from both the Plugin SDK and the stock Game SDK.

## Summary

Registering a listener for **ISystemEventListener** can give you deep access to CryEngine while allowing you to stay decoupled.