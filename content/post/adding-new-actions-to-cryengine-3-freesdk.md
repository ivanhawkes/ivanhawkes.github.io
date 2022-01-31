---
type: post
title: Adding New Actions to CryEngine 3 FreeSDK
date: 2013-12-09
tags: ["C++","CryEngine3","Flowgraph","Software Development"]
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

This tutorial will help you add new actions into CryEngine 3 FreeSDK projects without needing to make any changes to the base code provided by CryTek.
<!--more-->

Recently I went to add a new feature to my CryEngine 3 FreeSDK project. This feature needed to add new actions (camera zoom in and out), and it seemed at first it wasn't possible to add them without at least making some changes to Gameactions.actions and GameActions.cpp. It actually seemed to require a lot of changes to key parts of the code, and making these changes would make applying upgrades to the SDK much harder at a later date. I made a first pass at the problem, and the results were pretty ugly. There had to be a better way, and thanks to some guidance from older members, and sample code, I found that way.

Rather than just hacking into  Gameactions.actions and GameActions.cpp you should instead try to use the Cry method, which is generally to provide a listener class and subscribe to messages from the publisher. In this particular case we are going to need to provide an IActionListener, and a TActionHandler implementation.

For this example, I am going to use a FlowNode class, that needs to extend itself to handle a couple of action events - namely, mouse key presses. This FlowNode is part of the [camera plugin](https://github.com/hendrikp/Plugin_Camera "Camera Plugin") for CryEngine, based on the [plugin SDK](https://github.com/hendrikp/Plugin_SDK "CryEngine Plugin SDK") from Hendrik.

First things first, whatever class you wish to extend, you need to make sure it supports the IActionListener interface. Add this to your class declaration. e.g.

```cpp
class CFlowPlayerCameraNode :
public CFlowBaseNode<eNCT_Instanced>,
public IActionListener
```

You will need to add an ActionHandler to your class. In this case I have used a static:

```cpp
static TActionHandler<CFlowPlayerCameraNode> s_actionHandler;
```

This will be responsible for dispatching any action requests to their handlers.

Next, within the initialisation routines for your class you will need to grab a pointer to the ActionMapManager, and use this to add handlers for your custom actions, like so:

```cpp
CFlowPlayerCameraNode(SActivationInfo *pActInfo)
{
    m_pEntity = NULL;
    m_pCameraEnt = NULL;
    m_pCameraView = NULL;
    tpvZoom = 1.0f;
    tpvZoomMin = 0.0f;
    tpvZoomMax = 1.0f;

    // Add some mappings to the action maps.
    if (gEnv && gEnv->pGame && gEnv->pGame->GetIGameFramework() && gEnv->pGame->GetIGameFramework()->GetIActionMapManager())
    {
        // Sugar.
        IActionMapManager *pActionMapManager = gEnv->pGame->GetIGameFramework()->GetIActionMapManager();

        // We can declare the actions and assign their names here, but only as a two step process.
        ActionId tpv_ZoomIn;
        ActionId tpv_ZoomOut;
        ActionId v_tpv_ZoomIn;
        ActionId v_tpv_ZoomOut;

        tpv_ZoomIn = "tpv_zoom_in";
        tpv_ZoomOut = "tpv_zoom_out";
        v_tpv_ZoomIn = "v_tpv_zoom_in";
        v_tpv_ZoomOut = "v_tpv_zoom_out";

        // Grab the action map manager.
        pActionMapManager->AddExtraActionListener(this);

// The actions for zooming in and out should be filtered, same as other actions. These filters
// are the parts of the game where we do not wish to have that action called.
#define FILTER_ACTION(filter, action) pActionMapManager->GetActionFilter(filter)->Filter(action);
        FILTER_ACTION("no_move", tpv_ZoomIn)
        FILTER_ACTION("no_move", tpv_ZoomOut)
        FILTER_ACTION("no_move", v_tpv_ZoomIn)
        FILTER_ACTION("no_move", v_tpv_ZoomOut)
        FILTER_ACTION("no_mouse", tpv_ZoomIn)
        FILTER_ACTION("no_mouse", tpv_ZoomOut)
        FILTER_ACTION("no_mouse", v_tpv_ZoomIn)
        FILTER_ACTION("no_mouse", v_tpv_ZoomOut)
        FILTER_ACTION("tutorial_no_move", tpv_ZoomIn)
        FILTER_ACTION("tutorial_no_move", tpv_ZoomOut)
        FILTER_ACTION("tutorial_no_move", v_tpv_ZoomIn)
        FILTER_ACTION("tutorial_no_move", v_tpv_ZoomOut)
        FILTER_ACTION("warning_popup", tpv_ZoomIn)
        FILTER_ACTION("warning_popup", tpv_ZoomOut)
        FILTER_ACTION("warning_popup", v_tpv_ZoomIn)
        FILTER_ACTION("warning_popup", v_tpv_ZoomOut)
        FILTER_ACTION("cutscene_player_moving", tpv_ZoomIn)
        FILTER_ACTION("cutscene_player_moving", tpv_ZoomOut)
        FILTER_ACTION("cutscene_player_moving", v_tpv_ZoomIn)
        FILTER_ACTION("cutscene_player_moving", v_tpv_ZoomOut)
        FILTER_ACTION("cutscene_train", tpv_ZoomIn)
        FILTER_ACTION("cutscene_train", tpv_ZoomOut)
        FILTER_ACTION("cutscene_train", v_tpv_ZoomIn)
        FILTER_ACTION("cutscene_train", v_tpv_ZoomOut)
        FILTER_ACTION("scoreboard", tpv_ZoomIn)
        FILTER_ACTION("scoreboard", tpv_ZoomOut)
        FILTER_ACTION("scoreboard", v_tpv_ZoomIn)
        FILTER_ACTION("scoreboard", v_tpv_ZoomOut)
        FILTER_ACTION("infiction_menu", tpv_ZoomIn)
        FILTER_ACTION("infiction_menu", tpv_ZoomOut)
        FILTER_ACTION("infiction_menu", v_tpv_ZoomIn)
        FILTER_ACTION("infiction_menu", v_tpv_ZoomOut)
        FILTER_ACTION("mp_weapon_customization_menu", tpv_ZoomIn)
        FILTER_ACTION("mp_weapon_customization_menu", tpv_ZoomOut)
        FILTER_ACTION("mp_weapon_customization_menu", v_tpv_ZoomIn)
        FILTER_ACTION("mp_weapon_customization_menu", v_tpv_ZoomOut)
        FILTER_ACTION("ledge_grab", tpv_ZoomIn)
        FILTER_ACTION("ledge_grab", tpv_ZoomOut)
        FILTER_ACTION("ledge_grab", v_tpv_ZoomIn)
        FILTER_ACTION("ledge_grab", v_tpv_ZoomOut)
#undef FILTER_ACTION

        // Only add the handlers once.
        // TODO: look into multiple instances and how it affects this whole section of code.
        if (s_actionHandler.GetNumHandlers() == 0)
        {
            // Map the actions to their handlers.
            s_actionHandler.AddHandler(tpv_ZoomIn, &CFlowPlayerCameraNode::OnActionZoomIn);
            s_actionHandler.AddHandler(tpv_ZoomOut, &CFlowPlayerCameraNode::OnActionZoomOut);

            // Zoom while in vehicles maps to the same actions.
            s_actionHandler.AddHandler(v_tpv_ZoomIn, &CFlowPlayerCameraNode::OnActionZoomIn);
            s_actionHandler.AddHandler(v_tpv_ZoomOut, &CFlowPlayerCameraNode::OnActionZoomOut);
        }
    }
}
```

While a bit wordy, what this code achieves is fairly simple. First, we need to make sure we grab a pointer to the ActionMapMapper. We declare four ActionId variables and set their values. Next, we set the present class up as a listener for actions, this extends the default ActionMapManager, allowing calls to our own.

This is followed by a large block of code which deals with filtering out the actions when they are not desirable.

Finally, we add a few action handlers. In this case we are getting two actions (zoom and vehicle zoom) to both perform the same action.

We need to clean up whatever we allocate in the constructor, so our destructor looks like:

```cpp

virtual ~CFlowPlayerCameraNode()
{
	if ( gEnv && gEnv->pGame && gEnv->pGame->GetIGameFramework() && gEnv->pGame->GetIGameFramework()->GetIActionMapManager() )
	{
		gEnv->pGame->GetIGameFramework()->GetIActionMapManager()->RemoveExtraActionListener( this );
	}
}

```

We need to provide an OnAction handler, since we implement IActionListener. In this case we pass off handling of actions to our action handler:

```cpp

virtual void OnAction( const ActionId& action, int activationMode, float value )
{
	s_actionHandler.Dispatch( this, 0, action, activationMode, value );
}

```

We also need a pair of routines to handle the actions. In this case they look like:

```cpp

bool OnActionZoomIn( EntityId entityId, const ActionId& actionId, int activationMode, float value )
{
	tpvZoom = MAX( tpvZoom - 0.05f, tpvZoomMin );

	return false;
}

bool OnActionZoomOut( EntityId entityId, const ActionId& actionId, int activationMode, float value )
{
	tpvZoom = MIN( tpvZoom + 0.05f, tpvZoomMax );

	return false;
}

```

It's pretty simple, they increment or decrement a float value by 0.05, within the confines of a pair of bounds.

Right near the bottom we need to declare a variable to hold the static we declared in our class:

```cpp

TActionHandler<CFlowPlayerCameraNode> CFlowPlayerCameraNode::s_actionHandler;

```

That's the bulk of the changes needed to extend any class to handle it's own action mapped events. You can view the complete source as a part of the [plugin camera code](https://github.com/hendrikp/Plugin_Camera "Plugin Camera Code").

There's one more step, however. You will need to add a few lines to your defaultprofile.xml file. In this particular case you will need to add a pair of lines like:

```xml
<action name="tpv_zoom_in" onPress="1" keyboard="mwheel_up" /> <action name="tpv_zoom_out" onPress="1" keyboard="mwheel_down" />
```

and to apply the zoom when inside a vehicle add a pair of lines like:

```xml
<action name="v_tpv_zoom_in" onPress="1" keyboard="mwheel_up" />
<action name="v_tpv_zoom_out" onPress="1" keyboard="mwheel_down" />
```