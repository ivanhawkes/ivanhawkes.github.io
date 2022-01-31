---
type: post
title: Switching to CRYENGINE 5.3 New Entity System
date: 2017-01-08
tags: ["C++","Chrysalis","CRYENGINE 5.2","CRYENGINE 5.3","Game Programming"]
description: "Changing over the Chrysalis code to CRYENGINE 5.3."
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

In this article I will cover the changes I made to [**Chrysalis**](https://github.com/ivanhawkes/Chrysalis) for the release of CRYENGINE 5.3. Some were required due to old code being deprecated, others were simply improvements over the previous way of doing things.
<!--more-->

A lot revolved around the entity system, entity events, and game objects. I hope to reveal all the stupid mistakes I made as I went through the code, getting it to build again; a process that took me about 10 days part time. That's a long time to go without being able to run the resulting code, so I had to unwind a few things I'd expected might work, or because my understanding of them changed. Let's get started!

The biggest changes that CRYENGINE 5.3 brought, at least in my opinion, were **Schematyc**, **plugins** and the re-factored **entity component system**. While Schematyc is open to the end user and adds some much needed extra functionality, the entity component changes are more subtle and unlikely to ever be noticed by end users or other teams members who aren't coders. I won't be covering Schematyc this time, because I haven't yet opened up my code to take advantage of this new feature; that will come in a later article. Instead, there's going to be a series of comments and observations on code changes related to the entity component system and plugins.

I've bundled all of the code changes into a [single commit](https://github.com/ivanhawkes/Chrysalis/commit/6dbf1ff8b112165ad2e8e62d7f4babcd74cbad6a) on my [Github repository](https://github.com/ivanhawkes/).

## Component Entity System Improvements

CRYENGINE technically already had a component entity system, but it was a mess, confusing, poorly documented and in need of a massive overhaul. It's gotten a lot of love this release.

Registration of the components now uses a 128 bit GUID instead of a simple string. Components can be added to entities using template functions, which is a much better and type-safe method. Components are now able to have their own set of properties which are exposed to the editor. It is even possible to have several components of the same class on an entity, though I have not yet tried this and it might be somewhat experimental still.

Let's take a look at a simple case where an old game object piece of code is updated to be a shiny new **IEntityComponent**. The **AnimatedDoor** component is nice and simple and will do to illustrate the changes required. Scroll done the lengthy commit until you reach CAnimatedDoor.h.

Quick and easy, we just need to add a new pair of headers here for the component entity system.

```cpp
#include <CryEntitySystem/IEntityComponent.h>
#include <CryEntitySystem/IEntitySystem.h>
```

The class declaration changes slightly, removing the old **CGameObjectExtensionHelper** template and using simple clean inheritance from **IEntityComponent** and **IEntityPropertyGroup**.

```cpp
class CAnimatedDoorComponent : public CGameObjectExtensionHelper<CAnimatedDoorComponent, CNativeEntityBase>, public IInteractionContainer
```

becomes

```cpp
class CAnimatedDoorComponent : public IEntityComponent, public IEntityPropertyGroup, public IInteractionContainer
```

Whereas previously, we had to declare some enumerations in order to access properties, those are no longer required, so snip snip...they're removed.

We add a definition for our class / component that allows it to be unique, identifiable by the editor, and instantiated in code.

```cpp
CRY_ENTITY_COMPONENT_INTERFACE_AND_CLASS(CAnimatedDoorComponent, "AnimatedDoor", 0xD246E11FE7E248F0, 0xB512402908F84496)
```

Be sure when adding this line to your class that you generate a new unique GUID or it will conflict with other components and weirdness will ensue.

Next up, we need to define a few functions to override the virtual functions in IEntityComponent. You can jump to the code for that class to see a whole list of them, but for now we are only interested in the most important ones.

```cpp
// IEntityComponent
void Initialize() override;
void ProcessEvent(SEntityEvent& event) override;
uint64 GetEventMask() const { return BIT64(ENTITY_EVENT_START_LEVEL) ' BIT64(ENTITY_EVENT_RESET) ' BIT64(ENTITY_EVENT_EDITOR_PROPERTY_CHANGED) ' BIT64(ENTITY_EVENT_XFORM_FINISHED_EDITOR); }
struct IEntityPropertyGroup* GetPropertyGroup() override { return this; }
// ~IEntityComponent
```

**Initialize** replaces the old pair of **Init** and **PostInit** methods. Init was basically empty code most of the time, since a lot of the hard work couldn't be done until PostInit in any case. Init was frequently just storing the **GameObject** pointer for you and allowing networking, and that's not needed with the new entity system.

Instead, just do all your initialisation in **Initialize**. You might find some functions and code you can't use any more, due to the missing parameter **IGameObject* pGameObject**. We'll get back to that guy a little later since it runs to the very core of the problem with switching over.

**ProcessEvent** is pretty much unchanged, except for how you indicate which events you wish to process. Each component can now indicate the event's it is interested in by providing an override for the **GetEventMask** function. My current understanding is that the bitmask returned here is checked each time an event is raised and if it's set, the component will receive that event. **EDIT:** Filip has just informed me that GetEventMask is only checked when a component is added, so if you need to toggle an event on and off you will need to subscribe to that event when adding the component and deal with ignoring it internally as needed. A better method may be available in a future release.

If you're looking to support properties, then good news, it just got a lot simpler and smarter. Provide an override for the **GetPropertyGroup** function and return a pointer to an implementation of **IEntityPropertyGroup** which should generally be the **this** pointer. You will need to declare support for that interface on your class declaration and provide a pair of overrides to handle the actual work.

```cpp
// IEntityPropertyGroup
const char* GetLabel() const { return "AnimatedDoor"; };
void SerializeProperties(Serialization::IArchive& archive);
// ~IEntityPropertyGroup
```

**GetLabel** gives your component a group in which to place it's properties, presumably acting like a sort of namespace to prevent collisions. Just give it a sensible fairly unique name and you are done.

**SerializeProperties** is a serialise routine and is how you store your properties to disk. It looks a lot like any other serialise routine so you shouldn't have too much trouble there.

The great thing about this is that properties are just declared like any normal class member, and exposed to the editor through a few lines of code e.g.

```cpp
void CAnimatedDoorComponent::SerializeProperties(Serialization::IArchive& archive)
{
	archive(Serialization::ModelFilename(m_geometry), "Geometry", "Geometry");
	archive(m_mass, "Mass", "Mass");

	if (!archive.isInput())
	{
		Reset();
	}
}
```

Which brings me to a point brought up in the recent videos featuring **Collin Bishop** and **Filip Lundgren**. There they mention that using decorators such as **Serialization::ModelFilename** require you to include an extra header file which might otherwise not be needed. If you're having compilation issues after adding a decorator, then make sure to add **#include <CrySerialization/Decorators/Resources.h>** and your problem should vanish.

Scroll up to the AnimatedDoorComponent.cpp file section in the commit and we'll cover the remaining changes needed here.

You'll need a pair of new include files.

```cpp
#include "Plugin/ChrysalisCorePlugin.h"
#include <CrySerialization/Decorators/Resources.h>
```

The name of the first include will vary for your project. I basically stole it from the ThirdPersonShooter template. It has code needed for registering components. Look for the file that defines **IEntityRegistrator**. The second include is because I want to use decorators in my Serialize routine to tell the editor to load geometry.

Component registration is now a single call along the lines of this:

```cpp
RegisterEntityWithDefaultComponent<CAnimatedDoorComponent>("AnimatedDoor", "Doors", "Light.bmp");
```

There you can see I register the component using the **RegisterEntityWithDefaultComponent** template which is declared and defined in **IEntitySystem.h**.

**NOTE:** It is quite important to make a note here that there is a function with the same name declared in the plugin header. Do not use that function for the new entities - it's meant to be used for the old style game object extensions. Things will go wrong if you mismatch this code.

You might also notice I am using the "Light.bmp" icon for my entity. It's because I suck and haven't bothered to learn how to add new icons.

Our old **PostInit** routine is now the new **Initalize** routine, with a few small changes. Previously we called

```cpp
m_interactor = static_cast<IEntityInteractionComponent*> (GetGameObject()->AcquireExtension("EntityInteraction"));
```

to get the extension. Now we make a much neater call:

```cpp
auto m_interactor = pEntity->GetOrCreateComponent<CEntityInteractionComponent>();
```

We have a choice of calling **GetOrCreateComponent** or **CreateComponent**. The first will create a component if it doesn't exist on the entity, or return one if it does exist. The second will always create a component on the entity.

There's a handful of other methods provided with similar names to add, delete, query by ID and the like. The differences for GetOrCreateComponent and CreateComponent will become more pronounced and important as you create many small components that can freely mingle on entities with other unknown components.

With that done, that's about all the changes we need for this entity though it's not quite everything. Near the top of the cpp file you will see a line:

```cpp
CRYREGISTER_CLASS(CAnimatedDoorComponent)
```

If you forget to add that to the class you will get link time errors. Each declared component needs just a little bit of code outside the class declaration in order to work. That macro supplies the code.

## The Game is Now a Plugin

CryTek is moving towards removal of all game-play specific code paths from the boilerplate you typically have to write. Plugins are the way forward, and since they have a common well defined interface it is simple enough for the game executable to look for and load all the plugins you require.

A typical "game" will now look like one or more plugins that work in concert with each other. Each plugin needs to provide an interface for the game to use when loading the plugin, handle system events, and some amount of initialisation. The C++ templates can get you started immediately with the typical boilerplate code and a few sample components. I used the Third Person Shooter code as a guide for what I needed to implement for Chrysalis.

If you check that codebase, you will see everything you need to get started with a plugin is inside **GamePlugin.cpp** and **GamePlugin.h**. Having a look at my commit, you can see I was able to completely remove the following C++ files:

* Game/Game.h
* Game/Game.cpp
* Game/GameFactory.h
* Game/GameFactory.cpp
* Startup/GameStartup.h
* Startup/GameStartup.cpp

Those files contained start-up, initialisation, and game-play code. Large amounts of it was boilerplate, and plenty was full of esoteric junk required to get a DLL loaded and handling Windows messages. All that is gone now, replaced by the much shorter and cleaner code in GamePlugin.cpp and GamePlugin.h.

My code is pretty much just a copy of that code with some GUIDs and names changed, with one exception. I want to be able to make a static call on my **CChrysalisCorePlugin** to get at key features that are expected to be available at all times e.g. **cvars**. My first instinct was to define them as a struct internal to the **CChrysalisCorePlugin** and then have a member function return a reference to that struct. I had that all coded and was finally ready to test the project when something weird happened with the camera. It was spinning at some insane speed as I moved the mouse and was locked either pointing straight up or straight down. A little debugging revealed my code to query for the plugin was returning a pointer that was correctly cast, but was not actually pointing at an instance of the plugin - it was pointing at another plugin in a different DLL. You can imagine how totally safe it is to access what is essentially a random piece of memory. The cvar values were junk random data and goodness knows what would happen if I was writing to it. Actually the debugger refused to even show the values on most runs.

Lucky Filip was on hand to answer some questions and offer some test options - one of which worked. The end result was I split the game features off into an interface, and the plugin features into a different class with a pointer to an instance of that interface. Then I applied a little band-aid to the declaration of the CChrysalisCorePlugin class - adding an extra line of code that shouldn't have been needed. It declares an interface for the class, which I would have expected to be done by the earlier calls to **CRYINTERFACE_BEGIN** and **CRYGENERATE_SINGLETONCLASS**. Adding **CRYINTERFACE_DECLARE (CChrysalisCorePlugin, 0x6CCC03C51C214ADA, 0x9F25AE9F5C644F68)** worked in giving it an interface that could be queried using the PluginManager.  Whether this is a bug, omission or oversight, it should be fixed in an upcoming version or at least it's use clarified.

**ChrysalisCore.h** and **ChrysalisCore.cpp** are very straight-forward so I won't cover them.

CChrysalisCorePlugin is a cut and paste job and only needed a few additions / changes. I added the line below to get around the interface not being defined well enough to be returned correctly in a query of the PluginManager.

```cpp
// This shouldn't be needed, apparently, but calls to get the plugin from the plugin manager fail badly
// returning a different unrelated plugin without it. 
CRYINTERFACE_DECLARE(CChrysalisCorePlugin, 0x6CCC03C51C214ADA, 0x9F25AE9F5C644F68)
```

I then added a query for the plugin that can be called as a static function:

```cpp
CChrysalisCorePlugin* CChrysalisCorePlugin::Get()
{
	static CChrysalisCorePlugin* plugIn { nullptr };

	if (!plugIn)
		plugIn = gEnv->pSystem->GetIPluginManager()->QueryPlugin<CChrysalisCorePlugin>();

	if (!plugIn)
		CRY_ASSERT_MESSAGE(plugIn, "Chrysalis Core plugin was not found.");

	return plugIn;
}
```

I gave it a simple static cache to reduce queries on the plugin manager, since the address should not change. If hot-reloading comes in expect that code to break in weird and awful ways. I'll leave it in there as a present to my future self.

## Deprecated Code

I ran into a few issues early on, much of it was to do with deprecated code or code that will be abandoned or deprecated soon. For me the issues all focused around a few main areas:

* My player code is based on IActor
* My character code is also based on IActor
* Input system
* Camera system
* CAnimatedCharacter from CryAction
* Movement Controllers
* Game Rules
* PostUpdate
* eGFE_BecomeLocalPlayer
* EnableUpdateSlot
* ReloadExtension

Some were simple enough to deal with, so let's start with those.

I was using **PostUpdate** to accumulate all the player input for a game frame, in particular the mouse movements. The idea was to ensure it was all accounted for and was consistent for each entity and component - rather than being one value for an entity processed prior to the input, and another after.

PostUpdate is now deprecated, so I simply moved the functions into **Update** and sucked up the fact that it would be inconsistent between entities. Because of the way I was returning data from the functions there is a single frame delay in any case and everything should still be consistent. I should look into doing it a bit better in the future, but it's working fine for now.

**ReloadExtension** was simply retired. I only had it in a few places and it wasn't strictly needed, but was rather a left-over from when I was re-factoring GameSDK code. I was able to just drop that code.

The C++ templates and perhaps GameZero had this piece of code that did useful things when a **eGFE_BecomeLocalPlayer** event arrived signalling this entity was the local player. I saw that code and grabbed it for my own, so when they retired that event I was forced to move that code elsewhere. I ended up moving it into the initialisation code as a temporary solution and making a check to see if that entity was the local player:

```cpp
if (GetEntityId() == gEnv->pGameFramework->GetClientActorId())
```

Speaking of local players; a simple function call that had been happily returning the local player previously started to fail in some cases. I ended up changing the line from:

```cpp
return reinterpret_cast<CActor*>(gEnv->pGameFramework->GetClientActor());
```

to:

```cpp
ILINE static CActor* GetLocalActor()
{
	auto actorId = gEnv->pGameFramework->GetClientActorId();
	auto pActor = gEnv->pEntitySystem->GetEntity(actorId);
	auto pPlayer = pActor->GetComponent<CPlayer>();
	
	return reinterpret_cast<CActor*>(pPlayer);
}
```

which works reliably. I can't remember what the issue was and it may be resolved after other fixes, but if you have problems it's worth trying the longer version out.

**EnableUpdateSlot** was deprecated. The new method is simply to return **ENTITY_EVENT_UPDATE** set to true from your **GetEventMask** function.

The scuttlebutt about game rules is that they will be getting phased out in the future. That's not a big issue for me, since I have very little code there - except for one important thing - **OnClientConnect** which is called when a client connects to the game. This is true even of single player games and it's how I create a new actor for the player and enter it into the game, setting it as the entity for that channel Id.

There wasn't any way around this, so I had to keep the present game rules. **GameRules.h** just needed a few obsolete functions removed from the code. In GameRules.cpp the registration code needed an adjustment. Because the game rules are still an old fashioned game object I needed to ensure they were registered using code suitable for that.

```cpp
CChrysalisCorePlugin::RegisterEntityWithDefaultComponent<CGameRules>("GameRules");
```

While that looks like a regular call to **RegisterEntityWithDefaultComponent** take note that it is actually the one defined in **CChrysalisCorePlugin** instead. When all the game object extensions are gone from the code I can remove those functions as well. Failing to register with the correct registration code meant that my rules initially weren't being loaded by CryAction, which as you can imagine meant the whole thing fell down like a house of cards.

The remain issues are all somewhat tangled together with each other. My player entity also has a player input component and a camera manager - that then adds a pair of camera components.

**CPlayerInputComponent** needs to register to capture actions, and that requires a game object. The cameras need a game object to register and capture the views they create. **CPlayer** has a little kruft from **IActor**, which could be factored out, but it's on the same entity as the other game object extensions and so needed to remain a game object extension. This is because I needed to call **GetGameObject()->AcquireExtension** in order to instantiate the camera manager and player input extensions. If you use the newer methods then the **Init** and **PostInit** functions don't get called and I think the game object pointer is also left as null - which causes bad things to happen. Camera manager could have been a new **IEntityComponent** except it needs to make calls to **GetGameObject()->AcquireExtension** in order to create the cameras - which need their **PostInit** called.

The simplest plan was simply to leave all the components / extensions on the player entity as old fashioned game object extensions until such a time as they can be re-factored. I removed all the dependencies I could, but some cannot be removed.

I tested if I was able to create entity component interfaces for old style game objects and nothing broke, so I went and added some code to do this for each one in anticipation of the day they are freed from the game object system.

```cpp
CRY_ENTITY_COMPONENT_INTERFACE_AND_CLASS(CCameraManagerComponent, "CameraManager", 0xFD6C17B7CE134204, 0x89BCFEA2F2E2C2AB)
```

Since I don't want these extensions to show up in the Sandbox I needed to add a little code for each one. The previous registration code had a parameter for setting the extension to be invisible. I just need to add a couple of lines for each extension to handle this now e.g.

```cpp
// This should make the entity class invisible in the editor.
auto cls = gEnv->pEntitySystem->GetClassRegistry()->FindClass("CameraManager");
cls->SetFlags(cls->GetFlags() ' ECLF_INVISIBLE);
```

## The Little Things

Finally, we get to a few simple little issues. There were a few changes to the methods used to access some game pointers like the game framework pointer. A global search and replace will fix those for you.

They moved the location of the ray casting code. If you're wondering where it is now look at **<span class="x x-first x-last">CCryAction::GetCryAction()->GetPhysicQueues().</span>GetRayCaster()** and friends.

Debug / auxiliary rendering access moved as well to a new location. Check <span class="x x-first x-last">**IRenderAuxText::** and **gEnv->pRenderer->GetIRenderAuxGeom()** for access to these functions.</span>

There's probably a ton of things I've forgotten to mention, but this should cover the major things at least.

## Conclusion

It took a lot of typing, cutting, and pasting to get most of the code up to the new standard. I like to think it's worth it and anyway there's no escaping the pain - you have to take it at some point if you want the sweet new candy. Most of the work was laborious and repetitive but beer helps solve that problem. The few big issues I did have - I have covered for you, and if the article is brief or lacking there's always the source code which is one big fat commit. It has a couple of other little bit of tidying up, but in general I cut things out rather than put anything in. I've tried to cover any pits I fell into so you can avoid them on your projects.

Now comes the good part as I get to start re-factoring everything into neat little components with their own properties. Good luck with your own efforts to convert to CRYENGINE 5.3!