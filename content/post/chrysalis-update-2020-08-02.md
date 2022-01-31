---
title: "Chrysalis Update for 2020-08-02"
date: 2020-08-02T21:48:08+10:00
type: "post"
tags: ["C++","Chrysalis", "CRYENGINE 5.6","Game Programming"]
description: "I cover recent progress on Chrysalis."
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

In this article I will cover recent progress on my project, [Chrysalis](https://github.com/ivanhawkes/Chrysalis).
<!--more-->

As I am still working on a major feature, any code or progress spoken of will be based on this [commit](https://github.com/ivanhawkes/Chrysalis/commit/440868f086acf06cb6826c72940aaa5df60457b2).

Last time, I spoke about putting the EnTT ECS system into Chrysalis. The idea was to use this as a way to prototype spells and eventually items, which might in turn have one or more spells they can cast. Since then I've decided to use it as the basis for pretty much all interation in the game.

Now, a spell system is a great idea for an RPG, but it's outside the scope of my initial plan - which is to write enough code to support a decent walking simulator. I started out by hard coding an interaction class for each specific interaction I thought the player might use e.g. "use", "take", "drop", "open". As I wrote the code I started to see everything as a spell instead. After all, what is a spell but a set of pre-conditions that determine if a character can perform some special action in the world. Once you start looking at needing to do range checks for opening a door or picking up a piece of paper it starts to make sense to have those occur in the same framework you'd use for throwing a fireball.

So a spell is:

- one or more conditionals e.g.
    - range check
    - qi (mana) check
    - timing check, how long since last used
    - reagent check, does this effect need you to already possess a key or wolfsbane?
- feedback
    - animation for the caster
    - sound effects
    - particle effects
    - potentially spawn some geometry that needs to move in time with the spellcasting
    - swap out weapon for interaction item e.g. compass, sickle
- action
    - damage occurs to other character
    - qi is spent
    - target is affected by animation, sound effect, etc

By the time I've written the code to open a door I'm a long way towards having the base of a decent spell casting system. A good door opening sequence will need a range check, offer a UI option to trigger the action, then start an animation on the character - potentially needing IK for the hand positioning, trigger some environmental sound, rotate the door, and re-calculate the navmesh. Since I will eventually want some spells inside the game, I may as well get the bones of it written.

Previously I spoke about adding health and qi components to an actor, and showed some XML prototypes for some typical spells. The simulation already had a couple of systems for applying damage and heals. It now has systems for applying damage, heals, spending qi, regenerating qi, DoTs, HoTs, casting a spell by it's name, and systems for watching "world" / "interaction" spells. You can now write a little bit of XML which defines a spell and have the player be able to execute it just by invoking it's name. For testing I have a bunch of them bound to my input keys 0-9 and F1-F12.

For example:

```xml
  <entity>
    <components>
      <name CryXmlVersion="2" name="Scorch" displayName="Scorch"/>
      <spell CryXmlVersion="2" spell-rewire="damage" minRange="0" maxRange="30" castDuration="2" cooldown="2" globalCooldown="0" sourceTargetType="self" targetTargetType="singleTarget" spellCastPayload="onCompletion"/>
      <damage CryXmlVersion="2" targetTargetType="target" quantity="12" damageType="fire"/>
      <damage-over-time CryXmlVersion="2" targetTargetType="target" quantity="2" damageType="fire" duration="10" interval="1.5"/>
      <utilise-qi CryXmlVersion="2" targetTargetType="source" quantity="11"/>
    </components>
  </entity>

  <entity>
    <components>
      <name CryXmlVersion="2" name="Flashlight" displayName="Flashlight"/>
      <spell CryXmlVersion="2" spell-rewire="none" minRange="0" maxRange="30" castDuration="2" cooldown="2" globalCooldown="0" sourceTargetType="self" targetTargetType="singleTarget" spellCastPayload="immediate"/>
      <render-light CryXmlVersion="2" lensFlareName="" attachToSun="false" flareEnable="true" flareFOV="360" attenuationBulbSize="0.1" ignoreVisAreas="false" affectVolumetricFog="true" volumetricFogOnly="false" onlyAffectThisArea="true" linkToSkyColor="false" ambient="false" fogRadialLobe="0" GIMode="none" diffuseMultiplier="12.0" specularMultiplier="12.0" shadowSpec="None" shadowBias="1" shadowSlopeBias="1" shadownResolution="1" shadowUpdateMin="4" shadowMinRes="0" shadowUpdateRatio="0" style="0" speed="1" shape="point" twoSided="false" texturePath="chrysalis/textures/lights/flashlight_projector.dds" width="1" height="1" nearPlane="0" materialPath="" angle="6.2831855" radius="13" fovAngle="0.3" effectSlotMaterial="">
        <Color r="1" g="1" b="1" a="1"/>
      </render-light>
    </components>
  </entity>

```

Here you can see the markup used to define a Scorch spell which will apply immediate damage and a DoT effect. Beneath it is some test XML for a flashlight. The render-light component will be used in places where I want to spawn a new light into the world e.g. a flare or a floating light that hovers around a character's head.

I want to make the system flexible, so I'm trying to avoid tying spell casting to the character or actor components. Instead, I've added two new components, and the actor grabs one of each when it initialises itself. Although you could argue the two components might be best as one, I've split them out into two parts for ultimate flexibility and to keep each one as focused as possible. The new components are:

- SpellbookComponent
- SpellParticipantComponent

A spellbook is a simple list of spell names which defines the spells you are allowed to cast. There's no GUI for accessing the list at present, and there won't be anything for a very long time. The code for selecting the spell to cast is also hard coded for now, just so I can test things quickly. Now, the interesting thing about the spellbook component is that it allows you to track spells you can cast, but also spells others can use from your spellbook on you. What what? By keeping a list of public and private spells I can allow typical RPG spellcasting, but also allow for things like a quicktime event to be triggered by another character e.g. your spellbook has "chokehold" in it, which might be enabled when someone has snuck up behind you and is in range for a sleeper hold.

Additionally, it will allow inanimate objects to offer interaction e.g. a radio might have a "play-audio" spell that triggers an audio event. By making the only requirement for having a list of spells a single component it should offer a good deal of flexibility.

The SpellParticipantComponent is the other half of this equation. If you want to cast spells, then you will need this component. The same applies to having a spell cast upon you. Previously the restriction was for any interaction to require at least one actor, and this would be generally true, but doing it this way would allow, for example, a teapot to have a spell that triggers an earthquake if you pick it up.

The spell participant has health, qi, and a name - which are the minimum components I would expect to need. It seems odd to move these from the actor, but doing so means I can add a spell to a door that allows you to cause it to self destruct for instance. Alternatively, you might be able to just fireball down the door, and have it destruct when it's health drops to zero.

Back to the code.

I now have three registries for the simulation. **Actors**, **SpellPrototypes** and **Spellcasting**. Spell participants have components created for them in the "actor" registry in EnTT. At a minimum they have their name, health and qi added. To cast a spell, I'm copying a prototype of the spell from the SpellPrototypes registry to the Spellcasting registry. Anything on the Spellcasting registry is now considered to be a spell "in flight".

The systems simply run over the Spellcasting registry each frame or tick and look to see if the spells they know about are casting right now. They apply damages, heals, or initiate and control a world spell e.g. open door. The damage and heal stuff is close to working as intended. It needs a little adjustment so they apply at the correct time in the spell cast, which I will handle soon. The world spells are being executed with simple test code that is just posting a message into the log. Until the feedback parts are in place there is nothing to see, but it's happening.

The big challenge is the part I am now up to - feedback. It requires me to create some sort of spell execution context that will track the spell as it's being cast and ensure all the feedback effects are being triggered. It's all well and good to be able to cast a spell with an up-front damage and a DoT component and have the simulation track that and the caster's qi regeneration...but no-one will care until they see the hands waving about, and a firey ball exploding into existance and rushing towards the enemy.

We might as well close out with a little code. I'm reasonably pleased with how clean the code is considering we're working with simple components which are almost POD in nature. Let's have a look at what it takes to make a spell cast work.

```cpp
/** Queues a spell onto the spellcasting registry - where it will later be processed by the systems. */
void CSimulation::CastSpellByName(const char* spellName, entt::entity sourceEntity, entt::entity targetEntity,
	EntityId crySourceEntityId, EntityId cryTargetEntityId)
{
	auto spellEntity = GetSpellByName(spellName);
	if (spellEntity != entt::null)
	{
		auto newEntity = m_spellcastingRegistry.create();

		m_spellRegistry.visit(spellEntity, [this, spellEntity, newEntity](const auto type_id)
			{ stampFunctionMap[type_id](m_spellRegistry, spellEntity, m_spellcastingRegistry, newEntity); });

		// Do fixups.
		RewireSpell(m_spellcastingRegistry, newEntity, sourceEntity, targetEntity, crySourceEntityId, cryTargetEntityId);

		// We supply them an execution context.
		m_spellcastingRegistry.emplace<ECS::SpellcastExecution>(newEntity);

		// Adjust their qi cast timer.
		auto& qi = m_actorRegistry.get<ECS::Qi>(sourceEntity);
		qi.timeSinceLastSpellcast = 0.0f;
	}
}
```

This function takes in the name of the spell and a pair of entity identifiers for each entity system - a target and a source of the cast. It queries for the spell prototype and if it exists it makes a clone of it on the spell casting registry. Then it does some rewiring magic, and gives it a spell context to help control it's execution. Finally, we adjust the caster's qi component, just marking the fact a spell has been cast. This lets me implement the 5 second rule for qi regeneration from World of Warcraft.

```cpp
/** Takes a reference to a spell and applies the needed fixups. This is mainly going to fix up the source and targets
	for now. */
void CSimulation::RewireSpell(entt::registry& spellcastingRegistry, entt::entity spellEntity, entt::entity sourceEntity, entt::entity targetEntity,
	EntityId crySourceEntityId, EntityId cryTargetEntityId)
{
	ECS::Spell& spell = spellcastingRegistry.get<ECS::Spell>(spellEntity);

	entt::entity source {entt::null};
	entt::entity target {entt::null};
	EntityId sourceEntityId {INVALID_ENTITYID};
	EntityId targetEntityId {INVALID_ENTITYID};

	// The source should almost always be the real source of the spell.
	if (spell.sourceTargetType != ECS::TargetType::none)
	{
		source = sourceEntity;
		sourceEntityId = crySourceEntityId;
	}
	else
	{
		source = entt::null;
		sourceEntityId = INVALID_ENTITYID;
	}

	switch (spell.targetTargetType)
	{
		// Targetting the caster.
		case ECS::TargetType::self:
			target = sourceEntity;
			targetEntityId = crySourceEntityId;
			break;

			// Not targetted at an entity.
		case ECS::TargetType::none:
		case ECS::TargetType::cone:
		case ECS::TargetType::column:
		case ECS::TargetType::sourceBasedAOE:
		case ECS::TargetType::groundTargettedAOE:
			target = entt::null;
			targetEntityId = INVALID_ENTITYID;
			break;

			// Targetting the selected entity.
		default:
			target = targetEntity;
			targetEntityId = cryTargetEntityId;
			break;
	}

	// The source and target for the spell need to be added to the entity.
	spellcastingRegistry.emplace<ECS::SourceAndTarget>(spellEntity, source, target, sourceEntityId, targetEntityId);
}
```

Rewire is responsible for making changes to the prototype before the spell is executed. It's mostly interested in making sure the target ids are set according to expectations. It could however take on other tasks as needed.

```cpp
void CSimulation::Update(const float deltaTime)
{
	// Run the ticks no more often than this interval.
	static const float tickInterval {0.5f};

	// Track the amount of time that has gone since we last run the tick code.
	static float passedTime {0.0f};

	// Update the things which should be handled immediately e.g direct damage and heals.
	UpdateImmediate(deltaTime);

	// Check if we need to tick.
	passedTime += deltaTime;
	if (passedTime >= tickInterval)
	{
		// Perform a tick.
		// HACK: NOTE: This is just an approximation of how much time has passed. It will always be out by almost a frame's
		// worth of time. For now, it appears better to have the tick nice and steady, even if it lags behind reality a bit.
		UpdateTick(tickInterval);

		// HACK: We decrement by the interval size, so it will catch up if we miss some frames.
		passedTime -= tickInterval;
	}

	// Update the spell casts.
	UpdateWorldSpellcasts(deltaTime);
}


void CSimulation::UpdateImmediate(const float deltaTime)
{
	// Simluate some direct heals and direct damage.
	ECS::SystemApplyDamage(m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemApplyHeal(m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemHealthCheck(m_spellcastingRegistry, m_actorRegistry);

	// Simluate some direct qi use and replenishment.
	ECS::SystemApplyQiUtilisation(m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemApplyQiReplenishment(m_spellcastingRegistry, m_actorRegistry);
}


void CSimulation::UpdateTick(const float deltaTime)
{
	// Health ticks.
	ECS::SystemApplyDamageOverTime(deltaTime, m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemApplyHealOverTime(deltaTime, m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemHealthCheck(m_spellcastingRegistry, m_actorRegistry);

	// Qi ticks.
	ECS::SystemApplyQiUtilisationOverTime(deltaTime, m_spellcastingRegistry, m_actorRegistry);
	ECS::SystemApplyQiReplenishmentOverTime(deltaTime, m_spellcastingRegistry, m_actorRegistry);

	// Update the actors qi, health, whatever.
	UpdateActors(deltaTime);
}
```

We're using the update event from CryEngine to process the simulation each frame. Spells are split into two camps, ones that need processing each frame and ones that can wait for an internal tick to occur. For now the tick is happening once every 0.5 seconds. This would be easy to adjust in future. It might be useful at some point to have 20 ticks a second for some things, and others handled just once a second e.g. DoTs. This will do for testing and prototyping.

```cpp
void SystemUpdateActors(float dt, entt::registry& actorRegistry)
{
	// Allow the qi to regenerate naturally.
	auto view = actorRegistry.view<ECS::Qi>();
	for (auto& entity : view)
	{
		// Get the components..
		auto& qi = view.get<ECS::Qi>(entity);

		// Accumulate the time since the last spell cast.
		qi.timeSinceLastSpellcast += dt;

		// Give them a 5 second timeout after casting a spell before they can regenerate.
		if (qi.timeSinceLastSpellcast >= 5.0f)
		{
			// Check for over-replenishment.
			float newModifier = qi.qi.modifiers + (qi.qi.base * qi.qiRegenerationPerSecond * dt);
			if (newModifier > 0.0f)
			{
				// It was an over-replenishment.
				qi.qi.modifiers = 0.0f;
			}
			else
			{
				qi.qi.modifiers = newModifier;
			}
		}
	}
}

```

Last we have a simple routine which is running on the 0.5 second tick. It's just doing some housekeeping for participants. Presently it is only concerned with ensuring they have a qi regeneration mechanic. This is mostly so I can test easily without constantly running out of qi. I suppose I should add a "qi-potion" spell at some point to simulate drinking a qi restoration potion. With this system it will be quite easy to add such a potion. It might be a nice demo for the system once I have an animation in place for swigging from the pot.

That's pretty much all the interesting parts covered. There's been a lot more boring pieces of code written and some parts have been abandoned, re-written, or are being re-purposed. The foundation is in place. There's some more heavy lifting to come with feedback and control, but then finally the good part - showing off something happening in what was previously a static world.