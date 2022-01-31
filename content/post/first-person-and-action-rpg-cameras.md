---
type: post
title: First Person and Action RPG Cameras
date: 2016-09-14
tags: ["C#","C++","Camera Code","Chrysalis","CRYENGINE 5.2","Game Programming","Mathematics"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
description: "Handling input and camera management."
author: "Ivan Hawkes"
---

In this article I will introduce you to view management within CRYENGINE and then use the existing view management to build a camera manager, a first person camera and a third person orbit camera (action RPG style).
<!--more-->

The first person camera is simple enough, but the third person camera has a few nice features above and beyond the one available in the new c++ game templates from [CryTek](http://crytek.com/).

The code will be available in my [GitHub repository](https://github.com/ivanhawkes/Chrysalis/tree/camera_code_article) with a tag specific to the code being discussed in the article. There's a lot of other things in there which you might want to poke through, but be aware it's a work in progress and is definitely not production ready.

The manager is not strictly necessary at this point, and is definitely overkill for just flipping between a pair of cameras, but it will come into it's own later down the track when more camera types are added.

You can see a very simple demo of the camera in action on my [YouTube page](https://youtu.be/lX4KiZly0oY).

So, let's kick off; a camera manager and a pair of cameras for CRYENGINE 5.2.

## No Vacuum

It's worth mentioning straight up that no code exists in a vacuum. A camera is a pretty low level section of code but it still relies on the player input routines, and it may need some information from the player as well.

Contrary to the current camera implementations in the new c++ game templates, this camera manager and the cameras do not assume they are strictly for use with the player entity. My long term goal is a game where the players will be able to switch at will between several characters who stay persistently in the game world. In  order to support this the cameras are going to "attach" themselves to an entity, and use that as a base to pitch, yaw and roll around.

The attachment part is actually pretty generic, so we are able to attach this camera implementation to any entity - though it performs best with ones that have a skeleton, and bones with well-known names. For simplicity I have limited them to attaching only to an **IActor** based entity, since I want to take advantage of the ability to query the actor skeleton for the position of the eyes.

## Player Input

Our first stop is a visit to the player input code, which you can find in the **/Player/Input** folder of the project. Since the camera is likely to share some inputs with other parts of the game, in particular mouse movements, there is some dependant code in the player input system.

```cpp
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
```

Just a small handful of functions will be needed by our camera. **GetRotationDelta**, **GetPitchDelta**, and **GetYawDelta** will provide the delta in yaw, pitch and roll for this frame, allowing us to change the direction the camera is facing in lock-step with movement and turning requests from the player. **GetZoomDelta** returns a float that indicates how many steps in or out the camera zoom has been adjusted during this frame. Together, they provide everything needed to smoothly pan a camera around an orbit point with a variable zoom distance that the player can adjust during gameplay.

## The Camera Manager

The camera manager  is the fairly simple beating heart of the camera system. It will be responsible for creating instances of each camera type, and allowing for a means of selecting and changing cameras. It's also a convenient place for  us to declare a few debug cvars. The manager will written as an extension that is acquired by the player entity during **CPlayer::PostInit**. The code is shown in it's entirety below for reference.

```cpp
void CPlayer::PostInit(IGameObject * pGameObject)
{
	// Registers this instance to the actor system.
	gEnv->pGame->GetIGameFramework()->GetIActorSystem()->AddActor(GetEntityId(), this);

	// Create a camera manager for this player. We do this early, since character attachment code needs to make calls
	// to a functioning camera.
	m_pCameraManager = static_cast<ICameraManagerComponent*> (GetGameObject()->AcquireExtension("CameraManager"));

	// Acquire a player input component. At a later time it will be useful to check if a network version is needed, or
	// perhaps AI / NULL versions.
	m_pPlayerInput = static_cast<IPlayerInputComponent*> (GetGameObject()->AcquireExtension("PlayerInput"));

	// HACK: hard coded effort to grab an entity to attach to as our pawn / character. It must occur after the camera has a chance to create itself.
	auto pCharacterEntity = gEnv->pEntitySystem->FindEntityByName("Character1");
	CRY_ASSERT_MESSAGE(pCharacterEntity, "Player is not attached to a character. Do not enter game mode without attaching to a character.");
	if (pCharacterEntity)
	AttachToCharacter(pCharacterEntity->GetId());

	// Register for game object events.
	RegisterForGOEvents();
}
```

The astute will notice my dirty **hack** in that code. Since it is still very early in development for **Chrysalis** I am hard coding a hack to immediately attach to an entity called "Character1" if it exists. Character1 is an instance of the **CCharacter** class - which is an **IActor** extension and will be the basis for all characters in the game, playable or NPC. It is doubtful anyone else's game will need this line of code.

## ICameraManagerComponent

Camera's tend to be bound to the player, rather than a specific character. It is the player who presses the buttons that control the camera. It is the player's point of view that changes as you rotate around a character.

In this project, we will allow the player to attach and detach from characters / actors at will. The project design is intentionally flexible, with the goal of being able to control any character inside the game. This means the player, who is normally the focus of a camera instead acts as a proxy, directing focus to where the camera is really meant to be - the character the player is presently controlling.

Let's take a look at the code, but first...

When I am trying to define a new piece of functionality I usually like to start with an interface to get to the core of the requirement. Once that is well defined I will tend to write one or more concrete examples of the interface.

We'll start with the interface for the camera manager, since it cuts to the heart of what the component does.

```cpp
#pragma once

#include "ICameraComponent.h"

struct ICameraComponent;

struct ICameraManagerComponent : public ISimpleExtension
{
/**
Player cameras generally need to follow an actor. This allows us to switch which entity represents the actor that
the camera is following. The presently in-use camera is instructed to follow the supplied entity.

\param entityID If non-null, the entity.
**/
virtual void AttachToEntity(EntityId entityID) = 0;

/**
Gets current camera mode.

\return The current camera mode.
**/
virtual ECameraMode GetCameraMode() = 0;

/**
Sets camera mode.

\param mode The mode.
\param reason The reason.
**/
virtual void SetCameraMode(ECameraMode mode, const char* reason) = 0;

/**
Gets the currently active camera.

\return null if it fails, else the camera.
**/
virtual ICameraComponent* GetCamera() const = 0;

/**
The camera manager may supply an extra offset in local space for camera adjustments to the view.

\return The view offset.
**/
virtual Vec3 GetViewOffset() = 0;

/**
Gets whether this instance is in third person or not.

\return Whether this instance is in third person or not.
*/
virtual bool IsThirdPerson() const = 0;

/**
Toggles third person mode of this instance (typically meant to toggle between third person and first person models and cameras).
*/
virtual void ToggleThirdPerson() = 0;
};
```

The code is pretty simple, and the comments should explain it fairly well. In summary, the manager will provide a means to attach the camera(s) to an entity using the **AttachToEntity** function. **SetCameraMode** allows you to request the manager switches to a new camera mode, selected from the enumeration defined by **ECameraMode**. You would extend this enumeration when adding new types of cameras to the system.

**GetCamera** allows the game to query for a camera, returning an **ICameraComponent*** for the camera that is currently in use. The game can check this structure for the camera position, rotation, aim target and other factors - in a polymorphic manner. It needed worry about which camera is presently in use, since all will provide that interface at a minimum.

One problem when dealing with camera code is that it's often impossible to see where the camera is located, and that can make it hard to debug - especially when developing new cameras. To get around that the camera manager can be queried for an offset by calling **GetViewOffset.** That offset can and should be applied to the camera view after all other transformations have been applied. Being able to slide the final view back a metre can be very illustrative.

Finally, the pair of functions, **IsThirdPerson** and **ToggleThirdPerson** are meant to track whether the camera is in third person mode or not. I still haven't settled on whose responsibility it is to track third person mode for my game, since **CPlayer** and **CCharacter** both need to support it. I am hedging my bets and making the camera manager the sole agent responsible to handling this issue.

Now it's time to see what makes the camera manager tick.

## CCameraManagerComponent

The header file for CCameraManagerComponent is mostly just the same filler code you should have seen multiple times in the c++ game templates. There's only a couple of noteworthy things; the first being that we are ultimately derived from ISimpleExtension - which takes a lot of the boilerplate code out of the project. The second is that we also derive from **IActionListener** meaning the code is going to enable some actions from the action map and listen for action events.

That's as simple as declaring a pair of functions and implementing them in the cpp file.

```cpp
/**
Handles the action event.

\param action The action.
\param activationMode The activation mode.
\param value An optional value that may contain useful information for an action.
*/
virtual void OnAction(const ActionId& action, int activationMode, float value);

/** After action. */
virtual void AfterAction() {};
```

Of course, it's useful for those commands to also do something - so later on the code declares a bunch of functions which will be called by the action handler - and an instance of the action handler itself.

```cpp
/** Registers the action maps and starts to listen for action map events. */
void RegisterActionMaps();

void InitializeActionHandler();

/** Executes the camera shift up action. **/
bool OnActionCameraShiftUp(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** Executes the camera shift down action. **/
bool OnActionCameraShiftDown(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** Executes the camera shift left action. **/
bool OnActionCameraShiftLeft(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** Executes the camera shift right action. **/
bool OnActionCameraShiftRight(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** Executes the camera shift forward action. **/
bool OnActionCameraShiftForward(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** Executes the camera shift backward action. **/
bool OnActionCameraShiftBackward(EntityId entityId, const ActionId& actionId, int activationMode, float value);

/** A static handler for the actions we are interested in hooking. */
TActionHandler<CCameraManagerComponent> m_actionHandler;
```

There's nothing terribly interesting happening there; it's just providing a pair of actions for each axis to track camera movements for the view offset. That's really only needed for debugging, so you could remove it from release builds or chose to not even include it to begin with.

Peering inside **CameraManagerComponent.cpp** you can see in the **PostInit** function the code to clean out an array of cameras and load one of each type into that array. It also makes a quick check to see if we should be in first or third person mode.

You might at this point be wondering why I went to the trouble of making each camera a game extension / component. It doesn't add a lot of value, if any for the first and third person cameras since they are fixed to the player / attached actor and won't be used anywhere else in the game as entities. It simply makes no sense for those cameras to be used in any other place.

However, if you examine the **GameSDK** code you will see they actually have implementations for perhaps 12 different cameras, used in all sorts of circumstances e.g. death camera, pursuit camera, vehicle camera, static camera and animation controlled cameras. It is almost certain that at some point I will be adding several of those camera types into the game, and placing them as entities. Being able to use the same code for all the cameras is just good sense. The manager will eventually be able to deal with all the different cameras, so they need to use a common interface, and a game extension with **ICamera** on top is perfect for that.

Jumping back to the code, the **Update** function is pretty dull. It's just looking to see if the cvar for third person mode changed and flipping states and cameras if needed. In **HandleEvent** we are just waiting to see if we become the local player. This should in fact happen since the camera manager is going to be acquired by the player entity, and that entity will receive the **eGFE_BecomeLocalPlayer** event. We're taking advantage of that to register the action maps.

The implementation of **AttachToEntity** is pretty simple and isn't even checking the entity exists <scribbles down a note to make that happen> It's notifying each camera type that we are now attached to a new entity.

I could have written it so each camera would query the camera manager for the entityId they are attached to each frame, but decided it would be better to have an explicit event and store the Id in each camera. This would give cameras that needed it a chance to perform some init code when switching entities - at a cost of each storing a small amount of redundant data.

```cpp
void CCameraManagerComponent::AttachToEntity(EntityId entityID)
{
	// Let all the cameras know we switch entities. Only a few will care, but it's safer to just let them all handle
	// it. An alternative would be to perform an attach when switching cameras. This is good enough for now. 
	for (unsigned int i = 0; i < ECameraMode::eCameraMode_Last; ++i)
	{
		if (m_cameraModes [i])
		m_cameraModes [i]->AttachToEntity(entityID);
	}
}
```

When it's time to change camera modes we need to do a little dance.

```cpp
void CCameraManagerComponent::SetCameraMode(ECameraMode mode, const char* reason)
{
	if (m_cameraMode != mode)
	{
		// Tell the previous camera it's no longer in use.
		if (m_cameraMode != ECameraMode::eCameraMode_NoCamera)
			m_cameraModes [m_cameraMode]->OnDeactivate();

		// Tell the new camera it is entering usage.
		if (mode != ECameraMode::eCameraMode_NoCamera)
			m_cameraModes [mode]->OnActivate();

		// Track the previous camera mode, in case we want to switch back to it.
		m_lastCameraMode = m_cameraMode;

		// Set the new mode.
		m_cameraMode = mode;

		// Forced changes to mode here should toggle third person if appropriate.
		switch (m_cameraMode)
		{
		case ECameraMode::eCameraMode_ActionRpg:
			SetCVars().m_isThirdPerson = true;
			break;

		default:
			SetCVars().m_isThirdPerson = false;
			break;
		}

		// Debug.
		CryLogAlways("SetCameraMode from %d to %d, reason - %s", m_lastCameraMode, m_cameraMode, reason);
	}
	else
	{
		// Debug.
		CryLogAlways("SetCameraMode from %d to %d, reason - %s (Skipped)", m_lastCameraMode, m_cameraMode, reason);
	}
}
```

The old camera needs to be told it's no longer in use, and the new camera needs to be told it's now the active camera. The cameras themselves know what needs to be done at these times and we can examine that in a little while.

We're tracking the last camera in use, although if you check, you'll see that I don't do anything with this yet. The idea of that variable is so game code can request a special camera, say the death camera, and then flip back to the last used camera once the death scene is complete.

The final noteworthy code there is just trying to decide if it should use the first or third person cameras when a camera switch is requested. Because the player can toggle and flip between them, they are treated as a pair, and the manager will need to decide which to use based on the cvar, and perhaps player / character choice.

That switch statement isn't doing much right now, but as new cameras are added it will be extended to allow switching to them.

Finally, in there is some code for enabling action maps and actions, and releasing them on destruction. That should be familiar enough to not require coverage here.

One thing I did notice though, was having two different extensions on the same entity both requesting and using action maps doesn't seem to be something CryTek coded for and I did have issues with one or the other failing in a poorly behaved way. If you run into this then think about just moving all the input into a single player input routine and dispatching events from there.

## CFirstPersonCameraComponent

You've made it this far through the endless pre-amble, but before we get to the interesting camera we need to discuss the fairly simple first person camera.

As with all cameras in the system it's based on **ICamera**, which is in turn based on **ISimpleExtension**. This does mean you could allow this camera to be registered and visible in the editor if you wanted - it's just not particularly useful for this sort of camera. The good news, of course, is that it would be dead simple to copy this code to a new component and expose that as say a static security camera - or whatever.

The camera declares a few variables and the virtual functions it provides overrides for. We're keeping a track of the camera manager with **m_pCameraManager** and the target entity with **m_targetEntityID**. The view is held in **m_pView**, and is an instance of the **IView*** class provided in the CRYENGINE core code. We only have one camera specific variable, **m_viewPitch**, and that is just going to track camera rotation movement requests from the player input system.

In the PostInit function we need to take care of a little setup.

```cpp
void CFirstPersonCameraComponent::PostInit(IGameObject * pGameObject)
{
	// It's a good idea to use the entity as a default for our target entity.
	m_targetEntityID = GetEntityId();

	// Create a new view and link it to this entity.
	auto pViewSystem = gEnv->pGame->GetIGameFramework()->GetIViewSystem();
	m_pView = pViewSystem->CreateView();
	m_pView->LinkTo(GetGameObject());

	// We are usually hosted in the same entity as a camera manager. Use it if you can find one.
	m_pCameraManager = static_cast<ICameraManagerComponent*> (pGameObject->QueryExtension("CameraManager"));
}
```

To make this camera a little more useful to other projects it will default to targeting the entity which hosts this extension. That's usually going to be the player entity. You could remove references to the camera manager and just use this code (mostly as-is) as a first person camera which the player code acquires directly in PostInit.

Next, the code does two things. It stores a reference to the camera manager for later use to save running that query every frame. Before it does that it queries the game framework for the view system and creates a new view, then links that view to the game object.

### The View System

CRYENGINE provides a view system, which is a low level means of controlling the view for the player. While you can have several views created and linked to an entity - in the words of Highlander "There can only be one" when it comes to which view is active. The cameras will need to take turns capturing the view when they activate - and releasing the view when they deactivate.

At this point I don't have any cameras that are not being managed by the camera manager - but when I do I will need to make sure that they play nice and release that view when done, and the camera manager will need to tell the newly re-activated camera it needs to capture the view again.

It might be possible to simply have the view captured by the manager, but I haven't tested that theory as yet.

The following pair of routines will be replicated in each camera, and are called by the camera manager when a camera is changing from active to inactive.

```cpp
void CFirstPersonCameraComponent::OnActivate()
{
	gEnv->pGame->GetIGameFramework()->GetIViewSystem()->SetActiveView(m_pView);
	GetGameObject()->CaptureView(this);
	GetGameObject()->EnableUpdateSlot(this, CPlayer::EPlayerUpdateSlot::ePlayerUpdateSlot_CameraFirstPerson);
}

void CFirstPersonCameraComponent::OnDeactivate()
{
	GetGameObject()->ReleaseView(this);
	GetGameObject()->DisableUpdateSlot(this, CPlayer::EPlayerUpdateSlot::ePlayerUpdateSlot_CameraFirstPerson);
}
```

We just need to capture the view when activated and release it when deactivated. On top of that I am enabling / disabling the update function for this entity - and since we have multiple cameras attached to it you should note that I have to select a specific slot for each camera type. If you don't use different slots you will find multiple cameras being updated each cycle - and that's not something you want.

```cpp
void CFirstPersonCameraComponent::UpdateView(SViewParams& params)
{
	// The last update call should have given us a new updated position and rotation.
	// We now pass those off to the view system. 
	params.SaveLast();
	params.position = GetCameraPose().GetPosition();
	params.rotation = GetCameraPose().GetRotation();

	// Apply a last minute offset if available for debugging purposes.
	if (m_pCameraManager)
		params.position += GetCameraPose().GetRotation() * m_pCameraManager->GetViewOffset();

	// For simplicity at present we are just hard coding the FoV.
	params.fov = DEG2RAD(60.0f);
}
```

To fully take our place in the world as a provider of view we need to implement the **IGameObjectView** interface and at least the **UpdateView** function. This will be called on the active view and is how the system knows which slice of the world it needs to render in the viewport.

Two things of note: I hard coded the field of view, which is returned from this function because I am lazy and haven't gotten around to writing an implementation yet. My hope is to make one that adapts to the view, opening up if you are gazing off into the distance and narrowing down for nearer targets e.g. conversations with other characters. A shifting field of view during combat would be disastrous if implemented poorly, so it's waiting for another day when I have a better idea of how the whole system works together.

The other thing to note is I am applying the camera manager view offset at this point and each camera will need to do this. It's a bit redundant, but worth it for the debugging potential. Notice the offset is applied in camera space by multiplying the rotation quaternion by the offset vector - returning a vector.

Moving to the Update function now, the core of code that makes this a first person camera.

```cpp
void CFirstPersonCameraComponent::Update(SEntityUpdateContext &ctx, int updateSlot)
{
    auto pPlayerInput = CPlayer::GetLocalPlayer()->GetPlayerInput();

    // Default on failure is to return a cleanly constructed blank camera pose.
    CCameraPose newCameraPose{CCameraPose()};

    // If the player changes the camera zoom, we will toggle to the third person view.
    if (m_pCameraManager)
    {
        if ((pPlayerInput->GetZoomDelta() > FLT_EPSILON) && (!m_pCameraManager->IsThirdPerson()))
            m_pCameraManager->ToggleThirdPerson();
    }

    // Resolve the entity.
    auto pEntity = gEnv->pEntitySystem->GetEntity(m_targetEntityID);
    if (pEntity)
    {
        // It's possible there is no actor to query for eye position, in that case, return a safe default
        // value for an average height person.
        Vec3 localEyePosition{AverageEyePosition};

        // If we are attached to an entity that is an actor we can use their eye position.
        auto pActor = gEnv->pGame->GetIGameFramework()->GetIActorSystem()->GetActor(m_targetEntityID);
        if (pActor)
            localEyePosition = pActor->GetLocalEyePos();

        // Apply the player input rotation for this frame, and limit the pitch / yaw movement according to the set max and min values.
        m_viewPitch -= pPlayerInput->GetPitchDelta();
        m_viewPitch = clamp_tpl(m_viewPitch, DEG2RAD(GetCVars().m_pitchMin), DEG2RAD(GetCVars().m_pitchMax));

        // Pose is based on entity position and the eye position.
        // We will use the rotation of the entity as a base, and apply pitch based on our own reckoning.
        const Vec3 position = pEntity->GetPos() + localEyePosition;
        const Quat rotation = pEntity->GetRotation() * Quat(Ang3(m_viewPitch, 0.0f, 0.0f));
        newCameraPose = CCameraPose(position, rotation);

#if defined(_DEBUG)
        if (GetCVars().m_debug)
        {
            gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(position, 0.04f, ColorB(0, 0, 255, 255));
        }
#endif
    }

    // We set the pose, regardless of the result.
    SetCameraPose(newCameraPose);
}
```

The Update function needs to take in player input for the frame and attempt to calculate a new position for the camera view. It's possible something might go wrong, so to add some resilience we use a default constructed view - which would be at the 0,0,0 origin pointing in the **IDENTITY** direction. If your camera is showing you at the bottom of the ocean on the corner of the map it's possibly because something went wrong here.

Now, remember, this camera uses another entity, rather than the hosting entity as it's target for the view. The first thing we are doing is to query for that entity and request it's local eye position. Behind the scenes the actor class is going to query the skeleton **and** the animation and determine just exactly where the actor's eyes are during this frame of animation. There are some considerations to take into account for first person views.

If we're standing upright it should all be fine, but if your actor is doubled over vomiting into a toilet then the camera will be rotated relative to the head, so the naive approach we are taking here (which we will get to in a moment) can lead to some weirdness e.g. looking through the back of some head geometry. That's not a problem for the project yet, so it can slide for now.

Having positioned the view at the **#camera** bone on the actor by calling localEyePosition = pActor->GetLocalEyePos(); we need to orient it. We are going for simplicity, so all we are going to do is take the entitity's current rotation as a base and apply a pitch delta to that - so the player controls tilting the camera / head up and down only. That's easily handled by a couple of rotations using quaternions as below:

```cpp
const Quat rotation = pEntity->GetRotation() * Quat(Ang3(m_viewPitch, 0.0f, 0.0f));
```

Now, why did I allow a pitch tilt delta and not one for yaw? The answer is that a first person camera should be locked in the direction your actor is facing. Unless you are providing some means for the actor to turn their head independent of the body you can consider their gaze direction as being in lock-step with their entity rotation. That said, you still need to be able to aim up and down, and a pitch delta can provide this. You get bonus points if you allow querying for this delta and then allow the animation system to tilt the avatar's head in time to your camera movements.

The last piece of code which I haven't mentioned is where we query the player input to see if the player requested a change in the zoom level. First person cameras don't need to worry about zoom, but I want to be able to use my mouse scroll button to zoom in and out of first and third person view seamlessly. In order to do that there is a little code in each of those cameras which looks for changes in the zoom and flips the third person toggle when needed. The toggle of the cameras will occur on the next frame, which is fine for this purpose.

## The Action RPG Camera

My eventual goal is to create the **Chrysalis** toolkit, which will be an SDK for creating action RPG style games using CRYENGINE. For that I need a freely rotating orbit camera with yaw, pitch and zoom. The camera needs to be smoothly interpolated (both **SLERP** and **LERP**) and should support at least a basic collision detection and mitigation. The camera should support over the shoulder views through cvars, and allow for rotation around the character when motionless to enable taking of "selfies". It needs to be controllable enough to allow you to aim spells or weapons at specific targets since I will be using a targetless combat system. It must work in conjunction with the animation system, providing information for aim and look poses.

With those goals stated, let's hit the code to see how it works. Much of the code is shared in common with the first person camera so we will only examine the code that is unique or interesting in this camera.

```cpp
struct SExternalCVars
{
	int m_debug;
	float m_pitchMin;
	float m_pitchMax;
	float m_targetDistance;
	float m_reversePitchTilt;
	float m_slerpSpeed;
	float m_zoomMin;
	float m_zoomMax;
	float m_zoomStep;
	float m_zoomSpeed;
	ICVar* m_viewPositionOffset;
	ICVar* m_aimPositionOffset;
};
```

This camera declares a handful of cvars which you can use to tweak it's positioning. The registration code contains descriptions for each one, but a couple are worthy of discussion here.

**m_targetDistance** is simply the maximum range over which the camera may zoom back and forth. You will want to limit this to sensible values to prevent players from making it 2kms and zooming out to see the entire map for instance.

I have added what I tentatively call **m_reversePitchTilt** which is a pitch rotation in the opposite direction to which the main camera is tilting. You will need to play with this value to see what it does. Small values will open up the curve of the orbit somewhat, while large values will tend to flatten it right out - keeping the view facing more directly along the horizon.

The camera makes use of a **SLERP** function to smooth out it's rotations so fast camera panning doesn't make it cut across the orbit instead of cleanly around the outside. You can control the speed at which it does that with **m_slerpSpeed**.  **m_zoomSpeed** will provide a similar **LERP** when zooming the camera in and out.

Finally, there is **m_viewPositionOffset** and **m_aimPositionOffset**. These pair of vectors allow you to offset the view and aim positions in the player orientation. They give you the ability to create over the shoulder cameras.

Before we tackle the Update function let's take a look at the pair of functions not seen before in the first person camera.

```cpp
Vec3 CActionRPGCameraComponent::GetTargetAimPosition(IEntity *const pEntity)
{
    Vec3 position{AverageEyePosition};

    if (pEntity)
    {
        // If we are attached to an entity that is an actor we can use their eye position.
        Vec3 localEyePosition = position;
        auto pActor = gEnv->pGame->GetIGameFramework()->GetIActorSystem()->GetActor(m_targetEntityID);
        if (pActor)
            localEyePosition = pActor->GetLocalEyePos();

        // Pose is based on entity position and the eye position.
        // We will use the rotation of the entity as a base, and apply pitch based on our own reckoning.
        position = pEntity->GetPos() + localEyePosition;

#if defined(_DEBUG)
        if (GetCVars().m_debug)
        {
            gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(position, 0.04f, ColorB(0, 0, 255, 255));
        }
#endif
    }

    return position;
}
```

Well, we saw most of that in the Update for the first person camera - it's simply broken out into a function here. I should probably clean up the first person code and make it use a similar function.

```cpp
bool CActionRPGCameraComponent::CollisionDetection(const Vec3 &Goal, Vec3 &CameraPosition)
{
    bool updatedCameraPosition = false;

    // Skip the target actor for this.
    ray_hit rayhit;
    static IPhysicalEntity *pSkipEnts[10];
    pSkipEnts[0] = gEnv->pEntitySystem->GetEntity(m_targetEntityID)->GetPhysics();

    // Perform the ray cast.
    int hits = gEnv->pPhysicalWorld->RayWorldIntersection(Goal,
          CameraPosition - Goal,
          ent_static ' ent_sleeping_rigid ' ent_rigid ' ent_independent ' ent_terrain,
          rwi_stop_at_pierceable ' rwi_colltype_any, & rayhit,
          1, pSkipEnts, 2);

    if (hits)
    {
        CameraPosition = rayhit.pt;
        updatedCameraPosition = true;
    }

    return updatedCameraPosition;
}
```

It's inevitable that your camera will be in an untenable position at times, unable to see the player's character because something is in the way. You really don't want the camera to clip through walls, it looks terrible, and isn't a lot better with other characters either - but I haven't had time to write anything fancy yet. For now, a simple collision detection will be enough.

This code just does a raycast from the actor back to the camera's calculated position. If it hits anything solid on the way it crops the camera position down to that raycast hit point. The character physics proxy is added to an ignore list to prevent stupidity from occurring. You should also add any weapons, items, etc to this list once those are implemented.

It's finally time to examine the Update function for this camera - and at about 120 lines it's not small, but it is readable and well commented.

```cpp
void CActionRPGCameraComponent::Update(SEntityUpdateContext &ctx, int updateSlot)
{
    // Default on failure is to return a cleanly constructed blank camera pose.
    CCameraPose newCameraPose{CCameraPose()};

    auto pEntity = gEnv->pEntitySystem->GetEntity(m_targetEntityID);
    auto pPlayerInput = CPlayer::GetLocalPlayer()->GetPlayerInput();

    if (pPlayerInput)
    {
        // If the player zoomed all the way in, switch to the first person camera.
        float tempZoomGoal = m_lastZoomGoal + pPlayerInput->GetZoomDelta() * GetCVars().m_zoomStep;
        if (m_pCameraManager)
        {
            if ((tempZoomGoal < GetCVars().m_zoomMin) && (m_pCameraManager->IsThirdPerson()))
                m_pCameraManager->ToggleThirdPerson();
        }

        // Calculate the new zoom goal after asking the player input for zoom level deltas.
        m_zoomGoal = clamp_tpl(tempZoomGoal, GetCVars().m_zoomMin, GetCVars().m_zoomMax);
        m_lastZoomGoal = m_zoomGoal;

        // Apply the player input rotation for this frame, and limit the pitch / yaw movement according to the set max and min values.
        m_viewPitch += pPlayerInput->GetPitchDelta();
        m_viewPitch = clamp_tpl(m_viewPitch, DEG2RAD(GetCVars().m_pitchMin), DEG2RAD(GetCVars().m_pitchMax));
        m_viewYaw += pPlayerInput->GetYawDelta();

        // Yaw should wrap around if it exceeds it's values. This is a bit simplistic, but will work most of the time.
        if (m_viewYaw > g_PI)
            m_viewYaw -= static_cast<float>(g_PI2);
        if (m_viewYaw < -g_PI)
            m_viewYaw += static_cast<float>(g_PI2);

        // Skip the update if we don't need to process the movement. Whenever we skip over frames we have to also skip
        // running interpolation for the following frame.
        if ((pEntity) && (!gEnv->IsCutscenePlaying()))
        {
            // Interpolate towards the desired zoom position.
            Interpolate(m_zoom, m_zoomGoal, GetCVars().m_zoomSpeed, ctx.fFrameTime);

            // Get the entity we are targeting.
            auto pTargetEntity = gEnv->pEntitySystem->GetEntity(m_targetEntityID);
            if (pTargetEntity)
            {
                // Calculate pitch and yaw movements to apply both prior to and after positioning the camera.
                Quat quatPreTransYP = Quat(Ang3(m_viewPitch, 0.0f, m_viewYaw));
                Quat quatPostTransYP = Quat::CreateRotationXYZ(Ang3(m_viewPitch * GetCVars().m_reversePitchTilt, 0.0f, 0.0f));

                // Target and aim position come from the entity position.
                Vec3 vecTargetAimPosition = GetTargetAimPosition(pTargetEntity);

                // The distance from the view to the target.
                float shapedZoom = (m_zoom * m_zoom) / (GetCVars().m_zoomMax * GetCVars().m_zoomMax);
                float zoomDistance = GetCVars().m_targetDistance * shapedZoom;

                // Calculate the target rotation and slerp it if we can.
                Quat quatTargetRotationGoal = m_quatTargetRotation * quatPreTransYP;
                Quat quatTargetRotation;
                if (m_skipInterpolation)
                {
                    m_quatLastTargetRotation = quatTargetRotation = quatTargetRotationGoal;
                }
                else
                {
                    quatTargetRotation = Quat::CreateSlerp(m_quatLastTargetRotation, quatTargetRotationGoal, ctx.fFrameTime * GetCVars().m_slerpSpeed);
                    m_quatLastTargetRotation = quatTargetRotation;
                }

                // Work out where to place the new initial position. We will be using a unit vector facing forward Y
                // as the starting place and applying rotations from the target bone and player camera movements.
                Vec3 viewPositionOffset = Vec3FromString(GetCVars().m_viewPositionOffset->GetString());
                Vec3 vecViewPosition = vecTargetAimPosition + (quatTargetRotation * (Vec3(0.0f, 1.0f, 0.0f) * zoomDistance)) + quatTargetRotation * viewPositionOffset;

                // By default, we try and aim the camera at the target, taking into account the current mouse yaw and pitch values.
                // Since the target and aim can actually be the same we need to use a safe version of the normalised quaternion to
                // prevent errors.
                Quat quatViewRotationGoal = Quat::CreateRotationVDir((vecTargetAimPosition - vecViewPosition).GetNormalizedSafe());

                // Use a slerp to smooth out fast camera rotations.
                Quat quatViewRotation;
                if (m_skipInterpolation)
                {
                    m_quatLastViewRotation = quatViewRotation = quatViewRotationGoal;
                    m_skipInterpolation = false;
                }
                else
                {
                    quatViewRotation = Quat::CreateSlerp(m_quatLastViewRotation, quatViewRotationGoal, ctx.fFrameTime * GetCVars().m_slerpSpeed);
                    m_quatLastViewRotation = quatViewRotation;
                }

                // Apply a final translation to both the view position and the aim position.
                Vec3 aimPositionOffset = Vec3FromString(GetCVars().m_aimPositionOffset->GetString());
                vecViewPosition += quatViewRotation * aimPositionOffset;

                // Gimbal style rotation after it's moved into it's initial position.
                Quat quatOrbitRotation = quatViewRotation * quatPostTransYP;

                // Perform a collision detection. Note, any collisions will disallow use of interpolated camera movement.
                CollisionDetection(vecTargetAimPosition, vecViewPosition);

#if defined(_DEBUG)
                if (GetCVars().m_debug)
                {
                    gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(vecTargetAimPosition, 0.04f, ColorB(128, 0, 0));
                    gEnv->pRenderer->GetIRenderAuxGeom()->DrawSphere(vecTargetAimPosition + quatTargetRotation * viewPositionOffset, 0.04f, ColorB(0, 128, 0));
                }
#endif

                // Track our last position.
                m_vecLastPosition = vecViewPosition;

                // Return the newly calculated pose.
                newCameraPose = CCameraPose(vecViewPosition, quatOrbitRotation);
                SetCameraPose(newCameraPose);

                return;
            }
        }
    }

    // We set the pose, regardless of the result.
    SetCameraPose(newCameraPose);

    // If we made it here, we will want to avoid interpolating, since the last frame result will be wrong in some way.
    m_skipInterpolation = true;
}
```

It starts with grabbing a few pointers to often used data and a quick check to see if it needs to switch to the first person view in the next frame thanks to changes in the zoom level.

The camera then needs to start calculating a new goal for it's position. The goal is based on two things, the desired level of zoom and the desired rotation. We don't allow the camera to just snap straight to the new position, it's jarring and looks janky. We need to carefully select the new position as a goal and then interpolate towards it.

We do this by querying the player input for this frame, grab the deltas in yaw, pitch, roll and zoom, clamp them and make sure they get cropped and wrap around correctly. Once everything is clamped we can start to use the values.

```cpp
// Interpolate towards the desired zoom position.
Interpolate(m_zoom, m_zoomGoal, GetCVars().m_zoomSpeed, ctx.fFrameTime);
```

We take the zoom goal and start to interpolate towards it. This will run over as many frames as it takes to eventually reach that goal. If your zoom speed is sufficiently slow you can see the camera lazily zooming in and out.

Next in line is a bunch of code doing strange rotations with quaternions. It's easy to get lost in all those transformations so take it slow.

```cpp
// Calculate pitch and yaw movements to apply both prior to and after positioning the camera.
Quat quatPreTransYP = Quat(Ang3(m_viewPitch, 0.0f, m_viewYaw));
Quat quatPostTransYP = Quat::CreateRotationXYZ(Ang3(m_viewPitch * GetCVars().m_reversePitchTilt, 0.0f, 0.0f));
```

It makes sense for an action RRPG camera to handle yaw and pitch, but not roll - so you won't see roll used anywhere in these transformations and you should note I factor it out when creating the quaternions. These two will be used **before** and **after** we apply any translations to the camera "PreTrans" being short for pre-translation. Notice the reverse pitch tilt will be factored in after the camera is translated into position.

```cpp
// Target and aim position come from the entity position.
Vec3 vecTargetAimPosition = GetTargetAimPosition(pTargetEntity);
```

Here we are querying the actor for the position that will be the very centre of our orbit. I'll be using the eyes as the target, adjusted for the currently playing animation.

```cpp
// The distance from the view to the target.
float shapedZoom = (m_zoom * m_zoom) / (GetCVars().m_zoomMax * GetCVars().m_zoomMax);
float zoomDistance = GetCVars().m_targetDistance * shapedZoom;
```

I wanted a zoom function that wasn't linear. I wanted it to give smaller steps as you came closer to the actor, and larger ones the further you zoomed out. These calculations provide a decent enough non-linear zoom for my purposes.

```cpp
// Calculate the target rotation and slerp it if we can.
Quat quatTargetRotationGoal = m_quatTargetRotation * quatPreTransYP;
Quat quatTargetRotation;
if (m_skipInterpolation)
{
	m_quatLastTargetRotation = quatTargetRotation = quatTargetRotationGoal;
}
else
{
	quatTargetRotation = Quat::CreateSlerp(m_quatLastTargetRotation, quatTargetRotationGoal, ctx.fFrameTime * GetCVars().m_slerpSpeed);
	m_quatLastTargetRotation = quatTargetRotation;
}
```

Once again we need to interpolate towards a target, but in this case, since the target is a rotation we can't just use a simple linear interpolation we need a spherical interpolation. There's a slight wrinkle though. We have to check for conditions from the last frame that might cause us to need to jump immediately to the target position and rotation - one obvious case being if we had to move due to collision detection.

```cpp
// Work out where to place the new initial position. We will be using a unit vector facing forward Y
// as the starting place and applying rotations from the target bone and player camera movements.
Vec3 viewPositionOffset = Vec3FromString(GetCVars().m_viewPositionOffset->GetString());
Vec3 vecViewPosition = vecTargetAimPosition + (quatTargetRotation * (Vec3(0.0f, 1.0f, 0.0f) * zoomDistance))
	+ quatTargetRotation * viewPositionOffset;
```

At this point we're trying to calculate the view position, given the zoom length, the aim position (centre of orbit), the entity's rotation and finally an offset of that view position (for over the shoulder views).

```cpp
// By default, we try and aim the camera at the target, taking into account the current mouse yaw and pitch values.
// Since the target and aim can actually be the same we need to use a safe version of the normalised quaternion to
// prevent errors.
Quat quatViewRotationGoal = Quat::CreateRotationVDir((vecTargetAimPosition - vecViewPosition).GetNormalizedSafe());
```

By subtracting the view position from the aim position we can work out a rotation that represents the camera looking at the centre of the orbit rotation (or close, after our offsets have been applied).

```cpp
// Use a slerp to smooth out fast camera rotations.
Quat quatViewRotation;
if (m_skipInterpolation)
{
	m_quatLastViewRotation = quatViewRotation = quatViewRotationGoal;
	m_skipInterpolation = false;
}
else
{
	quatViewRotation = Quat::CreateSlerp(m_quatLastViewRotation, quatViewRotationGoal, ctx.fFrameTime * GetCVars().m_slerpSpeed);
	m_quatLastViewRotation = quatViewRotation;
}
```

If we don't need to skip interpolation then it's time to apply a **SLERP** to the view rotation which will eventually step us to our goal rotation. Again, this might take several frames to reach the goal after you stop rotating the camera view.

```cpp
// Apply a final translation to both the view position and the aim position.
Vec3 aimPositionOffset = Vec3FromString(GetCVars().m_aimPositionOffset->GetString());
vecViewPosition += quatViewRotation * aimPositionOffset;
```

It's time to get our aim offset into play. This is added near the end and is applied in view space for our camera. This gives you a chance to offset the aim position somewhat.

```cpp
// Gimbal style rotation after it's moved into it's initial position.
Quat quatOrbitRotation = quatViewRotation * quatPostTransYP;
```

The post translation rotation finally gets applied - this is the one that can reverse tilt the pitch, or indeed anything you wish to add as a final rotation.

```cpp
// Perform a collision detection. Note, any collisions will disallow use of interpolated camera movement.
CollisionDetection(vecTargetAimPosition, vecViewPosition);
```

With all those rotations and translation we take the opportunity to crop it if it collides with solid geometry to prevent you seeing through walls.

```cpp
// Track our last position.
m_vecLastPosition = vecViewPosition;

// Return the newly calculated pose.
newCameraPose = CCameraPose(vecViewPosition, quatOrbitRotation);
SetCameraPose(newCameraPose);
```

That's it, just return the calculated pose and we're done!

## Final Thoughts

All code has room for improvement and most needs some adapting for your own uses. I hope that this breakdown of the camera code helps you create your own custom cameras that suit your needs perfectly.

Much of the code has been refactored from the **CRYENGINE GameSDK** and some is from the new c++ game templates and is licensed by **CryTek**. Code that is written by myself is free for re-use in your own projects without limitation or restriction.

The complete code for [Chrysalis](https://github.com/ivanhawkes/Chrysalis) is on [GitHub](https://github.com/) and the code presented in this article is [tagged in my repository](https://github.com/ivanhawkes/Chrysalis/tree/camera_code_article). My repository is the live code that I am working on and is not recommended for anything beyond teaching purposes. It is subject to change at any time and is unsupported at this time. It has specific needs in terms of assets and project files and those are not published as yet. It should work very well with any of the c++ game templates assets - but this is untested and some code changes will be needed - particularly in regard to character models and animations.

And finally, if you do build Chrysalis and try and test the camera code you will want to update your defaultprofile.xml, since that is where all the keybinds are defined - and they differ from the c++ game template examples. My current file looks like this:

```xml
<profile version="76">

    <!-- platforms - Used to define which keys to map for each action based on the platform that is in use -->
    <platforms>
        <PC keyboard="1" xboxpad="1" ps4pad="1" oculustouch="1"/>
        <XboxOne keyboard="1" xboxpad="1" ps4pad="0"/>
        <PS4 keyboard="1" xboxpad="0" ps4pad="1"/>
    </platforms>

    <!--DO NOT REMOVE DEFAULT ACTIONMAP! NEEDED BY CRYACTION.-->
    <actionmap name="default" version="1"/>
    <!---->

    <actionmap name="player">
        <action name="move_left" onPress="1" onRelease="1" retriggerable="1">
            <keyboard input="a" onPress="1" />
        </action>
        <action name="move_right" onPress="1" onRelease="1" retriggerable="1">
            <keyboard input="d" onPress="1" />
        </action>
        <action name="move_forward" onPress="1" onRelease="1" retriggerable="1">
            <keyboard input="w" onPress="1" />
        </action>
        <action name="move_backward" onPress="1" onRelease="1" retriggerable="1">
            <keyboard input="s" onPress="1" />
        </action>

        <action name="move_jump" onPress="1" onRelease="1" keyboard="space" xboxpad="xi_a" ps3pad="pad_cross" wiipad="wii_pad_b"/>

        <action name="move_walkrun" onPress="1" onRelease="1" retriggerable="1" keyboard="n" xboxpad="xi_thumbl" ps3pad="pad_l3" wiipad="wii_pad_l3"/>
        <action name="move_sprint" onPress="1" onRelease="1" retriggerable="1" keyboard="lshift" xboxpad="xi_thumbl" ps3pad="pad_l3" wiipad="wii_pad_l3"/>

        <action name="stance_crouch" onPress="1" onRelease="1" retriggerable="1" keyboard="c"/>
        <action name="stance_kneel" onPress="1" onRelease="1" retriggerable="1" keyboard="v"/>
        <action name="stance_sit" onPress="1" onRelease="1" retriggerable="1" keyboard="b"/>

        <action name="item_use" onRelease="1">
            <keyboard input="f" onPress="1" />
            <xboxpad input="xi_x" onHold="1" holdTriggerDelay="0.3" holdRepeatDelay="-1" />
            <ps3pad input="pad_square" onHold="1" holdTriggerDelay="0.3" holdRepeatDelay="-1" />
        </action>

        <action name="item_pickup" onPress="1" onRelease="1" keyboard="j"/>

        <action name="actionbar_01" onPress="1" onRelease="1" keyboard="1"/>
        <action name="actionbar_02" onPress="1" onRelease="1" keyboard="2"/>
        <action name="actionbar_03" onPress="1" onRelease="1" keyboard="3"/>
        <action name="actionbar_04" onPress="1" onRelease="1" keyboard="4"/>
        <action name="actionbar_05" onPress="1" onRelease="1" keyboard="5"/>
        <action name="actionbar_06" onPress="1" onRelease="1" keyboard="6"/>
        <action name="actionbar_07" onPress="1" onRelease="1" keyboard="7"/>
        <action name="actionbar_08" onPress="1" onRelease="1" keyboard="8"/>
        <action name="actionbar_09" onPress="1" onRelease="1" keyboard="9"/>
        <action name="actionbar_10" onPress="1" onRelease="1" keyboard="0"/>
        <action name="actionbar_11" onPress="1" onRelease="1" keyboard="minus"/>
        <action name="actionbar_12" onPress="1" onRelease="1" keyboard="equals"/>

        <action name="tpv_zoom_in" onPress="1" keyboard="mwheel_up" />
        <action name="tpv_zoom_out" onPress="1" keyboard="mwheel_down" />

        <action name="mouse_rotateyaw" keyboard="maxis_x" />
        <action name="mouse_rotatepitch" keyboard="maxis_y" />

        <action name="hmd_rotateyaw" keyboard="HMD_Yaw" />
        <action name="hmd_rotatepitch" keyboard="HMD_Pitch" />
        <action name="hmd_rotateroll" keyboard="HMD_Roll" />

        <action name="xi_movex" xboxpad="xi_thumblx" ps3pad="pad_sticklx" wiipad="wii_pad_sticklx"/>
        <action name="xi_movey" xboxpad="xi_thumbly" ps3pad="pad_stickly" wiipad="wii_pad_stickly"/>

        <action name="xi_rotateyaw" xboxpad="xi_thumbrx" ps3pad="pad_stickrx" wiipad="wii_pad_stickrx"/>
        <action name="xi_rotatepitch" xboxpad="xi_thumbry" ps3pad="pad_stickry" wiipad="wii_pad_stickry"/>
    </actionmap>

    <actionmap name="camera">
        <action name="camera_shift_up" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="pgup"/>
        <action name="camera_shift_down" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="pgdn"/>
        <action name="camera_shift_left" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="left"/>
        <action name="camera_shift_right" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="right"/>
        <action name="camera_shift_forward" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="up"/>
        <action name="camera_shift_backward" onPress="1" onRelease="1" onHold="1" holdTriggerDelay="0.20" holdRepeatDelay="0.05" keyboard="down"/>
    </actionmap>

    <controllerlayouts>
        <layout name="buttonlayout_alt" file="buttonlayout_alt.xml"/>
        <layout name="buttonlayout_altlefty" file="buttonlayout_altlefty.xml"/>
        <layout name="buttonlayout_default" file="buttonlayout_default.xml"/>
        <layout name="buttonlayout_lefty" file="buttonlayout_lefty.xml"/>
        <layout name="sticklayout_default" file="sticklayout_default.xml"/>
        <layout name="sticklayout_lefty" file="sticklayout_lefty.xml"/>
        <layout name="sticklayout_legacy" file="sticklayout_legacy.xml"/>
        <layout name="sticklayout_legacylefty" file="sticklayout_legacylefty.xml"/>
    </controllerlayouts>
</profile>
```
