---
type: post
title: Introducing CryEngine 3 Event Listeners
date: 2014-03-07
tags: ["C#","CryEngine 3","CryEngine3","event","gamesdk.dll","listener","observer pattern","Software Development"]
category: CRYENGINE
image: /img/site/category/cryengine.jpg
image-thumbnail: /img/site/category/cryengine.jpg
author: "Ivan Hawkes"
---

In this article I will introduce you to event handling within CryEngine 3 and give a brief overview of the many listeners you can utilise within your project.
<!--more-->

Learning the CryEngine code can be daunting at first. It's large, non-trivial and complex. Approximately 220,000 lines of C++ are provided with the CryEngine FreeSDK, and much of that is densely packed  headers. A good first step is to purchase one or more of the books which introduce you to programming with the engine. I have personally read and can recommend:

* [CryENGINE Game Programming with C++, C#, and Lua](http://amzn.to/1mZHaHo "CryENGINE Game Programming with C++, C#, and Lua")
* [CryENGINE 3 Game Development: Beginner's Guide](http://amzn.to/1cFKv4y " CryENGINE 3 Game Development: Beginner")
* [CryENGINE 3 Cookbook](http://amzn.to/1njxlk3 "CryENGINE 3 Cookbook")

Each of them has their strengths and weaknesses, and despite overlaps in some areas of content you should more than get your money's worth from reading them. They're a steal if you buy them for Kindle. For this article I will assume you have at least basic knowledge of CryEngine, and decent C++ skills.

Let's get started!

One of the key design patterns you will see throughout the CryEngine SDK is the [observer pattern](http://en.wikipedia.org/wiki/Observer_pattern "Observer Pattern"). In this pattern one object maintains a list of dependant objects and is responsible for notifying them of changes in it's state. Within CryEngine they are generally denoted as classes and structs whose name end in **Listener** e.g. IGameRulesKillListener.

Before writing any code you should become familiar, at least generally, with each of the listeners which are available. But first, let's look at how you attach yourself to a subject class as a listening object.

Perhaps the first listener you might come across is **IGameFrameworkListener**. An IGameFrameworkListener is an object that listens for events from the framework. These are high level type events, such as when the game is saved or loaded, when a level ends or at the end of the update cycle. In order to start listening to these events you need to register yourself with the subject. Typically, this would be done during the init phase for your object.

First, you need to make sure your object inherits from IGameFrameworkListener, so add that to your listening class declaration. Next, add the pure virtual methods declared within the listener struct / class. In this case you would add a set of declarations similar to these:

```cpp
// IGameFramework
virtual void OnPostUpdate (float fDeltaTime) {};
virtual void OnSaveGame (ISaveGame* pSaveGame) {};
virtual void OnLoadGame (ILoadGame* pLoadGame) {};
virtual void OnLevelEnd (const char* nextLevel) {};
virtual void OnActionEvent (const SActionEvent& event) {};
virtual void OnPreRender() {};
```

I've stubbed most of mine out for now with empty implementations. If you don't do that be sure to add the definition of the functions into your cpp file or your compile will fail.

Then, somewhere in the code, most likely within the init routine, you will make a call to **RegisterListener** on the game framework e.g.

```cpp
if(IGame *pGame = gEnv->pGame)
{
	pGame->GetIGameFramework()->RegisterListener(this, "CFlowSaveGameNode", FRAMEWORKLISTENERPRIORITY_DEFAULT);
}
```

You will also need to add a piece of code to unregister the listener when you are unloaded e.g.

```cpp
g_pGame->GetIGameFramework()->UnregisterListener(this);
```

Once that is all compiled and running you should be able to see your implementations of the virtual functions being called at the appropriate points in the code execution. Pretty easy so far! The hard part is knowing what interfaces CryTek have made available for you to listen with.

## List of Known Observers

I've run Doxygen on the gamesdk code to get an idea of what is available. At this time roughly forty classes are declared as listeners.  I'll give a brief summary of each of them below.

## <span style="font-size:1.17em;line-height:1.5em;">IBasicEventListener</span>

Provides access to basic events, such as entering and leaving a menu, mouse clicks, or keyboard character input.

```cpp
struct IBasicEventListener
{
	enum EAction
	{
		eA_Default,
		eA_None,
		eA_ActivateAndEat
	};

	virtual ~IBasicEventListener();
	virtual EAction OnClose(HWND hWnd) = 0;
	virtual EAction OnMouseActivate(HWND hWnd) = 0;
	virtual EAction OnEnterSizeMove(HWND hWnd) = 0;
	virtual EAction OnExitSizeMove(HWND hWnd) = 0;
	virtual EAction OnEnterMenuLoop(HWND hWnd) = 0;
	virtual EAction OnExitMenuLoop(HWND hWnd) = 0;
	virtual EAction OnHotKey(HWND hWnd) = 0;
	virtual EAction OnSycChar(HWND hWnd) = 0;
	virtual EAction OnChar(HWND hWnd, WPARAM wParam) = 0;
	virtual EAction OnIMEChar(HWND hWnd) = 0;
	virtual EAction OnSysKeyDown(HWND hWnd, WPARAM wParam, LPARAM lParam) = 0;
	virtual EAction OnSetCursor(HWND hWnd) = 0;
	virtual EAction OnMouseMove(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnLeftButtonDown(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnLeftButtonUp(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnLeftButtonDoubleClick(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnMouseWheel(HWND hWnd, LPARAM lParam, short WheelDelta) = 0;
	virtual EAction OnMove(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnSize(HWND hWnd, LPARAM lParam) = 0;
	virtual EAction OnActivate(HWND hWnd, WPARAM wParam) = 0;
	virtual EAction OnSetFocus(HWND hWnd) = 0;
	virtual EAction OnKillFocus(HWND hWnd) = 0;
	virtual EAction OnWindowPositionChanged(HWND hWnd) = 0;
	virtual EAction OnWindowStyleChanged(HWND hWnd) = 0;
	virtual EAction OnInputLanguageChanged(HWND hWnd, WPARAM wParam, LPARAM lParam) = 0;
	virtual EAction OnSysCommand(HWND hWnd, WPARAM wParam) = 0;
};
```

### IDataListener

This is utilised by patching and downloading objects. It provides a simple interface to inform you when a download completes or if it fails.

```cpp
struct IDataListener
{
	virtual void DataDownloaded (CDownloadableResourcePtr inResource) = 0;
	virtual void DataFailedToDownload (CDownloadableResourcePtr inResource) = 0;
	virtual ~IDataListener ();
};
```

### IDataPatcherListener

Used by the CDataPatchDownloader class.

```cpp
struct IDataPatcherListener
{
	virtual void DataPatchAvailable () = 0;
	virtual void DataPatchNotAvailable () = 0;
	virtual ~IDataPatcherListener () {}
};
```

### IEnvironmentalWeaponEventListener

Unknown at time of writing.

```cpp
struct IEnvironmentalWeaponEventListener
{
	// Called when Rip anim is started
	virtual void OnRipStart () = 0;

	// Called at the point within the rip action that the actual 'detach/Unroot' occurs
	virtual void OnRipDetach () = 0;

	// Called at the end of the rip anim
	virtual void OnRipEnd () = 0;
	virtual ~IEnvironmentalWeaponEventListener () {};
};
```

### IFireModeListener

Only used within the CFireMode class.

```cpp
struct IFireModeListener
{
	virtual ~IFireModeListener () {}
	virtual void OnFireModeDeleted () = 0;
	virtual void OnFireModeActivated (bool activated) = 0;
};
```

### IGameLobbyEventListener

Used within the anti-cheat code.

```cpp
class IGameLobbyEventListener
{
public:
	virtual ~IGameLobbyEventListener () {}
	virtual void InsertedUser (CryUserID userId, const char* userName) = 0;
	virtual void SessionChanged (const CrySessionHandle inOldSession, const CrySessionHandle inNewSession) = 0;
};
```

### IGameRulesActorActionListener

Used by the game rules routines. Purpose is unknown at time of writing.

```cpp
class IGameRulesActorActionListener
{
public:
	virtual ~IGameRulesActorActionListener () {}
	virtual void OnAction (const ActionId& actionId, int activationMode, float value) = 0;
};
```

### IGameRulesClientConnectionListener

This notifies you of client connection events.

```cpp
class IGameRulesClientConnectionListener
{
public:
	virtual ~IGameRulesClientConnectionListener () {}
	virtual void OnClientConnect (int channelId, bool isReset, EntityId playerId) = 0;
	virtual void OnClientDisconnect (int channelId, EntityId playerId) = 0;
	virtual void OnClientEnteredGame (int channelId, bool isReset, EntityId playerId) = 0;
	virtual void OnOwnClientEnteredGame () = 0;
};
```

### IGameRulesClientScoreListener

Notification event for when a client scores.

```cpp
class IGameRulesClientScoreListener
{
	public:
	virtual ~IGameRulesClientScoreListener () {}
	virtual void ClientScoreEvent (EGameRulesScoreType type, int points, EXPReason inReason, int currentTeamScore) = 0;
};
```

### IGameRulesKillListener

Notification of when an entity is killed.

```cpp
class IGameRulesKillListener
{
public:
	virtual ~IGameRulesKillListener () {}
	virtual void OnEntityKilledEarly (const HitInfo& hitInfo) = 0;
	virtual void OnEntityKilled (const HitInfo& hitInfo) = 0;
};
```

### IGameRulesModuleRMIListener

Purpose is unknown at time of writing.

```cpp
class IGameRulesModuleRMIListener
{
public:
	virtual ~IGameRulesModuleRMIListener () {}
	virtual void OnSingleEntityRMI (CGameRules::SModuleRMIEntityParams params) = 0;
	virtual void OnDoubleEntityRMI (CGameRules::SModuleRMITwoEntityParams params) = 0;
	virtual void OnEntityWithTimeRMI (CGameRules::SModuleRMIEntityTimeParams params) = 0;
	virtual void OnSvClientActionRMI (CGameRules::SModuleRMISvClientActionParams params, EntityId fromEid) = 0;
};
```

### IGameRulesPickupListener

Notification for entities picking up and dropping items.

```cpp
class IGameRulesPickupListener
{
public:
	virtual ~IGameRulesPickupListener () {}
	virtual void OnItemPickedUp (EntityId itemId, EntityId actorId) = 0;
	virtual void OnItemDropped (EntityId itemId, EntityId actorId) = 0;
	virtual void OnPickupEntityAttached (EntityId entityId, EntityId actorId) = 0;
	virtual void OnPickupEntityDetached (EntityId entityId, EntityId actorId, bool isOnRemove) = 0;
};
```

### IGameRulesPlayerStatsListener

Purpose is unknown at time of writing.

```cpp
class IGameRulesPlayerStatsListener
{
public:
	virtual ~IGameRulesPlayerStatsListener () {}
	virtual void ClPlayerStatsNetSerializeReadDeath (const SGameRulesPlayerStat* s, uint16 prevDeathsThisRound, uint8 prevFlags) = 0;
};
```

### IGameRulesRevivedListener

It appears to be a notification of when an entity is revived.

```cpp
class IGameRulesRevivedListener
{
public:
	virtual ~IGameRulesRevivedListener () {}
	virtual void EntityRevived (EntityId entityId) = 0;
};
```

### IGameRulesRoundsListener

Used by the game rules code.

```cpp
class IGameRulesRoundsListener
{
public:
	virtual ~IGameRulesRoundsListener () {}
	virtual void OnRoundStart () = 0;
	virtual void OnRoundEnd () = 0;
	virtual void OnSuddenDeath () = 0;
	virtual void ClRoundsNetSerializeReadState (int newState, int curState) = 0;
	virtual void OnRoundAboutToStart () = 0;
};
```

### IGameRulesStateListener

Used by the game rules code.

```cpp
class IGameRulesStateListener
{
public:
	virtual ~IGameRulesStateListener () {}
	virtual void OnIntroStart () = 0;
	virtual void OnGameStart () = 0;
	virtual void OnGameEnd () = 0;
	virtual void OnStateEntered (IGameRulesStateModule::EGR_GameState newGameState) = 0;
};
```

### IGameRulesSurvivorCountListener

Used by the game rules code.

```cpp
class IGameRulesSurvivorCountListener
{
public:
	virtual ~IGameRulesSurvivorCountListener () {}
	virtual void SvSurvivorCountRefresh (int count, const EntityId survivors[], int numKills) = 0;
};
```

### IGameRulesTeamChangedListener

Used by the game rules code.

```cpp
class IGameRulesTeamChangedListener
{
public:
	virtual ~IGameRulesTeamChangedListener () {}
	virtual void OnChangedTeam (EntityId entityId, int oldTeamId, int newTeamId) = 0;
};
```

### IHUDEventListener

This handles event notifications from the HUD.

```cpp
struct IHUDEventListener
{
	virtual ~IHUDEventListener () {}
	virtual void OnHUDEvent (const SHUDEvent& event) = 0;
};
```

### IMeleeCollisionHelperListener

This can be seen in class CPickAndThrowWeapon where it responds helps to calculate hits from a thrown weapon.

```cpp
struct IMeleeCollisionHelperListener
{
	virtual ~IMeleeCollisionHelperListener () {}
	virtual void OnSuccesfulHit (const ray_hit& hitResult) = 0;
	virtual void OnFailedHit () = 0;
};
```

### IMPPathFollowingListener

Used by path finding managers for notification of when a path is completed.

```cpp
struct IMPPathFollowingListener
{
	virtual void OnPathCompleted (EntityId attachedEntityId) = 0;
	virtual ~IMPPathFollowingListener () {};
};
```

### IPatchPakManagerListener

Only known use is by the dedicated server to know permissions have changed and that it is time to quit.

```cpp
class IPatchPakManagerListener
{
public:
	virtual ~IPatchPakManagerListener () {}
	virtual void UpdatedPermissionsNowAvailable () = 0;
};
```

### IPlayerEventListener

Notification of actions undertaken by the player. This includes support for entering and exiting vehicles, switching between first and third person cameras, picking up, dropping and using items, death and stance changes, among others.

It also handles special moves for the player. Currently only jump and sprint are defined.

```cpp
struct IPlayerEventListener
{
	enum ESpecialMove
	{
		eSM_Jump = 0,
		eSM_SpeedSprint,
	};

	virtual ~IPlayerEventListener () {}
	virtual void OnEnterVehicle (IActor* pActor, const char* strVehicleClassName, const char* strSeatName, bool bThirdPerson) {};
	virtual void OnExitVehicle (IActor* pActor) {};
	virtual void OnToggleThirdPerson (IActor* pActor, bool bThirdPerson) {};
	virtual void OnItemDropped (IActor* pActor, EntityId itemId) {};
	virtual void OnItemPickedUp (IActor* pActor, EntityId itemId) {};
	virtual void OnItemUsed (IActor* pActor, EntityId itemId) {};
	virtual void OnStanceChanged (IActor* pActor, EStance stance) {};
	virtual void OnSpecialMove (IActor* pActor, ESpecialMove move) {};
	virtual void OnDeath (IActor* pActor, bool bIsGod) {};
	virtual void OnObjectGrabbed (IActor* pActor, bool bIsGrab, EntityId objectId, bool bIsNPC, bool bIsTwoHanded) {};
	virtual void OnHealthChanged (IActor* pActor, float newHealth) {};
	virtual void OnRevive (IActor* pActor, bool bIsGod) {};
	virtual void OnSpectatorModeChanged (IActor* pActor, uint8 mode) {};
	virtual void OnPickedUpPickableAmmo (IActor* pActor, IEntityClass* pAmmoType, int count) {}
};
```

### IPlayerProgressionEventListener

The OnEvent function listens for important game events such as EMP blasts, first blood kills and stealth kills. It is only used by the CPersistantStats class to keep a tally of these events.

```cpp
struct IPlayerProgressionEventListener
{
	virtual ~IPlayerProgressionEventListener () {}
	virtual void OnEvent (EPPType type, bool skillKill, void* data) = 0;
};
```

### IPlayerUpdateListener

Listener interface for player updates.

```cpp
struct IPlayerUpdateListener
{
	virtual ~IPlayerUpdateListener () {}
	virtual void Update (float fFrameTime) = 0;
};
```

### IPrivateGameListener

Used by the lobby manager for setting private games.

```cpp
struct IPrivateGameListener
{
	virtual ~IPrivateGameListener () {}
	virtual void SetPrivateGame (const bool privateGame) = 0;
};
```

### IProjectileListener

Here be dragons. The OnLaunch function is called whenever a projectile is launched. OnProjectilePhysicsPostStep has warnings about thread safety and doesn't look like it is meant for external use.

```cpp
struct IProjectileListener
{
	// NB: Must be physics-thread safe IF its called from the physics OnPostStep
	virtual void OnProjectilePhysicsPostStep (CProjectile* pProjectile, EventPhysPostStep* pEvent, int bPhysicsThread) {}

	// Called from Main thread
	virtual void OnLaunch (CProjectile* pProjectile, const Vec3& pos, const Vec3& velocity) {}

protected:
	// Should never be called
	virtual ~IProjectileListener () {}
};
```

### RecordingSystemListener

Purpose is unknown at time of writing.

```cpp
class IRecordingSystemListener
{
public:
	virtual ~IRecordingSystemListener() {}
	virtual void OnPlaybackRequested( const SPlaybackRequest& info ) {}
	virtual void OnPlaybackStarted( const SPlaybackInfo& info ) {}
	virtual void OnPlaybackEnd( const SPlaybackInfo& info ) {}
};
```

### ISquadEventListener

Squad managment notifications.

```cpp
class ISquadEventListener
{
public:
	// Local squad events
	enum ESquadEventType
	{
		eSET_CreatedSquad,
		eSET_MigratedSquad,
		eSET_JoinedSquad,
		eSET_LeftSquad,
	};

public:
	virtual ~ISquadEventListener () {}
	virtual void AddedSquaddie (CryUserID userId) = 0;
	virtual void RemovedSquaddie (CryUserID userId) = 0;
	virtual void UpdatedSquaddie (CryUserID userId) = 0;
	virtual void SquadLeaderChanged (CryUserID userId) = 0;
	virtual void SquadEvent (ISquadEventListener::ESquadEventType eventType) = 0;
};
```

### IUIControlSchemeListener

This appears to be a notification of when the user changes the game controls.

```cpp
struct IUIControlSchemeListener
{
	virtual ~IUIControlSchemeListener() {};
	virtual bool OnControlSchemeChanged(const EControlScheme controlScheme) = 0;
};
```

### SGameRulesListener

Notification of important game rule events.

```cpp
struct SGameRulesListener
{
	virtual ~SGameRulesListener () {}
	virtual void GameOver (EGameOverType localWinner, bool isClientSpectator) {}
	virtual void EnteredGame () {}
	virtual void EndGameNear (EntityId id) {}
	virtual void ClientEnteredGame (EntityId clientId) {}
	virtual void ClientDisconnect (EntityId clientId) {}
	virtual void OnActorDeath (CActor* pActor) {}
	virtual void SvOnTimeLimitExpired () {}
	virtual void ClTeamScoreFeedback (int teamId, int prevScore, int newScore) {}
	void GetMemoryUsage (ICrySizer* pSizer) const {}
};
```

## Final Thoughts

That's just a brief description of each of the observer declarations I was able to find. Hopefully this will give you an idea of what sort of events you can subscribe to and how they are used within existing code. I encourage you to work your way through the source files, it's currently the best documentation we have available.