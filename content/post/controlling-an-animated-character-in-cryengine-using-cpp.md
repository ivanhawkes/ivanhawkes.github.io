---
type: post
title: Controlling an Animated Character in CRYENGINE using C++
date: 2016-07-10
tags: ["C++","Chrysalis","CryEngine3","Game Programming"]
description: "Controlling an Animated Character in CRYENGINE using C++"
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

Making an animated character move around the screen in CRYENGINE requires many thousands of lines of code and a lot of time and dedication. This series of articles will show you how to control a character animated in CRYENGINE Mannequin using C++ code.
<!--more-->

We will eventually cover the entire process from taking player input, through the movement controllers, into the character movement state machine, and finally passing the desired movement into the CAnimatedCharacter component. Side topics will include interacting with an orbit camera, items and inventory.

Code will be provided as we progress. The code is liable to change over time, as this is based on a work in progress. You will be able to utilise this code as the basis for your own projects.

The goal is to eventually create an SDK for the **Action RPG** genre that is capable of being expanded using plugins, or modified to particular needs. We will be using GameZero as our starting point, and adding all the features required over time to support Action RPG. The project is currently known by the code name, **Chrysalis**.

In order to keep the articles and code short and focused there will be very little in the way of implementation of AI, vehicles, and weapons. Instead, stub code will be provided that can be expanded by your own team to implement the specifics for your project.

By the time this series is complete the code provided should be mature enough and capable enough to create a "walking simulator" genre game with support for a flashlight, inventory and other genre tropes.

At some point I expect to make a Git repository available with a copy of the code which is available for forking. This is not a priority yet, as it will need to change quite a lot and that's work I don't need to add to my current pile.

The source files for this article are available:

* Code for [Player Input](https://www.dropbox.com/s/ow4z9vygkrkz1j6/PlayerInput.zip?dl=0)
* [Asset files](https://www.dropbox.com/s/rybm1dvzi6uaj6d/assets.zip?dl=0) needed to support player input

## Overview

Our primary goal is to capture player input, understand it, filter it and constrain it according to environmental factors, and then pass that into the animation system to drive the character on screen. In order to achieve that goal we will need to:

* Provide a component that implements a player interface
* Provide a component that implements player input
* Provide a component that implements a character interface
* Provide a component that implements cameras and their handling
* Provide for core features of AI, vehicles and weapons so our character can utilise these when added to the project

In addition to this we will want:

* An entity sensing system that knows which entities are nearby and which ones we can interact with
* Doors, locks, pickable objects, flashlights, compass, etc

# Required Skills

## Code

This series is not aimed at beginners; you will be required to have core skills and knowledge in order to make use of the articles. We will not be covering how to achieve these goals in Lua or Flowgraph or C#. All code will be provided as C++, with the exception of times when a little Lua glue is useful.

I recommend at least two years of C++ coding experience in a work environment or as a full time hobby. If you have experience in other C based languages you might be able to leverage that. In which case, just a few months of C++ should be sufficient, as long as you have a good understanding of memory management issues, templates, compilation and build.

You should have an understanding of component entity systems, game loops, threading and other general game code skills.

In addition to that you should have knowledge specific to building and running CRYENGINE - in particular, **CRYWAF**, setting up new projects, **GameZero** and some inkling of what is happening in the **GameSDK** code.

## Math Skills

You must have a core understanding of the math required. Specifically, you will need to understand:

* high school level algebra and arithmetic
* matrices
* vectors
* quaternions

In addition it will be helpful if you are able to visualise 3D concepts and the results of applying rotations and translation to an object in a virtual 3D space.

I have written a basic introduction to [matrices, vectors and quaternions](https://hawkes.info/2014/06/21/matrices-vectors-quaternions-and-cryengine-3/) to help get you started. Further learning is recommended beyond that in order to improve your understanding.

## The End Game

Although it will take thousands of lines of code to reach, our end game is a surprisingly simple looking structure that is passed to the animation engine. For reference, I am providing it here:

```cpp
struct SCharacterMoveRequest
{
	ECharacterMoveType        type;
	Vec3                      velocity;
	Quat                      rotation;
	SPredictedCharacterStates prediction;
	bool                      allowStrafe;
	float                     proceduralLeaning;
	bool                      jumping;
};
```

Each frame we need to calculate the fields of this structure and pass that into the animated character component which is a part of our **game object**. That **component** will take care of syncing up our physical movement with the character animations, to provide the illusion of movement. It will also handle passing the requested movement down into CryPhysics, moving the character. What might come as a surprise however is that it doesn't actually rotate the entity - only the direction it "appears" to be looking. You will need to combine this and a simple entity rotation in order to complete the task of "rotating" a character.

There's a lot more involved, but we can get to that later e.g. aim poses, look poses, weapon aim, etc. For now, let's get started by adding an input handler to the project.

## Player Input Handling

A game with no input controls is not a very good game. The first step is therefore to provide an input system that will handle the standard input devices players would expect. Currently there is support for keyboard, mouse and XBox controller.

I have implemented player input as a **game object extension** - or in other words, a **component**. This has the advantage of keeping the code decoupled, simple and responsive to known events. A disadvantage is not having control over when the input entity is processed - so we can't guarantee it receives it's events before any entity that uses the input - leading to a one frame latency on input. This is within acceptable parameters for an Action RPG game.

In order to use the component you will need to register it. I handle this in **CGameRegistration::RegisterGameObjects** - a function that registers all the game objects Chrysalis uses.

Add a line similar to the following to your registration code:

```cpp
RegisterGameObject<CPlayerInput>("PlayerInput", "", eGORF_HiddenInEditor);
```

I prefer to define strict interfaces and ensure any implementation follows those interfaces. The interface for player input is simple enough:

```cpp
/**
\file d:\CRYENGINE\Code\ChrysalisSDK\Actor\Player\Input\IPlayerInput.h

Declares the IPlayerInput interface.
**/
#pragma once

#include <IGameObject.h>

struct IPlayerInput : public IGameObjectExtension
{
	enum EInputType
	{
		NULL_INPUT = 0,
		PLAYER_INPUT,
		NETPLAYER_INPUT,
		AI_INPUT,
		DEDICATED_INPUT,

		LAST_INPUT_TYPE,
	};

	virtual ~IPlayerInput() {};

	/**
	Reset the movements to zero state.
	*/
	virtual void ResetMovementState() = 0;

	/**
	Reset the actions resulting from movement state to zero state.
	*/
	virtual void ResetActionState() = 0;

	/**
	Given the current input state, calculate a vector that represents the direction the player wishes their
	character to move. The vector is normalised. Movement will only be affected along the X and Y axis,
	since we are not presently processing Z input (up). This should be sufficient for most RPG style games.

	\param baseRotation The vector will be calculated using this rotation as a base and then applying the input
	requests relative to this direction.

	\return The calculated movement direction.
	**/
	virtual Vec3 GetMovement(const Quat& baseRotation) = 0;

	/**
	Given the current input state, calculate an angular vector that represents the rotation the player has requested
	using the mouse / xbox controller / etc.

	This is typically used to rotate the character and the camera.

	\return The rotation.
	**/
	virtual Ang3 GetRotationDelta() = 0;

	/**
	Gets pitch delta.

	\return The pitch delta.
	**/
	virtual float GetPitchDelta() = 0;

	/**
	Gets yaw delta.

	\return The yaw delta.
	**/
	virtual float GetYawDelta() = 0;

	/**
	Gets number of times the player has requested a change in zoom level since the last frame. Cameras can query this
	value and use it to adjust their zoom.

	\return The zoom delta.
	**/
	virtual float GetZoomDelta () = 0;

	// ***
	// *** HMD based head tracking. Provide the ability to handle head movement separate to body movement.
	// ***

	virtual Vec3 GetHeadMovement(const Quat& baseRotation) = 0;

	virtual Ang3 GetHeadRotationDelta() = 0;

	virtual float GetHeadPitchDelta() = 0;

	virtual float GetHeadYawDelta() = 0;
};
```

There is an enum provided, **EInputType**, which is used to differentiate the sort of input we are accepting. It's not actually used yet - since the only input type supported currently is **EInputType::PLAYER_INPUT**.

The input component is stateful, so a pair of reset state functions are provided whose job it is to clear down the state every frame.

**IPlayerInput::GetMovement** is responsible for checking the state of the directional keys and determining a direction and distance in which the player wishes to move. You are able to pass in a base rotation which will be used as the base for the returned vector. This allows the function to calculate the movement in local space, and then apply that to the base rotation, giving a result in world space or whichever space you passed in.

For convenience we will return a unit vector. This can be multiplied by later functions when the character speed has been determined to find the distance and direction the character should move.

Next, there are four functions that return state which has been affected by the mouse or a controller. The component tracks changes in **pitch**, **yaw** and **zoom** and you can query for these changes on a per frame basis.

Finally, there are stubs for functions I expect to need to handle tracking HMD devices like the Oculus Rift and HTC Vive. These will return head movement data on a per frame basis.

## Player Input Implementation

An implementation of player input has been provided in **PlayerInput.h** and **PlayerInput.cpp**.

The first thing to notice is that it is a **CGameObjectExtensionHelper** class that implements the **IPlayerInput** and **IActionListener** interfaces.

We're not doing anything noteworthy as a component, beyond providing an implementation for Update and PrePhysics - and PrePhysics is not presently in use and might even be deprecated in future.

The interesting stuff all happens in the **Update** and **GetMovement** functions, along with the various callbacks for the action maps. Speaking of which, we need to take a short detour and look at action maps.

### Action Maps

Action maps are a controller independent way of assigning input events to code that is triggered when that input occurs. I'm not going to cover it here, since it's pretty well documented in the official documentation.

In short, you just need to supply a little bit of game code that can be called every time an input event occurs e.g. WASD, jump, fire weapon. You can register a function(s) that will be called every time one of these events occurs. In fact, since it's a "Listener", also known as publish / subscribe you can actually have a multitude of these if you wish.

e.g. in Game.cpp we have a routine to load our initial action maps which is shown here for reference.

```cpp
void CGame::LoadActionMaps(const char* filename)
{
	IActionMapManager* pActionMapManager = m_pGameFramework->GetIActionMapManager();

	if (pActionMapManager)
	{
		pActionMapManager->RegisterActionMapEventListener(m_pGameActionMaps);
		if (pActionMapManager->InitActionMaps(filename))
		{
			pActionMapManager->EnableActionMap("default", true);
			pActionMapManager->EnableActionMap("player", true);
			pActionMapManager->Enable(true);
		}
		else
		{
			CryFatalError("CGame::LoadActionMaps() Invalid action maps setup");
		}
	}
}
```

Typically you will register several action maps; enabling and disabling them as needed e.g. when switching to the UI.

You can learn more about [event listeners](https://hawkes.info/2014/03/07/introducing-cryengine-3-event-listeners/) and [event dispatchers](https://hawkes.info/2014/03/15/cryengine-3-system-event-dispatcher/) in a pair of earlier articles.

### Register Action Maps

Our player input will need to register a bunch of action maps, binding those actions to function callbacks. This is done in the **CPlayerInput::RegisterActionMaps** function provided. Each action is bound to a specific callback function that is responsible for changing game state and any other handling specific for that action e.g.

```cpp
bool CPlayerInput::OnActionMoveLeft(EntityId entityId, const ActionId& actionId, int activationMode, float value)
{
	if (activationMode == eAAM_OnRelease)
	{
		m_movementStateFlags &= ~EMovementStateFlags::Left;
	}
	else if (activationMode && (eAAM_OnPress '' eAAM_OnHold))
	{
		m_movementStateFlags '= EMovementStateFlags::Left;
	}

	return false;
}
```

and...

```cpp
// XBox controller rotation is handled differently. Movements on the thumb stick set a value for
// rotation that should be applied every frame update.
bool CPlayerInput::OnActionXIRotateYaw(EntityId entityId, const ActionId& actionId, int activationMode, float value)
{
float radians = DEG2RAD(value);

if (abs(radians) < m_xiYawFilter)
m_xiYawDelta = 0.0f;
else
m_xiYawDelta = radians;

return false;
}
```

### CPlayerInput::Update

Each frame, on the Update call, we compute a few values, store some state as well as state for the "last frame", and then zero state out - ready for the next cycle. It's safe to query for this state now - it will be stable right up until the next Update.

```cpp
void CPlayerInput::Update(SEntityUpdateContext& ctx, int updateSlot)
{
// We can just add up all the acculmated requests to find out how much pitch / yaw is being requested.
// It's also a good time to filter out any small movement requests to stabilise the camera / etc.
m_lastPitchDelta = m_mousePitchDelta + m_xiPitchDelta;
if (abs(m_lastPitchDelta) < m_pitchFilter)
m_lastPitchDelta = 0.0f;
m_lastYawDelta = m_mouseYawDelta + m_xiYawDelta;
if (abs(m_lastYawDelta) < m_yawFilter)
m_lastYawDelta = 0.0f;

// Circle of life!
m_mousePitchDelta = m_xiPitchDelta = m_mouseYawDelta = m_xiYawDelta = 0.0f;

// Handle zoom level changes, result is stored for query by cameras on Update.
m_lastZoomDelta = m_zoomDelta;
m_zoomDelta = 0.0f;
}
```

Most of the code supplied is pretty obvious and easy to read, so we will only cover one last routine in detail.

**CPlayerInput::GetMovement** is responsible for taking all the state changes, a base rotation, and returning the direction and distance the player wished to move. This is implemented in the simplest and fastest way I could think of.

```cpp
Vec3 CPlayerInput::GetMovement(const Quat& baseRotation)
{
bool allowMovement = true;
Quat quatRelativeDirection;
Vec3 vecMovement = Vec3(0.0f, 0.0f, 0.0f);

// Take the mask and turn it into a vector to indicate the direction we need to pan independent of the
// present camera direction.
switch (m_movementStateFlags)
{
case EMovementStateFlags::Forward:
quatRelativeDirection = Quat::CreateIdentity();
break;

case (EMovementStateFlags::Forward ' EMovementStateFlags::Right) :
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(45.0f));
break;

case EMovementStateFlags::Right:
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(90.0f));
break;

case (EMovementStateFlags::Backward ' EMovementStateFlags::Right) :
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(135.0f));
break;

case EMovementStateFlags::Backward:
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(180.0f));
break;

case (EMovementStateFlags::Backward ' EMovementStateFlags::Left) :
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(225.0f));
break;

case EMovementStateFlags::Left:
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(270.0f));
break;

case (EMovementStateFlags::Forward ' EMovementStateFlags::Left) :
quatRelativeDirection = Quat::CreateRotationZ(DEG2RAD(315.0f));
break;

default:
quatRelativeDirection = Quat::CreateIdentity();
allowMovement = false;
break;
}

// Create a vector based on key direction. This is computed in local space for the base rotation.
if (allowMovement)
vecMovement = Vec3(baseRotation.GetFwdX(), baseRotation.GetFwdY(), 0.0f).GetNormalized() * quatRelativeDirection;

return vecMovement;
}
```

We start with the assumption that there is no movement. A simple switch statement checks the movement state flags, which in essence are tracking the WASD keys you currently have pressed down. There are only eight valid states for this, and we test each using bitwise operations on enumerations of the possible states. If there's a match, then a quaternion (rotation) is calculated in local space, relative to the character. This is multiplied to create a unit vector based on the base rotation.

The end result is a vector that indicates the direction (unit only) you want the character to move based on an arbitrary rotation e.g. camera, current direction they are facing, etc.

This result can be queried by other components in the game, and it will return consistent results from frame to frame. For example, your player rotation code and camera rotation code can know they are using the same values assuming they perform the query in the same event e.g. Update or PrePhysicsUpdate.

## Assets

I haven't mentioned anything about the assets bundled with this article yet. You will need to extract the files from the asset folder into your game asset folder. You may need to merge their contents with your own if you have modified the default ones shipping with CRYENGINE.

These files are starting points for your own customisations of the XML config. In particular defaultprofile.xml is used to map keypresses to action map events. It's worth taking some time to work through these files and get an idea of their purpose.

## Summary

With all that in place you should now be able to track player keypresses and translate that directly into a desired movement direction.

We will build on this code in future articles. I'm sure there are things missing, and sections which are just glossed over. Leave comments and I will try and address any key issues; just be aware this isn't a comprehensive guide and there is still a lot more information that needs to follow.